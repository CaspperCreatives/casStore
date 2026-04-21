import { InjectionToken } from '@angular/core';
import { environment } from '../../environments/environment';

export type TenantContext = {
  /** The store slug parsed from the host (e.g. `lama` for `lama.casstore.store`). */
  slug: string;
  source: 'subdomain';
};

/**
 * Parses the current `window.location.host` and returns a TenantContext when
 * the request was made against a `<slug>.<rootDomain>` subdomain.
 *
 * Returns `null` for the apex (`casstore.store`), `www`, or any host the
 * router doesn't recognise. Local development is supported via
 * `<slug>.localhost` (e.g. `lama.localhost:4200`) so the same code path
 * exercises the subdomain branch without DNS.
 */
export function detectTenantFromHost(): TenantContext | null {
  if (!environment.subdomainsEnabled) return null;
  if (typeof window === 'undefined') return null;
  const host = window.location.host.toLowerCase().split(':')[0];
  const root = environment.rootDomain;

  if (!root) return null;
  if (host === root || host === `www.${root}`) return null;

  if (host.endsWith(`.${root}`)) {
    const slug = host.slice(0, -(`.${root}`.length));
    return slug && slug !== 'www' ? { slug, source: 'subdomain' } : null;
  }

  // Local-dev convenience: `lama.localhost` → slug "lama".
  if (host.endsWith('.localhost')) {
    const slug = host.slice(0, -'.localhost'.length);
    return slug && slug !== 'www' ? { slug, source: 'subdomain' } : null;
  }

  return null;
}

/**
 * Bootstrap-time tenant context. Resolved once in `app.config.ts` so the
 * router can decide between tenant routes and apex routes before any
 * component is constructed.
 */
export const TENANT_CONTEXT = new InjectionToken<TenantContext | null>('TENANT_CONTEXT');
