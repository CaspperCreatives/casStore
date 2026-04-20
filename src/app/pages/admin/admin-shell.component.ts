import { Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/auth.service';
import { environment } from '../../../environments/environment';
import { ArrowRight, ChevronsUpDown, LayoutDashboard, LogOut, LucideAngularModule, Package, ReceiptText, Search, Settings, Users } from 'lucide-angular';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <div class="min-h-dvh bg-slate-100 text-slate-900">
      <div class="mx-auto flex min-h-dvh w-full gap-6 px-4 py-4">
        <!-- Sidebar -->
        <aside class="hidden w-[280px] shrink-0 lg:block">
          <div class="sticky top-4 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
            <div class="flex items-center justify-between gap-3 px-2 py-2">
              <a routerLink="/admin" class="flex items-center gap-2 font-semibold tracking-tight">
                <span
                  class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white"
                >
                  CS
                </span>
                <span class="text-[15px]">CasStore</span>
                <span
                  class="ml-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600"
                >
                  Beta
                </span>
              </a>

              <div class="h-9 w-9 rounded-2xl border border-slate-200 bg-white"></div>
            </div>

            <button
              type="button"
              class="mt-2 flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-left hover:bg-slate-100"
            >
              <div class="min-w-0">
                <div class="truncate text-sm font-semibold">{{ orgName() }}</div>
                <div class="truncate text-xs text-slate-500">{{ orgSubtitle() }}</div>
              </div>
              <lucide-angular [img]="ChevronsUpDownIcon" class="h-4 w-4 text-slate-400" />
            </button>

            <div class="mt-3 space-y-1 px-1">
              <a
                routerLink="/admin"
                routerLinkActive="bg-slate-100 text-slate-900"
                [routerLinkActiveOptions]="{ exact: true }"
                class="group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 group-hover:bg-white">
                  <lucide-angular [img]="LayoutDashboardIcon" class="h-5 w-5" />
                </span>
                <span class="font-semibold">Dashboard</span>
              </a>

              <a
                routerLink="/admin/settings"
                routerLinkActive="bg-slate-100 text-slate-900"
                class="group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 group-hover:bg-white">
                  <lucide-angular [img]="SettingsIcon" class="h-5 w-5" />
                </span>
                <span class="font-semibold">Site settings</span>
              </a>

              <a
                routerLink="/admin/products"
                routerLinkActive="bg-slate-100 text-slate-900"
                class="group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 group-hover:bg-white">
                  <lucide-angular [img]="PackageIcon" class="h-5 w-5" />
                </span>
                <span class="font-semibold">Products</span>
              </a>

              <a
                routerLink="/admin/orders"
                routerLinkActive="bg-slate-100 text-slate-900"
                class="group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 group-hover:bg-white">
                  <lucide-angular [img]="ReceiptTextIcon" class="h-5 w-5" />
                </span>
                <span class="font-semibold">Orders</span>
              </a>

              <a
                routerLink="/admin"
                class="group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 group-hover:bg-white">
                  <lucide-angular [img]="UsersIcon" class="h-5 w-5" />
                </span>
                <span class="font-semibold">Users</span>
              </a>
            </div>

            <div class="mt-4 border-t border-slate-200 pt-3">
              <a
                routerLink="/products"
                class="flex items-center justify-between gap-3 rounded-2xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                <span class="font-semibold">Go to storefront</span>
                <lucide-angular [img]="ArrowRightIcon" class="h-4 w-4 text-slate-400" />
              </a>
              <button
                type="button"
                class="mt-1 flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                (click)="signOut()"
              >
                <span class="font-semibold">Sign out</span>
                <lucide-angular [img]="LogOutIcon" class="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </div>
        </aside>

        <!-- Content -->
        <div class="min-w-0 flex-1">
          <header class="sticky top-0 z-10 -mx-4 px-4 pb-4 pt-2 lg:mx-0 lg:px-0">
            <div class="rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
              <div class="flex items-center justify-between gap-4">
                <div class="flex min-w-0 items-center gap-3">
                  <div class="lg:hidden">
                    <a routerLink="/products" class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                      <span class="text-sm font-bold">CS</span>
                    </a>
                  </div>
                  <div class="min-w-0">
                    <div class="truncate text-[15px] font-semibold">Dashboard</div>
                    <div class="truncate text-xs text-slate-500">System overview</div>
                  </div>
                </div>

                <div class="hidden flex-1 lg:block">
                  <div class="relative">
                    <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                      <lucide-angular [img]="SearchIcon" class="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search"
                      class="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-14 text-sm outline-none focus:border-slate-300"
                    />
                    <span
                      class="pointer-events-none absolute inset-y-0 right-3 flex items-center rounded-xl border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-500"
                    >
                      /
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div class="hidden items-center gap-2 lg:flex">
                    <div class="h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                      @if (photoUrl()) {
                        <img [src]="photoUrl()!" alt="" class="h-full w-full object-cover" />
                      } @else {
                        <div class="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-600">
                          {{ initials() }}
                        </div>
                      }
                    </div>
                    <div class="hidden min-w-0 xl:block">
                      <div class="truncate text-sm font-semibold">{{ displayName() }}</div>
                      <div class="truncate text-xs text-slate-500">{{ email() }}</div>
                    </div>
                  </div>

                  <a
                    routerLink="/products"
                    class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Store
                    <lucide-angular [img]="ArrowRightIcon" class="h-4 w-4 text-slate-400" />
                  </a>
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
export class AdminShellComponent {
  readonly ChevronsUpDownIcon = ChevronsUpDown;
  readonly LayoutDashboardIcon = LayoutDashboard;
  readonly SettingsIcon = Settings;
  readonly PackageIcon = Package;
  readonly ReceiptTextIcon = ReceiptText;
  readonly UsersIcon = Users;
  readonly ArrowRightIcon = ArrowRight;
  readonly LogOutIcon = LogOut;
  readonly SearchIcon = Search;

  private router = inject(Router);
  private auth = inject(AuthService);

  orgName = computed(() => environment.firebase?.projectId ?? 'Organization');
  orgSubtitle = computed(() => environment.functionsRegion ?? 'us-central1');

  displayName = computed(() => this.auth.user()?.displayName ?? 'Admin');
  email = computed(() => this.auth.user()?.email ?? '');
  photoUrl = computed(() => this.auth.user()?.photoURL ?? null);
  initials = computed(() => {
    const name = this.displayName() || this.email() || 'Admin';
    const parts = name.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? 'A';
    const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
    return (a + b).toUpperCase();
  });

  constructor() {
    // Single place to hook analytics/pageviews for the admin section.
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe();
  }

  async signOut() {
    await this.auth.signOut();
    await this.router.navigateByUrl('/sign-in');
  }
}


