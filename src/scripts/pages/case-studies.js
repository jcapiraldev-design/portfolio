/*
 * Case studies page:
 *   - all case studies are shown, with an overview at the top
 *   - each case study plays its entrance as it scrolls into view, and its key numbers count up
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

// Each case study plays its entrance once, as it scrolls into view
function initScrollReveal() {
  const cards = document.querySelectorAll(".cs-card");
  if (!cards.length) return;
  if (reduceMotion || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        revealCard(entry.target);
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );
  cards.forEach((card) => io.observe(card));
}

prepareCards();
initStories();
initScrollReveal();
