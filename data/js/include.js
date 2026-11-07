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

  function finish() {
    var here = cleanPath(location.pathname);

    // Keep only the sidebar menu meant for this page
    Array.prototype.forEach.call(document.querySelectorAll("[data-menu]"), function (nav) {
      var want = page() === "home" ? "home" : "site";
      if (nav.getAttribute("data-menu") !== want) nav.remove();
    });

    // Highlight links that point to the current page (not section links like /#contact)
    Array.prototype.forEach.call(document.querySelectorAll(".topnav a, .page-links a, .menu a"), function (a) {
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
