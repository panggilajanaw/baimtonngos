/* Subtle monochrome canvas detail; content remains readable above it. */
(() => {
    if (document.querySelector("#particles-bg")) return;

    const canvas = document.createElement("canvas");
    canvas.id = "particles-bg";
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);

    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let dots = [];
    let animationFrame = 0;

    function resizeCanvas() {
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);

        const count = Math.min(34, Math.floor((width * height) / 36000));
        dots = Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.1 + 0.4,
            alpha: Math.random() * 0.16 + 0.05,
            vx: (Math.random() - 0.5) * 0.12,
            vy: (Math.random() - 0.5) * 0.12
        }));
    }

    function draw() {
        context.clearRect(0, 0, width, height);
        for (const dot of dots) {
            if (!reducedMotion) {
                dot.x += dot.vx;
                dot.y += dot.vy;
                if (dot.x < 0 || dot.x > width) dot.vx *= -1;
                if (dot.y < 0 || dot.y > height) dot.vy *= -1;
            }
            context.beginPath();
            context.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
            context.fillStyle = `rgba(17, 17, 17, ${dot.alpha})`;
            context.fill();
        }
        if (!reducedMotion && !document.hidden) {
            animationFrame = window.requestAnimationFrame(draw);
        }
    }

    resizeCanvas();
    draw();
    window.addEventListener("resize", () => {
        window.cancelAnimationFrame(animationFrame);
        resizeCanvas();
        draw();
    });
    document.addEventListener("visibilitychange", () => {
        window.cancelAnimationFrame(animationFrame);
        if (document.hidden) return;
        draw();
    });
})();