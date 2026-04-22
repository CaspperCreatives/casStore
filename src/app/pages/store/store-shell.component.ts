import {
  Component,
  HostListener,
  computed,
  inject,
  signal
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { NavItem, Store as StoreModel, StoreService } from '../../core/store.service';
import { StoreOrdersService } from '../../core/store-orders.service';
import { TENANT_CONTEXT } from '../../core/host-routing';
import { environment } from '../../../environments/environment';
import {
  Heart,
  Home,
  LucideAngularModule,
  Menu,
  Search,
  ShoppingBag,
  ShoppingCart,
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
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <div class="min-h-dvh bg-white text-slate-900" [style.--store-color]="themeColor()">

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
              <a routerLink="/account" class="hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 hover:text-slate-900 sm:block">Account</a>
            } @else {
              <a routerLink="/sign-in" class="hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 hover:text-slate-900 sm:block">Sign in</a>
            }
            <a [routerLink]="cartLink()" class="relative p-1 text-slate-600 hover:text-slate-900">
              <lucide-angular [img]="ShoppingCartIcon" class="h-5 w-5" />
              @if (cartCount() > 0) {
                <span class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                  {{ cartCount() }}
                </span>
              }
            </a>
          </div>
        </div>
      </header>

      <main class="min-h-[70vh] pb-tabbar md:min-h-[80vh] md:pb-0">
        @if (loadingStore()) {
          <div class="flex items-center justify-center py-24">
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
          </div>
        } @else if (!store()) {
          <div class="flex flex-col items-center justify-center py-24 text-center px-6">
            <div class="text-6xl">🏪</div>
            <h1 class="mt-4 text-2xl font-bold text-slate-900">Store not found</h1>
            <p class="mt-2 text-slate-500">This store doesn't exist or has been deactivated.</p>
            <a routerLink="/" class="mt-6 rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
              Go home
            </a>
          </div>
        } @else {
          <router-outlet />
        }
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
                @if (isSignedIn()) {
                  <a
                    routerLink="/account"
                    (click)="closeDrawer()"
                    data-anim="nav-item"
                    class="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50">
                      <lucide-angular [img]="UserIcon" class="h-5 w-5" />
                    </span>
                    Account
                  </a>
                } @else {
                  <a
                    routerLink="/sign-in"
                    (click)="closeDrawer()"
                    data-anim="nav-item"
                    class="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50">
                      <lucide-angular [img]="UserIcon" class="h-5 w-5" />
                    </span>
                    Sign in
                  </a>
                }
              </div>
            </div>

            <div class="border-t border-slate-200 px-4 py-3 pb-safe text-[11px] text-slate-500">
              © {{ year() }} {{ store()?.name }}
            </div>
          </aside>
        </div>
      }

      <!-- Mobile bottom tab bar -->
      <nav
        class="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur pb-safe md:hidden"
        aria-label="Primary"
      >
        <div class="mx-auto grid max-w-3xl grid-cols-4">
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
          <a
            [routerLink]="isSignedIn() ? '/account' : '/sign-in'"
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
            <span>{{ isSignedIn() ? 'Account' : 'Sign in' }}</span>
          </a>
        </div>
      </nav>
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

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private storeService = inject(StoreService);
  private ordersService = inject(StoreOrdersService);
  private tenant = inject(TENANT_CONTEXT, { optional: true });

  store = signal<StoreModel | null>(null);
  loadingStore = signal(true);
  storeSlug = signal('');
  drawerOpen = signal(false);

  year = computed(() => new Date().getFullYear());
  isSignedIn = computed(() => Boolean(this.auth.user()));
  themeColor = computed(() => this.store()?.themeColor ?? '#0f172a');
  cartCount = computed(() => this.ordersService.cartItems().reduce((s, i) => s + i.quantity, 0));

  // Tenant-aware RouterLink arrays. Recomputed when slug changes so that
  // both subdomain (`['/']`) and apex (`['/store', slug]`) modes work.
  homeLink = computed(() => this.linkFor([]));
  productsLink = computed(() => this.linkFor(['products']));
  cartLink = computed(() => this.linkFor(['cart']));

  navLinks = computed<RenderedNavLink[]>(() => {
    const s = this.store();
    const slug = this.storeSlug();
    if (!s || !slug) return [];
    const items = s.navItems ?? [];
    if (items.length === 0) {
      return [{ id: 'default-shop', label: 'Shop', placement: 'both', routerLink: this.linkFor(['products']) }];
    }
    return items.map((item) => this.resolveNavItem(item));
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

    if (typeof window !== 'undefined') {
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
  }

  closeDrawer() {
    this.drawerOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.drawerOpen()) this.drawerOpen.set(false);
  }

  private async loadStore(slug: string) {
    this.loadingStore.set(true);
    const store = this.tenant
      ? await this.storeService.loadBySubdomain(slug)
      : await this.storeService.loadBySlug(slug);
    this.store.set(store);
    this.loadingStore.set(false);

    if (store && this.auth.user()) {
      void this.ordersService.loadCart(store.id).catch(() => {});
    }

    // Canonical URL: when we're on the apex `casstore.store/store/<slug>/...`
    // in production, redirect to `<slug>.casstore.store/...`. Gated by
    // `environment.production` so `localhost:4200` keeps the path-based URL
    // during local development, and by `environment.subdomainsEnabled` so
    // the redirect never fires until wildcard hosting is actually live.
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
    }
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
            ? ['/account']
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
