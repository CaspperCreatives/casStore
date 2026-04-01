import { AfterViewInit, Component, DestroyRef, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ApiClient } from '../../core/api-client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SiteSettingsService } from '../../core/site-settings.service';
import { Activity, ArrowRight, Check, ChevronLeft, ChevronRight, Heart, LucideAngularModule, PackagePlus, Shield, Star } from 'lucide-angular';

type Product = {
  id: string;
  name: string;
  description: string;
  imageUrl?: string | null;
  priceCents: number;
  currency: string;
  stock: number;
};

const PRODUCT_PLACEHOLDER_URL = '/placeholders/product.svg';
const HERO_PLACEHOLDER_URL = '/placeholders/hero.svg';

type CollectionCard = {
  title: string;
  subtitle: string;
  imageUrl?: string | null;
  href: any;
};

type Testimonial = {
  quote: string;
  name: string;
  meta: string;
};

const PLACEHOLDER_PRODUCTS: Array<Product> = [
  {
    id: 'placeholder-1',
    name: 'Nature Bowl',
    description: 'Hand-finished bowl in natural tones.',
    imageUrl: PRODUCT_PLACEHOLDER_URL,
    priceCents: 35000,
    currency: 'USD',
    stock: 10
  },
  {
    id: 'placeholder-2',
    name: 'Matte Vase',
    description: 'Soft matte ceramic with clean lines.',
    imageUrl: PRODUCT_PLACEHOLDER_URL,
    priceCents: 16000,
    currency: 'USD',
    stock: 10
  },
  {
    id: 'placeholder-3',
    name: 'Cake Plate',
    description: 'Minimal plate for everyday serving.',
    imageUrl: PRODUCT_PLACEHOLDER_URL,
    priceCents: 2500,
    currency: 'USD',
    stock: 10
  },
  {
    id: 'placeholder-4',
    name: 'Matte Mug',
    description: 'A balanced mug with smooth handle.',
    imageUrl: PRODUCT_PLACEHOLDER_URL,
    priceCents: 2450,
    currency: 'USD',
    stock: 10
  },
  {
    id: 'placeholder-5',
    name: 'Soft Plate',
    description: 'Neutral palette, gentle curve.',
    imageUrl: PRODUCT_PLACEHOLDER_URL,
    priceCents: 4600,
    currency: 'USD',
    stock: 10
  },
  {
    id: 'placeholder-6',
    name: 'Stone Bowl',
    description: 'Textured finish, durable ceramic.',
    imageUrl: PRODUCT_PLACEHOLDER_URL,
    priceCents: 5200,
    currency: 'USD',
    stock: 10
  },
  {
    id: 'placeholder-7',
    name: 'Serving Board',
    description: 'Solid wood board with handle.',
    imageUrl: PRODUCT_PLACEHOLDER_URL,
    priceCents: 6900,
    currency: 'USD',
    stock: 10
  },
  {
    id: 'placeholder-8',
    name: 'Minimal Vase',
    description: 'Simple silhouette, modern form.',
    imageUrl: PRODUCT_PLACEHOLDER_URL,
    priceCents: 12000,
    currency: 'USD',
    stock: 10
  },
  {
    id: 'placeholder-9',
    name: 'Nordic Cup',
    description: 'Daily cup with a soft lip.',
    imageUrl: PRODUCT_PLACEHOLDER_URL,
    priceCents: 1800,
    currency: 'USD',
    stock: 10
  },
  {
    id: 'placeholder-10',
    name: 'Desk Tray',
    description: 'Catch-all tray for essentials.',
    imageUrl: PRODUCT_PLACEHOLDER_URL,
    priceCents: 3900,
    currency: 'USD',
    stock: 10
  },
  {
    id: 'placeholder-11',
    name: 'Side Plate',
    description: 'Compact plate for small bites.',
    imageUrl: PRODUCT_PLACEHOLDER_URL,
    priceCents: 2200,
    currency: 'USD',
    stock: 10
  },
  {
    id: 'placeholder-12',
    name: 'Tall Mug',
    description: 'Tall profile, comfortable grip.',
    imageUrl: PRODUCT_PLACEHOLDER_URL,
    priceCents: 2900,
    currency: 'USD',
    stock: 10
  }
];

