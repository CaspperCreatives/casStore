import { Store, StoreSection } from '../../core/store.service';
import { StoreProduct } from '../../core/store-products.service';

/**
 * A demo storefront = a fake Store + fake products + a pre-built page of
 * real StoreSection configurations. These are rendered by DemoStorePage
 * using the *actual* section components the store editor uses, so visitors
 * see exactly what the platform can produce.
 */
export type DemoStore = {
  id: string;
  /** Short marketing descriptor shown on the demos index + demo header. */
  tagline: string;
  /** Local taxonomy label for the demo's overall style. */
  presetId: 'minimal' | 'retail' | 'brand' | 'launch' | 'full';
  store: Store;
  sections: StoreSection[];
  /** Demo products used by the featured-products section in this demo. */
  products: StoreProduct[];
  /** A thumbnail gradient shown on the demos index card (Tailwind-compatible CSS). */
  previewBg: string;
};

// ── Stable image URLs from picsum (no API key needed, always cached). ────────
const img = (seed: string, w = 1200, h = 800) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

const dollars = (n: number) => Math.round(n * 100);

// ═════════════════════════════════════════════════════════════════════════════
// 1. NOMA — Brand story (ceramics studio, editorial)
// ═════════════════════════════════════════════════════════════════════════════
const nomaStore: Store = {
  id: 'demo-noma',
  ownerId: 'demo',
  slug: 'noma',
  name: 'Noma',
  description: 'Hand-thrown ceramics from a small coastal studio.',
  category: 'Home',
  logoUrl: null,
  themeColor: '#1f2937',
  active: true,
  navItems: [
    { id: 'n1', kind: 'builtin', label: 'Shop', target: 'products', placement: 'both' },
    { id: 'n2', kind: 'url', label: 'Journal', url: '#', newTab: false, placement: 'header' },
    { id: 'n3', kind: 'url', label: 'Studio', url: '#', newTab: false, placement: 'both' }
  ]
};

const nomaProducts: StoreProduct[] = [
  { id: 'n-1', name: 'Stone Bowl', description: '', imageUrl: img('noma-1', 600, 600), priceCents: dollars(42), currency: 'USD', stock: 12, active: true },
  { id: 'n-2', name: 'Matte Vase', description: '', imageUrl: img('noma-2', 600, 600), priceCents: dollars(58), currency: 'USD', stock: 5, active: true },
  { id: 'n-3', name: 'Clay Mug', description: '', imageUrl: img('noma-3', 600, 600), priceCents: dollars(28), currency: 'USD', stock: 30, active: true },
  { id: 'n-4', name: 'Linen Plate', description: '', imageUrl: img('noma-4', 600, 600), priceCents: dollars(36), currency: 'USD', stock: 18, active: true }
];

