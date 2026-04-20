import { Component, input } from '@angular/core';
import { SectionType } from '../../../core/store.service';

/**
 * Lightweight HTML thumbnails for each section type.
 * Used in the "Add section" picker and preset picker so users can
 * see a visual representation before committing.
 *
 * All thumbnails render inside a fixed-aspect 16:9 container with a
 * rounded, muted backdrop. Styles are hand-tuned to suggest the shape
 * and rhythm of the real rendered section rather than data.
 */
@Component({
  selector: 'app-section-thumbnail',
  standalone: true,
  template: `
    <div class="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
      @switch (type()) {

        @case ('hero') {
          <div class="relative h-full w-full bg-gradient-to-br from-slate-400 to-slate-700">
            <div class="absolute inset-0 bg-black/20"></div>
            <div class="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-3 text-center">
              <div class="h-1.5 w-24 rounded bg-white/90"></div>
              <div class="h-1 w-36 rounded bg-white/70"></div>
              <div class="mt-1 h-3 w-14 rounded bg-white"></div>
            </div>
          </div>
        }

        @case ('heroSlider') {
          <div class="relative h-full w-full bg-gradient-to-br from-slate-500 to-slate-800">
            <div class="absolute inset-0 bg-black/25"></div>
            <div class="absolute left-4 top-1/2 flex -translate-y-1/2 flex-col gap-1">
              <div class="h-1.5 w-16 rounded bg-white/90"></div>
              <div class="h-1 w-20 rounded bg-white/60"></div>
              <div class="mt-0.5 h-2 w-10 rounded bg-white"></div>
            </div>
            <div class="absolute left-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-[9px] font-bold text-slate-800">‹</div>
            <div class="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-[9px] font-bold text-slate-800">›</div>
            <div class="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              <span class="h-1 w-4 rounded bg-white"></span>
              <span class="h-1 w-1 rounded bg-white/60"></span>
              <span class="h-1 w-1 rounded bg-white/60"></span>
            </div>
          </div>
        }

        @case ('banner') {
          <div class="flex h-full w-full flex-col bg-slate-50">
            <div class="flex h-6 items-center justify-center bg-amber-50 text-[9px] font-semibold tracking-[0.2em] text-amber-900">
              ● FREE SHIPPING ●
            </div>
            <div class="flex-1 bg-white"></div>
          </div>
        }

        @case ('featuredProducts') {
          <div class="flex h-full w-full flex-col gap-2 bg-white p-3">
            <div class="flex items-center justify-between">
              <div class="h-1.5 w-14 rounded bg-slate-800"></div>
              <div class="h-1 w-6 rounded bg-slate-400"></div>
            </div>
            <div class="grid flex-1 grid-cols-4 gap-1.5">
              <div class="flex flex-col gap-1">
                <div class="flex-1 rounded-md bg-gradient-to-br from-slate-200 to-slate-300"></div>
                <div class="h-1 w-3/4 rounded bg-slate-400"></div>
                <div class="h-1 w-1/2 rounded bg-slate-900"></div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="flex-1 rounded-md bg-gradient-to-br from-slate-200 to-slate-300"></div>
                <div class="h-1 w-3/4 rounded bg-slate-400"></div>
                <div class="h-1 w-1/2 rounded bg-slate-900"></div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="flex-1 rounded-md bg-gradient-to-br from-slate-200 to-slate-300"></div>
                <div class="h-1 w-3/4 rounded bg-slate-400"></div>
                <div class="h-1 w-1/2 rounded bg-slate-900"></div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="flex-1 rounded-md bg-gradient-to-br from-slate-200 to-slate-300"></div>
                <div class="h-1 w-3/4 rounded bg-slate-400"></div>
                <div class="h-1 w-1/2 rounded bg-slate-900"></div>
              </div>
            </div>
          </div>
        }

        @case ('imageText') {
          <div class="flex h-full w-full gap-2 bg-white p-3">
            <div class="h-full w-1/2 rounded-md bg-gradient-to-br from-slate-200 to-slate-300"></div>
            <div class="flex flex-1 flex-col justify-center gap-1.5 pl-1">
              <div class="h-[3px] w-8 rounded bg-slate-400"></div>
              <div class="h-2 w-24 rounded bg-slate-800"></div>
              <div class="h-1 w-full rounded bg-slate-300"></div>
              <div class="h-1 w-5/6 rounded bg-slate-300"></div>
              <div class="mt-1 flex gap-1">
                <div class="h-3 w-10 rounded bg-slate-900"></div>
                <div class="h-3 w-10 rounded border border-slate-400 bg-white"></div>
              </div>
            </div>
          </div>
        }

        @case ('gallery') {
          <div class="flex h-full w-full flex-col gap-2 bg-white p-3">
            <div class="h-[3px] w-10 rounded bg-slate-400"></div>
            <div class="h-1.5 w-16 rounded bg-slate-800"></div>
            <div class="mt-1 grid flex-1 grid-cols-6 gap-1">
              <div class="rounded bg-gradient-to-br from-slate-100 to-slate-200"></div>
              <div class="rounded bg-gradient-to-br from-slate-100 to-slate-200"></div>
              <div class="rounded bg-gradient-to-br from-slate-100 to-slate-200"></div>
              <div class="rounded bg-gradient-to-br from-slate-100 to-slate-200"></div>
              <div class="rounded bg-gradient-to-br from-slate-100 to-slate-200"></div>
              <div class="rounded bg-gradient-to-br from-slate-100 to-slate-200"></div>
            </div>
          </div>
        }

        @case ('newsletter') {
          <div class="flex h-full w-full items-center justify-center bg-slate-50 p-4">
            <div class="w-full rounded-md border border-slate-200 bg-white p-3">
              <div class="h-[3px] w-10 rounded bg-slate-400"></div>
              <div class="mt-1 h-2 w-32 rounded bg-slate-800"></div>
              <div class="mt-1 h-1 w-28 rounded bg-slate-300"></div>
              <div class="mt-2 flex gap-1">
                <div class="h-4 flex-1 rounded border border-slate-200 bg-slate-50"></div>
                <div class="h-4 w-12 rounded bg-slate-900"></div>
              </div>
            </div>
          </div>
        }

        @case ('testimonials') {
          <div class="flex h-full w-full flex-col gap-2 bg-slate-50 p-3">
            <div class="h-[3px] w-10 rounded bg-slate-400"></div>
            <div class="h-1.5 w-20 rounded bg-slate-800"></div>
            <div class="mt-1 grid flex-1 grid-cols-3 gap-1.5">
              <div class="rounded-md border border-slate-200 bg-white p-1.5">
                <div class="flex gap-[1px]">
                  <span class="text-[7px] text-amber-500">★</span>
                  <span class="text-[7px] text-amber-500">★</span>
                  <span class="text-[7px] text-amber-500">★</span>
                  <span class="text-[7px] text-amber-500">★</span>
                  <span class="text-[7px] text-amber-500">★</span>
                </div>
                <div class="mt-1 h-1 w-full rounded bg-slate-300"></div>
                <div class="mt-0.5 h-1 w-4/5 rounded bg-slate-300"></div>
              </div>
              <div class="rounded-md border border-slate-200 bg-white p-1.5">
                <div class="flex gap-[1px]">
                  <span class="text-[7px] text-amber-500">★</span>
                  <span class="text-[7px] text-amber-500">★</span>
                  <span class="text-[7px] text-amber-500">★</span>
                  <span class="text-[7px] text-amber-500">★</span>
                  <span class="text-[7px] text-amber-500">★</span>
                </div>
                <div class="mt-1 h-1 w-full rounded bg-slate-300"></div>
                <div class="mt-0.5 h-1 w-4/5 rounded bg-slate-300"></div>
              </div>
              <div class="rounded-md border border-slate-200 bg-white p-1.5">
                <div class="flex gap-[1px]">
                  <span class="text-[7px] text-amber-500">★</span>
                  <span class="text-[7px] text-amber-500">★</span>
                  <span class="text-[7px] text-amber-500">★</span>
                  <span class="text-[7px] text-amber-500">★</span>
                  <span class="text-[7px] text-amber-500">★</span>
                </div>
                <div class="mt-1 h-1 w-full rounded bg-slate-300"></div>
                <div class="mt-0.5 h-1 w-4/5 rounded bg-slate-300"></div>
              </div>
            </div>
          </div>
        }

        @case ('categoryGrid') {
          <div class="flex h-full w-full flex-col gap-2 bg-white p-3">
            <div class="h-1.5 w-16 rounded bg-slate-800"></div>
            <div class="grid flex-1 grid-cols-3 gap-1.5">
              <div class="relative overflow-hidden rounded-md bg-gradient-to-br from-slate-400 to-slate-600">
                <div class="absolute inset-0 bg-black/30"></div>
                <div class="absolute bottom-1 left-1 h-1 w-8 rounded bg-white"></div>
              </div>
              <div class="relative overflow-hidden rounded-md bg-gradient-to-br from-slate-400 to-slate-600">
                <div class="absolute inset-0 bg-black/30"></div>
                <div class="absolute bottom-1 left-1 h-1 w-8 rounded bg-white"></div>
              </div>
              <div class="relative overflow-hidden rounded-md bg-gradient-to-br from-slate-400 to-slate-600">
                <div class="absolute inset-0 bg-black/30"></div>
                <div class="absolute bottom-1 left-1 h-1 w-8 rounded bg-white"></div>
              </div>
            </div>
          </div>
        }

        @case ('cta') {
          <div class="relative h-full w-full bg-gradient-to-br from-slate-700 to-slate-900">
            <div class="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-center">
              <div class="h-2 w-24 rounded bg-white"></div>
              <div class="h-1 w-32 rounded bg-white/60"></div>
              <div class="mt-1 h-3 w-14 rounded bg-white"></div>
            </div>
          </div>
        }

        @case ('logos') {
          <div class="flex h-full w-full flex-col justify-center gap-2 border-y border-slate-200 bg-white px-3">
            <div class="mx-auto h-[3px] w-10 rounded bg-slate-400"></div>
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-1">
                <div class="h-3 w-4 rounded bg-slate-200"></div>
                <div class="h-1 w-8 rounded bg-slate-400"></div>
              </div>
              <div class="flex items-center gap-1">
                <div class="h-3 w-4 rounded bg-slate-200"></div>
                <div class="h-1 w-8 rounded bg-slate-400"></div>
              </div>
              <div class="flex items-center gap-1">
                <div class="h-3 w-4 rounded bg-slate-200"></div>
                <div class="h-1 w-8 rounded bg-slate-400"></div>
              </div>
              <div class="flex items-center gap-1">
                <div class="h-3 w-4 rounded bg-slate-200"></div>
                <div class="h-1 w-8 rounded bg-slate-400"></div>
              </div>
            </div>
          </div>
        }

        @case ('promoCards') {
          <div class="grid h-full w-full grid-cols-3 gap-1.5 bg-white p-3">
            <div class="flex items-start justify-between rounded-lg border border-slate-200 p-1.5">
              <div>
                <div class="h-[3px] w-4 rounded bg-slate-500"></div>
                <div class="mt-1 h-1.5 w-12 rounded bg-slate-800"></div>
                <div class="mt-1 h-1 w-14 rounded bg-slate-300"></div>
              </div>
              <div class="h-3 w-3 rounded-full border border-slate-300"></div>
            </div>
            <div class="flex items-start justify-between rounded-lg border border-slate-200 p-1.5">
              <div>
                <div class="h-[3px] w-4 rounded bg-slate-500"></div>
                <div class="mt-1 h-1.5 w-12 rounded bg-slate-800"></div>
                <div class="mt-1 h-1 w-14 rounded bg-slate-300"></div>
              </div>
              <div class="h-3 w-3 rounded-full border border-slate-300"></div>
            </div>
            <div class="flex items-start justify-between rounded-lg border border-slate-200 p-1.5">
              <div>
                <div class="h-[3px] w-4 rounded bg-slate-500"></div>
                <div class="mt-1 h-1.5 w-12 rounded bg-slate-800"></div>
                <div class="mt-1 h-1 w-14 rounded bg-slate-300"></div>
              </div>
              <div class="h-3 w-3 rounded-full border border-slate-300"></div>
            </div>
          </div>
        }

        @case ('valueProps') {
          <div class="grid h-full w-full grid-cols-4 gap-2 border-y border-slate-200 bg-slate-50 px-3 py-2">
            <div class="flex items-start gap-1">
              <div class="h-4 w-4 shrink-0 rounded-md border border-slate-200 bg-white"></div>
              <div class="min-w-0 flex-1">
                <div class="h-1 w-full rounded bg-slate-700"></div>
                <div class="mt-0.5 h-[3px] w-3/4 rounded bg-slate-300"></div>
                <div class="mt-0.5 h-[3px] w-2/3 rounded bg-slate-300"></div>
              </div>
            </div>
            <div class="flex items-start gap-1">
              <div class="h-4 w-4 shrink-0 rounded-md border border-slate-200 bg-white"></div>
              <div class="min-w-0 flex-1">
                <div class="h-1 w-full rounded bg-slate-700"></div>
                <div class="mt-0.5 h-[3px] w-3/4 rounded bg-slate-300"></div>
                <div class="mt-0.5 h-[3px] w-2/3 rounded bg-slate-300"></div>
              </div>
            </div>
            <div class="flex items-start gap-1">
              <div class="h-4 w-4 shrink-0 rounded-md border border-slate-200 bg-white"></div>
              <div class="min-w-0 flex-1">
                <div class="h-1 w-full rounded bg-slate-700"></div>
                <div class="mt-0.5 h-[3px] w-3/4 rounded bg-slate-300"></div>
                <div class="mt-0.5 h-[3px] w-2/3 rounded bg-slate-300"></div>
              </div>
            </div>
            <div class="flex items-start gap-1">
              <div class="h-4 w-4 shrink-0 rounded-md border border-slate-200 bg-white"></div>
              <div class="min-w-0 flex-1">
                <div class="h-1 w-full rounded bg-slate-700"></div>
                <div class="mt-0.5 h-[3px] w-3/4 rounded bg-slate-300"></div>
                <div class="mt-0.5 h-[3px] w-2/3 rounded bg-slate-300"></div>
              </div>
            </div>
          </div>
        }

        @case ('richText') {
          <div class="flex h-full w-full flex-col items-start justify-center gap-1.5 bg-white px-6">
            <div class="h-2 w-20 rounded bg-slate-800"></div>
            <div class="h-1 w-full rounded bg-slate-300"></div>
            <div class="h-1 w-full rounded bg-slate-300"></div>
            <div class="h-1 w-11/12 rounded bg-slate-300"></div>
            <div class="h-1 w-3/5 rounded bg-slate-300"></div>
          </div>
        }

      }
    </div>
  `
})
export class SectionThumbnailComponent {
  type = input.required<SectionType>();
}
