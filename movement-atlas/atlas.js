(() => {
  'use strict';

  // All geometry below is constructed from drawing primitives in arbitrary units.
  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const backdrop = document.createElement('canvas');
  const base = backdrop.getContext('2d');
  const $ = id => document.getElementById(id);
  const preview = new URLSearchParams(location.search).has('preview');
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  let playing = !motionPreference.matches && !preview;
  let visible = false, frame = 0, last = 0, elapsed = 0;
  let width = 1, height = 1, ratio = 1;
  let pattern = 'gather', angle = -0.55, building = false;
  let routes = [], labels = [];

  document.body.classList.toggle('embedded', window.self !== window.top);
  document.body.classList.toggle('preview', preview);
  for (let floor = 1; floor <= 7; floor++) {
    $('level').add(new Option('Level ' + floor, String(floor)));
  }

  function line(g, pts, stroke, weight = 1, close = false, fill = null) {
    g.beginPath();
    pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y));
    if (close) g.closePath();
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (stroke) { g.strokeStyle = stroke; g.lineWidth = weight; g.stroke(); }
  }

  function dot(g, x, y, radius, color) {
    g.fillStyle = color;
    g.beginPath(); g.arc(x, y, radius, 0, Math.PI * 2); g.fill();
  }

  function glow(x, y, radius, warm = false) {
    const tint = warm ? '244,175,105' : '114,243,203';
    const halo = ctx.createRadialGradient(x, y, 0, x, y, radius);
    halo.addColorStop(0, 'rgba(' + tint + ',.67)');
    halo.addColorStop(1, 'rgba(' + tint + ',0)');
    dot(ctx, x, y, radius, halo);
    dot(ctx, x, y, Math.max(1.4, radius / 5), warm ? '#ffe1aa' : '#ddfff4');
  }

  function curve(a, b, c, t) {
    const u = 1 - t;
    return [u*u*a[0] + 2*u*t*b[0] + t*t*c[0], u*u*a[1] + 2*u*t*b[1] + t*t*c[1]];
  }

  function drawCampusBase() {
    base.fillStyle = '#101e21';
    base.fillRect(0, 0, width, height);
    const top = preview ? 0 : width < 640 ? 65 : 42;
    const size = Math.min(width / 2.48, (height - top - 25) / 1.78);
    const cx = width * .5, cy = top + (height - top) * .48;
    base.save();
    base.translate(cx, cy); base.rotate(-.25);
    const block = Math.max(17, size * .12);
    const span = Math.ceil(Math.hypot(width, height) / block / 2) + 2;
    // Repeat split courtyards to create a fictional street texture.
    for (let x = -span; x <= span; x++) for (let y = -span; y <= span; y++) {
      const seed = Math.abs(Math.sin(x * 17.1 + y * 31.6));
      const left = x * block + 2, upper = y * block + 2;
      const side = block * .81;
      base.fillStyle = seed < .22 ? '#163432' : '#203034';
      base.fillRect(left, upper, side, side * .32);
      base.fillRect(left, upper + side * .32, side * .3, side * .65);
      if (seed > .45) base.fillRect(left + side * .57, upper + side * .5, side * .43, side * .47);
    }
    base.restore();
    const shade = base.createRadialGradient(cx, cy, size * .45, cx, cy, Math.max(size * 1.4, width * .59));
    shade.addColorStop(0, 'rgba(16,30,33,0)');
    shade.addColorStop(1, 'rgba(16,30,33,.96)');
    base.fillStyle = shade; base.fillRect(0, 0, width, height);

    const hub = [cx, cy];
    const names = ['Studios', 'Library', 'Gardens', 'Lecture halls', 'Residences'];
    const nodes = names.map((name, i) => {
      const a = i * Math.PI * 2 / names.length - .21;
      return [cx + Math.cos(a) * size * .89, cy + Math.sin(a) * size * .66];
    });
    routes = [];
    nodes.forEach((point, i) => {
      const dest = pattern === 'exchange' ? nodes[(i + 1) % nodes.length] : hub;
      const bend = .22 + .05 * (i % 2);
      const ctrl = [(point[0] + dest[0]) / 2 - (dest[1] - point[1]) * bend,
        (point[1] + dest[1]) / 2 + (dest[0] - point[0]) * bend];
      const path = t => curve(point, ctrl, dest, t);
      routes.push(path);
      const pts = Array.from({length: 41}, (_, j) => path(j / 40));
      const warm = i % 3 === 1;
      line(base, pts, warm ? '#44382c' : '#173f3b', 6);
      line(base, pts, warm ? '#9b7451' : '#458579', 1.15);
    });
    labels = [...nodes.map((point, i) => ({point, name: names[i]})), {point: hub, name: 'Commons'}];
  }

  function drawCampus() {
    ctx.drawImage(backdrop, 0, 0, width, height);
    routes.forEach((path, i) => {
      for (let j = 0; j < 3; j++) {
        const phase = (elapsed * .095 + j / 3 + i * .13) % 1;
        const direction = pattern === 'disperse' ? -1 : 1;
        const t = direction === 1 ? phase : 1 - phase;
        const trail = Array.from({length: 8}, (_, k) => path(Math.min(1, Math.max(0, t - direction * (7-k) * .008))));
        line(ctx, trail, i % 3 === 1 ? '#dfa76a' : '#82d8ba', 1.8);
        glow(...path(t), 8, i % 3 === 1);
      }
    });
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.font = '500 ' + (width < 480 ? 10 : 12) + 'px system-ui';
    labels.forEach(({point: [x, y], name}) => {
      dot(ctx, x, y, 3.6, '#cee0d3');
      const labelWidth = ctx.measureText(name).width;
      ctx.fillStyle = '#132326'; ctx.fillRect(x-labelWidth/2-4, y+6, labelWidth+8, 17);
      ctx.fillStyle = '#e2ece5'; ctx.fillText(name, x, y+8);
    });
  }

  function drawBuilding() {
    const focus = $('level').value;
    const all = focus === 'all';
    const floors = all ? [1,2,3,4,5,6,7] : [Number(focus)];
    const top = width < 650 ? 65 : 42;
    const scale = Math.min(width / 13, (height - top - 30) / (all ? 10.7 : 5.7));
    const cx = width * .5, cy = top + (height - top - 24) * .5 + (all ? 3.3 : .25) * scale;
    const co = Math.cos(angle), si = Math.sin(angle);
    const project = (x, y, z) => [cx + (x*co-y*si)*scale, cy + ((x*si+y*co)*.45-z)*scale];
    const dep = (x,y) => x*si + y*co;
    ctx.fillStyle = '#f1eee5'; ctx.fillRect(0, 0, width, height);
    for (let k = -10; k <= 10; k++) {
      line(ctx, [project(-10,k,-.16), project(10,k,-.16)], '#e2dfd4', .7);
      line(ctx, [project(k,-10,-.16), project(k,10,-.16)], '#e2dfd4', .7);
    }
    const plate = [[-4,-1.8],[4,-1.8],[4,1.8],[2,1.8],[2,.4],[-2,.4],[-2,1.8],[-4,1.8]];
    for (const floor of floors) {
      const z = all ? (floor-1)*1.12 : 0;
      const outline = h => plate.map(([x,y]) => project(x,y,h));
      line(ctx, outline(z-.10), '#64847b', 1, true, '#aabcb0');
      line(ctx, outline(z), '#668378', 1, true, '#d4dfcf');
      const walls = [];
      function wall(x1,y1,x2,y2,h) {
        walls.push({depth: dep((x1+x2)/2,(y1+y2)/2),
          points: [project(x1,y1,z), project(x2,y2,z), project(x2,y2,z+h), project(x1,y1,z+h)]});
      }
      wall(-4,-1.8,4,-1.8,.36);
      for (const side of [-1,1]) {
        wall(side*4,-1.8,side*4,1.8,.36);
        wall(side*2,.4,side*2,1.8,.32);
        wall(side*4,1.8,side*2,1.8,.28);
      }
      for (let bay = -3; bay < 4; bay++) {
        wall(bay,-1.8,bay,-.81,.34);
        wall(bay,-.81,bay+.65,-.81,.34);
      }
      // Repeat the same illustrative wall system on every storey.
      walls.sort((a,b) => a.depth-b.depth);
      for (const w of walls) line(ctx, w.points, '#647f75', .8, true, '#edf0df');
      const y = -.24;
      const corridor = t => project(t, y, z+.03);
      line(ctx, [corridor(-3.65),corridor(3.65)], '#488977', 1.6);
      for (let lane = 0; lane < 2; lane++) {
        const t = (elapsed*.15 + floor*.17 + lane*.36) % 1;
        const side = lane ? -1 : 1;
        const x = pattern === 'exchange' ? (2*t-1)*side : side*(pattern === 'gather' ? 1-t : t);
        const [px,py] = corridor(x*3.65);
        dot(ctx, px,py,4.5,'#a9cfaf'); dot(ctx,px,py,2.4,'#136653');
      }
    }
  }

  function draw() { if (building) drawBuilding(); else drawCampus(); }
  function resize() {
    const box = canvas.getBoundingClientRect();
    width = Math.max(1, box.width); height = Math.max(1, box.height);
    ratio = Math.min(devicePixelRatio || 1, 2);
    for (const surface of [canvas, backdrop]) {
      surface.width = Math.round(width * ratio); surface.height = Math.round(height * ratio);
      surface.getContext('2d').setTransform(ratio,0,0,ratio,0,0);
    }
    if (!building) drawCampusBase();
    draw();
  }
  function animate(now) {
    if (last) elapsed += Math.min((now-last)/1000, .1);
    last = now; draw(); frame = requestAnimationFrame(animate);
  }
  function schedule() {
    cancelAnimationFrame(frame); last = 0;
    $('motion').textContent = playing ? 'Pause motion' : 'Play motion';
    if (playing && visible && !document.hidden) frame = requestAnimationFrame(animate);
  }
  function switchView() {
    building = !preview && location.hash === '#ea';
    document.body.classList.toggle('ea', building);
    $('architecture').hidden = $('hint').hidden = !building;
    $('heading').textContent = building ? 'Inside EA.' : 'Campus currents.';
    $('kicker').textContent = building ? 'Building scale · schematic' : 'Campus scale';
    canvas.setAttribute('aria-label', building ? 'Rotatable schematic of floor plates, partitions and simulated corridor movement.' : 'Simulated flow between fictional campus districts.');
    for (const [id, active] of [['ea-link',building],['campus-link',!building]]) {
      if (active) $(id).setAttribute('aria-current','page');
      else $(id).removeAttribute('aria-current');
    }
    resize();
  }
  $('patterns').addEventListener('click', event => {
    const button = event.target.closest('[data-pattern]');
    if (!button) return;
    pattern = button.dataset.pattern;
    for (const item of $('patterns').children) item.setAttribute('aria-pressed', String(item === button));
    if (!building) drawCampusBase();
    draw();
  });
  $('level').addEventListener('change', draw);
  $('rotate').addEventListener('click', () => { angle += Math.PI/8; draw(); });
  let dragX = null;
  canvas.addEventListener('pointerdown', event => {
    if (!building) return;
    dragX = event.clientX; canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (dragX === null) return;
    angle += (event.clientX-dragX)*.013; dragX = event.clientX; draw();
  });
  canvas.addEventListener('lostpointercapture', () => { dragX = null; });
  $('motion').addEventListener('click', () => { playing = !playing; schedule(); });
  motionPreference.addEventListener('change', () => { playing = !motionPreference.matches && !preview; schedule(); });
  document.addEventListener('visibilitychange', schedule);
  window.addEventListener('hashchange', switchView);
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }).observe(canvas);
  switchView(); schedule();
})();
