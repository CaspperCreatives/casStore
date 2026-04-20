import {
  Component,
  ElementRef,
  HostListener,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/auth.service';
import { environment } from '../../../environments/environment';
import {
  animateDrawerClose,
  animateDrawerOpen,
  animateSidebarIntro
} from '../../core/animations';
import {
  ArrowRight,
  ChevronsUpDown,
  LayoutDashboard,
  LogOut,
  LucideAngularModule,
  Menu,
  Package,
  ReceiptText,
  Search,
  Settings,
  Users,
  X
} from 'lucide-angular';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <div class="min-h-dvh bg-slate-100 text-slate-900">
      <div class="mx-auto flex min-h-dvh w-full gap-6 lg:px-4 lg:py-4">
        <!-- Desktop sidebar -->
        <aside class="hidden w-[280px] shrink-0 lg:block" #desktopSidebar>
          <div class="sticky top-4 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
            <div class="flex items-center justify-between gap-3 px-2 py-2" data-anim="nav-item">
              <a routerLink="/admin" class="flex items-center gap-2 font-semibold tracking-tight">
                <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
                  CS
                </span>
                <span class="text-[15px]">CasStore</span>
                <span class="ml-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
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
              @for (item of navItems; track item.path) {
                <a
                  [routerLink]="item.path"
                  routerLinkActive="bg-slate-100 text-slate-900"
                  [routerLinkActiveOptions]="{ exact: item.exact }"
                  class="group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                >
                  <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 group-hover:bg-white">
                    <lucide-angular [img]="item.icon" class="h-5 w-5" />
                  </span>
                  <span class="font-semibold">{{ item.label }}</span>
                </a>
              }
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

        <!-- Main column -->
        <div class="min-w-0 flex-1">
          <!-- App-style top bar (mobile) / header (desktop) -->
          <header class="sticky top-0 z-20 bg-slate-100/90 pb-2 pt-safe backdrop-blur lg:-mx-4 lg:bg-transparent lg:px-4 lg:pb-4 lg:pt-2 lg:backdrop-blur-none">
            <!-- Mobile top bar -->
            <div class="flex items-center gap-2 border-b border-slate-200 bg-white/95 px-3 py-2 lg:hidden">
              <button
                type="button"
                class="tap-target inline-flex items-center justify-center rounded-2xl text-slate-700 hover:bg-slate-100"
                (click)="openDrawer()"
                aria-label="Open menu"
              >
                <lucide-angular [img]="MenuIcon" class="h-6 w-6" />
              </button>
              <div class="min-w-0 flex-1">
                <div class="truncate text-[15px] font-semibold leading-tight">{{ pageTitle() }}</div>
                <div class="truncate text-[11px] text-slate-500">Admin</div>
              </div>
              <a
                routerLink="/products"
                class="tap-target inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                aria-label="Storefront"
              >
                <span class="text-xs font-bold">CS</span>
              </a>
            </div>

            <!-- Desktop header -->
            <div class="hidden rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur lg:block">
              <div class="flex items-center justify-between gap-4">
                <div class="min-w-0">
                  <div class="truncate text-[15px] font-semibold">{{ pageTitle() }}</div>
                  <div class="truncate text-xs text-slate-500">System overview</div>
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
                    <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center rounded-xl border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-500">
                      /
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div class="flex items-center gap-2">
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

          <main class="px-3 pb-tabbar pt-3 lg:px-0 lg:pb-8 lg:pt-0">
            <router-outlet />
          </main>
        </div>
      </div>

      <!-- Mobile slide-over drawer -->
      @if (drawerOpen()) {
        <div class="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div
            class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in"
            (click)="closeDrawer()"
          ></div>
          <aside
            class="absolute inset-y-0 left-0 flex w-[82%] max-w-[320px] flex-col bg-white shadow-xl pt-safe"
          >
            <div class="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <div class="flex items-center gap-2 font-semibold tracking-tight">
                <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
                  CS
                </span>
                <span class="text-[15px]">CasStore Admin</span>
              </div>
              <button
                type="button"
                class="tap-target inline-flex items-center justify-center rounded-2xl text-slate-500 hover:bg-slate-100"
                (click)="closeDrawer()"
                aria-label="Close menu"
              >
                <lucide-angular [img]="XIcon" class="h-5 w-5" />
              </button>
            </div>

            <div class="flex-1 overflow-y-auto px-3 py-3">
              <div class="space-y-1">
                @for (item of navItems; track item.path) {
                  <a
                    [routerLink]="item.path"
                    routerLinkActive="bg-slate-100 text-slate-900"
                    [routerLinkActiveOptions]="{ exact: item.exact }"
                    (click)="closeDrawer()"
                    class="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50">
                      <lucide-angular [img]="item.icon" class="h-5 w-5" />
                    </span>
                    <span class="font-semibold">{{ item.label }}</span>
                  </a>
                }
              </div>

              <div class="mt-4 border-t border-slate-200 pt-3 space-y-1">
                <a
                  routerLink="/products"
                  (click)="closeDrawer()"
                  class="flex items-center justify-between gap-3 rounded-2xl px-3 py-3 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <span class="font-semibold">Go to storefront</span>
                  <lucide-angular [img]="ArrowRightIcon" class="h-4 w-4 text-slate-400" />
                </a>
                <button
                  type="button"
                  class="flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-sm text-slate-600 hover:bg-slate-50"
                  (click)="signOut()"
                >
                  <span class="font-semibold">Sign out</span>
                  <lucide-angular [img]="LogOutIcon" class="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </div>

            <div class="border-t border-slate-200 px-4 py-3 pb-safe">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                  @if (photoUrl()) {
                    <img [src]="photoUrl()!" alt="" class="h-full w-full object-cover" />
                  } @else {
                    <div class="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-600">
                      {{ initials() }}
                    </div>
                  }
                </div>
                <div class="min-w-0">
                  <div class="truncate text-sm font-semibold">{{ displayName() }}</div>
                  <div class="truncate text-xs text-slate-500">{{ email() }}</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      }

      <!-- Mobile bottom tab bar -->
      <nav
        class="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur pb-safe lg:hidden"
        aria-label="Primary"
      >
        <div class="mx-auto grid max-w-3xl grid-cols-4">
          @for (tab of tabItems; track tab.path) {
            <a
              [routerLink]="tab.path"
              routerLinkActive="text-slate-900"
              [routerLinkActiveOptions]="{ exact: tab.exact }"
              #rla="routerLinkActive"
              class="flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500"
            >
              <span
                class="inline-flex h-8 w-12 items-center justify-center rounded-2xl transition-colors"
                [class.bg-slate-900]="rla.isActive"
                [class.text-white]="rla.isActive"
              >
                <lucide-angular [img]="tab.icon" class="h-5 w-5" />
              </span>
              <span>{{ tab.label }}</span>
            </a>
          }
        </div>
      </nav>
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
  readonly MenuIcon = Menu;
  readonly XIcon = X;

  readonly navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/admin/products', label: 'Products', icon: Package, exact: false },
    { path: '/admin/orders', label: 'Orders', icon: ReceiptText, exact: false },
    { path: '/admin/settings', label: 'Site settings', icon: Settings, exact: false }
  ];

  readonly tabItems = [
    { path: '/admin', label: 'Home', icon: LayoutDashboard, exact: true },
    { path: '/admin/products', label: 'Products', icon: Package, exact: false },
    { path: '/admin/orders', label: 'Orders', icon: ReceiptText, exact: false },
    { path: '/admin/settings', label: 'Settings', icon: Settings, exact: false }
  ];

  private router = inject(Router);
  private auth = inject(AuthService);

  drawerOpen = signal(false);
  private currentUrl = signal(this.router.url);

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

  pageTitle = computed(() => {
    const url = this.currentUrl();
    if (url.startsWith('/admin/products')) return 'Products';
    if (url.startsWith('/admin/orders')) return 'Orders';
    if (url.startsWith('/admin/settings')) return 'Site settings';
    return 'Dashboard';
  });

  constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.currentUrl.set(this.router.url);
        this.drawerOpen.set(false);
      });
  }

  openDrawer() {
    this.drawerOpen.set(true);
  }

  closeDrawer() {
    this.drawerOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.drawerOpen()) this.drawerOpen.set(false);
  }

  async signOut() {
    this.drawerOpen.set(false);
    await this.auth.signOut();
    await this.router.navigateByUrl('/sign-in');
  }
}
