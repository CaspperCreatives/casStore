import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TENANT_CONTEXT } from '../../core/host-routing';
import {
  StoreOrdersService,
  storeOrderStatusBadgeClass,
  storeOrderStatusLabel,
  type StoreOrderItem
} from '../../core/store-orders.service';
@Component({
  selector: 'app-order-status-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="mx-auto max-w-2xl px-4 py-8">
      <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Order status</h1>
      <p class="mt-1 text-sm text-slate-500">No sign-in required — this page is private to your link.</p>

      @if (pageStatus() === 'loading') {
        <div class="mt-8 space-y-3">
          @for (_ of [1, 2, 3]; track _) {
            <div class="h-20 animate-pulse rounded-2xl border border-slate-200 bg-white"></div>
          }
        </div>
      } @else if (pageStatus() === 'error') {
        <div class="mt-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-900">
          {{ error() }}
        </div>
      } @else if (data()) {
        <div class="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
          <div class="text-xs font-semibold uppercase tracking-wider text-slate-500">{{ data()!.store.name }}</div>
          <div class="mt-2 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div class="font-mono text-xs text-slate-400">#{{ data()!.order.id }}</div>
              <div class="mt-1 text-lg font-semibold text-slate-900">{{ fmtCurrency(data()!.order.totalCents, data()!.order.currency) }}</div>
              <div class="mt-0.5 text-xs text-slate-500">Placed {{ fmtDate(data()!.order.createdAt) }}</div>
            </div>
            <span class="rounded-full px-3 py-1 text-[11px] font-semibold" [class]="orderStatusBadgeClass(data()!.order.status)">
              {{ orderStatusLabel(data()!.order.status) }}
            </span>
          </div>
        </div>

        @if (data()!.items.length) {
          <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 class="text-sm font-semibold text-slate-900">Items</h2>
            <ul class="mt-3 divide-y divide-slate-100">
              @for (line of data()!.items; track line.productId) {
                <li class="flex justify-between gap-3 py-2 text-sm">
                  <span class="min-w-0">
                    <span class="font-medium text-slate-900">{{ line.name }}</span>
                    <span class="text-slate-500"> × {{ line.quantity }}</span>
                  </span>
                  <span class="shrink-0 font-medium text-slate-800">{{ fmtLine(line) }}</span>
                </li>
              }
            </ul>
          </div>
        }

        @if (data()!.order.shippingAddress?.fullName) {
          <div class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <div class="text-xs font-semibold uppercase tracking-wider text-slate-500">Ship to</div>
            <div class="mt-1 whitespace-pre-line">{{ formatShip(data()!.order.shippingAddress) }}</div>
          </div>
        }

        <a [routerLink]="storeHomeLink()" class="mt-8 inline-flex rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
          Back to store
        </a>
      }
    </div>
  `
})
export class OrderStatusPage {
  readonly orderStatusLabel = storeOrderStatusLabel;
  readonly orderStatusBadgeClass = storeOrderStatusBadgeClass;

  private route = inject(ActivatedRoute);
  private ordersService = inject(StoreOrdersService);
  private tenant = inject(TENANT_CONTEXT, { optional: true });

  readonly pageStatus = signal<'idle' | 'loading' | 'error'>('loading');
  readonly error = signal<string | null>(null);
  readonly data = signal<{
    store: { name: string; slug: string };
    order: {
      id: string;
      status: string;
      currency: string;
      totalCents: number;
      shippingAddress?: any;
      createdAt: string | null;
    };
    items: StoreOrderItem[];
  } | null>(null);

  private storeSlugParam = '';

  constructor() {
    // `/order-status/:storeSlug/:orderId` (email + apex) or `/store/:storeSlug/order-status/:orderId` (storefront)
    const orderId = this.route.snapshot.paramMap.get('orderId') ?? '';
    let slug =
      this.route.snapshot.paramMap.get('storeSlug') ??
      this.route.parent?.snapshot.paramMap.get('storeSlug') ??
      '';
    if (!slug && this.tenant?.slug) slug = this.tenant.slug;
    const t = this.route.snapshot.queryParamMap.get('t') ?? '';
    this.storeSlugParam = slug;

    if (!slug || !orderId || !t) {
      this.pageStatus.set('error');
      this.error.set('This link is incomplete. Open the full URL from your order email.');
      return;
    }

    void this.ordersService
      .getPublicOrder(slug, orderId, t)
      .then((res) => {
        this.data.set(res);
        this.pageStatus.set('idle');
      })
      .catch(() => {
        this.pageStatus.set('error');
        this.error.set('We could not load this order. The link may be wrong or no longer valid.');
      });
  }

  storeHomeLink(): any[] {
    const slug = this.data()?.store.slug ?? this.storeSlugParam;
    if (this.tenant && slug && this.tenant.slug === slug) return ['/'];
    if (slug) return ['/store', slug];
    return ['/'];
  }

  fmtCurrency(cents: number, currency: string) {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(cents / 100);
    } catch {
      return `$${(cents / 100).toFixed(2)}`;
    }
  }

  fmtLine(line: StoreOrderItem) {
    const cur = this.data()?.order.currency ?? 'USD';
    const total = line.unitPriceCents * line.quantity;
    return this.fmtCurrency(total, cur);
  }

  fmtDate(iso: string | null) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(d);
  }

  formatShip(a: any): string {
    const parts = [
      a.fullName,
      a.line1,
      a.line2,
      [a.city, a.state, a.postalCode].filter(Boolean).join(', '),
      a.country
    ].filter(Boolean);
    return parts.join('\n');
  }
}
