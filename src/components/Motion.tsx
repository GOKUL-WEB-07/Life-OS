import { useEffect } from "react";
import { useLocation } from "react-router-dom";
export function Motion() {
  const location = useLocation();
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const main = document.getElementById("main-content");
    if (!main) return;
    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06 },
    );
    const discover = () =>
      main
        .querySelectorAll(
          ".panel,.collection-card,.life-project,.record-card,.home-projects",
        )
        .forEach((el, i) => {
          if (seen.has(el)) return;
          seen.add(el);
          el.classList.add("scroll-reveal");
          (el as HTMLElement).style.setProperty(
            "--reveal-delay",
            Math.min((i % 3) * 55, 110) + "ms",
          );
          observer.observe(el);
        });
    discover();
    const mutations = new MutationObserver(discover);
    mutations.observe(main, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [location.pathname]);
  return null;
}
