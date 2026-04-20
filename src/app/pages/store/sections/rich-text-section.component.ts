import { Component, computed, input } from '@angular/core';
import { RichTextConfig } from '../../../core/store.service';

@Component({
  selector: 'app-rich-text-section',
  standalone: true,
  template: `
    <section class="bg-white py-14">
      <div class="mx-auto px-6"
           [class.max-w-2xl]="cfg().maxWidth === 'narrow'"
           [class.max-w-5xl]="cfg().maxWidth === 'wide'"
           [class.text-left]="cfg().alignment === 'left'"
           [class.text-center]="cfg().alignment === 'center'">
        @if (cfg().title) {
          <h2 class="mb-4 text-3xl font-bold text-slate-900">{{ cfg().title }}</h2>
        }
        @if (cfg().body) {
          <p class="whitespace-pre-line text-base leading-7 text-slate-600">{{ cfg().body }}</p>
        }
      </div>
    </section>
  `
})
export class RichTextSectionComponent {
  cfg = input.required<RichTextConfig>();
}
