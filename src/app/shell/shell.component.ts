import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../core/auth.service';
import { SiteSettingsService } from '../core/site-settings.service';
import { StoreService } from '../core/store.service';
import {
  Heart,
  Home,
  LogOut,
  LucideAngularModule,
  Menu,
  Search,
  ShoppingBag,
  ShoppingCart,
  Store,
  User,
  X
} from 'lucide-angular';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <div class="min-h-dvh bg-white text-slate-900">
      @if (settings().banner?.enabled !== false) {
        <div class="hidden bg-slate-950 text-white md:block">
          <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-2 text-[11px] tracking-wide">
            <div class="truncate text-white/90">{{ settings().banner?.leftText }}</div>
            <div class="flex items-center gap-4 text-white/80">
              @for (l of (settings().banner?.rightLinks ?? []); track l.label) {
                @if (l.enabled !== false) {
                  <a class="hover:text-white" [href]="l.href || '#'" (click)="preventIfHash($event, l.href)">{{ l.label }}</a>
                }
              }
            </div>
          </div>
        </div>
      }

      <header class="sticky top-0 z-20">
        <div class="border-b border-slate-200 bg-white/90 backdrop-blur pt-safe">
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
            <a routerLink="/" class="text-base font-semibold tracking-[0.28em]">CASSTORE</a>
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="tap-target inline-flex items-center justify-center rounded-2xl text-slate-700 hover:bg-slate-100"
                aria-label="Search"
                (click)="$event.preventDefault()"
              >
                <lucide-angular [img]="SearchIcon" class="h-5 w-5" />
              </button>
              <a
                routerLink="/cart"
                class="tap-target inline-flex items-center justify-center rounded-2xl text-slate-700 hover:bg-slate-100"
                aria-label="Cart"
              >
                <lucide-angular [img]="ShoppingCartIcon" class="h-5 w-5" />
              </a>
            </div>
          </div>

          <!-- Desktop header -->
          <div class="mx-auto hidden max-w-7xl items-center justify-between gap-6 px-6 py-4 md:flex">
            <nav class="hidden items-center w-[33%] gap-8 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600 md:flex">
              <a routerLink="/" routerLinkActive="text-slate-900" [routerLinkActiveOptions]="{ exact: true }" class="hover:text-slate-900">
                Home
              </a>
              <a routerLink="/products" routerLinkActive="text-slate-900" class="hover:text-slate-900">
                Shop
              </a>
              <a class="cursor-not-allowed text-slate-400" aria-disabled="true">contact us</a>
            </nav>

            <a routerLink="/" class="shrink-0 w-[33%] text-lg font-semibold tracking-[0.28em]">
              CASSTORE
            </a>

            <div class="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-700">
              @if (isSignedIn()) {
                <a routerLink="/account" class="hidden hover:text-slate-900 sm:block">Account</a>
                @if (hasStore()) {
                  <a routerLink="/my-store" class="hidden hover:text-slate-900 sm:block">My Store</a>
                } @else {
                  <a routerLink="/create-store" class="hidden hover:text-slate-900 sm:block">Open Store</a>
                }
                <button type="button" class="hidden hover:text-slate-900 sm:block" (click)="signOut()">
                  Logout
                </button>
              } @else {
                <a routerLink="/sign-in" class="hidden hover:text-slate-900 sm:block">Login</a>
              }

              <a class="p-1 text-slate-600 hover:text-slate-900" href="#" (click)="$event.preventDefault()" aria-label="Search">
                <lucide-angular [img]="SearchIcon" class="h-5 w-5" />
              </a>
              <a class="p-1 text-slate-600 hover:text-slate-900" href="#" (click)="$event.preventDefault()" aria-label="Favorites">
                <lucide-angular [img]="HeartIcon" class="h-5 w-5" />
              </a>
              <a routerLink="/cart" class="p-1 text-slate-600 hover:text-slate-900" aria-label="Cart">
                <lucide-angular [img]="ShoppingCartIcon" class="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </header>

      <main class="w-full min-h-[60vh] pb-tabbar md:pb-0 md:min-h-[81vh]">
        @if (isHome()) {
          <router-outlet />
        } @else {
          <div class="mx-auto w-full max-w-6xl px-4 py-6">
            <router-outlet />
          </div>
        }
      </main>

      <footer class="hidden border-t border-slate-200 bg-white md:block">
        <div class="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-8 text-xs text-slate-500">
          @if (settings().footer?.enabled !== false) {
            <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div class="text-slate-600">© {{ year() }} {{ settings().footer?.brand || 'CasStore' }}</div>
                <div class="mt-1 text-slate-400">{{ settings().footer?.tagline }}</div>
                @if (settings().contact?.email || settings().contact?.phone) {
                  <div class="mt-3 space-y-1 text-slate-500">
                    @if (settings().contact?.email) { <div>Email: {{ settings().contact?.email }}</div> }
                    @if (settings().contact?.phone) { <div>Phone: {{ settings().contact?.phone }}</div> }
                  </div>
                }
              </div>

              @if ((settings().footer?.links ?? []).length > 0) {
                <div class="flex flex-wrap gap-x-4 gap-y-2">
                  @for (l of (settings().footer?.links ?? []); track l.label) {
                    <a class="text-slate-500 hover:text-slate-900" [routerLink]="isInternal(l.href) ? l.href : null" [href]="!isInternal(l.href) ? l.href : null">
                      {{ l.label }}
                    </a>
                  }
                </div>
              }
            </div>
          }
        </div>
      </footer>

      <!-- Mobile drawer -->
      @if (drawerOpen()) {
        <div class="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
          <div
            class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            (click)="closeDrawer()"
          ></div>
          <aside
            class="absolute inset-y-0 left-0 flex w-[82%] max-w-[320px] flex-col bg-white shadow-xl pt-safe"
          >
            <div class="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <span class="text-base font-semibold tracking-[0.28em]">CASSTORE</span>
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
                  routerLink="/"
                  [routerLinkActiveOptions]="{ exact: true }"
                  routerLinkActive="bg-slate-100 text-slate-900"
                  (click)="closeDrawer()"
                  class="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50">
                    <lucide-angular [img]="HomeIcon" class="h-5 w-5" />
                  </span>
                  Home
                </a>
                <a
                  routerLink="/products"
                  routerLinkActive="bg-slate-100 text-slate-900"
                  (click)="closeDrawer()"
                  class="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50">
                    <lucide-angular [img]="ShoppingBagIcon" class="h-5 w-5" />
                  </span>
                  Shop
                </a>
                <a
                  routerLink="/cart"
                  routerLinkActive="bg-slate-100 text-slate-900"
                  (click)="closeDrawer()"
                  class="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50">
                    <lucide-angular [img]="ShoppingCartIcon" class="h-5 w-5" />
                  </span>
                  Cart
                </a>
              </div>

              <div class="mt-4 border-t border-slate-200 pt-3 space-y-1">
                @if (isSignedIn()) {
                  <a
                    routerLink="/account"
                    routerLinkActive="bg-slate-100 text-slate-900"
                    (click)="closeDrawer()"
                    class="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50">
                      <lucide-angular [img]="UserIcon" class="h-5 w-5" />
                    </span>
                    Account
                  </a>
                  @if (hasStore()) {
                    <a
                      routerLink="/my-store"
                      (click)="closeDrawer()"
                      class="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50">
                        <lucide-angular [img]="StoreIcon" class="h-5 w-5" />
                      </span>
                      My Store
                    </a>
                  } @else {
                    <a
                      routerLink="/create-store"
                      (click)="closeDrawer()"
                      class="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50">
                        <lucide-angular [img]="StoreIcon" class="h-5 w-5" />
                      </span>
                      Open Store
                    </a>
                  }
                  <button
                    type="button"
                    class="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    (click)="signOut()"
                  >
                    <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50">
                      <lucide-angular [img]="LogOutIcon" class="h-5 w-5" />
                    </span>
                    Logout
                  </button>
                } @else {
                  <a
                    routerLink="/sign-in"
                    (click)="closeDrawer()"
                    class="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50">
                      <lucide-angular [img]="UserIcon" class="h-5 w-5" />
                    </span>
                    Sign in
                  </a>
                }
              </div>
            </div>

            @if (settings().footer?.enabled !== false) {
              <div class="border-t border-slate-200 px-4 py-3 pb-safe text-[11px] text-slate-500">
                © {{ year() }} {{ settings().footer?.brand || 'CasStore' }}
              </div>
            }
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
            routerLink="/"
            routerLinkActive="text-slate-900"
            [routerLinkActiveOptions]="{ exact: true }"
            #homeRla="routerLinkActive"
            class="flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500"
          >
            <span
              class="inline-flex h-8 w-12 items-center justify-center rounded-2xl transition-colors"
              [class.bg-slate-900]="homeRla.isActive"
              [class.text-white]="homeRla.isActive"
            >
              <lucide-angular [img]="HomeIcon" class="h-5 w-5" />
            </span>
            <span>Home</span>
          </a>
          <a
            routerLink="/products"
            routerLinkActive="text-slate-900"
            #shopRla="routerLinkActive"
            class="flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500"
          >
            <span
              class="inline-flex h-8 w-12 items-center justify-center rounded-2xl transition-colors"
              [class.bg-slate-900]="shopRla.isActive"
              [class.text-white]="shopRla.isActive"
            >
              <lucide-angular [img]="ShoppingBagIcon" class="h-5 w-5" />
            </span>
            <span>Shop</span>
          </a>
          <a
            routerLink="/cart"
            routerLinkActive="text-slate-900"
            #cartRla="routerLinkActive"
            class="flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500"
          >
            <span
              class="inline-flex h-8 w-12 items-center justify-center rounded-2xl transition-colors"
              [class.bg-slate-900]="cartRla.isActive"
              [class.text-white]="cartRla.isActive"
            >
              <lucide-angular [img]="ShoppingCartIcon" class="h-5 w-5" />
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
              [class.bg-slate-900]="accountRla.isActive"
              [class.text-white]="accountRla.isActive"
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
export class ShellComponent {
  readonly SearchIcon = Search;
  readonly HeartIcon = Heart;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly ShoppingBagIcon = ShoppingBag;
  readonly MenuIcon = Menu;
  readonly XIcon = X;
  readonly StoreIcon = Store;
  readonly HomeIcon = Home;
  readonly UserIcon = User;
  readonly LogOutIcon = LogOut;

  private router = inject(Router);
  private auth = inject(AuthService);
  private site = inject(SiteSettingsService);
  private storeService = inject(StoreService);

  year = computed(() => new Date().getFullYear());
  private currentUrl = signal(this.router.url);
  isHome = computed(() => this.currentUrl() === '/' || this.currentUrl() === '');
  settings = computed(() => this.site.value());
  isSignedIn = computed(() => Boolean(this.auth.user()));
  hasStore = computed(() => this.storeService.hasStore());

  drawerOpen = signal(false);

  constructor() {
    void this.site.load().catch(() => {});
    void this.storeService.loadMyStore().catch(() => {});
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

  isInternal(href: string) {
    return typeof href === 'string' && href.startsWith('/');
  }

  preventIfHash(e: Event, href: string) {
    if (!href || href === '#') e.preventDefault();
  }

  async signOut() {
    this.drawerOpen.set(false);
    await this.auth.signOut();
    await this.router.navigateByUrl('/sign-in');
  }
}
