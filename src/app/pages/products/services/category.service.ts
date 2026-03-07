import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../shared/services/api.service';
import { Category, BaseResponse } from '../../../shared/models';

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  categoryId?: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends ApiService {
  
  getAllCategories(): Observable<BaseResponse<Category[]>> {
    return this.get<Category[]>('/categories');
  }

  getCategoryById(id: number): Observable<BaseResponse<Category>> {
    return this.get<Category>(`/categories/${id}`);
  }

  createCategory(request: CreateCategoryRequest): Observable<BaseResponse<boolean>> {
    return this.post<boolean>('/categories', request);
  }

  updateCategory(id: number, request: UpdateCategoryRequest): Observable<BaseResponse<boolean>> {
    return this.put<boolean>(`/categories/${id}`, request);
  }

  deleteCategory(id: number): Observable<BaseResponse<boolean>> {
    return this.delete<boolean>(`/categories/${id}`);
  }
}