const PLACEHOLDER_TESTIMONIALS: Testimonial[] = [
  {
    quote: 'Beautiful design and excellent build quality. The pieces feel premium without being fragile.',
    name: 'A. Jensen',
    meta: 'Verified customer'
  },
  {
    quote: 'Fast shipping and the packaging was perfect. Everything arrived exactly as pictured.',
    name: 'M. Lopez',
    meta: 'Verified customer'
  },
  {
    quote: 'Minimal, modern, and functional. These are now our everyday favorites at home.',
    name: 'S. Patel',
    meta: 'Verified customer'
  }
];

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  template: `
    <section class="relative w-full overflow-hidden bg-slate-950">
      <div class="relative h-[520px] w-full">
        <img
          #heroBgEl
          class="absolute inset-0 h-full w-full object-cover"
          [src]="heroImageUrl()"
          alt=""
          (error)="onImgError($event, 'hero')"
        />
        <div class="absolute inset-0 bg-black/35"></div>

        <div class="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6">
          <div class="max-w-2xl text-white">
            <div #heroTitleEl class="text-4xl font-semibold leading-[1.05] tracking-[0.18em] md:text-6xl whitespace-pre-line">
              {{ heroTitle() }}
            </div>
            <p #heroSubEl class="mt-5 max-w-md text-sm text-white/80 md:text-base">
              {{ heroSubtitle() }}
            </p>
            <a
              #heroCtaEl
              [routerLink]="heroCtaHref()"
              class="mt-7 inline-flex items-center justify-center bg-black px-10 py-3 text-[11px] font-semibold uppercase tracking-[0.26em] text-white hover:bg-black/90"
            >
              {{ heroCtaLabel() }}
            </a>
          </div>
        </div>

        <button
          type="button"
          class="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/20 p-3 text-white hover:bg-black/35 md:flex"
          aria-label="Previous"
        >
          <lucide-angular [img]="ChevronLeftIcon" class="h-5 w-5" />
        </button>
        <button
          type="button"
          class="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/20 p-3 text-white hover:bg-black/35 md:flex"
          aria-label="Next"
        >
          <lucide-angular [img]="ChevronRightIcon" class="h-5 w-5" />
        </button>
      </div>
    </section>

    <section class="border-b border-slate-200 bg-white">
      <div #awardsRow class="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-10 text-slate-400 sm:grid-cols-3 md:grid-cols-5">
        <div class="flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.22em]">
          <span class="inline-flex h-10 w-10 items-center justify-center rounded border border-slate-200 text-[10px]">GD</span>
          <span class="leading-tight">Good<br />Design</span>
        </div>
        <div class="flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.22em]">
          <span class="inline-flex h-10 w-10 items-center justify-center rounded border border-slate-200 text-[10px]">JDA</span>
          <span class="leading-tight">Japan<br />Design Award</span>
        </div>
        <div class="flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.22em]">
          <span class="inline-flex h-10 w-10 items-center justify-center rounded border border-slate-200 text-[10px]">PDA</span>
          <span class="leading-tight">Product<br />Design</span>
        </div>
        <div class="flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.22em]">
          <span class="inline-flex h-10 w-10 items-center justify-center rounded border border-slate-200 text-[10px]">DDA</span>
          <span class="leading-tight">Dutch<br />Design Award</span>
        </div>
        <div class="hidden items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] sm:flex">
          <span class="inline-flex h-10 w-10 items-center justify-center rounded border border-slate-200 text-[10px]">2018</span>
          <span class="leading-tight">Furniture<br />Design Award</span>
        </div>
      </div>
    </section>

    @if (settings().offers?.enabled !== false) {
      <section class="bg-white">
        <div class="mx-auto max-w-7xl px-6 py-10">
          <div class="grid gap-6 md:grid-cols-3">
            @for (o of (settings().offers?.items ?? []); track o.id) {
              @if (o.enabled !== false) {
                <div class="rounded-2xl border border-slate-200 bg-white p-6">
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-900">{{ o.title }}</div>
                      <div class="mt-2 text-sm leading-6 text-slate-600">{{ o.text }}</div>
                    </div>
                    <div class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700">
                      <lucide-angular [img]="HeartIcon" class="h-5 w-5" />
                    </div>
                  </div>
                </div>
              }
            }
          </div>
        </div>
      </section>
    }

    <section class="bg-slate-50">
      <div class="mx-auto max-w-7xl px-6 py-16">
        <div class="mb-10 flex items-start justify-between gap-6">
          <div>
            <h2 class="text-3xl font-semibold tracking-tight text-slate-900">Trending Now</h2>
            <p class="mt-2 text-sm text-slate-500">Our most coveted pieces this season.</p>
          </div>

          <a
            routerLink="/products"
            class="mt-2 inline-flex items-center justify-center text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-900 hover:text-slate-700"
          >
            View collection
          </a>
        </div>

        <div class="relative">
          <div
            #trendingRail
            class="no-scrollbar flex gap-6 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory"
            aria-label="Trending products"
          >
            @for (p of trendingProducts(); track p.id) {
              <a
                [routerLink]="productLink(p)"
                data-trending-card="1"
                class="group relative h-[420px] w-[320px] shrink-0 snap-start overflow-hidden rounded-[40px] bg-slate-100 shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
              >
                <img
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  [src]="productImageUrl(p)"
                  [alt]="p.name"
                  loading="lazy"
                  (error)="onImgError($event, 'product')"
                />
                <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent"></div>
                <div class="absolute inset-x-0 bottom-0 p-7 text-white">
                  <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">Signature Series</div>
                  <div class="mt-2 text-[15px] font-semibold leading-tight">{{ p.name }}</div>
                  <div class="mt-2 text-[13px] font-semibold text-white/95">{{ formatPrice(p) }}</div>
                </div>
              </a>
            }

            <a
              routerLink="/products"
              class="relative h-[420px] w-[320px] shrink-0 snap-start rounded-[40px] border-2 border-dashed border-slate-200 bg-white"
              aria-label="Explore more products"
            >
              <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div class="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm">
                  <lucide-angular [img]="ArrowRightIcon" class="h-5 w-5" />
                </div>
                <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Explore more</div>
              </div>
            </a>
          </div>

          @if (trendingHasOverflow() && !trendingAtEnd()) {
            <button
              type="button"
              class="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white p-4 text-slate-700 shadow-sm hover:bg-slate-50 md:flex"
              aria-label="Next trending products"
              (click)="scrollTrending(1)"
            >
              <lucide-angular [img]="ChevronRightIcon" class="h-5 w-5" />
            </button>
          }

          @if (trendingHasOverflow() && trendingAtEnd()) {
            <button
              type="button"
              class="absolute left-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white p-4 text-slate-700 shadow-sm hover:bg-slate-50 md:flex"
              aria-label="Previous trending products"
              (click)="scrollTrending(-1)"
            >
              <lucide-angular [img]="ChevronLeftIcon" class="h-5 w-5" />
            </button>
          }
        </div>
      </div>
    </section>

    <section class="bg-white">
      <div #featuredSection class="mx-auto max-w-7xl px-6 py-12">
        <div class="mb-8 flex items-end justify-between gap-6">
          <div>
            <div data-anim="kicker" class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">New arrivals</div>
            <h2 data-anim="title" class="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Featured products</h2>
          </div>
          <a data-anim="link" routerLink="/products" class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600 hover:text-slate-900">
            View all
          </a>
        </div>

        @if (notice()) {
          <div class="mb-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {{ notice() }}
          </div>
        }

        @if (status() === 'loading') {
          <div class="grid grid-cols-2 gap-8 md:grid-cols-4">
            @for (_ of [1,2,3,4,5,6,7,8]; track _) {
              <div class="h-[340px] animate-pulse rounded-lg bg-slate-100"></div>
            }
          </div>
        } @else {
          <div #featuredGrid class="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4">
            @for (p of featuredProducts(); track p.id) {
              <a [routerLink]="productLink(p)" class="group block">
                <div class="aspect-square w-full overflow-hidden bg-slate-50">
                  <img
                    class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    [src]="productImageUrl(p)"
                    [alt]="p.name"
                    loading="lazy"
                    (error)="onImgError($event, 'product')"
                  />
                </div>
                <div class="mt-4 text-center">
                  <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-900">{{ p.name }}</div>
                  <div class="mt-2 text-[11px] text-slate-500">\${{ (p.priceCents / 100).toFixed(2) }}</div>
                </div>
              </a>
            }
          </div>
        }
      </div>
    </section>

    <section class="bg-white">
      <div #collectionsSection class="mx-auto max-w-7xl px-6 pb-14">
        <div #collectionsGrid class="grid gap-8 md:grid-cols-3">
          @for (c of collections(); track c.title) {
            <a [routerLink]="c.href" class="group relative block overflow-hidden bg-slate-50">
              <div class="aspect-[4/3] w-full">
                <img
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  [src]="c.imageUrl || HERO_PLACEHOLDER_URL"
                  alt=""
                  (error)="onImgError($event, 'hero')"
                />
              </div>
              <div class="absolute inset-0 bg-black/25"></div>
              <div class="absolute inset-x-0 bottom-0 p-7 text-white">
                <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">{{ c.subtitle }}</div>
                <div class="mt-2 text-xl font-semibold tracking-tight">{{ c.title }}</div>
                <div class="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em]">
                  Shop
                  <lucide-angular [img]="ArrowRightIcon" class="h-4 w-4" />
                </div>
              </div>
            </a>
          }
        </div>
      </div>
    </section>

    <section class="border-y border-slate-200 bg-white">
      <div #valuePropsSection class="mx-auto max-w-7xl px-6 py-14">
        <div #valueProps class="grid gap-10 md:grid-cols-4">
          <div class="flex items-start gap-4">
            <div class="vp-icon mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded border border-slate-200 text-slate-700">
              <lucide-angular [img]="CheckIcon" class="h-5 w-5" />
            </div>
            <div>
              <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-900">Quality materials</div>
              <div class="mt-2 text-sm leading-6 text-slate-600">Curated finishes and durable surfaces made for daily use.</div>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="vp-icon mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded border border-slate-200 text-slate-700">
              <lucide-angular [img]="ShieldIcon" class="h-5 w-5" />
            </div>
            <div>
              <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-900">Secure checkout</div>
              <div class="mt-2 text-sm leading-6 text-slate-600">Protected payments and privacy-first account handling.</div>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="vp-icon mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded border border-slate-200 text-slate-700">
              <lucide-angular [img]="ActivityIcon" class="h-5 w-5" />
            </div>
            <div>
              <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-900">Fast shipping</div>
              <div class="mt-2 text-sm leading-6 text-slate-600">Reliable delivery with tracking on every order.</div>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="vp-icon mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded border border-slate-200 text-slate-700">
              <lucide-angular [img]="PackagePlusIcon" class="h-5 w-5" />
            </div>
            <div>
              <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-900">Easy returns</div>
              <div class="mt-2 text-sm leading-6 text-slate-600">Simple returns process for peace of mind.</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-white">
      <div #storySection class="mx-auto max-w-7xl px-6 py-16">
        <div #storySplit class="grid items-center gap-10 md:grid-cols-2">
          <div class="overflow-hidden bg-slate-50">
            <img
              #storyImage
              class="h-full w-full object-cover"
              [src]="storyImageUrl()"
              alt=""
              (error)="onImgError($event, 'hero')"
            />
          </div>
          <div class="max-w-xl">
            <div data-anim="kicker" class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Our studio</div>
            <h2 data-anim="title" class="mt-3 text-3xl font-semibold tracking-tight">Designed for calm, crafted for life</h2>
            <p data-anim="lede" class="mt-5 text-sm leading-6 text-slate-600">
              A timeless silhouette starts with restraint: clean geometry, balanced proportions, and materials that age gracefully.
            </p>
            <div data-anim="ctas" class="mt-8 flex flex-wrap gap-3">
              <a
                routerLink="/products"
                class="inline-flex items-center justify-center bg-slate-900 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white hover:bg-slate-800"
              >
                Explore the catalog
        </a>
        <a
                routerLink="/account"
                class="inline-flex items-center justify-center border border-slate-200 bg-white px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-900 hover:bg-slate-50"
              >
                My account
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-slate-50">
      <div #testimonialsSection class="mx-auto max-w-7xl px-6 py-16">
        <div class="mb-10 flex items-end justify-between gap-6">
          <div>
            <div data-anim="kicker" class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Customers</div>
            <h2 data-anim="title" class="mt-2 text-2xl font-semibold tracking-tight text-slate-900">What people say</h2>
          </div>
        </div>

        <div #testimonialsGrid class="grid gap-6 md:grid-cols-3">
          @for (t of testimonials(); track t.name) {
            <div class="rounded-2xl border border-slate-200 bg-white p-7">
              <div class="flex items-center gap-1 text-slate-900">
                @for (_ of [1,2,3,4,5]; track _) {
                  <lucide-angular [img]="StarIcon" class="h-4 w-4 fill-current" />
                }
              </div>
              <p class="mt-5 text-sm leading-6 text-slate-600">“{{ t.quote }}”</p>
              <div class="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-900">{{ t.name }}</div>
              <div class="mt-1 text-xs text-slate-500">{{ t.meta }}</div>
            </div>
          }
        </div>
      </div>
    </section>

    <section class="bg-white">
      <div #newsletterSection class="mx-auto max-w-7xl px-6 py-16">
        <div #newsletterCard class="grid items-center gap-8 rounded-2xl border border-slate-200 bg-white p-8 md:grid-cols-2 md:p-10">
          <div>
            <div data-anim="kicker" class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Newsletter</div>
            <h2 data-anim="title" class="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Get updates and early access</h2>
            <p data-anim="lede" class="mt-4 text-sm leading-6 text-slate-600">
              New arrivals, limited drops, and design notes—sent occasionally.
            </p>
          </div>
          <form data-anim="form" class="flex w-full flex-col gap-3 sm:flex-row" (submit)="$event.preventDefault()">
            <input
              type="email"
              placeholder="Email address"
              class="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none ring-slate-900/10 focus:ring-4"
            />
            <button
              type="submit"
              class="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-white hover:bg-slate-800"
            >
              Subscribe
              <lucide-angular [img]="ArrowRightIcon" class="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </section>

    <section class="bg-white">
      <div #socialSection class="mx-auto max-w-7xl px-6 pb-20">
        <div class="mb-8 flex items-end justify-between gap-6">
          <div>
            <div data-anim="kicker" class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Social</div>
            <h2 data-anim="title" class="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Inspiration grid</h2>
          </div>
        </div>

        <div #socialGrid class="grid grid-cols-2 gap-4 md:grid-cols-6">
          @for (imgUrl of socialImages(); track $index) {
            <div class="aspect-square overflow-hidden bg-slate-50">
              <img class="h-full w-full object-cover" [src]="imgUrl" alt="" (error)="onImgError($event, 'product')" />
            </div>
          }
      </div>
    </div>
    </section>
  `
})
export class HomePage implements AfterViewInit {
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;
  readonly HeartIcon = Heart;
  readonly ArrowRightIcon = ArrowRight;
  readonly CheckIcon = Check;
  readonly ShieldIcon = Shield;
  readonly ActivityIcon = Activity;
  readonly PackagePlusIcon = PackagePlus;
  readonly StarIcon = Star;

