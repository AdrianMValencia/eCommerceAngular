import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models';
import { ProductService } from '../../services';
import { CartService } from '../../../cart/services';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | null>(null);
  quantity = signal(1);
  loading = signal(false);
  error = signal<string | null>(null);
  addedToCart = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadProduct(parseInt(id, 10));
      }
    });
  }

  private loadProduct(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getProductById(id).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.product.set(response.data);
        } else {
          this.error.set(response.message || 'Failed to load product');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error loading product');
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  increaseQuantity(): void {
    this.quantity.set(this.quantity() + 1);
  }

  decreaseQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.set(this.quantity() - 1);
    }
  }

  addToCart(): void {
    if (this.product()) {
      this.cartService.addToCart(this.product()!, this.quantity());
      this.addedToCart.set(true);
      setTimeout(() => {
        this.addedToCart.set(false);
      }, 2000);
    }
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}
