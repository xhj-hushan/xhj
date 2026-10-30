(() => {
  const buttons = [...document.querySelectorAll('.prop-option[data-prop]')];
  const people = [...document.querySelectorAll('.voice-person')];
  const status = document.querySelector('.prop-status');
  if (!buttons.length || !people.length) return;

  const props = {
    tomato: { image: 'assets/game-prop-tomato.svg', sound: 'assets/game-prop-tomato.mp3', name: '番茄' },
    flower: { image: 'assets/game-prop-flower.svg', sound: 'assets/game-prop-flower.mp3', name: '鲜花' },
    turkey: { image: 'assets/game-prop-roast-chicken.svg', sound: 'assets/game-prop-roast-chicken.mp3', name: '烤鸡' }
  };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const center = box => ({ x: box.left + box.width / 2, y: box.top + box.height / 2 });

  function showImpact(person, kind) {
    const impact = document.createElement('span');
    impact.className = 'prop-impact';
    impact.dataset.prop = kind;
    impact.setAttribute('aria-hidden', 'true');
    for (let index = 0; index < 7; index += 1) {
      const particle = document.createElement('i');
      particle.style.setProperty('--angle', `${index * 360 / 7}deg`);
      impact.append(particle);
    }
    person.append(impact);
    person.classList.remove('prop-hit');
    void person.offsetWidth;
    person.classList.add('prop-hit');
    window.setTimeout(() => {
      impact.remove();
      person.classList.remove('prop-hit');
    }, reducedMotion.matches ? 850 : 1450);
  }

  function playSound(file) {
    const audio = new Audio(file);
    audio.volume = .7;
    void audio.play().catch(() => {});
  }

  function throwProp(button) {
    const kind = button.dataset.prop;
    const prop = props[kind];
    const person = people[Math.floor(Math.random() * people.length)];
    const avatar = person.querySelector('img');
    if (!prop || !avatar) return;

    const name = person.querySelector('b')?.textContent || '牌友';
    if (status) status.textContent = `${prop.name}送给了 ${name}`;
    playSound(prop.sound);

    if (reducedMotion.matches || typeof Element.prototype.animate !== 'function') {
      showImpact(person, kind);
      return;
    }

    const from = center(button.getBoundingClientRect());
    const to = center(avatar.getBoundingClientRect());
    const control = {
      x: (from.x + to.x) / 2,
      y: Math.min(from.y, to.y) - Math.min(145, Math.max(65, Math.abs(to.y - from.y) * .23))
    };
    const flight = document.createElement('span');
    flight.className = 'prop-flight';
    flight.dataset.prop = kind;
    flight.setAttribute('aria-hidden', 'true');
    const image = document.createElement('img');
    image.src = prop.image;
    image.alt = '';
    flight.append(image);
    document.body.append(flight);

    const frames = Array.from({ length: 31 }, (_, index) => {
      const progress = index / 30;
      const remaining = 1 - progress;
      const x = remaining * remaining * from.x + 2 * remaining * progress * control.x + progress * progress * to.x;
      const y = remaining * remaining * from.y + 2 * remaining * progress * control.y + progress * progress * to.y;
      const rotation = kind === 'tomato' ? -35 + progress * 390 : kind === 'flower' ? -16 + progress * 28 : -5 + progress * 12;
      const scale = .72 + .42 * Math.sin(Math.PI * progress) + .12 * progress;
      return {
        transform: `translate3d(${x - 27}px, ${y - 27}px, 0) scale(${scale}) rotate(${rotation}deg)`,
        opacity: Math.min(1, progress * 10)
      };
    });
    const animation = flight.animate(frames, { duration: 720, easing: 'linear', fill: 'forwards' });
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      flight.remove();
      if (person.isConnected) showImpact(person, kind);
    };
    void animation.finished.then(finish, finish);
    window.setTimeout(finish, 760);
  }

  buttons.forEach(button => button.addEventListener('click', () => throwProp(button)));
})();