  private api = inject(ApiClient);
  private destroyRef = inject(DestroyRef);
  private site = inject(SiteSettingsService);

  firebaseConfigured = computed(() => Boolean(environment.firebase?.apiKey));

  status = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  error = signal<string | null>(null);
  products = signal<Array<Product>>([]); // full catalog (or empty)

  notice = signal<string | null>(null);

  readonly HERO_PLACEHOLDER_URL = HERO_PLACEHOLDER_URL;
  readonly PRODUCT_PLACEHOLDER_URL = PRODUCT_PLACEHOLDER_URL;
  settings = computed(() => this.site.value());

  heroTitle = computed(() => {
    const t = this.settings().hero?.title?.trim();
    return t ? t : 'ORIGINAL\nNORDIC DESIGN';
  });
  heroSubtitle = computed(() => {
    const t = this.settings().hero?.subtitle?.trim();
    return t ? t : 'Discover the latest pieces from our catalog. Crafted for everyday use, designed to last.';
  });
  heroCtaLabel = computed(() => {
    const t = this.settings().hero?.ctaLabel?.trim();
    return t ? t : 'Shop Now';
  });
  heroCtaHref = computed(() => {
    const h = this.settings().hero?.ctaHref?.trim();
    return h && h.startsWith('/') ? h : '/products';
  });

