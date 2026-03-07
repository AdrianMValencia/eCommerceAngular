import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.css']
})
export class CartComponent {

    private readonly cartService = inject(CartService);

    cartState = this.cartService.cartState;

    updateQuantity(productId: number, quantity: number): void {
        if (quantity > 0) {
            this.cartService.updateQuantity(productId, quantity);
        }
    }

    removeFromCart(productId: number): void {
        this.cartService.removeFromCart(productId);
    }

    clearCart(): void {
        if (confirm('¿Está seguro de que desea vaciar el carrito?')) {
            this.cartService.clearCart();
        }
    }
}
