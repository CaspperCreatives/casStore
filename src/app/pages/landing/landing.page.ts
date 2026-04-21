import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  ViewChild,
  computed,
  inject,
  signal
} from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  ChevronDown,
  LucideAngularModule,
  Search,
  User
} from 'lucide-angular';
import { AuthService } from '../../core/auth.service';
import { StoreService } from '../../core/store.service';
import { DEMO_STORES, DemoStore } from '../demos/demo-stores';

type NavItem = { id: string; label: string };

type Faq = { q: string; a: string };

const NAV_ITEMS: NavItem[] = [
  { id: 'demos', label: 'Demos' },
  { id: 'how', label: 'How it works' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'faq', label: 'FAQ' }
];

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [DecimalPipe, NgClass, RouterLink, LucideAngularModule],
  template: `
    <div class="min-h-dvh bg-stone-200/60 font-sans text-slate-900 antialiased">
      <!-- ═════════════════════════════════════════════════════════════════ -->
      <!-- HERO — framed, minimal, LUCY-style                                 -->
      <!-- ═════════════════════════════════════════════════════════════════ -->
      <section id="top" class="px-3 pb-6 pt-3 md:px-6 md:pb-10 md:pt-6">
        <div
          class="relative mx-auto w-full overflow-hidden rounded-[28px] md:rounded-[36px]"
        >
          <!-- Top bar inside the frame -->
          <header
            class="sticky top-3 z-30 flex items-center justify-between gap-4 px-5 py-5 md:px-10 md:py-7"
          >
            <a
              href="#top"
              (click)="scrollTo($event, 'top')"
              class="group flex items-center gap-2"
              aria-label="CasStore — home"
            >
              <img
                src="/images/logo.png"
                alt="CasStore"
                width="140"
                height="115"
                class="h-[50px] w-auto md:h-10"
                draggable="false"
              />
            </a>

            <nav class="hidden items-center gap-8 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 md:flex">
              @for (n of navItems; track n.id) {
                <a
                  [href]="'#' + n.id"
                  (click)="scrollTo($event, n.id)"
                  class="transition-colors hover:text-slate-900"
                  [ngClass]="activeSection() === n.id ? 'text-slate-900' : ''"
                >
                  {{ n.label }}
                </a>
              }
            </nav>

            <div class="flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              @if (isSignedIn()) {
                <a
                  [routerLink]="hasStore() ? '/my-store' : '/create-store'"
                  class="hidden transition-colors hover:text-slate-900 sm:inline"
                >
                  {{ hasStore() ? 'My store' : 'Create store' }}
                </a>
              } @else {
                <a routerLink="/sign-in" class="hidden transition-colors hover:text-slate-900 sm:inline">Log in</a>
              }
              <span class="hidden text-slate-400 sm:inline">·</span>
              <button type="button" aria-label="Search" class="text-slate-500 hover:text-slate-900">
                <lucide-angular [img]="SearchIcon" class="h-4 w-4" />
              </button>
              <a
                [routerLink]="isSignedIn() ? (hasStore() ? '/my-store' : '/create-store') : '/sign-up'"
                class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white ring-1 ring-slate-200 transition hover:ring-slate-400"
                aria-label="Account"
              >
                <lucide-angular [img]="UserIcon" class="h-4 w-4 text-slate-700" />
              </a>
            </div>
          </header>

          <!-- Hero body -->
          <div #heroBody class="relative grid gap-10 px-5 pb-16 pt-4 md:grid-cols-12 md:gap-6 md:px-10 md:pb-20 md:pt-10">
            <!-- Vertical kicker on the left -->
            <div class="pointer-events-none hidden md:col-span-1 md:block">
              <div
                class="select-none text-[10px] font-semibold uppercase tracking-[0.32em] text-slate-500"
                style="writing-mode: vertical-rl; transform: rotate(180deg);"
              >
                Storefront builder
              </div>
            </div>

            <!-- Headline -->
            <div class="md:col-span-7 md:pt-16">
              <h1
                class="font-display text-[18vw] font-medium leading-[0.88] tracking-[-0.05em] text-slate-900 md:text-[11.5rem] xl:text-[14rem]"
              >
                Your store.
              </h1>

              <p class="mt-5 max-w-xl text-base leading-7 text-slate-600 md:mt-7 md:text-lg md:leading-8">
                Launch a fully-featured online store in about
                <span class="font-semibold text-slate-900 text-[24px]">60 seconds</span> —
                no credit card, no trial, no pay wall. Just build.
              </p>

              <!-- Primary CTA stack -->
              <div class="mt-7 flex flex-col items-start gap-4 md:mt-9">
                <div class="flex flex-wrap items-center gap-3">
                  <a
                    [routerLink]="isSignedIn() ? (hasStore() ? '/my-store' : '/create-store') : '/sign-up'"
                    class="group inline-flex items-center gap-3 rounded-full bg-slate-900 py-4 pl-6 pr-3 text-sm font-semibold text-white shadow-[0_12px_40px_-12px_rgba(15,23,42,0.5)] transition hover:bg-slate-800 md:text-[15px]"
                  >
                    <span class="tracking-tight">
                      {{ isSignedIn() ? (hasStore() ? 'Go to my store' : 'Create your store') : 'Create your store' }}
                    </span>
                    <span class="h-4 w-px bg-white/20"></span>
                    <span class="text-[18px] font-semibold uppercase tracking-[0.22em] text-emerald-300 font-bold text-white">
                     Free
                    </span>
                    <span
                      class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 transition-transform group-hover:translate-x-0.5"
                    >
                      <lucide-angular [img]="ArrowRightIcon" class="h-4 w-4" />
                    </span>
                  </a>

                  @if (!isSignedIn()) {
                    <a
                      routerLink="/demos"
                      class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-3.5 text-[13px] font-semibold text-slate-800 transition hover:border-slate-900 hover:text-slate-900"
                    >
                      See live demos
                    </a>
                  }
                </div>

                <!-- Trust strip -->
                <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                  <span class="inline-flex items-center gap-1.5">
                    <lucide-angular [img]="CheckIcon" class="h-3.5 w-3.5 text-emerald-500" />
                    No credit card
                  </span>
                  <span class="text-slate-300">·</span>
                  <span class="inline-flex items-center gap-1.5">
                    <lucide-angular [img]="CheckIcon" class="h-3.5 w-3.5 text-emerald-500" />
                    Free forever
                  </span>
                  <span class="text-slate-300">·</span>
                  <span class="inline-flex items-center gap-1.5">
                    <lucide-angular [img]="CheckIcon" class="h-3.5 w-3.5 text-emerald-500" />
                    Cancel anytime
                  </span>
                </div>
              </div>
            </div>

            <!-- Visual mockup -->
            <div class="relative md:col-span-4">
              <div
                aria-hidden="true"
                class="pointer-events-none absolute -left-6 top-6 hidden h-[110%] w-px bg-slate-200 md:block"
              ></div>

              <div class="relative mx-auto flex aspect-[3/4] w-full max-w-[340px] items-end justify-center">
                <!-- Ground shadow plate -->
                <div
                  aria-hidden="true"
                  class="absolute bottom-6 left-1/2 h-3 w-[75%] -translate-x-1/2 rounded-full bg-slate-300/40 blur-md"
                ></div>
                <!-- Time badge -->
                <div
                  class="absolute right-4 top-1/3 z-10 flex h-16 w-16 flex-col items-center justify-center rounded-full bg-emerald-500 font-semibold tracking-wide text-white shadow-lg"
                >
                  <span class="font-display text-xl leading-none">60s</span>
                  <span class="mt-0.5 text-[8px] uppercase tracking-[0.18em] text-white/80">free</span>
                </div>

                <!-- Stylised product silhouettes -->
                <svg viewBox="0 0 240 300" class="h-full w-full" aria-hidden="true">
                  <defs>
                    <linearGradient id="wood" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stop-color="#c8a98a" />
                      <stop offset="100%" stop-color="#8a6a4c" />
                    </linearGradient>
                    <linearGradient id="ink" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stop-color="#1f2937" />
                      <stop offset="100%" stop-color="#0b1220" />
                    </linearGradient>
                  </defs>

                  <!-- wood bottle -->
                  <path
                    d="M90 80 Q90 50 100 50 L100 45 L110 45 L110 50 Q120 50 120 80 L122 230 Q122 260 105 260 Q88 260 90 230 Z"
                    fill="url(#wood)"
                  />
                  <!-- black bottle -->
                  <path
                    d="M140 65 Q140 40 150 40 L150 35 L160 35 L160 40 Q170 40 170 65 L172 230 Q172 260 155 260 Q138 260 140 230 Z"
                    fill="url(#ink)"
                  />
                  <!-- tray -->
                  <rect x="55" y="256" width="140" height="14" rx="3" fill="#e7e5e4" />
                  <rect x="55" y="256" width="140" height="4" rx="2" fill="#d6d3d1" />
                  <!-- bowl -->
                  <path
                    d="M60 230 Q85 252 110 230 L108 240 Q85 260 62 240 Z"
                    fill="#f5f5f4"
                    stroke="#d6d3d1"
                    stroke-width="1"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Hero footer row: dots, CTA, page number -->
          <div class="grid items-end gap-6 border-t border-slate-200/70 px-5 py-6 md:grid-cols-3 md:px-10 md:py-8">
            <div>
              <div class="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                Built by
              </div>
              <div class="mt-1 text-sm font-semibold tracking-wide text-slate-900">
                You · in minutes
              </div>
            </div>

            <div class="flex items-center justify-center gap-2">
              @for (i of [0,1,2,3,4]; track i) {
                <span
                  class="h-1.5 w-1.5 rounded-full transition-colors"
                  [ngClass]="i === 2 ? 'bg-slate-900' : 'bg-slate-300'"
                ></span>
              }
            </div>

            <div class="flex items-center justify-between gap-6">
              <a
                [routerLink]="isSignedIn() ? (hasStore() ? '/my-store' : '/create-store') : '/sign-up'"
                class="group inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-900"
              >
                <span
                  class="inline-block h-px w-8 bg-rose-400 transition-[width] duration-300 group-hover:w-12"
                ></span>
                {{ isSignedIn() ? (hasStore() ? 'My store' : 'Create store') : 'Create store' }}
                <lucide-angular
                  [img]="ArrowRightIcon"
                  class="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                />
              </a>
              <div class="font-display text-5xl font-medium leading-none text-slate-200 md:text-6xl">
                03
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═════════════════════════════════════════════════════════════════ -->
      <!-- INTRO MANIFESTO                                                    -->
      <!-- ═════════════════════════════════════════════════════════════════ -->
      <section class="mx-auto max-w-3xl px-6 py-24 text-center md:py-32">
        <div class="text-[10px] font-semibold uppercase tracking-[0.32em] text-slate-500">
          A quiet commerce platform
        </div>
        <p
          class="mt-6 text-balance font-serif text-3xl leading-[1.25] text-slate-900 md:text-5xl md:leading-[1.15]"
        >
          Everything a modern storefront needs.
          <span class="text-slate-400">Nothing it doesn't.</span>
        </p>
        <p class="mx-auto mt-6 max-w-xl text-[15px] leading-7 text-slate-600">
          CasStore gives you a library of beautifully composed sections. Mix
          them, reorder them, fill them with your products — and you have a
          storefront that feels considered from the first pixel to the last.
        </p>
      </section>

      <!-- ═════════════════════════════════════════════════════════════════ -->
      <!-- STORE COUNTER — live count of stores created on CasStore          -->
      <!-- ═════════════════════════════════════════════════════════════════ -->
      <section id="stats" class="px-3 pb-6 md:px-6">
        <div
          #statsCard
          class="relative mx-auto overflow-hidden rounded-[28px] bg-slate-950 px-6 py-16 text-white md:rounded-[36px] md:px-14 md:py-24"
        >
          <div
            aria-hidden="true"
            class="pointer-events-none absolute inset-0"
            style="background:
              radial-gradient(ellipse at 15% 20%, rgba(16,185,129,0.22), transparent 55%),
              radial-gradient(ellipse at 85% 90%, rgba(99,102,241,0.18), transparent 60%);"
          ></div>

          <div class="relative grid items-end gap-10 md:grid-cols-12">
            <div class="md:col-span-5">
              <div class="text-[10px] font-semibold uppercase tracking-[0.32em] text-emerald-400">
                Live on CasStore
              </div>
              <h2
                class="font-display mt-5 text-4xl font-medium leading-[1.02] tracking-[-0.035em] md:text-6xl"
              >
                Stores built
                <br />
                <span class="font-serif italic text-white/60">and counting.</span>
              </h2>
              <p class="mt-5 max-w-sm text-[15px] leading-7 text-white/70">
                Every number below is a real shop someone opened on CasStore —
                in about a minute, with no credit card. Yours could be next.
              </p>
            </div>

            <div class="md:col-span-7">
              <div class="grid gap-4 sm:grid-cols-2">
                <!-- Active stores -->
                <div
                  class="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition hover:border-white/20 md:p-9"
                >
                  <div class="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-400">
                    <span class="relative flex h-2 w-2">
                      <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                      <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
                    </span>
                    Live stores
                  </div>
                  <div class="mt-5 flex items-baseline gap-2">
                    <span
                      class="font-display text-[14vw] font-medium leading-none tracking-[-0.04em] md:text-[7rem]"
                      [attr.aria-label]="storeCountLoading() ? 'Loading store count' : displayActive() + ' active stores'"
                    >
                      @if (storeCountLoading()) {
                        <span class="inline-block h-[0.9em] w-[2.4ch] animate-pulse rounded-md bg-white/10 align-middle"></span>
                      } @else {
                        {{ displayActive() | number }}
                      }
                    </span>
                    @if (!storeCountLoading() && activeStoreCount() > 0) {
                      <span class="text-sm font-semibold uppercase tracking-[0.24em] text-white/50">
                        online
                      </span>
                    }
                  </div>
                  <p class="mt-4 text-[13px] leading-6 text-white/60">
                    Active storefronts currently published and ready to take orders.
                  </p>
                </div>

                <!-- Lifetime total -->
                <div
                  class="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition hover:border-white/20 md:p-9"
                >
                  <div class="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/50">
                    Created all-time
                  </div>
                  <div class="mt-5 flex items-baseline gap-2">
                    <span
                      class="font-display text-[14vw] font-medium leading-none tracking-[-0.04em] md:text-[7rem]"
                      [attr.aria-label]="storeCountLoading() ? 'Loading lifetime count' : displayTotal() + ' stores created'"
                    >
                      @if (storeCountLoading()) {
                        <span class="inline-block h-[0.9em] w-[2.4ch] animate-pulse rounded-md bg-white/10 align-middle"></span>
                      } @else {
                        {{ displayTotal() | number }}
                      }
                    </span>
                  </div>
                  <p class="mt-4 text-[13px] leading-6 text-white/60">
                    Total stores ever opened on CasStore. Join the roster in about 60 seconds.
                  </p>
                </div>
              </div>

              <div class="mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-6">
                <div class="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/50">
                  Updated in real time
                </div>
                <a
                  [routerLink]="isSignedIn() ? (hasStore() ? '/my-store' : '/create-store') : '/sign-up'"
                  class="group inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white"
                >
                  <span class="inline-block h-px w-8 bg-emerald-400 transition-[width] duration-300 group-hover:w-12"></span>
                  Open yours
                  <lucide-angular
                    [img]="ArrowRightIcon"
                    class="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═════════════════════════════════════════════════════════════════ -->
      <!-- DEMOS — live sample stores built from real sections               -->
      <!-- ═════════════════════════════════════════════════════════════════ -->
      <section id="demos" #showcaseSection class="bg-stone-50">
        <div class="mx-auto max-w-[1440px] px-4 py-20 md:px-10 md:py-28">
          <div class="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
            <div class="max-w-xl">
              <div class="text-[10px] font-semibold uppercase tracking-[0.32em] text-emerald-600">
                01 — Live demos
              </div>
              <h2
                class="font-display mt-4 text-4xl font-medium leading-[1.05] tracking-[-0.03em] text-slate-900 md:text-6xl"
              >
                Stores we built
                <br />
                <span class="font-serif italic text-slate-500">so you don't have to.</span>
              </h2>
            </div>
            <p class="max-w-sm text-sm leading-6 text-slate-600">
              Four sample storefronts, each assembled from the same sections
              you get in the editor. Click any to open a full, scrollable
              demo — banner, hero, products, everything.
            </p>
          </div>

          <div class="grid grid-cols-1 gap-5 md:grid-cols-12">
            @for (d of demos; track d.id; let i = $index) {
              <a
                [routerLink]="['/demos', d.id]"
                class="group block overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200 transition hover:ring-slate-900/40"
                [ngClass]="i === 0 || i === 3 ? 'md:col-span-7' : 'md:col-span-5'"
              >
                <div
                  class="relative aspect-[16/10] overflow-hidden"
                  [style.background]="d.previewBg"
                >
                  <div
                    aria-hidden="true"
                    class="pointer-events-none absolute inset-0"
                    style="background:
                      radial-gradient(ellipse at 20% 15%, rgba(255,255,255,0.4), transparent 55%),
                      radial-gradient(ellipse at 85% 85%, rgba(0,0,0,0.2), transparent 60%);"
                  ></div>
                  <div
                    class="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-[14vw] font-medium leading-none text-white/95 md:text-[8rem]"
                    style="letter-spacing:-0.05em;"
                  >
                    {{ demoInitial(d.store.name) }}
                  </div>
                  <div class="absolute left-4 top-4 flex items-center gap-2">
                    <span class="rounded-full bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-900">
                      {{ demoPresetLabel(d.presetId) }}
                    </span>
                    <span class="rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white">
                      {{ demoSectionCount(d) }} sections
                    </span>
                  </div>
                  <div class="pointer-events-none absolute bottom-4 right-4 font-display text-xl font-medium text-white/90">
                    {{ demoIndex(i) }}
                  </div>
                </div>

                <div class="flex items-start justify-between gap-4 px-6 py-5">
                  <div class="min-w-0">
                    <div class="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                      {{ d.store.category }}
                    </div>
                    <div class="mt-1 font-display text-2xl font-medium tracking-[-0.01em] text-slate-900">
                      {{ d.store.name }}
                    </div>
                    <p class="mt-2 max-w-md text-sm leading-6 text-slate-600">{{ d.tagline }}</p>
                  </div>
                  <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition group-hover:border-slate-900 group-hover:text-slate-900">
                    <lucide-angular
                      [img]="ArrowUpRightIcon"
                      class="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </a>
            }
          </div>

          <div class="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              routerLink="/demos"
              class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-800 hover:border-slate-900 hover:text-slate-900"
            >
              View all demos
              <lucide-angular [img]="ArrowRightIcon" class="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      <!-- ═════════════════════════════════════════════════════════════════ -->
      <!-- HOW IT WORKS                                                       -->
      <!-- ═════════════════════════════════════════════════════════════════ -->
      <section id="how" class="bg-stone-200/60">
        <div class="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
          <div class="mb-12 md:mb-16">
            <div class="text-[10px] font-semibold uppercase tracking-[0.32em] text-emerald-600">
              02 — How it works
            </div>
            <h2 class="font-display mt-4 max-w-3xl text-4xl font-medium leading-[1.05] tracking-[-0.03em] text-slate-900 md:text-6xl">
              Three steps.
              <span class="font-serif italic text-slate-500">That's the whole thing.</span>
            </h2>
          </div>

          <ol class="grid gap-5 md:grid-cols-3">
            @for (s of steps; track s.n; let idx = $index) {
              <li class="relative rounded-3xl bg-stone-50 p-8 md:p-10">
                <div class="font-display text-6xl font-medium leading-none text-slate-200">
                  {{ s.n }}
                </div>
                <div class="mt-8 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Step {{ idx + 1 }}
                </div>
                <h3 class="mt-2 font-display text-2xl font-medium tracking-[-0.01em] text-slate-900">
                  {{ s.title }}
                </h3>
                <p class="mt-3 text-sm leading-6 text-slate-600">{{ s.body }}</p>
              </li>
            }
          </ol>
        </div>
      </section>

      <!-- ═════════════════════════════════════════════════════════════════ -->
      <!-- PRICING                                                            -->
      <!-- ═════════════════════════════════════════════════════════════════ -->
      <section id="pricing" class="bg-stone-50">
        <div class="mx-auto max-w-[1200px] px-6 py-20 md:px-10 md:py-28">
          <div class="mb-12 text-center">
            <div class="text-[10px] font-semibold uppercase tracking-[0.32em] text-emerald-600">
              03 — Pricing
            </div>
            <h2 class="font-display mt-4 text-4xl font-medium leading-[1.05] tracking-[-0.03em] text-slate-900 md:text-6xl">
              Free forever.
              <br />
              <span class="font-serif italic text-slate-500">Upgrade when you need to.</span>
            </h2>
          </div>

          <div class="grid gap-5 md:grid-cols-2">
            <!-- Free -->
            <div class="rounded-3xl bg-white p-8 md:p-10">
              <div class="text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-600">Free</div>
              <div class="mt-4 flex items-baseline gap-2">
                <span class="font-display text-6xl font-medium tracking-[-0.03em] text-slate-900">$0</span>
                <span class="text-sm text-slate-500">/ forever</span>
              </div>
              <p class="mt-3 text-sm text-slate-600">Everything you need to open and run your store.</p>
              <ul class="mt-7 space-y-2.5 text-[14px] text-slate-700">
                @for (b of freeBenefits; track b) {
                  <li class="flex items-start gap-2.5">
                    <lucide-angular [img]="CheckIcon" class="mt-0.5 h-4 w-4 text-emerald-500" />
                    {{ b }}
                  </li>
                }
              </ul>
              <a
                [routerLink]="isSignedIn() ? (hasStore() ? '/my-store' : '/create-store') : '/sign-up'"
                class="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-slate-800"
              >
                Start free
                <lucide-angular [img]="ArrowRightIcon" class="h-3.5 w-3.5" />
              </a>
            </div>

            <!-- Pro -->
            <div class="relative overflow-hidden rounded-3xl bg-slate-950 p-8 text-white md:p-10">
              <div
                aria-hidden="true"
                class="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-emerald-500/25 blur-3xl"
              ></div>
              <div class="relative flex items-center justify-between">
                <div class="text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-400">Pro</div>
                <span class="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-white/80">
                  Soon
                </span>
              </div>
              <div class="relative mt-4 flex items-baseline gap-2">
                <span class="font-display text-6xl font-medium tracking-[-0.03em]">2.99 JOD</span>
                <span class="text-sm text-white/60">/ month</span>
              </div>
              <p class="relative mt-3 text-sm text-white/70">For stores scaling beyond the basics.</p>
              <ul class="relative mt-7 space-y-2.5 text-[14px] text-white/90">
                @for (b of proBenefits; track b) {
                  <li class="flex items-start gap-2.5">
                    <lucide-angular [img]="CheckIcon" class="mt-0.5 h-4 w-4 text-emerald-400" />
                    {{ b }}
                  </li>
                }
              </ul>
              <button
                type="button"
                disabled
                class="relative mt-8 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.22em] text-white/80"
              >
                Notify me
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ═════════════════════════════════════════════════════════════════ -->
      <!-- FAQ                                                                -->
      <!-- ═════════════════════════════════════════════════════════════════ -->
      <section id="faq" class="bg-stone-200/60">
        <div class="mx-auto max-w-3xl px-6 py-20 md:py-28">
          <div class="mb-12 text-center">
            <div class="text-[10px] font-semibold uppercase tracking-[0.32em] text-emerald-600">
              04 — FAQ
            </div>
            <h2 class="font-display mt-4 text-4xl font-medium leading-[1.05] tracking-[-0.03em] text-slate-900 md:text-5xl">
              Short and <span class="font-serif italic text-slate-500">honest.</span>
            </h2>
          </div>

          <div class="divide-y divide-slate-300/60 rounded-3xl bg-stone-50">
            @for (item of faqs; track item.q; let i = $index) {
              <div class="px-6 py-1">
                <button
                  type="button"
                  class="flex w-full items-center justify-between gap-4 py-5 text-left"
                  (click)="toggleFaq(i)"
                  [attr.aria-expanded]="openFaqIndex() === i"
                >
                  <span class="font-display text-lg font-medium tracking-tight text-slate-900 md:text-xl">
                    {{ item.q }}
                  </span>
                  <lucide-angular
                    [img]="ChevronDownIcon"
                    class="h-4 w-4 shrink-0 text-slate-500 transition-transform duration-300"
                    [ngClass]="openFaqIndex() === i ? 'rotate-180' : ''"
                  />
                </button>
                <div
                  class="grid transition-[grid-template-rows] duration-300 ease-out"
                  [ngClass]="openFaqIndex() === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
                >
                  <div class="overflow-hidden">
                    <p class="pb-5 text-[15px] leading-7 text-slate-600">{{ item.a }}</p>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- ═════════════════════════════════════════════════════════════════ -->
      <!-- FINAL CTA                                                          -->
      <!-- ═════════════════════════════════════════════════════════════════ -->
      <section class="px-3 pb-10 pt-6 md:px-6 md:pb-16">
        <div
          class="relative mx-auto max-w-[1440px] overflow-hidden rounded-[28px] bg-slate-950 px-6 py-24 text-center text-white md:rounded-[36px] md:py-36"
        >
          <div
            aria-hidden="true"
            class="pointer-events-none absolute inset-0"
            style="background: radial-gradient(ellipse at top, rgba(16,185,129,0.22), transparent 60%), radial-gradient(ellipse at bottom, rgba(99,102,241,0.18), transparent 60%);"
          ></div>
          <div class="relative mx-auto max-w-3xl">
            <div class="text-[10px] font-semibold uppercase tracking-[0.32em] text-emerald-400">
              Your store — 60 seconds away
            </div>
            <h2 class="font-display mt-6 text-balance text-5xl font-medium leading-[1.02] tracking-[-0.035em] md:text-7xl">
              Open the shop.
              <br />
              <span class="font-serif italic text-white/60">Start selling.</span>
            </h2>
            <div class="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                [routerLink]="isSignedIn() ? (hasStore() ? '/my-store' : '/create-store') : '/sign-up'"
                class="group inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.24em] text-slate-900 transition hover:bg-slate-100"
              >
                <span class="inline-block h-px w-8 bg-emerald-500"></span>
                Create store
                <lucide-angular [img]="ArrowRightIcon" class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </a>
              @if (!isSignedIn()) {
                <a
                  routerLink="/sign-in"
                  class="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.24em] text-white/90 hover:bg-white/5"
                >
                  I have an account
                </a>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- ═════════════════════════════════════════════════════════════════ -->
      <!-- FOOTER                                                             -->
      <!-- ═════════════════════════════════════════════════════════════════ -->
      <footer class="px-3 pb-8 md:px-6">
        <div class="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 px-4 py-8 md:flex-row md:px-8">
          <a
            href="#top"
            (click)="scrollTo($event, 'top')"
            class="flex items-center gap-2"
            aria-label="CasStore — home"
          >
            <img
              src="/images/logo.png"
              alt="CasStore"
              width="140"
              height="115"
              class="h-8 w-auto opacity-80 transition hover:opacity-100"
              draggable="false"
            />
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          </a>
          <div class="flex items-center gap-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            @for (n of navItems; track n.id) {
              <a [href]="'#' + n.id" (click)="scrollTo($event, n.id)" class="hover:text-slate-900">
                {{ n.label }}
              </a>
            }
          </div>
          <div class="text-[11px] text-slate-500">© {{ year() }} CasStore</div>
        </div>
      </footer>
    </div>
  `
})
export class LandingPage implements AfterViewInit {
  readonly ArrowRightIcon = ArrowRight;
  readonly ArrowUpRightIcon = ArrowUpRight;
  readonly CheckIcon = BadgeCheck;
  readonly ChevronDownIcon = ChevronDown;
  readonly SearchIcon = Search;
  readonly UserIcon = User;

