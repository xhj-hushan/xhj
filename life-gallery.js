(() => {
  const galleries = [...document.querySelectorAll('.life-gallery')];
  if (!galleries.length) return;

  const state = new Map();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeGallery = null;
  let activeIndex = 0;
  let previousFocus = null;

  const dialog = document.createElement('dialog');
  dialog.className = 'life-lightbox';
  dialog.setAttribute('aria-label', '照片详情');
  dialog.innerHTML = `
    <div class="life-lightbox-inner">
      <button class="life-lightbox-close" type="button" aria-label="关闭照片详情">×</button>
      <button class="life-lightbox-arrow life-lightbox-prev" type="button" aria-label="上一张照片">‹</button>
      <figure class="life-lightbox-photo">
        <img alt="">
        <figcaption><span class="life-lightbox-title"></span><span class="life-lightbox-count"></span></figcaption>
      </figure>
      <button class="life-lightbox-arrow life-lightbox-next" type="button" aria-label="下一张照片">›</button>
    </div>`;
  document.body.append(dialog);

  const fullImage = dialog.querySelector('.life-lightbox-photo img');
  const fullTitle = dialog.querySelector('.life-lightbox-title');
  const fullCount = dialog.querySelector('.life-lightbox-count');

  function showDetail(gallery, index) {
    const { figures } = state.get(gallery);
    activeGallery = gallery;
    activeIndex = (index + figures.length) % figures.length;
    const source = figures[activeIndex].querySelector('img');
    fullImage.src = source.src;
    fullImage.alt = source.alt;
    fullTitle.textContent = figures[activeIndex].querySelector('figcaption')?.textContent || '';
    fullCount.textContent = `${activeIndex + 1} / ${figures.length}`;
    fullImage.classList.remove('is-entering');
    void fullImage.offsetWidth;
    fullImage.classList.add('is-entering');
    if (!dialog.open) {
      previousFocus = document.activeElement;
      dialog.showModal();
      dialog.querySelector('.life-lightbox-close').focus();
      galleries.forEach(scheduleAuto);
    }
  }

  function scheduleAuto(gallery) {
    const item = state.get(gallery);
    if (!item) return;
    clearTimeout(item.timer);
    if (!item.visible || item.hovered || dialog.open || document.hidden || reducedMotion.matches) return;
    if (gallery.contains(document.activeElement) && document.activeElement.matches(':focus-visible')) return;
    item.timer = window.setTimeout(() => setSlide(gallery, item.index + 1), 3000);
  }

  function setSlide(gallery, index) {
    const item = state.get(gallery);
    const next = (index + item.figures.length) % item.figures.length;
    item.index = next;
    item.figures.forEach((figure, i) => {
      const selected = i === next;
      figure.classList.toggle('is-current', selected);
      figure.setAttribute('aria-hidden', String(!selected));
      figure.tabIndex = selected ? 0 : -1;
      if (selected) figure.querySelector('img').loading = 'eager';
    });
    item.figures[(next + 1) % item.figures.length].querySelector('img').loading = 'eager';
    item.dots.forEach((dot, i) => {
      dot.classList.toggle('is-current', i === next);
      dot.setAttribute('aria-current', i === next ? 'true' : 'false');
    });
    item.count.textContent = `${String(next + 1).padStart(2, '0')} / ${String(item.figures.length).padStart(2, '0')}`;
    scheduleAuto(gallery);
  }

  galleries.forEach(gallery => {
    const figures = [...gallery.querySelectorAll(':scope > .life-photo')];
    if (!figures.length) return;
    const story = gallery.closest('.life-story');
    const title = story?.querySelector('.life-story-year')?.textContent || '旅行照片';
    const viewport = document.createElement('div');
    viewport.className = 'life-carousel-viewport';
    viewport.setAttribute('aria-label', `${title}照片轮播`);
    figures.forEach(figure => viewport.append(figure));
    const zoomHint = document.createElement('span');
    zoomHint.className = 'life-zoom-hint';
    zoomHint.textContent = '点击查看大图 ↗';
    viewport.append(zoomHint);
    const controls = document.createElement('div');
    controls.className = 'life-carousel-controls';
    controls.innerHTML = '<span class="life-carousel-count" aria-live="polite"></span><div class="life-carousel-dots" aria-label="选择照片"></div><div class="life-carousel-arrows"><button type="button" class="life-carousel-prev" aria-label="上一张照片">←</button><button type="button" class="life-carousel-next" aria-label="下一张照片">→</button></div>';
    gallery.append(viewport, controls);
    const dots = figures.map((_, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', `查看第 ${i + 1} 张照片`);
      button.addEventListener('click', () => setSlide(gallery, i));
      controls.querySelector('.life-carousel-dots').append(button);
      return button;
    });
    state.set(gallery, { figures, dots, count: controls.querySelector('.life-carousel-count'), index: 0, visible: false, hovered: false, timer: 0 });
    controls.querySelector('.life-carousel-prev').addEventListener('click', () => setSlide(gallery, state.get(gallery).index - 1));
    controls.querySelector('.life-carousel-next').addEventListener('click', () => setSlide(gallery, state.get(gallery).index + 1));
    figures.forEach((figure, i) => {
      figure.setAttribute('role', 'button');
      figure.setAttribute('aria-label', `查看大图：${figure.querySelector('img')?.alt || `第 ${i + 1} 张照片`}`);
      figure.addEventListener('click', () => showDetail(gallery, i));
      figure.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          showDetail(gallery, i);
        }
      });
    });
    let touchX = null;
    viewport.addEventListener('touchstart', event => { touchX = event.touches[0]?.clientX ?? null; }, { passive: true });
    viewport.addEventListener('touchend', event => {
      if (touchX === null) return;
      const delta = (event.changedTouches[0]?.clientX ?? touchX) - touchX;
      touchX = null;
      if (Math.abs(delta) > 45) setSlide(gallery, state.get(gallery).index + (delta < 0 ? 1 : -1));
    }, { passive: true });
    gallery.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch') return;
      state.get(gallery).hovered = true;
      scheduleAuto(gallery);
    });
    gallery.addEventListener('pointerleave', () => {
      state.get(gallery).hovered = false;
      scheduleAuto(gallery);
    });
    gallery.addEventListener('focusin', () => scheduleAuto(gallery));
    gallery.addEventListener('focusout', () => window.setTimeout(() => scheduleAuto(gallery), 0));
    setSlide(gallery, 0);
    gallery.classList.add('is-carousel');
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      state.get(entry.target).visible = entry.isIntersecting;
      scheduleAuto(entry.target);
    }), { threshold: 0.15 });
    galleries.forEach(gallery => observer.observe(gallery));
  } else {
    galleries.forEach(gallery => {
      state.get(gallery).visible = true;
      scheduleAuto(gallery);
    });
  }
  document.addEventListener('visibilitychange', () => galleries.forEach(scheduleAuto));
  reducedMotion.addEventListener?.('change', () => galleries.forEach(scheduleAuto));

  dialog.querySelector('.life-lightbox-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.life-lightbox-prev').addEventListener('click', () => showDetail(activeGallery, activeIndex - 1));
  dialog.querySelector('.life-lightbox-next').addEventListener('click', () => showDetail(activeGallery, activeIndex + 1));
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    fullImage.removeAttribute('src');
    previousFocus?.focus();
    activeGallery = null;
    galleries.forEach(scheduleAuto);
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showDetail(activeGallery, activeIndex - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showDetail(activeGallery, activeIndex + 1); }
  });
  let detailTouchX = null;
  dialog.addEventListener('touchstart', event => { detailTouchX = event.touches[0]?.clientX ?? null; }, { passive: true });
  dialog.addEventListener('touchend', event => {
    if (detailTouchX === null || !activeGallery) return;
    const delta = (event.changedTouches[0]?.clientX ?? detailTouchX) - detailTouchX;
    detailTouchX = null;
    if (Math.abs(delta) > 50) showDetail(activeGallery, activeIndex + (delta < 0 ? 1 : -1));
  }, { passive: true });
})();
