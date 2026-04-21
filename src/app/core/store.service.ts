import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiClient } from './api-client';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export type HeroHeightMode = 'sm' | 'md' | 'lg' | 'full' | 'custom';
export type HeroVerticalAlignment = 'top' | 'center' | 'bottom';

export type HeroConfig = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaTarget: 'products' | 'url';
  ctaUrl: string;
  backgroundImageUrl: string;
  backgroundOverlay: number;
  alignment: 'left' | 'center' | 'right';
  verticalAlignment: HeroVerticalAlignment;
  /** Presets (sm/md/lg), 'full' = 100vh, 'custom' = use heightVh */
  height: HeroHeightMode;
  /** Viewport-height percentage (10-100). Only applied when height === 'custom'. */
  heightVh: number;
};

export type BannerConfig = {
  text: string;
  ctaLabel: string;
  ctaUrl: string;
  background: string;
};

export type FeaturedProductsConfig = {
  title: string;
  productIds: string[];
  limit: number;
  layout: 'grid' | 'carousel';
};

export type ImageTextConfig = {
  title: string;
  body: string;
  imageUrl: string;
  imagePosition: 'left' | 'right';
};

export type GalleryImage = { url: string; caption: string; linkUrl: string };
export type GalleryConfig = {
  title: string;
  images: GalleryImage[];
};

export type NewsletterConfig = {
  title: string;
  subtitle: string;
  buttonLabel: string;
};

export type Testimonial = { quote: string; author: string; role: string; avatarUrl: string };
export type TestimonialsConfig = {
  title: string;
  items: Testimonial[];
};

export type CategoryGridItem = { label: string; imageUrl: string; productFilter: string };
export type CategoryGridConfig = {
  title: string;
  categories: CategoryGridItem[];
};

export type CtaConfig = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaUrl: string;
  backgroundImageUrl: string;
};

export type HeroSlide = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaUrl: string;
  imageUrl: string;
  backgroundOverlay: number;
  alignment: 'left' | 'center' | 'right';
};
export type HeroSliderConfig = {
  slides: HeroSlide[];
  autoPlay: boolean;
  intervalMs: number;
  height: HeroHeightMode;
  /** Viewport-height percentage (10-100). Only applied when height === 'custom'. */
  heightVh: number;
  verticalAlignment: HeroVerticalAlignment;
};

export type LogoItem = { label: string; imageUrl: string; linkUrl: string };
export type LogosConfig = {
  title: string;
  subtitle: string;
  items: LogoItem[];
  style: 'muted' | 'full';
  /** Logo image size in px (height). Defaults to 32. */
  logoSize?: number;
  /** Label font size in px. Defaults to 11. */
  labelSize?: number;
  /** Direction between logo image and label. Defaults to 'horizontal'. */
  itemLayout?: 'horizontal' | 'vertical';
};

export type PromoCard = { label: string; title: string; description: string; ctaUrl: string; icon: string };
export type PromoCardsConfig = {
  title: string;
  cards: PromoCard[];
  columns: 2 | 3 | 4;
};

export type ValueProp = { icon: string; title: string; description: string };
export type ValuePropsConfig = {
  title: string;
  items: ValueProp[];
  background: 'muted' | 'white';
};

export type RichTextConfig = {
  title: string;
  body: string;
  alignment: 'left' | 'center';
  maxWidth: 'narrow' | 'wide';
};

export type SectionType =
  | 'hero'
  | 'banner'
  | 'featuredProducts'
  | 'imageText'
  | 'gallery'
  | 'newsletter'
  | 'testimonials'
  | 'categoryGrid'
  | 'cta'
  | 'heroSlider'
  | 'logos'
  | 'promoCards'
  | 'valueProps'
  | 'richText';

export type StoreSection =
  | { id: string; type: 'hero';             visible: boolean; config: HeroConfig }
  | { id: string; type: 'banner';           visible: boolean; config: BannerConfig }
  | { id: string; type: 'featuredProducts'; visible: boolean; config: FeaturedProductsConfig }
  | { id: string; type: 'imageText';        visible: boolean; config: ImageTextConfig }
  | { id: string; type: 'gallery';          visible: boolean; config: GalleryConfig }
  | { id: string; type: 'newsletter';       visible: boolean; config: NewsletterConfig }
  | { id: string; type: 'testimonials';     visible: boolean; config: TestimonialsConfig }
  | { id: string; type: 'categoryGrid';     visible: boolean; config: CategoryGridConfig }
  | { id: string; type: 'cta';              visible: boolean; config: CtaConfig }
  | { id: string; type: 'heroSlider';       visible: boolean; config: HeroSliderConfig }
  | { id: string; type: 'logos';            visible: boolean; config: LogosConfig }
  | { id: string; type: 'promoCards';       visible: boolean; config: PromoCardsConfig }
  | { id: string; type: 'valueProps';       visible: boolean; config: ValuePropsConfig }
  | { id: string; type: 'richText';         visible: boolean; config: RichTextConfig };

export type NavPlacement = 'header' | 'footer' | 'both';
export type NavItem =
  | { id: string; kind: 'page';    label: string; pageSlug: string; placement?: NavPlacement }
  | { id: string; kind: 'url';     label: string; url: string; newTab: boolean; placement?: NavPlacement }
  | { id: string; kind: 'builtin'; label: string; target: 'products' | 'cart' | 'account'; placement?: NavPlacement };

export type StoreHomeTarget = 'custom' | 'products';

