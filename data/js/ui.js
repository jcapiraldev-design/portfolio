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