import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth.service';
import { StoreService } from '../../core/store.service';
import { LucideAngularModule, LogOut, Package, Save, Store, User } from 'lucide-angular';
import { VerifyEmailBannerComponent } from '../../shared/verify-email-banner.component';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [RouterLink, FormsModule, LucideAngularModule, VerifyEmailBannerComponent],
  template: `
    <div class="mx-auto max-w-2xl">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold tracking-tight">Account</h1>
        <p class="text-sm text-slate-600">Manage your profile and store</p>
      </div>

      <div class="mb-4">
        <app-verify-email-banner />
      </div>

      @if (!firebaseConfigured()) {
        <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Configure Firebase to enable account features.
        </div>
      } @else {
        <!-- Profile card -->
        <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div class="flex items-center gap-4 border-b border-slate-100 px-6 py-5">
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-lg font-bold text-white shrink-0">
              @if (photoUrl()) {
                <img [src]="photoUrl()!" alt="" class="h-full w-full rounded-full object-cover" />
              } @else {
                {{ initials() }}
              }
            </div>
            <div>
              <div class="font-semibold text-slate-900">{{ displayName() || email() }}</div>
              <div class="text-sm text-slate-500">{{ email() }}</div>
            </div>
          </div>

          <!-- Edit name -->
          <div class="px-6 py-5">
            <h2 class="font-semibold text-slate-900">Profile</h2>
            <div class="mt-4 space-y-4">
              <div>
                <label class="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Display name</label>
                <input type="text" [(ngModel)]="newName" [placeholder]="displayName() || 'Your name'"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:bg-white" />
              </div>
              <div class="flex items-center gap-3">
                <button type="button"
                  class="flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                  [disabled]="profileStatus() === 'loading' || !newName.trim()"
                  (click)="saveName()">
                  <lucide-angular [img]="SaveIcon" class="h-4 w-4" />
                  {{ profileStatus() === 'loading' ? 'Saving...' : 'Save name' }}
                </button>
                @if (profileStatus() === 'success') {
                  <span class="text-sm text-emerald-600">Saved!</span>
                }
                @if (profileStatus() === 'error') {
                  <span class="text-sm text-red-600">{{ profileError() }}</span>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- My store link -->
        <div class="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 class="font-semibold text-slate-900">Your store</h2>
          @if (hasStore()) {
            <div class="mt-3 flex items-center justify-between gap-3">
              <div>
                <div class="font-semibold text-slate-800">{{ storeName() }}</div>
                <div class="text-xs text-slate-500">/store/{{ storeSlug() }}</div>
              </div>
              <a routerLink="/my-store" class="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                <lucide-angular [img]="StoreIcon" class="h-4 w-4" />
                Manage store
              </a>
            </div>
          } @else {
            <p class="mt-2 text-sm text-slate-500">You haven't created a store yet.</p>
            <a routerLink="/create-store" class="mt-3 flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 w-fit">
              <lucide-angular [img]="StoreIcon" class="h-4 w-4" />
              Create your store
            </a>
          }
        </div>

        <!-- Orders link -->
        <a routerLink="/account/orders"
          class="mt-4 flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:bg-slate-50">
          <div class="flex items-center gap-3">
            <div class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
              <lucide-angular [img]="PackageIcon" class="h-5 w-5" />
            </div>
            <div>
              <div class="font-semibold text-slate-900">Order history</div>
              <div class="text-xs text-slate-500">View all your past orders</div>
            </div>
          </div>
          <span class="text-slate-400">→</span>
        </a>

        <!-- Sign out -->
        <div class="mt-4">
          <button type="button"
            class="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            (click)="signOut()">
            <lucide-angular [img]="LogOutIcon" class="h-4 w-4 text-slate-400" />
            Sign out
          </button>
        </div>
      }
    </div>
  `
})
export class AccountPage {
  readonly SaveIcon = Save;
  readonly StoreIcon = Store;
  readonly PackageIcon = Package;
  readonly LogOutIcon = LogOut;
  readonly UserIcon = User;

  private authService = inject(AuthService);
  private storeService = inject(StoreService);
  private router = inject(Router);

  firebaseConfigured = computed(() => Boolean(environment.firebase?.apiKey));
  displayName = computed(() => this.authService.user()?.displayName ?? '');
  email = computed(() => this.authService.user()?.email ?? '');
  photoUrl = computed(() => this.authService.user()?.photoURL ?? null);
  hasStore = computed(() => this.storeService.hasStore());
  storeName = computed(() => this.storeService.store()?.name ?? '');
  storeSlug = computed(() => this.storeService.storeSlug() ?? '');

  initials = computed(() => {
    const name = this.displayName() || this.email() || 'U';
    const parts = name.split(/[\s@]+/).filter(Boolean);
    return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
  });

  newName = '';
  profileStatus = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  profileError = signal<string | null>(null);

  constructor() {
    this.newName = this.authService.user()?.displayName ?? '';
    if (this.firebaseConfigured()) void this.storeService.loadMyStore();
  }

  async saveName() {
    const name = this.newName.trim();
    if (!name) return;
    this.profileStatus.set('loading');
    this.profileError.set(null);
    try {
      await this.authService.updateDisplayName(name);
      this.profileStatus.set('success');
      setTimeout(() => this.profileStatus.set('idle'), 3000);
    } catch (e: any) {
      this.profileStatus.set('error');
      this.profileError.set(e?.message ?? String(e));
    }
  }

  async signOut() {
    await this.authService.signOut();
    await this.router.navigateByUrl('/sign-in');
  }
}
