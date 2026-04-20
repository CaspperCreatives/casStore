import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let scrollTriggerRegistered = false;

function ensureScrollTrigger(): typeof ScrollTrigger | null {
  if (typeof window === 'undefined') return null;
  if (!scrollTriggerRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    scrollTriggerRegistered = true;

    // Images loading late (hero banners, product shots, etc.) shift the
    // page and can leave triggers with stale positions. Refresh once all
    // initial assets have loaded so start/end points stay accurate.
    if (document.readyState === 'complete') {
      ScrollTrigger.refresh();
    } else {
      window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
    }
  }
  return ScrollTrigger;
}

/**
 * Shared GSAP motion tokens. Keeps every surface feeling consistent
 * and easy to tweak from one place.
 */
export const motion = {
  ease: {
    out: 'power3.out',
    in: 'power2.in',
    inOut: 'power2.inOut'
  },
  duration: {
    fast: 0.2,
    base: 0.3,
    drawer: 0.36
  },
  stagger: 0.035
} as const;

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Subtle staggered intro for a list of sidebar items.
 * Call from `afterNextRender` or `ngAfterViewInit` so the container
 * is in the DOM.
 */
export function animateSidebarIntro(container: HTMLElement | null | undefined): void {
  if (!container) return;
  const items = container.querySelectorAll<HTMLElement>('[data-anim="nav-item"]');
  if (items.length === 0) return;

  if (prefersReducedMotion()) {
    gsap.set(items, { clearProps: 'all', opacity: 1, x: 0 });
    return;
  }

  gsap.fromTo(
    items,
    { opacity: 0, x: -8 },
    {
      opacity: 1,
      x: 0,
      duration: motion.duration.base,
      ease: motion.ease.out,
      stagger: motion.stagger,
      clearProps: 'transform'
    }
  );
}

/**
 * Slide-in animation for a mobile drawer. Animates both the backdrop
 * fade and the panel sliding in from the left, then staggers the
 * inner nav items.
 */
export function animateDrawerOpen(panel: HTMLElement, backdrop: HTMLElement): void {
  const items = panel.querySelectorAll<HTMLElement>('[data-anim="nav-item"]');

  if (prefersReducedMotion()) {
    gsap.set(backdrop, { opacity: 1 });
    gsap.set(panel, { xPercent: 0 });
    gsap.set(items, { opacity: 1, x: 0 });
    return;
  }

  gsap.killTweensOf([panel, backdrop, items]);

  const tl = gsap.timeline({ defaults: { ease: motion.ease.out } });
  tl.fromTo(
    backdrop,
    { opacity: 0 },
    { opacity: 1, duration: motion.duration.fast }
  );
  tl.fromTo(
    panel,
    { xPercent: -100 },
    { xPercent: 0, duration: motion.duration.drawer },
    0
  );
  if (items.length > 0) {
    tl.fromTo(
      items,
      { opacity: 0, x: -10 },
      {
        opacity: 1,
        x: 0,
        duration: motion.duration.base,
        stagger: motion.stagger,
        clearProps: 'transform'
      },
      '-=0.18'
    );
  }
}

/**
 * Slide-out animation for a mobile drawer. Resolves the returned promise
 * once the exit animation completes so the caller can unmount safely.
 */
export function animateDrawerClose(
  panel: HTMLElement,
  backdrop: HTMLElement
): Promise<void> {
  if (prefersReducedMotion()) {
    return Promise.resolve();
  }

  gsap.killTweensOf([panel, backdrop]);

  return new Promise((resolve) => {
    const tl = gsap.timeline({
      defaults: { ease: motion.ease.in },
      onComplete: () => resolve()
    });
    tl.to(backdrop, { opacity: 0, duration: motion.duration.fast });
    tl.to(panel, { xPercent: -100, duration: motion.duration.base }, 0);
  });
}

/**
 * Attach a one-shot scroll-triggered reveal to a storefront section.
 *
 * The section fades up into place the first time it scrolls into view.
 * Returns a cleanup function the caller should invoke on destroy.
 */
export function registerSectionReveal(el: HTMLElement | null | undefined): () => void {
  if (!el) return () => {};

  const ST = ensureScrollTrigger();

  if (prefersReducedMotion() || !ST) {
    gsap.set(el, { clearProps: 'all', opacity: 1, y: 0 });
    return () => {};
  }

  gsap.set(el, { opacity: 0, y: 28 });

  const trigger = ST.create({
    trigger: el,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: motion.ease.out,
        clearProps: 'transform'
      });
    }
  });

  return () => {
    trigger.kill();
  };
}

/**
 * Refresh ScrollTrigger positions. Useful after layout-impacting changes
 * such as a page's sections loading asynchronously or images resolving.
 */
export function refreshScrollTriggers(): void {
  const ST = ensureScrollTrigger();
  ST?.refresh();
}

/**
 * Scroll-triggered stagger reveal for a grid/list of items (product cards,
 * gallery tiles, etc.). Items already in the viewport fade in immediately
 * as a group, and subsequent rows animate in as the user scrolls.
 *
 * Pass a container and a selector for the items to animate. Returns a
 * cleanup function to dispose the triggers.
 */
export function registerBatchReveal(
  container: HTMLElement | null | undefined,
  itemSelector: string
): () => void {
  if (!container) return () => {};

  const ST = ensureScrollTrigger();
  const items = Array.from(container.querySelectorAll<HTMLElement>(itemSelector));
  if (items.length === 0) return () => {};

  if (prefersReducedMotion() || !ST) {
    gsap.set(items, { clearProps: 'all', opacity: 1, y: 0 });
    return () => {};
  }

  gsap.set(items, { opacity: 0, y: 24 });

  const triggers = ST.batch(items, {
    start: 'top 90%',
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: motion.ease.out,
        stagger: 0.07,
        overwrite: true,
        clearProps: 'transform'
      })
  });

  return () => {
    triggers.forEach((t) => t.kill());
  };
}

/**
 * Simple on-mount fade-up intro for a single hero/header element.
 * No scroll trigger — plays once right after the element mounts.
 */
export function animateHeaderIntro(el: HTMLElement | null | undefined): void {
  if (!el) return;
  if (prefersReducedMotion()) {
    gsap.set(el, { clearProps: 'all', opacity: 1, y: 0 });
    return;
  }
  gsap.fromTo(
    el,
    { opacity: 0, y: 16 },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: motion.ease.out,
      clearProps: 'transform'
    }
  );
}
