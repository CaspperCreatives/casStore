import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store, StoreService } from '../../core/store.service';
import { StoreOrdersService } from '../../core/store-orders.service';
import { ApiClientError } from '../../core/api-client';
import { StoreRouterService } from '../../core/store-router';
import { TENANT_CONTEXT } from '../../core/host-routing';
import { TenantCustomerAuthService } from '../../core/tenant-customer-auth.service';
import { LucideAngularModule } from 'lucide-angular';

type CheckoutAddress = {
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

@Component({
  selector: 'app-store-checkout-page',
  standalone: true,
  imports: [RouterLink, FormsModule, LucideAngularModule],
  template: `
    <div class="mx-auto max-w-3xl px-6 py-8">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Checkout</h1>

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
      } @else if (status() === 'success') {
        <div class="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <div class="text-5xl">🎉</div>
          <h2 class="mt-4 text-xl font-bold text-emerald-900">Order placed!</h2>
          <p class="mt-2 text-sm text-emerald-800">
            Your order <strong class="font-mono">{{ orderId() }}</strong> has been received and is awaiting approval from the store. You'll get an email update as soon as it's confirmed.
          </p>
          <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            @if (isStoreCustomerSignedIn()) {
              <a
                [routerLink]="storeRouter.link(['account', 'orders'])"
                class="rounded-2xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                View my orders
              </a>
            } @else if (orderViewToken() && orderId()) {
              <a
                [routerLink]="storeRouter.orderStatusLink(orderId()!)"
                [queryParams]="{ t: orderViewToken() }"
                class="rounded-2xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Track this order
              </a>
            }
            <a [routerLink]="productsLink()"
              class="rounded-2xl border border-emerald-300 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-50">
              Continue shopping
            </a>
          </div>
        </div>
      } @else {
        <div class="mt-6 grid gap-8 lg:grid-cols-5">
          <!-- Form -->
          <form class="space-y-6 lg:col-span-3" (submit)="$event.preventDefault(); placeOrder()">
            <!-- Contact — required for order confirmation emails -->
            <div class="rounded-3xl border border-slate-200 bg-white p-5">
              <h2 class="font-semibold text-slate-900">Contact</h2>
              <p class="mt-1 text-xs text-slate-500">Order updates and receipts are sent to this address.</p>
              <div class="mt-4">
                <label class="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Email *</label>
                <input
                  type="email"
                  [(ngModel)]="buyerEmail"
                  name="buyerEmail"
                  required
                  autocomplete="email"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>
              <div class="mt-4">
                <label class="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Phone *</label>
                <input
                  type="tel"
                  [(ngModel)]="buyerPhone"
                  name="buyerPhone"
                  required
                  autocomplete="tel"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>
              <div class="mt-4">
                <label class="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Location *</label>
                <input
                  type="text"
                  [(ngModel)]="buyerLocation"
                  name="buyerLocation"
                  required
                  placeholder="Area, district, or landmark"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>
            </div>

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

            <!-- Payment method -->
            <div class="rounded-3xl border border-slate-200 bg-white p-5">
              <h2 class="font-semibold text-slate-900">Payment method</h2>
              <div class="mt-3 flex items-start gap-3 rounded-2xl border border-slate-900 bg-slate-50 p-4">
                <input type="radio" name="paymentMethod" id="pm-cod" checked
                  class="mt-1 h-4 w-4 accent-slate-900" />
                <div class="flex-1">
                  <label for="pm-cod" class="block text-sm font-semibold text-slate-900">Cash on delivery</label>
                  <p class="mt-0.5 text-xs text-slate-500">Pay the courier in cash when your order is delivered. Your order will be reviewed and confirmed by the store before shipping.</p>
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
  readonly storeRouter = inject(StoreRouterService);
  private route = inject(ActivatedRoute);
  private storeService = inject(StoreService);
  private ordersService = inject(StoreOrdersService);
  private tenantCustomerAuth = inject(TenantCustomerAuthService);
  private tenant = inject(TENANT_CONTEXT, { optional: true });

  storeSlug = signal('');
  cartItems = this.ordersService.cartItems;
  status = signal<'idle' | 'loading' | 'error' | 'success'>('idle');
  error = signal<string | null>(null);
  orderId = signal<string | null>(null);
  orderViewToken = signal<string | null>(null);
  private readonly checkoutDraftPrefix = 'casstore:checkout:';

  /** Store customer session only — not platform Firebase owner auth. */
  isStoreCustomerSignedIn = computed(() => {
    const store = this.activeStore();
    if (!store) return false;
    return this.tenantCustomerAuth.hasSession(store.id);
  });
  productsLink = computed(() => this.storeRouter.link(['products']));
  checkoutEnabled = computed(() => this.activeStore()?.checkoutEnabled !== false);
  addr: CheckoutAddress = { fullName: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: '' };
  notes = '';
  buyerEmail = '';
  buyerPhone = '';
  buyerLocation = '';

  canSubmit(): boolean {
    return (
      this.isValidEmail(this.buyerEmail) &&
      this.buyerPhone.trim().length >= 6 &&
      this.buyerLocation.trim().length > 0 &&
      this.addr.fullName.trim().length > 0 &&
      this.addr.line1.trim().length > 0 &&
      this.addr.city.trim().length > 0 &&
      this.addr.postalCode.trim().length > 0 &&
      this.addr.country.trim().length > 0 &&
      this.cartItems().length > 0
    );
  }

  private isValidEmail(raw: string): boolean {
    const s = raw.trim().toLowerCase();
    if (!s || s.length > 254) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  }

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
      void this.ordersService.loadCart(store.id).catch(() => {});
    });

    effect(() => {
      const store = this.activeStore();
      if (!store) return;
      this.restoreDraft(store.slug);
      void this.tenantCustomerAuth.loadMe(store.id).then(() => {
        const c = this.tenantCustomerAuth.customer();
        const email = c?.email?.trim().toLowerCase();
        if (email && !this.buyerEmail.trim()) this.buyerEmail = email;
        const name = c?.fullName?.trim();
        if (name && !this.addr.fullName.trim()) this.addr.fullName = name;
      });
    });
  }

  private draftKey(storeSlug: string): string {
    return `${this.checkoutDraftPrefix}${storeSlug}`;
  }

  private restoreDraft(storeSlug: string) {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(this.draftKey(storeSlug));
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        buyerEmail?: string;
        buyerPhone?: string;
        buyerLocation?: string;
        notes?: string;
        addr?: Partial<CheckoutAddress>;
      };
      if (!this.buyerEmail && typeof parsed.buyerEmail === 'string') this.buyerEmail = parsed.buyerEmail;
      if (!this.buyerPhone && typeof parsed.buyerPhone === 'string') this.buyerPhone = parsed.buyerPhone;
      if (!this.buyerLocation && typeof parsed.buyerLocation === 'string') this.buyerLocation = parsed.buyerLocation;
      if (!this.notes && typeof parsed.notes === 'string') this.notes = parsed.notes;
      if (parsed.addr && typeof parsed.addr === 'object') {
        this.addr = { ...this.addr, ...parsed.addr };
      }
    } catch {
      // Ignore corrupted local drafts.
    }
  }

  private persistDraft() {
    const store = this.activeStore();
    if (!store || typeof window === 'undefined') return;
    const payload = {
      buyerEmail: this.buyerEmail.trim().toLowerCase(),
      buyerPhone: this.buyerPhone.trim(),
      buyerLocation: this.buyerLocation.trim(),
      notes: this.notes,
      addr: { ...this.addr }
    };
    window.localStorage.setItem(this.draftKey(store.slug), JSON.stringify(payload));
  }

  async placeOrder() {
    const store = this.activeStore();
    if (!store) return;
    this.status.set('loading');
    this.error.set(null);
    try {
      this.persistDraft();
      const { orderId: id, orderViewToken: tok } = await this.ordersService.checkout({
        storeId: store.id,
        buyerEmail: this.buyerEmail.trim().toLowerCase(),
        buyerName: this.addr.fullName.trim(),
        buyerPhone: this.buyerPhone.trim(),
        buyerLocation: this.buyerLocation.trim(),
        paymentMethod: 'CASH_ON_DELIVERY',
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
      this.orderViewToken.set(tok ?? null);
      this.status.set('success');
    } catch (e: any) {
      this.status.set('error');
      if (e instanceof ApiClientError && e.isAuthError) {
        this.error.set(
          'Your store sign-in or cart session is no longer valid. Refresh the page or sign in again under Account.'
        );
        return;
      }
      const msg = String(e?.message ?? e);
      if (msg.includes('empty_cart')) this.error.set('Your cart is empty.');
      else if ((e instanceof ApiClientError && e.code === 'invalid_buyer_email') || msg.includes('invalid_buyer_email')) {
        this.error.set('Enter a valid email address for order updates.');
      } else if ((e instanceof ApiClientError && e.code === 'invalid_buyer_phone') || msg.includes('invalid_buyer_phone')) {
        this.error.set('Enter a valid phone number.');
      } else if ((e instanceof ApiClientError && e.code === 'invalid_buyer_location') || msg.includes('invalid_buyer_location')) {
        this.error.set('Enter your location.');
      } else if (msg.includes('out_of_stock')) this.error.set('One or more items are out of stock.');
      else if (msg.includes('checkout_disabled')) this.error.set('This store is not accepting orders right now.');
      else if (msg.includes('payment_method_unavailable')) this.error.set('The selected payment method is not available for this store.');
      else this.error.set(msg);
    }
  }

  fmtPrice(cents: number, currency: string) {
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(cents / 100); }
    catch { return `$${(cents / 100).toFixed(2)}`; }
  }
}
