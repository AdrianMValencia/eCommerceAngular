import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-payment-error-page',
  imports: [RouterLink],
  template: `
    <section class="error-wrap">
      <article class="error-card" role="alert" aria-live="assertive">
        <h1>Error de pago</h1>
        <p>{{ message }}</p>
        <div class="actions">
          <a routerLink="/checkout" class="btn primary">Reintentar checkout</a>
          <a routerLink="/cart" class="btn">Volver al carrito</a>
        </div>
      </article>
    </section>
  `,
  styles: [
    `
      .error-wrap {
        max-width: 680px;
        margin: 0 auto;
        padding: 2rem 1rem;
      }

      .error-card {
        border: 1px solid #b91c1c;
        border-radius: 10px;
        padding: 1rem;
        background: #fef2f2;
      }

      .actions {
        margin-top: 1rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      .btn {
        border: 1px solid #9ca3af;
        border-radius: 8px;
        padding: 0.6rem 0.9rem;
        text-decoration: none;
        color: #111827;
      }

      .btn.primary {
        background: #991b1b;
        border-color: #991b1b;
        color: #ffffff;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentErrorPageComponent {
  private readonly route = inject(ActivatedRoute);

  readonly message =
    this.route.snapshot.queryParamMap.get('message') ||
    'No fue posible completar el flujo de pago. Intenta nuevamente.';
}
