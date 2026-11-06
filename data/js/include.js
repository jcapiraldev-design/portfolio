/*
 * Loads shared HTML parts into the page.
 * Usage: <div data-include="/template/footer.html"></div>
 * The placeholder is replaced with the contents of that file.
 */
(function () {
  var parts = document.querySelectorAll("[data-include]");
  Array.prototype.forEach.call(parts, function (el) {
    fetch(el.getAttribute("data-include"))
      .then(function (res) {
        if (!res.ok) throw new Error("Could not load " + el.getAttribute("data-include"));
        return res.text();
      })
      .then(function (html) {
        el.outerHTML = html;
        // Keep the copyright year current
        Array.prototype.forEach.call(document.querySelectorAll(".footer-year"), function (y) {
          y.textContent = new Date().getFullYear();
        });
      })
      .catch(function (err) { console.warn(err.message); });
  });
})();
