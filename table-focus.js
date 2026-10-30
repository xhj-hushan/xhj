(() => {
  const scene = document.querySelector('.voice-scene');
  const card = document.querySelector('.bento-focus');
  const lamp = card?.querySelector('.voice-focus-lamp');
  const controls = [...document.querySelectorAll('.focus-person[data-focus]')];
  if (!scene || !card || !lamp || controls.length !== 3) return;

  const people = new Map([
    ['jerry', scene.querySelector('.voice-person-jerry')],
    ['tom', scene.querySelector('.voice-person-tom')],
    ['nana', scene.querySelector('.voice-person-nana')]
  ]);
  const order = ['jerry', 'tom', 'nana'];
  // The three stops cover exactly 45 degrees: one eighth of an ellipse.
  const railStops = { jerry: 225, tom: 247.5, nana: 270 };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let selected = 'jerry';
  let current = null;
  let frame = 0;
  let timer = 0;
  let visible = false;

  function railPosition(degrees, width) {
    const radians = degrees * Math.PI / 180;
    return {
      x: width - 35 + 125 * Math.cos(radians),
      y: 122 + 32 * Math.sin(radians)
    };
  }

  function geometry(name, railAngle = railStops[name]) {
    const image = people.get(name)?.querySelector('img');
    if (!image) return null;
    const cardBox = card.getBoundingClientRect();
    const box = image.getBoundingClientRect();
    const targetX = box.left + box.width / 2 - cardBox.left;
    const targetY = box.top + box.height / 2 - cardBox.top;
    const { x, y } = railPosition(railAngle, cardBox.width);
    const dx = targetX - x;
    const dy = targetY - y;
    return { x, y, railAngle, angle: -Math.atan2(dx, dy) * 180 / Math.PI, length: Math.hypot(dx, dy) };
  }

  function render(state) {
    current = state;
    lamp.style.left = `${state.x}px`;
    lamp.style.top = `${state.y}px`;
    lamp.style.setProperty('--focus-lamp-angle', `${state.angle}deg`);
    lamp.style.setProperty('--focus-beam-length', `${state.length}px`);
    lamp.classList.add('is-ready');
  }

  function focus(name, animate = true) {
    const destination = geometry(name);
    if (!destination) return;
    selected = name;
    controls.forEach(button => {
      const active = button.dataset.focus === name;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    people.forEach((person, key) => person?.classList.toggle('is-focused', key === name));
    if (frame) cancelAnimationFrame(frame);
    if (!animate || reducedMotion.matches || !current) {
      render(destination);
      return;
    }

    const start = { ...current };
    const started = performance.now();
    const deltaAngle = ((destination.angle - start.angle + 540) % 360) - 180;
    const step = now => {
      const t = Math.min(1, (now - started) / 850);
      const ease = t * t * (3 - 2 * t);
      const railAngle = start.railAngle + (destination.railAngle - start.railAngle) * ease;
      const position = railPosition(railAngle, card.getBoundingClientRect().width);
      render({
        ...position,
        railAngle,
        angle: start.angle + deltaAngle * ease,
        length: start.length + (destination.length - start.length) * ease
      });
      frame = t < 1 ? requestAnimationFrame(step) : 0;
    };
    frame = requestAnimationFrame(step);
  }

  function stopCycle() {
    if (timer) clearInterval(timer);
    timer = 0;
  }
  function startCycle() {
    stopCycle();
    if (!visible || reducedMotion.matches || document.hidden) return;
    timer = setInterval(() => focus(order[(order.indexOf(selected) + 1) % order.length]), 5000);
  }
  controls.forEach(button => button.addEventListener('click', () => {
    focus(button.dataset.focus);
    startCycle();
  }));
  card?.addEventListener('focusin', stopCycle);
  card?.addEventListener('focusout', event => {
    if (!card.contains(event.relatedTarget)) startCycle();
  });
  document.addEventListener('visibilitychange', startCycle);
  window.addEventListener('resize', () => focus(selected, false));
  if ('ResizeObserver' in window) {
    const resize = new ResizeObserver(() => focus(selected, false));
    resize.observe(scene);
    resize.observe(card);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      startCycle();
    }, { threshold: .3 }).observe(scene);
  } else visible = true;
  focus(selected, false);
  startCycle();
})();
