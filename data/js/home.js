/*
 * Homepage scripts (index.html only).
 * Needs: include.js (onIncludes) and projects.js (projects, renderProjects).
 */

// Homepage: show only projects marked featured: true
renderProjects(document.getElementById("project-grid"), projects.filter(function (p) { return p.featured; }), false);

// Skills: tags that match projects become links to the filtered project list, with a count
(function () {
  if (typeof projects === "undefined") return;
  var alias = { "php": "php", "laravel": "laravel", "codeigniter": "codeigniter", "javascript": "javascript",
    "typescript": "typescript", "react": "react", "vue.js": "vue", "wordpress": "wordpress",
    "silverstripe": "silverstripe", "magento": "magento", "mysql": "mysql", "sqlite": "sqlite" };
  Array.prototype.forEach.call(document.querySelectorAll("#skills .skills li"), function (li) {
    var label = li.textContent.trim().toLowerCase().split(/[\s\/(]+/)[0];
    var term = alias[label];
    if (!term) return;
    var n = projects.filter(function (p) {
      return (p.tech || []).join(" ").toLowerCase().indexOf(term) !== -1;
    }).length;
    if (!n) return;
    var a = document.createElement("a");
    a.href = "/projects/?q=" + encodeURIComponent(term);
    a.className = "skill-link";
    a.title = "See " + n + " project" + (n > 1 ? "s" : "") + " using " + li.textContent.trim();
    while (li.firstChild) a.appendChild(li.firstChild);
    var badge = document.createElement("span");
    badge.className = "skill-count"; badge.textContent = n;
    a.appendChild(badge);
    li.appendChild(a);
    li.classList.add("has-link");
  });
})();

// Intro: headline words rise in, stats count up, and project screenshots cycle in a stacked window view
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1. Split the headline into words for a staggered entrance (text stays readable without JS)
  var title = document.querySelector(".hero-title");
  if (title && !reduce) {
    var words = title.textContent.trim().split(/\s+/);
    title.setAttribute("aria-label", title.textContent.trim());
    title.innerHTML = words.map(function (w, i) {
      return '<span class="w" aria-hidden="true" style="--d:' + (i * 55) + 'ms">' + w + '</span>';
    }).join(" ");
    document.documentElement.classList.add("hero-ready");
  }

  // 2. Count-up numbers
  if (!reduce) {
    Array.prototype.forEach.call(document.querySelectorAll(".hero-stats dd[data-count]"), function (el) {
      var end = +el.getAttribute("data-count"), suffix = el.getAttribute("data-suffix") || "", t0 = null, dur = 1400;
      el.textContent = "0" + suffix;
      function step(t) {
        if (!t0) t0 = t;
        var k = Math.min((t - t0) / dur, 1), eased = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(end * eased) + suffix;
        if (k < 1) requestAnimationFrame(step);
      }
      setTimeout(function () { requestAnimationFrame(step); }, 500);
    });
  }

  // 3. Screenshot stack from featured projects
  var stack = document.getElementById("hero-stack");
  if (!stack || typeof projects === "undefined") return;
  var picks = projects.filter(function (p) { return p.featured && p.image; }).slice(0, 6);
  if (picks.length < 3) picks = projects.filter(function (p) { return p.image; }).slice(0, 6);
  function host(u) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return ""; } }
  stack.innerHTML = picks.map(function (p) {
    return '<figure class="hero-win"><div class="hero-bar"><i></i><i></i><i></i><span>' + host(p.url) +
      '</span></div><img src="' + p.image + '" alt="" loading="eager" decoding="async"></figure>';
  }).join("");
  var wins = Array.prototype.slice.call(stack.children), front = 0;
  function place() {
    wins.forEach(function (w, i) {
      var pos = (i - front + wins.length) % wins.length;
      w.setAttribute("data-pos", pos > 2 ? "hidden" : pos);
    });
  }
  place();
  if (reduce || wins.length < 2) return;
  setInterval(function () {
    if (document.hidden) return;
    front = (front + 1) % wins.length;
    place();
  }, 3200);
})();

