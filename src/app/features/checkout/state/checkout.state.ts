import { Injectable, computed, signal } from '@angular/core';

import { BaseResponse } from '../../../core/models/base-response.model';
import { CapturePayPalOrderResponse } from '../../../core/models/paypal.model';
import {
  mapBaseResponseErrorsToFieldMap,
  mapBaseResponseErrorsToMessages,
  toFriendlyApiError
} from '../../../core/utils/base-response.utils';

@Injectable({ providedIn: 'root' })
export class CheckoutState {
  readonly isCreatingOrder = signal(false);
  readonly isRedirectingToPayPal = signal(false);
  readonly isCapturingPayment = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly fieldErrors = signal<Record<string, string[]>>({});
  readonly lastOrderId = signal<number | null>(null);
  readonly captureResult = signal<CapturePayPalOrderResponse | null>(null);

  readonly isBusy = computed(
    () => this.isCreatingOrder() || this.isRedirectingToPayPal() || this.isCapturingPayment()
  );

  readonly isCheckoutDisabled = computed(() => this.isBusy());

  resetCheckoutProcess(): void {
    this.isCreatingOrder.set(false);
    this.isRedirectingToPayPal.set(false);
    this.errorMessage.set(null);
    this.fieldErrors.set({});
  }

  startCreateOrder(): void {
    this.resetCheckoutProcess();
    this.isCreatingOrder.set(true);
  }

  startRedirectingToPayPal(): void {
    this.isCreatingOrder.set(false);
    this.isRedirectingToPayPal.set(true);
  }

  startCapturePayment(): void {
    this.isCapturingPayment.set(true);
    this.errorMessage.set(null);
    this.fieldErrors.set({});
  }

  endCapturePayment(): void {
    this.isCapturingPayment.set(false);
  }

  setOrderId(orderId: number): void {
    this.lastOrderId.set(orderId);
  }

  setCaptureSuccess(data: CapturePayPalOrderResponse): void {
    this.captureResult.set(data);
    this.isCapturingPayment.set(false);
    this.errorMessage.set(null);
    this.fieldErrors.set({});
  }

  setResponseError(response: BaseResponse<unknown> | null | undefined, fallback: string): void {
    const responseErrors = response?.errors ?? null;
    const messages = mapBaseResponseErrorsToMessages(responseErrors);
    const resolvedMessage = response?.message?.trim() || messages.join(' | ') || fallback;

    this.errorMessage.set(resolvedMessage);
    this.fieldErrors.set(mapBaseResponseErrorsToFieldMap(responseErrors));
    this.isCreatingOrder.set(false);
    this.isRedirectingToPayPal.set(false);
    this.isCapturingPayment.set(false);
  }

  setUnexpectedError(error: unknown, fallback: string): void {
    this.errorMessage.set(toFriendlyApiError(error, fallback));
    this.isCreatingOrder.set(false);
    this.isRedirectingToPayPal.set(false);
    this.isCapturingPayment.set(false);
  }
}
