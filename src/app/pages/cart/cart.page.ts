import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

import { CartService } from '../../core/cart.service';
import { ApiClient } from '../../core/api-client';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Cart</h1>
        <p class="text-sm text-slate-600">Your current cart items.</p>
      </div>

      <a
        routerLink="/checkout"
        class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
      >
        Checkout
      </a>
    </div>

    @if (!firebaseConfigured()) {
      <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <div class="font-semibold">Firebase is not configured yet.</div>
        <div class="text-amber-800">
          Add your Firebase Web config in <code class="font-mono">casStore/src/environments/environment.ts</code> to enable live cart.
        </div>
      </div>
    } @else {
      @if (status() === 'loading') {
        <div class="space-y-3">
          @for (_ of [1,2,3]; track _) {
            <div class="h-20 animate-pulse rounded-xl border border-slate-200 bg-white"></div>
          }
        </div>
      } @else if (status() === 'error') {
        <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          Failed to load cart. {{ error() ?? '' }}
          <div class="mt-2 text-xs text-red-800">
            (If you’re not signed in, Data Connect may reject this request.)
          </div>
        </div>
      } @else {
        @if (cartItems().length === 0) {
          <div class="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">Your cart is empty.</div>
        } @else {
          <div class="space-y-3">
            @for (item of cartItems(); track item.id) {
              <div class="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
                <div class="min-w-0">
                  <div class="truncate font-semibold">{{ item.productName }}</div>
                  <div class="text-sm text-slate-600">
                    Qty: {{ item.quantity }} · Price: \${{ item.price.toFixed(2) }}
                  </div>
                </div>
                <div class="font-semibold">
                  \${{ (item.price * item.quantity).toFixed(2) }}
                </div>
              </div>
            }
          </div>
        }
      }
    }
  `
})
export class CartPage {
  private cart = inject(CartService);
  private api = inject(ApiClient);
  firebaseConfigured = computed(() => Boolean(environment.firebase?.apiKey));

  status = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  error = signal<string | null>(null);
  cartItems = signal<Array<{ id: string; quantity: number; productName: string; price: number }>>([]);

  constructor() {
    if (this.firebaseConfigured()) {
      void this.load();
    }
  }

  private async load() {
    this.status.set('loading');
    this.error.set(null);
    try {
      const json = await this.api.get<{
        ok: true;
        items: Array<{ productId: string; quantity: number; name: string; priceCents: number; currency: string }>;
      }>('cartGet', undefined, { auth: true });

      // Keep CartService in sync as a local cache for "Add to cart" UX.
      this.cart.lines.set(json.items.map((i) => ({ productId: i.productId, quantity: i.quantity })));

      const items = json.items.map((i) => ({
        id: i.productId,
        quantity: i.quantity,
        productName: i.name,
        price: (Number(i.priceCents ?? 0) || 0) / 100
      }));
      this.cartItems.set(items);
      this.status.set('success');
    } catch (e: any) {
      this.status.set('error');
      this.error.set(e?.message ?? String(e));
    }
  }
}


