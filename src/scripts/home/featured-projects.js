/*
 * Homepage project grid: shows only projects marked "featured": true.
 */
import { projects } from "../data/projects.js";
import { renderProjects } from "../components/project-cards.js";

export function initFeaturedProjects() {
  renderProjects(
    document.getElementById("project-grid"),
    projects.filter(function (p) {
      return p.featured;
    }),
    false,
  );
}
