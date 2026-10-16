/* =======================================================================
   NEURAL FIELD / CANVAS PARTICLE ENGINE
   A lightweight, dependency-free ambient system for the portfolio.
   Includes: responsive canvas, constellation links, pointer repulsion,
   low-power mode, page visibility pause, and reduced-motion support.
   ======================================================================= */
(() => {
  'use strict';
  if (document.querySelector('#particles-bg')) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'particles-bg';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.setAttribute('role', 'presentation');
  document.body.prepend(canvas);

  const context = canvas.getContext('2d', { alpha: true, desynchronized: true });
  if (!context) return;

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointerQuery = window.matchMedia('(pointer: coarse)');
  const lowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  const state = {
    width: 0,
    height: 0,
    pixelRatio: 1,
    nodes: [],
    frame: 0,
    lastFrame: 0,
    running: false,
    pointer: { x: -1000, y: -1000, active: false },
    reducedMotion: reducedMotionQuery.matches,
    maxDistance: 130,
    baseCount: 42,
    resizeObserver: null
  };

  const random = (min, max) => min + Math.random() * (max - min);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function createNode() {
    const angle = random(0, Math.PI * 2);
    const speed = random(0.04, 0.19);
    return {
      x: random(0, state.width),
      y: random(0, state.height),
      originX: random(0, state.width),
      originY: random(0, state.height),
      radius: random(0.65, 1.8),
      alpha: random(0.2, 0.68),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      phase: random(0, Math.PI * 2),
      pulseSpeed: random(0.003, 0.012),
      hue: Math.random() > 0.82 ? 215 : 225
    };
  }

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 1.7);
    state.width = Math.max(1, window.innerWidth);
    state.height = Math.max(1, window.innerHeight);
    state.pixelRatio = ratio;
    canvas.width = Math.floor(state.width * ratio);
    canvas.height = Math.floor(state.height * ratio);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    state.maxDistance = state.width < 600 ? 92 : state.width < 1000 ? 112 : 142;

    const density = lowPower ? 1 / 42000 : 1 / 23500;
    const count = state.reducedMotion ? 0 : clamp(Math.floor(state.width * state.height * density), 18, coarsePointerQuery.matches ? 52 : 86);
    state.nodes = Array.from({ length: count }, createNode);
    drawStaticField();
  }

  function drawStaticField() {
    context.clearRect(0, 0, state.width, state.height);
    if (state.reducedMotion) {
      state.nodes.forEach(drawNode);
      return;
    }
  }

  function drawNode(node, index = 0) {
    const twinkle = 0.72 + Math.sin(node.phase + index) * 0.2;
    context.beginPath();
    context.arc(node.x, node.y, node.radius * (0.85 + twinkle * 0.15), 0, Math.PI * 2);
    context.fillStyle = `rgba(49, 92, 255, ${node.alpha * twinkle})`;
    context.fill();

    if (node.radius > 1.45) {
      context.beginPath();
      context.arc(node.x, node.y, node.radius * 3.4, 0, Math.PI * 2);
      context.fillStyle = `rgba(49, 92, 255, ${node.alpha * 0.055})`;
      context.fill();
    }
  }

  function drawConnections() {
    const maxDistanceSquared = state.maxDistance * state.maxDistance;
    for (let first = 0; first < state.nodes.length; first += 1) {
      const a = state.nodes[first];
      for (let second = first + 1; second < state.nodes.length; second += 1) {
        const b = state.nodes[second];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared > maxDistanceSquared) continue;
        const distance = Math.sqrt(distanceSquared);
        const opacity = (1 - distance / state.maxDistance) * 0.115;
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.strokeStyle = `rgba(70, 102, 190, ${opacity})`;
        context.lineWidth = 0.65;
        context.stroke();
      }
    }
  }

  function updateNodes(delta) {
    const step = Math.min(delta / 16.67, 2);
    for (const node of state.nodes) {
      node.phase += node.pulseSpeed * step;
      node.x += node.vx * step;
      node.y += node.vy * step;

      if (node.x < -12) node.x = state.width + 12;
      else if (node.x > state.width + 12) node.x = -12;
      if (node.y < -12) node.y = state.height + 12;
      else if (node.y > state.height + 12) node.y = -12;

      if (state.pointer.active && !coarsePointerQuery.matches) {
        const dx = node.x - state.pointer.x;
        const dy = node.y - state.pointer.y;
        const distanceSquared = dx * dx + dy * dy;
        const radius = 110;
        if (distanceSquared < radius * radius && distanceSquared > 0.01) {
          const distance = Math.sqrt(distanceSquared);
          const force = (1 - distance / radius) * 0.36 * step;
          node.x += (dx / distance) * force;
          node.y += (dy / distance) * force;
        }
      }
    }
  }

  function render(timestamp = 0) {
    if (!state.running || document.hidden) return;
    const delta = state.lastFrame ? timestamp - state.lastFrame : 16.67;
    state.lastFrame = timestamp;
    context.clearRect(0, 0, state.width, state.height);

    if (!state.reducedMotion) updateNodes(delta);
    drawConnections();
    state.nodes.forEach(drawNode);

    // A soft, low-opacity radial signal follows the pointer on precise devices.
    if (state.pointer.active && !coarsePointerQuery.matches && !state.reducedMotion) {
      const glow = context.createRadialGradient(state.pointer.x, state.pointer.y, 0, state.pointer.x, state.pointer.y, 150);
      glow.addColorStop(0, 'rgba(49, 92, 255, 0.045)');
      glow.addColorStop(1, 'rgba(49, 92, 255, 0)');
      context.fillStyle = glow;
      context.fillRect(state.pointer.x - 150, state.pointer.y - 150, 300, 300);
    }

    if (!state.reducedMotion) state.frame = window.requestAnimationFrame(render);
  }

  function start() {
    if (state.running || document.hidden) return;
    state.running = true;
    state.lastFrame = 0;
    if (state.reducedMotion) {
      render();
      return;
    }
    state.frame = window.requestAnimationFrame(render);
  }

  function stop() {
    state.running = false;
    if (state.frame) window.cancelAnimationFrame(state.frame);
    state.frame = 0;
  }

  function onMotionPreferenceChange(event) {
    state.reducedMotion = event.matches;
    stop();
    resize();
    start();
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', (event) => {
    if (coarsePointerQuery.matches) return;
    state.pointer.x = event.clientX;
    state.pointer.y = event.clientY;
    state.pointer.active = true;
  }, { passive: true });
  window.addEventListener('pointerleave', () => { state.pointer.active = false; }, { passive: true });
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  if (reducedMotionQuery.addEventListener) reducedMotionQuery.addEventListener('change', onMotionPreferenceChange);
  else if (reducedMotionQuery.addListener) reducedMotionQuery.addListener(onMotionPreferenceChange);

  resize();
  start();
})();
