import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StoreService } from '../../core/store.service';
import { ApiClient } from '../../core/api-client';
import { environment } from '../../../environments/environment';
import {
  ArrowRight,
  Copy,
  ExternalLink,
  LucideAngularModule,
  Package,
  ReceiptText,
  TrendingUp,
  TriangleAlert
} from 'lucide-angular';
import { ErrorDisplayComponent } from '../../shared/error-display.component';

type DashMetrics = {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  paidOrders: number;
  totalRevenueCents: number;
  lowStockProducts: number;
};

@Component({
  selector: 'app-my-store-dashboard-page',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, ErrorDisplayComponent],
  template: `
    <div class="space-y-6">

      @if (primaryHost(); as host) {
        <section
          class="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-sm"
        >
          <div class="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="min-w-0">
              @if (showWelcome()) {
                <div class="text-[11px] font-semibold uppercase tracking-widest text-emerald-300">Your store is live</div>
              } @else {
                <div class="text-[11px] font-semibold uppercase tracking-widest text-slate-300">Your store is live at</div>
              }
              <div class="mt-1 truncate font-mono text-lg font-bold">{{ host }}</div>
              @if (subdomainsEnabled) {
                <div class="mt-0.5 truncate font-mono text-[11px] text-slate-400">{{ apexHost() }}</div>
              }
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button
                type="button"
                class="flex items-center gap-1.5 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-[12px] font-semibold text-white hover:bg-white/20"
                [title]="copied() ? 'Copied' : 'Copy URL'"
                (click)="copy()"
              >
                <lucide-angular [img]="CopyIcon" class="h-4 w-4" />
                {{ copied() ? 'Copied!' : 'Copy' }}
              </button>
              <a
                [href]="primaryUrl()"
                target="_blank"
                rel="noopener"
                class="flex items-center gap-1.5 rounded-2xl bg-white px-3 py-2 text-[12px] font-semibold text-slate-900 hover:bg-slate-100"
              >
                <lucide-angular [img]="ExternalLinkIcon" class="h-4 w-4" />
                Open
              </a>
            </div>
          </div>
        </section>
      }

      @if (!firebaseConfigured()) {
        <div class="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          <div class="flex items-center gap-2">
            <lucide-angular [img]="TriangleAlertIcon" class="h-4 w-4 shrink-0" />
            Configure Firebase to load live data.
          </div>
        </div>
      }

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <div class="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Revenue</div>
            <div class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <lucide-angular [img]="TrendingUpIcon" class="h-5 w-5" />
            </div>
          </div>
          <div class="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            @if (status() === 'loading') { <span class="animate-pulse">—</span> }
            @else { {{ fmtCurrency(metrics()?.totalRevenueCents ?? 0) }} }
          </div>
          <div class="mt-1 text-xs text-slate-500">{{ metrics()?.paidOrders ?? 0 }} paid orders</div>
        </div>

        <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <div class="text-xs font-semibold uppercase tracking-wider text-slate-500">Orders</div>
            <div class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
              <lucide-angular [img]="ReceiptTextIcon" class="h-5 w-5" />
            </div>
          </div>
          <div class="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            @if (status() === 'loading') { <span class="animate-pulse">—</span> }
            @else { {{ metrics()?.totalOrders ?? 0 }} }
          </div>
          <div class="mt-1 text-xs text-amber-600 font-semibold">{{ metrics()?.pendingOrders ?? 0 }} awaiting payment</div>
        </div>

        <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <div class="text-xs font-semibold uppercase tracking-wider text-slate-500">Products</div>
            <div class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <lucide-angular [img]="PackageIcon" class="h-5 w-5" />
            </div>
          </div>
          <div class="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            @if (status() === 'loading') { <span class="animate-pulse">—</span> }
            @else { {{ metrics()?.totalProducts ?? 0 }} }
          </div>
          @if ((metrics()?.lowStockProducts ?? 0) > 0) {
            <div class="mt-1 text-xs text-red-600 font-semibold">{{ metrics()?.lowStockProducts }} low stock</div>
          } @else {
            <div class="mt-1 text-xs text-slate-500">All stocked</div>
          }
        </div>
      </div>

      <!-- Recent orders -->
      <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between gap-3">
          <div>
            <div class="text-sm font-semibold text-slate-900">Recent orders</div>
            <div class="mt-0.5 text-xs text-slate-500">Latest activity in your store</div>
          </div>
          <a routerLink="/my-store/orders" class="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900">
            View all <lucide-angular [img]="ArrowRightIcon" class="h-3.5 w-3.5" />
          </a>
        </div>

        <div class="mt-4 space-y-3">
          @if (status() === 'loading') {
            @for (_ of [1,2,3]; track _) {
              <div class="h-16 animate-pulse rounded-2xl border border-slate-100 bg-slate-50"></div>
            }
          } @else if (recentOrders().length === 0) {
            <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              No orders yet. Share your store link to start selling!
            </div>
          } @else {
            @for (o of recentOrders(); track o.id) {
              <div class="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                <div>
                  <div class="text-sm font-semibold text-slate-900">Order #{{ o.id.slice(-6) }}</div>
                  <div class="mt-0.5 text-xs text-slate-500">{{ fmtDate(o.createdAt) }}</div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-semibold text-slate-900">{{ fmtCurrency(o.totalCents) }}</div>
                  <span class="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    [class]="statusClass(o.status)">
                    {{ o.status }}
                  </span>
                </div>
              </div>
            }
          }
        </div>
      </section>

      <!-- Quick actions -->
      <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="text-sm font-semibold text-slate-900">Quick actions</div>
        <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <a routerLink="/my-store/products" class="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center hover:bg-slate-100">
            <lucide-angular [img]="PackageIcon" class="h-6 w-6 text-slate-600" />
            <span class="text-xs font-semibold text-slate-700">Add product</span>
          </a>
          <a routerLink="/my-store/orders" class="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center hover:bg-slate-100">
            <lucide-angular [img]="ReceiptTextIcon" class="h-6 w-6 text-slate-600" />
            <span class="text-xs font-semibold text-slate-700">View orders</span>
          </a>
          <a routerLink="/my-store/settings" class="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center hover:bg-slate-100">
            <lucide-angular [img]="TrendingUpIcon" class="h-6 w-6 text-slate-600" />
            <span class="text-xs font-semibold text-slate-700">Edit settings</span>
          </a>
        </div>
      </section>

      @if (status() === 'error') {
        <app-error-display
          title="Failed to load dashboard"
          [message]="error() ?? ''"
          retryLabel="Try again"
          (retry)="load()"
        />
      }
    </div>
  `
})
export class MyStoreDashboardPage {
  readonly TrendingUpIcon = TrendingUp;
  readonly ReceiptTextIcon = ReceiptText;
  readonly PackageIcon = Package;
  readonly ArrowRightIcon = ArrowRight;
  readonly TriangleAlertIcon = TriangleAlert;
  readonly CopyIcon = Copy;
  readonly ExternalLinkIcon = ExternalLink;

