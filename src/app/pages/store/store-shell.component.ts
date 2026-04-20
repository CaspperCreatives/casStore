import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/auth.service';
import { StoreService, Store } from '../../core/store.service';
import { StoreOrdersService } from '../../core/store-orders.service';
import { Heart, LucideAngularModule, Menu, Search, ShoppingCart } from 'lucide-angular';

@Component({
  selector: 'app-store-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, LucideAngularModule],
  template: `
    <div class="min-h-dvh bg-white text-slate-900" [style.--store-color]="themeColor()">

      <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <div class="flex items-center gap-3">
            @if (store()?.logoUrl) {
              <img [src]="store()!.logoUrl" alt="" class="h-8 w-8 rounded-xl object-cover" />
            }
            <a [routerLink]="['/store', storeSlug()]" class="text-lg font-bold tracking-tight">
              {{ store()?.name ?? 'Store' }}
            </a>
          </div>

          <nav class="hidden items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 md:flex">
            <a [routerLink]="['/store', storeSlug()]" class="hover:text-slate-900">Home</a>
            <a [routerLink]="['/store', storeSlug(), 'products']" class="hover:text-slate-900">Shop</a>
          </nav>

          <div class="flex items-center gap-4">
            @if (isSignedIn()) {
              <a routerLink="/account" class="hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 hover:text-slate-900 sm:block">Account</a>
            } @else {
              <a routerLink="/sign-in" class="hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 hover:text-slate-900 sm:block">Sign in</a>
            }
            <a [routerLink]="['/store', storeSlug(), 'cart']" class="relative p-1 text-slate-600 hover:text-slate-900">
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

      <main class="min-h-[80vh]">
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

      <footer class="border-t border-slate-200 bg-white px-6 py-8">
        <div class="mx-auto max-w-7xl flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-xs text-slate-500">
          <div>© {{ year() }} {{ store()?.name }}</div>
          <div>Powered by CasStore</div>
        </div>
      </footer>
    </div>
  `
})
export class StoreShellComponent {
  readonly ShoppingCartIcon = ShoppingCart;
  readonly HeartIcon = Heart;
  readonly SearchIcon = Search;
  readonly MenuIcon = Menu;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private storeService = inject(StoreService);
  private ordersService = inject(StoreOrdersService);

  store = signal<Store | null>(null);
  loadingStore = signal(true);
  storeSlug = signal('');
  year = computed(() => new Date().getFullYear());
  isSignedIn = computed(() => Boolean(this.auth.user()));
  themeColor = computed(() => this.store()?.themeColor ?? '#0f172a');
  cartCount = computed(() => this.ordersService.cartItems().reduce((s, i) => s + i.quantity, 0));

  constructor() {
    const slug = this.route.snapshot.paramMap.get('storeSlug') ?? '';
    this.storeSlug.set(slug);
    void this.loadStore(slug);

    // Listen for reload requests from the storefront editor iframe parent.
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

  private async loadStore(slug: string) {
    this.loadingStore.set(true);
    const store = await this.storeService.loadBySlug(slug);
    this.store.set(store);
    this.loadingStore.set(false);

    if (store && this.auth.user()) {
      void this.ordersService.loadCart(store.id).catch(() => {});
    }
  }
}
