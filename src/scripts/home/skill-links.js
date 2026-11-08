/*
 * Skills: tags that match projects become links to the filtered project list, with a count.
 */
import { projects } from "../data/projects.js";

export function initSkillLinks() {
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
}
