import { Component, input } from '@angular/core';
import { BannerConfig } from '../../../core/store.service';

@Component({
  selector: 'app-banner-section',
  standalone: true,
  template: `
    <section class="px-6 py-4 text-center text-sm font-semibold"
      [style.background]="cfg().background || '#f1f5f9'">
      <div class="mx-auto flex max-w-7xl items-center justify-center gap-3 text-slate-900">
        @if (cfg().text) { <span>{{ cfg().text }}</span> }
        @if (cfg().ctaLabel && cfg().ctaUrl) {
          <a [href]="cfg().ctaUrl" target="_blank" rel="noopener"
            class="underline underline-offset-2 hover:no-underline">{{ cfg().ctaLabel }}</a>
        }
      </div>
    </section>
  `
})
export class BannerSectionComponent {
  cfg = input.required<BannerConfig>();
}
