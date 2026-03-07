import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../cart/services';
import { OrderService, UserService } from '../../services';
import { CreateOrderRequest, OrderDetail } from '../../../../shared/models/order.interface';
import { CreateUserRequest, UserType } from '../../../../shared/models';

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent {

    private readonly cartService = inject(CartService);
    private readonly userService = inject(UserService);
    private readonly orderService = inject(OrderService);
    private readonly router = inject(Router);

    cartState = this.cartService.cartState;
    loading = signal(false);
    error = signal<string | null>(null);
    orderCreated = signal(false);
    createdOrderId = signal<number | null>(null);

    // Form data
    firstName = signal('');
    lastName = signal('');
    email = signal('');
    phone = signal('');
    address = signal('');
    username = signal('');
    password = signal('');

    placeOrder(): void {
        // Validation
        if (!this.firstName() || !this.lastName() || !this.email() || !this.address()) {
            this.error.set('Por favor complete todos los campos requeridos');
            return;
        }

        if (this.cartState().items.length === 0) {
            this.error.set('Tu carrito está vacío');
            return;
        }

        this.loading.set(true);
        this.error.set(null);

        // Create user first
        const createUserRequest: CreateUserRequest = {
            userId: 0,
            username: this.username() || this.email(),
            password: this.password(),
            firstname: this.firstName(),
            lastname: this.lastName(),
            email: this.email(),
            address: this.address(),
            cellphone: this.phone(),
            userType: UserType.USER
        };

        this.userService.createUser(createUserRequest).subscribe({
            next: (userResponse) => {
                if (userResponse.isSuccess) {
                    // TODO: In a real app, you'd get the actual userId from the response
                    // For now, we'll use a hardcoded value or the backend should return it
                    const userId = 1; // This would normally come from the user service response

                    // Create order
                    const orderDetails: OrderDetail[] = this.cartState().items.map(item => ({
                        productId: item.product.productId,
                        quantity: item.quantity,
                        price: item.product.price
                    }));

                    const createOrderRequest: CreateOrderRequest = {
                        userId,
                        orderDetails
                    };

                    this.orderService.createOrder(createOrderRequest).subscribe({
                        next: (orderResponse) => {
                            if (orderResponse.isSuccess) {
                                this.orderCreated.set(true);
                                // Clear cart after successful order
                                this.cartService.clearCart();
                                // Navigate to success page after 2 seconds
                                setTimeout(() => {
                                    this.router.navigate(['/order-success']);
                                }, 2000);
                            } else {
                                this.error.set(orderResponse.message || 'Error al crear la orden');
                            }
                            this.loading.set(false);
                        },
                        error: (err) => {
                            this.error.set('Error al crear la orden');
                            console.error(err);
                            this.loading.set(false);
                        }
                    });
                } else {
                    this.error.set(userResponse.message || 'Error al crear el usuario');
                    this.loading.set(false);
                }
            },
            error: (err) => {
                this.error.set('Error al crear el usuario');
                console.error(err);
                this.loading.set(false);
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/cart']);
    }
}
