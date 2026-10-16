document.addEventListener("DOMContentLoaded", () => {
    const heartContainer = document.querySelector(".floating-hearts");
    const messageButton = document.getElementById("love-message-button");
    const secretMessage = document.getElementById("secret-message");

    // Keep the original floating-heart effect, while respecting reduced motion.
    if (heartContainer) {
        const symbols = ["♥", "♡", "❤", "✧"];
        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        function createHeart() {
            if (document.hidden || heartContainer.childElementCount >= 18) return;

            const heart = document.createElement("span");
            heart.className = "floating-heart";
            heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            heart.style.left = Math.random() * 100 + "%";
            heart.style.fontSize = (12 + Math.random() * 20) + "px";
            heart.style.animationDuration = (8 + Math.random() * 8) + "s";
            heartContainer.appendChild(heart);
            heart.addEventListener("animationend", () => heart.remove(), { once: true });
        }

        if (!reducedMotion) {
            let heartTimer = window.setInterval(createHeart, 1100);
            createHeart();
            document.addEventListener("visibilitychange", () => {
                if (document.hidden) {
                    window.clearInterval(heartTimer);
                    heartTimer = null;
                } else if (!heartTimer) {
                    heartTimer = window.setInterval(createHeart, 1100);
                }
            });
        }
    }

    // Lightweight sequential reveal for the romantic story, photos and letter.
    // Content and original wording stay untouched; only presentation changes.
    const revealTargets = document.querySelectorAll(
        ".love-hero > *, .love-section > *, .love-profile > *, .love-gallery > *, .love-letter > *, .love-footer > *"
    );
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion && "IntersectionObserver" in window) {
        revealTargets.forEach((element, index) => {
            if (element.classList.contains("hero-heart") || element.matches(".floating-hearts")) return;
            element.classList.add("love-reveal");
            element.style.setProperty("--love-delay", `${Math.min(index % 5, 4) * 75}ms`);
        });
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("love-visible");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.08, rootMargin: "0px 0px -28px 0px" });
        revealTargets.forEach((element) => {
            if (element.classList.contains("love-reveal")) revealObserver.observe(element);
            else element.classList.add("love-visible");
        });
    } else {
        revealTargets.forEach((element) => element.classList.add("love-visible"));
    }

    // Original secret-message interaction.
    if (messageButton && secretMessage) {
        messageButton.addEventListener("click", () => {
            secretMessage.hidden = !secretMessage.hidden;
            messageButton.textContent = secretMessage.hidden
                ? "Klik untuk pesan kecil 💗"
                : "Sembunyikan pesan 💌";
        });
    }

    // One native audio element; playback is never started automatically.
    const music = document.getElementById("background-music");
    const musicButton = document.getElementById("music-toggle");
    const musicLabel = musicButton?.querySelector(".music-label");
    const musicIcon = musicButton?.querySelector(".music-icon");
    const musicStatus = document.getElementById("music-status");

    if (!music || !musicButton || !musicLabel || !musicIcon || !musicStatus) return;

    let playPending = false;

    function setPausedState(message = "Music is paused.") {
        musicLabel.textContent = "Play Music";
        musicIcon.textContent = "▶";
        musicButton.setAttribute("aria-label", "Play Music");
        musicButton.setAttribute("aria-pressed", "false");
        musicButton.disabled = false;
        playPending = false;
        musicStatus.textContent = message;
    }

    function setPlayingState() {
        musicLabel.textContent = "Pause Music";
        musicIcon.textContent = "Ⅱ";
        musicButton.setAttribute("aria-label", "Pause Music");
        musicButton.setAttribute("aria-pressed", "true");
        musicButton.disabled = false;
        playPending = false;
        musicStatus.textContent = "Music is playing.";
    }

    musicButton.addEventListener("click", async () => {
        if (playPending) return;

        if (!music.paused && !music.ended) {
            music.pause();
            return;
        }

        playPending = true;
        musicButton.disabled = true;
        musicStatus.textContent = "Loading music…";

        try {
            await music.play();
            // The actual playing event below owns the visible playing state.
            // If the promise resolves before that event, keep the button stable.
        } catch (error) {
            setPausedState("Music could not be played. Check your connection and try again.");
        }
    });

    music.addEventListener("playing", setPlayingState);
    music.addEventListener("pause", () => {
        if (music.ended) return;
        setPausedState();
    });
    music.addEventListener("ended", () => {
        setPausedState("Music has ended.");
    });
    music.addEventListener("error", () => {
        setPausedState("Music could not be loaded. Please try again later.");
    });
    music.addEventListener("waiting", () => {
        if (!music.paused) musicStatus.textContent = "Loading music…";
    });
    music.addEventListener("canplay", () => {
        if (!music.paused && !music.ended) musicStatus.textContent = "Music is playing.";
    });
});