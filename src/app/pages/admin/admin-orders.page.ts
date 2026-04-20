import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { ApiClient } from '../../core/api-client';
import { LucideAngularModule, ReceiptText } from 'lucide-angular';

type Order = {
  id: string;
  userId: string;
  status: string;
  currency: string;
  totalCents: number;
  createdAt?: any;
};

const STATUSES = ['', 'PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

@Component({
  selector: 'app-admin-orders-page',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-lg font-semibold text-slate-900">Orders</h1>
          <p class="text-xs text-slate-500">All platform-level orders</p>
        </div>
        <select [(ngModel)]="selectedStatus" (ngModelChange)="loadWithStatus($event)"
          class="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-slate-900">
          <option value="">All statuses</option>
          @for (s of statuses.slice(1); track s) { <option [value]="s">{{ s }}</option> }
        </select>
      </div>

      @if (!firebaseConfigured()) {
        <div class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Configure Firebase.</div>
      } @else if (status() === 'loading') {
        <div class="space-y-3">@for (_ of [1,2,3]; track _) { <div class="h-16 animate-pulse rounded-2xl border border-slate-200 bg-white"></div> }</div>
      } @else if (orders().length === 0) {
        <div class="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <lucide-angular [img]="ReceiptTextIcon" class="mx-auto h-12 w-12 text-slate-300" />
          <p class="mt-3 text-sm text-slate-500">No orders found.</p>
        </div>
      } @else {
        <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table class="w-full text-sm">
            <thead class="border-b border-slate-200 bg-slate-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Order</th>
                <th class="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 md:table-cell">User</th>
                <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</th>
                <th class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th class="hidden px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (o of orders(); track o.id) {
                <tr class="hover:bg-slate-50">
                  <td class="px-4 py-3 font-mono text-xs text-slate-700">{{ o.id.slice(-8) }}</td>
                  <td class="hidden px-4 py-3 text-xs text-slate-500 max-w-[150px] truncate md:table-cell">{{ o.userId }}</td>
                  <td class="px-4 py-3 text-right font-semibold text-slate-900">{{ fmtCurrency(o.totalCents, o.currency) }}</td>
                  <td class="px-4 py-3 text-center">
                    <span class="rounded-full px-2 py-0.5 text-[11px] font-semibold" [class]="statusClass(o.status)">
                      {{ o.status }}
                    </span>
                  </td>
                  <td class="hidden px-4 py-3 text-right text-xs text-slate-500 sm:table-cell">{{ fmtDate(o.createdAt) }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class AdminOrdersPage {
  readonly ReceiptTextIcon = ReceiptText;

  private api = inject(ApiClient);
  firebaseConfigured = computed(() => Boolean(environment.firebase?.apiKey));

  orders = signal<Order[]>([]);
  status = signal<'idle' | 'loading' | 'error'>('idle');
  selectedStatus = '';
  statuses = STATUSES;

  constructor() {
    if (this.firebaseConfigured()) void this.load();
  }

  private async load(statusFilter?: string) {
    this.status.set('loading');
    try {
      const params: any = { limit: 100 };
      if (statusFilter) params.status = statusFilter;
      const json = await this.api.get<{ ok: true; orders: Order[] }>('adminOrdersList', params, { auth: true });
      this.orders.set(json.orders ?? []);
      this.status.set('idle');
    } catch (e: any) {
      this.status.set('error');
    }
  }

  loadWithStatus(status: string) { void this.load(status || undefined); }

  fmtCurrency(cents: number, currency: string) {
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(cents / 100); }
    catch { return `$${(cents / 100).toFixed(2)}`; }
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
