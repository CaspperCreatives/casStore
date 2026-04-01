import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.whenReady();

  if (!auth.user()) return router.parseUrl('/sign-in');
  // Roles: 1=admin, 2=manager, 3=user
  if (auth.canAccessAdmin()) return true;

  return router.parseUrl('/products');
};


