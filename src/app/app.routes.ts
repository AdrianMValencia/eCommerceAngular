import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout.component';
import { HomeComponent } from './pages/home/home.component';
import { ProductListComponent } from './pages/products/components/product-list/product-list.component';
import { ProductDetailComponent } from './pages/products/components/product-detail/product-detail.component';
import { CartComponent } from './pages/cart/components/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/components/checkout/checkout.component';
import { OrderSuccessComponent } from './pages/checkout/components/order-success/order-success.component';
import { OrderListComponent } from './pages/orders/components/order-list/order-list.component';

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
				path: 'products',
				component: ProductListComponent
			},
			{
				path: 'products/:id',
				component: ProductDetailComponent
			},
			{
				path: 'cart',
				component: CartComponent
			},
			{
				path: 'checkout',
				component: CheckoutComponent
			},
			{
				path: 'order-success',
				component: OrderSuccessComponent
			},
			{
				path: 'orders',
				component: OrderListComponent
			},
			{
				path: '**',
				redirectTo: ''
			}
		]
	}
];
