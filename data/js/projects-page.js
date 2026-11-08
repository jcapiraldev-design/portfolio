/*
 * All projects page: search, type filters, sorting, and "Show more".
 * Needs: projects.js (projects, renderProjects).
 */

(function () {
  var PAGE = 24;
  var grid = document.getElementById("all-grid");
  var chipsEl = document.getElementById("chips");
  var q = document.getElementById("q");
  var sortEl = document.getElementById("sort");
  var countEl = document.getElementById("result-count");
  var emptyEl = document.getElementById("empty");
  var moreWrap = document.getElementById("load-more");

  var params = new URLSearchParams(location.search);
  var state = { type: params.get("type") || "All", q: params.get("q") || "", sort: params.get("sort") || "new", shown: PAGE };
  q.value = state.q;
  sortEl.value = state.sort;

  document.getElementById("total-line").textContent =
    projects.length + " live websites I’ve built or worked on. Search by name or filter by type.";

  // Filter buttons, built from the "type" of each project
  var counts = {};
  projects.forEach(function (p) { counts[p.type] = (counts[p.type] || 0) + 1; });
  var types = ["All"].concat(Object.keys(counts).sort());
  chipsEl.innerHTML = types.map(function (t) {
    var n = t === "All" ? projects.length : counts[t];
    return '<li><button type="button" class="chip" data-type="' + t.replace(/"/g, "&quot;") + '">' + t + '<span>' + n + '</span></button></li>';
  }).join("");
  if (types.indexOf(state.type) === -1) state.type = "All";

  function matches(p) {
    if (state.type !== "All" && p.type !== state.type) return false;
    if (!state.q) return true;
    var hay = [p.name, p.type, p.role, (p.tech || []).join(" "), p.url, p.year].join(" ").toLowerCase();
    return state.q.toLowerCase().split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
  }

  function sorted(list) {
    return list.slice().sort(function (a, b) {
      if (state.sort === "name") return a.name.localeCompare(b.name);
      var ya = Number(a.year) || 0, yb = Number(b.year) || 0;
      return yb - ya || a.name.localeCompare(b.name);
    });
  }

  function saveToUrl() {
    var p = new URLSearchParams();
    if (state.type !== "All") p.set("type", state.type);
    if (state.q) p.set("q", state.q);
    if (state.sort !== "new") p.set("sort", state.sort);
    var qs = p.toString();
    try { history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "")); } catch (e) {}
  }

  var prevShown = 0;

  // mode: "all" redraws the grid (first load, filter, search, sort)
  //       "more" only appends the next batch of cards
  function render(mode) {
    Array.prototype.forEach.call(chipsEl.querySelectorAll(".chip"), function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-type") === state.type ? "true" : "false");
    });
    var list = sorted(projects.filter(matches));
    var start = 0;
    if (mode === "more") {
      // Build only the new cards and add them under the existing ones
      start = prevShown;
      var tmp = document.createElement("ul");
      renderProjects(tmp, list.slice(prevShown, state.shown), true);
      while (tmp.firstChild) grid.appendChild(tmp.firstChild);
    } else {
      renderProjects(grid, list.slice(0, state.shown), true);
    }
    // Fade the new cards in one after another
    Array.prototype.forEach.call(grid.children, function (card, i) {
      if (i < start) return;
      card.classList.add(mode === "more" ? "reveal-more" : "reveal");
      card.style.setProperty("--i", Math.min(i - start, 12));
    });
    prevShown = Math.min(state.shown, list.length);
    countEl.textContent = list.length
      ? "Showing " + Math.min(state.shown, list.length) + " of " + list.length + (list.length === 1 ? " project" : " projects")
      : "";
    emptyEl.hidden = list.length !== 0;
    moreWrap.hidden = state.shown >= list.length;
    saveToUrl();
  }

  chipsEl.addEventListener("click", function (e) {
    var b = e.target.closest(".chip");
    if (!b) return;
    state.type = b.getAttribute("data-type");
    state.shown = PAGE;
    render("all");
  });
  q.addEventListener("input", function () { state.q = q.value.trim(); state.shown = PAGE; render("all"); });
  sortEl.addEventListener("change", function () { state.sort = sortEl.value; render("all"); });
  var moreBtn = document.getElementById("more-btn");
  moreBtn.addEventListener("click", function () {
    if (moreBtn.classList.contains("is-loading")) return;
    moreBtn.classList.add("is-loading");
    moreBtn.setAttribute("aria-busy", "true");
    // Short pause so the loading state is visible, then reveal the next batch
    setTimeout(function () {
      state.shown += PAGE;
      render("more");
      moreBtn.classList.remove("is-loading");
      moreBtn.removeAttribute("aria-busy");
    }, 450);
  });
  document.getElementById("clear").addEventListener("click", function () {
    state.type = "All"; state.q = ""; q.value = ""; state.shown = PAGE; render("all"); q.focus();
  });

  render("all");

})();
