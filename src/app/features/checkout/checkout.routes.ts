import { Routes } from '@angular/router';

import { CheckoutPageComponent } from './pages/checkout-page.component';
import { PayPalSuccessPageComponent } from './pages/paypal-success-page.component';
import { PayPalCancelPageComponent } from './pages/paypal-cancel-page.component';
import { PaymentErrorPageComponent } from './pages/payment-error-page.component';

export const CHECKOUT_ROUTES: Routes = [
  {
    path: '',
    component: CheckoutPageComponent
  },
  {
    path: 'paypal/success',
    component: PayPalSuccessPageComponent
  },
  {
    path: 'paypal/cancel',
    component: PayPalCancelPageComponent
  },
  {
    path: 'payment-error',
    component: PaymentErrorPageComponent
  }
];
