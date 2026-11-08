/*
 * Back-to-top button: appears after scrolling down, scrolls smoothly to the top.
 */
export function initBackToTop() {
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
}
