import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../../checkout/services';
import { Order } from '../../../../shared/models/order.interface';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  orders = signal<Order[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  expandedOrders = signal<Set<number>>(new Set());

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.error.set(null);

    this.orderService.getAllOrders().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.orders.set(response.data);
        } else {
          this.error.set(response.message || 'No se pudieron obtener las ordenes');
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar ordenes');
        this.loading.set(false);
      }
    });
  }

  toggleOrderDetails(orderId: number): void {
    const expanded = new Set(this.expandedOrders());
    if (expanded.has(orderId)) {
      expanded.delete(orderId);
    } else {
      expanded.add(orderId);
    }
    this.expandedOrders.set(expanded);
  }

  isOrderExpanded(orderId: number): boolean {
    return this.expandedOrders().has(orderId);
  }

  getOrderStateLabel(state: string): string {
    return state.toUpperCase() === 'CONFIRMED' ? 'Confirmada' : 'Cancelada';
  }

  getOrderStateClass(state: string): string {
    return state.toUpperCase() === 'CONFIRMED'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  }
}
