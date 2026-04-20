import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store, StoreService } from '../../core/store.service';
import { StorePage, StorePagesService } from '../../core/store-pages.service';
import { SectionRendererComponent } from './sections/section-renderer.component';

@Component({
  selector: 'app-store-page',
  standalone: true,
  imports: [RouterLink, SectionRendererComponent],
  template: `
    @if (loading()) {
      <div class="mx-auto max-w-5xl px-6 py-16">
        <div class="h-8 w-1/3 animate-pulse rounded-xl bg-slate-100"></div>
        <div class="mt-6 space-y-4">
          <div class="h-4 animate-pulse rounded-xl bg-slate-100"></div>
          <div class="h-4 w-4/5 animate-pulse rounded-xl bg-slate-100"></div>
          <div class="h-4 w-3/5 animate-pulse rounded-xl bg-slate-100"></div>
        </div>
      </div>
    } @else if (!page()) {
      <div class="mx-auto max-w-2xl px-6 py-24 text-center">
        <div class="text-6xl">404</div>
        <h1 class="mt-4 text-2xl font-bold text-slate-900">Page not found</h1>
        <p class="mt-2 text-sm text-slate-500">We couldn't find the page you were looking for.</p>
        <a [routerLink]="['/store', storeSlug()]"
          class="mt-6 inline-block rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
          Back to home
        </a>
      </div>
    } @else if (store()) {
      <div>
        @if (page()!.title) {
          <div class="mx-auto max-w-5xl px-6 pt-10">
            <h1 class="text-3xl font-bold tracking-tight text-slate-900">{{ page()!.title }}</h1>
          </div>
        }
        @for (section of page()!.sections; track section.id) {
          @if (section.visible) {
            <app-section-renderer [section]="section" [store]="store()!" />
          }
        }
      </div>
    }
  `
})
export class StorePagePage {
  private route = inject(ActivatedRoute);
  private storeService = inject(StoreService);
  private pagesService = inject(StorePagesService);

  store = computed<Store | null>(() => this.storeService.viewingStore() ?? this.storeService.store());
  storeSlug = signal('');
  pageSlug = signal('');
  page = signal<StorePage | null>(null);
  loading = signal(true);
  private loadedKey: string | null = null;

  constructor() {
    const parent = this.route.parent?.snapshot.paramMap;
    this.storeSlug.set(parent?.get('storeSlug') ?? '');
    this.pageSlug.set(this.route.snapshot.paramMap.get('pageSlug') ?? '');

    this.route.paramMap.subscribe((params) => {
      this.pageSlug.set(params.get('pageSlug') ?? '');
    });

    effect(() => {
      const s = this.store();
      const slug = this.pageSlug();
      if (!s || !slug) return;
      const key = `${s.id}:${slug}`;
      if (this.loadedKey === key) return;
      this.loadedKey = key;
      void this.load(s.id, slug);
    });
  }

  private async load(storeId: string, slug: string) {
    this.loading.set(true);
    this.page.set(null);
    try {
      const page = await this.pagesService.getPageBySlug({ storeId, slug });
      this.page.set(page);
    } finally {
      this.loading.set(false);
    }
  }
}
