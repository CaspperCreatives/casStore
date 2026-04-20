import { Component, computed, input } from '@angular/core';
import {
  Heart,
  LucideAngularModule,
  Package,
  Sparkles,
  Star,
  Tag,
  Truck
} from 'lucide-angular';
import { PromoCardsConfig } from '../../../core/store.service';

const ICONS: Record<string, any> = { Sparkles, Tag, Package, Star, Heart, Truck };

@Component({
  selector: 'app-promo-cards-section',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    @if (cfg().cards.length > 0) {
      <section class="bg-white py-10">
        <div class="mx-auto max-w-7xl px-6">
          @if (cfg().title) {
            <h2 class="mb-6 text-2xl font-bold text-slate-900">{{ cfg().title }}</h2>
          }
          <div class="grid gap-4" [class]="gridClass()">
            @for (card of cfg().cards; track $index) {
              <a [href]="card.ctaUrl || '#'"
                class="group flex items-start justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-slate-400 hover:shadow-sm">
                <div class="min-w-0">
                  @if (card.label) {
                    <div class="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">{{ card.label }}</div>
                  }
                  @if (card.title) {
                    <div class="mt-1 text-base font-bold text-slate-900">{{ card.title }}</div>
                  }
                  @if (card.description) {
                    <p class="mt-1 text-xs text-slate-500">{{ card.description }}</p>
                  }
                </div>
                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 group-hover:border-slate-900 group-hover:text-slate-900">
                  <lucide-angular [img]="iconFor(card.icon)" class="h-4 w-4" />
                </span>
              </a>
            }
          </div>
        </div>
      </section>
    }
  `
})
export class PromoCardsSectionComponent {
  cfg = input.required<PromoCardsConfig>();
  gridClass = computed(() => {
    switch (this.cfg().columns) {
      case 2: return 'sm:grid-cols-2';
      case 4: return 'sm:grid-cols-2 lg:grid-cols-4';
      default: return 'sm:grid-cols-2 lg:grid-cols-3';
    }
  });
  iconFor(name: string) { return ICONS[name] ?? Sparkles; }
}
