import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth.service';
import { StoreService } from '../../core/store.service';
import { ArrowRight, Chrome, CircleAlert, LoaderCircle, Lock, LucideAngularModule, Mail, TriangleAlert } from 'lucide-angular';

@Component({
  selector: 'app-sign-up-page',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  template: `
    <div class="flex min-h-[70vh] items-center justify-center bg-slate-50/50 py-12">
      <div class="w-full max-w-[440px] px-6">
        <div class="mb-10 text-center">
          <h1 class="text-3xl font-bold tracking-tight text-slate-900">Create an account</h1>
          <p class="mt-3 text-slate-500">Join CasStore to start shopping</p>
        </div>

        <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
          @if (!firebaseConfigured()) {
            <div class="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <div class="flex items-center gap-2">
                <lucide-angular [img]="TriangleAlertIcon" class="h-4 w-4 shrink-0" />
                <span>Add Firebase config in <code class="font-mono text-[11px] font-bold">environment.ts</code></span>
              </div>
            </div>
          }

          <form class="space-y-5" (submit)="$event.preventDefault(); submit()">
            <div class="space-y-1.5">
              <label class="text-[13px] font-semibold uppercase tracking-wider text-slate-700" for="email">
                Email Address
              </label>
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <lucide-angular [img]="MailIcon" class="h-4.5 w-4.5" />
                </div>
                <input
                  id="email"
                  type="email"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                  [value]="email()"
                  (input)="email.set(($any($event.target).value ?? '').toString())"
                  placeholder="name@example.com"
                  autocomplete="email"
                />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-[13px] font-semibold uppercase tracking-wider text-slate-700" for="password">
                Password
              </label>
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <lucide-angular [img]="LockIcon" class="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  type="password"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                  [value]="password()"
                  (input)="password.set(($any($event.target).value ?? '').toString())"
                  placeholder="••••••••"
                  autocomplete="new-password"
                />
              </div>
              <p class="text-[11px] text-slate-400 leading-normal px-1">
                Must be at least 6 characters long.
              </p>
            </div>

            <button
              type="submit"
              class="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50"
              [disabled]="!firebaseConfigured() || !canSubmit() || status() === 'loading'"
            >
              @if (status() === 'loading') {
                <lucide-angular [img]="LoaderCircleIcon" class="h-4 w-4 animate-spin text-white" />
                <span>Creating account...</span>
              } @else {
                <span>Create account</span>
                <lucide-angular [img]="ArrowRightIcon" class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              }
            </button>
          </form>

          @if (status() === 'error') {
            <div class="mt-6 rounded-2xl border border-red-100 bg-red-50/50 px-4 py-3.5 text-sm text-red-600">
              <div class="flex items-center gap-2.5">
                <lucide-angular [img]="CircleAlertIcon" class="h-4.5 w-4.5 shrink-0" />
                <p class="leading-relaxed">{{ error() }}</p>
              </div>
            </div>
          }

          <div class="mt-8 flex items-center gap-4">
            <div class="h-px flex-1 bg-slate-100"></div>
            <span class="text-[11px] font-bold uppercase tracking-widest text-slate-400">or join with</span>
            <div class="h-px flex-1 bg-slate-100"></div>
          </div>

          <div class="mt-6">
            <button type="button"
              class="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50"
              [disabled]="!firebaseConfigured() || status() === 'loading'"
              (click)="signUpWithGoogle()">
              <lucide-angular [img]="ChromeIcon" class="h-5 w-5" />
              <span>Continue with Google</span>
            </button>
          </div>
        </div>

        <p class="mt-10 text-center text-sm text-slate-500">
          Already have an account?
          <a routerLink="/sign-in" class="font-bold text-slate-900 hover:underline">Sign in</a>
        </p>

        <p class="mt-8 text-center text-[11px] leading-relaxed text-slate-400">
          By continuing, you agree to CasStore's
          <a class="underline hover:text-slate-600">Terms of Service</a> and
          <a class="underline hover:text-slate-600">Privacy Policy</a>.
        </p>
      </div>
    </div>
  `
})
export class SignUpPage {
  readonly TriangleAlertIcon = TriangleAlert;
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly LoaderCircleIcon = LoaderCircle;
  readonly ArrowRightIcon = ArrowRight;
  readonly CircleAlertIcon = CircleAlert;
  readonly ChromeIcon = Chrome;

  private auth = inject(AuthService);
  private store = inject(StoreService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  firebaseConfigured = computed(() => Boolean(environment.firebase?.apiKey));
  email = signal('');
  password = signal('');
  canSubmit = computed(() => this.email().trim().length > 0 && this.password().length >= 6);

  status = signal<'idle' | 'loading' | 'error'>('idle');
  error = signal<string | null>(null);

  async submit() {
    this.status.set('loading');
    this.error.set(null);
    try {
      const email = this.email().trim();
      if (!email) throw new Error('Please enter your email address.');
      if (this.password().length < 6) throw new Error('Password must be at least 6 characters.');

      const cred = await this.auth.signUp(email, this.password());
      await this.auth.refreshUser();
      const synced = await this.auth.waitForSignedInUser(cred.user.uid);
      if (!synced) {
        throw new Error('Account created, but your session is still syncing. Please sign in again.');
      }

      this.status.set('idle');

      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      if (returnUrl) {
        await this.router.navigateByUrl(returnUrl);
      } else {
        await this.router.navigateByUrl(await this.store.postAuthDestination(this.auth.canAccessAdmin()));
      }
    } catch (e: any) {
      this.status.set('error');
      this.error.set(this.readableAuthError(e));
    }
  }

  async signUpWithGoogle() {
    this.status.set('loading');
    this.error.set(null);
    try {
      const cred = await this.auth.signInWithGoogle();
      await this.auth.refreshUser();
      await this.auth.waitForSignedInUser(cred.user.uid);
      this.status.set('idle');
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      if (returnUrl) {
        await this.router.navigateByUrl(returnUrl);
      } else {
        await this.router.navigateByUrl(await this.store.postAuthDestination(this.auth.canAccessAdmin()));
      }
    } catch (e: any) {
      this.status.set('error');
      if (e?.code === 'auth/popup-closed-by-user') {
        this.status.set('idle');
        return;
      }
      this.error.set(this.readableAuthError(e));
    }
  }

  private readableAuthError(e: any): string {
    const code = e?.code;
    if (code === 'auth/missing-email') return 'Please enter your email address.';
    if (code === 'auth/invalid-email') return 'Enter a valid email address.';
    if (code === 'auth/email-already-in-use') return 'An account with this email already exists.';
    if (code === 'auth/weak-password') return 'Password must be at least 6 characters.';
    if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait and try again.';
    return e?.message ?? 'Unable to create account right now. Please try again.';
  }
}


