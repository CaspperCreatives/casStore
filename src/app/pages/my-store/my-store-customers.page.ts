import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Users } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { StoreOrdersService } from '../../core/store-orders.service';
import { StoreService } from '../../core/store.service';

@Component({
  selector: 'app-my-store-customers-page',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-xl font-semibold text-slate-900">Customers</h1>
          <p class="mt-0.5 text-xs text-slate-500">Signed-in buyers and guest checkouts for this store.</p>
        </div>
        <input
          [(ngModel)]="query"
          (ngModelChange)="search()"
          type="search"
          placeholder="Search name, email, phone..."
          class="w-full max-w-xs rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900"
        />
      </div>

      @if (status() === 'loading') {
        <div class="space-y-3">
          @for (_ of [1,2,3,4]; track _) {
            <div class="h-16 animate-pulse rounded-2xl border border-slate-200 bg-white"></div>
          }
        </div>
      } @else if (customers().length === 0) {
        <div class="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <lucide-angular [img]="UsersIcon" class="mx-auto h-12 w-12 text-slate-300" />
          <div class="mt-3 font-semibold text-slate-700">No customers yet</div>
          <p class="mt-1 text-sm text-slate-500">Customers will appear here after they place an order.</p>
        </div>
      } @else {
        <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th class="px-3 py-3">Customer</th>
                  <th class="px-3 py-3">Contact</th>
                  <th class="px-3 py-3">Location</th>
                  <th class="px-3 py-3">Type</th>
                  <th class="px-3 py-3">Orders</th>
                  <th class="px-3 py-3">Spent</th>
                </tr>
              </thead>
              <tbody>
                @for (c of customers(); track c.id) {
                  <tr class="border-t border-slate-100">
                    <td class="px-3 py-3 font-semibold text-slate-900">{{ c.fullName || '—' }}</td>
                    <td class="px-3 py-3 text-slate-700">
                      <div>{{ c.email || '—' }}</div>
                      @if (c.phone) {
                        <div class="text-xs text-slate-500">{{ c.phone }}</div>
                      }
                    </td>
                    <td class="px-3 py-3 text-slate-700">{{ c.location || '—' }}</td>
                    <td class="px-3 py-3">
                      <span class="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {{ c.type === 'registered' ? 'Registered' : 'Guest' }}
                      </span>
                    </td>
                    <td class="px-3 py-3 text-slate-700">{{ c.ordersCount }}</td>
                    <td class="px-3 py-3 font-semibold text-slate-900">{{ fmtCurrency(c.totalSpentCents, 'USD') }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `
})
export class MyStoreCustomersPage {
  readonly UsersIcon = Users;

  private storeService = inject(StoreService);
  private ordersService = inject(StoreOrdersService);

  customers = this.ordersService.customers;
  status = this.ordersService.status;
  query = '';

  constructor() {
    void this.search();
  }

  async search() {
    const storeId = this.storeService.storeId();
    if (!storeId) return;
    await this.ordersService.loadStoreCustomers(storeId, this.query).catch(() => {});
  }

  fmtCurrency(cents: number, currency: string) {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(cents / 100);
    } catch {
      return `$${(cents / 100).toFixed(2)}`;
    }
  }
}
