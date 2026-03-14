import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';

import { routes } from './app.routes';
import { AuthInterceptor, ErrorInterceptor } from './shared/interceptors';
import { IOrdersService, OrdersService } from './core/services/orders.service';
import { IPayPalCheckoutService, PayPalCheckoutService } from './core/services/paypal-checkout.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    {
      provide: IOrdersService,
      useExisting: OrdersService
    },
    {
      provide: IPayPalCheckoutService,
      useExisting: PayPalCheckoutService
    }
  ]
};