  private destroyRef = inject(DestroyRef);
  private auth = inject(AuthService);
  private stores = inject(StoreService);

  readonly navItems = NAV_ITEMS;
  readonly demos = DEMO_STORES;

  readonly steps = [
    { n: '01', title: 'Sign up in seconds', body: 'Email or Google — no credit card, no setup wizard.' },
    { n: '02', title: 'Compose your pages', body: 'Drop sections in, fill them with your products. It\'s all connected.' },
    { n: '03', title: 'Share the link', body: 'Your store is live. Text it, post it, print it — and start selling.' }
  ];

  readonly freeBenefits = [
    'Unlimited products',
    'Every section — hero, gallery, CTA, and more',
    'Orders, cart, and checkout',
    'Hosted storefront at www.casstore.store/store/your-name',
    'Built-in analytics'
  ];

  readonly proBenefits = [
    'Everything in Free',
    'Custom domain (yourbrand.com)',
    'Lower payment processing fees',
    'Priority support',
    'Team accounts'
  ];

  readonly faqs: Faq[] = [
    {
      q: 'Is it really free?',
      a: 'Yes. The Free plan is free forever — no trial, no surprise expiration. Pay only if you choose to upgrade for a custom domain or other Pro features later.'
    },
    {
      q: 'Do I need to know how to code?',
      a: 'No. Everything is visual. If you can write a text message, you can run a CasStore.'
    },
    {
      q: 'How long does it really take to launch?',
      a: 'Most people are live in about a minute. The hard part is deciding on your first product — not using the app.'
    },
    {
      q: 'Can I use my own domain?',
      a: 'Your store is hosted at www.casstore.store/store/your-name out of the box. Custom domains arrive with our Pro plan — you can change the URL any time.'
    },
    {
      q: 'What happens to my data?',
      a: 'Your products, orders, and customers stay yours. Export, move, or delete at any time — no lock-in.'
    }
  ];

