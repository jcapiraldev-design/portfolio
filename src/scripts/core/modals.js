/*
 * Modals: buttons with data-open-modal="id" open the matching <dialog>.
 */
export function initModals() {
  function closeModal(dialog) {
    dialog.classList.add("is-closing");
    setTimeout(function () {
      dialog.classList.remove("is-closing");
      dialog.close();
    }, 180);
  }
  Array.prototype.forEach.call(document.querySelectorAll("[data-open-modal]"), function (btn) {
    var dialog = document.getElementById(btn.getAttribute("data-open-modal"));
    if (!dialog || typeof dialog.showModal !== "function") return;
    btn.addEventListener("click", function () {
      dialog.showModal();
      document.documentElement.classList.add("modal-open");
      dialog.querySelector(".modal-body").scrollTop = 0;
    });
    // Close with the X button, or by clicking the dimmed area outside the box
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog || e.target.closest("[data-close-modal]")) closeModal(dialog);
    });
    // Esc key closes the dialog natively; tidy up after any close
    dialog.addEventListener("close", function () {
      document.documentElement.classList.remove("modal-open");
      btn.focus();
    });
  });
}