const nomaSections: StoreSection[] = [
  {
    id: 'n-banner', type: 'banner', visible: true,
    config: { text: 'Spring drop — hand-numbered pieces, limited to 50.', ctaLabel: '', ctaUrl: '', background: '#f5f5f4' }
  },
  {
    id: 'n-hero', type: 'hero', visible: true,
    config: {
      title: 'Made slowly, by hand.',
      subtitle: 'Ceramics for a quieter table.',
      ctaLabel: 'Explore',
      ctaTarget: 'products', ctaUrl: '',
      backgroundImageUrl: img('noma-hero', 1800, 1200),
      backgroundOverlay: 30,
      alignment: 'left', verticalAlignment: 'bottom',
      height: 'lg', heightVh: 70
    }
  },
  {
    id: 'n-imagetext-1', type: 'imageText', visible: true,
    config: {
      title: 'A studio on the coast.',
      body: 'Every piece starts as a lump of local clay and ends in your home. We fire small batches, label them by hand, and keep the process unhurried on purpose.',
      imageUrl: img('noma-studio', 1000, 1000),
      imagePosition: 'left'
    }
  },
  {
    id: 'n-gallery', type: 'gallery', visible: true,
    config: {
      title: 'From the studio',
      images: [
        { url: img('noma-g-1', 800, 800), caption: '', linkUrl: '' },
        { url: img('noma-g-2', 800, 800), caption: '', linkUrl: '' },
        { url: img('noma-g-3', 800, 800), caption: '', linkUrl: '' },
        { url: img('noma-g-4', 800, 800), caption: '', linkUrl: '' },
        { url: img('noma-g-5', 800, 800), caption: '', linkUrl: '' },
        { url: img('noma-g-6', 800, 800), caption: '', linkUrl: '' }
      ]
    }
  },
  {
    id: 'n-featured', type: 'featuredProducts', visible: true,
    config: { title: 'Spring collection', productIds: [], limit: 4, layout: 'grid' }
  },
  {
    id: 'n-richtext', type: 'richText', visible: true,
    config: {
      title: 'On slowness',
      body: 'We don\'t make fast ceramics. Each mug sits in its own rhythm — thrown, trimmed, dried, glazed, fired, inspected. If that sounds like a lot of steps, that\'s because it is. And that\'s the point.',
      alignment: 'center',
      maxWidth: 'narrow'
    }
  },
  {
    id: 'n-testimonials', type: 'testimonials', visible: true,
    config: {
      title: 'From our customers',
      items: [
        { quote: 'It\'s the only mug my husband doesn\'t put in the dishwasher — that\'s the highest compliment in our house.', author: 'Ava Lin', role: 'Oakland, CA', avatarUrl: '' },
        { quote: 'Arrived wrapped in linen and a handwritten thank-you. I already ordered another.', author: 'Marc Duval', role: 'Montréal', avatarUrl: '' },
        { quote: 'The weight in the hand is different. You feel someone made this.', author: 'Priya Shah', role: 'London', avatarUrl: '' }
      ]
    }
  },
  {
    id: 'n-cta', type: 'cta', visible: true,
    config: {
      title: 'Join the studio list.',
      subtitle: 'Early access to new pieces, studio-only drops, and the occasional misfit sale.',
      ctaLabel: 'Sign up',
      ctaUrl: '#',
      backgroundImageUrl: img('noma-cta', 1800, 800)
    }
  },
  {
    id: 'n-newsletter', type: 'newsletter', visible: true,
    config: { title: 'Stay in the loop', subtitle: 'One short email, twice a month. No noise.', buttonLabel: 'Subscribe' }
  }
];

// ═════════════════════════════════════════════════════════════════════════════
// 2. SOL — Retail (streetwear)
// ═════════════════════════════════════════════════════════════════════════════
const solStore: Store = {
  id: 'demo-sol',
  ownerId: 'demo',
  slug: 'sol',
  name: 'Sol Supply',
  description: 'Everyday essentials, built to last.',
  category: 'Apparel',
  logoUrl: null,
  themeColor: '#0f172a',
  active: true,
  navItems: [
    { id: 's1', kind: 'builtin', label: 'Shop all', target: 'products', placement: 'both' },
    { id: 's2', kind: 'url', label: 'Men', url: '#', newTab: false, placement: 'header' },
    { id: 's3', kind: 'url', label: 'Women', url: '#', newTab: false, placement: 'header' },
    { id: 's4', kind: 'url', label: 'Sale', url: '#', newTab: false, placement: 'header' }
  ]
};

const solProducts: StoreProduct[] = [
  { id: 's-1', name: 'Heavy Tee — Bone', description: '', imageUrl: img('sol-1', 600, 600), priceCents: dollars(38), currency: 'USD', stock: 40, active: true },
  { id: 's-2', name: 'Cotton Hoodie — Olive', description: '', imageUrl: img('sol-2', 600, 600), priceCents: dollars(95), currency: 'USD', stock: 20, active: true },
  { id: 's-3', name: 'Wide Chinos', description: '', imageUrl: img('sol-3', 600, 600), priceCents: dollars(110), currency: 'USD', stock: 15, active: true },
  { id: 's-4', name: 'Canvas Jacket', description: '', imageUrl: img('sol-4', 600, 600), priceCents: dollars(165), currency: 'USD', stock: 8, active: true },
  { id: 's-5', name: 'Wool Cap', description: '', imageUrl: img('sol-5', 600, 600), priceCents: dollars(28), currency: 'USD', stock: 60, active: true },
  { id: 's-6', name: 'Stone Scarf', description: '', imageUrl: img('sol-6', 600, 600), priceCents: dollars(45), currency: 'USD', stock: 22, active: true },
  { id: 's-7', name: 'Canvas Tote', description: '', imageUrl: img('sol-7', 600, 600), priceCents: dollars(24), currency: 'USD', stock: 100, active: true },
  { id: 's-8', name: 'Leather Belt', description: '', imageUrl: img('sol-8', 600, 600), priceCents: dollars(75), currency: 'USD', stock: 30, active: true }
];

