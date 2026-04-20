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
import { StoreService } from '../../core/store.service';
import { StorePagesService } from '../../core/store-pages.service';
import {
  animateDrawerClose,
  animateDrawerOpen,
  animateSidebarIntro
} from '../../core/animations';
import {
  ArrowRight,
  BarChart2,
  Home,
  LayoutDashboard,
  LogOut,
  LucideAngularModule,
  Menu,
  Package,
  Palette,
  ReceiptText,
  Settings,
  Store,
  X
} from 'lucide-angular';

@Component({
  selector: 'app-my-store-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <div class="min-h-dvh bg-slate-100 text-slate-900">
      <div class="mx-auto flex min-h-dvh w-full gap-6 lg:px-4 lg:py-4 max-w-[1400px]">

        <!-- Desktop sidebar -->
        <aside class="hidden w-[260px] shrink-0 lg:block" #desktopSidebar>
          <div class="sticky top-4 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
            <div class="flex items-center gap-2 px-2 py-2" data-anim="nav-item">
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
              @for (item of navItems; track item.path) {
                <a
                  [routerLink]="item.path"
                  routerLinkActive="bg-slate-100 text-slate-900"
                  [routerLinkActiveOptions]="{ exact: item.exact }"
                  data-anim="nav-item"
                  class="group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50">
                    <lucide-angular [img]="item.icon" class="h-5 w-5" />
                  </span>
                  <span class="font-semibold">{{ item.label }}</span>
                </a>
              }
            </div>

            <div class="mt-4 border-t border-slate-200 pt-3 space-y-1 px-1">
              @if (storeSlug()) {
                <a
                  [routerLink]="['/store', storeSlug()]"
                  data-anim="nav-item"
                  class="flex items-center justify-between gap-3 rounded-2xl px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
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
                data-anim="nav-item"
                class="flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
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

        <!-- Main column -->
        <div class="min-w-0 flex-1">
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
                <div class="truncate text-[11px] text-slate-500">{{ storeName() }}</div>
              </div>
              @if (storeSlug()) {
                <a
                  [routerLink]="['/store', storeSlug()]"
                  class="tap-target inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  aria-label="View storefront"
                >
                  <lucide-angular [img]="StoreIcon" class="h-5 w-5" />
                </a>
              }
            </div>

            <!-- Desktop header -->
            <div class="hidden rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur lg:block">
              <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                  <span class="font-semibold text-slate-900">Store Manager</span>
                  @if (homeLabel(); as label) {
                    <a
                      routerLink="/my-store/storefront"
                      class="group flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                      [title]="'Home page: ' + label"
                    >
                      <lucide-angular [img]="HomeIcon" class="h-3.5 w-3.5" />
                      <span class="text-[10px] font-bold uppercase tracking-wider text-amber-600">Home</span>
                      <span class="max-w-[180px] truncate text-amber-900">{{ label }}</span>
                    </a>
                  } @else if (storeSlug()) {
                    <a
                      routerLink="/my-store/storefront"
                      class="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      <lucide-angular [img]="HomeIcon" class="h-3.5 w-3.5 text-slate-400" />
                      Set a home page
                    </a>
                  }
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

          <main class="px-3 pb-tabbar pt-3 lg:px-0 lg:pb-8 lg:pt-0">
            <router-outlet />
          </main>
        </div>
      </div>

      <!-- Mobile drawer -->
      @if (drawerMounted()) {
        <div class="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div
            #drawerBackdrop
            class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm opacity-0"
            (click)="closeDrawer()"
          ></div>
          <aside
            #drawerPanel
            class="absolute inset-y-0 left-0 flex w-[82%] max-w-[320px] flex-col bg-white shadow-xl pt-safe will-change-transform"
            style="transform: translateX(-100%)"
          >
            <div class="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3" data-anim="nav-item">
              <div class="flex min-w-0 items-center gap-2">
                <div
                  class="inline-flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-bold text-white shrink-0"
                  [style.background]="themeColor()"
                >
                  {{ storeInitials() }}
                </div>
                <div class="min-w-0">
                  <div class="truncate text-sm font-semibold">{{ storeName() }}</div>
                  <div class="truncate text-xs text-slate-500">/store/{{ storeSlug() }}</div>
                </div>
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
                    data-anim="nav-item"
                    class="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50">
                      <lucide-angular [img]="item.icon" class="h-5 w-5" />
                    </span>
                    <span class="font-semibold">{{ item.label }}</span>
                  </a>
                }
              </div>

              <div class="mt-4 border-t border-slate-200 pt-3 space-y-1">
                @if (storeSlug()) {
                  <a
                    [routerLink]="['/store', storeSlug()]"
                    (click)="closeDrawer()"
                    data-anim="nav-item"
                    class="flex items-center justify-between gap-3 rounded-2xl px-3 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-50"
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
                  data-anim="nav-item"
                  class="flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-50"
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
        </div>
      }

      <!-- Bottom tab bar -->
      <nav
        class="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur pb-safe lg:hidden"
        aria-label="Primary"
      >
        <div class="mx-auto grid max-w-3xl grid-cols-5">
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
  readonly MenuIcon = Menu;
  readonly XIcon = X;
  readonly HomeIcon = Home;

  readonly navItems = [
    { path: '/my-store', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/my-store/products', label: 'Products', icon: Package, exact: false },
    { path: '/my-store/orders', label: 'Orders', icon: ReceiptText, exact: false },
    { path: '/my-store/storefront', label: 'Storefront', icon: Palette, exact: false },
    { path: '/my-store/settings', label: 'Settings', icon: Settings, exact: false }
  ];

  readonly tabItems = [
    { path: '/my-store', label: 'Home', icon: LayoutDashboard, exact: true },
    { path: '/my-store/products', label: 'Shop', icon: Package, exact: false },
    { path: '/my-store/orders', label: 'Orders', icon: ReceiptText, exact: false },
    { path: '/my-store/storefront', label: 'Design', icon: Palette, exact: false },
    { path: '/my-store/settings', label: 'More', icon: Settings, exact: false }
  ];

  private auth = inject(AuthService);
  private storeService = inject(StoreService);
  private pagesService = inject(StorePagesService);
  private router = inject(Router);

  drawerOpen = signal(false);
  drawerMounted = signal(false);
  private currentUrl = signal(this.router.url);

  private desktopSidebar = viewChild<ElementRef<HTMLElement>>('desktopSidebar');
  private drawerPanel = viewChild<ElementRef<HTMLElement>>('drawerPanel');
  private drawerBackdrop = viewChild<ElementRef<HTMLElement>>('drawerBackdrop');

  storeName = computed(() => this.storeService.store()?.name ?? 'My Store');
  storeSlug = computed(() => this.storeService.store()?.slug ?? null);
  themeColor = computed(() => this.storeService.store()?.themeColor ?? '#0f172a');
  storeInitials = computed(() => {
    const name = this.storeName();
    const parts = name.split(/\s+/).filter(Boolean);
    return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? parts[0]?.[1] ?? '');
  });

  homePage = computed(() => {
    const storeId = this.storeService.store()?.id;
    if (!storeId) return null;
    const pages = this.pagesService.pagesByStore()[storeId] ?? [];
    return pages.find((p) => p.isHome) ?? null;
  });

  homeLabel = computed<string | null>(() => {
    const target = this.storeService.store()?.homeTarget ?? 'custom';
    if (target === 'products') return 'Products catalog';
    const hp = this.homePage();
    return hp ? (hp.title || hp.slug) : null;
  });

  pageTitle = computed(() => {
    const url = this.currentUrl();
    if (url.startsWith('/my-store/products')) return 'Products';
    if (url.startsWith('/my-store/orders')) return 'Orders';
    if (url.startsWith('/my-store/storefront')) return 'Storefront';
    if (url.startsWith('/my-store/settings')) return 'Settings';
    return 'Dashboard';
  });

  constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.currentUrl.set(this.router.url);
        this.drawerOpen.set(false);
        const storeId = this.storeService.store()?.id;
        if (storeId) void this.loadPages(storeId);
      });

    effect(() => {
      const storeId = this.storeService.store()?.id;
      if (!storeId) return;
      void this.loadPages(storeId);
    });

    afterNextRender(() => {
      animateSidebarIntro(this.desktopSidebar()?.nativeElement);
    });

    effect(() => {
      const open = this.drawerOpen();
      if (open) {
        this.drawerMounted.set(true);
        queueMicrotask(() => this.playDrawerOpen());
      } else if (this.drawerMounted()) {
        void this.playDrawerClose();
      }
    });
  }

  private playDrawerOpen() {
    const panel = this.drawerPanel()?.nativeElement;
    const backdrop = this.drawerBackdrop()?.nativeElement;
    if (!panel || !backdrop) return;
    animateDrawerOpen(panel, backdrop);
  }

  private async playDrawerClose() {
    const panel = this.drawerPanel()?.nativeElement;
    const backdrop = this.drawerBackdrop()?.nativeElement;
    if (panel && backdrop) {
      await animateDrawerClose(panel, backdrop);
    }
    this.drawerMounted.set(false);
  }

  private async loadPages(storeId: string) {
    try {
      await this.pagesService.listPages({ storeId, auth: true });
    } catch {
      // ignore; header just falls back to no home indicator
    }
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
