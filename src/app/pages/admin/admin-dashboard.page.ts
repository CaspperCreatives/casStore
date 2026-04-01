import { Component, computed, inject, signal } from '@angular/core';
import { collection, getCountFromServer, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth.service';
import { injectFirestore } from '../../core/firebase';
import { CircleCheckBig, Clock3, Ellipsis, LucideAngularModule, Package, User } from 'lucide-angular';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="space-y-6">
      @if (!firebaseConfigured()) {
        <div class="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 shadow-sm">
          <div class="font-semibold">Firebase is not configured yet.</div>
          <div class="mt-1 text-amber-800">
            Add your Firebase Web config in <code class="font-mono">casStore/src/environments/environment.ts</code> to enable live system data.
          </div>
        </div>
      }

      <!-- "Currently at work" -->
      <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="text-sm font-semibold text-slate-900">Currently active</div>
        <div class="mt-4 flex items-start gap-4 overflow-x-auto pb-1">
          @for (u of activeUsers(); track u.uid) {
            <div class="shrink-0 text-center">
              <div class="relative mx-auto h-14 w-14">
                <div class="absolute inset-0 rounded-full bg-gradient-to-b from-sky-500 to-indigo-600 p-[3px]">
                  <div class="h-full w-full overflow-hidden rounded-full bg-white">
                    @if (u.photoURL) {
                      <img [src]="u.photoURL" alt="" class="h-full w-full object-cover" />
                    } @else {
                      <div class="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-700">
                        {{ initialsFor(u) }}
                      </div>
                    }
                  </div>
                </div>
                @if (u.statusBadge) {
                  <div
                    class="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white text-[11px] font-bold"
                    [class.bg-amber-100]="u.statusBadge === 'paused'"
                    [class.text-amber-900]="u.statusBadge === 'paused'"
                    [class.bg-red-100]="u.statusBadge === 'alert'"
                    [class.text-red-900]="u.statusBadge === 'alert'"
                  >
                    @if (u.statusBadge === 'paused') { II } @else { ! }
                  </div>
                }
              </div>
              <div class="mt-2 w-20 text-[13px] font-semibold leading-tight text-slate-900">
                {{ u.firstName }}<br />{{ u.lastName }}
              </div>
            </div>
          }

          @if (activeUsers().length === 0) {
            <div class="text-sm text-slate-600">No users found yet.</div>
          }
        </div>
      </section>

      <!-- Grid -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Left column -->
        <div class="space-y-6 lg:col-span-2">
          <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="text-sm font-semibold text-slate-900">Inbox</div>
                <div class="mt-1 text-xs text-slate-500">Recent orders & system activity</div>
              </div>
              <button type="button" class="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <span class="sr-only">More</span>
                <lucide-angular [img]="EllipsisIcon" class="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div class="mt-4 space-y-3">
              @for (o of recentOrders(); track o.id) {
                <div class="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <div class="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
                    <lucide-angular [img]="PackageIcon" class="h-5 w-5" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="truncate text-sm font-semibold text-slate-900">
                      Order {{ o.id }}
                      <span class="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        {{ o.status }}
                      </span>
                    </div>
                    <div class="mt-0.5 text-xs text-slate-500">
                      {{ o.subtitle }}
                    </div>
                  </div>
                  <div class="shrink-0 text-right text-xs text-slate-500">
                    <div class="font-semibold text-slate-700">{{ o.amount }}</div>
                    <div class="mt-0.5">{{ o.when }}</div>
                  </div>
                </div>
              }

              @if (recentOrders().length === 0) {
                <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                  No orders yet. Place an order from the storefront to populate this list.
                </div>
              }
            </div>
          </section>

          <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="text-sm font-semibold text-slate-900">Requests</div>
            <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <div class="text-xs font-semibold text-slate-500">Low stock products</div>
                <div class="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                  {{ metric('lowStock') ?? '—' }}
                </div>
                <div class="mt-1 text-xs text-slate-500">Active products with stock &lt; 5</div>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <div class="text-xs font-semibold text-slate-500">Pending payment</div>
                <div class="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                  {{ metric('pendingPayment') ?? '—' }}
                </div>
                <div class="mt-1 text-xs text-slate-500">Orders in PENDING_PAYMENT</div>
              </div>
            </div>
          </section>
        </div>

        <!-- Right column -->
        <div class="space-y-6">
          <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="text-sm font-semibold text-slate-900">Members’ Status</div>
            <div class="mt-4 space-y-3">
              <div class="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <lucide-angular [img]="CircleCheckBigIcon" class="h-5 w-5" />
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-slate-900">Products</div>
                    <div class="text-xs text-slate-500">{{ metric('products') ?? '—' }} total</div>
                  </div>
                </div>
                <div class="text-xs font-semibold text-slate-500">Active</div>
              </div>

              <div class="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                    <lucide-angular [img]="Clock3Icon" class="h-5 w-5" />
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-slate-900">Orders</div>
                    <div class="text-xs text-slate-500">{{ metric('orders') ?? '—' }} total</div>
                  </div>
                </div>
                <div class="text-xs font-semibold text-slate-500">All</div>
              </div>

              <div class="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
                    <lucide-angular [img]="UserIcon" class="h-5 w-5" />
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-slate-900">Users</div>
                    <div class="text-xs text-slate-500">{{ metric('users') ?? '—' }} total</div>
                  </div>
                </div>
                <div class="text-xs font-semibold text-slate-500">All</div>
              </div>
            </div>
          </section>

          <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="text-sm font-semibold text-slate-900">System</div>
                <div class="mt-1 text-xs text-slate-500">Config & access</div>
              </div>
              <button
                type="button"
                class="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                (click)="refresh()"
                [disabled]="status() === 'loading'"
              >
                @if (status() === 'loading') { Refreshing… } @else { Refresh }
              </button>
            </div>

            <div class="mt-4 space-y-3 text-sm">
              <div class="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <div class="text-slate-600">Project</div>
                <div class="font-mono text-xs text-slate-700">{{ projectId() }}</div>
              </div>
              <div class="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <div class="text-slate-600">Functions region</div>
                <div class="font-mono text-xs text-slate-700">{{ region() }}</div>
              </div>
              <div class="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <div class="text-slate-600">Admin UID</div>
                <div class="font-mono text-xs text-slate-700">{{ auth.user()?.uid }}</div>
              </div>
              <div class="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <div class="text-slate-600">Updated</div>
                <div class="text-xs font-semibold text-slate-700">{{ lastUpdated() }}</div>
              </div>
            </div>

            @if (status() === 'error') {
              <div class="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
                {{ error() }}
              </div>
            }
          </section>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardPage {
  readonly EllipsisIcon = Ellipsis;
  readonly PackageIcon = Package;
  readonly CircleCheckBigIcon = CircleCheckBig;
  readonly Clock3Icon = Clock3;
  readonly UserIcon = User;

  auth = inject(AuthService);
  private db = injectFirestore();

  firebaseConfigured = computed(() => Boolean(environment.firebase?.apiKey));
  projectId = computed(() => environment.firebase?.projectId ?? '—');
  region = computed(() => environment.functionsRegion ?? 'us-central1');

  status = signal<'idle' | 'loading' | 'error'>('idle');
  error = signal<string | null>(null);
  lastUpdated = signal<string>('—');

  metrics = signal<Record<string, number | null>>({
    products: null,
    users: null,
    orders: null,
    pendingPayment: null,
    lowStock: null
  });

  activeUsers = signal<
    Array<{
      uid: string;
      firstName: string;
      lastName: string;
      photoURL?: string | null;
      statusBadge?: 'paused' | 'alert';
    }>
  >([]);

  recentOrders = signal<
    Array<{
      id: string;
      status: string;
      subtitle: string;
      when: string;
      amount: string;
    }>
  >([]);

  constructor() {
    if (this.firebaseConfigured()) void this.refresh();
  }

  metric(key: keyof ReturnType<AdminDashboardPage['metrics']>) {
    return this.metrics()[key as any] ?? null;
  }

  initialsFor(u: { firstName: string; lastName: string }) {
    const a = u.firstName?.[0] ?? 'A';
    const b = u.lastName?.[0] ?? '';
    return (a + b).toUpperCase();
  }

  private fmtCurrency(cents: number, currency: string) {
    try {
      const v = (Number(cents ?? 0) || 0) / 100;
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(v);
    } catch {
      return `$${(((Number(cents ?? 0) || 0) / 100) as any).toFixed?.(2) ?? '0.00'}`;
    }
  }

  private fmtDate(value: any) {
    const d =
      typeof value?.toDate === 'function' ? (value.toDate() as Date) : value instanceof Date ? value : value ? new Date(value) : null;
    if (!d || isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
  }

  async refresh() {
    if (!this.firebaseConfigured()) return;
    if (!this.db) {
      this.status.set('error');
      this.error.set('Firestore is not available (provider not initialized).');
      return;
    }

    this.status.set('loading');
    this.error.set(null);

    try {
      const productsQ = query(collection(this.db, 'products'));
      const usersQ = query(collection(this.db, 'users'));
      const ordersQ = query(collection(this.db, 'orders'));

      const [productsCount, usersCount, ordersCount] = await Promise.all([
        getCountFromServer(productsQ),
        getCountFromServer(usersQ),
        getCountFromServer(ordersQ)
      ]);

      let pendingPayment: number | null = null;
      try {
        const pendingQ = query(collection(this.db, 'orders'), where('status', '==', 'PENDING_PAYMENT'));
        pendingPayment = (await getCountFromServer(pendingQ)).data().count;
      } catch {
        pendingPayment = null;
      }

      let lowStock: number | null = null;
      try {
        const lowStockQ = query(collection(this.db, 'products'), where('active', '==', true), where('stock', '<', 5));
        lowStock = (await getCountFromServer(lowStockQ)).data().count;
      } catch {
        lowStock = null;
      }

      // Recent orders
      const ordersSnap = await getDocs(query(collection(this.db, 'orders'), orderBy('createdAt', 'desc'), limit(3)));
      this.recentOrders.set(
        ordersSnap.docs.map((d) => {
          const data = d.data() as any;
          const status = String(data.status ?? '—');
          const currency = String(data.currency ?? 'USD');
          const totalCents = Number(data.totalCents ?? 0);
          const userId = String(data.userId ?? '');
          return {
            id: d.id,
            status,
            subtitle: userId ? `User • ${userId}` : 'Order',
            when: this.fmtDate(data.createdAt),
            amount: this.fmtCurrency(totalCents, currency)
          };
        })
      );

      // "Currently active" (latest users)
      const usersSnap = await getDocs(query(collection(this.db, 'users'), orderBy('updatedAt', 'desc'), limit(8)));
      this.activeUsers.set(
        usersSnap.docs.map((d, idx) => {
          const data = d.data() as any;
          const display = String(data.displayName ?? data.email ?? 'User');
          const [first, ...rest] = display.split(/\s+/).filter(Boolean);
          const firstName = first ?? 'User';
          const lastName = rest.join(' ') || '';
          const statusBadge = idx === 3 ? 'paused' : idx === 4 ? 'alert' : undefined; // decorative, matches reference UI
          return {
            uid: String(data.uid ?? d.id),
            firstName,
            lastName,
            photoURL: (data.photoURL ?? null) as string | null,
            statusBadge
          };
        })
      );

      this.metrics.set({
        products: productsCount.data().count,
        users: usersCount.data().count,
        orders: ordersCount.data().count,
        pendingPayment,
        lowStock
      });

      this.lastUpdated.set(new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date()));
      this.status.set('idle');
    } catch (e: any) {
      this.status.set('error');
      this.error.set(e?.message ?? String(e));
    }
  }
}


