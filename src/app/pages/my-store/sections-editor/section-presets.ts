import { SectionType, StoreSection } from '../../../core/store.service';
import { createDefaultSection } from './section-defaults';

export type SectionPreset = {
  id: string;
  name: string;
  description: string;
  sections: SectionType[];
};

export const SECTION_PRESETS: SectionPreset[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'A clean starting point: hero, products, newsletter.',
    sections: ['hero', 'featuredProducts', 'newsletter']
  },
  {
    id: 'retail',
    name: 'Retail',
    description: 'Showcase a full catalog with trust-builders.',
    sections: [
      'banner',
      'heroSlider',
      'logos',
      'promoCards',
      'imageText',
      'featuredProducts',
      'categoryGrid',
      'valueProps',
      'testimonials',
      'newsletter'
    ]
  },
  {
    id: 'brand',
    name: 'Brand story',
    description: 'Editorial layout centered around your brand.',
    sections: ['hero', 'imageText', 'gallery', 'richText', 'cta', 'newsletter']
  },
  {
    id: 'launch',
    name: 'Product launch',
    description: 'Hype a single drop with emphasis on the new release.',
    sections: ['banner', 'hero', 'promoCards', 'featuredProducts', 'valueProps', 'cta']
  },
  {
    id: 'full',
    name: 'Everything',
    description: 'Every section at once — great for exploring what is possible.',
    sections: [
      'banner',
      'heroSlider',
      'logos',
      'promoCards',
      'categoryGrid',
      'imageText',
      'featuredProducts',
      'gallery',
      'valueProps',
      'testimonials',
      'richText',
      'cta',
      'newsletter'
    ]
  }
];

/** Expand a preset into concrete StoreSection objects with unique ids. */
export function buildPresetSections(preset: SectionPreset): StoreSection[] {
  return preset.sections.map((t) => createDefaultSection(t));
}
