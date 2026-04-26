import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../core/store.service';
import {
  STORE_ORDER_STATUS_FILTER_OPTIONS,
  StoreOrder,
  StoreOrderItem,
  StoreOrdersService,
  storeOrderStatusBadgeClass,
  storeOrderStatusLabel
} from '../../core/store-orders.service';
import { environment } from '../../../environments/environment';
import { Check, ChevronDown, ChevronUp, LucideAngularModule, ReceiptText } from 'lucide-angular';

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH_ON_DELIVERY: 'Cash on delivery'
};

type OrderDetail = { items: StoreOrderItem[]; order: StoreOrder };

@Component({
  selector: 'app-my-store-orders-page',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-xl font-semibold text-slate-900">Orders</h1>
          <p class="mt-0.5 text-xs text-slate-500">Review and approve incoming orders from your customers</p>
        </div>
        <select
          [(ngModel)]="selectedStatus"
          (ngModelChange)="filterOrders($event)"
          class="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-slate-900"
        >
          <option value="">All statuses</option>
          @for (s of statuses.slice(1); track s) {
            <option [value]="s">{{ orderStatusLabel(s) }}</option>
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
        <!-- Desktop table -->
        <div class="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:block">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th class="w-8 px-3 py-3"></th>
                  <th class="px-3 py-3">Order</th>
                  <th class="px-3 py-3">Date</th>
                  <th class="px-3 py-3">Buyer</th>
                  <th class="px-3 py-3">Payment</th>
                  <th class="px-3 py-3">Total</th>
                  <th class="px-3 py-3">Status</th>
                  <th class="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (o of orders(); track o.id) {
                  <tr class="border-t border-slate-100 align-top hover:bg-slate-50/50">
                    <td class="px-3 py-3">
                      <button type="button" class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                        (click)="toggleExpand(o)">
                        <lucide-angular [img]="expandedId() === o.id ? ChevronUpIcon : ChevronDownIcon" class="h-4 w-4" />
                      </button>
                    </td>
                    <td class="px-3 py-3 font-mono text-[12px] font-semibold text-slate-900">#{{ o.id.slice(-8) }}</td>
                    <td class="px-3 py-3 text-slate-600">{{ fmtDate(o.createdAt) }}</td>
                    <td class="px-3 py-3">
                      <div class="font-semibold text-slate-900">{{ o.buyerName || o.shippingAddress?.fullName || '—' }}</div>
                      @if (o.buyerEmail) {
                        <div class="text-[11px] text-slate-500">{{ o.buyerEmail }}</div>
                      }
                    </td>
                    <td class="px-3 py-3 text-slate-600">{{ paymentLabel(o.paymentMethod) }}</td>
                    <td class="px-3 py-3 font-semibold text-slate-900">{{ fmtCurrency(o.totalCents, o.currency) }}</td>
                    <td class="px-3 py-3">
                      <span class="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold" [class]="orderStatusBadgeClass(o.status)">
                        {{ orderStatusLabel(o.status) }}
                      </span>
                    </td>
                    <td class="px-3 py-3">
                      <div class="flex items-center justify-end gap-2">
                        @if (o.status === 'PENDING_APPROVAL') {
                          <button
                            type="button"
                            class="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-[12px] font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                            [disabled]="approvingId() === o.id"
                            (click)="approve(o)"
                          >
                            <lucide-angular [img]="CheckIcon" class="h-3.5 w-3.5" />
                            {{ approvingId() === o.id ? 'Approving...' : 'Approve' }}
                          </button>
                        }
                        <select
                          [ngModel]="o.status"
                          (ngModelChange)="updateStatus(o, $event)"
                          class="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-[12px] font-semibold text-slate-700 outline-none focus:border-slate-900"
                        >
                          @for (s of statuses.slice(1); track s) {
                            <option [value]="s">{{ orderStatusLabel(s) }}</option>
                          }
                        </select>
                      </div>
                    </td>
                  </tr>
                  @if (expandedId() === o.id) {
                    <tr class="border-t border-slate-100 bg-slate-50/50">
                      <td></td>
                      <td colspan="7" class="px-3 py-4">
                        @if (detailLoading()) {
                          <div class="text-[12px] text-slate-500">Loading order details...</div>
                        } @else {
                          @if (detail(); as d) {
                            <div class="grid gap-5 md:grid-cols-3">
                              <div>
                                <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Shipping address</div>
                                @if (d.order.shippingAddress; as sa) {
                                  <div class="mt-1 text-[12px] leading-relaxed text-slate-700">
                                    <div class="font-semibold">{{ sa.fullName }}</div>
                                    <div>{{ sa.line1 }}</div>
                                    @if (sa.line2) { <div>{{ sa.line2 }}</div> }
                                    <div>{{ [sa.city, sa.state, sa.postalCode].filter(isTruthy).join(', ') }}</div>
                                    <div>{{ sa.country }}</div>
                                  </div>
                                } @else {
                                  <div class="mt-1 text-[12px] text-slate-400">—</div>
                                }
                              </div>

                              <div>
                                <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Buyer contact</div>
                                <div class="mt-1 space-y-0.5 text-[12px] text-slate-700">
                                  <div>{{ d.order.buyerName || d.order.shippingAddress?.fullName || '—' }}</div>
                                  @if (d.order.buyerEmail) { <div>{{ d.order.buyerEmail }}</div> }
                                  @if (d.order.buyerPhone) { <div>{{ d.order.buyerPhone }}</div> }
                                </div>
                                @if (d.order.notes) {
                                  <div class="mt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Notes</div>
                                  <div class="mt-1 whitespace-pre-wrap text-[12px] text-slate-700">{{ d.order.notes }}</div>
                                }
                              </div>

                              <div>
                                <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Items</div>
                                <div class="mt-1 space-y-1 text-[12px]">
                                  @for (it of d.items; track it.productId) {
                                    <div class="flex items-center justify-between gap-3">
                                      <span class="truncate text-slate-700">{{ it.name }} × {{ it.quantity }}</span>
                                      <span class="shrink-0 font-semibold text-slate-900">{{ fmtCurrency(it.unitPriceCents * it.quantity, d.order.currency) }}</span>
                                    </div>
                                  }
                                </div>
                                <div class="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 text-[12px] font-bold text-slate-900">
                                  <span>Total</span>
                                  <span>{{ fmtCurrency(d.order.totalCents, d.order.currency) }}</span>
                                </div>
                              </div>
                            </div>
                          } @else if (detailError()) {
                            <div class="text-[12px] text-red-600">{{ detailError() }}</div>
                          }
                        }
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mobile cards -->
        <div class="space-y-3 md:hidden">
          @for (o of orders(); track o.id) {
            <div class="rounded-2xl border border-slate-200 bg-white p-4">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-[12px] font-semibold text-slate-900">#{{ o.id.slice(-8) }}</span>
                    <span class="rounded-full px-2 py-0.5 text-[11px] font-semibold" [class]="orderStatusBadgeClass(o.status)">
                      {{ orderStatusLabel(o.status) }}
                    </span>
                  </div>
                  <div class="mt-1 text-xs text-slate-500">
                    {{ fmtDate(o.createdAt) }} · {{ fmtCurrency(o.totalCents, o.currency) }} · {{ paymentLabel(o.paymentMethod) }}
                  </div>
                  <div class="mt-1 text-xs text-slate-600">
                    {{ o.buyerName || o.shippingAddress?.fullName || '—' }}
                    @if (o.buyerEmail) {
                      <span class="text-slate-400">· {{ o.buyerEmail }}</span>
                    }
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button type="button" class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                    (click)="toggleExpand(o)">
                    <lucide-angular [img]="expandedId() === o.id ? ChevronUpIcon : ChevronDownIcon" class="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div class="mt-3 flex flex-wrap items-center gap-2">
                @if (o.status === 'PENDING_APPROVAL') {
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-[12px] font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                    [disabled]="approvingId() === o.id"
                    (click)="approve(o)"
                  >
                    <lucide-angular [img]="CheckIcon" class="h-3.5 w-3.5" />
                    {{ approvingId() === o.id ? 'Approving...' : 'Approve' }}
                  </button>
                }
                <select
                  [ngModel]="o.status"
                  (ngModelChange)="updateStatus(o, $event)"
                  class="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-[12px] font-semibold text-slate-700 outline-none focus:border-slate-900"
                >
                  @for (s of statuses.slice(1); track s) {
                    <option [value]="s">{{ orderStatusLabel(s) }}</option>
                  }
                </select>
              </div>

              @if (expandedId() === o.id) {
                <div class="mt-4 border-t border-slate-200 pt-3">
                  @if (detailLoading()) {
                    <div class="text-[12px] text-slate-500">Loading order details...</div>
                  } @else {
                    @if (detail(); as d) {
                      @if (d.order.shippingAddress; as sa) {
                        <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Shipping to</div>
                        <div class="mt-1 text-[12px] leading-relaxed text-slate-700">
                          <div class="font-semibold">{{ sa.fullName }}</div>
                          <div>{{ sa.line1 }}</div>
                          @if (sa.line2) { <div>{{ sa.line2 }}</div> }
                          <div>{{ [sa.city, sa.state, sa.postalCode].filter(isTruthy).join(', ') }}</div>
                          <div>{{ sa.country }}</div>
                        </div>
                      }
                      @if (d.order.buyerPhone) {
                        <div class="mt-2 text-[12px] text-slate-600">Phone: {{ d.order.buyerPhone }}</div>
                      }
                      @if (d.order.notes) {
                        <div class="mt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Notes</div>
                        <div class="mt-1 whitespace-pre-wrap text-[12px] text-slate-700">{{ d.order.notes }}</div>
                      }
                      <div class="mt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Items</div>
                      <div class="mt-1 space-y-1 text-[12px]">
                        @for (it of d.items; track it.productId) {
                          <div class="flex items-center justify-between gap-3">
                            <span class="truncate text-slate-700">{{ it.name }} × {{ it.quantity }}</span>
                            <span class="shrink-0 font-semibold text-slate-900">{{ fmtCurrency(it.unitPriceCents * it.quantity, d.order.currency) }}</span>
                          </div>
                        }
                      </div>
                    } @else if (detailError()) {
                      <div class="text-[12px] text-red-600">{{ detailError() }}</div>
                    }
                  }
                </div>
              }
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
  readonly ChevronDownIcon = ChevronDown;
  readonly ChevronUpIcon = ChevronUp;
  readonly CheckIcon = Check;

  private storeService = inject(StoreService);
  private ordersService = inject(StoreOrdersService);

  firebaseConfigured = computed(() => Boolean(environment.firebase?.apiKey));
  orders = this.ordersService.orders;
  status = this.ordersService.status;
  updateError = signal<string | null>(null);
  approvingId = signal<string | null>(null);
  selectedStatus = '';
  statuses = [...STORE_ORDER_STATUS_FILTER_OPTIONS];

  readonly orderStatusLabel = storeOrderStatusLabel;
  readonly orderStatusBadgeClass = storeOrderStatusBadgeClass;

  expandedId = signal<string | null>(null);
  detail = signal<OrderDetail | null>(null);
  detailLoading = signal(false);
  detailError = signal<string | null>(null);

  readonly isTruthy = (v: unknown) => Boolean(v);

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

  async toggleExpand(order: StoreOrder) {
    if (this.expandedId() === order.id) {
      this.expandedId.set(null);
      this.detail.set(null);
      this.detailError.set(null);
      return;
    }
    this.expandedId.set(order.id);
    this.detail.set(null);
    this.detailError.set(null);
    this.detailLoading.set(true);
    try {
      const storeId = this.storeService.storeId();
      if (!storeId) return;
      const res = await this.ordersService.getOrder(storeId, order.id);
      if (this.expandedId() !== order.id) return;
      this.detail.set({ order: res.order, items: res.items });
    } catch (e: any) {
      this.detailError.set(e?.message ?? 'Could not load order details.');
    } finally {
      this.detailLoading.set(false);
    }
  }

  async approve(order: StoreOrder) {
    if (order.status !== 'PENDING_APPROVAL') return;
    const storeId = this.storeService.storeId();
    if (!storeId) return;
    this.approvingId.set(order.id);
    this.updateError.set(null);
    try {
      await this.ordersService.updateStatus(storeId, order.id, 'CONFIRMED');
    } catch (e: any) {
      this.updateError.set(e?.message ?? String(e));
    } finally {
      this.approvingId.set(null);
    }
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
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(d);
  }

  paymentLabel(method: string | null | undefined) {
    if (!method) return 'Cash on delivery';
    return PAYMENT_METHOD_LABELS[method] ?? method;
  }

}
