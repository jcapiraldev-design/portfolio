/*
 * Intro: a slowly moving 3D wall of real project screenshots. Three columns drift
 * up and down at different speeds, so visitors instantly see the volume of work.
 * Uses small 360px wall images (public/assets/images/projects/wall/), and is built
 * only after the page has loaded, so it never slows down the first view. With
 * "reduce motion" on, the wall stays still.
 */
import { projects } from "../data/projects.js";

function wallImage(src) {
  return src.replace(/\/projects\/([^/]+)$/, "/projects/wall/$1");
}

export function initWall() {
  var wall = document.getElementById("wall");
  var count = document.getElementById("wall-count");
  if (count) count.textContent = projects.length;
  Array.prototype.forEach.call(document.querySelectorAll(".side-count"), function (el) {
    el.textContent = projects.length;
  });
  watchIntro();
  if (!wall) return;

  placeWall();
  window.addEventListener("resize", placeWall);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeWall);

  // Build the wall once the page has finished loading and the browser is idle
  function start() {
    var idle =
      window.requestIdleCallback ||
      function (fn) {
        return setTimeout(fn, 200);
      };
    idle(function () {
      buildWall(wall);
    });
  }
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });
}

function buildWall(wall) {
  // Phones show a shorter wall, so fewer images are needed
  var total = window.matchMedia("(max-width: 860px)").matches ? 18 : 27;

  // Featured projects first, then the newest ones
  var list = projects
    .filter(function (p) {
      return p.image;
    })
    .sort(function (a, b) {
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (Number(b.year) || 0) - (Number(a.year) || 0);
    })
    .slice(0, total);

  var columns = [[], [], []];
  list.forEach(function (p, i) {
    columns[i % 3].push(p);
  });

  wall.innerHTML = columns
    .map(function (col, c) {
      var items = col
        .map(function (p) {
          return (
            '<figure class="wall-item"><img src="' +
            wallImage(p.image) +
            '" alt="" width="640" height="400" decoding="async"></figure>'
          );
        })
        .join("");
      // The list appears twice so the loop is seamless
      return (
        '<div class="wall-col wall-col-' + c + '"><div class="wall-track">' + items + items + "</div></div>"
      );
    })
    .join("");

  requestAnimationFrame(function () {
    wall.classList.add("is-ready");
  });
}

// Large screens: the wall starts just after the intro text and runs to the right
// edge of the window, so it never sits under the text at any screen width
function placeWall() {
  var visual = document.querySelector(".intro-visual");
  var copy = document.querySelector(".intro-copy");
  var layout = document.querySelector(".layout");
  if (!visual || !copy || !layout) return;
  if (!window.matchMedia("(min-width: 1200px)").matches) {
    visual.style.left = "";
    visual.style.width = "";
    return;
  }
  var box = layout.getBoundingClientRect();
  var left = copy.getBoundingClientRect().right - box.left + 24;
  // Keep the wall a comfortable size even on narrower screens
  left = Math.min(left, box.width - 340);
  visual.style.left = left + "px";
  visual.style.width = box.width - left + "px";
}

// Large screens: the wall stays fixed behind every section. Once the intro has
// scrolled away, the wall softens into a background and the side tab appears.
function watchIntro() {
  var intro = document.getElementById("intro");
  var tab = document.querySelector(".side-badge");
  if (!intro || !("IntersectionObserver" in window)) return;
  var io = new IntersectionObserver(
    function (entries) {
      var past = !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0;
      document.documentElement.classList.toggle("past-intro", past);
      if (tab) {
        tab.tabIndex = past ? 0 : -1;
        tab.setAttribute("aria-hidden", past ? "false" : "true");
      }
    },
    { rootMargin: "-35% 0px 0px 0px" },
  );
  io.observe(intro);
}
