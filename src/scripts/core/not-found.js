/*
 * 404 page: show the address that was requested.
 */
export function initNotFound() {
  var el = document.getElementById("nf-path");
  if (el) el.textContent = location.pathname;
}
