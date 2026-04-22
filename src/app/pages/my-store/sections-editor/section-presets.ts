import { SectionType, StoreSection } from '../../../core/store.service';
import { createDefaultSection } from './section-defaults';

/**
 * Broad page-type buckets surfaced in the preset picker. Users pick a
 * category that matches the page they are building (Home, Shop, About, …)
 * and get presets tailored to that page.
 */
export type PresetCategory =
  | 'home'
  | 'shop'
  | 'about'
  | 'contact'
  | 'faq'
  | 'landing';

export type PresetCategoryMeta = {
  id: PresetCategory;
  label: string;
  description: string;
};

export const PRESET_CATEGORIES: PresetCategoryMeta[] = [
  { id: 'home',    label: 'Home',              description: 'Landing page for first-time visitors.' },
  { id: 'shop',    label: 'Shop',              description: 'Product catalog and category pages.' },
  { id: 'about',   label: 'About',             description: 'Brand story, team, and values.' },
  { id: 'contact', label: 'Contact',           description: 'Get in touch, hours, and location.' },
  { id: 'faq',     label: 'FAQ / Help',        description: 'Answer common customer questions.' },
  { id: 'landing', label: 'Landing / Campaign',description: 'Product launches and marketing pushes.' }
];

/**
 * A single section inside a preset. The `config` is a shallow override
 * merged on top of the section type's default config when the preset is
 * applied, so we can ship meaningful starter copy per page type.
 */
export type PresetSectionSpec = {
  type: SectionType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config?: Record<string, any>;
};

export type SectionPreset = {
  id: string;
  name: string;
  description: string;
  category: PresetCategory;
  sections: PresetSectionSpec[];
};

/** Convenience so presets below can use bare section types for simple cases. */
const s = (type: SectionType, config?: PresetSectionSpec['config']): PresetSectionSpec => ({
  type,
  ...(config ? { config } : {})
});

