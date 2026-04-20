import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../core/auth.service';
import { SiteSettingsService } from '../core/site-settings.service';
import { StoreService } from '../core/store.service';
import { Heart, LucideAngularModule, Menu, Search, ShoppingCart, Store } from 'lucide-angular';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <div class="min-h-dvh bg-white text-slate-900">
    @if (settings().banner?.enabled !== false) {
          <div class="bg-slate-950 text-white">
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
     

        <div class="border-b border-slate-200 bg-white/50 backdrop-blur">
          <div class="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
           

            <nav class="hidden items-center w-[33%] gap-8 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600 md:flex">
              <a routerLink="/" routerLinkActive="text-slate-900" [routerLinkActiveOptions]="{ exact: true }" class="hover:text-slate-900">
                Home
              </a>
              <!-- <a class="cursor-not-allowed text-slate-400" aria-disabled="true">Pages</a> -->
              <a routerLink="/products" routerLinkActive="text-slate-900" class="hover:text-slate-900">
                Shop
              </a>
              <!-- <a class="cursor-not-allowed text-slate-400" aria-disabled="true">Blog</a> -->
              <!-- <a class="cursor-not-allowed text-slate-400" aria-disabled="true">Lookbook</a> -->
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
              <button class="p-1 text-slate-600 hover:text-slate-900 md:hidden" type="button" aria-label="Menu">
                <lucide-angular [img]="MenuIcon" class="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main class="w-full min-h-[81vh]">
        @if (isHome()) {
          <router-outlet />
        } @else {
          <div class="mx-auto w-full max-w-6xl px-4 py-6">
            <router-outlet />
          </div>
        }
      </main>

      <footer class="border-t border-slate-200 bg-white">
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
    </div>
  `
})
export class ShellComponent {
  readonly SearchIcon = Search;
  readonly HeartIcon = Heart;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly MenuIcon = Menu;
  readonly StoreIcon = Store;

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

  constructor() {
    void this.site.load().catch(() => {});
    void this.storeService.loadMyStore().catch(() => {});
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.currentUrl.set(this.router.url));
  }

  isInternal(href: string) {
    return typeof href === 'string' && href.startsWith('/');
  }

  preventIfHash(e: Event, href: string) {
    if (!href || href === '#') e.preventDefault();
  }

  async signOut() {
    await this.auth.signOut();
    await this.router.navigateByUrl('/sign-in');
  }
}