const solSections: StoreSection[] = [
  {
    id: 's-banner', type: 'banner', visible: true,
    config: { text: 'Free shipping over $80 · 30-day returns', ctaLabel: '', ctaUrl: '', background: '#0f172a' }
  },
  {
    id: 's-slider', type: 'heroSlider', visible: true,
    config: {
      slides: [
        { title: 'New season, old soul.', subtitle: 'Fall collection, now live.', ctaLabel: 'Shop now', ctaUrl: '#', imageUrl: img('sol-slide-1', 1800, 1000), backgroundOverlay: 35, alignment: 'left' },
        { title: 'Layers that last.', subtitle: 'Heavy cottons, honest wool, nothing thin.', ctaLabel: 'Browse', ctaUrl: '#', imageUrl: img('sol-slide-2', 1800, 1000), backgroundOverlay: 40, alignment: 'left' },
        { title: 'Built for weather.', subtitle: 'Canvas, denim, waxed cotton. Tested on us first.', ctaLabel: 'Explore', ctaUrl: '#', imageUrl: img('sol-slide-3', 1800, 1000), backgroundOverlay: 35, alignment: 'left' }
      ],
      autoPlay: true, intervalMs: 6000,
      height: 'lg', heightVh: 80,
      verticalAlignment: 'center'
    }
  },
  {
    id: 's-logos', type: 'logos', visible: true,
    config: {
      title: '',
      subtitle: 'As seen in',
      items: [
        { label: 'Hypebeast', imageUrl: '', linkUrl: '' },
        { label: 'Highsnobiety', imageUrl: '', linkUrl: '' },
        { label: 'Monocle', imageUrl: '', linkUrl: '' },
        { label: 'GQ', imageUrl: '', linkUrl: '' }
      ],
      style: 'muted', logoSize: 28, labelSize: 12, itemLayout: 'horizontal'
    }
  },
  {
    id: 's-promo', type: 'promoCards', visible: true,
    config: {
      title: '',
      cards: [
        { label: 'NEW', title: 'Fall drop, shop it first', description: '', ctaUrl: '#', icon: 'Sparkles' },
        { label: 'SALE', title: 'Up to 40% off summer', description: '', ctaUrl: '#', icon: 'Tag' },
        { label: 'BUNDLE', title: 'Starter kit — save 15%', description: '', ctaUrl: '#', icon: 'Package' }
      ],
      columns: 3
    }
  },
  {
    id: 's-category', type: 'categoryGrid', visible: true,
    config: {
      title: 'Shop by category',
      categories: [
        { label: 'Outerwear', imageUrl: img('sol-cat-1', 600, 450), productFilter: 'outerwear' },
        { label: 'Tops', imageUrl: img('sol-cat-2', 600, 450), productFilter: 'tops' },
        { label: 'Bottoms', imageUrl: img('sol-cat-3', 600, 450), productFilter: 'bottoms' },
        { label: 'Accessories', imageUrl: img('sol-cat-4', 600, 450), productFilter: 'accessories' }
      ]
    }
  },
  {
    id: 's-featured', type: 'featuredProducts', visible: true,
    config: { title: 'Bestsellers', productIds: [], limit: 8, layout: 'grid' }
  },
  {
    id: 's-imagetext', type: 'imageText', visible: true,
    config: {
      title: 'Built to last a decade, not a season.',
      body: 'We spec our garments like tools: heavy weights, reinforced seams, hardware that won\'t oxidize. Trends come and go. Your jacket shouldn\'t.',
      imageUrl: img('sol-imagetext', 1000, 1000),
      imagePosition: 'right'
    }
  },
  {
    id: 's-values', type: 'valueProps', visible: true,
    config: {
      title: '',
      items: [
        { icon: 'BadgeCheck', title: 'Quality first', description: 'Heavier fabrics, better finishing.' },
        { icon: 'Truck', title: 'Fast shipping', description: 'Tracked delivery on every order.' },
        { icon: 'ShieldCheck', title: 'Secure checkout', description: 'Encrypted payments, no data resale.' },
        { icon: 'PackageCheck', title: 'Easy returns', description: '30 days, no questions asked.' }
      ],
      background: 'muted'
    }
  },
  {
    id: 's-testimonials', type: 'testimonials', visible: true,
    config: {
      title: 'What customers are saying',
      items: [
        { quote: 'The jacket is heavy in the best way. Feels like something you\'d inherit.', author: 'Jordan K.', role: 'Verified buyer', avatarUrl: '' },
        { quote: 'Fit runs true, shoulders sit right. I bought a second in black.', author: 'Mei T.', role: 'Verified buyer', avatarUrl: '' },
        { quote: 'I was skeptical at this price point. Wasn\'t skeptical long.', author: 'Liam R.', role: 'Verified buyer', avatarUrl: '' }
      ]
    }
  },
  {
    id: 's-newsletter', type: 'newsletter', visible: true,
    config: { title: 'Get 10% off your first order', subtitle: 'Drop your email — no spam, just drops and restocks.', buttonLabel: 'Get my code' }
  }
];

