import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { StoreService } from './store.service';

export const storeOwnerGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const storeService = inject(StoreService);
  const router = inject(Router);

  await auth.whenReady();

  if (!auth.user()) {
    return router.createUrlTree(['/sign-in'], { queryParams: { returnUrl: '/my-store' } });
  }

  // Load their store to check existence
  const store = await storeService.loadMyStore();
  if (!store) {
    return router.createUrlTree(['/create-store']);
  }

  return true;
};
