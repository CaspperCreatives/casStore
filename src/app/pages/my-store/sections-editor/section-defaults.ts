import { SectionType, StoreSection } from '../../../core/store.service';

/** Factory producing a default-config instance for each section type. */
export function createDefaultSection(type: SectionType): StoreSection {
  const id = `sec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  switch (type) {
    case 'hero':
      return {
        id, type, visible: true,
        config: {
          title: 'Welcome to our store',
          subtitle: 'Discover something new today',
          ctaLabel: 'Shop now',
          ctaTarget: 'products',
          ctaUrl: '',
          backgroundImageUrl: '',
          backgroundOverlay: 40,
          alignment: 'center',
          height: 'md'
        }
      };
    case 'banner':
      return {
        id, type, visible: true,
        config: { text: 'Free shipping on orders over $50', ctaLabel: '', ctaUrl: '', background: '#fef3c7' }
      };
    case 'featuredProducts':
      return {
        id, type, visible: true,
        config: { title: 'Featured products', productIds: [], limit: 8, layout: 'grid' }
      };
    case 'imageText':
      return {
        id, type, visible: true,
        config: { title: 'Our story', body: 'Tell your customers what makes your brand unique.', imageUrl: '', imagePosition: 'left' }
      };
    case 'gallery':
      return {
        id, type, visible: true,
        config: { title: 'Gallery', images: [] }
      };
    case 'newsletter':
      return {
        id, type, visible: true,
        config: { title: 'Stay in the loop', subtitle: 'Get updates on new products and sales.', buttonLabel: 'Subscribe' }
      };
    case 'testimonials':
      return {
        id, type, visible: true,
        config: { title: 'What our customers say', items: [] }
      };
    case 'categoryGrid':
      return {
        id, type, visible: true,
        config: { title: 'Shop by category', categories: [] }
      };
    case 'cta':
      return {
        id, type, visible: true,
        config: { title: 'Ready to start?', subtitle: '', ctaLabel: 'Shop now', ctaUrl: '', backgroundImageUrl: '' }
      };
    case 'heroSlider':
      return {
        id, type, visible: true,
        config: {
          slides: [
            { title: 'Original design', subtitle: 'Discover the latest pieces from our catalog.', ctaLabel: 'Shop now', ctaUrl: '', imageUrl: '', backgroundOverlay: 40, alignment: 'left' },
            { title: 'New collection', subtitle: 'Crafted for everyday use, designed to last.', ctaLabel: 'Browse', ctaUrl: '', imageUrl: '', backgroundOverlay: 40, alignment: 'left' }
          ],
          autoPlay: true,
          intervalMs: 6000,
          height: 'lg'
        }
      };
    case 'logos':
      return {
        id, type, visible: true,
        config: {
          title: '',
          subtitle: '',
          items: [
            { label: 'Good Design', imageUrl: '', linkUrl: '' },
            { label: 'Japan Design Award', imageUrl: '', linkUrl: '' },
            { label: 'Product Design', imageUrl: '', linkUrl: '' },
            { label: 'Dutch Design Award', imageUrl: '', linkUrl: '' }
          ],
          style: 'muted'
        }
      };
    case 'promoCards':
      return {
        id, type, visible: true,
        config: {
          title: '',
          cards: [
            { label: 'NEW', title: 'Fresh arrivals every week', description: '', ctaUrl: '', icon: 'Sparkles' },
            { label: 'SALE', title: 'Limited-time offers', description: '', ctaUrl: '', icon: 'Tag' },
            { label: 'BUNDLE', title: 'Save on curated sets', description: '', ctaUrl: '', icon: 'Package' }
          ],
          columns: 3
        }
      };
    case 'valueProps':
      return {
        id, type, visible: true,
        config: {
          title: '',
          items: [
            { icon: 'BadgeCheck', title: 'Quality materials', description: 'Curated finishes and durable surfaces made for daily use.' },
            { icon: 'ShieldCheck', title: 'Secure checkout', description: 'Protected payments and privacy-first account handling.' },
            { icon: 'Truck', title: 'Fast shipping', description: 'Reliable delivery with tracking on every order.' },
            { icon: 'PackageCheck', title: 'Easy returns', description: 'Simple returns process for peace of mind.' }
          ],
          background: 'muted'
        }
      };
    case 'richText':
      return {
        id, type, visible: true,
        config: {
          title: 'About us',
          body: 'Write a short paragraph about your brand, values, or mission.',
          alignment: 'left',
          maxWidth: 'narrow'
        }
      };
  }
}

export const SECTION_TYPE_META: Record<SectionType, { label: string; description: string; icon: string }> = {
  hero:             { label: 'Hero',              description: 'Large banner with title, subtitle, and call to action.', icon: 'Image' },
  heroSlider:       { label: 'Hero slider',       description: 'Rotating carousel of hero slides with arrows.',           icon: 'GalleryHorizontalEnd' },
  banner:           { label: 'Announcement bar',  description: 'Thin top strip with text and optional link.',             icon: 'Megaphone' },
  featuredProducts: { label: 'Featured products', description: 'Grid or carousel of products from your catalog.',         icon: 'Package' },
  imageText:        { label: 'Image + Text',      description: 'Side-by-side image and rich text column.',                icon: 'LayoutPanelLeft' },
  gallery:          { label: 'Gallery',           description: 'Grid of images with optional captions.',                  icon: 'Images' },
  newsletter:       { label: 'Newsletter',        description: 'Email signup form.',                                      icon: 'Mail' },
  testimonials:     { label: 'Testimonials',      description: 'Customer quotes with avatar and role.',                   icon: 'Quote' },
  categoryGrid:     { label: 'Category grid',     description: 'Visual tiles linking to categories.',                     icon: 'LayoutGrid' },
  cta:              { label: 'CTA banner',        description: 'Full-width call to action.',                              icon: 'Sparkles' },
  logos:            { label: 'Logos / awards',    description: 'Row of partner, press, or award logos.',                  icon: 'Award' },
  promoCards:       { label: 'Promo cards',       description: 'Short labelled cards (NEW / SALE / BUNDLE).',             icon: 'LayoutList' },
  valueProps:       { label: 'Value props',       description: 'Icon + title + description strip of benefits.',           icon: 'Sparkle' },
  richText:         { label: 'Rich text',         description: 'A simple text-only block for stories or copy.',           icon: 'Type' }
};
