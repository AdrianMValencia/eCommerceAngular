import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '../../../core/services/auth.service';
import { AuthState } from '../../../core/state/auth.state';
import {
  mapBaseResponseErrorsToFieldMap,
  mapBaseResponseErrorsToMessages,
  resolveBusinessErrorMessage,
  toFriendlyApiError
} from '../../../core/utils/base-response.utils';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="login-shell">
      <article class="login-card">
        <header>
          <p class="eyebrow">JWT Access</p>
          <h1>Iniciar sesion</h1>
          <p>Accede con tu cuenta para consumir endpoints protegidos y habilitar permisos por rol.</p>
        </header>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <label class="field">
            <span>Email</span>
            <input type="email" formControlName="email" placeholder="admin@demo.com" />
            @if (emailErrors().length > 0) {
              <small>{{ emailErrors().join(' | ') }}</small>
            }
          </label>

          <label class="field">
            <span>Password</span>
            <input type="password" formControlName="password" placeholder="123456" />
            @if (passwordErrors().length > 0) {
              <small>{{ passwordErrors().join(' | ') }}</small>
            }
          </label>

          <label class="remember-row">
            <input type="checkbox" formControlName="rememberMe" />
            <span>Mantener sesion en este dispositivo</span>
          </label>

          @if (businessError()) {
            <div class="error-box" role="alert" aria-live="assertive">
              <p>{{ businessError() }}</p>
              @if (validationSummary().length > 0) {
                <ul>
                  @for (message of validationSummary(); track message) {
                    <li>{{ message }}</li>
                  }
                </ul>
              }
            </div>
          }

          <button type="submit" class="primary-btn">
            @if (submitting()) {
              Validando credenciales...
            } @else {
              Entrar
            }
          </button>
        </form>

        <footer>
          <p>Demo admin: admin@demo.com / 123456</p>
          <a routerLink="/" class="back-link">Volver al inicio</a>
        </footer>
      </article>
    </section>
  `,
  styles: [
    `
      .login-shell {
        min-height: 70vh;
        display: grid;
        place-items: center;
        padding: 2rem 1rem;
      }

      .login-card {
        width: min(100%, 460px);
        background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
        border: 1px solid #dbe4ee;
        border-radius: 18px;
        padding: 1.5rem;
        box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
      }

      .eyebrow {
        margin: 0 0 0.35rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 0.75rem;
        color: #0369a1;
      }

      h1 {
        margin: 0;
      }

      form {
        display: grid;
        gap: 1rem;
        margin-top: 1.25rem;
      }

      .field {
        display: grid;
        gap: 0.4rem;
      }

      .field span {
        font-weight: 600;
        color: #0f172a;
      }

      .field input {
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        padding: 0.8rem 0.9rem;
        font: inherit;
      }

      .field small {
        color: #b91c1c;
      }

      .remember-row {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        color: #334155;
      }

      .remember-row input {
        width: 1rem;
        height: 1rem;
      }

      .error-box {
        border: 1px solid #fecaca;
        background: #fef2f2;
        color: #991b1b;
        border-radius: 10px;
        padding: 0.85rem;
      }

      .error-box p,
      .error-box ul {
        margin: 0;
      }

      .error-box ul {
        padding-left: 1.2rem;
        margin-top: 0.5rem;
      }

      .primary-btn {
        border: none;
        border-radius: 999px;
        padding: 0.9rem 1rem;
        font: inherit;
        font-weight: 700;
        background: #0f172a;
        color: #ffffff;
        cursor: pointer;
      }

      .primary-btn[disabled] {
        opacity: 0.7;
        cursor: not-allowed;
      }

      footer {
        margin-top: 1.25rem;
        color: #475569;
      }

      .back-link {
        color: #0f172a;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly authState = inject(AuthState);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly submitting = signal(false);
  readonly businessError = signal<string | null>(null);
  readonly fieldErrors = signal<Record<string, string[]>>({});

  readonly form = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: false
  });

  readonly validationSummary = computed(() => Object.values(this.fieldErrors()).flat());
  readonly isSubmitDisabled = computed(() => this.submitting() || this.form.invalid);
  readonly emailErrors = computed(() => this.resolveControlErrors('email', 'Email'));
  readonly passwordErrors = computed(() => this.resolveControlErrors('password', 'Password'));

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.businessError.set(null);
    this.fieldErrors.set({});

    const { rememberMe, ...credentials } = this.form.getRawValue();

    this.authService
      .login(credentials)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (!response.isSuccess || !response.data) {
            this.businessError.set(
              resolveBusinessErrorMessage(response, 'No fue posible iniciar sesion.')
            );
            this.fieldErrors.set(mapBaseResponseErrorsToFieldMap(response.errors));
            this.submitting.set(false);
            return;
          }

          this.authState.setSession(response.data, { persistent: rememberMe });
          this.submitting.set(false);

          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          const defaultRoute = response.data.userType === 'ADMIN' ? '/orders' : '/products';
          void this.router.navigateByUrl(returnUrl || defaultRoute);
        },
        error: (error: unknown) => {
          this.businessError.set(toFriendlyApiError(error, 'No fue posible iniciar sesion.'));

          const responseErrors =
            typeof error === 'object' && error !== null && 'error' in error
              ? (error.error as { errors?: { propertyName?: string; errorMessage?: string }[] | null })
                  .errors
              : null;

          this.fieldErrors.set(mapBaseResponseErrorsToFieldMap(responseErrors));
          this.submitting.set(false);
        }
      });
  }

  private resolveControlErrors(controlName: 'email' | 'password', responseField: string): string[] {
    const control = this.form.controls[controlName];
    const responseMessages = this.fieldErrors()[responseField] ?? this.fieldErrors()[controlName] ?? [];

    if (!control.touched && responseMessages.length === 0) {
      return [];
    }

    const clientErrors: string[] = [];

    if (control.hasError('required')) {
      clientErrors.push(`${responseField} is required.`);
    }

    if (control.hasError('email')) {
      clientErrors.push('Email must be valid.');
    }

    return [...clientErrors, ...responseMessages];
  }
}