export const SECTION_PRESETS: SectionPreset[] = [
  // ─── HOME ────────────────────────────────────────────────────────────
  {
    id: 'home-minimal',
    name: 'Minimal home',
    description: 'A clean starting point: hero, products, newsletter.',
    category: 'home',
    sections: [
      s('hero', {
        title: 'Welcome to our store',
        subtitle: 'Thoughtfully made products, delivered to your door.',
        ctaLabel: 'Shop now',
        ctaTarget: 'products'
      }),
      s('featuredProducts', { title: 'Featured products', limit: 8 }),
      s('newsletter')
    ]
  },
  {
    id: 'home-retail',
    name: 'Full retail home',
    description: 'Showcase a full catalog with trust-builders.',
    category: 'home',
    sections: [
      s('banner', { text: 'Free shipping on orders over $50' }),
      s('heroSlider'),
      s('logos', { title: 'As seen in' }),
      s('promoCards'),
      s('imageText', {
        title: 'Crafted with care',
        body: 'Every item in our catalog is chosen for quality, durability, and everyday use.'
      }),
      s('featuredProducts', { title: 'Bestsellers', limit: 8 }),
      s('categoryGrid', { title: 'Shop by category' }),
      s('valueProps'),
      s('testimonials', { title: 'What our customers say' }),
      s('newsletter')
    ]
  },
  {
    id: 'home-brand',
    name: 'Brand-first home',
    description: 'Editorial layout centered around your story.',
    category: 'home',
    sections: [
      s('hero', {
        title: 'Made for the everyday',
        subtitle: 'A small studio making products we love.',
        ctaLabel: 'Our story',
        ctaTarget: 'url',
        ctaUrl: '/p/about'
      }),
      s('imageText', {
        title: 'Our story',
        body: 'We started in 2021 with a simple idea: timeless design, honest materials, and a focus on the details that matter.'
      }),
      s('gallery', { title: 'From the studio' }),
      s('featuredProducts', { title: 'Shop the collection', limit: 6 }),
      s('richText', {
        title: 'What we believe',
        body: 'Quality over quantity. Repairable over disposable. And a belief that good design is worth the wait.'
      }),
      s('cta', {
        title: 'Join the community',
        subtitle: 'Be the first to hear about new drops and restocks.',
        ctaLabel: 'Sign up'
      }),
      s('newsletter')
    ]
  },
  {
    id: 'home-launch',
    name: 'Product launch home',
    description: 'Hype a single drop with emphasis on the new release.',
    category: 'home',
    sections: [
      s('banner', { text: 'New: the Spring collection is here' }),
      s('hero', {
        title: 'Introducing our latest drop',
        subtitle: 'Made in limited quantities. When it’s gone, it’s gone.',
        ctaLabel: 'Shop the drop',
        ctaTarget: 'products'
      }),
      s('promoCards'),
      s('featuredProducts', { title: 'The collection', limit: 6 }),
      s('valueProps'),
      s('cta', {
        title: 'Don’t miss the next one',
        subtitle: 'Sign up for early access to future drops.',
        ctaLabel: 'Get early access'
      })
    ]
  },

  // ─── SHOP ────────────────────────────────────────────────────────────
  {
    id: 'shop-simple',
    name: 'Simple shop page',
    description: 'Headline, full product grid, and trust row.',
    category: 'shop',
    sections: [
      s('hero', {
        title: 'Shop',
        subtitle: 'Browse the full catalog.',
        height: 'sm',
        ctaLabel: ''
      }),
      s('featuredProducts', { title: 'All products', limit: 24, layout: 'grid' }),
      s('valueProps')
    ]
  },
  {
    id: 'shop-categories',
    name: 'Shop by category',
    description: 'Lead with category tiles, then a product grid.',
    category: 'shop',
    sections: [
      s('hero', {
        title: 'Shop by category',
        subtitle: 'Find exactly what you’re looking for.',
        height: 'sm'
      }),
      s('categoryGrid', { title: 'Categories' }),
      s('featuredProducts', { title: 'Popular right now', limit: 12 }),
      s('valueProps')
    ]
  },
  {
    id: 'shop-sale',
    name: 'Sale / promo shop',
    description: 'Announcement bar, promo cards, and discounted items.',
    category: 'shop',
    sections: [
      s('banner', { text: 'Limited time: up to 40% off selected items' }),
      s('hero', {
        title: 'On sale now',
        subtitle: 'Favorites at their best prices of the year.',
        ctaLabel: 'Shop the sale',
        ctaTarget: 'products',
        height: 'sm'
      }),
      s('promoCards'),
      s('featuredProducts', { title: 'On sale', limit: 12 }),
      s('cta', {
        title: 'Sale ends soon',
        subtitle: 'Stock up before it’s over.',
        ctaLabel: 'Shop now'
      })
    ]
  },

  // ─── ABOUT ───────────────────────────────────────────────────────────
  {
    id: 'about-simple',
    name: 'Simple about',
    description: 'A short intro and a paragraph about your brand.',
    category: 'about',
    sections: [
      s('hero', {
        title: 'About us',
        subtitle: 'A little bit about who we are.',
        height: 'sm',
        ctaLabel: ''
      }),
      s('richText', {
        title: 'Our story',
        body: 'We’re a small team passionate about design, craftsmanship, and building products we’d use ourselves. Thanks for stopping by — we’re glad you’re here.',
        alignment: 'left',
        maxWidth: 'narrow'
      })
    ]
  },
  {
    id: 'about-story',
    name: 'Brand story',
    description: 'Hero, image + text, gallery, values, and CTA.',
    category: 'about',
    sections: [
      s('hero', {
        title: 'Our story',
        subtitle: 'How it started, and where we’re going.',
        height: 'md',
        ctaLabel: ''
      }),
      s('imageText', {
        title: 'It started in a garage',
        body: 'What began as a weekend project turned into something bigger than we imagined. Today, we design and make products for thousands of customers around the world.',
        imagePosition: 'left'
      }),
      s('imageText', {
        title: 'Designed for the long haul',
        body: 'We believe good design should last. That means picking materials we can stand behind, and backing every product with a real guarantee.',
        imagePosition: 'right'
      }),
      s('gallery', { title: 'From the workshop' }),
      s('valueProps', { title: 'What we stand for' }),
      s('cta', {
        title: 'Come say hi',
        subtitle: 'We’d love to hear from you.',
        ctaLabel: 'Contact us',
        ctaUrl: '/p/contact'
      })
    ]
  },
  {
    id: 'about-team',
    name: 'Team & mission',
    description: 'Mission, founders, team photos, and values.',
    category: 'about',
    sections: [
      s('hero', {
        title: 'Meet the team',
        subtitle: 'The people behind the products.',
        height: 'md',
        ctaLabel: ''
      }),
      s('richText', {
        title: 'Our mission',
        body: 'To make beautifully designed products more accessible, while treating people and the planet with care.',
        alignment: 'center',
        maxWidth: 'narrow'
      }),
      s('imageText', {
        title: 'Founded by friends',
        body: 'We met in design school and stayed up too late debating what a well-made product should feel like. One prototype later, we were in business.',
        imagePosition: 'left'
      }),
      s('gallery', { title: 'The team' }),
      s('valueProps', { title: 'How we work' }),
      s('testimonials', { title: 'From the team' })
    ]
  },

  // ─── CONTACT ─────────────────────────────────────────────────────────
  {
    id: 'contact-simple',
    name: 'Simple contact',
    description: 'A friendly intro and your contact details.',
    category: 'contact',
    sections: [
      s('hero', {
        title: 'Get in touch',
        subtitle: 'We usually reply within one business day.',
        height: 'sm',
        ctaLabel: ''
      }),
      s('richText', {
        title: 'Contact us',
        body: 'Email: hello@yourstore.com\nPhone: +1 (555) 123-4567\nHours: Mon–Fri, 9am–5pm',
        alignment: 'left',
        maxWidth: 'narrow'
      }),
      s('newsletter', {
        title: 'Stay in the loop',
        subtitle: 'Occasional updates, never spam.'
      })
    ]
  },
  {
    id: 'contact-full',
    name: 'Contact with hours & location',
    description: 'Contact info, a location/hours block, and help links.',
    category: 'contact',
    sections: [
      s('hero', {
        title: 'Contact',
        subtitle: 'Questions, feedback, or partnerships — we’d love to hear from you.',
        height: 'sm',
        ctaLabel: ''
      }),
      s('imageText', {
        title: 'Visit the studio',
        body: '123 Example Street\nCity, State 00000\n\nMon–Fri · 10am–6pm\nSat · 11am–4pm',
        imagePosition: 'right'
      }),
      s('richText', {
        title: 'Other ways to reach us',
        body: 'Customer support: support@yourstore.com\nWholesale: wholesale@yourstore.com\nPress: press@yourstore.com',
        alignment: 'left',
        maxWidth: 'narrow'
      }),
      s('valueProps', { title: 'How we can help' }),
      s('cta', {
        title: 'Looking for order help?',
        subtitle: 'Check your order status or start a return.',
        ctaLabel: 'My account',
        ctaUrl: '/account'
      })
    ]
  },

  // ─── FAQ ─────────────────────────────────────────────────────────────
  {
    id: 'faq-simple',
    name: 'Simple FAQ',
    description: 'A clean list of answers to common questions.',
    category: 'faq',
    sections: [
      s('hero', {
        title: 'Frequently asked questions',
        subtitle: 'Answers to the things we hear most.',
        height: 'sm',
        ctaLabel: ''
      }),
      s('richText', {
        title: '',
        body:
          'Shipping\nOrders ship within 2 business days. Tracking is provided by email.\n\n' +
          'Returns\n30-day returns on unused items. Contact us to start a return.\n\n' +
          'Warranty\nAll products carry a 1-year limited warranty against manufacturing defects.\n\n' +
          'Support\nEmail support@yourstore.com and we’ll get back within 1 business day.',
        alignment: 'left',
        maxWidth: 'narrow'
      }),
      s('cta', {
        title: 'Still need help?',
        subtitle: 'Our support team is one email away.',
        ctaLabel: 'Contact us',
        ctaUrl: '/p/contact'
      })
    ]
  },
  {
    id: 'faq-help-center',
    name: 'Help center',
    description: 'Topic tiles, FAQ text, and a contact CTA.',
    category: 'faq',
    sections: [
      s('hero', {
        title: 'How can we help?',
        subtitle: 'Browse popular topics or reach out directly.',
        height: 'sm',
        ctaLabel: ''
      }),
      s('valueProps', { title: 'Popular topics' }),
      s('richText', {
        title: 'Frequently asked questions',
        body:
          'When will my order ship?\nMost orders ship within 2 business days.\n\n' +
          'Do you ship internationally?\nYes, to most countries. Rates are shown at checkout.\n\n' +
          'How do I return an item?\nEmail us within 30 days of delivery to start a return.',
        alignment: 'left',
        maxWidth: 'wide'
      }),
      s('cta', {
        title: 'Can’t find what you need?',
        subtitle: 'We’re happy to help in person.',
        ctaLabel: 'Contact support',
        ctaUrl: '/p/contact'
      })
    ]
  },

  // ─── LANDING / CAMPAIGN ──────────────────────────────────────────────
  {
    id: 'landing-campaign',
    name: 'Campaign landing',
    description: 'Focused page for a single promotion or launch.',
    category: 'landing',
    sections: [
      s('banner', { text: 'Limited edition — shipping this month' }),
      s('hero', {
        title: 'The Spring Collection',
        subtitle: 'A handful of pieces, made to last.',
        ctaLabel: 'Shop the drop',
        ctaTarget: 'products',
        height: 'lg'
      }),
      s('promoCards'),
      s('imageText', {
        title: 'Crafted in small batches',
        body: 'We only make what we can make well. That means limited quantities and a lot of attention per piece.'
      }),
      s('featuredProducts', { title: 'The collection', limit: 6 }),
      s('testimonials'),
      s('cta', {
        title: 'Be first next time',
        subtitle: 'Sign up for early access to our next drop.',
        ctaLabel: 'Get early access'
      }),
      s('newsletter')
    ]
  },
  {
    id: 'landing-coming-soon',
    name: 'Coming soon',
    description: 'Teaser page with an email signup.',
    category: 'landing',
    sections: [
      s('hero', {
        title: 'Something new is coming',
        subtitle: 'Be the first to know when it drops.',
        height: 'lg',
        ctaLabel: ''
      }),
      s('richText', {
        title: '',
        body: 'We’ve been working on something we’re really excited about. Drop your email below and we’ll let you know the moment it’s live.',
        alignment: 'center',
        maxWidth: 'narrow'
      }),
      s('newsletter', {
        title: 'Join the waitlist',
        subtitle: 'No spam — just one email when it’s ready.',
        buttonLabel: 'Notify me'
      })
    ]
  },
  {
    id: 'landing-everything',
    name: 'Kitchen sink',
    description: 'Every section at once — great for exploring what’s possible.',
    category: 'landing',
    sections: [
      s('banner'),
      s('heroSlider'),
      s('logos'),
      s('promoCards'),
      s('categoryGrid'),
      s('imageText'),
      s('featuredProducts'),
      s('gallery'),
      s('valueProps'),
      s('testimonials'),
      s('richText'),
      s('cta'),
      s('newsletter')
    ]
  }
];

/** Expand a preset into concrete StoreSection objects with unique ids. */
export function buildPresetSections(preset: SectionPreset): StoreSection[] {
  return preset.sections.map((spec) => {
    const section = createDefaultSection(spec.type);
    if (spec.config) {
      // Shallow merge override on top of the default config. Each section
      // variant has its own config shape so we cast through unknown.
      (section as { config: unknown }).config = {
        ...(section.config as Record<string, unknown>),
        ...spec.config
      };
    }
    return section;
  });
}

export function presetsByCategory(category: PresetCategory): SectionPreset[] {
  return SECTION_PRESETS.filter((p) => p.category === category);
}
