/* =======================================================================
   AING / FUTURE INTERFACE LAYER
   Shared non-framework enhancements for every portfolio page except My Love.
   - One native audio element per document (never autoplay)
   - Reading progress and back-to-top controls
   - Small navigation / scroll affordances
   - Reduced-motion and visibility-aware behavior
   ======================================================================= */
(() => {
  'use strict';

  const MUSIC_SOURCE = 'https://files.catbox.moe/z33zfv.mp3';
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');
  const page = document.body;
  if (!page) return;

  const create = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  /* -------------------------- Floating music dock ----------------------- */
  function mountMusicDock() {
    if (document.querySelector('[data-global-music-dock]')) return;

    const dock = create('aside', 'sonic-dock');
    dock.dataset.globalMusicDock = 'true';
    dock.setAttribute('aria-label', 'Music player');

    const audio = create('audio', 'sonic-audio');
    audio.preload = 'none';
    audio.loop = false;
    audio.src = MUSIC_SOURCE;
    audio.setAttribute('aria-label', 'Portfolio background music');

    const visualizer = create('span', 'sonic-visualizer');
    visualizer.setAttribute('aria-hidden', 'true');
    for (let index = 0; index < 4; index += 1) {
      visualizer.appendChild(create('i', `sonic-bar sonic-bar-${index + 1}`));
    }

    const copy = create('span', 'sonic-copy');
    const title = create('span', 'sonic-title', 'SOUND SYSTEM');
    const status = create('span', 'sonic-status', 'Audio standby');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    copy.append(title, status);

    const button = create('button', 'sonic-toggle');
    button.type = 'button';
    button.setAttribute('aria-label', 'Play Music');
    button.setAttribute('aria-pressed', 'false');
    const icon = create('span', 'sonic-icon', '▶');
    icon.setAttribute('aria-hidden', 'true');
    const label = create('span', 'sonic-button-label', 'Play Music');
    button.append(icon, label);

    const ring = create('span', 'sonic-ring');
    ring.setAttribute('aria-hidden', 'true');
    dock.append(ring, visualizer, copy, button, audio);
    page.appendChild(dock);

    let requestInFlight = false;
    let hasPlayed = false;

    const setIdle = (message = 'Audio standby') => {
      dock.classList.remove('is-playing', 'is-loading');
      button.disabled = false;
      button.setAttribute('aria-label', 'Play Music');
      button.setAttribute('aria-pressed', 'false');
      icon.textContent = '▶';
      label.textContent = 'Play Music';
      status.textContent = message;
      requestInFlight = false;
    };

    const setPlaying = () => {
      dock.classList.add('is-playing');
      dock.classList.remove('is-loading');
      button.disabled = false;
      button.setAttribute('aria-label', 'Pause Music');
      button.setAttribute('aria-pressed', 'true');
      icon.textContent = 'Ⅱ';
      label.textContent = 'Pause Music';
      status.textContent = 'Now playing';
      requestInFlight = false;
      hasPlayed = true;
    };

    button.addEventListener('click', async () => {
      if (requestInFlight) return;
      if (!audio.paused && !audio.ended) {
        audio.pause();
        return;
      }
      requestInFlight = true;
      dock.classList.add('is-loading');
      status.textContent = 'Connecting audio…';
      button.disabled = true;
      try {
        await audio.play();
      } catch (_) {
        setIdle('Audio unavailable — try again');
      }
    });

    audio.addEventListener('playing', setPlaying);
    audio.addEventListener('pause', () => {
      if (!audio.ended) setIdle(hasPlayed ? 'Playback paused' : 'Audio standby');
    });
    audio.addEventListener('ended', () => setIdle('Track finished'));
    audio.addEventListener('error', () => setIdle('Audio unavailable — try again'));
    audio.addEventListener('waiting', () => {
      if (!audio.paused) status.textContent = 'Buffering…';
    });
    audio.addEventListener('stalled', () => {
      if (!audio.paused) status.textContent = 'Reconnecting…';
    });
    audio.addEventListener('canplay', () => {
      if (!audio.paused && !audio.ended) status.textContent = 'Now playing';
    });
  }

  /* ------------------------ Scroll progress line ----------------------- */
  function mountReadingProgress() {
    if (document.querySelector('.scroll-signal')) return;
    const signal = create('div', 'scroll-signal');
    signal.setAttribute('aria-hidden', 'true');
    const fill = create('span', 'scroll-signal-fill');
    signal.appendChild(fill);
    page.appendChild(signal);

    let queued = false;
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const percentage = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      fill.style.transform = `scaleX(${Math.min(100, Math.max(0, percentage)) / 100})`;
      queued = false;
    };
    const schedule = () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(update);
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    update();
  }

  /* -------------------------- Back-to-top ------------------------------ */
  function mountBackToTop() {
    if (document.querySelector('.back-to-top')) return;
    const button = create('button', 'back-to-top', '↑');
    button.type = 'button';
    button.setAttribute('aria-label', 'Back to top');
    button.title = 'Back to top';
    page.appendChild(button);

    let queued = false;
    const update = () => {
      button.classList.toggle('is-visible', window.scrollY > 480);
      queued = false;
    };
    window.addEventListener('scroll', () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: REDUCED_MOTION.matches ? 'auto' : 'smooth' });
    });
    update();
  }

  /* ------------------------- Active navigation ------------------------- */
  function normalizePath(path) {
    return path.split('/').pop() || 'index.html';
  }

  function markCurrentNavigation() {
    const current = normalizePath(window.location.pathname);
    document.querySelectorAll('nav a[href]').forEach((link) => {
      const destination = normalizePath(new URL(link.href, window.location.href).pathname);
      if (destination === current) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  /* ---------------------- Scroll reveal, progressive ------------------- */
  function mountScrollReveal() {
    if (REDUCED_MOTION.matches || !('IntersectionObserver' in window)) return;
    const candidates = document.querySelectorAll('main > section, .hobby-card, .hobby-detail > img, .love-section');
    candidates.forEach((element, index) => {
      if (element.classList.contains('reveal-ready')) return;
      element.classList.add('reveal-ready');
      element.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 65}ms`);
    });
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in-view');
        instance.unobserve(entry.target);
      });
    }, { root: null, threshold: 0.08, rootMargin: '0px 0px -36px 0px' });
    candidates.forEach((element) => observer.observe(element));
  }

  /* ---------------- Persistent audio navigation ---------------------- */
  // Internal page changes are fetched and swapped without unloading this document.
  // The audio element, particle canvas and floating dock therefore remain alive.
  let navigationBusy = false;
  function mountSoftNavigation() {
    document.addEventListener('click', async (event) => {
      const link = event.target.closest('a[href]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || !/\.html?$/.test(url.pathname)) return;
      if (url.pathname.endsWith('/pacar.html')) return;
      if (url.pathname === location.pathname && !url.hash) return;
      if (navigationBusy) return;
      event.preventDefault();
      navigationBusy = true;
      document.documentElement.classList.add('page-transitioning');
      try {
        const response = await fetch(url.href, { headers: { 'X-Requested-With': 'portfolio-navigation' } });
        if (!response.ok) throw new Error('Navigation request failed');
        const html = await response.text();
        const nextDoc = new DOMParser().parseFromString(html, 'text/html');
        const nextMain = nextDoc.querySelector('main');
        const currentMain = document.querySelector('main');
        if (!nextMain || !currentMain) throw new Error('Page layout not compatible');

        // Swap only page content; shared audio and canvas are intentionally untouched.
        const nextNav = nextDoc.querySelector('nav');
        const currentNav = document.querySelector('nav');
        if (nextNav && currentNav) currentNav.replaceWith(document.importNode(nextNav, true));
        currentMain.replaceWith(document.importNode(nextMain, true));
        const nextFooter = nextDoc.querySelector('footer');
        const currentFooter = document.querySelector('footer');
        if (nextFooter && currentFooter) currentFooter.replaceWith(document.importNode(nextFooter, true));
        else if (nextFooter && !currentFooter) document.body.appendChild(document.importNode(nextFooter, true));
        document.title = nextDoc.title || document.title;
        history.pushState({ portfolio: true }, '', url.href);
        window.scrollTo({ top: 0, behavior: REDUCED_MOTION.matches ? 'auto' : 'smooth' });
        markCurrentNavigation();
        mountScrollReveal();
        enhanceEditorialReveal();
        document.body.classList.remove('page-changing');
        document.body.classList.add('page-changed');
        window.setTimeout(() => document.body.classList.remove('page-changed'), 420);
        // Run inline scripts from the incoming page (e.g. contact-page actions).
        nextDoc.querySelectorAll('main script, body > script:not([src])').forEach((oldScript) => {
          const script = document.createElement('script');
          for (const attr of oldScript.attributes) script.setAttribute(attr.name, attr.value);
          script.textContent = oldScript.textContent;
          document.body.appendChild(script);
          script.remove();
        });
        window.dispatchEvent(new CustomEvent('portfolio:pagechange', { detail: { url: url.href } }));
      } catch (error) {
        // Reliable fallback: a normal navigation is preferable to a broken page.
        location.href = url.href;
      } finally {
        navigationBusy = false;
        document.documentElement.classList.remove('page-transitioning');
      }
    });

    window.addEventListener('popstate', async () => {
      // Back/forward swap content too, keeping the existing audio element alive.
      try {
        const response = await fetch(location.href, { headers: { 'X-Requested-With': 'portfolio-navigation' } });
        if (!response.ok) throw new Error('History navigation failed');
        const nextDoc = new DOMParser().parseFromString(await response.text(), 'text/html');
        const nextMain = nextDoc.querySelector('main');
        const currentMain = document.querySelector('main');
        if (!nextMain || !currentMain) throw new Error('Page layout not compatible');
        const nextNav = nextDoc.querySelector('nav');
        const currentNav = document.querySelector('nav');
        if (nextNav && currentNav) currentNav.replaceWith(document.importNode(nextNav, true));
        currentMain.replaceWith(document.importNode(nextMain, true));
        const nextFooter = nextDoc.querySelector('footer');
        const currentFooter = document.querySelector('footer');
        if (nextFooter && currentFooter) currentFooter.replaceWith(document.importNode(nextFooter, true));
        document.title = nextDoc.title || document.title;
        markCurrentNavigation();
        mountScrollReveal();
        enhanceEditorialReveal();
        window.scrollTo({ top: 0, behavior: REDUCED_MOTION.matches ? 'auto' : 'smooth' });
        window.dispatchEvent(new CustomEvent('portfolio:pagechange', { detail: { url: location.href } }));
      } catch (_) { location.reload(); }
    });
  }

  function enhanceEditorialReveal() {
    if (REDUCED_MOTION.matches || !('IntersectionObserver' in window)) return;
    const main = document.querySelector('main');
    if (!main) return;
    document.documentElement.classList.add('reveal-ready');
    const targets = main.querySelectorAll('section, .card, article, figure, h1, h2, .avatar, li');
    targets.forEach((node, index) => {
      if (node.closest('[data-no-reveal]')) return;
      node.dataset.reveal = 'true';
      node.style.transitionDelay = `${Math.min(index % 5, 4) * 55}ms`;
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });
    targets.forEach((node) => observer.observe(node));
  }

  function boot() {
    mountMusicDock();
    mountReadingProgress();
    mountBackToTop();
    markCurrentNavigation();
    mountScrollReveal();
    enhanceEditorialReveal();
    mountSoftNavigation();
    page.classList.add('interface-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
