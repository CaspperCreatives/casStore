import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FeaturedProductsConfig, Store } from '../../../core/store.service';
import { StoreProduct, StoreProductsService } from '../../../core/store-products.service';
import { StoreRouterService } from '../../../core/store-router';
import { LucideAngularModule, Package } from 'lucide-angular';

@Component({
  selector: 'app-featured-products-section',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  template: `
    <section class="mx-auto max-w-7xl px-6 py-12">
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-2xl font-bold tracking-tight text-slate-900">{{ cfg().title || 'Featured products' }}</h2>
        <a [routerLink]="productsLink()" class="text-sm font-semibold text-slate-600 hover:text-slate-900">
          View all &rarr;
        </a>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          @for (_ of skeletons; track $index) {
            <div class="aspect-square animate-pulse rounded-3xl bg-slate-100"></div>
          }
        </div>
      } @else if (displayed().length === 0) {
        <div class="rounded-3xl border border-dashed border-slate-300 py-16 text-center">
          <lucide-angular [img]="PackageIcon" class="mx-auto h-12 w-12 text-slate-300" />
          <p class="mt-3 text-sm text-slate-500">No products yet.</p>
        </div>
      } @else {
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          @for (p of displayed(); track p.id) {
            <a [routerLink]="productLink(p.id)"
              class="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition-shadow hover:shadow-md">
              <div class="aspect-square overflow-hidden bg-slate-100">
                @if (p.imageUrl) {
                  <img [src]="p.imageUrl" [alt]="p.name"
                    class="h-full w-full object-cover transition-transform group-hover:scale-105" />
                } @else {
                  <div class="flex h-full w-full items-center justify-center">
                    <lucide-angular [img]="PackageIcon" class="h-10 w-10 text-slate-300" />
                  </div>
                }
              </div>
              <div class="p-3">
                <div class="truncate text-sm font-semibold text-slate-900">{{ p.name }}</div>
                <div class="mt-1 text-sm font-bold text-slate-900">{{ fmtPrice(p.priceCents, p.currency) }}</div>
              </div>
            </a>
          }
        </div>
      }
    </section>
  `
})
export class FeaturedProductsSectionComponent {
  readonly PackageIcon = Package;
  readonly skeletons = Array(8).fill(0);

  cfg = input.required<FeaturedProductsConfig>();
  store = input.required<Store>();

  private productsService = inject(StoreProductsService);
  private storeRouter = inject(StoreRouterService);
  loading = signal(true);
  displayed = signal<StoreProduct[]>([]);
  productsLink = computed(() => this.storeRouter.link(['products']));
  productLink = (productId: string) => this.storeRouter.link(['products', productId]);

  constructor() {
    effect(() => {
      const s = this.store();
      if (s?.id) void this.load(s.id);
    });
  }

  private async load(storeId: string) {
    this.loading.set(true);
    const all = await this.productsService.loadPublicProducts(storeId);
    const config = this.cfg();
    let picked: StoreProduct[];
    if (config.productIds?.length) {
      const byId = new Map(all.map((p) => [p.id, p]));
      picked = config.productIds.map((id) => byId.get(id)).filter((p): p is StoreProduct => !!p);
    } else {
      picked = all.slice(0, Math.max(1, Math.min(24, config.limit || 8)));
    }
    this.displayed.set(picked);
    this.loading.set(false);
  }

  fmtPrice(cents: number, currency: string) {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format((cents ?? 0) / 100);
    } catch {
      return `$${((cents ?? 0) / 100).toFixed(2)}`;
    }
  }
}
