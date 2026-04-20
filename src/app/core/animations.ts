import { gsap } from 'gsap';

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