// ═════════════════════════════════════════════════════════════════════════════
// 3. AURA — Product launch (single skincare drop)
// ═════════════════════════════════════════════════════════════════════════════
const auraStore: Store = {
  id: 'demo-aura',
  ownerId: 'demo',
  slug: 'aura',
  name: 'Aura Labs',
  description: 'Clean skincare that actually works.',
  category: 'Beauty',
  logoUrl: null,
  themeColor: '#065f46',
  active: true,
  navItems: [
    { id: 'a1', kind: 'builtin', label: 'Shop', target: 'products', placement: 'both' },
    { id: 'a2', kind: 'url', label: 'Science', url: '#', newTab: false, placement: 'header' },
    { id: 'a3', kind: 'url', label: 'Journal', url: '#', newTab: false, placement: 'header' }
  ]
};

const auraProducts: StoreProduct[] = [
  { id: 'a-1', name: 'Glow Serum', description: 'Daily vitamin-C brightener.', imageUrl: img('aura-1', 600, 600), priceCents: dollars(48), currency: 'USD', stock: 200, active: true },
  { id: 'a-2', name: 'Night Oil', description: '', imageUrl: img('aura-2', 600, 600), priceCents: dollars(54), currency: 'USD', stock: 180, active: true },
  { id: 'a-3', name: 'Gentle Cleanser', description: '', imageUrl: img('aura-3', 600, 600), priceCents: dollars(32), currency: 'USD', stock: 250, active: true }
];

const auraSections: StoreSection[] = [
  {
    id: 'a-banner', type: 'banner', visible: true,
    config: { text: 'Launching today — free travel size with every order this week.', ctaLabel: 'Claim', ctaUrl: '#', background: '#ecfccb' }
  },
  {
    id: 'a-hero', type: 'hero', visible: true,
    config: {
      title: 'Glow Serum.',
      subtitle: 'Six ingredients. One bottle. Two weeks to brighter skin.',
      ctaLabel: 'Shop the drop',
      ctaTarget: 'products', ctaUrl: '',
      backgroundImageUrl: img('aura-hero', 1800, 1200),
      backgroundOverlay: 25,
      alignment: 'center', verticalAlignment: 'center',
      height: 'lg', heightVh: 80
    }
  },
  {
    id: 'a-promo', type: 'promoCards', visible: true,
    config: {
      title: '',
      cards: [
        { label: 'DROP 01', title: 'Glow Serum — $48', description: 'Vitamin C, peptides, squalane.', ctaUrl: '#', icon: 'Sparkles' },
        { label: 'BUNDLE', title: 'Full routine — save 20%', description: 'Serum · Oil · Cleanser.', ctaUrl: '#', icon: 'Package' },
        { label: 'LIMITED', title: '500 bottles this month', description: 'Restocks every 30 days.', ctaUrl: '#', icon: 'Tag' }
      ],
      columns: 3
    }
  },
  {
    id: 'a-featured', type: 'featuredProducts', visible: true,
    config: { title: 'The routine', productIds: [], limit: 3, layout: 'grid' }
  },
  {
    id: 'a-values', type: 'valueProps', visible: true,
    config: {
      title: '',
      items: [
        { icon: 'Leaf', title: 'Clean formula', description: 'No parabens, sulphates, or filler.' },
        { icon: 'BadgeCheck', title: 'Dermatologist tested', description: 'Reviewed by board-certified derms.' },
        { icon: 'Truck', title: 'Ships in 48h', description: 'From our lab, directly to you.' },
        { icon: 'ShieldCheck', title: '60-day return', description: 'Love it or send it back.' }
      ],
      background: 'white'
    }
  },
  {
    id: 'a-imagetext', type: 'imageText', visible: true,
    config: {
      title: 'Six ingredients. No filler.',
      body: 'Most serums list 40 ingredients to sound complex. Ours lists six because that\'s all your skin needs. We publish full concentrations — no percentages hidden behind "proprietary".',
      imageUrl: img('aura-imagetext', 1000, 1000),
      imagePosition: 'left'
    }
  },
  {
    id: 'a-cta', type: 'cta', visible: true,
    config: {
      title: 'The drop ends Sunday.',
      subtitle: 'Order now to get the launch gift.',
      ctaLabel: 'Claim yours',
      ctaUrl: '#',
      backgroundImageUrl: img('aura-cta', 1800, 800)
    }
  }
];

