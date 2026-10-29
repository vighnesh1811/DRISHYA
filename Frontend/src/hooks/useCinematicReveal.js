import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function useCinematicReveal(options = {}) {
  const scope = useRef(null);
  const { selector = '[data-reveal]', delay = 0, y = 28 } = options;

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(scope.current?.querySelectorAll(selector) || [], { clearProps: 'all' });
      return undefined;
    }

    const context = gsap.context(() => {
      gsap.fromTo(selector,
        { autoAlpha: 0, y },
        { autoAlpha: 1, y: 0, duration: .8, delay, stagger: .1, ease: 'power3.out' }
      );
    }, scope);
    return () => context.revert();
  }, [delay, selector, y]);

  return scope;
}
