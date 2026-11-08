/*
 * Builds project cards into a container.
 * compact = smaller cards for the full projects list.
 */
export function renderProjects(container, list, compact) {
  function esc(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function domain(u) {
    try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return u; }
  }
  function placeholder(name) {
    return '<span class="empty"><b>' + esc(name.charAt(0)) + '</b>Screenshot coming soon</span>';
  }

  container.innerHTML = list.map(function (p) {
    var frame = p.image
      ? '<img src="' + esc(p.image) + '" alt="Homepage of ' + esc(p.name) + '" loading="lazy" data-name="' + esc(p.name) + '">'
      : placeholder(p.name);
    var meta = esc(p.type) + (p.year ? ', ' + esc(p.year) : '');
    var shot =
      '<a class="shot" href="' + esc(p.url) + '" target="_blank" rel="noopener" aria-label="Visit ' + esc(p.name) + '">' +
        '<span class="bar"><span>' + esc(domain(p.url)) + '</span></span>' +
        '<span class="frame">' + frame + '</span>' +
      '</a>';

    if (compact) {
      return '<li class="card compact">' + shot +
        '<h3>' + esc(p.name) + '</h3>' +
        '<p class="type">' + meta + '</p>' +
      '</li>';
    }

    var tags = (p.tech || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join("");
    return '<li class="card">' + shot +
      '<p class="type">' + meta + '</p>' +
      '<h3>' + esc(p.name) + '</h3>' +
      '<p class="role">' + esc(p.role) + '</p>' +
      '<ul class="tags">' + tags + '</ul>' +
      '<a class="visit" href="' + esc(p.url) + '" target="_blank" rel="noopener">Visit site</a>' +
    '</li>';
  }).join("");

  // If a screenshot file is missing, show the placeholder instead of a broken image
  Array.prototype.forEach.call(container.querySelectorAll(".frame img"), function (img) {
    function fallback() { img.parentNode.innerHTML = placeholder(img.getAttribute("data-name")); }
    if (img.complete && img.naturalWidth === 0) fallback();
    else img.addEventListener("error", fallback);
  });
}