  @ViewChild('heroBody', { static: false }) heroBody?: ElementRef<HTMLElement>;
  @ViewChild('showcaseSection', { static: false }) showcaseSection?: ElementRef<HTMLElement>;
  @ViewChild('statsCard', { static: false }) statsCard?: ElementRef<HTMLElement>;

  isSignedIn = computed(() => Boolean(this.auth.user()));
  hasStore = computed(() => this.stores.hasStore());
  year = computed(() => new Date().getFullYear());

  scrolled = signal(false);
  activeSection = signal<string>('');
  openFaqIndex = signal<number | null>(0);

  /** Live store counts fetched from the public `storesCount` endpoint. */
  activeStoreCount = signal(0);
  totalStoreCount = signal(0);
  storeCountLoading = signal(true);

  /** Displayed values are animated up from 0 on scroll into view. */
  displayActive = signal(0);
  displayTotal = signal(0);

  constructor() {
    void this.stores.loadMyStore().catch(() => {});
    void this.loadStoreCounts();
  }

  private async loadStoreCounts() {
    const { active, total } = await this.stores.loadStoresCount();
    this.activeStoreCount.set(active);
    this.totalStoreCount.set(total);
    this.storeCountLoading.set(false);
    this.animateStoreCounters();
  }

  ngAfterViewInit() {
    this.setupIntroAnimations();
    this.setupScrollSpy();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.scrolled.set(window.scrollY > 8);
  }

