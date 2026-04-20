import {
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  inject,
  input
} from '@angular/core';
import { Store, StoreSection } from '../../../core/store.service';
import { registerSectionReveal } from '../../../core/animations';
import { HeroSectionComponent } from './hero-section.component';
import { BannerSectionComponent } from './banner-section.component';
import { FeaturedProductsSectionComponent } from './featured-products-section.component';
import { ImageTextSectionComponent } from './image-text-section.component';
import { GallerySectionComponent } from './gallery-section.component';
import { NewsletterSectionComponent } from './newsletter-section.component';
import { TestimonialsSectionComponent } from './testimonials-section.component';
import { CategoryGridSectionComponent } from './category-grid-section.component';
import { CtaSectionComponent } from './cta-section.component';
import { HeroSliderSectionComponent } from './hero-slider-section.component';
import { LogosSectionComponent } from './logos-section.component';
import { PromoCardsSectionComponent } from './promo-cards-section.component';
import { ValuePropsSectionComponent } from './value-props-section.component';
import { RichTextSectionComponent } from './rich-text-section.component';

@Component({
  selector: 'app-section-renderer',
  standalone: true,
  imports: [
    HeroSectionComponent,
    BannerSectionComponent,
    FeaturedProductsSectionComponent,
    ImageTextSectionComponent,
    GallerySectionComponent,
    NewsletterSectionComponent,
    TestimonialsSectionComponent,
    CategoryGridSectionComponent,
    CtaSectionComponent,
    HeroSliderSectionComponent,
    LogosSectionComponent,
    PromoCardsSectionComponent,
    ValuePropsSectionComponent,
    RichTextSectionComponent
  ],
  host: {
    class: 'block'
  },
  template: `
    @switch (section().type) {
      @case ('hero')             { <app-hero-section              [cfg]="$any(section()).config" [store]="store()" /> }
      @case ('banner')           { <app-banner-section            [cfg]="$any(section()).config" /> }
      @case ('featuredProducts') { <app-featured-products-section [cfg]="$any(section()).config" [store]="store()" /> }
      @case ('imageText')        { <app-image-text-section        [cfg]="$any(section()).config" /> }
      @case ('gallery')          { <app-gallery-section           [cfg]="$any(section()).config" /> }
      @case ('newsletter')       { <app-newsletter-section        [cfg]="$any(section()).config" /> }
      @case ('testimonials')     { <app-testimonials-section      [cfg]="$any(section()).config" /> }
      @case ('categoryGrid')     { <app-category-grid-section     [cfg]="$any(section()).config" [store]="store()" /> }
      @case ('cta')              { <app-cta-section               [cfg]="$any(section()).config" [store]="store()" /> }
      @case ('heroSlider')       { <app-hero-slider-section       [cfg]="$any(section()).config" /> }
      @case ('logos')            { <app-logos-section             [cfg]="$any(section()).config" /> }
      @case ('promoCards')       { <app-promo-cards-section       [cfg]="$any(section()).config" /> }
      @case ('valueProps')       { <app-value-props-section       [cfg]="$any(section()).config" /> }
      @case ('richText')         { <app-rich-text-section         [cfg]="$any(section()).config" /> }
    }
  `
})
export class SectionRendererComponent implements OnDestroy {
  section = input.required<StoreSection>();
  store = input.required<Store>();

  private host = inject(ElementRef<HTMLElement>);
  private cleanupReveal: (() => void) | null = null;

  constructor() {
    afterNextRender(() => {
      // Hero sections are the first thing the visitor sees — leave them
      // alone so they don't fade in while already in view on page load.
      if (this.section().type === 'hero' || this.section().type === 'heroSlider') {
        return;
      }
      this.cleanupReveal = registerSectionReveal(this.host.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.cleanupReveal?.();
    this.cleanupReveal = null;
  }
}
