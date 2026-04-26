import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TENANT_CONTEXT } from '../../core/host-routing';
import { StoreService } from '../../core/store.service';
import {
  StoreOrder,
  StoreOrdersService,
  storeOrderStatusBadgeClass,
  storeOrderStatusLabel
} from '../../core/store-orders.service';

@Component({
  selector: 'app-store-order-history-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="mx-auto max-w-3xl px-6 py-8">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Your order history</h1>
      <p class="mt-1 text-sm text-slate-500">Orders in this store only.</p>

      @if (status() === 'loading') {
        <div class="mt-6 space-y-3">
          @for (_ of [1,2,3]; track _) {
            <div class="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white"></div>
          }
        </div>
      } @else if (orders().length === 0) {
        <div class="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white py-12 text-center">
          <p class="font-semibold text-slate-700">No orders yet</p>
          <a [routerLink]="productsLink()" class="mt-3 inline-block rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
            Browse products
          </a>
        </div>
      } @else {
        <div class="mt-6 space-y-4">
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
export class StoreOrderHistoryPage {
  private route = inject(ActivatedRoute);
  private tenant = inject(TENANT_CONTEXT, { optional: true });
  private storeService = inject(StoreService);
  private ordersService = inject(StoreOrdersService);

  orders = this.ordersService.orders;
  status = this.ordersService.status;
  storeSlug = signal('');
  productsLink = computed(() => (this.tenant ? ['/products'] : ['/store', this.storeSlug(), 'products']));

  readonly orderStatusLabel = storeOrderStatusLabel;
  readonly orderStatusBadgeClass = storeOrderStatusBadgeClass;

  constructor() {
    const slug = this.tenant?.slug ?? this.route.parent?.snapshot.paramMap.get('storeSlug') ?? '';
    this.storeSlug.set(slug);
    effect(() => {
      const store = this.storeService.viewingStore();
      if (!store) return;
      void this.ordersService.loadMyOrders(store.id).catch(() => {});
    });
  }

  fmtCurrency(cents: number, currency: string) {
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(cents / 100); }
    catch { return `$${(cents / 100).toFixed(2)}`; }
  }
}
