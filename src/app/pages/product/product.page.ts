import { Component, DestroyRef, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CartService } from '../../core/cart.service';
import { ApiClient } from '../../core/api-client';
import { environment } from '../../../environments/environment';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, LucideAngularModule, Package, RotateCcw, ShieldCheck, ShoppingCart, Truck } from 'lucide-angular';

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
const DEFAULT_COLLECTION_LABEL = 'DINING ROOM';

const PLACEHOLDER_PRODUCTS: Array<Product> = [
  {
    id: 'placeholder-1',
    name: 'Comfortable Velvet Dining Chair',
    description: 'Elegant velvet upholstery with ergonomic support.',
    imageUrl: PRODUCT_PLACEHOLDER_URL,
    priceCents: 19100,
    currency: 'USD',
    stock: 10
  },
  { id: 'placeholder-2', name: 'Nature Bowl', description: 'Hand-finished bowl in natural tones.', imageUrl: PRODUCT_PLACEHOLDER_URL, priceCents: 35000, currency: 'USD', stock: 10 },
  { id: 'placeholder-3', name: 'Matte Vase', description: 'Soft matte ceramic with clean lines.', imageUrl: PRODUCT_PLACEHOLDER_URL, priceCents: 16000, currency: 'USD', stock: 10 },
  { id: 'placeholder-4', name: 'Cake Plate', description: 'Minimal plate for everyday serving.', imageUrl: PRODUCT_PLACEHOLDER_URL, priceCents: 2500, currency: 'USD', stock: 10 }
];

