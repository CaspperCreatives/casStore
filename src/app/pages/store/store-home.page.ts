import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { buildDefaultSections, Store, StoreSection, StoreService } from '../../core/store.service';
import { StorePage, StorePagesService } from '../../core/store-pages.service';
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
            <app-section-renderer [section]="section" [store]="s" />
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

  store = computed<Store | null>(() => this.storeService.viewingStore() ?? this.storeService.store());
  homePage = signal<StorePage | null>(null);
  private loadedStoreId: string | null = null;

  sections = computed<StoreSection[]>(() => {
    const page = this.homePage();
    if (page?.sections?.length) return page.sections;
    const s = this.store();
    if (!s) return [];
    if (s.sections && s.sections.length > 0) return s.sections;
    return buildDefaultSections(s);
  });

  constructor() {
    effect(() => {
      const s = this.store();
      if (!s) return;

      if (s.homeTarget === 'products') {
        void this.router.navigate(['/store', s.slug, 'products'], { replaceUrl: true });
        return;
      }

      if (this.loadedStoreId === s.id) return;
      this.loadedStoreId = s.id;
      void this.loadHome(s.id);
    });
  }

  private async loadHome(storeId: string) {
    const page = await this.pagesService.getPageBySlug({ storeId, slug: 'home' });
    this.homePage.set(page);
  }
}
