import { NgClass } from '@angular/common';
import {
  Component,
  DestroyRef,
  HostListener,
  computed,
  inject,
  signal
} from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavItem, Store as StoreModel, StoreService } from '../../core/store.service';
import { StorePagesService } from '../../core/store-pages.service';
import { StoreOrdersService } from '../../core/store-orders.service';
import { TENANT_CONTEXT } from '../../core/host-routing';
import { TenantCustomerAuthService } from '../../core/tenant-customer-auth.service';
import { environment } from '../../../environments/environment';
import {
  Heart,
  Home,
  LucideAngularModule,
  Menu,
  Search,
  ShoppingBag,
  ShoppingCart,
  ReceiptText,
  User,
  X
} from 'lucide-angular';

type RenderedNavLink = {
  id: string;
  label: string;
  placement: 'header' | 'footer' | 'both';
  routerLink?: any[] | null;
  href?: string | null;
  newTab?: boolean;
};

@Component({
  selector: 'app-store-shell',
  standalone: true,
  imports: [NgClass, RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  styles: [
    `
      @keyframes store-preloader-drop {
        from {
          opacity: 0;
          transform: translateY(-36px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .store-preloader-drop {
        animation: store-preloader-drop 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
      }
      .store-preloader-root {
        transition:
          transform 0.48s cubic-bezier(0.22, 1, 0.36, 1),
          opacity 0.38s ease;
      }
      .store-preloader-root.store-preloader--leaving {
        transform: translateY(0);
        opacity: 0;
      }
    `
  ],
  template: `
    <div
      class="min-h-dvh bg-white text-slate-900"
      [style.--store-color]="loadingStore() ? preloaderThemeColor() : themeColor()"
    >
      @if (loadingStore()) {
        <div
          class="store-preloader-root flex min-h-dvh flex-col items-center justify-center bg-white px-6 pt-safe pb-safe"
          [class.store-preloader--leaving]="preloaderLeaving()"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div class=" flex max-w-md flex-col items-center gap-4 text-center">
           
            <h1 class="store-preloader-drop text-3xl font-bold tracking-tight text-slate-900 md:text-3xl">
              {{ preloaderDisplayName() }}
            </h1>
            @if (preloaderDisplayLogo(); as logo) {
              <img [src]="logo" alt="" class="h-16 w-16 rounded-2xl object-cover shadow-md ring-1 ring-slate-200/60" />
            }
          </div>
        </div>
      } @else if (!store()) {
        <div class="flex min-h-dvh flex-col items-center justify-center px-6 py-24 text-center">
          <div class="text-6xl">🏪</div>
          <h1 class="mt-4 text-2xl font-bold text-slate-900">Store not found</h1>
          <p class="mt-2 text-slate-500">This store doesn't exist or has been deactivated.</p>
          <a
            [routerLink]="homeLink()"
            class="mt-6 rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Go home
          </a>
        </div>
      } @else {
      <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur pt-safe">
        <!-- Mobile top bar -->
        <div class="flex items-center justify-between gap-3 px-4 py-3 md:hidden">
          <button
            type="button"
            class="tap-target inline-flex items-center justify-center rounded-2xl text-slate-700 hover:bg-slate-100"
            (click)="openDrawer()"
            aria-label="Open menu"
          >
            <lucide-angular [img]="MenuIcon" class="h-6 w-6" />
          </button>
          <a [routerLink]="homeLink()" class="flex min-w-0 items-center gap-2">
            @if (store()?.logoUrl) {
              <img [src]="store()!.logoUrl" alt="" class="h-7 w-7 rounded-xl object-cover" />
            }
            <span class="truncate text-sm font-bold tracking-tight">{{ store()?.name ?? 'Store' }}</span>
          </a>
          @if (checkoutEnabled()) {
            <a
              [routerLink]="cartLink()"
              class="tap-target relative inline-flex items-center justify-center rounded-2xl text-slate-700 hover:bg-slate-100"
              aria-label="Cart"
            >
              <lucide-angular [img]="ShoppingCartIcon" class="h-5 w-5" />
              @if (cartCount() > 0) {
                <span class="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-bold text-white">
                  {{ cartCount() }}
                </span>
              }
            </a>
          } @else {
            <span class="w-10"></span>
          }
        </div>

        <!-- Desktop header -->
        <div class="mx-auto hidden max-w-7xl items-center justify-between gap-6 px-6 py-4 md:flex">
          <div class="flex items-center gap-3">
            @if (store()?.logoUrl) {
              <img [src]="store()!.logoUrl" alt="" class="h-8 w-8 rounded-xl object-cover" />
            }
            <a [routerLink]="homeLink()" class="text-lg font-bold tracking-tight">
              {{ store()?.name ?? 'Store' }}
            </a>
          </div>

          <nav class="hidden items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 md:flex">
            <a [routerLink]="homeLink()" class="hover:text-slate-900">Home</a>
            @for (link of headerNavLinks(); track link.id) {
              @if (link.routerLink) {
                <a [routerLink]="link.routerLink" class="hover:text-slate-900">{{ link.label }}</a>
              } @else if (link.href) {
                <a [href]="link.href" [attr.target]="link.newTab ? '_blank' : null" [attr.rel]="link.newTab ? 'noopener noreferrer' : null"
                  class="hover:text-slate-900">{{ link.label }}</a>
              }
            }
          </nav>

          <div class="flex items-center gap-4">
            @if (isSignedIn()) {
              <a [routerLink]="accountLink()" class="hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 hover:text-slate-900 sm:block">Account</a>
            } @else {
              <a [routerLink]="signInLink()" [queryParams]="authQueryParams()"
                class="hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 hover:text-slate-900 sm:block">Sign in</a>
              <a [routerLink]="signUpLink()" [queryParams]="authQueryParams()"
                class="hidden rounded-xl border border-slate-200 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-700 hover:bg-slate-50 sm:block">Sign up</a>
            }
            @if (checkoutEnabled()) {
              <a [routerLink]="cartLink()" class="relative p-1 text-slate-600 hover:text-slate-900">
                <lucide-angular [img]="ShoppingCartIcon" class="h-5 w-5" />
                @if (cartCount() > 0) {
                  <span class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                    {{ cartCount() }}
                  </span>
                }
              </a>
            }
          </div>
        </div>
      </header>

      <main
        class="min-h-[70vh] md:min-h-[80vh] md:pb-0"
        [class.pb-tabbar]="mobileTabBarVisible()"
        [class.pb-safe]="!mobileTabBarVisible()"
      >
        <router-outlet />
      </main>

      <footer class="hidden border-t border-slate-200 bg-white px-6 py-8 md:block">
        <div class="mx-auto max-w-7xl flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-xs text-slate-500">
          <div>© {{ year() }} {{ store()?.name }}</div>
          @if (footerNavLinks().length > 0) {
            <div class="flex flex-wrap items-center gap-4">
              @for (link of footerNavLinks(); track link.id) {
                @if (link.routerLink) {
                  <a [routerLink]="link.routerLink" class="hover:text-slate-900">{{ link.label }}</a>
                } @else if (link.href) {
                  <a [href]="link.href" [attr.target]="link.newTab ? '_blank' : null" [attr.rel]="link.newTab ? 'noopener noreferrer' : null"
                    class="hover:text-slate-900">{{ link.label }}</a>
                }
              }
            </div>
          }
          <div>Powered by CasStore</div>
        </div>
      </footer>

      <!-- Mobile drawer -->
      @if (drawerOpen()) {
        <div class="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
          <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" (click)="closeDrawer()"></div>
          <aside
            class="absolute inset-y-0 left-0 flex w-[82%] max-w-[320px] flex-col bg-white shadow-xl pt-safe"
          >
            <div class="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3" data-anim="nav-item">
              <div class="flex min-w-0 items-center gap-2">
                @if (store()?.logoUrl) {
                  <img [src]="store()!.logoUrl" alt="" class="h-8 w-8 rounded-xl object-cover" />
                }
                <span class="truncate text-sm font-bold">{{ store()?.name ?? 'Store' }}</span>
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
                <a
                  [routerLink]="homeLink()"
                  [routerLinkActiveOptions]="{ exact: true }"
                  routerLinkActive="bg-slate-100 text-slate-900"
                  (click)="closeDrawer()"
                  data-anim="nav-item"
                  class="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50">
                    <lucide-angular [img]="HomeIcon" class="h-5 w-5" />
                  </span>
                  Home
                </a>
                @for (link of headerNavLinks(); track link.id) {
                  @if (link.routerLink) {
                    <a
                      [routerLink]="link.routerLink"
                      routerLinkActive="bg-slate-100 text-slate-900"
                      (click)="closeDrawer()"
                      data-anim="nav-item"
                      class="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50">
                        <lucide-angular [img]="ShoppingBagIcon" class="h-5 w-5" />
                      </span>
                      {{ link.label }}
                    </a>
                  } @else if (link.href) {
                    <a
                      [href]="link.href"
                      [attr.target]="link.newTab ? '_blank' : null"
                      [attr.rel]="link.newTab ? 'noopener noreferrer' : null"
                      (click)="closeDrawer()"
                      data-anim="nav-item"
                      class="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50">
                        <lucide-angular [img]="ShoppingBagIcon" class="h-5 w-5" />
                      </span>
                      {{ link.label }}
                    </a>
                  }
                }
              </div>

              <div class="mt-4 border-t border-slate-200 pt-3 space-y-1">
                @if (checkoutEnabled()) {
                  <a
                    [routerLink]="cartLink()"
                    (click)="closeDrawer()"
                    data-anim="nav-item"
                    class="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50">
                      <lucide-angular [img]="ShoppingCartIcon" class="h-5 w-5" />
                    </span>
                    Cart
                    @if (cartCount() > 0) {
                      <span class="ml-auto rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white">
                        {{ cartCount() }}
                      </span>
                    }
                  </a>
                }
                @if (isSignedIn()) {
                  <a
                    [routerLink]="accountLink()"
                    (click)="closeDrawer()"
                    data-anim="nav-item"
                    class="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50">
                      <lucide-angular [img]="UserIcon" class="h-5 w-5" />
                    </span>
                    Account
                  </a>
                  <a
                    [routerLink]="favoritesLink()"
                    (click)="closeDrawer()"
                    data-anim="nav-item"
                    class="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50">
                      <lucide-angular [img]="HeartIcon" class="h-5 w-5" />
                    </span>
                    Favorites
                  </a>
                  <a
                    [routerLink]="historyLink()"
                    (click)="closeDrawer()"
                    data-anim="nav-item"
                    class="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50">
                      <lucide-angular [img]="ReceiptTextIcon" class="h-5 w-5" />
                    </span>
                    Order history
                  </a>
                } @else {
                  <a
                    [routerLink]="signInLink()"
                    [queryParams]="authQueryParams()"
                    (click)="closeDrawer()"
                    data-anim="nav-item"
                    class="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50">
                      <lucide-angular [img]="UserIcon" class="h-5 w-5" />
                    </span>
                    Sign in
                  </a>
                  <a
                    [routerLink]="signUpLink()"
                    [queryParams]="authQueryParams()"
                    (click)="closeDrawer()"
                    data-anim="nav-item"
                    class="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50">
                      <lucide-angular [img]="UserIcon" class="h-5 w-5" />
                    </span>
                    Sign up
                  </a>
                }
              </div>
            </div>

            <div class="border-t border-slate-200 px-4 py-3 pb-safe text-[11px] text-slate-500">
              <div>© {{ year() }} {{ store()?.name }}</div>
              <a [href]="createStoreHref()" class="mt-2 inline-flex items-center rounded-lg border border-slate-300 px-2 py-1 text-[10px] font-semibold text-slate-600">
                Create your store
              </a>
            </div>
          </aside>
        </div>
      }

      <!-- Mobile bottom tab bar (hides on scroll down, shows on scroll up — matches common app feeds) -->
      <nav
        class="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur pb-safe transition-transform duration-300 ease-out md:hidden"
        [class.translate-y-full]="!mobileTabBarVisible()"
        aria-label="Primary"
      >
        <div class="mx-auto grid max-w-3xl" [ngClass]="mobileTabBarGridClass()">
          <a
            [routerLink]="homeLink()"
            routerLinkActive="text-slate-900"
            [routerLinkActiveOptions]="{ exact: true }"
            #homeRla="routerLinkActive"
            class="flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500"
          >
            <span
              class="inline-flex h-8 w-12 items-center justify-center rounded-2xl transition-colors"
              [class.text-white]="homeRla.isActive"
              [style.background]="homeRla.isActive ? themeColor() : 'transparent'"
            >
              <lucide-angular [img]="HomeIcon" class="h-5 w-5" />
            </span>
            <span>Home</span>
          </a>
          <a
            [routerLink]="productsLink()"
            routerLinkActive="text-slate-900"
            #shopRla="routerLinkActive"
            class="flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500"
          >
            <span
              class="inline-flex h-8 w-12 items-center justify-center rounded-2xl transition-colors"
              [class.text-white]="shopRla.isActive"
              [style.background]="shopRla.isActive ? themeColor() : 'transparent'"
            >
              <lucide-angular [img]="ShoppingBagIcon" class="h-5 w-5" />
            </span>
            <span>Shop</span>
          </a>
          @if (checkoutEnabled()) {
            <a
              [routerLink]="cartLink()"
              routerLinkActive="text-slate-900"
              #cartRla="routerLinkActive"
              class="flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500"
            >
              <span
                class="relative inline-flex h-8 w-12 items-center justify-center rounded-2xl transition-colors"
                [class.text-white]="cartRla.isActive"
                [style.background]="cartRla.isActive ? themeColor() : 'transparent'"
              >
                <lucide-angular [img]="ShoppingCartIcon" class="h-5 w-5" />
                @if (cartCount() > 0) {
                  <span class="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-bold text-white">
                    {{ cartCount() }}
                  </span>
                }
              </span>
              <span>Cart</span>
            </a>
          }
          @if (isSignedIn()) {
            <a
              [routerLink]="accountLink()"
              routerLinkActive="text-slate-900"
              #accountRla="routerLinkActive"
              class="flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500"
            >
              <span
                class="inline-flex h-8 w-12 items-center justify-center rounded-2xl transition-colors"
                [class.text-white]="accountRla.isActive"
                [style.background]="accountRla.isActive ? themeColor() : 'transparent'"
              >
                <lucide-angular [img]="UserIcon" class="h-5 w-5" />
              </span>
              <span>Account</span>
            </a>
          }
        </div>
      </nav>
      }
    </div>
  `
})
export class StoreShellComponent {
  readonly ShoppingCartIcon = ShoppingCart;
  readonly ShoppingBagIcon = ShoppingBag;
  readonly HeartIcon = Heart;
  readonly SearchIcon = Search;
  readonly MenuIcon = Menu;
  readonly XIcon = X;
  readonly HomeIcon = Home;
  readonly UserIcon = User;
  readonly ReceiptTextIcon = ReceiptText;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private customerAuth = inject(TenantCustomerAuthService);
  private storeService = inject(StoreService);
  private pagesService = inject(StorePagesService);
  private ordersService = inject(StoreOrdersService);
  private tenant = inject(TENANT_CONTEXT, { optional: true });

  store = signal<StoreModel | null>(null);
  loadingStore = signal(true);
  /** Exit motion on the full-screen preloader before revealing the shell. */
  preloaderLeaving = signal(false);
  storeSlug = signal('');
  drawerOpen = signal(false);
  /** Mobile-only bottom tab bar visibility (desktop uses `md:hidden` on the bar). */
  mobileTabBarVisible = signal(true);
  private lastScrollY = 0;
  private touchedCustomerKey: string | null = null;

  year = computed(() => new Date().getFullYear());
  isSignedIn = computed(() => this.customerAuth.isSignedIn());
  themeColor = computed(() => this.store()?.themeColor ?? '#0f172a');

  /** Preloader title: loaded store, matching cached viewing store, or humanized slug. */
  preloaderDisplayName = computed(() => {
    const s = this.store();
    if (s) return s.name;
    const v = this.storeService.viewingStore();
    const slug = this.storeSlug();
    if (v && v.slug === slug) return v.name;
    return this.formatSlugAsTitle(slug);
  });

  preloaderDisplayLogo = computed((): string | null => {
    const s = this.store();
    if (s?.logoUrl) return s.logoUrl;
    const v = this.storeService.viewingStore();
    if (v && v.slug === this.storeSlug() && v.logoUrl) return v.logoUrl;
    return null;
  });

  preloaderThemeColor = computed(() => {
    const s = this.store();
    if (s?.themeColor) return s.themeColor;
    const v = this.storeService.viewingStore();
    if (v && v.slug === this.storeSlug() && v.themeColor) return v.themeColor;
    return '#0f172a';
  });
  cartCount = computed(() => this.ordersService.cartItems().reduce((s, i) => s + i.quantity, 0));
  /** Hides cart UI when the store owner has turned off checkout. Undefined defaults to on. */
  checkoutEnabled = computed(() => this.store()?.checkoutEnabled !== false);

  /** Bottom tab bar column count: no guest “sign in” tab — only signed-in users see Account. */
  mobileTabBarGridClass = computed(() => {
    if (this.isSignedIn() && this.checkoutEnabled()) return 'grid-cols-4';
    if (this.isSignedIn() && !this.checkoutEnabled()) return 'grid-cols-3';
    if (this.checkoutEnabled()) return 'grid-cols-3';
    return 'grid-cols-2';
  });

  // Tenant-aware RouterLink arrays. Recomputed when slug changes so that
  // both subdomain (`['/']`) and apex (`['/store', slug]`) modes work.
  homeLink = computed(() => this.linkFor([]));
  productsLink = computed(() => this.linkFor(['products']));
  cartLink = computed(() => this.linkFor(['cart']));
  favoritesLink = computed(() => this.linkFor(['favorites']));
  historyLink = computed(() => this.linkFor(['history']));
  accountLink = computed(() => this.linkFor(['account']));
  signInLink = computed(() => this.linkFor(['account', 'sign-in']));
  signUpLink = computed(() => this.linkFor(['account', 'sign-up']));
  createStoreHref = computed(() => `https://${environment.rootDomain}`);

  navLinks = computed<RenderedNavLink[]>(() => {
    const s = this.store();
    const slug = this.storeSlug();
    if (!s || !slug) return [];
    const items = s.navItems ?? [];
    if (items.length === 0) {
      return [{ id: 'default-shop', label: 'Shop', placement: 'both', routerLink: this.linkFor(['products']) }];
    }
    const signed = this.isSignedIn();
    return items
      .filter(
        (item) =>
          signed || item.kind !== 'builtin' || item.target !== 'account'
      )
      .map((item) => this.resolveNavItem(item));
  });

  headerNavLinks = computed(() =>
    this.navLinks().filter((l) => l.placement === 'header' || l.placement === 'both')
  );

  footerNavLinks = computed(() =>
    this.navLinks().filter((l) => l.placement === 'footer' || l.placement === 'both')
  );

  constructor() {
    // In tenant (subdomain) mode the slug comes from the host, otherwise
    // it's the `/store/:storeSlug/...` route parameter.
    const slug = this.tenant?.slug ?? this.route.snapshot.paramMap.get('storeSlug') ?? '';
    this.storeSlug.set(slug);
    void this.loadStore(slug);

    this.router.events.subscribe(() => {
      this.drawerOpen.set(false);
    });

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.mobileTabBarVisible.set(true);
        if (typeof window !== 'undefined') {
          this.lastScrollY = window.scrollY;
        }
      });

    if (typeof window !== 'undefined') {
      const onScroll = () => this.onWindowScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      this.destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));

      window.addEventListener('message', (ev) => {
        if (ev.origin !== window.location.origin) return;
        const data = ev.data as { type?: string } | null;
        if (data?.type === 'casstore:reload') {
          void this.loadStore(this.storeSlug());
        }
      });
    }
  }

  openDrawer() {
    this.drawerOpen.set(true);
    this.mobileTabBarVisible.set(true);
  }

  private onWindowScroll(): void {
    if (typeof window === 'undefined') return;
    if (this.loadingStore() || !this.store()) return;

    if (this.drawerOpen()) {
      this.lastScrollY = window.scrollY;
      return;
    }

    const y = window.scrollY;
    const delta = y - this.lastScrollY;
    const threshold = 10;
    const topRevealPx = 32;

    if (y < topRevealPx) {
      this.mobileTabBarVisible.set(true);
    } else if (delta > threshold) {
      this.mobileTabBarVisible.set(false);
    } else if (delta < -threshold) {
      this.mobileTabBarVisible.set(true);
    }

    this.lastScrollY = y;
  }

  closeDrawer() {
    this.drawerOpen.set(false);
  }

  authQueryParams() {
    return { returnUrl: this.router.url };
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.drawerOpen()) this.drawerOpen.set(false);
  }

  private async loadStore(slug: string) {
    this.loadingStore.set(true);
    this.preloaderLeaving.set(false);

    const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
    const minPreloaderMs = 850;
    const exitMotionMs = 520;

    const store = this.tenant
      ? await this.storeService.loadBySubdomain(slug)
      : await this.storeService.loadBySlug(slug);
    this.store.set(store);

    // Canonical URL: apex → subdomain redirect (skip preloader exit; full navigation).
    if (
      !this.tenant &&
      environment.production &&
      environment.subdomainsEnabled &&
      store?.slug &&
      typeof window !== 'undefined'
    ) {
      const rest = this.router.url.replace(`/store/${store.slug}`, '') || '/';
      window.location.replace(
        `https://www.${store.slug}.${environment.rootDomain}${rest.startsWith('/') ? rest : '/' + rest}`
      );
      return;
    }

    // Load home page config before the outlet mounts so StoreHomePage never flashes default sections.
    if (store && store.homeTarget !== 'products') {
      const page = await this.pagesService.getPageBySlug({ storeId: store.id, slug: 'home' });
      this.pagesService.setPublicHomePage(store.id, page);
    }

    const elapsed = typeof performance !== 'undefined' ? performance.now() - t0 : minPreloaderMs;
    if (elapsed < minPreloaderMs) {
      await new Promise<void>((resolve) => setTimeout(resolve, minPreloaderMs - elapsed));
    }

    if (store) {
      this.preloaderLeaving.set(true);
      await new Promise<void>((resolve) => setTimeout(resolve, exitMotionMs));
    }
    this.loadingStore.set(false);
    this.preloaderLeaving.set(false);

    if (typeof window !== 'undefined') {
      this.lastScrollY = window.scrollY;
      this.mobileTabBarVisible.set(true);
    }

    if (store && store.checkoutEnabled !== false) {
      void this.ordersService.loadCart(store.id).catch(() => {});
    }
    if (store) {
      const key = `${store.id}:customer-session`;
      if (this.touchedCustomerKey !== key) {
        this.touchedCustomerKey = key;
        void this.customerAuth.loadMe(store.id).catch(() => {});
      }
    }
  }

  private formatSlugAsTitle(slug: string): string {
    const t = slug.trim();
    if (!t) return 'Store';
    const parts = t.split(/[-_]+/).filter(Boolean);
    if (parts.length === 0) return 'Store';
    return parts.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }

  /** Tenant-aware RouterLink array for a storefront path. */
  private linkFor(segments: ReadonlyArray<string | number>): any[] {
    if (this.tenant) return ['/', ...segments];
    const slug = this.storeSlug();
    return slug ? ['/store', slug, ...segments] : ['/'];
  }

  private resolveNavItem(item: NavItem): RenderedNavLink {
    const placement = item.placement ?? 'both';
    switch (item.kind) {
      case 'page':
        return {
          id: item.id,
          label: item.label,
          placement,
          routerLink: this.linkFor(['p', item.pageSlug])
        };
      case 'builtin': {
        const link = item.target === 'cart'
          ? this.linkFor(['cart'])
          : item.target === 'account'
            ? this.linkFor(['account'])
            : this.linkFor(['products']);
        return { id: item.id, label: item.label, placement, routerLink: link };
      }
      case 'url':
        return {
          id: item.id,
          label: item.label,
          placement,
          href: item.url,
          newTab: Boolean(item.newTab)
        };
    }
  }
}
