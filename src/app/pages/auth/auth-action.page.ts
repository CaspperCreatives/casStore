import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { applyActionCode, confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
  Lock,
  LucideAngularModule,
  MailCheck,
  TriangleAlert
} from 'lucide-angular';
import { AuthService } from '../../core/auth.service';
import { injectAuth } from '../../core/firebase';

type Mode = 'verifyEmail' | 'resetPassword' | 'recoverEmail' | 'unknown';

type PhaseVerify = 'idle' | 'loading' | 'success' | 'error';
type PhaseReset = 'loading' | 'ready' | 'saving' | 'success' | 'error';

/**
 * Handles Firebase Auth email-link actions (sent via Postmark).
 *
 * Firebase delivers the user here with `?mode=...&oobCode=...` params. We then
 * finish the action in-app using the Firebase Web SDK so the UX stays on our
 * domain instead of handing off to Firebase's default hosted page.
 */
@Component({
  selector: 'app-auth-action-page',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  template: `
    <div class="flex min-h-[70vh] items-center justify-center bg-slate-50/50 py-12">
      <div class="w-full max-w-[440px] px-6">

        @switch (mode()) {

          @case ('verifyEmail') {
            <div class="mb-10 text-center">
              <h1 class="text-3xl font-bold tracking-tight text-slate-900">Verify email</h1>
              <p class="mt-3 text-slate-500">Confirming your email address…</p>
            </div>

            <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
              @if (verifyPhase() === 'loading') {
                <div class="flex flex-col items-center gap-3 py-6 text-slate-600">
                  <lucide-angular [img]="LoaderCircleIcon" class="h-8 w-8 animate-spin text-slate-400" />
                  <p class="text-sm">Verifying your email address…</p>
                </div>
              }

              @if (verifyPhase() === 'success') {
                <div class="flex flex-col items-center gap-4 py-4 text-center">
                  <div class="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <lucide-angular [img]="MailCheckIcon" class="h-7 w-7" />
                  </div>
                  <div>
                    <div class="text-lg font-bold text-slate-900">Email verified</div>
                    <p class="mt-1 text-sm text-slate-500">Your email address is confirmed. You can keep using CasStore as usual.</p>
                  </div>
                  <a routerLink="/" class="group mt-2 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800">
                    Continue
                    <lucide-angular [img]="ArrowRightIcon" class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                </div>
              }

              @if (verifyPhase() === 'error') {
                <div class="flex flex-col items-center gap-4 py-4 text-center">
                  <div class="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <lucide-angular [img]="CircleAlertIcon" class="h-7 w-7" />
                  </div>
                  <div>
                    <div class="text-lg font-bold text-slate-900">Couldn't verify email</div>
                    <p class="mt-1 text-sm text-slate-500">{{ error() || 'This verification link may be expired or already used.' }}</p>
                  </div>
                  <a routerLink="/account" class="mt-2 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Go to account
                  </a>
                </div>
              }
            </div>
          }

          @case ('resetPassword') {
            <div class="mb-10 text-center">
              <h1 class="text-3xl font-bold tracking-tight text-slate-900">Choose a new password</h1>
              <p class="mt-3 text-slate-500">
                @if (resetEmail()) {
                  For {{ resetEmail() }}
                } @else {
                  Resetting your CasStore password.
                }
              </p>
            </div>

            <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
              @if (resetPhase() === 'loading') {
                <div class="flex flex-col items-center gap-3 py-6 text-slate-600">
                  <lucide-angular [img]="LoaderCircleIcon" class="h-8 w-8 animate-spin text-slate-400" />
                  <p class="text-sm">Validating your reset link…</p>
                </div>
              }

              @if (resetPhase() === 'ready' || resetPhase() === 'saving') {
                <form class="space-y-5" (submit)="$event.preventDefault(); submitNewPassword()">
                  <div class="space-y-1.5">
                    <label class="text-[13px] font-semibold uppercase tracking-wider text-slate-700" for="pw1">
                      New password
                    </label>
                    <div class="relative">
                      <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <lucide-angular [img]="LockIcon" class="h-4.5 w-4.5" />
                      </div>
                      <input
                        id="pw1"
                        type="password"
                        autocomplete="new-password"
                        class="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                        [value]="newPassword()"
                        (input)="newPassword.set(($any($event.target).value ?? '').toString())"
                        placeholder="••••••••"
                      />
                    </div>
                    <p class="text-[11px] text-slate-400 leading-normal px-1">
                      Must be at least 6 characters long.
                    </p>
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-[13px] font-semibold uppercase tracking-wider text-slate-700" for="pw2">
                      Confirm new password
                    </label>
                    <div class="relative">
                      <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <lucide-angular [img]="LockIcon" class="h-4.5 w-4.5" />
                      </div>
                      <input
                        id="pw2"
                        type="password"
                        autocomplete="new-password"
                        class="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                        [value]="confirmPassword()"
                        (input)="confirmPassword.set(($any($event.target).value ?? '').toString())"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    class="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50"
                    [disabled]="!canSaveReset() || resetPhase() === 'saving'"
                  >
                    @if (resetPhase() === 'saving') {
                      <lucide-angular [img]="LoaderCircleIcon" class="h-4 w-4 animate-spin text-white" />
                      <span>Saving new password…</span>
                    } @else {
                      <span>Save new password</span>
                      <lucide-angular [img]="ArrowRightIcon" class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    }
                  </button>

                  @if (error()) {
                    <div class="rounded-2xl border border-red-100 bg-red-50/50 px-4 py-3 text-sm text-red-600">
                      <div class="flex items-center gap-2">
                        <lucide-angular [img]="CircleAlertIcon" class="h-4.5 w-4.5 shrink-0" />
                        <span>{{ error() }}</span>
                      </div>
                    </div>
                  }
                </form>
              }

              @if (resetPhase() === 'success') {
                <div class="flex flex-col items-center gap-4 py-4 text-center">
                  <div class="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <lucide-angular [img]="CheckCircle2Icon" class="h-7 w-7" />
                  </div>
                  <div>
                    <div class="text-lg font-bold text-slate-900">Password updated</div>
                    <p class="mt-1 text-sm text-slate-500">You can now sign in with your new password.</p>
                  </div>
                  <a routerLink="/sign-in" class="group mt-2 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800">
                    Go to sign in
                    <lucide-angular [img]="ArrowRightIcon" class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                </div>
              }

              @if (resetPhase() === 'error') {
                <div class="flex flex-col items-center gap-4 py-4 text-center">
                  <div class="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <lucide-angular [img]="TriangleAlertIcon" class="h-7 w-7" />
                  </div>
                  <div>
                    <div class="text-lg font-bold text-slate-900">Link no longer valid</div>
                    <p class="mt-1 text-sm text-slate-500">{{ error() || 'This reset link has expired or already been used.' }}</p>
                  </div>
                  <a routerLink="/reset-password" class="mt-2 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Request a new link
                  </a>
                </div>
              }
            </div>
          }

          @default {
            <div class="mb-10 text-center">
              <h1 class="text-3xl font-bold tracking-tight text-slate-900">Unsupported action</h1>
              <p class="mt-3 text-slate-500">This link doesn't specify a valid action. Please request a fresh email.</p>
            </div>
            <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
              <div class="flex flex-col items-center gap-3 text-center">
                <a routerLink="/sign-in" class="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">
                  Back to sign in
                </a>
              </div>
            </div>
          }

        }

      </div>
    </div>
  `
})
export class AuthActionPage {
  readonly LoaderCircleIcon = LoaderCircle;
  readonly MailCheckIcon = MailCheck;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly CircleAlertIcon = CircleAlert;
  readonly TriangleAlertIcon = TriangleAlert;
  readonly LockIcon = Lock;
  readonly ArrowRightIcon = ArrowRight;

  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private auth = injectAuth();

