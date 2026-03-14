import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { BaseResponse } from '../models/base-response.model';
import { CreateOrderRequest, OrderCreatedResponse } from '../models/order.model';

export abstract class IOrdersService {
  abstract createOrder(request: CreateOrderRequest): Observable<BaseResponse<OrderCreatedResponse>>;
}

@Injectable({ providedIn: 'root' })
export class OrdersService implements IOrdersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  createOrder(request: CreateOrderRequest): Observable<BaseResponse<OrderCreatedResponse>> {
    return this.http.post<BaseResponse<OrderCreatedResponse>>(`${this.baseUrl}/api/orders`, request);
  }
}
