import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../core/auth.service';
import { SiteSettingsService } from '../core/site-settings.service';
import { StoreService } from '../core/store.service';
import {
  Home,
  LogOut,
  LucideAngularModule,
  Menu,
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
            <div class="w-10"></div>
          </div>

          <!-- Desktop header -->
          <div class="mx-auto hidden max-w-7xl items-center justify-between gap-6 px-6 py-4 md:flex">
            <a routerLink="/" class="shrink-0 text-lg font-semibold tracking-[0.28em]">
              CASSTORE
            </a>

            <div class="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-700">
              @if (isSignedIn()) {
                <a routerLink="/account" routerLinkActive="text-slate-900" class="hidden hover:text-slate-900 sm:block">
                  Account
                </a>
                @if (hasStore()) {
                  <a routerLink="/my-store" class="hidden hover:text-slate-900 sm:block">My Store</a>
                } @else {
                  <a routerLink="/create-store" class="hidden hover:text-slate-900 sm:block">
                    Create Store
                  </a>
                }
                <button type="button" class="hidden hover:text-slate-900 sm:block" (click)="signOut()">
                  Logout
                </button>
              } @else {
                <a routerLink="/sign-in" class="hidden hover:text-slate-900 sm:block">Sign in</a>
                <a
                  routerLink="/sign-up"
                  class="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
                >
                  Create store
                </a>
              }
            </div>
          </div>
        </div>
      </header>

      <main class="w-full min-h-[70vh] pb-10 md:pb-0 md:min-h-[81vh]">
        <div class="mx-auto w-full max-w-6xl px-4 py-6">
          <router-outlet />
        </div>
      </main>

      <footer class="hidden border-t border-slate-200 bg-white md:block">
        <div class="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-8 text-xs text-slate-500">
          <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div class="text-slate-600">© {{ year() }} CasStore</div>
              <div class="mt-1 text-slate-400">
                Launch your online store in seconds.
              </div>
            </div>
            <div class="flex flex-wrap gap-x-4 gap-y-2">
              <a routerLink="/" class="text-slate-500 hover:text-slate-900">Home</a>
              @if (isSignedIn()) {
                <a routerLink="/account" class="text-slate-500 hover:text-slate-900">Account</a>
                @if (hasStore()) {
                  <a routerLink="/my-store" class="text-slate-500 hover:text-slate-900">My Store</a>
                } @else {
                  <a routerLink="/create-store" class="text-slate-500 hover:text-slate-900">
                    Create Store
                  </a>
                }
              } @else {
                <a routerLink="/sign-in" class="text-slate-500 hover:text-slate-900">Sign in</a>
                <a routerLink="/sign-up" class="text-slate-500 hover:text-slate-900">Sign up</a>
              }
            </div>
          </div>
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
                      Create Store
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
                  <a
                    routerLink="/sign-up"
                    (click)="closeDrawer()"
                    class="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50">
                      <lucide-angular [img]="StoreIcon" class="h-5 w-5" />
                    </span>
                    Create Store
                  </a>
                }
              </div>
            </div>

            <div class="border-t border-slate-200 px-4 py-3 pb-safe text-[11px] text-slate-500">
              © {{ year() }} CasStore
            </div>
          </aside>
        </div>
      }
    </div>
  `
})
export class ShellComponent {
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
  isSignedIn = computed(() => Boolean(this.auth.user()));
  hasStore = computed(() => this.storeService.hasStore());

  drawerOpen = signal(false);

  constructor() {
    void this.site.load().catch(() => {});
    void this.storeService.loadMyStore().catch(() => {});
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
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
