import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Trash2 } from 'lucide-angular';
import {
  BannerConfig,
  CategoryGridConfig,
  CategoryGridItem,
  CtaConfig,
  FeaturedProductsConfig,
  GalleryConfig,
  GalleryImage,
  HeroConfig,
  HeroSlide,
  HeroSliderConfig,
  ImageTextConfig,
  LogoItem,
  LogosConfig,
  NewsletterConfig,
  PromoCard,
  PromoCardsConfig,
  RichTextConfig,
  StoreSection,
  Testimonial,
  TestimonialsConfig,
  ValueProp,
  ValuePropsConfig
} from '../../../core/store.service';
import { ImageUrlInputComponent } from '../../../shared/image-url-input.component';

const INPUT_CLS =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white';
const LABEL_CLS =
  'mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-slate-600';

// ──────────────────────────────────────────────────────────────────────────
// Hero
// ──────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-hero-editor',
  standalone: true,
  imports: [FormsModule, ImageUrlInputComponent],
  template: `
    <div class="space-y-4">
      <div>
        <label class="${LABEL_CLS}">Title</label>
        <input type="text" [ngModel]="cfg().title" (ngModelChange)="patch({ title: $event })" class="${INPUT_CLS}" />
      </div>
      <div>
        <label class="${LABEL_CLS}">Subtitle</label>
        <textarea rows="2" [ngModel]="cfg().subtitle" (ngModelChange)="patch({ subtitle: $event })" class="${INPUT_CLS}"></textarea>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="${LABEL_CLS}">CTA label</label>
          <input type="text" [ngModel]="cfg().ctaLabel" (ngModelChange)="patch({ ctaLabel: $event })" class="${INPUT_CLS}" />
        </div>
        <div>
          <label class="${LABEL_CLS}">CTA target</label>
          <select [ngModel]="cfg().ctaTarget" (ngModelChange)="patch({ ctaTarget: $event })" class="${INPUT_CLS}">
            <option value="products">Products page</option>
            <option value="url">External URL</option>
          </select>
        </div>
      </div>
      @if (cfg().ctaTarget === 'url') {
        <div>
          <label class="${LABEL_CLS}">CTA URL</label>
          <input type="url" [ngModel]="cfg().ctaUrl" (ngModelChange)="patch({ ctaUrl: $event })" class="${INPUT_CLS}" />
        </div>
      }
      <div>
        <label class="${LABEL_CLS}">Background image</label>
        <app-image-url-input [value]="cfg().backgroundImageUrl" (valueChange)="patch({ backgroundImageUrl: $event })" folder="storefront" />
      </div>
      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="${LABEL_CLS}">Overlay</label>
          <input type="range" min="0" max="100" [ngModel]="cfg().backgroundOverlay" (ngModelChange)="patch({ backgroundOverlay: +$event })" class="w-full" />
          <div class="text-[11px] text-slate-500">{{ cfg().backgroundOverlay }}%</div>
        </div>
        <div>
          <label class="${LABEL_CLS}">H. align</label>
          <select [ngModel]="cfg().alignment" (ngModelChange)="patch({ alignment: $event })" class="${INPUT_CLS}">
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
        <div>
          <label class="${LABEL_CLS}">V. align</label>
          <select [ngModel]="cfg().verticalAlignment" (ngModelChange)="patch({ verticalAlignment: $event })" class="${INPUT_CLS}">
            <option value="top">Top</option>
            <option value="center">Center</option>
            <option value="bottom">Bottom</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="${LABEL_CLS}">Height</label>
          <select [ngModel]="cfg().height" (ngModelChange)="patch({ height: $event })" class="${INPUT_CLS}">
            <option value="sm">Small (320px)</option>
            <option value="md">Medium (480px)</option>
            <option value="lg">Large (640px)</option>
            <option value="full">Full screen (100%)</option>
            <option value="custom">Custom…</option>
          </select>
        </div>
        @if (cfg().height === 'custom') {
          <div>
            <label class="${LABEL_CLS}">Screen coverage</label>
            <input type="range" min="10" max="100" step="5"
              [ngModel]="cfg().heightVh"
              (ngModelChange)="patch({ heightVh: +$event })" class="w-full" />
            <div class="text-[11px] text-slate-500">{{ cfg().heightVh }}% of viewport</div>
          </div>
        }
      </div>
    </div>
  `
})
export class HeroEditorComponent {
  cfg = input.required<HeroConfig>();
  cfgChange = output<HeroConfig>();
  patch(p: Partial<HeroConfig>) { this.cfgChange.emit({ ...this.cfg(), ...p }); }
}

