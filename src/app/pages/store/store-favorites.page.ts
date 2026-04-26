import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TENANT_CONTEXT } from '../../core/host-routing';

@Component({
  selector: 'app-store-favorites-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="mx-auto max-w-3xl px-6 py-8">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Favorites</h1>
      <p class="mt-1 text-sm text-slate-500">Saved items for this store.</p>

      <div class="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white py-12 text-center">
        <p class="font-semibold text-slate-700">Favorites are ready</p>
        <p class="mt-1 text-sm text-slate-500">You can start saving products here next.</p>
        <a [routerLink]="productsLink()" class="mt-3 inline-block rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
          Browse products
        </a>
      </div>
    </div>
  `
})
export class StoreFavoritesPage {
  private route = inject(ActivatedRoute);
  private tenant = inject(TENANT_CONTEXT, { optional: true });
  storeSlug = signal(this.tenant?.slug ?? this.route.parent?.snapshot.paramMap.get('storeSlug') ?? '');
  productsLink = computed(() => (this.tenant ? ['/products'] : ['/store', this.storeSlug(), 'products']));
}
