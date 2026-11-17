import { initCampus } from './campus.js';

const root = document.getElementById('movement-study');
const campus = root.querySelector('#mv-campus');
const ea = root.querySelector('#mv-ea');
const play = root.querySelector('#mv-play');
const state = { pattern: 'Gather', playing: !matchMedia('(prefers-reduced-motion: reduce)').matches };
let buildingPromise;

function startAnimation(stage, draw) {
  let elapsed = 0, previous, frame, visible = false;
  function tick(now) {
    if (state.playing && previous !== undefined) elapsed += Math.min((now - previous) / 1000, .1);
    previous = now;
    draw(elapsed);
    frame = requestAnimationFrame(tick);
  }
  function schedule() {
    cancelAnimationFrame(frame);
    previous = undefined;
    if (visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  }).observe(stage);
  document.addEventListener('visibilitychange', schedule);
}

function syncPlayback() {
  play.textContent = state.playing ? 'Pause motion' : 'Play motion';
}
play.onclick = () => { state.playing = !state.playing; syncPlayback(); };
syncPlayback();
const patterns = root.querySelectorAll('[data-pattern]');
patterns.forEach(button => button.onclick = () => {
  state.pattern = button.dataset.pattern;
  patterns.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  root.dispatchEvent(new Event('patternchange'));
});

initCampus(root, campus, state, startAnimation);
const views = root.querySelectorAll('[data-view]');
function showView() {
  const building = location.hash === '#ea';
  campus.hidden = building;
  ea.hidden = !building;
  views.forEach(button => button.setAttribute('aria-pressed', String((button.dataset.view === 'ea') === building)));
  if (building && !buildingPromise) {
    buildingPromise = import('./building.js').then(module => module.initBuilding(root, ea, state, startAnimation)).catch(() => {
      ea.querySelector('.mv-caption').textContent = 'The 3D view could not load. Reload the page with WebGL enabled to try again.';
    });
  }
}
views.forEach(button => button.onclick = () => {
  if (button.getAttribute('aria-pressed') === 'true') return;
  history.pushState(null, '', '#' + button.dataset.view);
  showView();
});
window.addEventListener('hashchange', showView);
window.addEventListener('popstate', showView);
showView();