// ──────────────────────────────────────────────────────────────────────────
// Banner
// ──────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-banner-editor',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-4">
      <div>
        <label class="${LABEL_CLS}">Text</label>
        <input type="text" [ngModel]="cfg().text" (ngModelChange)="patch({ text: $event })" class="${INPUT_CLS}" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="${LABEL_CLS}">CTA label</label>
          <input type="text" [ngModel]="cfg().ctaLabel" (ngModelChange)="patch({ ctaLabel: $event })" class="${INPUT_CLS}" />
        </div>
        <div>
          <label class="${LABEL_CLS}">CTA URL</label>
          <input type="url" [ngModel]="cfg().ctaUrl" (ngModelChange)="patch({ ctaUrl: $event })" class="${INPUT_CLS}" />
        </div>
      </div>
      <div>
        <label class="${LABEL_CLS}">Background colour</label>
        <input type="color" [ngModel]="cfg().background" (ngModelChange)="patch({ background: $event })"
          class="h-10 w-24 cursor-pointer rounded-xl border border-slate-200 p-0.5" />
      </div>
    </div>
  `
})
export class BannerEditorComponent {
  cfg = input.required<BannerConfig>();
  cfgChange = output<BannerConfig>();
  patch(p: Partial<BannerConfig>) { this.cfgChange.emit({ ...this.cfg(), ...p }); }
}

// ──────────────────────────────────────────────────────────────────────────
// Featured products
// ──────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-featured-products-editor',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-4">
      <div>
        <label class="${LABEL_CLS}">Section title</label>
        <input type="text" [ngModel]="cfg().title" (ngModelChange)="patch({ title: $event })" class="${INPUT_CLS}" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="${LABEL_CLS}">Limit</label>
          <input type="number" min="1" max="24" [ngModel]="cfg().limit" (ngModelChange)="patch({ limit: +$event })" class="${INPUT_CLS}" />
        </div>
        <div>
          <label class="${LABEL_CLS}">Layout</label>
          <select [ngModel]="cfg().layout" (ngModelChange)="patch({ layout: $event })" class="${INPUT_CLS}">
            <option value="grid">Grid</option>
            <option value="carousel">Carousel</option>
          </select>
        </div>
      </div>
      <p class="text-xs text-slate-500">
        Leave product IDs empty to show the latest products automatically.
      </p>
    </div>
  `
})
export class FeaturedProductsEditorComponent {
  cfg = input.required<FeaturedProductsConfig>();
  cfgChange = output<FeaturedProductsConfig>();
  patch(p: Partial<FeaturedProductsConfig>) { this.cfgChange.emit({ ...this.cfg(), ...p }); }
}

// ──────────────────────────────────────────────────────────────────────────
// Image + Text
// ──────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-image-text-editor',
  standalone: true,
  imports: [FormsModule, ImageUrlInputComponent],
  template: `
    <div class="space-y-4">
      <div>
        <label class="${LABEL_CLS}">Title</label>
        <input type="text" [ngModel]="cfg().title" (ngModelChange)="patch({ title: $event })" class="${INPUT_CLS}" />
      </div>
      <div>
        <label class="${LABEL_CLS}">Body</label>
        <textarea rows="4" [ngModel]="cfg().body" (ngModelChange)="patch({ body: $event })" class="${INPUT_CLS}"></textarea>
      </div>
      <div>
        <label class="${LABEL_CLS}">Image</label>
        <app-image-url-input [value]="cfg().imageUrl" (valueChange)="patch({ imageUrl: $event })" folder="storefront" />
      </div>
      <div>
        <label class="${LABEL_CLS}">Image position</label>
        <select [ngModel]="cfg().imagePosition" (ngModelChange)="patch({ imagePosition: $event })" class="${INPUT_CLS}">
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </div>
    </div>
  `
})
export class ImageTextEditorComponent {
  cfg = input.required<ImageTextConfig>();
  cfgChange = output<ImageTextConfig>();
  patch(p: Partial<ImageTextConfig>) { this.cfgChange.emit({ ...this.cfg(), ...p }); }
}

// ──────────────────────────────────────────────────────────────────────────
// Gallery
// ──────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-gallery-editor',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, ImageUrlInputComponent],
  template: `
    <div class="space-y-4">
      <div>
        <label class="${LABEL_CLS}">Title</label>
        <input type="text" [ngModel]="cfg().title" (ngModelChange)="patch({ title: $event })" class="${INPUT_CLS}" />
      </div>

      <div class="space-y-3">
        @for (img of cfg().images; track $index; let i = $index) {
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2">
            <div class="flex items-center justify-between">
              <div class="text-xs font-semibold text-slate-600">Image #{{ i + 1 }}</div>
              <button type="button" class="rounded-lg p-1 text-slate-400 hover:text-red-600" (click)="removeImage(i)">
                <lucide-angular [img]="TrashIcon" class="h-4 w-4" />
              </button>
            </div>
            <app-image-url-input [value]="img.url" (valueChange)="updateImage(i, { url: $event })" folder="storefront" />
            <input type="text" placeholder="Caption (optional)"
              [ngModel]="img.caption" (ngModelChange)="updateImage(i, { caption: $event })" class="${INPUT_CLS}" />
            <input type="url" placeholder="Link URL (optional)"
              [ngModel]="img.linkUrl" (ngModelChange)="updateImage(i, { linkUrl: $event })" class="${INPUT_CLS}" />
          </div>
        }
        <button type="button"
          class="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          (click)="addImage()">
          <lucide-angular [img]="PlusIcon" class="h-4 w-4" />
          Add image
        </button>
      </div>
    </div>
  `
})
export class GalleryEditorComponent {
  readonly TrashIcon = Trash2;
  readonly PlusIcon = Plus;
  cfg = input.required<GalleryConfig>();
  cfgChange = output<GalleryConfig>();
  patch(p: Partial<GalleryConfig>) { this.cfgChange.emit({ ...this.cfg(), ...p }); }