  @ViewChild('heroBgEl', { static: false }) heroBgEl?: ElementRef<HTMLElement>;
  @ViewChild('heroTitleEl', { static: false }) heroTitleEl?: ElementRef<HTMLElement>;
  @ViewChild('heroSubEl', { static: false }) heroSubEl?: ElementRef<HTMLElement>;
  @ViewChild('heroCtaEl', { static: false }) heroCtaEl?: ElementRef<HTMLElement>;
  @ViewChild('awardsRow', { static: false }) awardsRow?: ElementRef<HTMLElement>;
  @ViewChild('featuredSection', { static: false }) featuredSection?: ElementRef<HTMLElement>;
  @ViewChild('featuredGrid', { static: false }) featuredGrid?: ElementRef<HTMLElement>;
  @ViewChild('collectionsSection', { static: false }) collectionsSection?: ElementRef<HTMLElement>;
  @ViewChild('collectionsGrid', { static: false }) collectionsGrid?: ElementRef<HTMLElement>;
  @ViewChild('valuePropsSection', { static: false }) valuePropsSection?: ElementRef<HTMLElement>;
  @ViewChild('valueProps', { static: false }) valueProps?: ElementRef<HTMLElement>;
  @ViewChild('storySection', { static: false }) storySection?: ElementRef<HTMLElement>;
  @ViewChild('storySplit', { static: false }) storySplit?: ElementRef<HTMLElement>;
  @ViewChild('storyImage', { static: false }) storyImage?: ElementRef<HTMLElement>;
  @ViewChild('testimonialsSection', { static: false }) testimonialsSection?: ElementRef<HTMLElement>;
  @ViewChild('testimonialsGrid', { static: false }) testimonialsGrid?: ElementRef<HTMLElement>;
  @ViewChild('newsletterSection', { static: false }) newsletterSection?: ElementRef<HTMLElement>;
  @ViewChild('newsletterCard', { static: false }) newsletterCard?: ElementRef<HTMLElement>;
  @ViewChild('socialSection', { static: false }) socialSection?: ElementRef<HTMLElement>;
  @ViewChild('socialGrid', { static: false }) socialGrid?: ElementRef<HTMLElement>;
  @ViewChild('trendingRail', { static: false }) trendingRail?: ElementRef<HTMLDivElement>;

