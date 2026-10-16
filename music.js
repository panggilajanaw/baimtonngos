/* =========================================================
   Play Music / Pause Music
   - One <audio> element per page, created here. Never autoplays.
   - Source: the URL below (not the local sempurna.mp3).
   - Button state follows real audio events, not clicks, so
     "Pause Music" is only shown once playback has started.
   - Each page is its own document, so playback does not carry
     over when you navigate; every page starts stopped.
   ========================================================= */
(function () {
    "use strict";

    var MUSIC_URL = "https://files.catbox.moe/z33zfv.mp3";

    var LABEL = {
        play: "Play Music",
        pause: "Pause Music",
        loading: "Loading…",
        error: "Music unavailable"
    };

    /* original pacar.js status strings (shown if #music-status exists) */
    var STATUS = {
        playing: "Musik sedang diputar ♡",
        paused: "Musik sedang dijeda",
        failed: "Musik gagal diputar. Periksa file audio.",
        missing: "File musik tidak ditemukan"
    };

    var ICON_PLAY =
        '<svg viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M3 1.5v11l9-5.5z"/></svg>';
    var ICON_PAUSE =
        '<svg viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M2.5 1.5h3.2v11H2.5zM8.3 1.5h3.2v11H8.3z"/></svg>';

    function init() {
        if (document.getElementById("music-toggle")) return; // never build twice

        var host = document.querySelector(".nav-tools");
        if (!host) return;

        var audio = new Audio();
        audio.id = "background-music";
        audio.preload = "none";
        audio.hidden = true;
        audio.src = MUSIC_URL;
        document.body.appendChild(audio); // the single audio element for this page

        var btn = document.createElement("button");
        btn.type = "button";
        btn.id = "music-toggle";
        btn.className = "music-btn";
        btn.setAttribute("aria-pressed", "false");
        host.insertBefore(btn, host.firstChild);

        var status = document.getElementById("music-status");
        var disc = document.getElementById("music-disc");
        var errorTimer = 0;
        var failed = false;

        function setStatus(text) {
            if (status) status.textContent = text;
        }

        function render(state, labelOverride) {
            btn.dataset.state = state;
            var playing = state === "playing";
            btn.setAttribute("aria-pressed", playing ? "true" : "false");
            var label =
                labelOverride ||
                (playing ? LABEL.pause : state === "loading" ? LABEL.loading : LABEL.play);
            btn.innerHTML = (playing ? ICON_PAUSE : ICON_PLAY) + "<span>" + label + "</span>";
            if (disc) disc.classList.toggle("playing", playing);
        }

        function showFailure(statusText) {
            window.clearTimeout(errorTimer);
            failed = true;
            // After a failed load the element can still report paused === false;
            // force it to a real paused state so the next click retries.
            if (!audio.paused) audio.pause();
            render("error", LABEL.error);
            setStatus(statusText);
            errorTimer = window.setTimeout(function () {
                failed = false;
                render("idle");
            }, 3500);
        }

        render("idle");

        btn.addEventListener("click", function () {
            window.clearTimeout(errorTimer);
            failed = false;
            if (!audio.paused && !audio.error) {
                audio.pause();
                return;
            }
            render("loading"); // not "playing" until the audio really starts
            var attempt;
            try {
                if (audio.error) audio.load(); // retry after an earlier failure
                attempt = audio.play();
            } catch (e) {
                showFailure(STATUS.failed);
                return;
            }
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function (err) {
                    // AbortError = interrupted by a pause(); not a failure
                    if (err && err.name === "AbortError") return;
                    showFailure(STATUS.failed);
                });
            }
        });

        audio.addEventListener("playing", function () {
            window.clearTimeout(errorTimer);
            render("playing");
            setStatus(STATUS.playing);
        });

        audio.addEventListener("pause", function () {
            if (audio.ended || failed) return; // "ended" / failure handle their own state
            render("idle");
            setStatus(STATUS.paused);
        });

        audio.addEventListener("ended", function () {
            audio.currentTime = 0;
            render("idle");
            setStatus(STATUS.paused);
        });

        audio.addEventListener("error", function () {
            showFailure(STATUS.missing);
        });

        // Keep the button truthful if the tab is hidden and the browser stalls audio
        audio.addEventListener("stalled", function () {
            if (!audio.paused && audio.readyState < 3) render("loading");
        });
        audio.addEventListener("waiting", function () {
            if (!audio.paused) render("loading");
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
