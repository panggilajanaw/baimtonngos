/* Mobile menu toggle. Load without defer in <head>: adds the "js" hook before first paint.
   Links still work without JS (menu is only collapsed once this runs). */
(function () {
    "use strict";
    document.documentElement.classList.add("js");
    function init() {
        var toggle = document.querySelector(".nav-toggle");
        var links = document.getElementById("site-menu");
        if (!toggle || !links) return;

        function set(open) {
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
            links.classList.toggle("open", open);
        }
        toggle.addEventListener("click", function () {
            set(toggle.getAttribute("aria-expanded") !== "true");
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
                set(false);
                toggle.focus();
            }
        });
        document.addEventListener("click", function (e) {
            if (!e.target.closest("nav")) set(false);
        });
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();
