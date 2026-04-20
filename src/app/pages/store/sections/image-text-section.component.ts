import { Component, input } from '@angular/core';
import { ImageTextConfig } from '../../../core/store.service';
import { LucideAngularModule, Image } from 'lucide-angular';

@Component({
  selector: 'app-image-text-section',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <section class="mx-auto max-w-7xl px-6 py-16">
      <div class="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
        <div class="overflow-hidden rounded-3xl bg-slate-100"
          [class.md\\:order-2]="cfg().imagePosition === 'right'">
          @if (cfg().imageUrl) {
            <img [src]="cfg().imageUrl" [alt]="cfg().title"
              class="h-80 w-full object-cover md:h-[28rem]" />
          } @else {
            <div class="flex h-80 w-full items-center justify-center md:h-[28rem]">
              <lucide-angular [img]="ImageIcon" class="h-12 w-12 text-slate-300" />
            </div>
          }
        </div>
        <div>
          @if (cfg().title) {
            <h2 class="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{{ cfg().title }}</h2>
          }
          @if (cfg().body) {
            <p class="mt-4 whitespace-pre-line text-base leading-relaxed text-slate-600">{{ cfg().body }}</p>
          }
        </div>
      </div>
    </section>
  `
})
export class ImageTextSectionComponent {
  readonly ImageIcon = Image;
  cfg = input.required<ImageTextConfig>();
}
