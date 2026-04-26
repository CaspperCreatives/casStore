import { Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TENANT_CONTEXT } from '../../core/host-routing';
import { StoreService } from '../../core/store.service';
import { StoreOrdersService, storeOrderStatusBadgeClass, storeOrderStatusLabel } from '../../core/store-orders.service';

@Component({
  selector: 'app-store-account-orders-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="mx-auto max-w-3xl px-6 py-8">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">My orders</h1>
        <a [routerLink]="accountLink()" class="text-sm font-semibold text-slate-600 hover:text-slate-900">Back to account</a>
      </div>

      @if (status() === 'loading') {
        <div class="space-y-3">
          @for (_ of [1,2,3]; track _) {
            <div class="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white"></div>
          }
        </div>
      } @else if (orders().length === 0) {
        <div class="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          No orders yet for this store.
        </div>
      } @else {
        <div class="space-y-4">
          @for (o of orders(); track o.id) {
            <div class="rounded-2xl border border-slate-200 bg-white p-4">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="text-xs font-mono text-slate-400">{{ o.id }}</div>
                  <div class="mt-1 font-semibold text-slate-900">{{ fmtCurrency(o.totalCents, o.currency) }}</div>
                </div>
                <span class="rounded-full px-3 py-1 text-[11px] font-semibold" [class]="orderStatusBadgeClass(o.status)">
                  {{ orderStatusLabel(o.status) }}
                </span>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class StoreAccountOrdersPage {
  private ordersService = inject(StoreOrdersService);
  private storeService = inject(StoreService);
  private tenant = inject(TENANT_CONTEXT, { optional: true });

  orders = this.ordersService.orders;
  status = this.ordersService.status;
  storeId = computed(() => this.storeService.viewingStore()?.id ?? '');
  storeSlug = computed(() => this.tenant?.slug ?? this.storeService.viewingStore()?.slug ?? '');
  accountLink = computed(() => this.tenant ? ['/account'] : ['/store', this.storeSlug(), 'account']);
  readonly orderStatusLabel = storeOrderStatusLabel;
  readonly orderStatusBadgeClass = storeOrderStatusBadgeClass;

  constructor() {
    effect(() => {
      const storeId = this.storeId();
      if (!storeId) return;
      void this.ordersService.loadMyOrders(storeId).catch(() => {});
    });
  }

  fmtCurrency(cents: number, currency: string) {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(cents / 100);
    } catch {
      return `$${(cents / 100).toFixed(2)}`;
    }
  }
}
