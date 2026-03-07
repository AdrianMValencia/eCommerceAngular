import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../shared/services/api.service';
import { BaseResponse } from '../../../shared/models';
import { Product } from '../models';

export interface CreateProductRequest {
  name: string;
  code: string;
  description: string;
  urlImage: string;
  price: number;
  userId: number;
  categoryId: number;
}

export interface UpdateProductRequest {
  productId?: number;
  name: string;
  code: string;
  description: string;
  urlImage: string;
  price: number;
  userId: number;
  categoryId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService extends ApiService {
  
  getAllProducts(): Observable<BaseResponse<Product[]>> {
    return this.get<Product[]>('/products');
  }

  getProductById(id: number): Observable<BaseResponse<Product>> {
    return this.get<Product>(`/products/${id}`);
  }

  createProduct(request: CreateProductRequest): Observable<BaseResponse<boolean>> {
    return this.post<boolean>('/products', request);
  }

  updateProduct(id: number, request: UpdateProductRequest): Observable<BaseResponse<boolean>> {
    return this.put<boolean>(`/products/${id}`, request);
  }

  deleteProduct(id: number): Observable<BaseResponse<boolean>> {
    return this.delete<boolean>(`/products/${id}`);
  }
}
