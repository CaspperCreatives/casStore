import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ApiClient, ApiClientError } from '../../core/api-client';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="mb-6">
      <h1 class="text-2xl font-semibold tracking-tight">Checkout</h1>
      <p class="text-sm text-slate-600">Shipping + payment will be implemented next.</p>
    </div>

    @if (!firebaseConfigured()) {
      <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Configure Firebase to enable checkout.
      </div>
    } @else {
      <div class="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <div class="font-semibold">Place order</div>
        <p class="mt-1 text-slate-600">
          This will call the backend checkout API, create an order, decrement inventory, and clear your cart.
        </p>

        <div class="mt-4 flex flex-wrap items-center gap-3">
          <button
            class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            [disabled]="status() === 'loading'"
            (click)="placeOrder()"
          >
            @if (status() === 'loading') { Placing... } @else { Place order }
          </button>
          <a routerLink="/cart" class="text-sm text-slate-600 hover:text-slate-900">Back to cart</a>
        </div>

        @if (status() === 'error') {
          <div class="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            {{ error() }}
          </div>
        }
        @if (status() === 'success') {
          <div class="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Order created: <span class="font-mono">{{ orderId() }}</span>
          </div>
        }
      </div>
    }
  `
})
export class CheckoutPage {
  private api = inject(ApiClient);
  firebaseConfigured = computed(() => Boolean(environment.firebase?.apiKey));

  status = signal<'idle' | 'loading' | 'error' | 'success'>('idle');
  error = signal<string | null>(null);
  orderId = signal<string | null>(null);

  async placeOrder() {
    this.status.set('loading');
    this.error.set(null);
    this.orderId.set(null);
    try {
      const json = await this.api.post<{ orderId?: string }>(
        'checkout',
        { currency: 'USD' },
        { auth: true }
      );

      this.orderId.set(String(json.orderId ?? ''));
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