  addImage() {
    const next: GalleryImage[] = [...this.cfg().images, { url: '', caption: '', linkUrl: '' }];
    this.patch({ images: next });
  }
  updateImage(idx: number, p: Partial<GalleryImage>) {
    const next = this.cfg().images.map((img, i) => (i === idx ? { ...img, ...p } : img));
    this.patch({ images: next });
  }
  removeImage(idx: number) {
    this.patch({ images: this.cfg().images.filter((_, i) => i !== idx) });
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Newsletter
// ──────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-newsletter-editor',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-4">
      <div>
        <label class="${LABEL_CLS}">Title</label>
        <input type="text" [ngModel]="cfg().title" (ngModelChange)="patch({ title: $event })" class="${INPUT_CLS}" />
      </div>
      <div>
        <label class="${LABEL_CLS}">Subtitle</label>
        <textarea rows="2" [ngModel]="cfg().subtitle" (ngModelChange)="patch({ subtitle: $event })" class="${INPUT_CLS}"></textarea>
      </div>
      <div>
        <label class="${LABEL_CLS}">Button label</label>
        <input type="text" [ngModel]="cfg().buttonLabel" (ngModelChange)="patch({ buttonLabel: $event })" class="${INPUT_CLS}" />
      </div>
    </div>
  `
})
export class NewsletterEditorComponent {
  cfg = input.required<NewsletterConfig>();
  cfgChange = output<NewsletterConfig>();
  patch(p: Partial<NewsletterConfig>) { this.cfgChange.emit({ ...this.cfg(), ...p }); }
}

// ──────────────────────────────────────────────────────────────────────────
// Testimonials
// ──────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-testimonials-editor',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, ImageUrlInputComponent],
  template: `
    <div class="space-y-4">
      <div>
        <label class="${LABEL_CLS}">Title</label>
        <input type="text" [ngModel]="cfg().title" (ngModelChange)="patch({ title: $event })" class="${INPUT_CLS}" />
      </div>

      <div class="space-y-3">
        @for (t of cfg().items; track $index; let i = $index) {
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2">
            <div class="flex items-center justify-between">
              <div class="text-xs font-semibold text-slate-600">Testimonial #{{ i + 1 }}</div>
              <button type="button" class="rounded-lg p-1 text-slate-400 hover:text-red-600" (click)="remove(i)">
                <lucide-angular [img]="TrashIcon" class="h-4 w-4" />
              </button>
            </div>
            <textarea rows="3" placeholder="Quote"
              [ngModel]="t.quote" (ngModelChange)="update(i, { quote: $event })" class="${INPUT_CLS}"></textarea>
            <div class="grid grid-cols-2 gap-2">
              <input type="text" placeholder="Author"
                [ngModel]="t.author" (ngModelChange)="update(i, { author: $event })" class="${INPUT_CLS}" />
              <input type="text" placeholder="Role"
                [ngModel]="t.role" (ngModelChange)="update(i, { role: $event })" class="${INPUT_CLS}" />
            </div>
            <app-image-url-input [value]="t.avatarUrl" (valueChange)="update(i, { avatarUrl: $event })" folder="storefront" placeholder="Avatar URL" />
          </div>
        }
        <button type="button"
          class="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          (click)="add()">
          <lucide-angular [img]="PlusIcon" class="h-4 w-4" />
          Add testimonial
        </button>
      </div>
    </div>
  `
})
export class TestimonialsEditorComponent {
  readonly TrashIcon = Trash2;
  readonly PlusIcon = Plus;
  cfg = input.required<TestimonialsConfig>();
  cfgChange = output<TestimonialsConfig>();
  patch(p: Partial<TestimonialsConfig>) { this.cfgChange.emit({ ...this.cfg(), ...p }); }

  add() {
    const next: Testimonial[] = [...this.cfg().items, { quote: '', author: '', role: '', avatarUrl: '' }];
    this.patch({ items: next });
  }
  update(i: number, p: Partial<Testimonial>) {
    this.patch({ items: this.cfg().items.map((t, idx) => (idx === i ? { ...t, ...p } : t)) });
  }
  remove(i: number) {
    this.patch({ items: this.cfg().items.filter((_, idx) => idx !== i) });
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Category grid
// ──────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-category-grid-editor',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, ImageUrlInputComponent],
  template: `
    <div class="space-y-4">
      <div>
        <label class="${LABEL_CLS}">Title</label>
        <input type="text" [ngModel]="cfg().title" (ngModelChange)="patch({ title: $event })" class="${INPUT_CLS}" />
      </div>

      <div class="space-y-3">
        @for (c of cfg().categories; track $index; let i = $index) {
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2">
            <div class="flex items-center justify-between">
              <div class="text-xs font-semibold text-slate-600">Category #{{ i + 1 }}</div>
              <button type="button" class="rounded-lg p-1 text-slate-400 hover:text-red-600" (click)="remove(i)">
                <lucide-angular [img]="TrashIcon" class="h-4 w-4" />
              </button>
            </div>
            <input type="text" placeholder="Label"
              [ngModel]="c.label" (ngModelChange)="update(i, { label: $event })" class="${INPUT_CLS}" />
            <input type="text" placeholder="Product filter (e.g. category slug)"
              [ngModel]="c.productFilter" (ngModelChange)="update(i, { productFilter: $event })" class="${INPUT_CLS}" />
            <app-image-url-input [value]="c.imageUrl" (valueChange)="update(i, { imageUrl: $event })" folder="storefront" />
          </div>
        }
        <button type="button"
          class="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          (click)="add()">
          <lucide-angular [img]="PlusIcon" class="h-4 w-4" />
          Add category
        </button>
      </div>
    </div>
  `
})
export class CategoryGridEditorComponent {
  readonly TrashIcon = Trash2;
  readonly PlusIcon = Plus;
  cfg = input.required<CategoryGridConfig>();
  cfgChange = output<CategoryGridConfig>();
  patch(p: Partial<CategoryGridConfig>) { this.cfgChange.emit({ ...this.cfg(), ...p }); }

  add() {
    const next: CategoryGridItem[] = [...this.cfg().categories, { label: '', imageUrl: '', productFilter: '' }];
    this.patch({ categories: next });
  }
  update(i: number, p: Partial<CategoryGridItem>) {
    this.patch({ categories: this.cfg().categories.map((c, idx) => (idx === i ? { ...c, ...p } : c)) });
  }
  remove(i: number) {
    this.patch({ categories: this.cfg().categories.filter((_, idx) => idx !== i) });
  }
}

// ──────────────────────────────────────────────────────────────────────────
// CTA
// ──────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-cta-editor',
  standalone: true,
  imports: [FormsModule, ImageUrlInputComponent],
  template: `
    <div class="space-y-4">
      <div>
        <label class="${LABEL_CLS}">Title</label>
        <input type="text" [ngModel]="cfg().title" (ngModelChange)="patch({ title: $event })" class="${INPUT_CLS}" />
      </div>
      <div>
        <label class="${LABEL_CLS}">Subtitle</label>
        <textarea rows="2" [ngModel]="cfg().subtitle" (ngModelChange)="patch({ subtitle: $event })" class="${INPUT_CLS}"></textarea>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="${LABEL_CLS}">CTA label</label>
          <input type="text" [ngModel]="cfg().ctaLabel" (ngModelChange)="patch({ ctaLabel: $event })" class="${INPUT_CLS}" />
        </div>
        <div>
          <label class="${LABEL_CLS}">CTA URL</label>
          <input type="url" [ngModel]="cfg().ctaUrl" (ngModelChange)="patch({ ctaUrl: $event })" class="${INPUT_CLS}" />
        </div>
      </div>
      <div>
        <label class="${LABEL_CLS}">Background image</label>
        <app-image-url-input [value]="cfg().backgroundImageUrl" (valueChange)="patch({ backgroundImageUrl: $event })" folder="storefront" />
      </div>
    </div>
  `
})
export class CtaEditorComponent {
  cfg = input.required<CtaConfig>();
  cfgChange = output<CtaConfig>();
  patch(p: Partial<CtaConfig>) { this.cfgChange.emit({ ...this.cfg(), ...p }); }
}

// ──────────────────────────────────────────────────────────────────────────
// Hero slider
// ──────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-hero-slider-editor',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, ImageUrlInputComponent],
  template: `
    <div class="space-y-4">
      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="${LABEL_CLS}">Height</label>
          <select [ngModel]="cfg().height" (ngModelChange)="patch({ height: $event })" class="${INPUT_CLS}">
            <option value="sm">Small (320px)</option>
            <option value="md">Medium (480px)</option>
            <option value="lg">Large (640px)</option>
            <option value="full">Full screen (100%)</option>
            <option value="custom">Custom…</option>
          </select>
        </div>
        <div>
          <label class="${LABEL_CLS}">V. align</label>
          <select [ngModel]="cfg().verticalAlignment" (ngModelChange)="patch({ verticalAlignment: $event })" class="${INPUT_CLS}">
            <option value="top">Top</option>
            <option value="center">Center</option>
            <option value="bottom">Bottom</option>
          </select>
        </div>
        <div>
          <label class="${LABEL_CLS}">Auto-play</label>
          <select [ngModel]="cfg().autoPlay" (ngModelChange)="patch({ autoPlay: $event === 'true' || $event === true })" class="${INPUT_CLS}">
            <option [ngValue]="true">On</option>
            <option [ngValue]="false">Off</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        @if (cfg().height === 'custom') {
          <div>
            <label class="${LABEL_CLS}">Screen coverage</label>
            <input type="range" min="10" max="100" step="5"
              [ngModel]="cfg().heightVh"
              (ngModelChange)="patch({ heightVh: +$event })" class="w-full" />
            <div class="text-[11px] text-slate-500">{{ cfg().heightVh }}% of viewport</div>
          </div>
        }
        <div>
          <label class="${LABEL_CLS}">Interval (ms)</label>
          <input type="number" min="2000" step="500" [ngModel]="cfg().intervalMs" (ngModelChange)="patch({ intervalMs: +$event })" class="${INPUT_CLS}" />
        </div>
      </div>

      <div class="space-y-3">
        @for (slide of cfg().slides; track $index; let i = $index) {
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2">
            <div class="flex items-center justify-between">
              <div class="text-xs font-semibold text-slate-600">Slide #{{ i + 1 }}</div>
              <button type="button" class="rounded-lg p-1 text-slate-400 hover:text-red-600" (click)="removeSlide(i)">
                <lucide-angular [img]="TrashIcon" class="h-4 w-4" />
              </button>
            </div>
            <input type="text" placeholder="Title"
              [ngModel]="slide.title" (ngModelChange)="updateSlide(i, { title: $event })" class="${INPUT_CLS}" />
            <textarea rows="2" placeholder="Subtitle"
              [ngModel]="slide.subtitle" (ngModelChange)="updateSlide(i, { subtitle: $event })" class="${INPUT_CLS}"></textarea>
            <div class="grid grid-cols-2 gap-2">
              <input type="text" placeholder="CTA label"
                [ngModel]="slide.ctaLabel" (ngModelChange)="updateSlide(i, { ctaLabel: $event })" class="${INPUT_CLS}" />
              <input type="url" placeholder="CTA URL"
                [ngModel]="slide.ctaUrl" (ngModelChange)="updateSlide(i, { ctaUrl: $event })" class="${INPUT_CLS}" />
            </div>
            <app-image-url-input [value]="slide.imageUrl" (valueChange)="updateSlide(i, { imageUrl: $event })" folder="storefront" />
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="${LABEL_CLS}">Overlay</label>
                <input type="range" min="0" max="100" [ngModel]="slide.backgroundOverlay" (ngModelChange)="updateSlide(i, { backgroundOverlay: +$event })" class="w-full" />
                <div class="text-[11px] text-slate-500">{{ slide.backgroundOverlay }}%</div>
              </div>
              <div>
                <label class="${LABEL_CLS}">Alignment</label>
                <select [ngModel]="slide.alignment" (ngModelChange)="updateSlide(i, { alignment: $event })" class="${INPUT_CLS}">
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          </div>
        }
        <button type="button"
          class="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          (click)="addSlide()">
          <lucide-angular [img]="PlusIcon" class="h-4 w-4" />
          Add slide
        </button>
      </div>
    </div>
  `
})
export class HeroSliderEditorComponent {
  readonly TrashIcon = Trash2;
  readonly PlusIcon = Plus;
  cfg = input.required<HeroSliderConfig>();
  cfgChange = output<HeroSliderConfig>();
  patch(p: Partial<HeroSliderConfig>) { this.cfgChange.emit({ ...this.cfg(), ...p }); }

  addSlide() {
    const next: HeroSlide[] = [...this.cfg().slides, { title: '', subtitle: '', ctaLabel: '', ctaUrl: '', imageUrl: '', backgroundOverlay: 40, alignment: 'left' }];
    this.patch({ slides: next });
  }
  updateSlide(i: number, p: Partial<HeroSlide>) {
    this.patch({ slides: this.cfg().slides.map((s, idx) => (idx === i ? { ...s, ...p } : s)) });
  }
  removeSlide(i: number) {
    this.patch({ slides: this.cfg().slides.filter((_, idx) => idx !== i) });
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Logos
// ──────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-logos-editor',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, ImageUrlInputComponent],
  template: `
    <div class="space-y-4">
      <div>
        <label class="${LABEL_CLS}">Title (optional)</label>
        <input type="text" [ngModel]="cfg().title" (ngModelChange)="patch({ title: $event })" class="${INPUT_CLS}" />
      </div>
      <div>
        <label class="${LABEL_CLS}">Subtitle (optional)</label>
        <input type="text" [ngModel]="cfg().subtitle" (ngModelChange)="patch({ subtitle: $event })" class="${INPUT_CLS}" />
      </div>
      <div>
        <label class="${LABEL_CLS}">Style</label>
        <select [ngModel]="cfg().style" (ngModelChange)="patch({ style: $event })" class="${INPUT_CLS}">
          <option value="muted">Muted</option>
          <option value="full">Full colour</option>
        </select>
      </div>

      <div>
        <label class="${LABEL_CLS}">Layout (logo ↔ label)</label>
        <select [ngModel]="cfg().itemLayout ?? 'horizontal'" (ngModelChange)="patch({ itemLayout: $event })" class="${INPUT_CLS}">
          <option value="horizontal">Horizontal (side by side)</option>
          <option value="vertical">Vertical (stacked)</option>
        </select>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="${LABEL_CLS}">Logo size ({{ cfg().logoSize ?? 32 }}px)</label>
          <input type="range" min="16" max="120" step="2"
            [ngModel]="cfg().logoSize ?? 32"
            (ngModelChange)="patch({ logoSize: +$event })"
            class="w-full" />
        </div>
        <div>
          <label class="${LABEL_CLS}">Label size ({{ cfg().labelSize ?? 11 }}px)</label>
          <input type="range" min="8" max="28" step="1"
            [ngModel]="cfg().labelSize ?? 11"
            (ngModelChange)="patch({ labelSize: +$event })"
            class="w-full" />
        </div>
      </div>

      <div class="space-y-3">
        @for (item of cfg().items; track $index; let i = $index) {
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2">
            <div class="flex items-center justify-between">
              <div class="text-xs font-semibold text-slate-600">Logo #{{ i + 1 }}</div>
              <button type="button" class="rounded-lg p-1 text-slate-400 hover:text-red-600" (click)="remove(i)">
                <lucide-angular [img]="TrashIcon" class="h-4 w-4" />
              </button>
            </div>
            <input type="text" placeholder="Label"
              [ngModel]="item.label" (ngModelChange)="update(i, { label: $event })" class="${INPUT_CLS}" />
            <app-image-url-input [value]="item.imageUrl" (valueChange)="update(i, { imageUrl: $event })" folder="storefront" placeholder="Logo image URL" />
            <input type="url" placeholder="Link URL (optional)"
              [ngModel]="item.linkUrl" (ngModelChange)="update(i, { linkUrl: $event })" class="${INPUT_CLS}" />
          </div>
        }
        <button type="button"
          class="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          (click)="add()">
          <lucide-angular [img]="PlusIcon" class="h-4 w-4" />
          Add logo
        </button>
      </div>
    </div>
  `
})
export class LogosEditorComponent {
  readonly TrashIcon = Trash2;
  readonly PlusIcon = Plus;
  cfg = input.required<LogosConfig>();
  cfgChange = output<LogosConfig>();
  patch(p: Partial<LogosConfig>) { this.cfgChange.emit({ ...this.cfg(), ...p }); }

  add() {
    const next: LogoItem[] = [...this.cfg().items, { label: '', imageUrl: '', linkUrl: '' }];
    this.patch({ items: next });
  }
  update(i: number, p: Partial<LogoItem>) {
    this.patch({ items: this.cfg().items.map((x, idx) => (idx === i ? { ...x, ...p } : x)) });
  }
  remove(i: number) {
    this.patch({ items: this.cfg().items.filter((_, idx) => idx !== i) });
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Promo cards
// ──────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-promo-cards-editor',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="${LABEL_CLS}">Title (optional)</label>
          <input type="text" [ngModel]="cfg().title" (ngModelChange)="patch({ title: $event })" class="${INPUT_CLS}" />
        </div>
        <div>
          <label class="${LABEL_CLS}">Columns</label>
          <select [ngModel]="cfg().columns" (ngModelChange)="patch({ columns: $event })" class="${INPUT_CLS}">
            <option [ngValue]="2">2</option>
            <option [ngValue]="3">3</option>
            <option [ngValue]="4">4</option>
          </select>
        </div>
      </div>

      <div class="space-y-3">
        @for (card of cfg().cards; track $index; let i = $index) {
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2">
            <div class="flex items-center justify-between">
              <div class="text-xs font-semibold text-slate-600">Card #{{ i + 1 }}</div>
              <button type="button" class="rounded-lg p-1 text-slate-400 hover:text-red-600" (click)="remove(i)">
                <lucide-angular [img]="TrashIcon" class="h-4 w-4" />
              </button>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <input type="text" placeholder="Label (NEW)"
                [ngModel]="card.label" (ngModelChange)="update(i, { label: $event })" class="${INPUT_CLS}" />
              <select [ngModel]="card.icon" (ngModelChange)="update(i, { icon: $event })" class="${INPUT_CLS}">
                <option value="Sparkles">Sparkles</option>
                <option value="Tag">Tag</option>
                <option value="Package">Package</option>
                <option value="Star">Star</option>
                <option value="Heart">Heart</option>
                <option value="Truck">Truck</option>
              </select>
            </div>
            <input type="text" placeholder="Title"
              [ngModel]="card.title" (ngModelChange)="update(i, { title: $event })" class="${INPUT_CLS}" />
            <textarea rows="2" placeholder="Description (optional)"
              [ngModel]="card.description" (ngModelChange)="update(i, { description: $event })" class="${INPUT_CLS}"></textarea>
            <input type="url" placeholder="CTA URL (optional)"
              [ngModel]="card.ctaUrl" (ngModelChange)="update(i, { ctaUrl: $event })" class="${INPUT_CLS}" />
          </div>
        }
        <button type="button"
          class="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          (click)="add()">
          <lucide-angular [img]="PlusIcon" class="h-4 w-4" />
          Add card
        </button>
      </div>
    </div>
  `
})
export class PromoCardsEditorComponent {
  readonly TrashIcon = Trash2;
  readonly PlusIcon = Plus;
  cfg = input.required<PromoCardsConfig>();
  cfgChange = output<PromoCardsConfig>();
  patch(p: Partial<PromoCardsConfig>) { this.cfgChange.emit({ ...this.cfg(), ...p }); }

