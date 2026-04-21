import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowLeft, ArrowRight, ArrowUpRight, LucideAngularModule } from 'lucide-angular';
import { DEMO_STORES, DemoStore } from './demo-stores';

/**
 * Gallery of every demo store. Each card links to /demos/:id where the demo
 * is rendered using the real section components from the store dashboard.
 */
@Component({
  selector: 'app-demos-index-page',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  template: `
    <div class="min-h-dvh bg-stone-200/60 px-3 py-6 md:px-6 md:py-10">
      <div class="mx-auto w-full max-w-[1440px] overflow-hidden rounded-[28px] bg-stone-50 md:rounded-[36px]">
        <!-- Top bar -->
        <header class="flex items-center justify-between gap-4 px-5 py-5 md:px-10 md:py-7">
          <a
            routerLink="/"
            class="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 hover:text-slate-900"
            aria-label="Back to CasStore home"
          >
            <lucide-angular [img]="ArrowLeftIcon" class="h-3.5 w-3.5" />
            <img src="/images/logo.png" alt="CasStore" width="140" height="115" class="h-7 w-auto" draggable="false" />
          </a>
          <div class="flex items-center gap-1 text-[13px] font-semibold tracking-[0.24em] text-slate-900">
            <span class="font-display">DEMOS</span>
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          </div>
          <a
            routerLink="/sign-up"
            class="hidden rounded-full bg-slate-900 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white hover:bg-slate-800 sm:inline-flex sm:items-center sm:gap-1.5"
          >
            Create yours
            <lucide-angular [img]="ArrowRightIcon" class="h-3 w-3" />
          </a>
        </header>

        <!-- Hero -->
        <section class="px-5 py-12 md:px-10 md:py-20">
          <div class="max-w-3xl">
            <div class="text-[10px] font-semibold uppercase tracking-[0.32em] text-emerald-600">
              Showcase
            </div>
            <h1
              class="font-display mt-6 text-5xl font-medium leading-[1.02] tracking-[-0.035em] text-slate-900 md:text-7xl"
            >
              Sample stores,
              <br />
              <span class="font-serif italic text-slate-500">built from the same sections.</span>
            </h1>
            <p class="mt-8 max-w-xl text-[15px] leading-7 text-slate-600">
              Every demo below is a real CasStore storefront, assembled from
              the same drag-and-drop sections you get in the page editor. Click
              in, scroll around, then build your own.
            </p>
          </div>
        </section>

        <!-- Grid of demos -->
        <section class="px-5 pb-12 md:px-10 md:pb-20">
          <div class="grid gap-6 md:grid-cols-2">
            @for (d of demos; track d.id; let i = $index) {
              <a
                [routerLink]="['/demos', d.id]"
                class="group block overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/80 transition hover:ring-slate-900/40"
              >
                <!-- Preview tile -->
                <div
                  class="relative aspect-[16/10] overflow-hidden"
                  [style.background]="d.previewBg"
                >
                  <div
                    aria-hidden="true"
                    class="pointer-events-none absolute inset-0"
                    style="background:
                      radial-gradient(ellipse at 20% 20%, rgba(255,255,255,0.35), transparent 55%),
                      radial-gradient(ellipse at 80% 80%, rgba(0,0,0,0.18), transparent 60%);"
                  ></div>
                  <!-- Big initial mark -->
                  <div
                    class="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-[14vw] font-medium leading-none text-white/95 md:text-[9rem]"
                    style="letter-spacing:-0.05em;"
                  >
                    {{ initial(d.store.name) }}
                  </div>
                  <!-- Preset tag -->
                  <div class="absolute left-4 top-4 flex items-center gap-2">
                    <span
                      class="rounded-full bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-900"
                    >
                      {{ presetLabel(d.presetId) }}
                    </span>
                    <span
                      class="rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white"
                    >
                      {{ sectionCount(d) }} sections
                    </span>
                  </div>
                  <!-- Preview index -->
                  <div
                    class="pointer-events-none absolute bottom-4 right-4 font-display text-2xl font-medium text-white/90"
                  >
                    {{ index(i) }}
                  </div>
                </div>

                <!-- Meta -->
                <div class="flex items-start justify-between gap-4 px-6 py-5">
                  <div>
                    <div class="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                      {{ d.store.category }}
                    </div>
                    <div class="mt-1 font-display text-2xl font-medium tracking-[-0.01em] text-slate-900">
                      {{ d.store.name }}
                    </div>
                    <p class="mt-2 max-w-md text-sm leading-6 text-slate-600">{{ d.tagline }}</p>
                  </div>
                  <span
                    class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition group-hover:border-slate-900 group-hover:text-slate-900"
                  >
                    <lucide-angular
                      [img]="ArrowUpRightIcon"
                      class="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                </div>

                <!-- Section chips -->
                <div class="flex flex-wrap gap-1.5 border-t border-slate-100 px-6 py-4">
                  @for (s of uniqueSectionLabels(d); track s) {
                    <span
                      class="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-600"
                    >
                      {{ s }}
                    </span>
                  }
                </div>
              </a>
            }
          </div>
        </section>

        <!-- Footer CTA -->
        <section class="border-t border-slate-200/70 px-5 py-14 md:px-10">
          <div class="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
            <div>
              <div class="text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-600">
                Ready?
              </div>
              <h3
                class="font-display mt-3 text-3xl font-medium tracking-[-0.02em] text-slate-900 md:text-4xl"
              >
                Build yours in <span class="font-serif italic text-slate-500">60 seconds.</span>
              </h3>
            </div>
            <div class="flex items-center gap-3">
              <a
                routerLink="/sign-up"
                class="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white hover:bg-slate-800"
              >
                Create store
                <lucide-angular [img]="ArrowRightIcon" class="h-3.5 w-3.5" />
              </a>
              <a
                routerLink="/"
                class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-700 hover:border-slate-900 hover:text-slate-900"
              >
                Back to home
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  `
})
export class DemosIndexPage {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly ArrowRightIcon = ArrowRight;
  readonly ArrowUpRightIcon = ArrowUpRight;

  readonly demos = DEMO_STORES;

  initial(name: string) {
    return (name || '?').trim().charAt(0).toUpperCase();
  }

  index(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  sectionCount(d: DemoStore): number {
    return d.sections.filter((s) => s.visible !== false).length;
  }

  uniqueSectionLabels(d: DemoStore): string[] {
    const meta: Record<string, string> = {
      hero: 'Hero',
      heroSlider: 'Slider',
      banner: 'Banner',
      featuredProducts: 'Products',
      imageText: 'Image + Text',
      gallery: 'Gallery',
      newsletter: 'Newsletter',
      testimonials: 'Testimonials',
      categoryGrid: 'Categories',
      cta: 'CTA',
      logos: 'Logos',
      promoCards: 'Promo',
      valueProps: 'Value props',
      richText: 'Rich text'
    };
    const seen = new Set<string>();
    for (const s of d.sections) {
      if (s.visible === false) continue;
      seen.add(meta[s.type] ?? s.type);
    }
    return Array.from(seen);
  }

  presetLabel(id: DemoStore['presetId']): string {
    switch (id) {
      case 'brand': return 'Brand story';
      case 'retail': return 'Retail';
      case 'launch': return 'Product launch';
      case 'minimal': return 'Minimal';
      case 'full': return 'Everything';
    }
  }
}
