/*
 * Shared UI helpers for every page.
 * Back-to-top button: appears after scrolling down, scrolls smoothly to the top.
 */
(function () {
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "to-top";
  btn.setAttribute("aria-label", "Back to top");
  btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.body.appendChild(btn);

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function toggle() { btn.classList.toggle("is-visible", window.scrollY > 700); }
  window.addEventListener("scroll", toggle, { passive: true });
  toggle();

  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    // Move keyboard focus to the top of the page for screen reader and keyboard users
    var first = document.querySelector("h1");
    if (first) { first.setAttribute("tabindex", "-1"); first.focus({ preventScroll: true }); }
  });
})();

/*
 * Reading progress bar, project screenshot tilt, and the soft light that
 * follows the mouse on service cards.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // 1. Reading progress
  if (!reduce) {
    var bar = document.createElement("div");
    bar.className = "read-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    var ticking = false;
    function progress() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty("--p", max > 0 ? Math.min(window.scrollY / max, 1) : 0);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(progress); }
    }, { passive: true });
    progress();
  }

  if (reduce || !finePointer) return;

  // 2. Tilt screenshots toward the mouse (works for cards added later too)
  document.addEventListener("pointermove", function (e) {
    var shot = e.target.closest && e.target.closest(".card .shot");
    if (!shot) return;
    var r = shot.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    shot.classList.add("is-tilting");
    shot.style.transform = "perspective(800px) rotateY(" + (x * 6) + "deg) rotateX(" + (-y * 6) + "deg) translateY(-3px)";
  });
  document.addEventListener("pointerout", function (e) {
    var shot = e.target.closest && e.target.closest(".card .shot");
    if (!shot || shot.contains(e.relatedTarget)) return;
    shot.classList.remove("is-tilting");
    shot.style.transform = "";
  });

  // 3. Spotlight on service cards
  document.addEventListener("pointermove", function (e) {
    var card = e.target.closest && e.target.closest(".service");
    if (!card) return;
    var r = card.getBoundingClientRect();
    card.style.setProperty("--mx", (e.clientX - r.left) + "px");
    card.style.setProperty("--my", (e.clientY - r.top) + "px");
  });
})();

/*
 * Smooth scrolling on every page (Lenis, self-hosted in /data/js/vendor/).
 * Mouse wheel and trackpad scrolling glide smoothly, and in-page links like
 * #contact scroll to their section just below the fixed header.
 * Skipped for visitors who prefer reduced motion. Touch scrolling stays native.
 */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var css = document.createElement("link");
  css.rel = "stylesheet"; css.href = "/data/css/vendor/lenis.css";
  document.head.appendChild(css);

  var s = document.createElement("script");
  s.src = "/data/js/vendor/lenis.min.js";
  s.onload = function () {
    if (typeof Lenis === "undefined") return;
    var lenis = new Lenis({ autoRaf: true, lerp: 0.1, allowNestedScroll: true, stopInertiaOnNavigate: true });
    window.lenis = lenis;

    // Areas that scroll on their own keep their normal scrolling
    function protect() {
      Array.prototype.forEach.call(document.querySelectorAll("dialog, .modal-body, .mobile-nav, .menu, .chips, .table-wrap, .diff"), function (el) {
        el.setAttribute("data-lenis-prevent", "");
      });
    }
    protect();
    if (window.onIncludes) onIncludes(protect);

    // Sections already have scroll-margin-top in the CSS (room for the fixed header),
    // which Lenis respects, so no extra offset is needed here
    function goTo(hash, immediate) {
      var el = hash && hash.length > 1 && document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!el) return false;
      lenis.scrollTo(el, { immediate: !!immediate });
      return true;
    }

    // In-page links: smooth scroll with the right offset
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href*="#"]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      var url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      if (goTo(url.hash)) { e.preventDefault(); history.pushState(null, "", url.hash); }
    });

    // Arriving from another page with a #section in the address
    if (location.hash) {
      var land = function () { goTo(location.hash, true); };
      if (window.onIncludes) onIncludes(function () { setTimeout(land, 50); }); else setTimeout(land, 50);
    }

    // Pause smooth scrolling while a modal or the phone menu is open
    new MutationObserver(function () {
      var cls = document.documentElement.classList;
      if (cls.contains("modal-open") || cls.contains("nav-open")) lenis.stop(); else lenis.start();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  };
  document.head.appendChild(s);
})();
