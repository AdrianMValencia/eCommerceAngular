import { Injectable, inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthState } from '../../core/state/auth.state';

const ANONYMOUS_ENDPOINTS = [
  { method: 'POST', path: '/api/auth/login' },
  { method: 'POST', path: '/api/users' },
  { method: 'POST', path: '/api/payments/paypal/webhook' }
] as const;

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly authState = inject(AuthState);
  private readonly router = inject(Router);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const shouldSkipAuth = ANONYMOUS_ENDPOINTS.some(
      (endpoint) => endpoint.method === request.method && request.url.includes(endpoint.path)
    );

    const token = this.authState.accessToken();

    const authorizedRequest = !shouldSkipAuth && token
      ? request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        })
      : request;

    return next.handle(authorizedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !shouldSkipAuth) {
          this.authState.clearSession();
          void this.router.navigate(['/login'], {
            queryParams: { returnUrl: this.router.url }
          });
        }

        return throwError(() => error);
      })
    );
  }
}
