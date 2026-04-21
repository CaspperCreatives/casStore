import {
  Component,
  HostListener,
  computed,
  inject,
  input,
  signal
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ArrowLeft,
  ArrowRight,
  LucideAngularModule,
  Menu,
  Package,
  ShoppingCart,
  Sparkles,
  User
} from 'lucide-angular';

// Real section components — the exact same ones the store dashboard uses.
import { BannerSectionComponent } from '../store/sections/banner-section.component';
import { HeroSectionComponent } from '../store/sections/hero-section.component';
import { HeroSliderSectionComponent } from '../store/sections/hero-slider-section.component';
import { ImageTextSectionComponent } from '../store/sections/image-text-section.component';
import { GallerySectionComponent } from '../store/sections/gallery-section.component';
import { NewsletterSectionComponent } from '../store/sections/newsletter-section.component';
import { TestimonialsSectionComponent } from '../store/sections/testimonials-section.component';
import { CategoryGridSectionComponent } from '../store/sections/category-grid-section.component';
import { CtaSectionComponent } from '../store/sections/cta-section.component';
import { LogosSectionComponent } from '../store/sections/logos-section.component';
import { PromoCardsSectionComponent } from '../store/sections/promo-cards-section.component';
import { ValuePropsSectionComponent } from '../store/sections/value-props-section.component';
import { RichTextSectionComponent } from '../store/sections/rich-text-section.component';

import { FeaturedProductsConfig, StoreSection } from '../../core/store.service';
import { StoreProduct } from '../../core/store-products.service';
import { DEMO_STORES, DemoStore, findDemoStore } from './demo-stores';

/**
 * Demo-only twin of FeaturedProductsSectionComponent — takes products in
 * directly instead of fetching from the API (the real one loads by storeId
 * via StoreProductsService, which has no backing for our demo stores).
 *
 * Visually identical — same grid, same skeletons, same price formatting.
 */
