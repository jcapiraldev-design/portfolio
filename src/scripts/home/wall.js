/*
 * Intro: a slowly moving 3D wall of real project screenshots. Three columns drift
 * up and down at different speeds, so visitors instantly see the volume of work.
 * Uses the small card thumbnails to stay light. With "reduce motion" on, the wall
 * stays still.
 */
import { projects } from "../data/projects.js";

function thumb(src) {
  return src.replace(/\/projects\/([^/]+)$/, "/projects/thumbs/$1");
}

export function initWall() {
  var wall = document.getElementById("wall");
  var count = document.getElementById("wall-count");
  if (count) count.textContent = projects.length;
  if (!wall) return;

  // Featured projects first, then the newest ones
  var list = projects
    .filter(function (p) {
      return p.image;
    })
    .sort(function (a, b) {
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (Number(b.year) || 0) - (Number(a.year) || 0);
    })
    .slice(0, 27);

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
            thumb(p.image) +
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

  placeWall();
  window.addEventListener("resize", placeWall);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeWall);
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
