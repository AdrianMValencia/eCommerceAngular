import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-paypal-cancel-page',
  imports: [RouterLink],
  template: `
    <section class="cancel-wrap">
      <article class="cancel-card">
        <h1>Pago cancelado</h1>
        <p>No se realizo ningun cobro. Puedes volver a intentarlo cuando quieras.</p>
        <div class="actions">
          <a routerLink="/checkout" class="btn primary">Reintentar pago</a>
          <a routerLink="/cart" class="btn">Volver al carrito</a>
        </div>
      </article>
    </section>
  `,
  styles: [
    `
      .cancel-wrap {
        max-width: 680px;
        margin: 0 auto;
        padding: 2rem 1rem;
      }

      .cancel-card {
        border: 1px solid #f59e0b;
        border-radius: 10px;
        padding: 1rem;
        background: #fffbeb;
      }

      .actions {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
        margin-top: 1rem;
      }

      .btn {
        border: 1px solid #9ca3af;
        border-radius: 8px;
        padding: 0.6rem 0.9rem;
        text-decoration: none;
        color: #111827;
        background: #ffffff;
      }

      .btn.primary {
        border-color: #d97706;
        color: #ffffff;
        background: #d97706;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayPalCancelPageComponent {}
