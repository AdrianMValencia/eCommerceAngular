import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../shared/services/api.service';
import { User, BaseResponse, UserType, CreateUserRequest } from '../../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class UserService extends ApiService {
  
  getUserById(userId: number): Observable<BaseResponse<User>> {
    return this.get<User>(`/users/${userId}`);
  }

  getUserByEmail(email: string): Observable<BaseResponse<User>> {
    return this.get<User>(`/users/by-email/${email}`);
  }

  createUser(request: CreateUserRequest): Observable<BaseResponse<boolean>> {
    return this.post<boolean>('/users', request);
  }
}