@Component({
  selector: 'app-demo-featured-products',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <section class="mx-auto max-w-7xl px-6 py-12">
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-2xl font-bold tracking-tight text-slate-900">{{ cfg().title || 'Featured products' }}</h2>
        <a href="#" class="text-sm font-semibold text-slate-600 hover:text-slate-900">View all &rarr;</a>
      </div>

      @if (displayed().length === 0) {
        <div class="rounded-3xl border border-dashed border-slate-300 py-16 text-center">
          <lucide-angular [img]="PackageIcon" class="mx-auto h-12 w-12 text-slate-300" />
          <p class="mt-3 text-sm text-slate-500">No products yet.</p>
        </div>
      } @else {
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          @for (p of displayed(); track p.id) {
            <a href="#"
              class="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition-shadow hover:shadow-md">
              <div class="aspect-square overflow-hidden bg-slate-100">
                @if (p.imageUrl) {
                  <img [src]="p.imageUrl" [alt]="p.name"
                    class="h-full w-full object-cover transition-transform group-hover:scale-105" />
                } @else {
                  <div class="flex h-full w-full items-center justify-center">
                    <lucide-angular [img]="PackageIcon" class="h-10 w-10 text-slate-300" />
                  </div>
                }
              </div>
              <div class="p-3">
                <div class="truncate text-sm font-semibold text-slate-900">{{ p.name }}</div>
                <div class="mt-1 text-sm font-bold text-slate-900">{{ fmtPrice(p.priceCents, p.currency) }}</div>
              </div>
            </a>
          }
        </div>
      }
    </section>
  `
})
export class DemoFeaturedProductsSectionComponent {
  readonly PackageIcon = Package;

  cfg = input.required<FeaturedProductsConfig>();
  products = input.required<StoreProduct[]>();

  displayed = computed(() => {
    const all = this.products();
    const config = this.cfg();
    if (config.productIds?.length) {
      const byId = new Map(all.map((p) => [p.id, p]));
      return config.productIds
        .map((id) => byId.get(id))
        .filter((p): p is StoreProduct => !!p);
    }
    return all.slice(0, Math.max(1, Math.min(24, config.limit || 8)));
  });

  fmtPrice(cents: number, currency: string) {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format((cents ?? 0) / 100);
    } catch {
      return `$${((cents ?? 0) / 100).toFixed(2)}`;
    }
  }
}

@Component({
  selector: 'app-demo-store-page',
  standalone: true,
  imports: [
    RouterLink,
    LucideAngularModule,
    // Real sections
    BannerSectionComponent,
    HeroSectionComponent,
    HeroSliderSectionComponent,
    ImageTextSectionComponent,
    GallerySectionComponent,
    NewsletterSectionComponent,
    TestimonialsSectionComponent,
    CategoryGridSectionComponent,
    CtaSectionComponent,
    LogosSectionComponent,
    PromoCardsSectionComponent,
    ValuePropsSectionComponent,
    RichTextSectionComponent,
    // Demo-only replacement
    DemoFeaturedProductsSectionComponent
  ],
  template: `
    @if (demo(); as d) {
      <div class="min-h-dvh bg-white text-slate-900">
        <!-- Demo banner — always visible so visitors know this is a preview -->
        <div class="sticky top-0 z-40 border-b border-slate-900/10 bg-slate-900 text-white">
          <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-[11px] md:px-6">
            <div class="flex items-center gap-3">
              <a
                routerLink="/demos"
                class="inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.22em] text-white/80 hover:text-white"
              >
                <lucide-angular [img]="ArrowLeftIcon" class="h-3.5 w-3.5" />
                All demos
              </a>
              <span class="hidden text-white/30 sm:inline">·</span>
              <span class="hidden uppercase tracking-[0.22em] text-white/60 sm:inline">
                Live demo — sample store
              </span>
            </div>
            <div class="flex items-center gap-3">
              <span class="hidden text-white/60 sm:inline">
                Built with CasStore sections
              </span>
              <a
                routerLink="/sign-up"
                class="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-900 transition hover:bg-slate-100"
              >
                Create yours
                <lucide-angular [img]="ArrowRightIcon" class="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        <!-- Store header (mimics the real storefront shell) -->
        <header class="sticky top-[38px] z-30 border-b border-slate-200 bg-white/95 backdrop-blur md:top-[42px]">
          <div class="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 md:px-6">
            <div class="flex items-center gap-3">
              @if (d.store.logoUrl) {
                <img [src]="d.store.logoUrl" alt="" class="h-8 w-8 rounded-xl object-cover" />
              } @else {
                <span
                  class="flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold text-white"
                  [style.background]="d.store.themeColor"
                >
                  {{ initial(d.store.name) }}
                </span>
              }
              <a href="#top" (click)="scrollTop($event)" class="text-lg font-bold tracking-tight">{{ d.store.name }}</a>
            </div>

            <nav class="hidden items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 md:flex">
              <a href="#top" (click)="scrollTop($event)" class="hover:text-slate-900">Home</a>
              @for (link of headerLinks(); track link.id) {
                <a href="#" class="hover:text-slate-900">{{ link.label }}</a>
              }
            </nav>

            <div class="flex items-center gap-3">
              <a href="#" class="hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 hover:text-slate-900 sm:block">
                Sign in
              </a>
              <a href="#" class="relative p-1 text-slate-600 hover:text-slate-900" aria-label="Cart">
                <lucide-angular [img]="ShoppingCartIcon" class="h-5 w-5" />
              </a>
            </div>
          </div>
        </header>

        <!-- Sections — rendered with the same components the page editor uses -->
        <main id="top">
          @for (section of d.sections; track section.id) {
            @if (section.visible) {
              @switch (section.type) {
                @case ('banner')           { <app-banner-section            [cfg]="$any(section).config" /> }
                @case ('hero')             { <app-hero-section              [cfg]="$any(section).config" [store]="d.store" /> }
                @case ('heroSlider')       { <app-hero-slider-section       [cfg]="$any(section).config" /> }
                @case ('imageText')        { <app-image-text-section        [cfg]="$any(section).config" /> }
                @case ('gallery')          { <app-gallery-section           [cfg]="$any(section).config" /> }
                @case ('newsletter')       { <app-newsletter-section        [cfg]="$any(section).config" /> }
                @case ('testimonials')     { <app-testimonials-section      [cfg]="$any(section).config" /> }
                @case ('categoryGrid')     { <app-category-grid-section     [cfg]="$any(section).config" [store]="d.store" /> }
                @case ('cta')              { <app-cta-section               [cfg]="$any(section).config" [store]="d.store" /> }
                @case ('logos')            { <app-logos-section             [cfg]="$any(section).config" /> }
                @case ('promoCards')       { <app-promo-cards-section       [cfg]="$any(section).config" /> }
                @case ('valueProps')       { <app-value-props-section       [cfg]="$any(section).config" /> }
                @case ('richText')         { <app-rich-text-section         [cfg]="$any(section).config" /> }
                @case ('featuredProducts') {
                  <app-demo-featured-products
                    [cfg]="$any(section).config"
                    [products]="d.products"
                  />
                }
              }
            }
          }
        </main>

        <!-- Store footer -->
        <footer class="border-t border-slate-200 bg-white px-6 py-8">
          <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-xs text-slate-500 md:flex-row">
            <div>© {{ year() }} {{ d.store.name }}</div>
            @if (footerLinks().length) {
              <div class="flex flex-wrap items-center gap-4">
                @for (link of footerLinks(); track link.id) {
                  <a href="#" class="hover:text-slate-900">{{ link.label }}</a>
                }
              </div>
            }
            <a routerLink="/" class="hover:text-slate-900">Powered by CasStore</a>
          </div>
        </footer>

        <!-- Other demos rail -->
        <aside class="border-t border-slate-200 bg-stone-50 px-4 py-16 md:px-6">
          <div class="mx-auto max-w-7xl">
            <div class="mb-8 flex items-end justify-between gap-4">
              <div>
                <div class="text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-600">More demos</div>
                <h2 class="font-display mt-3 text-2xl font-medium tracking-[-0.01em] text-slate-900 md:text-3xl">
                  Other storefronts you can build
                </h2>
              </div>
              <a
                routerLink="/demos"
                class="hidden text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600 hover:text-slate-900 sm:inline-flex sm:items-center sm:gap-1.5"
              >
                See all
                <lucide-angular [img]="ArrowRightIcon" class="h-3.5 w-3.5" />
              </a>
            </div>

            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              @for (other of otherDemos(); track other.id) {
                <a
                  [routerLink]="['/demos', other.id]"
                  class="group overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200 transition hover:ring-slate-400"
                >
                  <div class="aspect-[4/3]" [style.background]="other.previewBg"></div>
                  <div class="flex items-center justify-between gap-4 p-4">
                    <div>
                      <div class="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                        {{ presetLabel(other.presetId) }}
                      </div>
                      <div class="mt-1 font-display text-lg font-medium tracking-tight text-slate-900">
                        {{ other.store.name }}
                      </div>
                    </div>
                    <lucide-angular
                      [img]="ArrowRightIcon"
                      class="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5"
                    />
                  </div>
                </a>
              }
            </div>
          </div>
        </aside>
      </div>
    } @else {
      <!-- Fallback when the demo id doesn't exist -->
      <div class="flex min-h-dvh flex-col items-center justify-center gap-4 bg-stone-50 px-6 text-center">
        <div class="text-6xl">🧩</div>
        <h1 class="font-display text-3xl font-medium tracking-tight">Demo not found</h1>
        <p class="text-slate-500">This demo store doesn't exist.</p>
        <a
          routerLink="/demos"
          class="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.22em] text-white hover:bg-slate-800"
        >
          <lucide-angular [img]="ArrowLeftIcon" class="h-3.5 w-3.5" />
          All demos
        </a>
      </div>
    }
  `
})
export class DemoStorePage {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly ArrowRightIcon = ArrowRight;
  readonly MenuIcon = Menu;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly SparklesIcon = Sparkles;
  readonly UserIcon = User;

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly year = computed(() => new Date().getFullYear());
  readonly demoId = signal<string>('');
  readonly demo = computed<DemoStore | undefined>(() => findDemoStore(this.demoId()));

  readonly headerLinks = computed(() => {
    const items = this.demo()?.store.navItems ?? [];
    return items.filter((i) => i.placement !== 'footer');
  });
  readonly footerLinks = computed(() => {
    const items = this.demo()?.store.navItems ?? [];
    return items.filter((i) => i.placement === 'footer' || i.placement === 'both');
  });

  readonly otherDemos = computed(() =>
    DEMO_STORES.filter((d) => d.id !== this.demoId()).slice(0, 3)
  );

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('demoId') ?? '';
      this.demoId.set(id);
      if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
    });
  }

  /**
   * Intercept clicks inside the demo so internal RouterLinks embedded in the
   * real section components (hero CTA, category tiles, etc.) don't navigate
   * the visitor away from the demo. External links and our explicit opt-outs
   * (routerLink="/demos", routerLink="/sign-up", routerLink="/") are let through.
   */
  @HostListener('click', ['$event'])
  onDocClick(ev: MouseEvent) {
    if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) {
      return;
    }
    const anchor = (ev.target as HTMLElement | null)?.closest('a') as HTMLAnchorElement | null;
    if (!anchor) return;

    // Allow our explicit CasStore navigation (banner/footer escape hatches).
    if (anchor.dataset['demoNav'] === 'allow') return;

    const href = anchor.getAttribute('href') ?? '';
    const routerLinkAttr = anchor.getAttribute('ng-reflect-router-link');

    // Allow only known-safe RouterLinks: anything pointing at /demos* or /sign-up or /.
    if (routerLinkAttr && /^(\/demos|\/sign-up|\/)$/.test(routerLinkAttr.split(',')[0] ?? '')) {
      return;
    }

    // New tab / external absolute links — let them through.
    if (anchor.target === '_blank') return;
    if (/^https?:\/\//i.test(href)) return;

    // Plain `#` anchors or in-page hashes — let the browser handle it.
    if (href.startsWith('#')) return;

    // Otherwise this is a storefront-internal RouterLink (/cart, /products,
    // /store/<slug>/...) that would eject the visitor from the demo frame.
    ev.preventDefault();
    ev.stopPropagation();
  }

  scrollTop(ev: Event) {
    ev.preventDefault();
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  initial(name: string) {
    return (name || '?').trim().charAt(0).toUpperCase();
  }

  presetLabel(id: DemoStore['presetId']): string {
    switch (id) {
      case 'brand': return 'Brand story';
      case 'retail': return 'Retail';
      case 'launch': return 'Product launch';
      case 'minimal': return 'Minimal';
      case 'full': return 'Everything';
    }
  }
}

/** Export demo data for use by other pages (e.g. the demos index, landing rail). */
export { DEMO_STORES, findDemoStore } from './demo-stores';
