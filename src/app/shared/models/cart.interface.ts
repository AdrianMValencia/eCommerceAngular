import { Product } from './product.interface';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  subtotal: number;
  total: number;
  itemsCount: number;
}
