import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StoreService } from '../../core/store.service';
import { StoreProduct, StoreProductsService } from '../../core/store-products.service';
import { StoreOrdersService } from '../../core/store-orders.service';
import { AuthService } from '../../core/auth.service';
import { LucideAngularModule, Package, ShoppingCart } from 'lucide-angular';

@Component({
  selector: 'app-store-products-page',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  template: `
    <div class="mx-auto max-w-7xl px-6 py-8">
      <div class="mb-6">
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">All products</h1>
        @if (products().length > 0) {
          <p class="mt-1 text-sm text-slate-500">{{ products().length }} product{{ products().length !== 1 ? 's' : '' }}</p>
        }
      </div>

      @if (loading()) {
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          @for (_ of [1,2,3,4,5,6,7,8]; track _) {
            <div class="aspect-square animate-pulse rounded-3xl bg-slate-100"></div>
          }
        </div>
      } @else if (products().length === 0) {
        <div class="rounded-3xl border border-dashed border-slate-300 py-20 text-center">
          <lucide-angular [img]="PackageIcon" class="mx-auto h-12 w-12 text-slate-300" />
          <p class="mt-3 text-sm text-slate-500">No products available yet.</p>
        </div>
      } @else {
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          @for (p of products(); track p.id) {
            <div class="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white hover:shadow-md transition-shadow">
              <a [routerLink]="['/store', storeSlug(), 'products', p.id]">
                <div class="aspect-square overflow-hidden bg-slate-100">
                  @if (p.imageUrl) {
                    <img [src]="p.imageUrl" [alt]="p.name"
                      class="h-full w-full object-cover transition-transform group-hover:scale-105"
                      (error)="$any($event.target).style.display='none'" />
                  } @else {
                    <div class="flex h-full w-full items-center justify-center">
                      <lucide-angular [img]="PackageIcon" class="h-10 w-10 text-slate-300" />
                    </div>
                  }
                </div>
                <div class="p-3 pb-2">
                  @if (p.category) {
                    <div class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{{ p.category }}</div>
                  }
                  <div class="font-semibold text-slate-900">{{ p.name }}</div>
                  <div class="mt-0.5 text-xs text-slate-500 line-clamp-2">{{ p.description }}</div>
                </div>
              </a>
              <div class="flex items-center justify-between gap-2 px-3 pb-3">
                <span class="font-bold text-slate-900">{{ fmtPrice(p.priceCents, p.currency) }}</span>
                @if (p.stock <= 0) {
                  <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">Out of stock</span>
                } @else {
                  <button
                    type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-900 hover:text-white transition-colors"
                    (click)="addToCart(p)"
                  >
                    <lucide-angular [img]="ShoppingCartIcon" class="h-4 w-4" />
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }

      @if (cartMessage()) {
        <div class="fixed bottom-4 right-4 z-50 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg">
          {{ cartMessage() }}
        </div>
      }
    </div>
  `
})
export class StoreProductsPage {
  readonly PackageIcon = Package;
  readonly ShoppingCartIcon = ShoppingCart;

  private route = inject(ActivatedRoute);
  private storeService = inject(StoreService);
  private productsService = inject(StoreProductsService);
  private ordersService = inject(StoreOrdersService);
  private auth = inject(AuthService);

  storeSlug = signal('');
  products = signal<StoreProduct[]>([]);
  loading = signal(true);
  cartMessage = signal<string | null>(null);

  constructor() {
    const slug = this.route.parent?.snapshot.paramMap.get('storeSlug') ?? '';
    this.storeSlug.set(slug);
    void this.load();
  }

  private async load() {
    const store = this.storeService.store();
    if (!store) { this.loading.set(false); return; }
    const prods = await this.productsService.loadPublicProducts(store.id);
    this.products.set(prods);
    this.loading.set(false);
  }

  async addToCart(p: StoreProduct) {
    const store = this.storeService.store();
    if (!store || !this.auth.user()) {
      this.showMsg('Please sign in to add items to cart');
      return;
    }
    if (p.stock <= 0) return;
    try {
      await this.ordersService.addToCart(store.id, p.id);
      this.showMsg(`${p.name} added to cart`);
    } catch { this.showMsg('Could not add to cart'); }
  }

  private showMsg(msg: string) {
    this.cartMessage.set(msg);
    setTimeout(() => this.cartMessage.set(null), 2500);
  }

  fmtPrice(cents: number, currency: string) {
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(cents / 100); }
    catch { return `$${(cents / 100).toFixed(2)}`; }
  }
}
