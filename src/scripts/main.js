/*
 * Entry point for every page. Each feature checks for its own elements,
 * so it does nothing on pages where it isn't used.
 */
import { initLayout } from "./core/layout.js";
import { initBackToTop } from "./core/back-to-top.js";
import { initEffects } from "./core/effects.js";
import { initModals } from "./core/modals.js";
import { initNotFound } from "./core/not-found.js";

initLayout();
initBackToTop();
initEffects();
initModals();
initNotFound();
