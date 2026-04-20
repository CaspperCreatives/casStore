import { Component, computed, input } from '@angular/core';
import { LogosConfig } from '../../../core/store.service';

@Component({
  selector: 'app-logos-section',
  standalone: true,
  template: `
    @if (cfg().items.length > 0) {
      <section class="border-y border-slate-200 bg-white py-8 sm:py-10">
        <div class="mx-auto max-w-7xl px-4 sm:px-6">
          @if (cfg().title) {
            <h3 class="mb-5 text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500 sm:mb-6">
              {{ cfg().title }}
            </h3>
          }
          <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-5 sm:justify-around sm:gap-x-10 sm:gap-y-6">
            @for (item of cfg().items; track $index) {
              <a [href]="item.linkUrl || '#'"
                class="flex flex-col items-center gap-2 text-center transition sm:text-left"
                [class.sm:flex-col]="isVertical()"
                [class.sm:gap-2]="isVertical()"
                [class.sm:flex-row]="!isVertical()"
                [class.sm:gap-3]="!isVertical()"
                [class.opacity-60]="cfg().style === 'muted'"
                [class.hover:opacity-100]="cfg().style === 'muted'">
                @if (item.imageUrl) {
                  <img [src]="item.imageUrl" [alt]="item.label"
                    class="w-auto object-contain"
                    [style.height.px]="logoPx()"
                    [style.maxWidth.px]="logoPx() * 4" />
                } @else {
                  <span
                    class="shrink-0 inline-flex items-center justify-center rounded-md border border-slate-300 bg-slate-50 font-bold uppercase tracking-widest text-slate-500"
                    [style.height.px]="logoPx()"
                    [style.minWidth.px]="logoPx() * 1.25"
                    [style.fontSize.px]="initialsPx()">
                    {{ initials(item.label) }}
                  </span>
                }
                <span
                  class="font-semibold uppercase tracking-[0.2em] text-slate-600"
                  [class.sm:text-center]="isVertical()"
                  [style.fontSize.px]="labelPx()"
                  [style.maxWidth.px]="isVertical() ? logoPx() * 5 : 160">
                  {{ item.label }}
                </span>
              </a>
            }
          </div>
        </div>
      </section>
    }
  `
})
export class LogosSectionComponent {
  cfg = input.required<LogosConfig>();

  logoPx = computed(() => {
    const v = this.cfg().logoSize;
    return typeof v === 'number' && v > 0 ? v : 32;
  });
  labelPx = computed(() => {
    const v = this.cfg().labelSize;
    return typeof v === 'number' && v > 0 ? v : 11;
  });
  initialsPx = computed(() => Math.max(8, Math.round(this.logoPx() * 0.3)));
  isVertical = computed(() => this.cfg().itemLayout === 'vertical');

  initials(label: string): string {
    return (label || '?')
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 3)
      .join('')
      .toUpperCase();
  }
}