export type Store = {
  id: string;
  ownerId: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  logoUrl: string | null;
  themeColor: string;
  active: boolean;
  /**
   * Controls what renders at the storefront root.
   * - 'custom' (default): the custom page marked `isHome: true`.
   * - 'products': redirect to the products listing page.
   */
  homeTarget?: StoreHomeTarget;
  /** @deprecated Sections now live on per-page docs. Kept for legacy fallback. */
  sections?: StoreSection[];
  navItems?: NavItem[];
};

/** Fallback sections derived from store profile, used when a store has no sections defined. */
export function buildDefaultSections(store: { name: string; description: string }): StoreSection[] {
  return [
    {
      id: 'default-hero',
      type: 'hero',
      visible: true,
      config: {
        title: store.name || 'Welcome',
        subtitle: store.description || '',
        ctaLabel: 'Shop now',
        ctaTarget: 'products',
        ctaUrl: '',
        backgroundImageUrl: '',
        backgroundOverlay: 40,
        alignment: 'center',
        verticalAlignment: 'center',
        height: 'md',
        heightVh: 60
      }
    },
    {
      id: 'default-featured',
      type: 'featuredProducts',
      visible: true,
      config: { title: 'Featured products', productIds: [], limit: 8, layout: 'grid' }
    }
  ];
}

@Injectable({ providedIn: 'root' })
export class StoreService {
  private api = inject(ApiClient);
  private auth = inject(AuthService);

  readonly store = signal<Store | null>(null);
  /** Store currently being viewed publicly (by slug). Independent from owner's `store`. */
  readonly viewingStore = signal<Store | null>(null);
  readonly status = signal<'idle' | 'loading' | 'error'>('idle');
  readonly error = signal<string | null>(null);

  readonly hasStore = computed(() => this.store() !== null);
  readonly storeId = computed(() => this.store()?.id ?? null);
  readonly storeSlug = computed(() => this.store()?.slug ?? null);

  async loadMyStore() {
    this.status.set('loading');
    this.error.set(null);
    try {
      const json = await this.api.get<{ ok: true; store: Store | null }>('storeGet', undefined, { auth: true });
      this.store.set(json.store);
      this.status.set('idle');
      return json.store;
    } catch (e: any) {
      this.status.set('error');
      this.error.set(e?.message ?? String(e));
      return null;
    }
  }

  async loadBySlug(slug: string): Promise<Store | null> {
    try {
      const json = await this.api.get<{ ok: true; store: Store }>('storeGet', { slug });
      this.viewingStore.set(json.store);
      return json.store;
    } catch {
      this.viewingStore.set(null);
      return null;
    }
  }

  /**
   * Loads a store by its subdomain slug (used by the host-routing layer when
   * the app is served from `<slug>.casstore.store`). Backend currently aliases
   * `?subdomain=` to the same `stores.slug` index.
   */
  async loadBySubdomain(slug: string): Promise<Store | null> {
    try {
      const json = await this.api.get<{ ok: true; store: Store }>('storeGet', { subdomain: slug });
      this.viewingStore.set(json.store);
      return json.store;
    } catch {
      this.viewingStore.set(null);
      return null;
    }
  }

  /** Absolute subdomain URL for the given store (e.g. `https://lama.casstore.store`). */
  subdomainUrl(store: Pick<Store, 'slug'>): string {
    return `https://${store.slug}.${environment.rootDomain}`;
  }

  /** Apex (path-based) URL for the given store (e.g. `https://casstore.store/store/lama`). */
  apexUrl(store: Pick<Store, 'slug'>): string {
    return `https://${environment.rootDomain}/store/${store.slug}`;
  }

  async createStore(data: {
    name: string;
    slug: string;
    description?: string;
    category?: string;
    logoUrl?: string;
    themeColor?: string;
  }): Promise<{ storeId: string; slug: string }> {
    const json = await this.api.post<{ ok: true; storeId: string; slug: string }>('storeCreate', data, { auth: true });
    await this.loadMyStore();
    return { storeId: json.storeId, slug: json.slug };
  }

  async updateStore(patch: Partial<Omit<Store, 'id' | 'ownerId' | 'sections'>>) {
    await this.api.patch('storeUpdate', patch, { auth: true });
    await this.loadMyStore();
  }

  /** Replace the ordered sections array on the owner's store. */
  async updateSections(sections: StoreSection[]): Promise<StoreSection[]> {
    const res = await this.api.patch<{ ok: true; sections: StoreSection[] }>('storeUpdateSections', { sections }, { auth: true });
    const curr = this.store();
    if (curr) this.store.set({ ...curr, sections: res.sections });
    return res.sections;
  }

  /** Replace the ordered nav items array on the owner's store. */
  async updateNav(navItems: NavItem[]): Promise<NavItem[]> {
    const res = await this.api.patch<{ ok: true; navItems: NavItem[] }>('storeUpdateNav', { navItems }, { auth: true });
    const curr = this.store();
    if (curr) this.store.set({ ...curr, navItems: res.navItems });
    const view = this.viewingStore();
    if (view) this.viewingStore.set({ ...view, navItems: res.navItems });
    return res.navItems;
  }

  /**
   * Public counter used by the marketing landing page. Returns `{ active, total }`
   * where `active` = currently published stores and `total` = lifetime count.
   * Errors are swallowed so the counter can fall back to a safe default without
   * breaking the page.
   */
  async loadStoresCount(): Promise<{ active: number; total: number }> {
    try {
      const json = await this.api.get<{ ok: true; active: number; total: number }>('storesCount');
      return {
        active: Number(json.active) || 0,
        total: Number(json.total) || 0
      };
    } catch {
      return { active: 0, total: 0 };
    }
  }

  async postAuthDestination(canAccessAdmin: boolean): Promise<string> {
    if (canAccessAdmin) return '/admin';
    const store = await this.loadMyStore();
    return store ? '/my-store' : '/create-store';
  }
}
