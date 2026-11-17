'use strict';
const preview = new URLSearchParams(location.search).has('preview');
document.body.classList.toggle('preview', preview);
const state = {
  pattern: 'Gather',
  playing: !preview && !matchMedia('(prefers-reduced-motion: reduce)').matches,
  time: 0
};
const stage = document.getElementById('stage');
const caption = document.getElementById('figure-caption');
const playButton = document.getElementById('play');
function updatePlayback() {
  playButton.textContent = state.playing ? 'Pause motion' : 'Play motion';
  playButton.setAttribute('aria-pressed', String(state.playing));
  document.getElementById('motion-state').textContent = state.playing ? 'Animation playing' : 'Animation paused';
  document.body.classList.toggle('paused', !state.playing);
}
playButton.onclick = () => { state.playing = !state.playing; updatePlayback(); };
updatePlayback();
for (const name of ['Gather', 'Exchange', 'Disperse']) {
  const button = document.createElement('button');
  button.className = 'choice';
  button.innerHTML = '<span class="dot"></span>' + name + '<small aria-hidden="true">↗</small>';
  button.setAttribute('aria-pressed', String(name === state.pattern));
  button.onclick = () => {
    state.pattern = name;
    for (const other of button.parentElement.children) other.setAttribute('aria-pressed', String(other === button));
    window.dispatchEvent(new Event('patternchange'));
  };
  document.getElementById('patterns').appendChild(button);
}
function startAnimation(draw) {
  let before, frame;
  let visible = false;
  function tick(now) {
    if (state.playing && before !== undefined) state.time += Math.min((now - before) / 1000, .1);
    before = now;
    draw();
    frame = requestAnimationFrame(tick);
  }
  function schedule() {
    cancelAnimationFrame(frame);
    before = undefined;
    if (visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  }).observe(stage);
  document.addEventListener('visibilitychange', schedule);
}
