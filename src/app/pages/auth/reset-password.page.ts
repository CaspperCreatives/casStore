import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex min-h-[70vh] items-center justify-center bg-slate-50/50 py-12">
      <div class="w-full max-w-[440px] px-6">
        <div class="mb-10 text-center">
          <h1 class="text-3xl font-bold tracking-tight text-slate-900">Reset password</h1>
          <p class="mt-3 text-slate-500">We will email a reset link to your account.</p>
        </div>

        <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
          @if (!firebaseConfigured()) {
            <div class="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Add Firebase config in <code class="font-mono text-[11px] font-bold">environment.ts</code>
            </div>
          }

          <form class="space-y-5" (submit)="$event.preventDefault(); submit()">
            <div class="space-y-1.5">
              <label class="text-[13px] font-semibold uppercase tracking-wider text-slate-700" for="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                class="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none transition-all focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                [value]="email()"
                (input)="email.set(($any($event.target).value ?? '').toString())"
                placeholder="name@example.com"
                autocomplete="email"
              />
            </div>

            <button
              type="submit"
              class="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50"
              [disabled]="!firebaseConfigured() || !canSubmit() || status() === 'loading'"
            >
              @if (status() === 'loading') {
                <span>Sending reset link...</span>
              } @else {
                <span>Send reset link</span>
              }
            </button>
          </form>

          @if (status() === 'success') {
            <div class="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-3.5 text-sm text-emerald-700">
              If an account exists for this email, a reset link has been sent.
            </div>
          }

          @if (status() === 'error') {
            <div class="mt-6 rounded-2xl border border-red-100 bg-red-50/50 px-4 py-3.5 text-sm text-red-600">
              {{ error() }}
            </div>
          }

          <p class="mt-8 text-center text-sm text-slate-500">
            Remembered your password?
            <a routerLink="/sign-in" class="font-bold text-slate-900 hover:underline">Back to sign in</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class ResetPasswordPage {
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);

  firebaseConfigured = computed(() => Boolean(environment.firebase?.apiKey));
  email = signal(this.route.snapshot.queryParamMap.get('email') ?? '');
  canSubmit = computed(() => this.email().trim().length > 0);

  status = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  error = signal<string | null>(null);

  async submit() {
    this.status.set('loading');
    this.error.set(null);
    try {
      await this.auth.sendPasswordReset(this.email());
      this.status.set('success');
    } catch (e: any) {
      this.status.set('error');
      this.error.set(this.readableAuthError(e));
    }
  }

  private readableAuthError(e: any): string {
    const code = e?.code;
    if (code === 'auth/missing-email') return 'Please enter your email address.';
    if (code === 'auth/invalid-email') return 'Enter a valid email address.';
    if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait and try again.';
    return e?.message ?? 'Unable to send reset email right now. Please try again.';
  }
}
