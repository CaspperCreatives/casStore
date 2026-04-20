import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store, StoreService } from '../../core/store.service';
import { StoreProduct, StoreProductsService } from '../../core/store-products.service';
import { StoreOrdersService } from '../../core/store-orders.service';
import { AuthService } from '../../core/auth.service';
import { LucideAngularModule, Minus, Package, Plus, ShoppingCart } from 'lucide-angular';

@Component({
  selector: 'app-store-product-page',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  template: `
    <div class="mx-auto max-w-5xl px-6 py-8">
      <a [routerLink]="['/store', storeSlug(), 'products']" class="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        ← Back to products
      </a>

      @if (loading()) {
        <div class="grid gap-8 md:grid-cols-2">
          <div class="aspect-square animate-pulse rounded-3xl bg-slate-100"></div>
          <div class="space-y-4 pt-4">
            <div class="h-8 w-3/4 animate-pulse rounded-xl bg-slate-100"></div>
            <div class="h-4 w-1/3 animate-pulse rounded-xl bg-slate-100"></div>
            <div class="h-24 animate-pulse rounded-xl bg-slate-100"></div>
          </div>
        </div>
      } @else if (!product()) {
        <div class="rounded-3xl border border-dashed border-slate-300 py-16 text-center">
          <lucide-angular [img]="PackageIcon" class="mx-auto h-12 w-12 text-slate-300" />
          <p class="mt-3 text-sm text-slate-500">Product not found.</p>
          <a [routerLink]="['/store', storeSlug(), 'products']" class="mt-4 inline-block text-sm font-semibold text-slate-900 hover:underline">
            Browse products
          </a>
        </div>
      } @else {
        <div class="grid gap-10 md:grid-cols-2">
          <!-- Image -->
          <div class="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 aspect-square">
            @if (product()!.imageUrl) {
              <img [src]="product()!.imageUrl" [alt]="product()!.name" class="h-full w-full object-cover"
                (error)="$any($event.target).style.display='none'" />
            } @else {
              <div class="flex h-full w-full items-center justify-center">
                <lucide-angular [img]="PackageIcon" class="h-16 w-16 text-slate-300" />
              </div>
            }
          </div>

          <!-- Details -->
          <div class="flex flex-col justify-start pt-2">
            @if (product()!.category) {
              <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{{ product()!.category }}</div>
            }
            <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">{{ product()!.name }}</h1>
            <div class="mt-3 text-2xl font-bold text-slate-900">{{ fmtPrice(product()!.priceCents, product()!.currency) }}</div>

            <p class="mt-4 text-sm leading-relaxed text-slate-600">{{ product()!.description }}</p>

            @if (product()!.stock <= 0) {
              <div class="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">Out of stock</div>
            } @else if (product()!.stock < 5) {
              <div class="mt-4 text-xs font-semibold text-amber-600">Only {{ product()!.stock }} left in stock</div>
            }

            <!-- Quantity + Add to cart -->
            <div class="mt-8 flex items-center gap-4 flex-col md:flex-row">
              <div class="flex items-center rounded-2xl border border-slate-200 bg-slate-50 w-full md:w-auto justify-evenly items-center">
                <button type="button" class="flex h-10 w-10 items-center justify-center rounded-l-2xl hover:bg-slate-100"
                  (click)="qty.set(Math.max(1, qty() - 1))">
                  <lucide-angular [img]="MinusIcon" class="h-4 w-4 text-slate-600" />
                </button>
                <span class="min-w-[2.5rem] text-center text-sm font-semibold">{{ qty() }}</span>
                <button type="button" class="flex h-10 w-10 items-center justify-center rounded-r-2xl hover:bg-slate-100"
                  (click)="qty.set(Math.min(product()!.stock, qty() + 1))">
                  <lucide-angular [img]="PlusIcon" class="h-4 w-4 text-slate-600" />
                </button>
              </div>

              <button
                type="button"
                class="w-full md:w-auto flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
                [disabled]="addingToCart() || product()!.stock <= 0"
                (click)="addToCart()"
              >
                <lucide-angular [img]="ShoppingCartIcon" class="h-4 w-4" />
                {{ addingToCart() ? 'Adding...' : 'Add to cart' }}
              </button>
            </div>

            @if (cartMessage()) {
              <div class="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800">
                {{ cartMessage() }}
              </div>
            }
            @if (cartError()) {
              <div class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800">
                {{ cartError() }}
              </div>
            }

            <a [routerLink]="['/store', storeSlug(), 'cart']"
              class="mt-4 text-center text-sm font-semibold text-slate-600 hover:text-slate-900 hover:underline">
              View cart →
            </a>
          </div>
        </div>
      }
    </div>
  `
})
export class StoreProductPage {
  readonly PackageIcon = Package;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly PlusIcon = Plus;
  readonly MinusIcon = Minus;
  readonly Math = Math;

  private route = inject(ActivatedRoute);
  private storeService = inject(StoreService);
  private productsService = inject(StoreProductsService);
  private ordersService = inject(StoreOrdersService);
  private auth = inject(AuthService);

  storeSlug = signal('');
  productId = signal('');
  product = signal<StoreProduct | null>(null);
  loading = signal(true);
  qty = signal(1);
  addingToCart = signal(false);
  cartMessage = signal<string | null>(null);
  cartError = signal<string | null>(null);

  private activeStore = computed<Store | null>(() =>
    this.storeService.viewingStore() ?? this.storeService.store()
  );
  private loadedKey: string | null = null;

  constructor() {
    const slug = this.route.parent?.snapshot.paramMap.get('storeSlug') ?? '';
    const productId = this.route.snapshot.paramMap.get('productId') ?? '';
    this.storeSlug.set(slug);
    this.productId.set(productId);

    effect(() => {
      const store = this.activeStore();
      const pid = this.productId();
      if (!store || !pid) return;
      const key = `${store.id}:${pid}`;
      if (this.loadedKey === key) return;
      this.loadedKey = key;
      void this.load(store.id, pid);
    });
  }

  private async load(storeId: string, productId: string) {
    this.loading.set(true);
    const p = await this.productsService.getProduct(storeId, productId);
    this.product.set(p);
    this.loading.set(false);
  }

  async addToCart() {
    const store = this.activeStore();
    const p = this.product();
    if (!store || !p) return;
    if (!this.auth.user()) {
      this.cartError.set('Please sign in to add items to cart.');
      return;
    }
    this.addingToCart.set(true);
    this.cartMessage.set(null);
    this.cartError.set(null);
    try {
      await this.ordersService.addToCart(store.id, p.id, this.qty());
      this.cartMessage.set(`${p.name} × ${this.qty()} added to cart`);
      setTimeout(() => this.cartMessage.set(null), 3000);
    } catch (e: any) {
      this.cartError.set(e?.message ?? 'Could not add to cart');
    } finally {
      this.addingToCart.set(false);
    }
  }

  fmtPrice(cents: number, currency: string) {
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(cents / 100); }
    catch { return `$${(cents / 100).toFixed(2)}`; }
  }
}
