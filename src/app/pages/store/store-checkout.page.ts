import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { StoreService } from '../../core/store.service';
import { StoreOrdersService } from '../../core/store-orders.service';
import { ApiClient, ApiClientError } from '../../core/api-client';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-store-checkout-page',
  standalone: true,
  imports: [RouterLink, FormsModule, LucideAngularModule],
  template: `
    <div class="mx-auto max-w-3xl px-6 py-8">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Checkout</h1>

      @if (!isSignedIn()) {
        <div class="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
          <div class="font-semibold">Sign in to complete your order</div>
          <a routerLink="/sign-in" [queryParams]="{ returnUrl: currentUrl() }" class="mt-2 inline-block text-sm font-semibold underline">Sign in →</a>
        </div>
      } @else if (status() === 'success') {
        <div class="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <div class="text-5xl">🎉</div>
          <h2 class="mt-4 text-xl font-bold text-emerald-900">Order placed!</h2>
          <p class="mt-2 text-sm text-emerald-800">
            Your order <strong class="font-mono">{{ orderId() }}</strong> has been created.
          </p>
          <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a routerLink="/account/orders" class="rounded-2xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
              View your orders
            </a>
            <a [routerLink]="['/store', storeSlug(), 'products']"
              class="rounded-2xl border border-emerald-300 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-50">
              Continue shopping
            </a>
          </div>
        </div>
      } @else {
        <div class="mt-6 grid gap-8 lg:grid-cols-5">
          <!-- Form -->
          <form class="space-y-6 lg:col-span-3" (submit)="$event.preventDefault(); placeOrder()">
            <!-- Shipping address -->
            <div class="rounded-3xl border border-slate-200 bg-white p-5">
              <h2 class="font-semibold text-slate-900">Shipping address</h2>
              <div class="mt-4 grid grid-cols-2 gap-4">
                <div class="col-span-2">
                  <label class="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Full name *</label>
                  <input type="text" [(ngModel)]="addr.fullName" name="fullName" required
                    class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white" />
                </div>
                <div class="col-span-2">
                  <label class="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Address line 1 *</label>
                  <input type="text" [(ngModel)]="addr.line1" name="line1" required
                    class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white" />
                </div>
                <div class="col-span-2">
                  <label class="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Address line 2</label>
                  <input type="text" [(ngModel)]="addr.line2" name="line2"
                    class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white" />
                </div>
                <div>
                  <label class="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">City *</label>
                  <input type="text" [(ngModel)]="addr.city" name="city" required
                    class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white" />
                </div>
                <div>
                  <label class="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">State / Province</label>
                  <input type="text" [(ngModel)]="addr.state" name="state"
                    class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white" />
                </div>
                <div>
                  <label class="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Postal code *</label>
                  <input type="text" [(ngModel)]="addr.postalCode" name="postalCode" required
                    class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white" />
                </div>
                <div>
                  <label class="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Country *</label>
                  <input type="text" [(ngModel)]="addr.country" name="country" required placeholder="US"
                    class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white" />
                </div>
              </div>
            </div>

            <!-- Order notes -->
            <div class="rounded-3xl border border-slate-200 bg-white p-5">
              <h2 class="font-semibold text-slate-900">Order notes (optional)</h2>
              <textarea [(ngModel)]="notes" name="notes" rows="3" placeholder="Any special instructions..."
                class="mt-3 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white"></textarea>
            </div>

            @if (status() === 'error') {
              <div class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{{ error() }}</div>
            }

            <button
              type="submit"
              class="w-full rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
              [disabled]="status() === 'loading' || !canSubmit()"
            >
              {{ status() === 'loading' ? 'Placing order...' : 'Place order' }}
            </button>
          </form>

          <!-- Cart summary -->
          <div class="lg:col-span-2">
            <div class="sticky top-4 rounded-3xl border border-slate-200 bg-white p-5">
              <h2 class="font-semibold text-slate-900">Order summary</h2>
              <div class="mt-4 space-y-3">
                @for (item of cartItems(); track item.productId) {
                  <div class="flex items-center justify-between gap-3 text-sm">
                    <div class="min-w-0">
                      <div class="truncate font-semibold text-slate-900">{{ item.name }}</div>
                      <div class="text-xs text-slate-500">× {{ item.quantity }}</div>
                    </div>
                    <div class="shrink-0 font-semibold">{{ fmtPrice(item.priceCents * item.quantity, item.currency) }}</div>
                  </div>
                }
              </div>
              <div class="mt-4 border-t border-slate-200 pt-3 flex justify-between text-sm font-bold text-slate-900">
                <span>Total</span>
                <span>{{ totalPrice() }}</span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class StoreCheckoutPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private storeService = inject(StoreService);
  private ordersService = inject(StoreOrdersService);
  private auth = inject(AuthService);

  storeSlug = signal('');
  cartItems = this.ordersService.cartItems;
  status = signal<'idle' | 'loading' | 'error' | 'success'>('idle');
  error = signal<string | null>(null);
  orderId = signal<string | null>(null);

  isSignedIn = computed(() => Boolean(this.auth.user()));
  currentUrl = computed(() => `/store/${this.storeSlug()}/checkout`);

  addr = { fullName: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: '' };
  notes = '';

  canSubmit = computed(() =>
    this.addr.fullName.trim().length > 0 &&
    this.addr.line1.trim().length > 0 &&
    this.addr.city.trim().length > 0 &&
    this.addr.postalCode.trim().length > 0 &&
    this.addr.country.trim().length > 0 &&
    this.cartItems().length > 0
  );

  totalPrice = computed(() => {
    const items = this.cartItems();
    if (!items.length) return '$0.00';
    const currency = items[0].currency;
    const total = items.reduce((s, i) => s + i.priceCents * i.quantity, 0);
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(total / 100); }
    catch { return `$${(total / 100).toFixed(2)}`; }
  });

  constructor() {
    const slug = this.route.parent?.snapshot.paramMap.get('storeSlug') ?? '';
    this.storeSlug.set(slug);
    if (this.isSignedIn()) {
      const store = this.storeService.store();
      if (store) void this.ordersService.loadCart(store.id).catch(() => {});
    }
  }

  async placeOrder() {
    const store = this.storeService.store();
    if (!store) return;
    this.status.set('loading');
    this.error.set(null);
    try {
      const id = await this.ordersService.checkout({
        storeId: store.id,
        shippingAddress: {
          fullName: this.addr.fullName.trim(),
          line1: this.addr.line1.trim(),
          line2: this.addr.line2.trim() || undefined,
          city: this.addr.city.trim(),
          state: this.addr.state.trim(),
          postalCode: this.addr.postalCode.trim(),
          country: this.addr.country.trim()
        },
        notes: this.notes.trim() || undefined
      });
      this.orderId.set(id);
      this.status.set('success');
    } catch (e: any) {
      this.status.set('error');
      if (e instanceof ApiClientError && e.isAuthError) {
        this.error.set('Your session has expired. Please sign in again.');
        return;
      }
      const msg = String(e?.message ?? e);
      if (msg.includes('empty_cart')) this.error.set('Your cart is empty.');
      else if (msg.includes('out_of_stock')) this.error.set('One or more items are out of stock.');
      else this.error.set(msg);
    }
  }

  fmtPrice(cents: number, currency: string) {
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(cents / 100); }
    catch { return `$${(cents / 100).toFixed(2)}`; }
  }
}
