import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { ApiClient, ApiClientError } from '../../core/api-client';
import { CartService } from '../../core/cart.service';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="mx-auto max-w-3xl">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold tracking-tight">Checkout</h1>
        <p class="text-sm text-slate-600">Complete your purchase</p>
      </div>

      @if (!firebaseConfigured()) {
        <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Configure Firebase to enable checkout.
        </div>
      } @else if (status() === 'success') {
        <div class="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <div class="text-5xl">🎉</div>
          <h2 class="mt-4 text-xl font-bold text-emerald-900">Order placed!</h2>
          <p class="mt-2 text-sm text-emerald-700">
            Order ID: <span class="font-mono font-bold">{{ orderId() }}</span>
          </p>
          <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a routerLink="/account/orders" class="rounded-2xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
              View orders
            </a>
            <a routerLink="/products" class="rounded-2xl border border-emerald-300 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-50">
              Continue shopping
            </a>
          </div>
        </div>
      } @else {
        <form (submit)="$event.preventDefault(); placeOrder()">
          <div class="grid gap-6 lg:grid-cols-5">

            <!-- Left: Shipping + notes -->
            <div class="space-y-6 lg:col-span-3">
              <div class="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 class="font-semibold text-slate-900">Shipping address</h2>
                <div class="mt-4 grid grid-cols-2 gap-4">
                  <div class="col-span-2">
                    <label class="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Full name *</label>
                    <input type="text" [(ngModel)]="addr.fullName" name="fullName" required
                      class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white" />
                  </div>
                  <div class="col-span-2">
                    <label class="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Address line 1 *</label>
                    <input type="text" [(ngModel)]="addr.line1" name="line1" required
                      class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white" />
                  </div>
                  <div class="col-span-2">
                    <label class="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Address line 2</label>
                    <input type="text" [(ngModel)]="addr.line2" name="line2"
                      class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white" />
                  </div>
                  <div>
                    <label class="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">City *</label>
                    <input type="text" [(ngModel)]="addr.city" name="city" required
                      class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white" />
                  </div>
                  <div>
                    <label class="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">State</label>
                    <input type="text" [(ngModel)]="addr.state" name="state"
                      class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white" />
                  </div>
                  <div>
                    <label class="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Postal code *</label>
                    <input type="text" [(ngModel)]="addr.postalCode" name="postalCode" required
                      class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white" />
                  </div>
                  <div>
                    <label class="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Country *</label>
                    <input type="text" [(ngModel)]="addr.country" name="country" required placeholder="US"
                      class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white" />
                  </div>
                </div>
              </div>

              <div class="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 class="font-semibold text-slate-900">Order notes (optional)</h2>
                <textarea [(ngModel)]="notes" name="notes" rows="3" placeholder="Any special instructions..."
                  class="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white"></textarea>
              </div>
            </div>

            <!-- Right: Summary + button -->
            <div class="lg:col-span-2">
              <div class="sticky top-4 rounded-2xl border border-slate-200 bg-white p-5">
                <h2 class="font-semibold text-slate-900">Summary</h2>
                <p class="mt-1 text-xs text-slate-500">Items in your cart will be ordered and inventory decremented.</p>

                @if (status() === 'error') {
                  <div class="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-900">
                    {{ error() }}
                  </div>
                }

                <button
                  type="submit"
                  class="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
                  [disabled]="status() === 'loading' || !canSubmit()"
                >
                  @if (status() === 'loading') { Placing order... } @else { Place order }
                </button>
                <a routerLink="/cart" class="mt-2 block text-center text-sm text-slate-500 hover:text-slate-900">← Back to cart</a>
              </div>
            </div>
          </div>
        </form>
      }
    </div>
  `
})
export class CheckoutPage {
  private api = inject(ApiClient);
  private cart = inject(CartService);
  private router = inject(Router);

  firebaseConfigured = computed(() => Boolean(environment.firebase?.apiKey));

  status = signal<'idle' | 'loading' | 'error' | 'success'>('idle');
  error = signal<string | null>(null);
  orderId = signal<string | null>(null);

  addr = { fullName: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: '' };
  notes = '';

  canSubmit = computed(() =>
    this.addr.fullName.trim().length > 0 &&
    this.addr.line1.trim().length > 0 &&
    this.addr.city.trim().length > 0 &&
    this.addr.postalCode.trim().length > 0 &&
    this.addr.country.trim().length > 0
  );

  async placeOrder() {
    this.status.set('loading');
    this.error.set(null);
    this.orderId.set(null);
    try {
      const json = await this.api.post<{ orderId?: string }>(
        'checkout',
        {
          currency: 'USD',
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
        },
        { auth: true }
      );
      this.orderId.set(String(json.orderId ?? ''));
      this.cart.lines.set([]);
      this.status.set('success');
    } catch (e: any) {
      this.status.set('error');
      if (e instanceof ApiClientError && e.isAuthError) {
        this.error.set('Your session has expired. Please sign in again and retry checkout.');
        return;
      }
      this.error.set(e?.message ?? String(e));
    }
  }
}
