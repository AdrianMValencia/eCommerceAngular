import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BaseApiResponse } from '../models/base-api-response.interface';
import { CreateCategoryRequest, GetAllCategoriesResponse, UpdateCategoryRequest } from '../models/categories.interface';

@Injectable({
  providedIn: 'root',
})
export class Categories {

  private readonly httpClient = inject(HttpClient);

  private readonly categoriesSignal = signal<GetAllCategoriesResponse[] | null>(null);
  private readonly categoryByIdSignal = signal<GetAllCategoriesResponse | null>(null);
  private readonly categoryCreateSignal = signal<boolean | null>(null);
  private readonly categoryUpdateSignal = signal<boolean | null>(null);
  private readonly categoryDeleteSignal = signal<boolean | null>(null);


  getAllCategories() {
    const requestUrl = `${environment.apiBackendUrl}/categories`;
    this.httpClient.get<BaseApiResponse<GetAllCategoriesResponse[]>>(requestUrl).subscribe({
      next: (response) => {
        this.categoriesSignal.set(response.data);
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
      }
    });
  }

  getCategoryById(categoryId: number) {
    const requestUrl = `${environment.apiBackendUrl}/categories/${categoryId}`;
    this.httpClient.get<BaseApiResponse<GetAllCategoriesResponse>>(requestUrl).subscribe({
      next: (response) => {
        this.categoryByIdSignal.set(response.data);
      },
      error: (error) => {
        console.error('Error fetching category by ID:', error);
      }
    });
  }

  categoryCreate(category: CreateCategoryRequest) {
    const requestUrl = `${environment.apiBackendUrl}/categories`;
    this.httpClient.post<BaseApiResponse<boolean>>(requestUrl, category).subscribe({
      next: (response) => {
        this.categoryCreateSignal.set(response.isSuccess);
      },
      error: (error) => {
        console.error('Error creating category:', error);
        this.categoryCreateSignal.set(false);
      }
    });
  }

  categoryUpdate(category: UpdateCategoryRequest) {
    const requestUrl = `${environment.apiBackendUrl}/categories/${category.categoryId}`;
    this.httpClient.put<BaseApiResponse<boolean>>(requestUrl, category).subscribe({
      next: (response) => {
        this.categoryUpdateSignal.set(response.isSuccess);
      },
      error: (error) => {
        console.error('Error updating category:', error);
        this.categoryUpdateSignal.set(false);
      }
    });
  }

  categoryDelete(categoryId: number) {
    const requestUrl = `${environment.apiBackendUrl}/categories/${categoryId}`;
    this.httpClient.delete<BaseApiResponse<boolean>>(requestUrl).subscribe({
      next: (response) => {
        this.categoryDeleteSignal.set(response.isSuccess);
      },
      error: (error) => {
        console.error('Error deleting category:', error);
        this.categoryDeleteSignal.set(false);
      }
    });
  }

  getAllCategoriesSignal = this.categoriesSignal.asReadonly();
  getCategoryByIdSignal = this.categoryByIdSignal.asReadonly();
  getCategoryCreateSignal = this.categoryCreateSignal.asReadonly();
  getCategoryUpdateSignal = this.categoryUpdateSignal.asReadonly();
  getCategoryDeleteSignal = this.categoryDeleteSignal.asReadonly();
}
