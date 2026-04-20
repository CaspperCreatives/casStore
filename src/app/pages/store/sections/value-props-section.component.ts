import { Component, computed, input } from '@angular/core';
import {
  Activity,
  Award,
  BadgeCheck,
  Leaf,
  LucideAngularModule,
  Package,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Truck
} from 'lucide-angular';
import { ValuePropsConfig } from '../../../core/store.service';

const ICONS: Record<string, any> = {
  BadgeCheck,
  ShieldCheck,
  Truck,
  PackageCheck,
  Package,
  Sparkles,
  Star,
  Tag,
  Award,
  Leaf,
  Activity
};

@Component({
  selector: 'app-value-props-section',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    @if (cfg().items.length > 0) {
      <section class="border-y border-slate-200 py-10" [class.bg-slate-50]="cfg().background === 'muted'">
        <div class="mx-auto max-w-7xl px-6">
          @if (cfg().title) {
            <h2 class="mb-6 text-center text-2xl font-bold text-slate-900">{{ cfg().title }}</h2>
          }
          <div class="grid gap-6" [class]="gridClass()">
            @for (item of cfg().items; track $index) {
              <div class="flex items-start gap-3">
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 ring-1 ring-slate-200">
                  <lucide-angular [img]="iconFor(item.icon)" class="h-4 w-4" />
                </span>
                <div class="min-w-0">
                  <div class="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-700">{{ item.title }}</div>
                  @if (item.description) {
                    <p class="mt-1 text-xs leading-5 text-slate-500">{{ item.description }}</p>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </section>
    }
  `
})
export class ValuePropsSectionComponent {
  cfg = input.required<ValuePropsConfig>();
  gridClass = computed(() => {
    const n = this.cfg().items.length;
    if (n <= 2) return 'sm:grid-cols-2';
    if (n === 3) return 'sm:grid-cols-3';
    return 'sm:grid-cols-2 lg:grid-cols-4';
  });
  iconFor(name: string) { return ICONS[name] ?? BadgeCheck; }
}