  displayProducts = computed(() => (this.products().length ? this.products() : PLACEHOLDER_PRODUCTS));
  featuredProducts = computed(() => this.displayProducts().slice(0, 8));
  trendingProducts = computed(() => this.displayProducts().slice(0, 5));

  trendingHasOverflow = signal(false);
  trendingAtEnd = signal(false);

  heroImageUrl = computed(() => {
    const configured = this.site.value().hero?.imageUrl;
    if (this.site.value().hero?.enabled === false) return HERO_PLACEHOLDER_URL;
    if (configured && configured.trim()) return configured.trim();
    const withImage = this.displayProducts().find((p) => Boolean(p.imageUrl));
    return withImage?.imageUrl ? String(withImage.imageUrl) : HERO_PLACEHOLDER_URL;
  });

  storyImageUrl = computed(() => {
    const p = this.displayProducts().find((x) => Boolean(x.imageUrl));
    return p?.imageUrl ? String(p.imageUrl) : HERO_PLACEHOLDER_URL;
  });

  collections = computed<CollectionCard[]>(() => {
    const imgs = this.displayProducts()
      .map((p) => (p.imageUrl ?? '').trim())
      .filter((x) => Boolean(x));
    return [
      {
        title: 'Tableware',
        subtitle: 'Clean lines for everyday',
        imageUrl: imgs[0] ?? HERO_PLACEHOLDER_URL,
        href: '/products'
      },
      {
        title: 'Ceramics',
        subtitle: 'Matte and minimal',
        imageUrl: imgs[1] ?? HERO_PLACEHOLDER_URL,
        href: '/products'
      },
      {
        title: 'Accessories',
        subtitle: 'Small details matter',
        imageUrl: imgs[2] ?? HERO_PLACEHOLDER_URL,
        href: '/products'
      }
    ];
  });