  readonly mode = signal<Mode>('unknown');
  readonly oobCode = signal<string>('');
  readonly error = signal<string | null>(null);

  readonly verifyPhase = signal<PhaseVerify>('idle');
  readonly resetPhase = signal<PhaseReset>('loading');
  readonly resetEmail = signal<string>('');
  readonly newPassword = signal('');
  readonly confirmPassword = signal('');

  readonly canSaveReset = computed(
    () =>
      this.newPassword().length >= 6 &&
      this.newPassword() === this.confirmPassword() &&
      !!this.oobCode() &&
      !!this.auth
  );

  constructor() {
    const qp = this.route.snapshot.queryParamMap;
    const rawMode = qp.get('mode') as Mode | null;
    const code = qp.get('oobCode') ?? '';
    this.oobCode.set(code);

    if (rawMode === 'verifyEmail' || rawMode === 'resetPassword' || rawMode === 'recoverEmail') {
      this.mode.set(rawMode);
    } else {
      this.mode.set('unknown');
    }

    if (!code) {
      this.error.set('This link is missing its security code.');
      if (this.mode() === 'verifyEmail') this.verifyPhase.set('error');
      if (this.mode() === 'resetPassword') this.resetPhase.set('error');
      return;
    }

    if (!this.auth) {
      this.error.set('Firebase is not configured for this environment.');
      if (this.mode() === 'verifyEmail') this.verifyPhase.set('error');
      if (this.mode() === 'resetPassword') this.resetPhase.set('error');
      return;
    }

    if (this.mode() === 'verifyEmail') void this.runVerifyEmail();
    if (this.mode() === 'resetPassword') void this.prepareResetPassword();
    // `recoverEmail` is not implemented because we don't offer email-change
    // flows yet — falls through to the default "unsupported action" view.
  }

  private async runVerifyEmail() {
    if (!this.auth) return;
    this.verifyPhase.set('loading');
    this.error.set(null);
    try {
      await applyActionCode(this.auth, this.oobCode());
      // Refresh the ID token so `emailVerified` flips immediately in-app.
      await this.authService.refreshUser();
      this.verifyPhase.set('success');
    } catch (e: any) {
      this.verifyPhase.set('error');
      this.error.set(this.readableError(e));
    }
  }

  private async prepareResetPassword() {
    if (!this.auth) return;
    this.resetPhase.set('loading');
    this.error.set(null);
    try {
      const email = await verifyPasswordResetCode(this.auth, this.oobCode());
      this.resetEmail.set(email);
      this.resetPhase.set('ready');
    } catch (e: any) {
      this.resetPhase.set('error');
      this.error.set(this.readableError(e));
    }
  }

  async submitNewPassword() {
    if (!this.auth) return;
    if (!this.canSaveReset()) return;
    this.resetPhase.set('saving');
    this.error.set(null);
    try {
      await confirmPasswordReset(this.auth, this.oobCode(), this.newPassword());
      this.resetPhase.set('success');
    } catch (e: any) {
      this.resetPhase.set('ready');
      this.error.set(this.readableError(e));
    }
  }

  private readableError(e: any): string {
    const code = e?.code;
    switch (code) {
      case 'auth/expired-action-code':
        return 'This link has expired. Please request a new one.';
      case 'auth/invalid-action-code':
        return 'This link is invalid or has already been used.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/user-not-found':
        return "We couldn't find the matching account for this link.";
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.';
      default:
        return e?.message ?? 'Something went wrong. Please try again.';
    }
  }
}
