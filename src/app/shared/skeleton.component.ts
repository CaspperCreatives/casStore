import { Component, input } from '@angular/core';

/** Reusable animated skeleton loader. Pass `count` for repeated rows. */
@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `
    @for (i of rows(); track i) {
      <div class="animate-pulse space-y-3 {{ wrapClass() }}">
        @if (variant() === 'card') {
          <div class="rounded-xl bg-slate-100 {{ imageClass() }}"></div>
          <div class="h-3 w-3/4 rounded bg-slate-100"></div>
          <div class="h-3 w-1/2 rounded bg-slate-100"></div>
        } @else if (variant() === 'row') {
          <div class="flex items-center gap-4">
            <div class="h-10 w-10 shrink-0 rounded-full bg-slate-100"></div>
            <div class="flex-1 space-y-2">
              <div class="h-3 w-3/4 rounded bg-slate-100"></div>
              <div class="h-3 w-1/2 rounded bg-slate-100"></div>
            </div>
          </div>
        } @else {
          <div class="h-4 w-full rounded bg-slate-100"></div>
          <div class="h-4 w-5/6 rounded bg-slate-100"></div>
          <div class="h-4 w-4/6 rounded bg-slate-100"></div>
        }
      </div>
    }
  `
})
export class SkeletonComponent {
  variant = input<'card' | 'row' | 'lines'>('lines');
  count = input(1);
  wrapClass = input('');
  imageClass = input('h-48 w-full');

  rows() {
    return Array.from({ length: this.count() }, (_, i) => i);
  }
}
