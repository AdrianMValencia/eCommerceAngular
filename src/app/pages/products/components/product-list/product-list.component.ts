import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models';
import { Category } from '../../../../shared/models';
import { CategoryService, ProductService } from '../../services';
import { CartService } from '../../../cart/services';

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
    products = signal<Product[]>([]);
    categories = signal<Category[]>([]);
    filteredProducts = signal<Product[]>([]);
    loading = signal(false);
    loadingCategories = signal(false);
    error = signal<string | null>(null);
    searchTerm = signal('');
    selectedCategory = signal<number | null>(null);
    currentPage = signal(1);
    itemsPerPage = 12;

    constructor(
        private productService: ProductService,
        private categoryService: CategoryService,
        private cartService: CartService
    ) { }

    ngOnInit(): void {
        this.loadCategories();
        this.loadProducts();
    }

    loadCategories(): void {
        this.loadingCategories.set(true);

        this.categoryService.getAllCategories().subscribe({
            next: (response) => {
                if (response.isSuccess && response.data) {
                    this.categories.set(response.data);
                }
                this.loadingCategories.set(false);
            },
            error: () => {
                this.loadingCategories.set(false);
            }
        });
    }

    loadProducts(): void {
        this.loading.set(true);
        this.error.set(null);

        this.productService.getAllProducts().subscribe({
            next: (response) => {
                if (response.isSuccess && response.data) {
                    this.products.set(response.data);
                    this.filterProducts();
                } else {
                    this.error.set(response.message || 'Failed to load products');
                }
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set('Error loading products');
                console.error(err);
                this.loading.set(false);
            }
        });
    }

    updateSearch(term: string): void {
        this.searchTerm.set(term);
        this.currentPage.set(1);
        this.filterProducts();
    }

    updateCategory(categoryId: number | null): void {
        this.selectedCategory.set(categoryId);
        this.currentPage.set(1);
        this.filterProducts();
    }

    onCategoryChange(value: string): void {
        const categoryId = value ? Number(value) : null;
        this.updateCategory(categoryId);
    }

    private filterProducts(): void {
        let filtered = this.products();

        // Filter by search term
        if (this.searchTerm()) {
            const term = this.searchTerm().toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(term) ||
                p.description.toLowerCase().includes(term) ||
                p.code.toLowerCase().includes(term)
            );
        }

        // Filter by category
        if (this.selectedCategory()) {
            filtered = filtered.filter(p => p.categoryId === this.selectedCategory());
        }

        this.filteredProducts.set(filtered);
    }

    get paginatedProducts(): Product[] {
        const start = (this.currentPage() - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.filteredProducts().slice(start, end);
    }

    get totalPages(): number {
        return Math.ceil(this.filteredProducts().length / this.itemsPerPage);
    }

    nextPage(): void {
        if (this.currentPage() < this.totalPages) {
            this.currentPage.set(this.currentPage() + 1);
        }
    }

    previousPage(): void {
        if (this.currentPage() > 1) {
            this.currentPage.set(this.currentPage() - 1);
        }
    }

    addToCart(product: Product): void {
        this.cartService.addToCart(product, 1);
    }
}
