import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { BaseResponse } from '../models';
import { CreateOrderRequest, Order, UpdateOrderRequest, UpdateOrderStateRequest } from '../models/order.interface';

@Injectable({
  providedIn: 'root'
})
export class OrderService extends ApiService {
  
  getAllOrders(): Observable<BaseResponse<Order[]>> {
    return this.get<Order[]>('/orders');
  }

  getOrderById(id: number): Observable<BaseResponse<Order>> {
    return this.get<Order>(`/orders/${id}`);
  }

  createOrder(request: CreateOrderRequest): Observable<BaseResponse<boolean>> {
    return this.post<boolean>('/orders', request);
  }

  updateOrder(id: number, request: UpdateOrderRequest): Observable<BaseResponse<boolean>> {
    return this.put<boolean>(`/orders/${id}`, request);
  }

  updateOrderState(id: number, request: UpdateOrderStateRequest): Observable<BaseResponse<boolean>> {
    return this.put<boolean>(`/orders/${id}/state`, request);
  }

  deleteOrder(id: number): Observable<BaseResponse<boolean>> {
    return this.delete<boolean>(`/orders/${id}`);
  }
}
