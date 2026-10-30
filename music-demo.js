(() => {
  const player = document.querySelector('.music-player');
  if (!player) return;
  const audio = player.querySelector('.music-audio');
  const button = player.querySelector('.music-toggle');
  const state = player.querySelector('.music-player-state');
  const time = player.querySelector('.music-time');
  const progress = player.querySelector('.music-progress');
  const formatTime = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

  player.querySelectorAll('.music-wave span').forEach((bar, index) => {
    bar.style.setProperty('--bar-index', index);
  });

  function sync() {
    const playing = !audio.paused && !audio.ended;
    player.classList.toggle('is-playing', playing);
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? '暂停示例音乐' : '播放示例音乐');
    button.querySelector('span').textContent = playing ? 'Ⅱ' : '▶';
    state.textContent = playing ? '正在播放' : '点击播放';
    time.textContent = formatTime(audio.currentTime || 0);
    const value = audio.duration ? Math.min(100, audio.currentTime / audio.duration * 100) : 0;
    progress.value = String(value);
    progress.style.setProperty('--played', `${value}%`);
  }

  button.addEventListener('click', async () => {
    if (!audio.paused) {
      audio.pause();
      return;
    }
    try {
      audio.volume = .55;
      state.textContent = '加载中';
      await audio.play();
    } catch {
      state.textContent = '暂时无法播放';
    }
  });
  progress.addEventListener('input', () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = Number(progress.value) / 100 * audio.duration;
    }
  });
  for (const eventName of ['play', 'pause', 'timeupdate', 'loadedmetadata', 'ended']) {
    audio.addEventListener(eventName, sync);
  }
  audio.addEventListener('error', () => { state.textContent = '音频加载失败'; });
  window.addEventListener('pagehide', () => audio.pause());
  sync();
})();