  private api = inject(ApiClient);
  private storeService = inject(StoreService);
  private route = inject(ActivatedRoute);

  firebaseConfigured = computed(() => Boolean(environment.firebase?.apiKey));
  readonly subdomainsEnabled = environment.subdomainsEnabled;
  status = signal<'idle' | 'loading' | 'error'>('idle');
  error = signal<string | null>(null);
  metrics = signal<DashMetrics | null>(null);
  recentOrders = signal<any[]>([]);
  copied = signal(false);
  /** Shows a celebratory label on the first dashboard visit right after create-store. */
  showWelcome = signal(false);

  // Live URL card inputs — null until the store loads so the card stays hidden.
  subdomainHost = computed(() => {
    const s = this.storeService.store();
    return s?.slug ? `${s.slug}.${environment.rootDomain}` : null;
  });
  apexHost = computed(() => {
    const s = this.storeService.store();
    return s?.slug ? `${environment.rootDomain}/store/${s.slug}` : '';
  });
  /** What the card shows prominently: subdomain when the feature is live, path otherwise. */
  primaryHost = computed(() =>
    this.subdomainsEnabled ? this.subdomainHost() : this.apexHost() || null
  );
  primaryUrl = computed(() => {
    const host = this.primaryHost();
    return host ? `https://${host}` : '#';
  });

  constructor() {
    if (this.firebaseConfigured()) void this.load();
    this.showWelcome.set(this.route.snapshot.queryParamMap.get('welcome') === '1');
  }

  async copy() {
    const host = this.primaryHost();
    if (!host) return;
    try {
      await navigator.clipboard.writeText(`https://${host}`);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    } catch {
      // clipboard permission denied — silent
    }
  }

  async load() {
    const storeId = this.storeService.storeId();
    if (!storeId) return;
    this.status.set('loading');
    try {
      const json = await this.api.get<{ ok: true; metrics: DashMetrics; recentOrders: any[] }>(
        'storeDashboard',
        { storeId },
        { auth: true }
      );
      this.metrics.set(json.metrics);
      this.recentOrders.set(json.recentOrders ?? []);
      this.status.set('idle');
    } catch (e: any) {
      this.status.set('error');
      this.error.set(e?.message ?? String(e));
    }
  }

  fmtCurrency(cents: number) {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format((cents ?? 0) / 100);
  }

  fmtDate(value: any) {
    const d = typeof value?.toDate === 'function' ? value.toDate() : value ? new Date(value) : null;
    if (!d || isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short' }).format(d);
  }

  statusClass(status: string) {
    const map: Record<string, string> = {
      PENDING_PAYMENT: 'bg-amber-100 text-amber-800',
      PAID: 'bg-emerald-100 text-emerald-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-slate-100 text-slate-700',
      CANCELLED: 'bg-red-100 text-red-700',
      REFUNDED: 'bg-orange-100 text-orange-800'
    };
    return map[status] ?? 'bg-slate-100 text-slate-600';
  }
}
