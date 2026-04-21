import { Injectable, inject } from '@angular/core';
import { StoreService } from './store.service';
import { TENANT_CONTEXT } from './host-routing';

/**
 * Builds RouterLink arrays that work in both routing modes:
 *   - subdomain (`lama.casstore.store`)  → routes are mounted at root
 *   - apex     (`casstore.store/store/lama/...`) → routes are nested
 *
 * Components in `pages/store/**` should call `storeRouter.link([...])`
 * instead of hard-coding `['/store', slug, ...]`.
 */
@Injectable({ providedIn: 'root' })
export class StoreRouterService {
  private tenant = inject(TENANT_CONTEXT, { optional: true });
  private storeService = inject(StoreService);

  /** Tenant slug if running on a subdomain host. */
  get tenantSlug(): string | null {
    return this.tenant?.slug ?? null;
  }

  /** True when the storefront is being served from a subdomain host. */
  isSubdomain(): boolean {
    return Boolean(this.tenant);
  }

  /** Resolves the active store slug from the tenant context or current viewing-store. */
  slug(): string | null {
    return this.tenant?.slug ?? this.storeService.viewingStore()?.slug ?? null;
  }

  /**
   * Returns a RouterLink-compatible array. Examples:
   *   subdomain:  link(['products'])              → ['/', 'products']
   *   subdomain:  link([])                        → ['/']
   *   apex:       link(['products'])              → ['/store', 'lama', 'products']
   *   apex:       link([])                        → ['/store', 'lama']
   */
  link(segments: ReadonlyArray<string | number> = []): any[] {
    if (this.tenant) return ['/', ...segments];
    const slug = this.slug();
    return slug ? ['/store', slug, ...segments] : ['/'];
  }
}
