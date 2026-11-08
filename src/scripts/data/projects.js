/*
 * Project list, loaded from src/data/projects.json at build time.
 * Projects marked "offline": true are left out everywhere.
 */
import list from "../../data/projects.json";

export const projects = list.filter((p) => !p.offline);
