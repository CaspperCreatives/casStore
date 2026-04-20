import { Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/auth.service';
import { StoreService } from '../../core/store.service';
import {
  ArrowRight,
  BarChart2,
  LayoutDashboard,
  LogOut,
  LucideAngularModule,
  Package,
  Palette,
  ReceiptText,
  Settings,
  Store
} from 'lucide-angular';

@Component({
  selector: 'app-my-store-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <div class="min-h-dvh bg-slate-100 text-slate-900">
      <div class="mx-auto flex min-h-dvh w-full gap-6 px-4 py-4 max-w-[1400px]">

        <!-- Sidebar -->
        <aside class="hidden w-[260px] shrink-0 lg:block">
          <div class="sticky top-4 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
            <div class="flex items-center gap-2 px-2 py-2">
              <div
                class="inline-flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-bold text-white shrink-0"
                [style.background]="themeColor()"
              >
                {{ storeInitials() }}
              </div>
              <div class="min-w-0">
                <div class="truncate text-sm font-semibold text-slate-900">{{ storeName() }}</div>
                <div class="truncate text-xs text-slate-500">/store/{{ storeSlug() }}</div>
              </div>
            </div>

            <div class="mt-3 space-y-1 px-1">
              <a
                routerLink="/my-store"
                routerLinkActive="bg-slate-100 text-slate-900"
                [routerLinkActiveOptions]="{ exact: true }"
                class="group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50">
                  <lucide-angular [img]="LayoutDashboardIcon" class="h-5 w-5" />
                </span>
                <span class="font-semibold">Dashboard</span>
              </a>

              <a
                routerLink="/my-store/products"
                routerLinkActive="bg-slate-100 text-slate-900"
                class="group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50">
                  <lucide-angular [img]="PackageIcon" class="h-5 w-5" />
                </span>
                <span class="font-semibold">Products</span>
              </a>

              <a
                routerLink="/my-store/orders"
                routerLinkActive="bg-slate-100 text-slate-900"
                class="group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50">
                  <lucide-angular [img]="ReceiptTextIcon" class="h-5 w-5" />
                </span>
                <span class="font-semibold">Orders</span>
              </a>

              <a
                routerLink="/my-store/storefront"
                routerLinkActive="bg-slate-100 text-slate-900"
                class="group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50">
                  <lucide-angular [img]="PaletteIcon" class="h-5 w-5" />
                </span>
                <span class="font-semibold">Storefront</span>
              </a>

              <a
                routerLink="/my-store/settings"
                routerLinkActive="bg-slate-100 text-slate-900"
                class="group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50">
                  <lucide-angular [img]="SettingsIcon" class="h-5 w-5" />
                </span>
                <span class="font-semibold">Settings</span>
              </a>
            </div>

            <div class="mt-4 border-t border-slate-200 pt-3 space-y-1 px-1">
              @if (storeSlug()) {
                <a
                  [routerLink]="['/store', storeSlug()]"
                  class="flex items-center justify-between gap-3 rounded-2xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <div class="flex items-center gap-2">
                    <lucide-angular [img]="StoreIcon" class="h-4 w-4 text-slate-400" />
                    <span class="font-semibold">View storefront</span>
                  </div>
                  <lucide-angular [img]="ArrowRightIcon" class="h-4 w-4 text-slate-400" />
                </a>
              }
              <button
                type="button"
                class="flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                (click)="signOut()"
              >
                <div class="flex items-center gap-2">
                  <lucide-angular [img]="LogOutIcon" class="h-4 w-4 text-slate-400" />
                  <span class="font-semibold">Sign out</span>
                </div>
              </button>
            </div>
          </div>
        </aside>

        <!-- Content -->
        <div class="min-w-0 flex-1">
          <header class="sticky top-0 z-10 -mx-4 px-4 pb-4 pt-2 lg:mx-0 lg:px-0">
            <div class="rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
              <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-3 lg:hidden">
                  <div class="h-9 w-9 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                    <lucide-angular [img]="StoreIcon" class="h-5 w-5 text-slate-600" />
                  </div>
                  <span class="font-semibold text-sm">{{ storeName() }}</span>
                </div>
                <div class="hidden lg:block">
                  <span class="font-semibold text-slate-900">Store Manager</span>
                </div>
                <div class="flex items-center gap-3">
                  @if (storeSlug()) {
                    <a
                      [routerLink]="['/store', storeSlug()]"
                      class="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <lucide-angular [img]="StoreIcon" class="h-4 w-4 text-slate-400" />
                      Storefront
                    </a>
                  }
                </div>
              </div>
            </div>
          </header>

          <main class="pb-8">
            <router-outlet />
          </main>
        </div>
      </div>
    </div>
  `
})
export class MyStoreShellComponent {
  readonly LayoutDashboardIcon = LayoutDashboard;
  readonly PackageIcon = Package;
  readonly ReceiptTextIcon = ReceiptText;
  readonly SettingsIcon = Settings;
  readonly ArrowRightIcon = ArrowRight;
  readonly LogOutIcon = LogOut;
  readonly StoreIcon = Store;
  readonly BarChart2Icon = BarChart2;
  readonly PaletteIcon = Palette;

  private auth = inject(AuthService);
  private storeService = inject(StoreService);
  private router = inject(Router);

  storeName = computed(() => this.storeService.store()?.name ?? 'My Store');
  storeSlug = computed(() => this.storeService.store()?.slug ?? null);
  themeColor = computed(() => this.storeService.store()?.themeColor ?? '#0f172a');
  storeInitials = computed(() => {
    const name = this.storeName();
    const parts = name.split(/\s+/).filter(Boolean);
    return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? parts[0]?.[1] ?? '');
  });

  async signOut() {
    await this.auth.signOut();
    await this.router.navigateByUrl('/sign-in');
  }
}