// ═════════════════════════════════════════════════════════════════════════════
// 4. BLOOM — Minimal (flower studio)
// ═════════════════════════════════════════════════════════════════════════════
const bloomStore: Store = {
  id: 'demo-bloom',
  ownerId: 'demo',
  slug: 'bloom',
  name: 'Bloom Studio',
  description: 'Seasonal flowers, delivered weekly.',
  category: 'Florist',
  logoUrl: null,
  themeColor: '#be185d',
  active: true,
  navItems: [
    { id: 'b1', kind: 'builtin', label: 'Subscribe', target: 'products', placement: 'both' },
    { id: 'b2', kind: 'url', label: 'Gifts', url: '#', newTab: false, placement: 'header' }
  ]
};

const bloomProducts: StoreProduct[] = [
  { id: 'b-1', name: 'Weekly Bouquet — Small', description: '', imageUrl: img('bloom-1', 600, 600), priceCents: dollars(32), currency: 'USD', stock: 50, active: true },
  { id: 'b-2', name: 'Weekly Bouquet — Large', description: '', imageUrl: img('bloom-2', 600, 600), priceCents: dollars(58), currency: 'USD', stock: 30, active: true },
  { id: 'b-3', name: 'Gift Card', description: '', imageUrl: img('bloom-3', 600, 600), priceCents: dollars(50), currency: 'USD', stock: 999, active: true }
];

const bloomSections: StoreSection[] = [
  {
    id: 'b-hero', type: 'hero', visible: true,
    config: {
      title: 'This week\'s flowers, at your door.',
      subtitle: 'Seasonal arrangements from local growers. Pause, skip, cancel anytime.',
      ctaLabel: 'Start subscription',
      ctaTarget: 'products', ctaUrl: '',
      backgroundImageUrl: img('bloom-hero', 1800, 1200),
      backgroundOverlay: 20,
      alignment: 'left', verticalAlignment: 'center',
      height: 'lg', heightVh: 70
    }
  },
  {
    id: 'b-featured', type: 'featuredProducts', visible: true,
    config: { title: 'Subscriptions & gifts', productIds: [], limit: 3, layout: 'grid' }
  },
  {
    id: 'b-newsletter', type: 'newsletter', visible: true,
    config: { title: 'Flower notes', subtitle: 'A weekly email about what\'s in season and how to keep it fresh.', buttonLabel: 'Subscribe' }
  }
];

// ═════════════════════════════════════════════════════════════════════════════
// Registry
// ═════════════════════════════════════════════════════════════════════════════
export const DEMO_STORES: DemoStore[] = [
  {
    id: 'noma',
    tagline: 'Editorial brand story for a ceramics studio',
    presetId: 'brand',
    store: nomaStore,
    sections: nomaSections,
    products: nomaProducts,
    previewBg: 'linear-gradient(135deg,#e7e5e4 0%,#a8a29e 100%)'
  },
  {
    id: 'sol',
    tagline: 'Full retail storefront with catalog, slider & categories',
    presetId: 'retail',
    store: solStore,
    sections: solSections,
    products: solProducts,
    previewBg: 'linear-gradient(135deg,#1e293b 0%,#0f172a 100%)'
  },
  {
    id: 'aura',
    tagline: 'Single-product launch page with bundles & CTAs',
    presetId: 'launch',
    store: auraStore,
    sections: auraSections,
    products: auraProducts,
    previewBg: 'linear-gradient(135deg,#d1fae5 0%,#10b981 100%)'
  },
  {
    id: 'bloom',
    tagline: 'Minimal subscription starter — just what you need',
    presetId: 'minimal',
    store: bloomStore,
    sections: bloomSections,
    products: bloomProducts,
    previewBg: 'linear-gradient(135deg,#fce7f3 0%,#db2777 100%)'
  }
];

export function findDemoStore(id: string): DemoStore | undefined {
  return DEMO_STORES.find((d) => d.id === id);
}
