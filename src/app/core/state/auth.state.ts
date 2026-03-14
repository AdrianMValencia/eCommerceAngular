import { Injectable, computed, signal } from '@angular/core';

import {
  AppPermission,
  LoginResponse,
  ROLE_PERMISSIONS,
  StoredAuthSession,
  UserRole
} from '../models/auth.model';

const AUTH_STORAGE_KEY = 'ecommerce_auth_session';

type StorageStrategy = 'session' | 'local';

function isUserRole(value: string | null | undefined): value is UserRole {
  return value === 'ADMIN' || value === 'USER';
}

function normalizeRole(session: Pick<LoginResponse, 'userType' | 'roles'>): UserRole | null {
  if (isUserRole(session.userType)) {
    return session.userType;
  }

  const matchingRole = session.roles.find((role) => isUserRole(role));
  return matchingRole ?? null;
}

@Injectable({ providedIn: 'root' })
export class AuthState {
  private readonly session = signal<StoredAuthSession | null>(this.readStoredSession());

  readonly authSession = computed(() => this.session());
  readonly isAuthenticated = computed(() => Boolean(this.session()?.token));
  readonly accessToken = computed(() => this.session()?.token ?? null);
  readonly userId = computed(() => this.session()?.userId ?? null);
  readonly username = computed(() => this.session()?.username ?? null);
  readonly email = computed(() => this.session()?.email ?? null);
  readonly userRole = computed<UserRole | null>(() => {
    const currentSession = this.session();

    if (!currentSession) {
      return null;
    }

    return normalizeRole(currentSession);
  });

  readonly roles = computed<UserRole[]>(() => {
    const role = this.userRole();
    return role ? [role] : [];
  });

  readonly permissions = computed<AppPermission[]>(() => {
    const role = this.userRole();
    return role ? ROLE_PERMISSIONS[role] : [];
  });

  readonly isAdmin = computed(() => this.userRole() === 'ADMIN');

  setSession(response: LoginResponse, options?: { persistent?: boolean }): void {
    const storageStrategy: StorageStrategy = options?.persistent ? 'local' : 'session';
    const expiresAt = new Date(Date.now() + response.expiresInMinutes * 60 * 1000).toISOString();
    const nextSession: StoredAuthSession = {
      ...response,
      savedAt: new Date().toISOString(),
      expiresAt,
      storageStrategy
    };

    this.session.set(nextSession);
    this.writeToSelectedStorage(nextSession);
  }

  clearSession(): void {
    this.session.set(null);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  hasRole(expectedRole: UserRole): boolean {
    return this.roles().includes(expectedRole);
  }

  hasAnyRole(expectedRoles: UserRole[]): boolean {
    return expectedRoles.length === 0 || expectedRoles.some((role) => this.hasRole(role));
  }

  hasPermission(permission: AppPermission): boolean {
    return this.permissions().includes(permission);
  }

  hasAllPermissions(requiredPermissions: AppPermission[]): boolean {
    return requiredPermissions.every((permission) => this.hasPermission(permission));
  }

  private readStoredSession(): StoredAuthSession | null {
    const storages: Storage[] = [sessionStorage, localStorage];

    for (const storage of storages) {
      const rawSession = storage.getItem(AUTH_STORAGE_KEY);

      if (!rawSession) {
        continue;
      }

      try {
        const parsed = JSON.parse(rawSession) as StoredAuthSession;

        if (!parsed?.token || !parsed.expiresAt) {
          storage.removeItem(AUTH_STORAGE_KEY);
          continue;
        }

        if (Date.parse(parsed.expiresAt) <= Date.now()) {
          storage.removeItem(AUTH_STORAGE_KEY);
          continue;
        }

        return parsed;
      } catch {
        storage.removeItem(AUTH_STORAGE_KEY);
      }
    }

    return null;
  }

  private writeToSelectedStorage(session: StoredAuthSession): void {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);

    const targetStorage = session.storageStrategy === 'local' ? localStorage : sessionStorage;
    targetStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  }
}