  add() {
    const next: PromoCard[] = [...this.cfg().cards, { label: '', title: '', description: '', ctaUrl: '', icon: 'Sparkles' }];
    this.patch({ cards: next });
  }
  update(i: number, p: Partial<PromoCard>) {
    this.patch({ cards: this.cfg().cards.map((c, idx) => (idx === i ? { ...c, ...p } : c)) });
  }
  remove(i: number) {
    this.patch({ cards: this.cfg().cards.filter((_, idx) => idx !== i) });
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Value props
// ──────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-value-props-editor',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="${LABEL_CLS}">Title (optional)</label>
          <input type="text" [ngModel]="cfg().title" (ngModelChange)="patch({ title: $event })" class="${INPUT_CLS}" />
        </div>
        <div>
          <label class="${LABEL_CLS}">Background</label>
          <select [ngModel]="cfg().background" (ngModelChange)="patch({ background: $event })" class="${INPUT_CLS}">
            <option value="muted">Muted</option>
            <option value="white">White</option>
          </select>
        </div>
      </div>

      <div class="space-y-3">
        @for (item of cfg().items; track $index; let i = $index) {
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2">
            <div class="flex items-center justify-between">
              <div class="text-xs font-semibold text-slate-600">Prop #{{ i + 1 }}</div>
              <button type="button" class="rounded-lg p-1 text-slate-400 hover:text-red-600" (click)="remove(i)">
                <lucide-angular [img]="TrashIcon" class="h-4 w-4" />
              </button>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <input type="text" placeholder="Title"
                [ngModel]="item.title" (ngModelChange)="update(i, { title: $event })" class="${INPUT_CLS}" />
              <select [ngModel]="item.icon" (ngModelChange)="update(i, { icon: $event })" class="${INPUT_CLS}">
                <option value="BadgeCheck">BadgeCheck</option>
                <option value="ShieldCheck">ShieldCheck</option>
                <option value="Truck">Truck</option>
                <option value="PackageCheck">PackageCheck</option>
                <option value="Package">Package</option>
                <option value="Award">Award</option>
                <option value="Star">Star</option>
                <option value="Leaf">Leaf</option>
                <option value="Sparkles">Sparkles</option>
                <option value="Activity">Activity</option>
              </select>
            </div>
            <textarea rows="2" placeholder="Description"
              [ngModel]="item.description" (ngModelChange)="update(i, { description: $event })" class="${INPUT_CLS}"></textarea>
          </div>
        }
        <button type="button"
          class="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          (click)="add()">
          <lucide-angular [img]="PlusIcon" class="h-4 w-4" />
          Add value prop
        </button>
      </div>
    </div>
  `
})
export class ValuePropsEditorComponent {
  readonly TrashIcon = Trash2;
  readonly PlusIcon = Plus;
  cfg = input.required<ValuePropsConfig>();
  cfgChange = output<ValuePropsConfig>();
  patch(p: Partial<ValuePropsConfig>) { this.cfgChange.emit({ ...this.cfg(), ...p }); }

  add() {
    const next: ValueProp[] = [...this.cfg().items, { icon: 'BadgeCheck', title: '', description: '' }];
    this.patch({ items: next });
  }
  update(i: number, p: Partial<ValueProp>) {
    this.patch({ items: this.cfg().items.map((x, idx) => (idx === i ? { ...x, ...p } : x)) });
  }
  remove(i: number) {
    this.patch({ items: this.cfg().items.filter((_, idx) => idx !== i) });
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Rich text
// ──────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-4">
      <div>
        <label class="${LABEL_CLS}">Title (optional)</label>
        <input type="text" [ngModel]="cfg().title" (ngModelChange)="patch({ title: $event })" class="${INPUT_CLS}" />
      </div>
      <div>
        <label class="${LABEL_CLS}">Body</label>
        <textarea rows="6" [ngModel]="cfg().body" (ngModelChange)="patch({ body: $event })" class="${INPUT_CLS}"></textarea>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="${LABEL_CLS}">Alignment</label>
          <select [ngModel]="cfg().alignment" (ngModelChange)="patch({ alignment: $event })" class="${INPUT_CLS}">
            <option value="left">Left</option>
            <option value="center">Center</option>
          </select>
        </div>
        <div>
          <label class="${LABEL_CLS}">Width</label>
          <select [ngModel]="cfg().maxWidth" (ngModelChange)="patch({ maxWidth: $event })" class="${INPUT_CLS}">
            <option value="narrow">Narrow</option>
            <option value="wide">Wide</option>
          </select>
        </div>
      </div>
    </div>
  `
})
export class RichTextEditorComponent {
  cfg = input.required<RichTextConfig>();
  cfgChange = output<RichTextConfig>();
  patch(p: Partial<RichTextConfig>) { this.cfgChange.emit({ ...this.cfg(), ...p }); }
}

