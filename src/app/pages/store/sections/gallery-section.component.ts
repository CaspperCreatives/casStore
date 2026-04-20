import { Component, input } from '@angular/core';
import { GalleryConfig } from '../../../core/store.service';
import { LucideAngularModule, Image } from 'lucide-angular';

@Component({
  selector: 'app-gallery-section',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <section class="mx-auto max-w-7xl px-6 py-12">
      @if (cfg().title) {
        <h2 class="mb-6 text-2xl font-bold tracking-tight text-slate-900">{{ cfg().title }}</h2>
      }
      @if (cfg().images.length === 0) {
        <div class="rounded-3xl border border-dashed border-slate-300 py-16 text-center">
          <lucide-angular [img]="ImageIcon" class="mx-auto h-10 w-10 text-slate-300" />
          <p class="mt-3 text-sm text-slate-500">No images yet.</p>
        </div>
      } @else {
        <div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          @for (g of cfg().images; track $index) {
            <ng-container>
              @if (g.linkUrl) {
                <a [href]="g.linkUrl" target="_blank" rel="noopener"
                  class="group relative block aspect-square overflow-hidden rounded-2xl bg-slate-100">
                  <img [src]="g.url" [alt]="g.caption"
                    class="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  @if (g.caption) {
                    <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-xs font-semibold text-white">
                      {{ g.caption }}
                    </div>
                  }
                </a>
              } @else {
                <div class="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
                  <img [src]="g.url" [alt]="g.caption" class="h-full w-full object-cover" />
                  @if (g.caption) {
                    <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-xs font-semibold text-white">
                      {{ g.caption }}
                    </div>
                  }
                </div>
              }
            </ng-container>
          }
        </div>
      }
    </section>
  `
})
export class GallerySectionComponent {
  readonly ImageIcon = Image;
  cfg = input.required<GalleryConfig>();
}
