import { useState, useEffect, useRef, RefObject } from "react";

export default function useReveal(threshold = 0.12): [RefObject<HTMLElement>, boolean] {
  const ref = useRef<HTMLElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVis(true);
          obs.unobserve(el);
        }
      },
      { threshold }
    );

    obs.observe(el);

    return () => obs.disconnect();
  }, [threshold]);

  return [ref, vis];
}
