import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StoreService } from '../../core/store.service';
import { TenantCustomerAuthService } from '../../core/tenant-customer-auth.service';
import { TENANT_CONTEXT } from '../../core/host-routing';

@Component({
  selector: 'app-store-account-sign-up-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="mx-auto max-w-md px-6 py-10">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Create customer account</h1>
      <p class="mt-1 text-sm text-slate-500">Use this account only inside this store.</p>

      <form class="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5" (submit)="$event.preventDefault(); submit()">
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700">Full name</label>
          <input
            type="text"
            class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
            [value]="fullName()"
            (input)="fullName.set(($any($event.target).value ?? '').toString())"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700">Email</label>
          <input
            type="email"
            class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
            [value]="email()"
            (input)="email.set(($any($event.target).value ?? '').toString())"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700">Password</label>
          <input
            type="password"
            class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
            [value]="password()"
            (input)="password.set(($any($event.target).value ?? '').toString())"
          />
        </div>
        <button
          type="submit"
          class="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          [disabled]="status() === 'loading' || !canSubmit() || !storeId()"
        >
          {{ status() === 'loading' ? 'Creating account...' : 'Create account' }}
        </button>
      </form>

      @if (error()) {
        <div class="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ error() }}</div>
      }

      <p class="mt-4 text-sm text-slate-600">
        Already have an account?
        <a [routerLink]="signInLink()" class="font-semibold text-slate-900 hover:underline">Sign in</a>
      </p>
    </div>
  `
})
export class StoreAccountSignUpPage {
  private storeService = inject(StoreService);
  private customerAuth = inject(TenantCustomerAuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tenant = inject(TENANT_CONTEXT, { optional: true });

  fullName = signal('');
  email = signal('');
  password = signal('');
  status = signal<'idle' | 'loading' | 'error'>('idle');
  error = signal<string | null>(null);
  storeId = computed(() => this.storeService.viewingStore()?.id ?? '');
  storeSlug = computed(() => this.tenant?.slug ?? this.storeService.viewingStore()?.slug ?? '');
  canSubmit = computed(() => this.email().trim().length > 0 && this.password().length >= 8 && this.fullName().trim().length > 0);
  signInLink = computed(() => this.tenant ? ['/account/sign-in'] : ['/store', this.storeSlug(), 'account', 'sign-in']);

  async submit() {
    const storeId = this.storeId();
    if (!storeId) {
      this.error.set('Store is not ready yet. Please try again.');
      return;
    }
    this.status.set('loading');
    this.error.set(null);
    try {
      await this.customerAuth.signUp({
        storeId,
        fullName: this.fullName().trim(),
        email: this.email().trim(),
        password: this.password()
      });
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      await this.router.navigateByUrl(returnUrl || '/account');
      this.status.set('idle');
    } catch (e: any) {
      this.status.set('error');
      this.error.set(e?.message ?? 'Unable to create account.');
    }
  }
}
