
document.addEventListener("DOMContentLoaded", () => {
    const heartContainer = document.querySelector(".floating-hearts");
    const messageButton = document.getElementById("love-message-button");
    const secretMessage = document.getElementById("secret-message");

    // Membuat hati yang melayang
    if (heartContainer) {
        const symbols = ["♥", "♡", "❤", "✧"];

        function createHeart() {
            // Batasi jumlah elemen agar tetap ringan
            if (heartContainer.childElementCount >= 24) return;

            const heart = document.createElement("span");
            heart.className = "floating-heart";
            heart.textContent =
                symbols[Math.floor(Math.random() * symbols.length)];

            heart.style.left = Math.random() * 100 + "%";
            heart.style.fontSize = (12 + Math.random() * 20) + "px";
            heart.style.animationDuration = (8 + Math.random() * 8) + "s";

            heartContainer.appendChild(heart);

            heart.addEventListener("animationend", () => {
                heart.remove();
            }, { once: true });
        }

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (!reducedMotion) {
            createHeart();
            const heartTimer = window.setInterval(createHeart, 700);

            // Hentikan pembuatan hati saat halaman tidak terlihat
            document.addEventListener("visibilitychange", () => {
                if (document.hidden) {
                    window.clearInterval(heartTimer);
                }
            }, { once: true });
        }
    }

    // Tombol untuk membuka pesan rahasia
    if (messageButton && secretMessage) {
        messageButton.addEventListener("click", () => {
            secretMessage.hidden = !secretMessage.hidden;

            messageButton.textContent = secretMessage.hidden
                ? "Klik untuk pesan kecil 💗"
                : "Sembunyikan pesan 💌";

            // Pemutar musik dipindahkan ke music.js (satu pemutar untuk semua halaman)
        });
    }
});
