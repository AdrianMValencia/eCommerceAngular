import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { switchMap, throwError } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CartService } from '../../../pages/cart/services';
import { CreateOrderRequest } from '../../../core/models/order.model';
import { BaseResponse } from '../../../core/models/base-response.model';
import { CreatePayPalOrderResponse } from '../../../core/models/paypal.model';
import { IOrdersService } from '../../../core/services/orders.service';
import { IPayPalCheckoutService } from '../../../core/services/paypal-checkout.service';
import { AuthState } from '../../../core/state/auth.state';
import { CheckoutState } from '../state/checkout.state';

@Component({
  selector: 'app-checkout-page',
  imports: [CurrencyPipe, RouterLink],
  template: `
    <section class="checkout-wrapper">
      <header class="header">
        <h1>Checkout</h1>
        <p>Confirma tu pedido y paga con PayPal.</p>
      </header>

      @if (isCartEmpty()) {
        <article class="panel empty">
          <p>Tu carrito esta vacio. Agrega productos antes de continuar.</p>
          <a routerLink="/products" class="secondary-btn">Ver productos</a>
        </article>
      } @else {
        <article class="panel">
          <h2>Resumen de compra</h2>

          <ul class="items-list">
            @for (item of cartState().items; track item.product.productId) {
              <li class="item-row">
                <div>
                  <strong>{{ item.product.name }}</strong>
                  <p>{{ item.quantity }} x {{ item.product.price | currency:'USD':'symbol':'1.2-2' }}</p>
                </div>
                <span>{{ item.product.price * item.quantity | currency:'USD':'symbol':'1.2-2' }}</span>
              </li>
            }
          </ul>

          <div class="total-row">
            <span>Total</span>
            <strong>{{ cartState().total | currency:'USD':'symbol':'1.2-2' }}</strong>
          </div>

          @if (checkoutState.errorMessage()) {
            <div class="error-box" role="alert" aria-live="assertive">
              <p>{{ checkoutState.errorMessage() }}</p>
              @if (validationErrors().length > 0) {
                <ul>
                  @for (message of validationErrors(); track message) {
                    <li>{{ message }}</li>
                  }
                </ul>
              }
            </div>
          }

          <div class="actions">
            <button
              type="button"
              class="paypal-btn"
              [disabled]="isPayButtonDisabled()"
              [attr.aria-busy]="checkoutState.isBusy()"
              (click)="payWithPayPal()"
            >
              @if (checkoutState.isCreatingOrder()) {
                Creando orden...
              } @else if (checkoutState.isRedirectingToPayPal()) {
                Redirigiendo a PayPal...
              } @else {
                Pagar con PayPal
              }
            </button>

            <a routerLink="/cart" class="secondary-btn">Volver al carrito</a>
          </div>
        </article>
      }
    </section>
  `,
  styles: [
    `
      .checkout-wrapper {
        max-width: 900px;
        margin: 0 auto;
        padding: 2rem 1rem;
      }

      .header h1 {
        margin: 0;
      }

      .panel {
        border: 1px solid #d1d5db;
        border-radius: 12px;
        padding: 1.5rem;
        margin-top: 1rem;
        background: #ffffff;
      }

      .empty p {
        margin-top: 0;
      }

      .items-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .item-row {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.75rem 0;
        border-bottom: 1px solid #e5e7eb;
      }

      .item-row p {
        margin: 0.2rem 0 0;
        color: #4b5563;
      }

      .total-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1rem;
      }

      .actions {
        margin-top: 1.25rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      .paypal-btn {
        background: #0070ba;
        color: #ffffff;
        border: none;
        border-radius: 8px;
        padding: 0.7rem 1rem;
        font-weight: 600;
        cursor: pointer;
      }

      .paypal-btn[disabled] {
        opacity: 0.65;
        cursor: not-allowed;
      }

      .secondary-btn {
        display: inline-block;
        border: 1px solid #6b7280;
        border-radius: 8px;
        padding: 0.7rem 1rem;
        text-decoration: none;
        color: #1f2937;
        background: #f9fafb;
      }

      .error-box {
        margin-top: 1rem;
        border: 1px solid #b91c1c;
        background: #fef2f2;
        border-radius: 8px;
        padding: 0.75rem;
        color: #7f1d1d;
      }

      .error-box ul {
        margin: 0.5rem 0 0;
        padding-left: 1.25rem;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly cartService = inject(CartService);
  private readonly ordersService = inject(IOrdersService);
  private readonly payPalCheckoutService = inject(IPayPalCheckoutService);
  private readonly authState = inject(AuthState);

  readonly checkoutState = inject(CheckoutState);
  readonly cartState = this.cartService.cartState;
  readonly userId = computed(() => this.authState.userId());

  readonly validationErrors = computed(() => {
    const errors = this.checkoutState.fieldErrors();
    return Object.values(errors).flat();
  });

  readonly isCartEmpty = computed(() => this.cartState().items.length === 0);
  readonly isPayButtonDisabled = computed(
    () => this.isCartEmpty() || this.checkoutState.isCheckoutDisabled()
  );

  payWithPayPal(): void {
    if (this.isCartEmpty()) {
      this.checkoutState.setUnexpectedError(null, 'Tu carrito esta vacio.');
      return;
    }

    if (!this.userId()) {
      this.checkoutState.setUnexpectedError(null, 'Tu sesion expiro. Inicia sesion nuevamente.');
      return;
    }

    const orderRequest: CreateOrderRequest = {
      userId: this.userId()!,
      orderDetails: this.cartState().items.map((item) => ({
        productId: item.product.productId,
        quantity: item.quantity,
        price: item.product.price
      }))
    };

    this.checkoutState.startCreateOrder();

    this.ordersService
      .createOrder(orderRequest)
      .pipe(
        switchMap((orderResponse) => {
          if (!orderResponse.isSuccess || !orderResponse.data) {
            this.checkoutState.setResponseError(
              orderResponse,
              'No se pudo crear la orden local para iniciar el pago.'
            );
            return throwError(() => new Error(orderResponse.message ?? 'No se pudo crear la orden'));
          }

          this.checkoutState.setOrderId(orderResponse.data.orderId);

          return this.payPalCheckoutService.createPayPalOrder({
            orderId: orderResponse.data.orderId
          });
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (payPalResponse: BaseResponse<CreatePayPalOrderResponse>) => {
          if (!payPalResponse.isSuccess || !payPalResponse.data) {
            this.checkoutState.setResponseError(
              payPalResponse,
              'No se pudo crear la orden PayPal para continuar el pago.'
            );
            return;
          }

          this.checkoutState.startRedirectingToPayPal();
          window.location.href = payPalResponse.data.approvalUrl;
        },
        error: (error: unknown) => {
          this.checkoutState.setUnexpectedError(
            error,
            'No se pudo iniciar el flujo de pago con PayPal. Intenta nuevamente.'
          );
        }
      });
  }
}
