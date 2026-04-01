import { Component, DestroyRef, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { CartService } from '../../core/cart.service';
import { ApiClient } from '../../core/api-client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type Product = {
  id: string;
  name: string;
  description: string;
  imageUrl?: string | null;
  priceCents: number;
  currency: string;
  stock: number;
};

const PRODUCT_PLACEHOLDER_URL = '/placeholders/product.svg';

const PLACEHOLDER_PRODUCTS: Array<Product> = [
  { id: 'placeholder-1', name: 'Nature Bowl', description: 'Hand-finished bowl in natural tones.', imageUrl: PRODUCT_PLACEHOLDER_URL, priceCents: 35000, currency: 'USD', stock: 10 },
  { id: 'placeholder-2', name: 'Matte Vase', description: 'Soft matte ceramic with clean lines.', imageUrl: PRODUCT_PLACEHOLDER_URL, priceCents: 16000, currency: 'USD', stock: 10 },
  { id: 'placeholder-3', name: 'Cake Plate', description: 'Minimal plate for everyday serving.', imageUrl: PRODUCT_PLACEHOLDER_URL, priceCents: 2500, currency: 'USD', stock: 10 },
  { id: 'placeholder-4', name: 'Matte Mug', description: 'A balanced mug with smooth handle.', imageUrl: PRODUCT_PLACEHOLDER_URL, priceCents: 2450, currency: 'USD', stock: 10 },
  { id: 'placeholder-5', name: 'Soft Plate', description: 'Neutral palette, gentle curve.', imageUrl: PRODUCT_PLACEHOLDER_URL, priceCents: 4600, currency: 'USD', stock: 10 },
  { id: 'placeholder-6', name: 'Stone Bowl', description: 'Textured finish, durable ceramic.', imageUrl: PRODUCT_PLACEHOLDER_URL, priceCents: 5200, currency: 'USD', stock: 10 },
  { id: 'placeholder-7', name: 'Serving Board', description: 'Solid wood board with handle.', imageUrl: PRODUCT_PLACEHOLDER_URL, priceCents: 6900, currency: 'USD', stock: 10 },
  { id: 'placeholder-8', name: 'Minimal Vase', description: 'Simple silhouette, modern form.', imageUrl: PRODUCT_PLACEHOLDER_URL, priceCents: 12000, currency: 'USD', stock: 10 }
];

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="mb-8 flex items-end justify-between gap-6">
      <div>
        <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Shop</div>
        <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Products</h1>
        <p class="mt-3 text-sm text-slate-600">Browse the catalog and add items to your cart.</p>
      </div>

      <a routerLink="/cart" class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600 hover:text-slate-900">
        View cart
      </a>
    </div>

    @if (notice()) {
      <div class="mb-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        {{ notice() }}
      </div>
    }

    @if (status() === 'loading') {
      <div class="grid grid-cols-2 gap-8 md:grid-cols-4">
        @for (_ of [1,2,3,4,5,6,7,8]; track _) {
          <div class="h-[340px] animate-pulse rounded-lg bg-slate-100"></div>
        }
      </div>
    } @else {
      <div #productsGrid class="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4">
        @for (p of displayProducts(); track p.id) {
          <div class="group">
            <a [routerLink]="productLink(p)" class="block">
              <div class="aspect-square w-full overflow-hidden bg-slate-50">
                <img
                  class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  [src]="productImageUrl(p)"
                  [alt]="p.name"
                  loading="lazy"
                  (error)="onImgError($event)"
                />
              </div>
              <div class="mt-4 text-center">
                <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-900">{{ p.name }}</div>
                <div class="mt-2 text-[11px] text-slate-500">\${{ (p.priceCents / 100).toFixed(2) }}</div>
              </div>
            </a>

            <div class="mt-4 flex items-center justify-center gap-3">
              <button
                class="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                [disabled]="adding() || isPlaceholder(p)"
                (click)="add(p.id)"
              >
                Add to cart
              </button>
            </div>
          </div>
        }
      </div>
    }
  `
})
export class ProductsPage {
  private cart = inject(CartService);
  private api = inject(ApiClient);
  private destroyRef = inject(DestroyRef);

  @ViewChild('productsGrid', { static: false }) productsGrid?: ElementRef<HTMLElement>;

  firebaseConfigured = computed(() => Boolean(environment.firebase?.apiKey));
  notice = signal<string | null>(null);

  status = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  error = signal<string | null>(null);
  products = signal<Array<Product>>([]);
  displayProducts = computed(() => (this.products().length ? this.products() : PLACEHOLDER_PRODUCTS));

  adding = signal(false);

  constructor() {
    if (this.firebaseConfigured()) {
      void this.load();
    } else {
      this.notice.set('Showing placeholder products. Configure Firebase to load your real catalog.');
      this.status.set('success');
      this.products.set([]);
      this.setupGridAnimations();
    }
  }

  private async load() {
    this.status.set('loading');
    this.error.set(null);
    try {
      const json = await this.api.get<{ ok: true; products: Array<any> }>('products');
      const items: Product[] = (json.products ?? [])
        .map((data: any) => {
          return {
            id: String(data.id ?? ''),
            name: String(data.name ?? ''),
            description: String(data.description ?? ''),
            imageUrl: (data.imageUrl ?? null) as string | null,
            priceCents: Number(data.priceCents ?? 0),
            currency: String(data.currency ?? 'USD'),
            stock: Number(data.stock ?? 0)
          };
        })
        .filter((p) => Boolean(p.id) && Boolean(p.name));
      this.products.set(items);
      this.status.set('success');
      this.notice.set(items.length ? null : 'No products found. Showing placeholder products until you add catalog data.');
      this.setupGridAnimations();
    } catch (e: any) {
      this.error.set(e?.message ?? String(e));
      this.notice.set('Could not load catalog data. Showing placeholder products.');
      this.products.set([]);
      this.status.set('success');
      this.setupGridAnimations();
    }
  }

  private setupGridAnimations() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const raf = window.requestAnimationFrame(() => {
      const grid = this.productsGrid?.nativeElement;
      if (!grid) return;

      const cards = Array.from(grid.children) as HTMLElement[];
      const toAnimate = cards.filter((el) => el.dataset['animated'] !== '1');
      if (!toAnimate.length) return;

      gsap.set(toAnimate, { autoAlpha: 0, y: 18 });

      ScrollTrigger.batch(toAnimate, {
        start: 'top 85%',
        once: true,
        onEnter: (batch: Element[]) => {
          gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.75, ease: 'power2.out', stagger: 0.06 });
          for (const el of batch as HTMLElement[]) el.dataset['animated'] = '1';
        }
      });

      ScrollTrigger.refresh();
    });

    this.destroyRef.onDestroy(() => window.cancelAnimationFrame(raf));
    this.destroyRef.onDestroy(() => ScrollTrigger.getAll().forEach((t: ScrollTrigger) => t.kill()));
  }

  productImageUrl(p: Product) {
    const url = (p.imageUrl ?? '').trim();
    return url ? url : PRODUCT_PLACEHOLDER_URL;
  }

  onImgError(e: Event) {
    const img = e.target as HTMLImageElement | null;
    if (!img) return;
    if (img.src.endsWith(PRODUCT_PLACEHOLDER_URL)) return;
    img.src = PRODUCT_PLACEHOLDER_URL;
  }

  isPlaceholder(p: Product) {
    return String(p.id).startsWith('placeholder-');
  }

  productLink(p: Product) {
    return ['/products', p.id];
  }

  add(productId: string) {
    if (!this.firebaseConfigured()) return;
    if (String(productId).startsWith('placeholder-')) return;
    if (this.adding()) return;
    this.adding.set(true);
    void this.cart
      .add(productId, 1)
      .catch((e: any) => {
        // For now, surface error in console; we’ll add toasts later.
        console.error(e);
      })
      .finally(() => this.adding.set(false));
  }
}


