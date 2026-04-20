import { Component, input } from '@angular/core';
import { TestimonialsConfig } from '../../../core/store.service';
import { LucideAngularModule, Quote } from 'lucide-angular';

@Component({
  selector: 'app-testimonials-section',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <section class="mx-auto max-w-7xl px-6 py-16">
      @if (cfg().title) {
        <h2 class="mb-8 text-center text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{{ cfg().title }}</h2>
      }
      @if (cfg().items.length === 0) {
        <p class="text-center text-sm text-slate-500">No testimonials yet.</p>
      } @else {
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          @for (t of cfg().items; track $index) {
            <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <lucide-angular [img]="QuoteIcon" class="h-6 w-6 text-slate-300" />
              @if (t.quote) {
                <p class="mt-3 text-sm leading-relaxed text-slate-700">"{{ t.quote }}"</p>
              }
              <div class="mt-5 flex items-center gap-3">
                @if (t.avatarUrl) {
                  <img [src]="t.avatarUrl" [alt]="t.author"
                    class="h-10 w-10 rounded-full object-cover" />
                } @else {
                  <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
                    {{ initial(t.author) }}
                  </div>
                }
                <div>
                  @if (t.author) { <div class="text-sm font-semibold text-slate-900">{{ t.author }}</div> }
                  @if (t.role) { <div class="text-xs text-slate-500">{{ t.role }}</div> }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </section>
  `
})
export class TestimonialsSectionComponent {
  readonly QuoteIcon = Quote;
  cfg = input.required<TestimonialsConfig>();
  initial(name: string) { return (name || '?').trim().charAt(0).toUpperCase(); }
}