// ──────────────────────────────────────────────────────────────────────────
// Dispatcher
// ──────────────────────────────────────────────────────────────────────────
/** Dispatches to the right editor component based on section.type. */
@Component({
  selector: 'app-section-editor',
  standalone: true,
  imports: [
    FormsModule,
    HeroEditorComponent,
    BannerEditorComponent,
    FeaturedProductsEditorComponent,
    ImageTextEditorComponent,
    GalleryEditorComponent,
    NewsletterEditorComponent,
    TestimonialsEditorComponent,
    CategoryGridEditorComponent,
    CtaEditorComponent,
    HeroSliderEditorComponent,
    LogosEditorComponent,
    PromoCardsEditorComponent,
    ValuePropsEditorComponent,
    RichTextEditorComponent
  ],
  template: `
    @switch (section().type) {
      @case ('hero')             { <app-hero-editor              [cfg]="anyCfg()" (cfgChange)="emit($event)" /> }
      @case ('banner')           { <app-banner-editor            [cfg]="anyCfg()" (cfgChange)="emit($event)" /> }
      @case ('featuredProducts') { <app-featured-products-editor [cfg]="anyCfg()" (cfgChange)="emit($event)" /> }
      @case ('imageText')        { <app-image-text-editor        [cfg]="anyCfg()" (cfgChange)="emit($event)" /> }
      @case ('gallery')          { <app-gallery-editor           [cfg]="anyCfg()" (cfgChange)="emit($event)" /> }
      @case ('newsletter')       { <app-newsletter-editor        [cfg]="anyCfg()" (cfgChange)="emit($event)" /> }
      @case ('testimonials')     { <app-testimonials-editor      [cfg]="anyCfg()" (cfgChange)="emit($event)" /> }
      @case ('categoryGrid')     { <app-category-grid-editor     [cfg]="anyCfg()" (cfgChange)="emit($event)" /> }
      @case ('cta')              { <app-cta-editor               [cfg]="anyCfg()" (cfgChange)="emit($event)" /> }
      @case ('heroSlider')       { <app-hero-slider-editor       [cfg]="anyCfg()" (cfgChange)="emit($event)" /> }
      @case ('logos')            { <app-logos-editor             [cfg]="anyCfg()" (cfgChange)="emit($event)" /> }
      @case ('promoCards')       { <app-promo-cards-editor       [cfg]="anyCfg()" (cfgChange)="emit($event)" /> }
      @case ('valueProps')       { <app-value-props-editor       [cfg]="anyCfg()" (cfgChange)="emit($event)" /> }
      @case ('richText')         { <app-rich-text-editor         [cfg]="anyCfg()" (cfgChange)="emit($event)" /> }
    }
  `
})
export class SectionEditorComponent {
  section = input.required<StoreSection>();
  configChange = output<StoreSection>();

  anyCfg = computed<any>(() => this.section().config);

  emit(config: any) {
    this.configChange.emit({ ...this.section(), config } as StoreSection);
  }
}
