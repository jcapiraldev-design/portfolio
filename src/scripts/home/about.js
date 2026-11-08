/*
 * About: words light up as you read, plus a live local clock and working-hours status.
 */
export function initAbout() {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1. Live clock in Manila time, the time difference to the visitor, and working hours
  var timeEl = document.getElementById("local-time"),
    statusEl = document.getElementById("work-status"),
    dot = document.getElementById("work-dot");
  function tick() {
    var now = new Date();
    var parts = {};
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Manila",
      hour: "numeric",
      minute: "2-digit",
      weekday: "short",
      hour12: true,
    })
      .formatToParts(now)
      .forEach(function (p) {
        parts[p.type] = p.value;
      });
    timeEl.textContent = parts.hour + ":" + parts.minute + " " + parts.dayPeriod;
    var h24 = +new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Manila",
      hour: "numeric",
      hourCycle: "h23",
    }).format(now);
    var weekend = parts.weekday === "Sat" || parts.weekday === "Sun";
    var working = !weekend && h24 >= 9 && h24 < 18;
    // time difference to the visitor (Manila is UTC+8)
    var diff = 8 + now.getTimezoneOffset() / 60,
      rel = "";
    if (diff > 0) rel = ", " + diff + (diff === 1 ? " hour" : " hours") + " ahead of you";
    else if (diff < 0) rel = ", " + -diff + (diff === -1 ? " hour" : " hours") + " behind you";
    else rel = ", same time as you";
    statusEl.textContent = (working ? "Working hours now" : "Outside working hours") + rel;
    dot.classList.toggle("is-on", working);
  }
  if (timeEl) {
    tick();
    setInterval(tick, 30000);
  }
  var years = document.getElementById("years-exp");
  if (years) years.textContent = new Date().getFullYear() - 2012;

  // 2. Words brighten as the paragraph scrolls past (links stay clickable)
  var box = document.querySelector("[data-reveal-words]");
  if (!box || reduce) return;
  var words = [];
  Array.prototype.forEach.call(box.querySelectorAll("p:not(.availability)"), function (p) {
    var walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT),
      nodes = [],
      n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
          return;
        }
        var w = document.createElement("span");
        w.className = "rw";
        w.textContent = part;
        frag.appendChild(w);
        words.push(w);
      });
      node.parentNode.replaceChild(frag, node);
    });
  });
  box.classList.add("is-revealing");
  var ticking = false;
  function update() {
    ticking = false;
    var r = box.getBoundingClientRect(),
      vh = window.innerHeight;
    // 0 when the text enters the lower part of the screen, 1 when its end passes the middle
    var start = vh * 0.85,
      end = vh * 0.45;
    var k = (start - r.top) / (start - end + r.height * 0.9);
    k = Math.max(0, Math.min(1, k));
    var lit = Math.round(k * words.length);
    for (var i = 0; i < words.length; i++) words[i].classList.toggle("on", i < lit);
  }
  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  window.addEventListener("resize", update);
  update();
}
