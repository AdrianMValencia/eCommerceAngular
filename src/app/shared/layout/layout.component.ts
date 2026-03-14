import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { CartService } from '../../pages/cart/services';
import { AuthState } from '../../core/state/auth.state';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, RouterOutlet],
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.css']
})
export class LayoutComponent {

    private readonly cartService = inject(CartService);
    private readonly router = inject(Router);
    readonly authState = inject(AuthState);

    menuOpen = false;
    cartState = this.cartService.cartState;
    canReadCatalog = computed(() => this.authState.hasPermission('products.read'));
    canReadOrders = computed(() => this.authState.hasPermission('orders.read'));
    displayName = computed(() => this.authState.username() || this.authState.email() || 'Cuenta');

    toggleMenu(): void {
        this.menuOpen = !this.menuOpen;
    }

    closeMenu(): void {
        this.menuOpen = false;
    }

    logout(): void {
        this.authState.clearSession();
        this.closeMenu();
        void this.router.navigate(['/login']);
    }
}
