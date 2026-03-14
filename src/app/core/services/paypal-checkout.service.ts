import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { BaseResponse } from '../models/base-response.model';
import {
  CapturePayPalOrderResponse,
  CreatePayPalOrderRequest,
  CreatePayPalOrderResponse
} from '../models/paypal.model';

export abstract class IPayPalCheckoutService {
  abstract createPayPalOrder(
    request: CreatePayPalOrderRequest
  ): Observable<BaseResponse<CreatePayPalOrderResponse>>;

  abstract capturePayPalOrder(
    payPalOrderId: string
  ): Observable<BaseResponse<CapturePayPalOrderResponse>>;
}

@Injectable({ providedIn: 'root' })
export class PayPalCheckoutService implements IPayPalCheckoutService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  createPayPalOrder(
    request: CreatePayPalOrderRequest
  ): Observable<BaseResponse<CreatePayPalOrderResponse>> {
    return this.http.post<BaseResponse<CreatePayPalOrderResponse>>(
      `${this.baseUrl}/api/payments/paypal/orders`,
      request
    );
  }

  capturePayPalOrder(payPalOrderId: string): Observable<BaseResponse<CapturePayPalOrderResponse>> {
    return this.http.post<BaseResponse<CapturePayPalOrderResponse>>(
      `${this.baseUrl}/api/payments/paypal/orders/${payPalOrderId}/capture`,
      {}
    );
  }
}
