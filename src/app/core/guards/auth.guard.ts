import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

import { AppPermission, UserRole } from '../models/auth.model';
import { AuthState } from '../state/auth.state';

type RouteAccessData = {
  requiredRoles?: UserRole[];
  requiredPermissions?: AppPermission[];
};

function resolveUnauthorizedRedirect(authState: AuthState, router: Router): UrlTree {
  return authState.isAdmin() ? router.parseUrl('/orders') : router.parseUrl('/products');
}

export const authGuard: CanActivateFn = (route, state) => {
  const authState = inject(AuthState);
  const router = inject(Router);
  const data = (route.data ?? {}) as RouteAccessData;
  const requiredRoles = data.requiredRoles ?? [];
  const requiredPermissions = data.requiredPermissions ?? [];

  if (!authState.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  if (!authState.hasAnyRole(requiredRoles)) {
    return resolveUnauthorizedRedirect(authState, router);
  }

  if (!authState.hasAllPermissions(requiredPermissions)) {
    return resolveUnauthorizedRedirect(authState, router);
  }

  return true;
};

export const guestOnlyGuard: CanActivateFn = () => {
  const authState = inject(AuthState);
  const router = inject(Router);

  if (authState.isAuthenticated()) {
    return authState.isAdmin() ? router.parseUrl('/orders') : router.parseUrl('/products');
  }

  return true;
};
