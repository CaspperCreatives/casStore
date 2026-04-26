import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import {
  StoreOrdersService,
  StoreOrder,
  storeOrderStatusBadgeClass,
  storeOrderStatusLabel
} from '../../core/store-orders.service';
import { LucideAngularModule, Package } from 'lucide-angular';

@Component({
  selector: 'app-account-orders-page',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  template: `
    <div class="mx-auto max-w-2xl">
      <div class="mb-6 flex items-center gap-3">
        <a routerLink="/account" class="text-sm text-slate-500 hover:text-slate-900">← Account</a>
        <h1 class="text-2xl font-semibold tracking-tight">Order history</h1>
      </div>

      @if (!firebaseConfigured()) {
        <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Configure Firebase to view orders.
        </div>
      } @else if (status() === 'loading') {
        <div class="space-y-3">
          @for (_ of [1,2,3,4]; track _) {
            <div class="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white"></div>
          }
        </div>
      } @else if (orders().length === 0) {
        <div class="rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <lucide-angular [img]="PackageIcon" class="mx-auto h-12 w-12 text-slate-300" />
          <p class="mt-3 font-semibold text-slate-700">No orders yet</p>
          <p class="mt-1 text-sm text-slate-500">Your order history will appear here.</p>
          <a routerLink="/products" class="mt-4 inline-block rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
            Start shopping
          </a>
        </div>
      } @else {
        <div class="space-y-4">
          @for (o of orders(); track o.id) {
            <div class="rounded-2xl border border-slate-200 bg-white p-4">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div class="text-xs font-mono text-slate-400">{{ o.id }}</div>
                  <div class="mt-1 font-semibold text-slate-900">{{ fmtCurrency(o.totalCents, o.currency) }}</div>
                  <div class="mt-0.5 text-xs text-slate-500">{{ fmtDate(o.createdAt) }}</div>
                </div>
                <span class="rounded-full px-3 py-1 text-[11px] font-semibold" [class]="orderStatusBadgeClass(o.status)">
                  {{ orderStatusLabel(o.status) }}
                </span>
              </div>
              @if (o.shippingAddress?.fullName) {
                <div class="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  Shipping to: {{ o.shippingAddress.fullName }}, {{ o.shippingAddress.line1 }}, {{ o.shippingAddress.city }}, {{ o.shippingAddress.country }}
                </div>
              }
            </div>
          }
        </div>
      }

      @if (error()) {
        <div class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{{ error() }}</div>
      }
    </div>
  `
})
export class AccountOrdersPage {
  readonly PackageIcon = Package;

  readonly orderStatusLabel = storeOrderStatusLabel;
  readonly orderStatusBadgeClass = storeOrderStatusBadgeClass;

  private ordersService = inject(StoreOrdersService);

  firebaseConfigured = computed(() => Boolean(environment.firebase?.apiKey));
  orders = this.ordersService.orders;
  status = this.ordersService.status;
  error = this.ordersService.error;

  constructor() {
    if (this.firebaseConfigured()) void this.load();
  }

  private async load() {
    await this.ordersService.loadMyOrders().catch(() => {});
  }

  fmtCurrency(cents: number, currency: string) {
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(cents / 100); }
    catch { return `$${(cents / 100).toFixed(2)}`; }
  }

  fmtDate(value: any) {
    const d = typeof value?.toDate === 'function' ? value.toDate() : value ? new Date(value) : null;
    if (!d || isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(d);
  }

}
