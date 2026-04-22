import { Component, computed, inject, signal } from '@angular/core';
import { LucideAngularModule, MailWarning, RefreshCw, X } from 'lucide-angular';
import { AuthService } from '../core/auth.service';

/**
 * Banner shown on authenticated layouts when the current user's email is not
 * yet verified. Offers a "Resend" button that calls
 * `AuthService.sendVerificationEmail()` with a local 60s debounce to match the
 * backend rate limit.
 *
 * The banner hides itself when:
 *   - the user is signed out
 *   - `user.emailVerified` becomes true
 *   - the user dismisses it (per-session, stored in memory)
 */
@Component({
  selector: 'app-verify-email-banner',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    @if (visible()) {
      <div class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm sm:px-5">
        <div class="flex flex-wrap items-start gap-3 sm:flex-nowrap sm:items-center">
          <div class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <lucide-angular [img]="MailWarningIcon" class="h-5 w-5" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-sm font-semibold text-amber-900">Verify your email address</div>
            <p class="mt-0.5 text-xs leading-relaxed text-amber-800">
              @if (status() === 'sent') {
                We just sent a fresh verification email to
                <span class="font-semibold">{{ userEmail() }}</span>. Open it to finish securing your account.
              } @else if (status() === 'error') {
                {{ error() || errorFallback }}
              } @else {
                We sent a verification link to
                <span class="font-semibold">{{ userEmail() }}</span>. Check your inbox, or resend it below.
              }
            </p>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <button
              type="button"
              (click)="resend()"
              [disabled]="!canResend()"
              class="inline-flex items-center gap-1.5 rounded-2xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-100 disabled:opacity-50"
            >
              <lucide-angular [img]="RefreshCwIcon" class="h-3.5 w-3.5" [class.animate-spin]="status() === 'sending'" />
              @if (status() === 'sending') {
                <span>Sending…</span>
              } @else if (cooldownRemaining() > 0) {
                <span>Resend in {{ cooldownRemaining() }}s</span>
              } @else {
                <span>Resend</span>
              }
            </button>
            <button
              type="button"
              (click)="dismiss()"
              aria-label="Dismiss"
              class="tap-target inline-flex items-center justify-center rounded-xl text-amber-700 hover:bg-amber-100"
            >
              <lucide-angular [img]="XIcon" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class VerifyEmailBannerComponent {
  readonly MailWarningIcon = MailWarning;
  readonly RefreshCwIcon = RefreshCw;
  readonly XIcon = X;

  private authService = inject(AuthService);

  private dismissed = signal(false);
  private cooldownUntil = signal(0);
  private tick = signal(Date.now());

  readonly status = signal<'idle' | 'sending' | 'sent' | 'error'>('idle');
  readonly error = signal<string | null>(null);
  readonly errorFallback = "We couldn't send a verification email right now.";

  readonly userEmail = computed(() => this.authService.user()?.email ?? 'your inbox');

  readonly visible = computed(() => {
    if (this.dismissed()) return false;
    const u = this.authService.user();
    if (!u) return false;
    // Only surface for email/password accounts — SSO providers mark
    // emailVerified=true automatically.
    if (u.emailVerified) return false;
    const providers = u.providerData?.map((p) => p.providerId) ?? [];
    if (providers.length > 0 && !providers.includes('password')) return false;
    return true;
  });

  readonly cooldownRemaining = computed(() => {
    // Depend on `tick` so the countdown re-renders every second.
    const _ = this.tick();
    const remainingMs = this.cooldownUntil() - Date.now();
    return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
  });

  readonly canResend = computed(
    () => this.status() !== 'sending' && this.cooldownRemaining() === 0
  );

  constructor() {
    // Keep the countdown display live by nudging the tick signal every second
    // whenever the banner is actually visible.
    setInterval(() => {
      if (this.visible() && this.cooldownUntil() > Date.now()) {
        this.tick.set(Date.now());
      }
    }, 1000);
  }

  async resend() {
    if (!this.canResend()) return;
    this.status.set('sending');
    this.error.set(null);
    try {
      const result = await this.authService.sendVerificationEmail();
      if (result.alreadyVerified) {
        await this.authService.refreshUser();
        this.dismissed.set(true);
        return;
      }
      this.status.set('sent');
      this.cooldownUntil.set(Date.now() + 60_000);
      this.tick.set(Date.now());
    } catch (e: any) {
      this.status.set('error');
      this.error.set(e?.message ?? 'Unable to send verification email right now.');
      this.cooldownUntil.set(Date.now() + 30_000);
      this.tick.set(Date.now());
    }
  }

  dismiss() {
    this.dismissed.set(true);
  }
}
