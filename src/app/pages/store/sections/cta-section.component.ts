import { Component, computed, input } from '@angular/core';
import { CtaConfig, Store } from '../../../core/store.service';

@Component({
  selector: 'app-cta-section',
  standalone: true,
  template: `
    <section class="mx-auto max-w-7xl px-6 py-12">
      <div class="relative overflow-hidden rounded-3xl px-8 py-14 text-center text-white md:px-16 md:py-20"
        [style.background-color]="store().themeColor || '#0f172a'">
        @if (cfg().backgroundImageUrl) {
          <img [src]="cfg().backgroundImageUrl" alt=""
            class="absolute inset-0 h-full w-full object-cover opacity-60" />
          <div class="absolute inset-0 bg-black/40"></div>
        }
        <div class="relative mx-auto max-w-2xl">
          @if (cfg().title) {
            <h2 class="text-3xl font-bold tracking-tight md:text-4xl">{{ cfg().title }}</h2>
          }
          @if (cfg().subtitle) {
            <p class="mt-3 text-white/80">{{ cfg().subtitle }}</p>
          }
          @if (cfg().ctaLabel && cfg().ctaUrl) {
            <a [href]="cfg().ctaUrl" target="_blank" rel="noopener"
              class="mt-6 inline-block rounded-2xl bg-white px-8 py-3.5 text-sm font-bold text-slate-900 hover:bg-slate-100">
              {{ cfg().ctaLabel }}
            </a>
          }
        </div>
      </div>
    </section>
  `
})
export class CtaSectionComponent {
  cfg = input.required<CtaConfig>();
  store = input.required<Store>();
}
