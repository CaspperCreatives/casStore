import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroConfig, Store } from '../../../core/store.service';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section
      class="relative flex w-full overflow-hidden"
      [class.items-start]="verticalAlign() === 'top'"
      [class.items-center]="verticalAlign() === 'center'"
      [class.items-end]="verticalAlign() === 'bottom'"
      [style.min-height]="minHeightStyle()"
      [style.background-color]="store().themeColor || '#0f172a'"
    >
      @if (cfg().backgroundImageUrl) {
        <img [src]="cfg().backgroundImageUrl" alt=""
          class="absolute inset-0 h-full w-full object-cover" />
        <div class="absolute inset-0 bg-black" [style.opacity]="overlayOpacity()"></div>
      }

      <div class="relative z-10 mx-auto flex w-full max-w-7xl px-6 py-20 md:py-28 text-white"
        [class.justify-start]="cfg().alignment === 'left'"
        [class.justify-center]="cfg().alignment === 'center'"
        [class.justify-end]="cfg().alignment === 'right'"
      >
        <div class="max-w-2xl"
          [class.text-center]="cfg().alignment === 'center'"
          [class.text-right]="cfg().alignment === 'right'"
        >
          @if (store().logoUrl && !cfg().backgroundImageUrl) {
            <img [src]="store().logoUrl" alt="" class="mb-6 h-16 w-16 rounded-2xl object-cover border border-white/20"
              [class.mx-auto]="cfg().alignment === 'center'"
              [class.ml-auto]="cfg().alignment === 'right'" />
          }
          @if (cfg().title) {
            <h1 class="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              {{ cfg().title }}
            </h1>
          }
          @if (cfg().subtitle) {
            <p class="mt-4 text-lg text-white/80 md:text-xl">{{ cfg().subtitle }}</p>
          }
          @if (cfg().ctaLabel) {
            <div class="mt-8">
              @if (cfg().ctaTarget === 'url' && cfg().ctaUrl) {
                <a [href]="cfg().ctaUrl" target="_blank" rel="noopener"
                  class="inline-block rounded-2xl bg-white px-8 py-3.5 text-sm font-bold text-slate-900 hover:bg-slate-100">
                  {{ cfg().ctaLabel }}
                </a>
              } @else {
                <a [routerLink]="['/store', store().slug, 'products']"
                  class="inline-block rounded-2xl bg-white px-8 py-3.5 text-sm font-bold text-slate-900 hover:bg-slate-100">
                  {{ cfg().ctaLabel }}
                </a>
              }
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class HeroSectionComponent {
  cfg = input.required<HeroConfig>();
  store = input.required<Store>();
  overlayOpacity = computed(() => Math.min(100, Math.max(0, this.cfg().backgroundOverlay ?? 40)) / 100);

  verticalAlign = computed(() => this.cfg().verticalAlignment ?? 'center');

  minHeightStyle = computed(() => {
    const h = this.cfg().height ?? 'md';
    if (h === 'full') return '100vh';
    if (h === 'custom') {
      const vh = Math.min(100, Math.max(10, this.cfg().heightVh ?? 60));
      return `${vh}vh`;
    }
    const preset: Record<'sm' | 'md' | 'lg', string> = { sm: '320px', md: '480px', lg: '640px' };
    return preset[h as 'sm' | 'md' | 'lg'] ?? '480px';
  });
}
