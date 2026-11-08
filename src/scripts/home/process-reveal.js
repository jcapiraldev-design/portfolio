/*
 * How I work: reveal the steps one after another when the section scrolls into view.
 */
export function initProcessReveal() {
  var process = document.querySelector(".process");
  if (!process || !("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  Array.prototype.forEach.call(process.querySelectorAll(".process-steps li"), function (li, i) {
    li.style.setProperty("--i", i);
  });
  process.classList.add("will-animate");
  var io = new IntersectionObserver(
    function (entries) {
      if (entries[0].isIntersecting) {
        process.classList.add("is-visible");
        io.disconnect();
      }
    },
    { threshold: 0.25 },
  );
  io.observe(process);
}
