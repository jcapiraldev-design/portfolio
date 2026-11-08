/*
 * Skills scroll reveal: tags fade and rise in once when the section comes into view.
 */
export function initSkillsReveal() {
  var groups = document.querySelector("#skills .skill-groups");
  if (!groups || !("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  groups.classList.add("will-reveal");
  Array.prototype.forEach.call(groups.querySelectorAll(".skills"), function (list) {
    Array.prototype.forEach.call(list.children, function (li, i) {
      li.style.setProperty("--i", Math.min(i, 24));
    });
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { groups.classList.add("is-visible"); io.disconnect(); }
    });
  }, { threshold: 0.15 });
  io.observe(groups);
}
