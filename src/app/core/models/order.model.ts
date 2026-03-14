export interface CreateOrderDetailRequest {
  productId: number;
  quantity: number;
  price: number;
}

export interface CreateOrderRequest {
  userId: number;
  orderDetails: CreateOrderDetailRequest[];
}

export interface OrderCreatedResponse {
  orderId: number;
  total: number;
  orderState: string;
}
