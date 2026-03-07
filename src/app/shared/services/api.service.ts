import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  protected baseUrl = `${environment.apiBackendUrl}`;
  protected http = inject(HttpClient);

  protected handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error?.message || error.statusText;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  get<T>(endpoint: string): Observable<BaseResponse<T>> {
    return this.http.get<BaseResponse<T>>(`${this.baseUrl}${endpoint}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  post<T>(endpoint: string, data: any): Observable<BaseResponse<T>> {
    return this.http.post<BaseResponse<T>>(`${this.baseUrl}${endpoint}`, data)
      .pipe(catchError(this.handleError.bind(this)));
  }

  put<T>(endpoint: string, data: any): Observable<BaseResponse<T>> {
    return this.http.put<BaseResponse<T>>(`${this.baseUrl}${endpoint}`, data)
      .pipe(catchError(this.handleError.bind(this)));
  }

  delete<T>(endpoint: string): Observable<BaseResponse<T>> {
    return this.http.delete<BaseResponse<T>>(`${this.baseUrl}${endpoint}`)
      .pipe(catchError(this.handleError.bind(this)));
  }
}
