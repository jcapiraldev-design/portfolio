/*
 * Skills page: hovering (or keyboard-focusing) a skill brings its logo forward in
 * the background cloud: it glides to the middle, grows, and lights up, while the
 * other logos fade back. Mouse and trackpad only; with "reduce motion" on, the logo
 * only lights up in place.
 */
export function initSkillsFocus() {
  var cloud = document.querySelector(".bg-logos");
  if (!cloud) return;
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!canHover) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var active = null;
  var leaveTimer = null;

  function logoFor(item) {
    var img = item.querySelector("img");
    if (!img) return null;
    var name = (img.getAttribute("src") || "").split("/").pop().replace(".svg", "");
    var logo = cloud.querySelector('.bg-logo[data-logo="' + name + '"]');
    if (!logo) {
      // Skills that aren't in the cloud get a logo just for the hover
      logo = document.createElement("span");
      logo.className = "bg-logo is-guest";
      logo.setAttribute("data-logo", name);
      logo.style.cssText = "--x: 46%; --y: 44%; --s: 1; --d: 0s; --t: 18s";
      logo.innerHTML = '<img src="' + img.getAttribute("src") + '" alt="" width="48" height="48">';
      cloud.appendChild(logo);
    }
    return logo;
  }

  // A logo added just for a hover is removed once it has faded out
  function release(logo) {
    logo.classList.remove("is-focus");
    if (!logo.classList.contains("is-guest")) return;
    setTimeout(function () {
      if (logo !== active && logo.parentNode) logo.parentNode.removeChild(logo);
    }, 700);
  }

  function focus(item) {
    clearTimeout(leaveTimer);
    var logo = logoFor(item);
    if (!logo || logo === active) return;
    if (active) release(active);
    active = logo;
    if (!reduce) {
      // Distance from the logo's own spot to the middle of the background
      var box = cloud.getBoundingClientRect();
      var size = logo.offsetWidth || 48;
      // Target: centered, a little above the middle, about 300px wide
      var fx = box.width / 2 - (logo.offsetLeft + size / 2);
      var fy = box.height * 0.4 - (logo.offsetTop + size / 2);
      logo.style.setProperty("--fx", fx + "px");
      logo.style.setProperty("--fy", fy + "px");
      logo.style.setProperty("--fs", Math.min(8, 300 / size).toFixed(2));
    } else {
      logo.style.setProperty("--fx", "0px");
      logo.style.setProperty("--fy", "0px");
      logo.style.setProperty("--fs", "1.4");
    }
    // Next frame, so the move animates from the logo's current spot
    requestAnimationFrame(function () {
      logo.classList.add("is-focus");
      cloud.classList.add("has-focus");
    });
  }

  function blur() {
    // A short delay, so moving between neighboring skills doesn't flicker
    leaveTimer = setTimeout(function () {
      var last = active;
      active = null;
      if (last) release(last);
      cloud.classList.remove("has-focus");
    }, 120);
  }

  var items = document.querySelectorAll("#skills .core-tile, #skills .skills li");
  Array.prototype.forEach.call(items, function (item) {
    item.addEventListener("mouseenter", function () {
      focus(item);
    });
    item.addEventListener("mouseleave", blur);
    item.addEventListener("focusin", function () {
      focus(item);
    });
    item.addEventListener("focusout", blur);
  });
}
