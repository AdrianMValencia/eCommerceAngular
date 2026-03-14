export interface CreatePayPalOrderRequest {
  orderId: number;
}

export interface CreatePayPalOrderResponse {
  orderId: number;
  payPalOrderId: string;
  status: string;
  approvalUrl: string;
  currency: string;
  amount: number;
}

export interface CapturePayPalOrderResponse {
  orderId: number;
  payPalOrderId: string;
  captureId: string;
  status: string;
  orderState: string;
  payerEmail?: string | null;
}
