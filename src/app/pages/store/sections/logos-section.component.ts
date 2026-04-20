import { Component, input } from '@angular/core';
import { LogosConfig } from '../../../core/store.service';

@Component({
  selector: 'app-logos-section',
  standalone: true,
  template: `
    @if (cfg().items.length > 0) {
      <section class="border-y border-slate-200 bg-white py-10">
        <div class="mx-auto max-w-7xl px-6">
          @if (cfg().title) {
            <h3 class="mb-6 text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
              {{ cfg().title }}
            </h3>
          }
          <div class="flex flex-wrap items-center justify-around gap-x-10 gap-y-6">
            @for (item of cfg().items; track $index) {
              <a [href]="item.linkUrl || '#'"
                class="flex items-center gap-3 transition"
                [class.opacity-60]="cfg().style === 'muted'"
                [class.hover:opacity-100]="cfg().style === 'muted'">
                @if (item.imageUrl) {
                  <img [src]="item.imageUrl" [alt]="item.label" class="h-8 w-auto max-w-[120px] object-contain" />
                } @else {
                  <span class="flex h-8 w-10 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {{ initials(item.label) }}
                  </span>
                }
                <span class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 max-w-[160px]">
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