// Highlights the current section in the left menu and slides the marker to it
// (waits until the shared sidebar has loaded)
onIncludes(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll('.menu a'));
  var menu = document.querySelector('.menu');
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });

  function setActive(i) {
    links.forEach(function (a, j) { a.classList.toggle('active', j === i); });
    var a = links[i];
    menu.style.setProperty('--h', a.offsetHeight + 'px');
    menu.style.setProperty('--y', a.parentElement.offsetTop + 'px');
    if (window.innerWidth <= 860) {
      menu.scrollTo({ left: a.parentElement.offsetLeft - 20, behavior: 'smooth' });
    }
  }

  function update() {
    var mid = window.innerWidth <= 860 ? 140 : window.innerHeight * 0.35;
    var current = 0;
    sections.forEach(function (s, i) {
      if (s && s.getBoundingClientRect().top <= mid) current = i;
    });
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) current = sections.length - 1;
    setActive(current);
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
});

// Skills scroll reveal. Tags fade and rise in once when the section comes into view.
(function () {
  var groups = document.querySelector("#skills .skill-groups");
  if (!groups || !("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  groups.classList.add("will-reveal");
  Array.prototype.forEach.call(groups.querySelectorAll(".skills"), function (list) {
    Array.prototype.forEach.call(list.children, function (li, i) {
      li.style.setProperty("--i", Math.min(i, 24));
    });
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { groups.classList.add("is-visible"); io.disconnect(); }
    });
  }, { threshold: 0.15 });
  io.observe(groups);
})();

// How I work: reveal the steps one after another when the section scrolls into view
(function () {
  var process = document.querySelector(".process");
  if (!process || !("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  Array.prototype.forEach.call(process.querySelectorAll(".process-steps li"), function (li, i) {
    li.style.setProperty("--i", i);
  });
  process.classList.add("will-animate");
  var io = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) { process.classList.add("is-visible"); io.disconnect(); }
  }, { threshold: 0.25 });
  io.observe(process);
})();

// Experience timeline. Computers: roles on the left, details on the right; hover previews,
// click selects. Phones and tablets: tap a year to open that role, one at a time.
(function () {
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
})();

// About: words light up as you read, plus a live local clock and working-hours status
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1. Live clock in Manila time, the time difference to the visitor, and working hours
  var timeEl = document.getElementById("local-time"), statusEl = document.getElementById("work-status"), dot = document.getElementById("work-dot");
  function tick() {
    var now = new Date();
    var parts = {};
    new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Manila", hour: "numeric", minute: "2-digit", weekday: "short", hour12: true })
      .formatToParts(now).forEach(function (p) { parts[p.type] = p.value; });
    timeEl.textContent = parts.hour + ":" + parts.minute + " " + parts.dayPeriod;
    var h24 = +new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Manila", hour: "numeric", hourCycle: "h23" }).format(now);
    var weekend = parts.weekday === "Sat" || parts.weekday === "Sun";
    var working = !weekend && h24 >= 9 && h24 < 18;
    // time difference to the visitor (Manila is UTC+8)
    var diff = 8 + now.getTimezoneOffset() / 60, rel = "";
    if (diff > 0) rel = ", " + diff + (diff === 1 ? " hour" : " hours") + " ahead of you";
    else if (diff < 0) rel = ", " + (-diff) + (diff === -1 ? " hour" : " hours") + " behind you";
    else rel = ", same time as you";
    statusEl.textContent = (working ? "Working hours now" : "Outside working hours") + rel;
    dot.classList.toggle("is-on", working);
  }
  if (timeEl) { tick(); setInterval(tick, 30000); }
  var years = document.getElementById("years-exp");
  if (years) years.textContent = new Date().getFullYear() - 2012;

  // 2. Words brighten as the paragraph scrolls past (links stay clickable)
  var box = document.querySelector("[data-reveal-words]");
  if (!box || reduce) return;
  var words = [];
  Array.prototype.forEach.call(box.querySelectorAll("p:not(.availability)"), function (p) {
    var walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT), nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var w = document.createElement("span");
        w.className = "rw"; w.textContent = part;
        frag.appendChild(w); words.push(w);
      });
      node.parentNode.replaceChild(frag, node);
    });
  });
  box.classList.add("is-revealing");
  var ticking = false;
  function update() {
    ticking = false;
    var r = box.getBoundingClientRect(), vh = window.innerHeight;
    // 0 when the text enters the lower part of the screen, 1 when its end passes the middle
    var start = vh * 0.85, end = vh * 0.45;
    var k = (start - r.top) / ((start - end) + r.height * 0.9);
    k = Math.max(0, Math.min(1, k));
    var lit = Math.round(k * words.length);
    for (var i = 0; i < words.length; i++) words[i].classList.toggle("on", i < lit);
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
