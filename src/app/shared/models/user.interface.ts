export enum UserType {
  ADMIN = 1,
  USER = 2
}

export interface User {
  userId: number;
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  email: string;
  address: string;
  cellphone: string;
  userType: UserType;
  createDate: string;
  updateDate: string;
}

export interface UserResponse extends User {}

export interface CreateUserRequest {
  userId: number;
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  email: string;
  address: string;
  cellphone: string;
  userType: UserType;
}
