/*
 * Pauses decorative animations while they're off screen (for example the footer's
 * logo strip, or the homepage wall on phones once you've scrolled past it), so the
 * browser does less work and phones save battery.
 */
export function initPauseOffscreen() {
  if (!("IntersectionObserver" in window)) return;
  var items = document.querySelectorAll(".stack-strip, .intro-visual");
  if (!items.length) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      entry.target.classList.toggle("is-paused", !entry.isIntersecting);
    });
  });
  Array.prototype.forEach.call(items, function (el) {
    io.observe(el);
  });
}
