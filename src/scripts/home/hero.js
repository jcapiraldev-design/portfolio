/*
 * Intro: headline words rise in, stats count up, and project screenshots cycle
 * in a stacked window view.
 */
import { projects } from "../data/projects.js";

export function initHero() {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1. Split the headline into words for a staggered entrance (text stays readable without JS)
  var title = document.querySelector(".hero-title");
  if (title && !reduce) {
    var words = title.textContent.trim().split(/\s+/);
    title.setAttribute("aria-label", title.textContent.trim());
    title.innerHTML = words.map(function (w, i) {
      return '<span class="w" aria-hidden="true" style="--d:' + (i * 55) + 'ms">' + w + '</span>';
    }).join(" ");
    document.documentElement.classList.add("hero-ready");
  }

  // 2. Count-up numbers
  if (!reduce) {
    Array.prototype.forEach.call(document.querySelectorAll(".hero-stats dd[data-count]"), function (el) {
      var end = +el.getAttribute("data-count"), suffix = el.getAttribute("data-suffix") || "", t0 = null, dur = 1400;
      el.textContent = "0" + suffix;
      function step(t) {
        if (!t0) t0 = t;
        var k = Math.min((t - t0) / dur, 1), eased = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(end * eased) + suffix;
        if (k < 1) requestAnimationFrame(step);
      }
      setTimeout(function () { requestAnimationFrame(step); }, 500);
    });
  }

  // 3. Screenshot stack from featured projects
  var stack = document.getElementById("hero-stack");
  if (!stack) return;
  var picks = projects.filter(function (p) { return p.featured && p.image; }).slice(0, 6);
  if (picks.length < 3) picks = projects.filter(function (p) { return p.image; }).slice(0, 6);
  function host(u) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return ""; } }
  stack.innerHTML = picks.map(function (p) {
    return '<figure class="hero-win"><div class="hero-bar"><i></i><i></i><i></i><span>' + host(p.url) +
      '</span></div><img src="' + p.image + '" alt="" loading="eager" decoding="async"></figure>';
  }).join("");
  var wins = Array.prototype.slice.call(stack.children), front = 0;
  function place() {
    wins.forEach(function (w, i) {
      var pos = (i - front + wins.length) % wins.length;
      w.setAttribute("data-pos", pos > 2 ? "hidden" : pos);
    });
  }
  place();
  if (reduce || wins.length < 2) return;
  setInterval(function () {
    if (document.hidden) return;
    front = (front + 1) % wins.length;
    place();
  }, 3200);
}
