import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { IPayPalCheckoutService } from '../../../core/services/paypal-checkout.service';
import { CheckoutState } from '../state/checkout.state';

@Component({
  selector: 'app-paypal-success-page',
  imports: [RouterLink],
  template: `
    <section class="page-wrap">
      <h1>Resultado del pago PayPal</h1>

      @if (status() === 'loading') {
        <p class="info">Capturando pago aprobado en PayPal...</p>
      }

      @if (status() === 'success') {
        <article class="card success" role="status" aria-live="polite">
          <h2>Pago completado</h2>
          <p>Tu orden fue confirmada y marcada como pagada.</p>
          <ul>
            <li>OrderId: {{ checkoutState.captureResult()?.orderId }}</li>
            <li>PayPalOrderId: {{ checkoutState.captureResult()?.payPalOrderId }}</li>
            <li>CaptureId: {{ checkoutState.captureResult()?.captureId }}</li>
            <li>
              Estado: {{ checkoutState.captureResult()?.status }} /
              {{ checkoutState.captureResult()?.orderState }}
            </li>
            @if (checkoutState.captureResult()?.payerEmail) {
              <li>Comprador: {{ checkoutState.captureResult()?.payerEmail }}</li>
            }
          </ul>
          <div class="actions">
            <a routerLink="/orders" class="btn primary">Ver mis ordenes</a>
            <a routerLink="/products" class="btn">Seguir comprando</a>
          </div>
        </article>
      }

      @if (status() === 'error') {
        <article class="card error" role="alert" aria-live="assertive">
          <h2>No fue posible confirmar tu pago</h2>
          <p>{{ checkoutState.errorMessage() }}</p>
          <div class="actions">
            <button type="button" class="btn primary" [disabled]="checkoutState.isBusy()" (click)="capture()">
              Reintentar captura
            </button>
            <a routerLink="/checkout" class="btn">Volver a checkout</a>
          </div>
        </article>
      }
    </section>
  `,
  styles: [
    `
      .page-wrap {
        max-width: 780px;
        margin: 0 auto;
        padding: 2rem 1rem;
      }

      .card {
        margin-top: 1rem;
        border-radius: 10px;
        padding: 1rem;
      }

      .success {
        border: 1px solid #15803d;
        background: #f0fdf4;
      }

      .error {
        border: 1px solid #b91c1c;
        background: #fef2f2;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-top: 1rem;
      }

      .btn {
        border: 1px solid #9ca3af;
        border-radius: 8px;
        padding: 0.6rem 0.9rem;
        background: #ffffff;
        text-decoration: none;
        color: #111827;
        cursor: pointer;
      }

      .btn.primary {
        background: #111827;
        color: #ffffff;
      }

      .info {
        color: #1f2937;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayPalSuccessPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly payPalCheckoutService = inject(IPayPalCheckoutService);

  readonly checkoutState = inject(CheckoutState);
  readonly token = signal<string | null>(null);
  readonly status = signal<'idle' | 'loading' | 'success' | 'error'>('idle');

  constructor() {
    this.capture();
  }

  capture(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.status.set('error');
      this.checkoutState.setUnexpectedError(null, 'PayPal token no encontrado en la URL.');
      return;
    }

    this.token.set(token);
    this.status.set('loading');
    this.checkoutState.startCapturePayment();

    this.payPalCheckoutService
      .capturePayPalOrder(token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (!response.isSuccess || !response.data) {
            this.status.set('error');
            this.checkoutState.setResponseError(response, 'No se pudo capturar el pago.');
            return;
          }

          if (response.data.status === 'COMPLETED' && response.data.orderState === 'PAID') {
            this.status.set('success');
            this.checkoutState.setCaptureSuccess(response.data);
            return;
          }

          this.status.set('error');
          this.checkoutState.setUnexpectedError(
            null,
            'El pago no se completo en PayPal. Valida el estado e intenta nuevamente.'
          );
        },
        error: (error: unknown) => {
          this.status.set('error');
          this.checkoutState.setUnexpectedError(
            error,
            'Ocurrio un error de red al capturar el pago en PayPal.'
          );
        }
      });
  }
}
