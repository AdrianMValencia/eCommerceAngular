import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout.component';
import { HomeComponent } from './pages/home/home.component';
import { ProductListComponent } from './pages/products/components/product-list/product-list.component';
import { ProductDetailComponent } from './pages/products/components/product-detail/product-detail.component';
import { CartComponent } from './pages/cart/components/cart/cart.component';
import { OrderSuccessComponent } from './pages/checkout/components/order-success/order-success.component';
import { OrderListComponent } from './pages/orders/components/order-list/order-list.component';
import { authGuard, guestOnlyGuard } from './core/guards/auth.guard';

export const routes: Routes = [
	{
		path: '',
		component: LayoutComponent,
		children: [
			{
				path: '',
				component: HomeComponent
			},
			{
				path: 'login',
				canActivate: [guestOnlyGuard],
				loadComponent: () =>
					import('./features/auth/pages/login-page.component').then((m) => m.LoginPageComponent)
			},
			{
				path: 'products',
				component: ProductListComponent,
				canActivate: [authGuard],
				data: {
					requiredPermissions: ['products.read']
				}
			},
			{
				path: 'products/:id',
				component: ProductDetailComponent,
				canActivate: [authGuard],
				data: {
					requiredPermissions: ['products.read']
				}
			},
			{
				path: 'cart',
				component: CartComponent,
				canActivate: [authGuard],
				data: {
					requiredPermissions: ['products.read']
				}
			},
			{
				path: 'checkout',
				canActivate: [authGuard],
				data: {
					requiredPermissions: ['orders.write', 'payments.manage']
				},
				loadChildren: () =>
					import('./features/checkout/checkout.routes').then((m) => m.CHECKOUT_ROUTES)
			},
			{
				path: 'order-success',
				component: OrderSuccessComponent
			},
			{
				path: 'orders',
				component: OrderListComponent,
				canActivate: [authGuard],
				data: {
					requiredPermissions: ['orders.read']
				}
			},
			{
				path: '**',
				redirectTo: ''
			}
		]
	}
];
