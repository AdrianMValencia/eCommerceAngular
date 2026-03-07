export enum OrderState {
  CANCELLED = 0,
  CONFIRMED = 1
}

export interface User {
  userId: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
}

export interface ProductDetail {
  name: string;
  code: string;
  description: string;
}

export interface OrderItem {
  orderDetailId: number;
  productId: number;
  quantity: number;
  price: number;
  product: ProductDetail;
}

export interface OrderDetail {
  orderDetailId?: number;
  orderId?: number;
  productId: number;
  quantity: number;
  price: number;
  product?: any;
}

export interface Order {
  orderId: number;
  orderDate: string;
  orderState: string;
  user: User;
  items: OrderItem[];
  total: number;
  userId?: number;
  orderDetails?: OrderDetail[] | null;
}

export interface CreateOrderRequest {
  userId: number;
  orderDetails: OrderDetail[];
}

export interface UpdateOrderRequest {
  orderId?: number;
  orderDetails: OrderDetail[];
}

export interface UpdateOrderStateRequest {
  orderState: OrderState;
}
