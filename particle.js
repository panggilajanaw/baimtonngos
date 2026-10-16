
const canvas = document.createElement("canvas");
canvas.id = "particles-bg";
document.body.prepend(canvas);

const ctx = canvas.getContext("2d");

let particles = [];
let width = 0;
let height = 0;
let animationId;

const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(
        85,
        Math.floor((width * height) / 12000)
    );

    particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.6,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        alpha: Math.random() * 0.6 + 0.2
    }));
}

function drawParticles() {
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
        if (!reduceMotion) {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;
        }

        // Cahaya partikel
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#38bdf8";
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    // Garis tipis yang menghubungkan partikel berdekatan
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i];
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 115) {
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.strokeStyle =
                    `rgba(56, 189, 248, ${0.15 * (1 - distance / 115)})`;
                ctx.lineWidth = 0.7;
                ctx.stroke();
            }
        }
    }

    if (!reduceMotion) {
        animationId = requestAnimationFrame(drawParticles);
    }
}

resizeCanvas();
drawParticles();

window.addEventListener("resize", () => {
    cancelAnimationFrame(animationId);
    resizeCanvas();
    drawParticles();
});
