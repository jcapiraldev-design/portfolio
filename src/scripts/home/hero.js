/*
 * Intro: headline words rise in, and the stats count up.
 * (The project screenshots are shown by the wall, see wall.js.)
 */

export function initHero() {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1. Split the headline into words for a staggered entrance (text stays readable without JS)
  var title = document.querySelector(".hero-title");
  if (title && !reduce) {
    var words = title.textContent.trim().split(/\s+/);
    title.setAttribute("aria-label", title.textContent.trim());
    title.innerHTML = words
      .map(function (w, i) {
        return '<span class="w" aria-hidden="true" style="--d:' + i * 55 + 'ms">' + w + "</span>";
      })
      .join(" ");
    document.documentElement.classList.add("hero-ready");
  }

  // 2. Count-up numbers
  if (!reduce) {
    Array.prototype.forEach.call(document.querySelectorAll(".hero-stats dd[data-count]"), function (el) {
      var end = +el.getAttribute("data-count"),
        suffix = el.getAttribute("data-suffix") || "",
        t0 = null,
        dur = 1400;
      el.textContent = "0" + suffix;
      function step(t) {
        if (!t0) t0 = t;
        var k = Math.min((t - t0) / dur, 1),
          eased = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(end * eased) + suffix;
        if (k < 1) requestAnimationFrame(step);
      }
      setTimeout(function () {
        requestAnimationFrame(step);
      }, 500);
    });
  }
}
