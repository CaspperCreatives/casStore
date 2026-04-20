import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../core/store.service';
import { StoreOrder, StoreOrdersService } from '../../core/store-orders.service';
import { environment } from '../../../environments/environment';
import { LucideAngularModule, ReceiptText } from 'lucide-angular';

const ORDER_STATUSES = ['', 'PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

@Component({
  selector: 'app-my-store-orders-page',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-xl font-semibold text-slate-900">Orders</h1>
          <p class="mt-0.5 text-xs text-slate-500">Manage incoming orders from your customers</p>
        </div>
        <select
          [(ngModel)]="selectedStatus"
          (ngModelChange)="filterOrders($event)"
          class="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-slate-900"
        >
          <option value="">All statuses</option>
          @for (s of statuses.slice(1); track s) {
            <option [value]="s">{{ s }}</option>
          }
        </select>
      </div>

      @if (!firebaseConfigured()) {
        <div class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Configure Firebase to view orders.</div>
      } @else if (status() === 'loading') {
        <div class="space-y-3">
          @for (_ of [1,2,3,4]; track _) {
            <div class="h-20 animate-pulse rounded-2xl border border-slate-200 bg-white"></div>
          }
        </div>
      } @else if (orders().length === 0) {
        <div class="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <lucide-angular [img]="ReceiptTextIcon" class="mx-auto h-12 w-12 text-slate-300" />
          <div class="mt-3 font-semibold text-slate-700">No orders found</div>
          <p class="mt-1 text-sm text-slate-500">Orders will appear here once customers start buying.</p>
        </div>
      } @else {
        <div class="space-y-3">
          @for (o of orders(); track o.id) {
            <div class="rounded-2xl border border-slate-200 bg-white p-4">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-slate-900">Order #{{ o.id.slice(-8) }}</span>
                    <span class="rounded-full px-2 py-0.5 text-[11px] font-semibold" [class]="statusClass(o.status)">
                      {{ o.status }}
                    </span>
                  </div>
                  <div class="mt-1 text-xs text-slate-500">
                    {{ fmtDate(o.createdAt) }} · {{ fmtCurrency(o.totalCents, o.currency) }}
                  </div>
                  @if (o.shippingAddress?.fullName) {
                    <div class="mt-1 text-xs text-slate-600">
                      Ship to: {{ o.shippingAddress.fullName }}, {{ o.shippingAddress.city }}, {{ o.shippingAddress.country }}
                    </div>
                  }
                </div>
                <div class="flex items-center gap-2">
                  <select
                    [ngModel]="o.status"
                    (ngModelChange)="updateStatus(o, $event)"
                    class="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-slate-900"
                  >
                    @for (s of statuses.slice(1); track s) {
                      <option [value]="s">{{ s }}</option>
                    }
                  </select>
                </div>
              </div>
            </div>
          }
        </div>
      }

      @if (updateError()) {
        <div class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{{ updateError() }}</div>
      }
    </div>
  `
})
export class MyStoreOrdersPage {
  readonly ReceiptTextIcon = ReceiptText;

  private storeService = inject(StoreService);
  private ordersService = inject(StoreOrdersService);

  firebaseConfigured = computed(() => Boolean(environment.firebase?.apiKey));
  orders = this.ordersService.orders;
  status = this.ordersService.status;
  updateError = signal<string | null>(null);
  selectedStatus = '';
  statuses = ORDER_STATUSES;

  constructor() {
    if (this.firebaseConfigured()) void this.load();
  }

  private async load(statusFilter?: string) {
    const storeId = this.storeService.storeId();
    if (!storeId) return;
    await this.ordersService.loadStoreOrders(storeId, statusFilter).catch(() => {});
  }

  filterOrders(status: string) {
    void this.load(status || undefined);
  }

  async updateStatus(order: StoreOrder, newStatus: string) {
    if (newStatus === order.status) return;
    const storeId = this.storeService.storeId();
    if (!storeId) return;
    this.updateError.set(null);
    try {
      await this.ordersService.updateStatus(storeId, order.id, newStatus);
    } catch (e: any) {
      this.updateError.set(e?.message ?? String(e));
    }
  }

  fmtCurrency(cents: number, currency: string) {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(cents / 100);
    } catch {
      return `$${(cents / 100).toFixed(2)}`;
    }
  }

  fmtDate(value: any) {
    const d = typeof value?.toDate === 'function' ? value.toDate() : value ? new Date(value) : null;
    if (!d || isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(d);
  }

  statusClass(s: string) {
    const map: Record<string, string> = {
      PENDING_PAYMENT: 'bg-amber-100 text-amber-800',
      PAID: 'bg-emerald-100 text-emerald-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-slate-100 text-slate-700',
      CANCELLED: 'bg-red-100 text-red-700',
      REFUNDED: 'bg-orange-100 text-orange-800'
    };
    return map[s] ?? 'bg-slate-100 text-slate-600';
  }
}
