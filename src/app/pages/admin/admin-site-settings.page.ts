import { Component, computed, inject, signal } from '@angular/core';
import { SiteSettingsService, SiteSettings } from '../../core/site-settings.service';

type OfferItem = { id: string; enabled: boolean; title: string; text: string };
type BannerLink = { label: string; href: string; enabled: boolean };
type FooterLink = { label: string; href: string };

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}`;
}

@Component({
  selector: 'app-admin-site-settings-page',
  standalone: true,
  template: `
    <div class="space-y-6">
      <div class="flex items-end justify-between gap-6">
        <div>
          <div class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Admin</div>
          <h1 class="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Site settings</h1>
          <p class="mt-2 text-sm text-slate-600">Controls landing hero, banner, offers, contact info, and footer.</p>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            (click)="reload()"
            [disabled]="status() === 'loading'"
          >
            Reload
          </button>
          <button
            type="button"
            class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            (click)="save()"
            [disabled]="status() === 'loading'"
          >
            Save
          </button>
        </div>
      </div>

      @if (status() === 'error') {
        <div class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {{ error() }}
        </div>
      }
      @if (status() === 'idle' && savedAt()) {
        <div class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Saved {{ savedAt() }}
        </div>
      }

      <!-- Banner -->
      <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-start justify-between gap-6">
          <div>
            <div class="text-sm font-semibold text-slate-900">Top banner</div>
            <div class="mt-1 text-xs text-slate-500">Shown above the main header navigation.</div>
          </div>
          <label class="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" class="h-4 w-4" [checked]="bannerEnabled()" (change)="bannerEnabled.set(($any($event.target).checked))" />
            Enabled
          </label>
        </div>

        <div class="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <div class="text-xs font-semibold text-slate-600">Left text</div>
            <input
              class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300"
              [value]="bannerLeftText()"
              (input)="bannerLeftText.set(($any($event.target).value))"
              placeholder="Free Shipping on orders over $200*"
            />
          </div>
        </div>

        <div class="mt-6">
          <div class="flex items-center justify-between gap-4">
            <div class="text-xs font-semibold text-slate-600">Right links</div>
            <button type="button" class="text-xs font-semibold text-slate-700 hover:text-slate-900" (click)="addBannerLink()">Add link</button>
          </div>
          <div class="mt-3 space-y-3">
            @for (l of bannerLinks(); track l.label + l.href) {
              <div class="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-12 md:items-center">
                <div class="md:col-span-4">
                  <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Label</div>
                  <input class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" [value]="l.label" (input)="updateBannerLink(l, { label: $any($event.target).value })" />
                </div>
                <div class="md:col-span-6">
                  <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Href</div>
                  <input class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" [value]="l.href" (input)="updateBannerLink(l, { href: $any($event.target).value })" />
                </div>
                <div class="md:col-span-2 flex items-center justify-between gap-3">
                  <label class="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <input type="checkbox" class="h-4 w-4" [checked]="l.enabled" (change)="updateBannerLink(l, { enabled: $any($event.target).checked })" />
                    On
                  </label>
                  <button type="button" class="text-sm font-semibold text-slate-600 hover:text-slate-900" (click)="removeBannerLink(l)">Remove</button>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Hero -->
      <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-start justify-between gap-6">
          <div>
            <div class="text-sm font-semibold text-slate-900">Landing hero</div>
            <div class="mt-1 text-xs text-slate-500">Controls hero image and text on the landing page.</div>
          </div>
          <label class="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" class="h-4 w-4" [checked]="heroEnabled()" (change)="heroEnabled.set(($any($event.target).checked))" />
            Enabled
          </label>
        </div>

        <div class="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <div class="text-xs font-semibold text-slate-600">Hero image URL</div>
            <input
              class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300"
              [value]="heroImageUrl()"
              (input)="heroImageUrl.set(($any($event.target).value))"
              placeholder="https://..."
            />
            <div class="mt-2 text-xs text-slate-500">Leave empty to fall back to the first product image or placeholder.</div>
          </div>
          <div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <img [src]="heroImagePreview()" alt="" class="h-40 w-full object-cover" (error)="onPreviewError($event)" />
          </div>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <div class="text-xs font-semibold text-slate-600">Title</div>
            <textarea
              rows="3"
              class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300"
              [value]="heroTitle()"
              (input)="heroTitle.set(($any($event.target).value))"
              placeholder="ORIGINAL&#10;NORDIC DESIGN"
            ></textarea>
          </div>
          <div>
            <div class="text-xs font-semibold text-slate-600">Subtitle</div>
            <textarea
              rows="3"
              class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300"
              [value]="heroSubtitle()"
              (input)="heroSubtitle.set(($any($event.target).value))"
            ></textarea>
          </div>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <div class="text-xs font-semibold text-slate-600">CTA label</div>
            <input class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" [value]="heroCtaLabel()" (input)="heroCtaLabel.set(($any($event.target).value))" />
          </div>
          <div>
            <div class="text-xs font-semibold text-slate-600">CTA href</div>
            <input class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" [value]="heroCtaHref()" (input)="heroCtaHref.set(($any($event.target).value))" placeholder="/products" />
          </div>
        </div>
      </section>

      <!-- Offers -->
      <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-start justify-between gap-6">
          <div>
            <div class="text-sm font-semibold text-slate-900">Offers strip</div>
            <div class="mt-1 text-xs text-slate-500">Shown on the landing page under the awards row.</div>
          </div>
          <label class="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" class="h-4 w-4" [checked]="offersEnabled()" (change)="offersEnabled.set(($any($event.target).checked))" />
            Enabled
          </label>
        </div>

        <div class="mt-6 flex items-center justify-between gap-4">
          <div class="text-xs font-semibold text-slate-600">Items</div>
          <button type="button" class="text-xs font-semibold text-slate-700 hover:text-slate-900" (click)="addOffer()">Add offer</button>
        </div>
        <div class="mt-3 space-y-3">
          @for (o of offers(); track o.id) {
            <div class="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-12 md:items-center">
              <div class="md:col-span-3">
                <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Title</div>
                <input class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" [value]="o.title" (input)="updateOffer(o, { title: $any($event.target).value })" />
              </div>
              <div class="md:col-span-7">
                <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Text</div>
                <input class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" [value]="o.text" (input)="updateOffer(o, { text: $any($event.target).value })" />
              </div>
              <div class="md:col-span-2 flex items-center justify-between gap-3">
                <label class="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input type="checkbox" class="h-4 w-4" [checked]="o.enabled" (change)="updateOffer(o, { enabled: $any($event.target).checked })" />
                  On
                </label>
                <button type="button" class="text-sm font-semibold text-slate-600 hover:text-slate-900" (click)="removeOffer(o)">Remove</button>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Contact + Footer -->
      <div class="grid gap-6 lg:grid-cols-2">
        <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="text-sm font-semibold text-slate-900">Contact</div>
          <div class="mt-1 text-xs text-slate-500">Shown in the footer.</div>
          <div class="mt-5 grid gap-4">
            <div>
              <div class="text-xs font-semibold text-slate-600">Email</div>
              <input class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" [value]="contactEmail()" (input)="contactEmail.set(($any($event.target).value))" />
            </div>
            <div>
              <div class="text-xs font-semibold text-slate-600">Phone</div>
              <input class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" [value]="contactPhone()" (input)="contactPhone.set(($any($event.target).value))" />
            </div>
            <div>
              <div class="text-xs font-semibold text-slate-600">Address</div>
              <textarea rows="2" class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" [value]="contactAddress()" (input)="contactAddress.set(($any($event.target).value))"></textarea>
            </div>
          </div>
        </section>

        <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-start justify-between gap-6">
            <div>
              <div class="text-sm font-semibold text-slate-900">Footer</div>
              <div class="mt-1 text-xs text-slate-500">Brand, tagline, and links.</div>
            </div>
            <label class="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input type="checkbox" class="h-4 w-4" [checked]="footerEnabled()" (change)="footerEnabled.set(($any($event.target).checked))" />
              Enabled
            </label>
          </div>

          <div class="mt-5 grid gap-4">
            <div>
              <div class="text-xs font-semibold text-slate-600">Brand</div>
              <input class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" [value]="footerBrand()" (input)="footerBrand.set(($any($event.target).value))" />
            </div>
            <div>
              <div class="text-xs font-semibold text-slate-600">Tagline</div>
              <input class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" [value]="footerTagline()" (input)="footerTagline.set(($any($event.target).value))" />
            </div>
          </div>

          <div class="mt-6">
            <div class="flex items-center justify-between gap-4">
              <div class="text-xs font-semibold text-slate-600">Links</div>
              <button type="button" class="text-xs font-semibold text-slate-700 hover:text-slate-900" (click)="addFooterLink()">Add link</button>
            </div>
            <div class="mt-3 space-y-3">
              @for (l of footerLinks(); track l.label + l.href) {
                <div class="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-12 md:items-center">
                  <div class="md:col-span-5">
                    <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Label</div>
                    <input class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" [value]="l.label" (input)="updateFooterLink(l, { label: $any($event.target).value })" />
                  </div>
                  <div class="md:col-span-5">
                    <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Href</div>
                    <input class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" [value]="l.href" (input)="updateFooterLink(l, { href: $any($event.target).value })" />
                  </div>
                  <div class="md:col-span-2 flex justify-end">
                    <button type="button" class="text-sm font-semibold text-slate-600 hover:text-slate-900" (click)="removeFooterLink(l)">Remove</button>
                  </div>
                </div>
              }
            </div>
          </div>
        </section>
      </div>
    </div>
  `
})
export class AdminSiteSettingsPage {
  private site = inject(SiteSettingsService);

  status = computed(() => this.site.status());
  error = computed(() => this.site.error());
  savedAt = signal<string | null>(null);

  // Banner
  bannerEnabled = signal(true);
  bannerLeftText = signal('');
  bannerLinks = signal<BannerLink[]>([]);

  // Hero
  heroEnabled = signal(true);
  heroImageUrl = signal('');
  heroTitle = signal('');
  heroSubtitle = signal('');
  heroCtaLabel = signal('');
  heroCtaHref = signal('');
  heroImagePreview = computed(() => this.heroImageUrl().trim() || '/placeholders/hero.svg');

  // Offers
  offersEnabled = signal(true);
  offers = signal<OfferItem[]>([]);

  // Contact
  contactEmail = signal('');
  contactPhone = signal('');
  contactAddress = signal('');

  // Footer
  footerEnabled = signal(true);
  footerBrand = signal('');
  footerTagline = signal('');
  footerLinks = signal<FooterLink[]>([]);

  constructor() {
    void this.reload();
  }

  async reload() {
    this.savedAt.set(null);
    await this.site.adminLoad();
    this.hydrate(this.site.value());
  }

  private hydrate(s: SiteSettings) {
    const banner = s.banner;
    this.bannerEnabled.set(banner?.enabled !== false);
    this.bannerLeftText.set(banner?.leftText ?? '');
    this.bannerLinks.set((banner?.rightLinks ?? []).map((x) => ({ label: x.label, href: x.href, enabled: x.enabled !== false })));

    const hero = s.hero;
    this.heroEnabled.set(hero?.enabled !== false);
    this.heroImageUrl.set(hero?.imageUrl ?? '');
    this.heroTitle.set(hero?.title ?? '');
    this.heroSubtitle.set(hero?.subtitle ?? '');
    this.heroCtaLabel.set(hero?.ctaLabel ?? '');
    this.heroCtaHref.set(hero?.ctaHref ?? '');

    const offers = s.offers;
    this.offersEnabled.set(offers?.enabled !== false);
    this.offers.set((offers?.items ?? []).map((x) => ({ id: x.id, enabled: x.enabled !== false, title: x.title, text: x.text })));

    const c = s.contact ?? {};
    this.contactEmail.set(String(c.email ?? ''));
    this.contactPhone.set(String(c.phone ?? ''));
    this.contactAddress.set(String(c.address ?? ''));

    const f = s.footer;
    this.footerEnabled.set(f?.enabled !== false);
    this.footerBrand.set(f?.brand ?? '');
    this.footerTagline.set(f?.tagline ?? '');
    this.footerLinks.set((f?.links ?? []).map((x) => ({ label: x.label, href: x.href })));
  }

  async save() {
    const patch: Partial<SiteSettings> = {
      banner: {
        enabled: this.bannerEnabled(),
        leftText: this.bannerLeftText(),
        rightLinks: this.bannerLinks().map((x) => ({ label: x.label, href: x.href, enabled: x.enabled }))
      },
      hero: {
        enabled: this.heroEnabled(),
        imageUrl: this.heroImageUrl().trim() || null,
        title: this.heroTitle(),
        subtitle: this.heroSubtitle(),
        ctaLabel: this.heroCtaLabel(),
        ctaHref: this.heroCtaHref()
      },
      offers: {
        enabled: this.offersEnabled(),
        items: this.offers().map((x) => ({ id: x.id, enabled: x.enabled, title: x.title, text: x.text }))
      },
      contact: {
        email: this.contactEmail().trim() || null,
        phone: this.contactPhone().trim() || null,
        address: this.contactAddress().trim() || null
      },
      footer: {
        enabled: this.footerEnabled(),
        brand: this.footerBrand(),
        tagline: this.footerTagline(),
        links: this.footerLinks().map((x) => ({ label: x.label, href: x.href }))
      }
    };

    await this.site.adminUpdate(patch);
    this.savedAt.set(new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date()));
  }

  addOffer() {
    this.offers.set([{ id: uid('offer'), enabled: true, title: 'Offer', text: 'Details' }, ...this.offers()]);
  }
  updateOffer(o: OfferItem, patch: Partial<OfferItem>) {
    this.offers.set(this.offers().map((x) => (x.id === o.id ? { ...x, ...patch } : x)));
  }
  removeOffer(o: OfferItem) {
    this.offers.set(this.offers().filter((x) => x.id !== o.id));
  }

  addBannerLink() {
    this.bannerLinks.set([{ label: 'Link', href: '#', enabled: true }, ...this.bannerLinks()]);
  }
  updateBannerLink(l: BannerLink, patch: Partial<BannerLink>) {
    this.bannerLinks.set(this.bannerLinks().map((x) => (x === l ? { ...x, ...patch } : x)));
  }
  removeBannerLink(l: BannerLink) {
    this.bannerLinks.set(this.bannerLinks().filter((x) => x !== l));
  }

  addFooterLink() {
    this.footerLinks.set([{ label: 'Link', href: '/' }, ...this.footerLinks()]);
  }
  updateFooterLink(l: FooterLink, patch: Partial<FooterLink>) {
    this.footerLinks.set(this.footerLinks().map((x) => (x === l ? { ...x, ...patch } : x)));
  }
  removeFooterLink(l: FooterLink) {
    this.footerLinks.set(this.footerLinks().filter((x) => x !== l));
  }

  onPreviewError(e: Event) {
    const img = e.target as HTMLImageElement | null;
    if (!img) return;
    if (img.src.endsWith('/placeholders/hero.svg')) return;
    img.src = '/placeholders/hero.svg';
  }
}



