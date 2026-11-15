/*
 * Homepage navigation: clicking a section link (the left menu, the phone section bar,
 * and in-page links like "See my projects") switches to that section like changing
 * screens, instead of scrolling through everything in between.
 *
 * The current view slides up and fades away, the page jumps straight to the section,
 * and the new view is wiped in from top to bottom with a glowing scan line riding the
 * edge. The sidebar and top bar stay perfectly still.
 * Browsers with the View Transitions API get a true crossfade; others get a quick
 * fade. With "reduce motion" on, it simply jumps.
 */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function targetFor(link) {
  const url = new URL(link.href, location.href);
  if (url.pathname !== location.pathname || !url.hash || url.hash === "#") return null;
  try {
    return document.querySelector(decodeURIComponent(url.hash));
  } catch {
    return null;
  }
}

function jumpTo(target, hash) {
  // "instant" overrides the page's smooth scrolling for this one jump
  target.scrollIntoView({ behavior: "instant", block: "start" });
  history.pushState(null, "", hash);
  // Move keyboard focus to the new section without scrolling again
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
}

export function initSectionSwitch() {
  const main = document.querySelector("main");
  let busy = false;

  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = e.target.closest && e.target.closest('a[href*="#"]');
    if (!link || link.closest("dialog")) return;
    const target = targetFor(link);
    if (!target) return;

    e.preventDefault();
    const hash = new URL(link.href, location.href).hash;
    if (busy) return;

    if (reduceMotion) {
      jumpTo(target, hash);
      return;
    }

    // Full effect where view transitions are supported
    if (document.startViewTransition) {
      busy = true;
      let scan = null;
      const transition = document.startViewTransition(() => {
        jumpTo(target, hash);
        // The scan line exists only in the new view, so it sweeps in with it
        scan = document.createElement("div");
        scan.className = "switch-scan";
        scan.setAttribute("aria-hidden", "true");
        document.body.appendChild(scan);
      });
      transition.finished.finally(() => {
        if (scan) scan.remove();
        busy = false;
      });
      return;
    }

    // Fallback: fade the content out, jump, and fade it back in
    busy = true;
    main.classList.add("is-switching-out");
    setTimeout(() => {
      jumpTo(target, hash);
      main.classList.remove("is-switching-out");
      main.classList.add("is-switching-in");
      setTimeout(() => {
        main.classList.remove("is-switching-in");
        busy = false;
      }, 380);
    }, 180);
  });
}
