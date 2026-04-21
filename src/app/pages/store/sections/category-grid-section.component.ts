import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryGridConfig, Store } from '../../../core/store.service';
import { StoreRouterService } from '../../../core/store-router';
import { LucideAngularModule, LayoutGrid } from 'lucide-angular';

@Component({
  selector: 'app-category-grid-section',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  template: `
    <section class="mx-auto max-w-7xl px-6 py-12">
      @if (cfg().title) {
        <h2 class="mb-6 text-2xl font-bold tracking-tight text-slate-900">{{ cfg().title }}</h2>
      }
      @if (cfg().categories.length === 0) {
        <div class="rounded-3xl border border-dashed border-slate-300 py-16 text-center">
          <lucide-angular [img]="GridIcon" class="mx-auto h-10 w-10 text-slate-300" />
          <p class="mt-3 text-sm text-slate-500">No categories yet.</p>
        </div>
      } @else {
        <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          @for (c of cfg().categories; track $index) {
            <a [routerLink]="productsLink()"
              [queryParams]="c.productFilter ? { category: c.productFilter } : {}"
              class="group relative aspect-[4/3] overflow-hidden rounded-3xl bg-slate-100">
              @if (c.imageUrl) {
                <img [src]="c.imageUrl" [alt]="c.label"
                  class="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105" />
              }
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div class="absolute inset-x-0 bottom-0 p-4 text-white">
                <div class="text-lg font-bold tracking-tight">{{ c.label || 'Category' }}</div>
              </div>
            </a>
          }
        </div>
      }
    </section>
  `
})
export class CategoryGridSectionComponent {
  readonly GridIcon = LayoutGrid;
  cfg = input.required<CategoryGridConfig>();
  store = input.required<Store>();
  private storeRouter = inject(StoreRouterService);
  productsLink = computed(() => this.storeRouter.link(['products']));
}
