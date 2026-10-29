import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';

export default function PageTransition({ children }) {
  const location = useLocation();
  const main = useRef(null);

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(main.current, { clearProps: 'all' });
      return undefined;
    }
    const cleanups = [];
    const context = gsap.context(() => {
      const page = main.current;
      const headings = page.querySelectorAll('h1, h2');
      const reveals = page.querySelectorAll('.eyebrow, .muted-copy, .btn, .text-link, .equipment-card, .booking-card, .stat-card, .admin-list-item, .public-values article');
      const images = page.querySelectorAll('.hero-image, .feature-image img, .public-feature-image img, .contact-image img, .equipment-image img');
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      intro.fromTo(page, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .4 });
      if (headings.length) intro.fromTo(headings, { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: .7, stagger: .08 }, '-=.15');
      if (reveals.length) intro.fromTo(reveals, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: .5, stagger: .035 }, '-=.4');
      if (images.length) gsap.fromTo(images, { scale: 1.06 }, { scale: 1, duration: 1.2, ease: 'power2.out', stagger: .05 });

      page.querySelectorAll('.btn, .text-link, .category-tile, .equipment-card').forEach((element) => {
        const onEnter = () => gsap.to(element, { y: -3, duration: .25, overwrite: true, ease: 'power2.out' });
        const onLeave = () => gsap.to(element, { y: 0, duration: .35, overwrite: true, ease: 'power2.out' });
        element.addEventListener('mouseenter', onEnter);
        element.addEventListener('mouseleave', onLeave);
        cleanups.push(() => { element.removeEventListener('mouseenter', onEnter); element.removeEventListener('mouseleave', onLeave); });
      });
    }, main);
    return () => {
      cleanups.forEach((cleanup) => cleanup());
      context.revert();
    };
  }, [location.pathname]);

  return <div ref={main}>{children}</div>;
}