  scrollTo(event: Event, id: string) {
    event.preventDefault();
    if (typeof document === 'undefined') return;
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      history.replaceState(null, '', '#top');
      return;
    }
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 40;
    window.scrollTo({ top, behavior: 'smooth' });
    history.replaceState(null, '', `#${id}`);
  }

  toggleFaq(index: number) {
    this.openFaqIndex.update((current) => (current === index ? null : index));
  }

  demoInitial(name: string): string {
    return (name || '?').trim().charAt(0).toUpperCase();
  }

  demoIndex(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  demoSectionCount(d: DemoStore): number {
    return d.sections.filter((s) => s.visible !== false).length;
  }

  demoPresetLabel(id: DemoStore['presetId']): string {
    switch (id) {
      case 'brand': return 'Brand story';
      case 'retail': return 'Retail';
      case 'launch': return 'Product launch';
      case 'minimal': return 'Minimal';
      case 'full': return 'Everything';
    }
  }

  private prefersReducedMotion(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Count-up animation for the landing-page store counters.
   *
   * Uses GSAP's ScrollTrigger so the numbers tick up only when the stats card
   * scrolls into view. Falls back to instantly setting the final value when
   * the card is not yet in the DOM, the user prefers reduced motion, or GSAP
   * is unavailable. Runs on every counter load so the first load and any
   * background refresh both animate correctly.
   */
  private animateStoreCounters() {
    const active = this.activeStoreCount();
    const total = this.totalStoreCount();

    if (typeof window === 'undefined') {
      this.displayActive.set(active);
      this.displayTotal.set(total);
      return;
    }

    if (this.prefersReducedMotion()) {
      this.displayActive.set(active);
      this.displayTotal.set(total);
      return;
    }

    const card = this.statsCard?.nativeElement;
    if (!card) {
      this.displayActive.set(active);
      this.displayTotal.set(total);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const duration = Math.min(2, 0.8 + Math.max(active, total) / 400);
    const activeProxy = { v: 0 };
    const totalProxy = { v: 0 };

    gsap.to(activeProxy, {
      v: active,
      duration,
      ease: 'power2.out',
      scrollTrigger: { trigger: card, start: 'top 80%', once: true },
      onUpdate: () => this.displayActive.set(Math.round(activeProxy.v)),
      onComplete: () => this.displayActive.set(active)
    });

    gsap.to(totalProxy, {
      v: total,
      duration,
      ease: 'power2.out',
      scrollTrigger: { trigger: card, start: 'top 80%', once: true },
      onUpdate: () => this.displayTotal.set(Math.round(totalProxy.v)),
      onComplete: () => this.displayTotal.set(total)
    });
  }

  private setupIntroAnimations() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (this.prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);

    const raf = window.requestAnimationFrame(() => {
      const ctx = gsap.context(() => {
        const hero = this.heroBody?.nativeElement;
        if (hero) {
          const h1 = hero.querySelector('h1');
          if (h1) {
            gsap.from(h1, {
              autoAlpha: 0,
              y: 24,
              duration: 0.9,
              ease: 'power3.out'
            });
          }
          const rest = Array.from(
            hero.querySelectorAll<HTMLElement>(':scope > div > div, :scope > div > span, svg')
          );
          if (rest.length) {
            gsap.from(rest, {
              autoAlpha: 0,
              y: 16,
              duration: 0.7,
              ease: 'power2.out',
              stagger: 0.08,
              delay: 0.15
            });
          }
        }

        const articles = document.querySelectorAll<HTMLElement>('#demos a');
        articles.forEach((el) => {
          gsap.from(el, {
            scrollTrigger: { trigger: el, start: 'top 85%' },
            autoAlpha: 0,
            y: 22,
            duration: 0.7,
            ease: 'power2.out'
          });
        });

        const reveals = document.querySelectorAll<HTMLElement>(
          '#how li, #pricing > div > div > div, #faq > div > div'
        );
        reveals.forEach((el) => {
          gsap.from(el, {
            scrollTrigger: { trigger: el, start: 'top 85%' },
            autoAlpha: 0,
            y: 20,
            duration: 0.7,
            ease: 'power2.out'
          });
        });
      });

      this.destroyRef.onDestroy(() => ctx.revert());
    });

    this.destroyRef.onDestroy(() => window.cancelAnimationFrame(raf));
  }

  private setupScrollSpy() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (!('IntersectionObserver' in window)) return;

    const ids = this.navItems.map((n) => n.id);
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) this.activeSection.set(visible[0].target.id);
        else if (window.scrollY < 80) this.activeSection.set('');
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    for (const s of sections) observer.observe(s);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}
