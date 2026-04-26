import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TENANT_CONTEXT } from '../../core/host-routing';
import { StoreService } from '../../core/store.service';
import { TenantCustomerAuthService } from '../../core/tenant-customer-auth.service';

@Component({
  selector: 'app-store-account-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="mx-auto max-w-3xl px-6 py-8">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">My account</h1>
      <p class="mt-1 text-sm text-slate-500">Customer account for this store only.</p>

      <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <div class="text-xs uppercase tracking-wide text-slate-500">Email</div>
        <div class="mt-1 text-sm font-semibold text-slate-900">{{ customer()?.email }}</div>

        <div class="mt-4">
          <label class="mb-1 block text-sm font-semibold text-slate-700">Full name</label>
          <input
            type="text"
            class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
            [value]="fullName()"
            (input)="fullName.set(($any($event.target).value ?? '').toString())"
          />
        </div>

        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-semibold text-slate-700">Phone</label>
            <input
              type="text"
              class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
              [value]="phone()"
              (input)="phone.set(($any($event.target).value ?? '').toString())"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-semibold text-slate-700">Location</label>
            <input
              type="text"
              class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
              [value]="location()"
              (input)="location.set(($any($event.target).value ?? '').toString())"
            />
          </div>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            [disabled]="saving() || !storeId()"
            (click)="save()"
          >
            {{ saving() ? 'Saving...' : 'Save profile' }}
          </button>
          <a [routerLink]="ordersLink()" class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Orders
          </a>
          <button
            type="button"
            class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            (click)="signOut()"
          >
            Sign out
          </button>
        </div>

        @if (message()) {
          <div class="mt-3 text-sm text-slate-600">{{ message() }}</div>
        }
      </div>
    </div>
  `
})
export class StoreAccountPage {
  private customerAuth = inject(TenantCustomerAuthService);
  private storeService = inject(StoreService);
  private router = inject(Router);
  private tenant = inject(TENANT_CONTEXT, { optional: true });

  customer = this.customerAuth.customer;
  storeId = computed(() => this.storeService.viewingStore()?.id ?? '');
  storeSlug = computed(() => this.tenant?.slug ?? this.storeService.viewingStore()?.slug ?? '');
  ordersLink = computed(() => this.tenant ? ['/account/orders'] : ['/store', this.storeSlug(), 'account', 'orders']);
  fullName = signal('');
  phone = signal('');
  location = signal('');
  saving = signal(false);
  message = signal<string | null>(null);

  constructor() {
    effect(() => {
      const c = this.customer();
      this.fullName.set(c?.fullName ?? '');
      this.phone.set(c?.phone ?? '');
      this.location.set(c?.location ?? '');
    });
  }

  async save() {
    const storeId = this.storeId();
    if (!storeId) return;
    this.saving.set(true);
    this.message.set(null);
    try {
      await this.customerAuth.updateProfile(storeId, {
        fullName: this.fullName().trim(),
        phone: this.phone().trim(),
        location: this.location().trim()
      });
      this.message.set('Profile updated.');
    } catch (e: any) {
      this.message.set(e?.message ?? 'Failed to update profile.');
    } finally {
      this.saving.set(false);
    }
  }

  async signOut() {
    const storeId = this.storeId();
    if (!storeId) return;
    await this.customerAuth.signOut(storeId);
    const target = this.tenant ? '/account/sign-in' : `/store/${this.storeSlug()}/account/sign-in`;
    await this.router.navigateByUrl(target);
  }
}
