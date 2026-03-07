import { Injectable, signal, computed, effect } from '@angular/core';
import { Product } from '../../products/models';

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

const CART_STORAGE_KEY = 'ecommerce_cart';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly items = signal<CartItem[]>([]);

  readonly subtotal = computed(() => {
    return this.items().reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  });

  readonly total = computed(() => {
    return this.subtotal();
  });

  readonly itemsCount = computed(() => {
    return this.items().reduce((sum, item) => sum + item.quantity, 0);
  });

  readonly cartState = computed<CartState>(() => ({
    items: this.items(),
    subtotal: this.subtotal(),
    total: this.total(),
    itemsCount: this.itemsCount()
  }));

  constructor() {
    this.loadFromLocalStorage();
    // Effect to persist cart to localStorage whenever items change
    effect(() => {
      this.saveToLocalStorage(this.items());
    });
  }

  addToCart(product: Product, quantity: number = 1): void {
    console.log("product ", product);
    const items = this.items();
    const existingItem = items.find(item => item.product.productId === product.productId);

    if (existingItem) {
      existingItem.quantity += quantity;
      this.items.set([...items]);
    } else {
      this.items.set([...items, { product, quantity }]);
    }
  }

  removeFromCart(productId: number): void {
    this.items.set(this.items().filter(item => item.product.productId !== productId));
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const items = this.items();
    const item = items.find(item => item.product.productId === productId);

    if (item) {
      item.quantity = quantity;
      this.items.set([...items]);
    }
  }

  clearCart(): void {
    this.items.set([]);
  }

  getCartItems(): CartItem[] {
    return this.items();
  }

  private saveToLocalStorage(items: CartItem[]): void {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        this.items.set(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      this.items.set([]);
    }
  }
}
