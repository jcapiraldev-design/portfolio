/*
 * Highlights the current section in the left menu and slides the marker to it.
 */
export function initSectionSpy() {
  var links = Array.prototype.slice.call(document.querySelectorAll(".menu a"));
  var menu = document.querySelector(".menu");
  var sections = links.map(function (a) {
    return document.querySelector(a.getAttribute("href"));
  });

  function setActive(i) {
    links.forEach(function (a, j) {
      a.classList.toggle("active", j === i);
    });
    var a = links[i];
    menu.style.setProperty("--h", a.offsetHeight + "px");
    menu.style.setProperty("--y", a.parentElement.offsetTop + "px");
    if (window.innerWidth <= 860) {
      menu.scrollTo({ left: a.parentElement.offsetLeft - 20, behavior: "smooth" });
    }
  }

  function update() {
    var mid = window.innerWidth <= 860 ? 140 : window.innerHeight * 0.35;
    var current = 0;
    sections.forEach(function (s, i) {
      if (s && s.getBoundingClientRect().top <= mid) current = i;
    });
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) current = sections.length - 1;
    setActive(current);
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}
