import { Injectable, computed, signal, inject } from '@angular/core';
import { ApiClient } from './api-client';

export type SiteSettings = {
  banner?: {
    enabled: boolean;
    leftText: string;
    rightLinks: Array<{ label: string; href: string; enabled: boolean }>;
  };
  hero?: {
    enabled: boolean;
    imageUrl: string | null;
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaHref: string;
  };
  offers?: {
    enabled: boolean;
    items: Array<{ id: string; enabled: boolean; title: string; text: string }>;
  };
  contact?: { email?: string | null; phone?: string | null; address?: string | null };
  footer?: {
    enabled: boolean;
    brand: string;
    tagline: string;
    links: Array<{ label: string; href: string }>;
  };
};

const DEFAULTS: Required<Pick<SiteSettings, 'banner' | 'hero' | 'offers' | 'footer' | 'contact'>> = {
  banner: {
    enabled: true,
    leftText: 'Free Shipping on orders over $200*',
    rightLinks: [
      { label: 'FAQ', href: '#', enabled: true },
      { label: 'Support', href: '#', enabled: true }
    ]
  },
  hero: {
    enabled: true,
    imageUrl: null,
    title: 'ORIGINAL\nNORDIC DESIGN',
    subtitle: 'Discover the latest pieces from our catalog. Crafted for everyday use, designed to last.',
    ctaLabel: 'Shop Now',
    ctaHref: '/products'
  },
  offers: {
    enabled: true,
    items: [
      { id: 'offer-1', enabled: true, title: 'New', text: 'Fresh arrivals every week' },
      { id: 'offer-2', enabled: true, title: 'Sale', text: 'Limited-time offers' },
      { id: 'offer-3', enabled: true, title: 'Bundle', text: 'Save on curated sets' }
    ]
  },
  contact: { email: null, phone: null, address: null },
  footer: {
    enabled: true,
    brand: 'CasStore',
    tagline: 'Modern ecommerce starter (Angular + Firebase)',
    links: [
      { label: 'Products', href: '/products' },
      { label: 'Account', href: '/account' }
    ]
  }
};

@Injectable({ providedIn: 'root' })
export class SiteSettingsService {
  private api = inject(ApiClient);

  status = signal<'idle' | 'loading' | 'error'>('idle');
  error = signal<string | null>(null);
  private settings = signal<SiteSettings | null>(null);

  value = computed<SiteSettings>(() => {
    const s = this.settings() ?? {};
    return {
      banner: s.banner ?? DEFAULTS.banner,
      hero: s.hero ?? DEFAULTS.hero,
      offers: s.offers ?? DEFAULTS.offers,
      contact: s.contact ?? DEFAULTS.contact,
      footer: s.footer ?? DEFAULTS.footer
    };
  });

  async load() {
    this.status.set('loading');
    this.error.set(null);
    try {
      const json = await this.api.get<{ ok: true; settings: SiteSettings | null }>('siteSettings');
      this.settings.set(json.settings ?? null);
      this.status.set('idle');
    } catch (e: any) {
      this.status.set('error');
      this.error.set(e?.message ?? String(e));
      this.settings.set(null);
    }
  }

  async adminLoad() {
    this.status.set('loading');
    this.error.set(null);
    try {
      const json = await this.api.get<{ ok: true; settings: SiteSettings | null }>('adminSiteSettingsGet', undefined, { auth: true });
      this.settings.set(json.settings ?? null);
      this.status.set('idle');
    } catch (e: any) {
      this.status.set('error');
      this.error.set(e?.message ?? String(e));
      throw e;
    }
  }

  async adminUpdate(patch: Partial<SiteSettings>) {
    await this.api.post('adminSiteSettingsUpdate', patch, { auth: true });
    await this.adminLoad();
  }
}



