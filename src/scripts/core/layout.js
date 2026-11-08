/*
 * Layout behavior shared by every page.
 *
 * The header, sidebar, and footer are now written into each page by the build
 * (scripts/build.js), including the right sidebar menu and the current-page
 * highlight. This file only adds the parts that need JavaScript:
 *   - the phone header height (so content starts right below it)
 *   - the hamburger menu on phones
 *   - the sliding menu marker on pages other than home
 *   - the current year in the footer
 */
export function initLayout() {
  function page() {
    return document.body.getAttribute("data-page") || "home";
  }

  // Phones: measure the fixed header so the page content starts right below it (CSS reads --hh)
  function headerHeight() {
    var side = document.querySelector(".side");
    if (!side) return;
    if (window.innerWidth <= 860)
      document.documentElement.style.setProperty("--hh", side.offsetHeight + "px");
    else document.documentElement.style.removeProperty("--hh");
  }

  // Phones: hamburger menu
  function mobileNav() {
    var btn = document.querySelector(".nav-toggle"),
      nav = document.getElementById("mobile-nav");
    if (!btn || !nav) return;
    function set(open) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      nav.classList.toggle("is-open", open);
      document.documentElement.classList.toggle("nav-open", open);
    }
    btn.addEventListener("click", function () {
      set(btn.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) set(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") {
        set(false);
        btn.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (btn.getAttribute("aria-expanded") === "true" && !nav.contains(e.target) && !btn.contains(e.target))
        set(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) set(false);
    });
  }

  // Pages other than home: place the sliding menu marker next to the current page
  function menuMarker() {
    if (page() === "home") return;
    var menu = document.querySelector(".menu"),
      active = menu && menu.querySelector("a.active");
    if (!active) return;
    function mark() {
      menu.style.setProperty("--h", active.offsetHeight + "px");
      menu.style.setProperty("--y", active.parentElement.offsetTop + "px");
    }
    mark();
    window.addEventListener("resize", mark);
  }

  // Keep the copyright year current
  function footerYear() {
    Array.prototype.forEach.call(document.querySelectorAll(".footer-year"), function (y) {
      y.textContent = new Date().getFullYear();
    });
  }

  mobileNav();
  headerHeight();
  window.addEventListener("resize", headerHeight);
  menuMarker();
  footerYear();
  document.dispatchEvent(new CustomEvent("includes:ready"));
}
