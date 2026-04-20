import { Component, computed, inject } from '@angular/core';
import { buildDefaultSections, StoreService } from '../../core/store.service';
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

  store = computed(() => this.storeService.viewingStore() ?? this.storeService.store());
  sections = computed(() => {
    const s = this.store();
    if (!s) return [];
    if (s.sections && s.sections.length > 0) return s.sections;
    return buildDefaultSections(s);
  });
}
