import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { buildDefaultSections, Store, StoreSection, StoreService } from '../../core/store.service';
import { StorePage, StorePagesService } from '../../core/store-pages.service';
import { StoreRouterService } from '../../core/store-router';
import { SectionRendererComponent } from './sections/section-renderer.component';

@Component({
  selector: 'app-store-home-page',
  standalone: true,
  imports: [SectionRendererComponent],
  template: `
    @if (store(); as s) {
      <div>
        @for (section of sections(); track section.id) {
          @if (section.visible) {
            <app-section-renderer [section]="section" [store]="s" [pageId]="pageId()" />
          }
        }
      </div>
    }
  `
})
export class StoreHomePage {
  private storeService = inject(StoreService);
  private pagesService = inject(StorePagesService);
  private router = inject(Router);
  private storeRouter = inject(StoreRouterService);

  store = computed<Store | null>(() => this.storeService.viewingStore() ?? this.storeService.store());
  homePage = signal<StorePage | null>(null);
  pageId = computed(() => this.homePage()?.id ?? '');
  private homeFetchInFlight: string | null = null;

  sections = computed<StoreSection[]>(() => {
    const s = this.store();
    if (!s) return [];
    if (s.homeTarget === 'products') return [];
    const page = this.homePage();
    if (page?.sections?.length) return page.sections;
    if (s.sections && s.sections.length > 0) return s.sections;
    return buildDefaultSections(s);
  });

  constructor() {
    effect(() => {
      const s = this.store();
      const homeMap = this.pagesService.publicHomePageByStoreId();
      if (!s) return;

      if (s.homeTarget === 'products') {
        void this.router.navigate(this.storeRouter.link(['products']), { replaceUrl: true });
        return;
      }

      if (Object.hasOwn(homeMap, s.id)) {
        this.homePage.set(homeMap[s.id]!);
        return;
      }

      void this.loadHome(s.id);
    });
  }

  private async loadHome(storeId: string) {
    if (this.homeFetchInFlight === storeId) return;
    this.homeFetchInFlight = storeId;
    try {
      const page = await this.pagesService.getPageBySlug({ storeId, slug: 'home' });
      this.homePage.set(page);
      this.pagesService.setPublicHomePage(storeId, page);
    } finally {
      this.homeFetchInFlight = null;
    }
  }
}
