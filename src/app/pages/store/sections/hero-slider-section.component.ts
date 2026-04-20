import { Component, OnDestroy, OnInit, computed, input, signal } from '@angular/core';
import { HeroSliderConfig } from '../../../core/store.service';
import { LucideAngularModule, ChevronLeft, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'app-hero-slider-section',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    @if (cfg().slides.length > 0) {
      <section class="relative w-full overflow-hidden bg-slate-900 text-white"
        [style.height]="heightStyle()">
        @for (slide of cfg().slides; track $index; let i = $index) {
          <div
            class="absolute inset-0 transition-opacity duration-700"
            [class.opacity-100]="current() === i"
            [class.opacity-0]="current() !== i"
            [style.pointer-events]="current() === i ? 'auto' : 'none'"
          >
            @if (slide.imageUrl) {
              <img [src]="slide.imageUrl" [alt]="slide.title" class="absolute inset-0 h-full w-full object-cover" />
            } @else {
              <div class="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-600"></div>
            }
            <div class="absolute inset-0 bg-black" [style.opacity]="slide.backgroundOverlay / 100"></div>

            <div class="relative mx-auto flex h-full max-w-7xl px-14 sm:px-6"
                 [class.items-start]="verticalAlign() === 'top'"
                 [class.items-center]="verticalAlign() === 'center'"
                 [class.items-end]="verticalAlign() === 'bottom'"
                 [class.pt-16]="verticalAlign() === 'top'"
                 [class.pb-16]="verticalAlign() === 'bottom'"
                 [class.justify-start]="slide.alignment === 'left'"
                 [class.justify-center]="slide.alignment === 'center'"
                 [class.justify-end]="slide.alignment === 'right'">
              <div class="max-w-xl space-y-4 sm:space-y-5"
                   [class.text-left]="slide.alignment === 'left'"
                   [class.text-center]="slide.alignment === 'center'"
                   [class.text-right]="slide.alignment === 'right'">
                @if (slide.title) {
                  <h1 class="text-3xl font-extrabold leading-tight tracking-tight sm:text-6xl">{{ slide.title }}</h1>
                }
                @if (slide.subtitle) {
                  <p class="text-sm text-white/85 sm:text-lg">{{ slide.subtitle }}</p>
                }
                @if (slide.ctaLabel) {
                  <a [href]="slide.ctaUrl || '#'"
                     class="inline-block rounded-none bg-slate-900 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-white hover:bg-slate-800">
                    {{ slide.ctaLabel }}
                  </a>
                }
              </div>
            </div>
          </div>
        }

        @if (cfg().slides.length > 1) {
          <button type="button" aria-label="Previous slide"
            class="group absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-900 shadow hover:bg-white sm:left-4 sm:h-10 sm:w-10"
            (click)="prev()">
            <lucide-angular [img]="ChevronLeftIcon" class="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button type="button" aria-label="Next slide"
            class="group absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-900 shadow hover:bg-white sm:right-4 sm:h-10 sm:w-10"
            (click)="next()">
            <lucide-angular [img]="ChevronRightIcon" class="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <div class="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
            @for (slide of cfg().slides; track $index; let i = $index) {
              <button type="button" (click)="go(i)"
                class="h-1.5 rounded-full transition-all"
                [class]="current() === i ? 'w-6 bg-white' : 'w-1.5 bg-white/50'"></button>
            }
          </div>
        }
      </section>
    }
  `
})
export class HeroSliderSectionComponent implements OnInit, OnDestroy {
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;

  cfg = input.required<HeroSliderConfig>();
  current = signal(0);

  verticalAlign = computed(() => this.cfg().verticalAlignment ?? 'center');

  heightStyle = computed(() => {
    const h = this.cfg().height ?? 'lg';
    if (h === 'full') return '100vh';
    if (h === 'custom') {
      const vh = Math.min(100, Math.max(10, this.cfg().heightVh ?? 80));
      return `${vh}vh`;
    }
    const preset: Record<'sm' | 'md' | 'lg', string> = { sm: '320px', md: '480px', lg: '640px' };
    return preset[h as 'sm' | 'md' | 'lg'] ?? '640px';
  });

  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.start();
  }

  ngOnDestroy() {
    this.stop();
  }

  private start() {
    this.stop();
    if (!this.cfg().autoPlay || this.cfg().slides.length < 2) return;
    this.timer = setInterval(() => this.next(), this.cfg().intervalMs);
  }

  private stop() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  next() {
    const n = this.cfg().slides.length;
    if (n === 0) return;
    this.current.set((this.current() + 1) % n);
  }

  prev() {
    const n = this.cfg().slides.length;
    if (n === 0) return;
    this.current.set((this.current() - 1 + n) % n);
  }

  go(i: number) {
    this.current.set(i);
    this.start();
  }
}