function placeholderById(id: string): Product | null {
  return PLACEHOLDER_PRODUCTS.find((p) => p.id === id) ?? null;
}

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  template: `
    <div class="mb-10">
      <a
        routerLink="/products"
        class="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 hover:text-slate-900"
      >
        <lucide-angular [img]="ChevronLeftIcon" class="h-4 w-4" />
        Return to collection
      </a>
    </div>

    @if (!firebaseConfigured()) {
      <div class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <div class="font-semibold">Firebase is not configured yet.</div>
        <div class="text-amber-800">
          Add your Firebase Web config in <code class="font-mono">casStore/src/environments/environment.ts</code> to load product details.
        </div>
      </div>
    } @else if (status() === 'loading') {
      <div class="grid gap-8 md:grid-cols-2">
        <div class="aspect-square animate-pulse rounded-xl bg-slate-100"></div>
        <div class="space-y-3">
          <div class="h-8 w-2/3 animate-pulse rounded bg-slate-100"></div>
          <div class="h-4 w-full animate-pulse rounded bg-slate-100"></div>
          <div class="h-4 w-5/6 animate-pulse rounded bg-slate-100"></div>
          <div class="h-10 w-40 animate-pulse rounded bg-slate-100"></div>
        </div>
      </div>
    } @else if (status() === 'error') {
      <div class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
        Failed to load product. {{ error() ?? '' }}
      </div>
    } @else if (!product()) {
      <div class="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
        Product not found.
      </div>
    } @else {
      <div class="grid items-start gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
        <!-- Image -->
        <div
          #imageCard
          class="relative overflow-hidden rounded-[44px] bg-[#dce3df] p-8 shadow-[0_30px_80px_-55px_rgba(15,23,42,0.55)] sm:p-10"
        >
          <div class="aspect-[4/5] w-full">
            <img
              class="h-full w-full object-contain"
              [src]="productImageUrl()"
              [alt]="product()!.name"
              (error)="onImgError($event)"
            />
          </div>
        </div>

        <!-- Copy -->
        <div #copyWrap class="pt-2 lg:pt-8">
          <div
            class="inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white"
          >
            {{ collectionLabel() }}
          </div>

          <h1 class="mt-6 font-serif text-5xl leading-[0.95] tracking-tight text-slate-900 sm:text-6xl">
            {{ product()!.name }}
          </h1>

          <div class="mt-6 font-serif text-4xl font-semibold tracking-tight text-slate-900">
            {{ displayPrice() }}
          </div>

          <p class="mt-6 max-w-xl text-sm leading-7 text-slate-600">
            {{ product()!.description }}
          </p>

          <div class="mt-10">
            <button
              class="group relative inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-950 px-8 py-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-white shadow-[0_18px_40px_-20px_rgba(15,23,42,0.65)] transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              [disabled]="adding() || product()!.stock <= 0"
              (click)="addToCart()"
            >
              <lucide-angular [img]="ShoppingCartIcon" class="h-5 w-5 opacity-95" />
              Add to shopping bag
            </button>

            <div class="mt-4 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              <lucide-angular [img]="PackageIcon" class="h-4 w-4" />
              Complimentary express delivery on all orders
            </div>
          </div>

          <div class="mt-10 border-t border-slate-200 pt-8">
            <div #valueProps class="grid grid-cols-3 gap-6 text-center">
              <div>
                <div class="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 text-slate-700">
                  <lucide-angular [img]="TruckIcon" class="h-5 w-5" />
                </div>
                <div class="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-900">White glove delivery</div>
              </div>
              <div>
                <div class="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 text-slate-700">
                  <lucide-angular [img]="ShieldCheckIcon" class="h-5 w-5" />
                </div>
                <div class="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-900">Lifetime support</div>
              </div>
              <div>
                <div class="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 text-slate-700">
                  <lucide-angular [img]="RotateCcwIcon" class="h-5 w-5" />
                </div>
                <div class="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-900">Concierge returns</div>
              </div>
            </div>

            <div class="mt-4 text-center text-xs text-slate-400">
              @if (product()!.stock > 0) { In stock } @else { Out of stock }
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class ProductPage {
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly PackageIcon = Package;
  readonly TruckIcon = Truck;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly RotateCcwIcon = RotateCcw;

  private route = inject(ActivatedRoute);
  private cart = inject(CartService);
  private api = inject(ApiClient);
  private destroyRef = inject(DestroyRef);

  @ViewChild('imageCard', { static: false }) imageCard?: ElementRef<HTMLElement>;
  @ViewChild('copyWrap', { static: false }) copyWrap?: ElementRef<HTMLElement>;
  @ViewChild('valueProps', { static: false }) valueProps?: ElementRef<HTMLElement>;

  private animationTriggers: ScrollTrigger[] = [];

  firebaseConfigured = computed(() => Boolean(environment.firebase?.apiKey));

  status = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  error = signal<string | null>(null);
  product = signal<Product | null>(null);
  adding = signal(false);

  productImageUrl = computed(() => {
    const url = (this.product()?.imageUrl ?? '').trim();
    return url ? url : PRODUCT_PLACEHOLDER_URL;
  });

  collectionLabel = computed(() => DEFAULT_COLLECTION_LABEL);

  displayPrice = computed(() => {
    const p = this.product();
    if (!p) return '';
    const dollars = p.priceCents / 100;
    const formatted = p.priceCents % 100 === 0 ? String(Math.round(dollars)) : dollars.toFixed(2);
    return `$${formatted}`;
  });

  constructor() {
    const sub = this.route.paramMap.subscribe((pm) => {
      const id = pm.get('id');
      if (!id) return;
      void this.load(id);
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
    this.destroyRef.onDestroy(() => this.cleanupAnimations());
  }

  private async load(id: string) {
    this.status.set('loading');
    this.error.set(null);
    try {
      // Placeholder path: allow the demo catalog to navigate to a product page too.
      if (id.startsWith('placeholder-')) {
        this.product.set(placeholderById(id));
        this.status.set('success');
        this.setupAnimations();
        return;
      }

      if (!this.firebaseConfigured()) {
        this.product.set(null);
        this.status.set('success');
        return;
      }

      // Prefer API-backed fetch so the frontend doesn't require Firestore read permissions.
      const json = await this.api.get<{ ok: true; product: any }>('product', { id });
      const data = json.product ?? {};
      this.product.set({
        id: String(data.id ?? id),
        name: String(data.name ?? ''),
        description: String(data.description ?? ''),
        imageUrl: (data.imageUrl ?? null) as string | null,
        priceCents: Number(data.priceCents ?? 0),
        currency: String(data.currency ?? 'USD'),
        stock: Number(data.stock ?? 0)
      });
      this.status.set('success');
      this.setupAnimations();
    } catch (e: any) {
      this.status.set('error');
      this.error.set(e?.message ?? String(e));
    }
  }

  private cleanupAnimations() {
    for (const t of this.animationTriggers) t.kill(true);
    this.animationTriggers = [];

    const image = this.imageCard?.nativeElement;
    const copy = this.copyWrap?.nativeElement;
    const props = this.valueProps?.nativeElement;
    if (image) gsap.killTweensOf(image);
    if (copy) gsap.killTweensOf(copy);
    if (props) {
      gsap.killTweensOf(props);
      gsap.killTweensOf(Array.from(props.children));
    }
  }

  private setupAnimations() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    // Defer until the view updates (template refs exist). Two RAFs helps after async data loads.
    const raf1 = window.requestAnimationFrame(() => {
      const raf2 = window.requestAnimationFrame(() => {
        const image = this.imageCard?.nativeElement;
        const copy = this.copyWrap?.nativeElement;
        const props = this.valueProps?.nativeElement;
        if (!image || !copy) return;

        // Clear any previous triggers/tweens for this component instance (e.g., route param change).
        this.cleanupAnimations();

        const imageTween = gsap.fromTo(
          image,
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power2.out', overwrite: 'auto', paused: true }
        );
        const imageTrigger = ScrollTrigger.create({
          trigger: image,
          start: 'top 80%',
          once: true,
          onEnter: () => imageTween.play(),
          onRefresh: (self: ScrollTrigger) => {
            if (self.progress > 0 || ScrollTrigger.isInViewport(image, 0.15)) imageTween.play();
          }
        });
        this.animationTriggers.push(imageTrigger);

        const copyTween = gsap.fromTo(
          copy,
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power2.out', overwrite: 'auto', paused: true }
        );
        const copyTrigger = ScrollTrigger.create({
          trigger: copy,
          start: 'top 82%',
          once: true,
          onEnter: () => copyTween.play(),
          onRefresh: (self: ScrollTrigger) => {
            if (self.progress > 0 || ScrollTrigger.isInViewport(copy, 0.15)) copyTween.play();
          }
        });
        this.animationTriggers.push(copyTrigger);

        if (props) {
          const items = Array.from(props.children) as HTMLElement[];
          if (items.length) {
            gsap.set(items, { autoAlpha: 0, y: 12 });
            const propsTween = gsap.to(items, {
              autoAlpha: 1,
              y: 0,
              duration: 0.75,
              ease: 'power2.out',
              stagger: 0.08,
              overwrite: 'auto',
              paused: true
            });

            const propsTrigger = ScrollTrigger.create({
              trigger: props,
              start: 'top 88%',
              once: true,
              onEnter: () => propsTween.play(),
              onRefresh: (self: ScrollTrigger) => {
                if (self.progress > 0 || ScrollTrigger.isInViewport(props, 0.2)) propsTween.play();
              }
            });
            this.animationTriggers.push(propsTrigger);
          }
        }

        ScrollTrigger.refresh();
      });

      this.destroyRef.onDestroy(() => window.cancelAnimationFrame(raf2));
    });

    this.destroyRef.onDestroy(() => window.cancelAnimationFrame(raf1));
  }

  addToCart() {
    const id = this.product()?.id;
    if (!id) return;
    if (!this.firebaseConfigured()) return;
    if (this.adding()) return;
    if (String(id).startsWith('placeholder-')) return;
    this.adding.set(true);
    void this.cart
      .add(id, 1)
      .catch((e: any) => console.error(e))
      .finally(() => this.adding.set(false));
  }

  onImgError(e: Event) {
    const img = e.target as HTMLImageElement | null;
    if (!img) return;
    if (img.src.endsWith(PRODUCT_PLACEHOLDER_URL)) return;
    img.src = PRODUCT_PLACEHOLDER_URL;
  }
}


