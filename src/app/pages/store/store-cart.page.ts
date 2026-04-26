import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store, StoreService } from '../../core/store.service';
import { StoreOrdersService } from '../../core/store-orders.service';
import { StoreRouterService } from '../../core/store-router';
import { TENANT_CONTEXT } from '../../core/host-routing';
import { LucideAngularModule, Minus, Plus, Trash2 } from 'lucide-angular';

@Component({
  selector: 'app-store-cart-page',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  template: `
    <div class="mx-auto max-w-3xl px-6 py-8">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Your cart</h1>

      @if (!checkoutEnabled()) {
        <div class="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center">
          <div class="text-4xl">🛒</div>
          <h2 class="mt-3 text-lg font-bold text-amber-900">Checkout is currently unavailable</h2>
          <p class="mt-1 text-sm text-amber-800">This store isn't accepting orders right now. Please check back later.</p>
          <a [routerLink]="productsLink()"
            class="mt-4 inline-block rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
            Browse products
          </a>
        </div>
      } @else if (loading()) {
        <div class="mt-6 space-y-3">
          @for (_ of [1,2,3]; track _) {
            <div class="h-20 animate-pulse rounded-2xl border border-slate-200 bg-white"></div>
          }
        </div>
      } @else if (cartItems().length === 0) {
        <div class="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <div class="text-5xl">🛒</div>
          <p class="mt-3 text-sm text-slate-500">Your cart is empty.</p>
          <a [routerLink]="productsLink()"
            class="mt-4 inline-block rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
            Continue shopping
          </a>
        </div>
      } @else {
        <div class="mt-6 space-y-4">
          @for (item of cartItems(); track item.productId) {
            <div class="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
              @if (item.imageUrl) {
                <img [src]="item.imageUrl" [alt]="item.name" class="h-16 w-16 rounded-xl object-cover border border-slate-200"
                  (error)="$any($event.target).style.display='none'" />
              } @else {
                <div class="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-2xl shrink-0">📦</div>
              }

              <div class="min-w-0 flex-1">
                <div class="font-semibold text-slate-900 truncate">{{ item.name }}</div>
                <div class="mt-0.5 text-sm text-slate-500">{{ fmtPrice(item.priceCents, item.currency) }} each</div>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <div class="flex items-center rounded-xl border border-slate-200 bg-slate-50">
                  <button type="button" class="flex h-8 w-8 items-center justify-center hover:bg-slate-100 rounded-l-xl"
                    [disabled]="updatingId() === item.productId"
                    (click)="setQty(item.productId, item.quantity - 1)">
                    <lucide-angular [img]="MinusIcon" class="h-3.5 w-3.5 text-slate-600" />
                  </button>
                  <span class="min-w-[2rem] text-center text-sm font-semibold">{{ item.quantity }}</span>
                  <button type="button" class="flex h-8 w-8 items-center justify-center hover:bg-slate-100 rounded-r-xl"
                    [disabled]="updatingId() === item.productId"
                    (click)="setQty(item.productId, item.quantity + 1)">
                    <lucide-angular [img]="PlusIcon" class="h-3.5 w-3.5 text-slate-600" />
                  </button>
                </div>

                <div class="w-20 text-right font-semibold text-slate-900">
                  {{ fmtPrice(item.priceCents * item.quantity, item.currency) }}
                </div>

                <button type="button" class="ml-1 rounded-xl p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  [disabled]="updatingId() === item.productId"
                  (click)="setQty(item.productId, 0)">
                  <lucide-angular [img]="Trash2Icon" class="h-4 w-4" />
                </button>
              </div>
            </div>
          }

          <!-- Summary -->
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div class="flex items-center justify-between text-sm">
              <span class="text-slate-600">Subtotal ({{ totalQty() }} item{{ totalQty() !== 1 ? 's' : '' }})</span>
              <span class="font-bold text-slate-900">{{ totalPrice() }}</span>
            </div>
            <p class="mt-1 text-[11px] text-slate-400">Shipping and taxes calculated at checkout.</p>
          </div>

          <a
            [routerLink]="checkoutLink()"
            class="block w-full rounded-2xl bg-slate-900 px-6 py-3.5 text-center text-sm font-bold text-white hover:bg-slate-800"
          >
            Proceed to checkout
          </a>
          <a [routerLink]="productsLink()"
            class="block text-center text-sm text-slate-500 hover:text-slate-900">
            ← Continue shopping
          </a>
        </div>
      }

      @if (error()) {
        <div class="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{{ error() }}</div>
      }
    </div>
  `
})
export class StoreCartPage {
  readonly MinusIcon = Minus;
  readonly PlusIcon = Plus;
  readonly Trash2Icon = Trash2;

  private route = inject(ActivatedRoute);
  private storeService = inject(StoreService);
  private ordersService = inject(StoreOrdersService);
  private storeRouter = inject(StoreRouterService);
  private tenant = inject(TENANT_CONTEXT, { optional: true });

  storeSlug = signal('');
  cartItems = this.ordersService.cartItems;
  loading = signal(false);
  updatingId = signal<string | null>(null);
  error = signal<string | null>(null);

  productsLink = computed(() => this.storeRouter.link(['products']));
  checkoutLink = computed(() => this.storeRouter.link(['checkout']));
  checkoutEnabled = computed(() => this.activeStore()?.checkoutEnabled !== false);

  totalQty = computed(() => this.cartItems().reduce((s, i) => s + i.quantity, 0));
  totalPrice = computed(() => {
    const items = this.cartItems();
    if (!items.length) return '$0.00';
    const currency = items[0].currency;
    const total = items.reduce((s, i) => s + i.priceCents * i.quantity, 0);
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(total / 100); }
    catch { return `$${(total / 100).toFixed(2)}`; }
  });

  private activeStore = computed<Store | null>(() =>
    this.storeService.viewingStore() ?? this.storeService.store()
  );
  private loadedStoreId: string | null = null;

  constructor() {
    const slug = this.tenant?.slug ?? this.route.parent?.snapshot.paramMap.get('storeSlug') ?? '';
    this.storeSlug.set(slug);

    effect(() => {
      const store = this.activeStore();
      if (!store) return;
      if (this.loadedStoreId === store.id) return;
      this.loadedStoreId = store.id;
      void this.loadCart(store.id);
    });
  }

  private async loadCart(storeId: string) {
    this.loading.set(true);
    try {
      await this.ordersService.loadCart(storeId);
    } catch (e: any) {
      this.error.set(e?.message ?? String(e));
    } finally {
      this.loading.set(false);
    }
  }

  async setQty(productId: string, qty: number) {
    const store = this.activeStore();
    if (!store) return;
    this.updatingId.set(productId);
    this.error.set(null);
    try {
      await this.ordersService.setCartItem(store.id, productId, qty);
    } catch (e: any) {
      this.error.set(e?.message ?? String(e));
    } finally {
      this.updatingId.set(null);
    }
  }

  fmtPrice(cents: number, currency: string) {
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(cents / 100); }
    catch { return `$${(cents / 100).toFixed(2)}`; }
  }
}
