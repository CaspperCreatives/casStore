import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { CartService } from '../../core/cart.service';
import { ApiClient } from '../../core/api-client';
import { LucideAngularModule, Minus, Plus, Trash2 } from 'lucide-angular';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  template: `
    <div class="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Cart</h1>
        <p class="text-sm text-slate-600">Your current cart items.</p>
      </div>
      @if (cartItems().length > 0) {
        <a routerLink="/checkout"
          class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          Checkout
        </a>
      }
    </div>

    @if (!firebaseConfigured()) {
      <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <div class="font-semibold">Firebase is not configured yet.</div>
        <div class="text-amber-800">
          Add your Firebase Web config in <code class="font-mono">src/environments/environment.ts</code> to enable live cart.
        </div>
      </div>
    } @else {
      @if (status() === 'loading' && cartItems().length === 0) {
        <div class="space-y-3">
          @for (_ of [1,2,3]; track _) {
            <div class="h-20 animate-pulse rounded-xl border border-slate-200 bg-white"></div>
          }
        </div>
      } @else if (status() === 'error') {
        <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          Failed to load cart: {{ error() }}
        </div>
      } @else {
        @if (cartItems().length === 0) {
          <div class="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-600">
            <div class="text-4xl">🛒</div>
            <p class="mt-2">Your cart is empty.</p>
            <a routerLink="/products" class="mt-3 inline-block text-sm font-semibold text-slate-900 hover:underline">Browse products →</a>
          </div>
        } @else {
          <div class="space-y-3">
            @for (item of cartItems(); track item.id) {
              <div class="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
                <div class="min-w-0 flex-1">
                  <div class="truncate font-semibold text-slate-900">{{ item.productName }}</div>
                  <div class="mt-0.5 text-sm text-slate-500">{{ fmtPrice(item.price) }} each</div>
                </div>

                <!-- Quantity controls -->
                <div class="flex items-center gap-2 shrink-0">
                  <div class="flex items-center rounded-xl border border-slate-200 bg-slate-50">
                    <button type="button"
                      class="flex h-8 w-8 items-center justify-center rounded-l-xl hover:bg-slate-100 disabled:opacity-40"
                      [disabled]="updatingId() === item.id"
                      (click)="setQty(item.id, item.quantity - 1)">
                      <lucide-angular [img]="MinusIcon" class="h-3.5 w-3.5 text-slate-600" />
                    </button>
                    <span class="min-w-[2rem] text-center text-sm font-semibold">{{ item.quantity }}</span>
                    <button type="button"
                      class="flex h-8 w-8 items-center justify-center rounded-r-xl hover:bg-slate-100 disabled:opacity-40"
                      [disabled]="updatingId() === item.id"
                      (click)="setQty(item.id, item.quantity + 1)">
                      <lucide-angular [img]="PlusIcon" class="h-3.5 w-3.5 text-slate-600" />
                    </button>
                  </div>

                  <div class="w-20 text-right font-semibold text-slate-900">
                    {{ fmtPrice(item.price * item.quantity) }}
                  </div>

                  <button type="button"
                    class="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    [disabled]="updatingId() === item.id"
                    (click)="setQty(item.id, 0)">
                    <lucide-angular [img]="Trash2Icon" class="h-4 w-4" />
                  </button>
                </div>
              </div>
            }

            <!-- Totals -->
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-600">Subtotal ({{ totalQty() }} item{{ totalQty() !== 1 ? 's' : '' }})</span>
                <span class="font-bold text-slate-900">{{ totalPriceStr() }}</span>
              </div>
            </div>

            <a routerLink="/checkout"
              class="block w-full rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-bold text-white hover:bg-slate-800">
              Proceed to checkout
            </a>
          </div>
        }
      }

      @if (updateError()) {
        <div class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{{ updateError() }}</div>
      }
    }
  `
})
export class CartPage {
  readonly MinusIcon = Minus;
  readonly PlusIcon = Plus;
  readonly Trash2Icon = Trash2;

  private cart = inject(CartService);
  private api = inject(ApiClient);
  firebaseConfigured = computed(() => Boolean(environment.firebase?.apiKey));

  status = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  error = signal<string | null>(null);
  updateError = signal<string | null>(null);
  updatingId = signal<string | null>(null);
  cartItems = signal<Array<{ id: string; quantity: number; productName: string; price: number }>>([]);

  totalQty = computed(() => this.cartItems().reduce((s, i) => s + i.quantity, 0));
  totalPriceStr = computed(() => {
    const total = this.cartItems().reduce((s, i) => s + i.price * i.quantity, 0);
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(total);
  });

  constructor() {
    if (this.firebaseConfigured()) void this.load();
  }

  private async load() {
    this.status.set('loading');
    this.error.set(null);
    try {
      const json = await this.api.get<{
        ok: true;
        items: Array<{ productId: string; quantity: number; name: string; priceCents: number; currency: string }>;
      }>('cartGet', undefined, { auth: true });

      this.cart.lines.set(json.items.map((i) => ({ productId: i.productId, quantity: i.quantity })));
      this.cartItems.set(json.items.map((i) => ({
        id: i.productId,
        quantity: i.quantity,
        productName: i.name,
        price: (Number(i.priceCents ?? 0) || 0) / 100
      })));
      this.status.set('success');
    } catch (e: any) {
      this.status.set('error');
      this.error.set(e?.message ?? String(e));
    }
  }

  async setQty(productId: string, qty: number) {
    this.updatingId.set(productId);
    this.updateError.set(null);
    try {
      const q = Math.max(0, Math.floor(qty));
      await this.api.post('cartSetItem', { productId, quantity: q }, { auth: true });
      // Optimistic update
      if (q === 0) {
        this.cartItems.update((items) => items.filter((i) => i.id !== productId));
        this.cart.lines.update((lines) => lines.filter((l) => l.productId !== productId));
      } else {
        this.cartItems.update((items) => items.map((i) => i.id === productId ? { ...i, quantity: q } : i));
        this.cart.lines.update((lines) => lines.map((l) => l.productId === productId ? { ...l, quantity: q } : l));
      }
    } catch (e: any) {
      this.updateError.set(e?.message ?? String(e));
      await this.load();
    } finally {
      this.updatingId.set(null);
    }
  }

  fmtPrice(price: number) {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(price);
  }
}
