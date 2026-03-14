export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresInMinutes: number;
  userId: number;
  username: string;
  email: string;
  userType: string;
  roles: string[];
}

export type UserRole = 'ADMIN' | 'USER';

export type AppPermission =
  | 'orders.read'
  | 'orders.write'
  | 'payments.manage'
  | 'products.read'
  | 'products.write'
  | 'categories.read'
  | 'categories.write'
  | 'users.read';

export const ROLE_PERMISSIONS: Record<UserRole, AppPermission[]> = {
  ADMIN: [
    'orders.read',
    'orders.write',
    'payments.manage',
    'products.read',
    'products.write',
    'categories.read',
    'categories.write',
    'users.read'
  ],
  USER: [
    'products.read',
    'products.write',
    'categories.read',
    'categories.write',
    'users.read'
  ]
};

export interface StoredAuthSession extends LoginResponse {
  savedAt: string;
  expiresAt: string;
  storageStrategy: 'session' | 'local';
}
