/*
 * Loads shared HTML parts (header, sidebar, footer) into every page.
 *
 *   <div data-include="/template/footer.html"></div>
 *       the placeholder is replaced by the file
 *   <aside class="side" data-include-inner="/template/sidebar.html"></aside>
 *       the file is placed inside the element, so its size and background
 *       are already there while it loads (no layout jump)
 *
 * When everything has loaded it highlights the current page, picks the right
 * sidebar menu, and fires "includes:ready". Page scripts that need the menu
 * use: onIncludes(function () { ... });
 */
(function () {
  var ready = false, queue = [];
  window.onIncludes = function (fn) { ready ? fn() : queue.push(fn); };

  function page() { return document.body.getAttribute("data-page") || "home"; }
  function cleanPath(p) { return p.replace(/index\.html$/, "").replace(/\/?$/, "/"); }


  // Phones: the fixed header's height varies with text size, so measure it
  // and let the page content start right below it (CSS reads --hh)
  function headerHeight() {
    var side = document.querySelector(".side");
    if (!side) return;
    if (window.innerWidth <= 860) document.documentElement.style.setProperty("--hh", side.offsetHeight + "px");
    else document.documentElement.style.removeProperty("--hh");
  }
  window.addEventListener("resize", headerHeight);


  // Phones: hamburger menu
  function mobileNav() {
    var btn = document.querySelector(".nav-toggle"), nav = document.getElementById("mobile-nav");
    if (!btn || !nav) return;
    function set(open) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      nav.classList.toggle("is-open", open);
      document.documentElement.classList.toggle("nav-open", open);
    }
    btn.addEventListener("click", function () { set(btn.getAttribute("aria-expanded") !== "true"); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") { set(false); btn.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (btn.getAttribute("aria-expanded") === "true" && !nav.contains(e.target) && !btn.contains(e.target)) set(false);
    });
    window.addEventListener("resize", function () { if (window.innerWidth > 860) set(false); });
  }


  // Pages other than home: place the sliding menu marker next to the current page
  function menuMarker() {
    if (page() === "home") return;
    var menu = document.querySelector(".menu"), active = menu && menu.querySelector("a.active");
    if (!active) return;
    function mark() {
      menu.style.setProperty("--h", active.offsetHeight + "px");
      menu.style.setProperty("--y", active.parentElement.offsetTop + "px");
    }
    mark();
    window.addEventListener("resize", mark);
  }

  function finish() {
    var here = cleanPath(location.pathname);

    // Keep only the sidebar menu meant for this page
    Array.prototype.forEach.call(document.querySelectorAll("[data-menu]"), function (nav) {
      var want = page() === "home" ? "home" : "site";
      if (nav.getAttribute("data-menu") !== want) nav.remove();
    });

    // Highlight links that point to the current page (not section links like /#contact)
    Array.prototype.forEach.call(document.querySelectorAll(".topnav a, .page-links a, .mobile-nav a, .menu a"), function (a) {
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#" || href.indexOf("#") !== -1) return;
      if (cleanPath(href) === here) {
        a.setAttribute("aria-current", "page");
        if (a.closest(".menu")) a.classList.add("active");
      }
    });

    // Keep the copyright year current
    Array.prototype.forEach.call(document.querySelectorAll(".footer-year"), function (y) {
      y.textContent = new Date().getFullYear();
    });

    mobileNav();
    headerHeight();
    menuMarker();
    ready = true;
    queue.forEach(function (fn) { fn(); });
    queue = [];
    document.dispatchEvent(new CustomEvent("includes:ready"));
  }

  var outer = document.querySelectorAll("[data-include]");
  var inner = document.querySelectorAll("[data-include-inner]");
  var jobs = [];
  function load(el, attr, replace) {
    var url = el.getAttribute(attr);
    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("Could not load " + url);
        return res.text();
      })
      .then(function (html) { if (replace) el.outerHTML = html; else el.innerHTML = html; })
      .catch(function (err) { console.warn(err.message); });
  }
  Array.prototype.forEach.call(inner, function (el) { jobs.push(load(el, "data-include-inner", false)); });
  Array.prototype.forEach.call(outer, function (el) { jobs.push(load(el, "data-include", true)); });
  Promise.all(jobs).then(finish);
})();
