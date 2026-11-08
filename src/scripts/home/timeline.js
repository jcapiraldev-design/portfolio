/*
 * Experience timeline. Computers: roles on the left, details on the right;
 * hover previews, click selects. Phones and tablets: tap a year to open that role.
 */
export function initTimeline() {
  var list = document.querySelector("#experience .timeline");
  if (!list) return;
  var items = Array.prototype.filter.call(list.children, function (li) { return li.tagName === "LI"; });
  var splitQuery = window.matchMedia("(min-width: 1100px) and (hover: hover) and (pointer: fine)");

  // Wrap the list so a details panel can sit next to it
  var wrap = document.createElement("div");
  wrap.className = "tl-wrap";
  list.parentNode.insertBefore(wrap, list);
  wrap.appendChild(list);
  var panel = document.createElement("div");
  panel.className = "tl-panel";
  panel.setAttribute("aria-live", "polite");
  wrap.appendChild(panel);

  var hint = document.createElement("p");
  hint.className = "tl-hint";
  wrap.parentNode.insertBefore(hint, wrap);

  items.forEach(function (li, i) {
    var when = li.querySelector(":scope > .when");
    var body = li.querySelector(":scope > div");
    var title = body && body.querySelector(":scope > h3");
    if (!when || !title) return;
    var details = document.createElement("div");
    details.className = "tl-details";
    details.id = "tl-details-" + i;
    var inner = document.createElement("div");
    inner.className = "tl-inner";
    while (title.nextSibling) inner.appendChild(title.nextSibling);
    details.appendChild(inner);
    body.appendChild(details);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tl-toggle";
    btn.textContent = when.textContent.trim();
    btn.setAttribute("aria-controls", details.id);
    when.textContent = "";
    when.appendChild(btn);
    li._year = btn.textContent;
    li._title = title.textContent;
    li._inner = inner;
  });

  var selected = items[0], shown = null;

  function showInPanel(li) {
    if (shown === li) return;
    shown = li;
    panel.innerHTML = '<div class="tl-panel-body"><p class="tl-panel-year">' + li._year + '</p><h3>' + li._title + '</h3></div>';
    panel.firstChild.appendChild(li._inner.cloneNode(true));
  }
  function mark(active) {
    items.forEach(function (li) {
      li.classList.toggle("is-active", li === active);
      var b = li.querySelector(".tl-toggle");
      if (b) b.setAttribute("aria-expanded", li === active ? "true" : "false");
    });
  }
  function select(li) {
    selected = li;
    mark(li);
    if (wrap.classList.contains("is-split")) showInPanel(li);
  }

  function setMode() {
    var split = splitQuery.matches;
    wrap.classList.toggle("is-split", split);
    list.classList.add("is-interactive");
    list.classList.toggle("is-accordion", !split);
    hint.textContent = split ? "Hover over a role to preview it, or click to keep it in view." : "Tap a year to see the details.";
    shown = null;
    if (split) { if (!selected) selected = items[0]; showInPanel(selected); }
    mark(selected);
  }

  items.forEach(function (li) {
    var btn = li.querySelector(".tl-toggle");
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (!wrap.classList.contains("is-split") && selected === li) { selected = null; mark(null); return; }
      select(li);
    });
    li.addEventListener("click", function () { if (wrap.classList.contains("is-split")) select(li); });
    li.addEventListener("mouseenter", function () {
      if (!wrap.classList.contains("is-split")) return;
      mark(li); showInPanel(li);
    });
  });
  list.addEventListener("mouseleave", function () {
    if (!wrap.classList.contains("is-split")) return;
    mark(selected); showInPanel(selected);
  });

  setMode();
  (splitQuery.addEventListener ? splitQuery.addEventListener("change", setMode) : splitQuery.addListener(setMode));
}