  testimonials = computed(() => PLACEHOLDER_TESTIMONIALS);

  socialImages = computed(() => {
    const imgs = this.displayProducts()
      .map((p) => (p.imageUrl ?? '').trim())
      .filter((x) => Boolean(x));
    const out = [
      imgs[0] ?? PRODUCT_PLACEHOLDER_URL,
      imgs[1] ?? PRODUCT_PLACEHOLDER_URL,
      imgs[2] ?? PRODUCT_PLACEHOLDER_URL,
      imgs[3] ?? PRODUCT_PLACEHOLDER_URL,
      imgs[4] ?? PRODUCT_PLACEHOLDER_URL,
      imgs[5] ?? PRODUCT_PLACEHOLDER_URL
    ];
    return out;
  });

  constructor() {
    this.setupScrollAnimations();
    if (this.firebaseConfigured()) void this.loadCatalog();
    else {
      this.notice.set('Showing placeholder content. Configure Firebase to load your real catalog.');
      this.status.set('success');
      this.products.set([]);
    }
  }

  ngAfterViewInit() {
    this.setupTrendingNav();
  }

  private setupTrendingNav() {
    const el = this.trendingRail?.nativeElement;
    if (!el) return;

    const update = () => this.updateTrendingNavState();
    const onScroll = () => update();
    const onResize = () => update();

    // Initial measurement after first paint so scrollWidth/clientWidth are correct.
    window.requestAnimationFrame(() => update());

    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    this.destroyRef.onDestroy(() => el.removeEventListener('scroll', onScroll));
    this.destroyRef.onDestroy(() => window.removeEventListener('resize', onResize));
  }

  private updateTrendingNavState() {
    const el = this.trendingRail?.nativeElement;
    if (!el) return;

    const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
    const hasOverflow = maxScrollLeft > 2;
    const atEnd = hasOverflow ? el.scrollLeft >= maxScrollLeft - 2 : false;

    this.trendingHasOverflow.set(hasOverflow);
    this.trendingAtEnd.set(atEnd);
  }

