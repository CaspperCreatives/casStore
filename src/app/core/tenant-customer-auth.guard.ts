import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TenantCustomerAuthService } from './tenant-customer-auth.service';
import { StoreService } from './store.service';
import { TENANT_CONTEXT } from './host-routing';

export const tenantCustomerAuthGuard: CanActivateFn = async (_route, state) => {
  const router = inject(Router);
  const tenant = inject(TENANT_CONTEXT, { optional: true });
  const storeService = inject(StoreService);
  const customerAuth = inject(TenantCustomerAuthService);

  const store = storeService.viewingStore();
  const storeId = store?.id ?? '';
  const storeSlug = tenant?.slug ?? store?.slug ?? '';
  if (!storeId) {
    return router.createUrlTree(['/']);
  }

  const me = await customerAuth.loadMe(storeId);
  if (me) return true;

  const returnUrl = state.url || (tenant ? '/account' : `/store/${storeSlug}/account`);
  if (tenant) {
    return router.createUrlTree(['/account', 'sign-in'], { queryParams: { returnUrl } });
  }
  return router.createUrlTree(['/store', storeSlug, 'account', 'sign-in'], { queryParams: { returnUrl } });
};
