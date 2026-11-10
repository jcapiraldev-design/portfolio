/*
 * Case studies page:
 *   - tabs show one case study at a time, with a sliding highlight
 *   - each case study plays its entrance when shown, and its key numbers count up
 *   - "Read the full story" opens and closes the detailed write-up
 */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Counts every number inside a metric up from 0, keeping the rest of the text
// (so "73 / 73", "0 → 2", "~190", and "100%" all work)
function countUp(el, duration = 1100) {
  const original = el.textContent;
  const parts = original.split(/(\d+)/);
  if (parts.length === 1) return;
  const start = performance.now();
  function frame(now) {
    const k = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - k, 3);
    el.textContent = parts.map((part, i) => (i % 2 ? Math.round(Number(part) * eased) : part)).join("");
    if (k < 1) requestAnimationFrame(frame);
    else el.textContent = original;
  }
  requestAnimationFrame(frame);
}

// Elements that arrive one after another when a card appears
const STAGGER = [
  ".cs-kicker",
  "h3",
  ".cs-lead",
  ".cs-before",
  ".cs-ba-arrow",
  ".cs-after",
  ".cs-metrics li",
  ".cs-steps li",
  ".cs-tools",
  ".plinks",
];

function prepareCards() {
  if (reduceMotion) return;
  document.querySelectorAll(".cs-card").forEach((card) => {
    card.querySelectorAll(STAGGER.join(",")).forEach((el, i) => {
      el.classList.add("cs-anim");
      el.style.setProperty("--d", i);
    });
    card.classList.add("will-reveal");
  });
}

// Plays the card's entrance: parts arrive one after another and the numbers count up
function revealCard(card) {
  if (reduceMotion || !card.classList.contains("will-reveal")) return;
  card.classList.remove("is-revealed");
  void card.offsetWidth;
  requestAnimationFrame(() => card.classList.add("is-revealed"));
  card.querySelectorAll(".cs-metrics b").forEach((b, i) => setTimeout(() => countUp(b), 400 + i * 120));
}

// "Read the full story" toggles. Without JavaScript the story simply stays open.
function initStories() {
  document.querySelectorAll(".cs-story-toggle").forEach((btn) => {
    const story = document.getElementById(btn.getAttribute("aria-controls"));
    if (!story) return;
    const set = (open) => {
      story.classList.toggle("is-closed", !open);
      story.inert = !open;
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? "Hide the full story" : "Read the full story";
    };
    set(false);
    btn.addEventListener("click", () => set(btn.getAttribute("aria-expanded") !== "true"));
  });
}

// Tabs: show one case study at a time. Without JavaScript, the tabs work as jump links
// and all case studies stay visible.
function initTabs() {
  const nav = document.querySelector(".cs-tabs");
  const list = document.querySelector(".cs-list");
  if (!nav || !list) return;
  const tabs = Array.from(nav.querySelectorAll('a[href^="#"]'));
  const panels = tabs.map((a) => document.getElementById(a.getAttribute("href").slice(1)));
  if (panels.some((p) => !p)) return;
  const indicator = nav.querySelector(".cs-tab-ind");

  nav.setAttribute("role", "tablist");
  tabs.forEach((tab, i) => {
    tab.setAttribute("role", "tab");
    tab.id = "tab-" + panels[i].id;
    tab.setAttribute("aria-controls", panels[i].id);
    panels[i].setAttribute("role", "tabpanel");
    panels[i].setAttribute("aria-labelledby", tab.id);
    panels[i].setAttribute("tabindex", "-1");
  });
  list.classList.add("has-tabs");

  let current = -1;

  function moveIndicator(animate) {
    const tab = tabs[current];
    if (!indicator || !tab) return;
    if (!animate) indicator.style.transition = "none";
    indicator.style.setProperty("--x", tab.offsetLeft + "px");
    indicator.style.setProperty("--w", tab.offsetWidth + "px");
    if (!animate) {
      indicator.getBoundingClientRect();
      indicator.style.transition = "";
    }
  }

  function select(index, { animate = true, focusPanel = false, updateUrl = true } = {}) {
    if (index === current) return;
    const previous = current;
    current = index;
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.setAttribute("aria-selected", String(on));
      tab.setAttribute("tabindex", on ? "0" : "-1");
    });
    panels.forEach((panel, i) => {
      panel.hidden = i !== index;
    });

    const panel = panels[index];
    if (animate && !reduceMotion && previous !== -1) {
      panel.classList.remove("is-entering", "from-left");
      void panel.offsetWidth;
      panel.classList.add("is-entering");
      if (index < previous) panel.classList.add("from-left");
    }
    revealCard(panel);
    moveIndicator(animate && previous !== -1);
    tabs[index].scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: reduceMotion ? "auto" : "smooth",
    });
    if (updateUrl) history.replaceState(null, "", "#" + panel.id);
    if (focusPanel) panel.focus({ preventScroll: true });
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      select(i);
    });
    // Arrow keys move between tabs; Home and End jump to the first and last
    tab.addEventListener("keydown", (e) => {
      let next = null;
      if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
      if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
      if (e.key === "Home") next = 0;
      if (e.key === "End") next = tabs.length - 1;
      if (next === null) return;
      e.preventDefault();
      select(next);
      tabs[next].focus();
    });
  });

  // Open the case study named in the address (links from the homepage use these)
  const fromHash = panels.findIndex((p) => "#" + p.id === location.hash);
  select(fromHash >= 0 ? fromHash : 0, { animate: false, updateUrl: false });
  nav.classList.add("is-ready");
  requestAnimationFrame(() => moveIndicator(false));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => moveIndicator(false));
  window.addEventListener("resize", () => moveIndicator(false));
  window.addEventListener("hashchange", () => {
    const i = panels.findIndex((p) => "#" + p.id === location.hash);
    if (i >= 0) select(i, { updateUrl: false });
  });
}

prepareCards();
initStories();
initTabs();