  private setupScrollAnimations() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    // Defer to next frame so ViewChild refs exist even on fast navigations.
    const raf = window.requestAnimationFrame(() => {
      const ctx = gsap.context(() => {
        const revealHeading = (root?: HTMLElement) => {
          if (!root) return;
          const kicker = root.querySelector('[data-anim="kicker"]') as HTMLElement | null;
          const title = root.querySelector('[data-anim="title"]') as HTMLElement | null;
          const lede = root.querySelector('[data-anim="lede"]') as HTMLElement | null;
          const link = root.querySelector('[data-anim="link"]') as HTMLElement | null;
          const ctas = root.querySelector('[data-anim="ctas"]') as HTMLElement | null;
          const form = root.querySelector('[data-anim="form"]') as HTMLElement | null;

          const targets = [kicker, title, lede, link, ctas, form].filter(Boolean) as HTMLElement[];
          if (!targets.length) return;

          gsap.from(targets, {
            scrollTrigger: { trigger: root, start: 'top 82%' },
            autoAlpha: 0,
            y: 14,
            duration: 0.75,
            ease: 'power2.out',
            stagger: 0.08
          });
        };

        const heroTitle = this.heroTitleEl?.nativeElement;
        const heroSub = this.heroSubEl?.nativeElement;
        const heroCta = this.heroCtaEl?.nativeElement;
        const heroBg = this.heroBgEl?.nativeElement;

        if (heroTitle && heroSub && heroCta) {
          gsap.set([heroTitle, heroSub, heroCta], { autoAlpha: 0, y: 14 });
          gsap
            .timeline({ defaults: { ease: 'power2.out', duration: 0.8 } })
            .to(heroTitle, { autoAlpha: 1, y: 0 })
            .to(heroSub, { autoAlpha: 1, y: 0 }, '-=0.55')
            .to(heroCta, { autoAlpha: 1, y: 0 }, '-=0.55');
        }

        if (heroBg) {
          gsap.fromTo(
            heroBg,
            { scale: 1.08, y: -10, transformOrigin: '50% 50%' },
            {
              scale: 1,
              y: 18,
              ease: 'none',
              scrollTrigger: {
                trigger: heroBg,
                start: 'top top',
                end: 'bottom top',
                scrub: true
              }
            }
          );
        }

        const awards = this.awardsRow?.nativeElement;
        if (awards) {
          const items = Array.from(awards.children) as HTMLElement[];
          gsap.from(items, {
            scrollTrigger: { trigger: awards, start: 'top 80%' },
            autoAlpha: 0,
            y: 14,
            duration: 0.7,
            ease: 'power2.out',
            stagger: 0.08
          });
        }

        revealHeading(this.featuredSection?.nativeElement);
        revealHeading(this.storySection?.nativeElement);
        revealHeading(this.testimonialsSection?.nativeElement);
        revealHeading(this.newsletterSection?.nativeElement);
        revealHeading(this.socialSection?.nativeElement);

        const revealGrid = (el?: HTMLElement, selector?: string) => {
          if (!el) return;
          const targets = selector ? (Array.from(el.querySelectorAll(selector)) as HTMLElement[]) : [el];
          gsap.from(targets, {
            scrollTrigger: { trigger: el, start: 'top 80%' },
            autoAlpha: 0,
            y: 18,
            duration: 0.75,
            ease: 'power2.out',
            stagger: 0.06
          });
        };

        // Featured products are loaded async; we animate them after load to avoid creating triggers with an empty list.
        const collectionsGrid = this.collectionsGrid?.nativeElement;
        if (collectionsGrid) {
          const cards = Array.from(collectionsGrid.querySelectorAll('a')) as HTMLElement[];
          gsap.from(cards, {
            scrollTrigger: { trigger: collectionsGrid, start: 'top 82%' },
            autoAlpha: 0,
            y: 18,
            duration: 0.85,
            ease: 'power2.out',
            stagger: 0.08
          });

          for (const card of cards) {
            const img = card.querySelector('img') as HTMLElement | null;
            if (!img) continue;
            gsap.fromTo(
              img,
              { scale: 1.06, y: -8, transformOrigin: '50% 50%' },
              {
                scale: 1,
                y: 8,
                ease: 'none',
                scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true }
              }
            );
          }
        }

        const valueProps = this.valueProps?.nativeElement;
        if (valueProps) {
          const items = Array.from(valueProps.querySelectorAll('.flex.items-start')) as HTMLElement[];
          gsap.from(items, {
            scrollTrigger: { trigger: valueProps, start: 'top 84%' },
            autoAlpha: 0,
            y: 18,
            duration: 0.75,
            ease: 'power2.out',
            stagger: 0.08
          });

          const icons = Array.from(valueProps.querySelectorAll('.vp-icon')) as HTMLElement[];
          gsap.from(icons, {
            scrollTrigger: { trigger: valueProps, start: 'top 84%' },
            scale: 0.88,
            rotate: -6,
            autoAlpha: 0,
            duration: 0.75,
            ease: 'power2.out',
            stagger: 0.08
          });
        }

        const testimonialsGrid = this.testimonialsGrid?.nativeElement;
        if (testimonialsGrid) {
          const cards = Array.from(testimonialsGrid.children) as HTMLElement[];
          gsap.from(cards, {
            scrollTrigger: { trigger: testimonialsGrid, start: 'top 84%' },
            autoAlpha: 0,
            y: 18,
            duration: 0.8,
            ease: 'power2.out',
            stagger: 0.08
          });
          gsap.from(cards, {
            scrollTrigger: { trigger: testimonialsGrid, start: 'top 84%' },
            rotate: -0.6,
            duration: 0.8,
            ease: 'power2.out',
            stagger: 0.08
          });
        }

        const newsletterCard = this.newsletterCard?.nativeElement;
        if (newsletterCard) {
          gsap.from(newsletterCard, {
            scrollTrigger: { trigger: newsletterCard, start: 'top 86%' },
            autoAlpha: 0,
            y: 18,
            duration: 0.85,
            ease: 'power2.out'
          });
          const inputs = Array.from(newsletterCard.querySelectorAll('input,button')) as HTMLElement[];
          gsap.from(inputs, {
            scrollTrigger: { trigger: newsletterCard, start: 'top 86%' },
            autoAlpha: 0,
            y: 10,
            duration: 0.75,
            ease: 'power2.out',
            stagger: 0.08,
            delay: 0.05
          });
        }

        const socialGrid = this.socialGrid?.nativeElement;
        if (socialGrid) {
          const cells = Array.from(socialGrid.children) as HTMLElement[];
          gsap.from(cells, {
            scrollTrigger: { trigger: socialGrid, start: 'top 88%' },
            autoAlpha: 0,
            y: 14,
            rotate: -1.2,
            scale: 0.98,
            duration: 0.75,
            ease: 'power2.out',
            stagger: 0.05
          });
        }

        const storyWrap = this.storySplit?.nativeElement;
        const storyImg = this.storyImage?.nativeElement;
        if (storyWrap && storyImg) {
          gsap.fromTo(
            storyImg,
            { scale: 1.06, y: -10 },
            {
              scale: 1,
              y: 10,
              ease: 'none',
              scrollTrigger: {
                trigger: storyWrap,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
              }
            }
          );
        }
      });

      this.destroyRef.onDestroy(() => ctx.revert());
    });

    this.destroyRef.onDestroy(() => window.cancelAnimationFrame(raf));
  }

  private async loadCatalog() {
    this.status.set('loading');
    this.error.set(null);
    try {
      const json = await this.api.get<{ ok: true; products: Array<any> }>('products');
      const items: Product[] = (json.products ?? [])
        .map((data: any) => {
          return {
            id: String(data.id ?? ''),
            name: String(data.name ?? ''),
            description: String(data.description ?? ''),
            imageUrl: (data.imageUrl ?? null) as string | null,
            priceCents: Number(data.priceCents ?? 0),
            currency: String(data.currency ?? 'USD'),
            stock: Number(data.stock ?? 0)
          };
        })
        .filter((p) => Boolean(p.id) && Boolean(p.name));

      this.products.set(items);
      if (items.length === 0) {
        this.notice.set('No products found. Showing placeholder content until you add catalog data.');
      } else {
        this.notice.set(null);
      }
      this.status.set('success');
      this.animateFeaturedGrid();
    } catch (e: any) {
      // Fall back to placeholders on any API error (CORS, auth, missing config, etc.)
      this.error.set(e?.message ?? String(e));
      this.notice.set('Could not load catalog data. Showing placeholder content.');
      this.products.set([]);
      this.status.set('success');
      this.animateFeaturedGrid();
    }
  }

  private animateFeaturedGrid() {
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    // Defer so the @for loop has time to render anchors.
    window.requestAnimationFrame(() => {
      const grid = this.featuredGrid?.nativeElement;
      if (!grid) return;
      const anchors = Array.from(grid.querySelectorAll('a')) as HTMLElement[];
      if (!anchors.length) return;

      const toAnimate = anchors.filter((el) => el.dataset['animated'] !== '1');
      if (!toAnimate.length) return;

      // Only do the "list-in" animation if the grid is near viewport; otherwise ScrollTrigger will handle.
      const r = grid.getBoundingClientRect();
      const nearViewport = r.top < window.innerHeight * 0.92;

      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.refresh();

      gsap.set(toAnimate, { autoAlpha: 0, y: 18 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: grid,
          start: 'top 85%',
          once: true
        }
      });
      tl.to(toAnimate, { autoAlpha: 1, y: 0, duration: 0.75, ease: 'power2.out', stagger: 0.06 }, 0);

      // If already visible, kick the timeline immediately for that satisfying "load-in" effect.
      if (nearViewport) tl.play(0);

      for (const el of toAnimate) el.dataset['animated'] = '1';
    });
  }

  productImageUrl(p: Product) {
    const url = (p.imageUrl ?? '').trim();
    return url ? url : PRODUCT_PLACEHOLDER_URL;
  }

  productLink(p: Product) {
    return String(p.id).startsWith('placeholder-') ? '/products' : ['/products', p.id];
  }

  formatPrice(p: Product) {
    const currency = (p.currency || 'USD').toUpperCase();
    const amount = Number(p.priceCents ?? 0) / 100;
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
    } catch {
      return `$${Math.round(amount).toLocaleString()}`;
    }
  }

  scrollTrending(direction: -1 | 1) {
    const el = this.trendingRail?.nativeElement;
    if (!el) return;

    const firstCard = el.querySelector('[data-trending-card="1"]') as HTMLElement | null;
    const cardWidth = firstCard?.getBoundingClientRect().width ?? 320;
    const gap = 24; // matches gap-6
    const step = cardWidth + gap;
    el.scrollBy({ left: step * direction, behavior: 'smooth' });
  }

  onImgError(e: Event, kind: 'product' | 'hero') {
    const img = e.target as HTMLImageElement | null;
    if (!img) return;
    const fallback = kind === 'hero' ? HERO_PLACEHOLDER_URL : PRODUCT_PLACEHOLDER_URL;
    if (img.src.endsWith(fallback)) return;
    img.src = fallback;
  }
}


