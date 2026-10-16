/* Portfolio opening sequence — no dependencies, no autoplay media. */
(() => {
  const intro = document.getElementById('portfolio-intro');
  if (!intro) return;

  const skipButton = document.getElementById('intro-skip');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let dismissed = false;
  let closeTimer;

  const dismissIntro = () => {
    if (dismissed) return;
    dismissed = true;
    window.clearTimeout(closeTimer);
    intro.classList.add('is-leaving');
    intro.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('intro-active');
    window.setTimeout(() => {
      intro.classList.add('is-hidden');
      intro.remove();
    }, reducedMotion ? 40 : 900);
  };

  document.body.classList.add('intro-active');
  if (skipButton) skipButton.addEventListener('click', dismissIntro, { once: true });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !dismissed) dismissIntro();
  }, { once: false });

  if (reducedMotion) {
    closeTimer = window.setTimeout(dismissIntro, 650);
  } else {
    closeTimer = window.setTimeout(dismissIntro, 3900);
  }
})();
