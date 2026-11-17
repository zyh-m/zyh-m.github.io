export function initCampus(root, panel, state, startAnimation) {
  const stage = panel.querySelector('.mv-stage');
  const caption = panel.querySelector('.mv-caption');
  const mapCanvas = panel.querySelector('canvas');
  const context = mapCanvas.getContext('2d');
  const base = panel.querySelector('#mv-basemap');
  const focus = panel.querySelector('#mv-district');
  // Label positions are placed on the static campus illustration.
  const places = [
    {name:'University Town', x:.19, y:.21, side:1},
    {name:'Engineering', x:.185, y:.606, side:1},
    {name:'Arts & Social Sciences', x:.255, y:.817, side:-1},
    {name:'Central Library', x:.30, y:.731, side:1},
    {name:'University Hall', x:.509, y:.616, side:-1},
    {name:'Science', x:.624, y:.628, side:1},
    {name:'Medicine', x:.715, y:.618, side:-1},
    {name:'Business', x:.401, y:.862, side:1},
    {name:'Design', x:.151, y:.707, side:-1}
  ];
  const exchangeOrder = [0,1,3,5,6,4,7,2,8];
  const colors = ['#85ebd2','#ffc18b'];
  let selection = -1;
  let hits = [];
  let width, height, frame;
  function connections() {
    const hub = selection < 0 ? 3 : selection;
    if (state.pattern === 'Exchange') {
      const pairs = exchangeOrder.map((a,i) => [a, exchangeOrder[(i+1)%exchangeOrder.length]]);
      const activePairs=selection < 0 ? pairs : pairs.filter(([a,b]) => a===hub || b===hub);
      return activePairs.flatMap(([a,b]) => [[a,b],[b,a]]);
    }
    return places.flatMap((_,i) => i===hub ? [] : [state.pattern==='Gather' ? [i,hub] : [hub,i]]);
  }
  function updateCampus() {
    const hub = places[selection < 0 ? 3 : selection].name;
    const messages = {Gather:'Illustrative arrivals at ' + hub + '.', Exchange:selection<0?'Connections pass between campus districts.':'Exchange around ' + hub + '.', Disperse:'Illustrative departures from ' + hub + '.'};
    caption.textContent = messages[state.pattern];
  }
  places.forEach((p,i) => focus.add(new Option(p.name,String(i))));
  function selectPlace(index) { selection = index; focus.value=String(index); updateCampus(); }
  focus.onchange = () => selectPlace(Number(focus.value));
  root.addEventListener('patternchange',updateCampus);
  updateCampus();
  function fit() {
    width=stage.clientWidth; height=stage.clientHeight;
    const dpr=Math.min(devicePixelRatio,2);
    mapCanvas.width=width*dpr; mapCanvas.height=height*dpr;
    context.setTransform(dpr,0,0,dpr,0,0);
    const h=Math.min(height*.97,width/1.19), w=h*1.15;
    frame={left:(width-w)/2,top:(height-h)/2,w,h};
  }
  new ResizeObserver(fit).observe(stage);
  fit();
  function pos(p) {return {x:frame.left+p.x*frame.w,y:frame.top+p.y*frame.h};}
  function curvePoint(a,b,c,t) {
    const u=1-t;
    return {x:u*u*a.x+2*u*t*c.x+t*t*b.x,y:u*u*a.y+2*u*t*c.y+t*t*b.y};
  }
  function drawRoute(pair,i,time) {
    const [from,to]=pair, a=pos(places[from]), b=pos(places[to]);
    const dx=b.x-a.x, dy=b.y-a.y, bend=.27+(i%3)*.09;
    const c={x:(a.x+b.x)/2-dy*bend,y:(a.y+b.y)/2+dx*bend-Math.abs(dx)*.18};
    const color=colors[state.pattern==='Gather'?0:state.pattern==='Disperse'?1:i%2];
    context.beginPath();context.moveTo(a.x,a.y);context.quadraticCurveTo(c.x,c.y,b.x,b.y);
    context.strokeStyle=color;context.globalAlpha=.48;context.lineWidth=1.05;context.stroke();context.globalAlpha=1;
    for(let k=0;k<3;k++) {
      const t=(time*(.12+i%3*.012)+k/3+i*.117)%1;
      const p=curvePoint(a,b,c,t);
      context.beginPath();
      for(let j=0;j<=6;j++) {
        const tail=curvePoint(a,b,c,Math.max(0,t-(6-j)*.006));
        if(j===0)context.moveTo(tail.x,tail.y);else context.lineTo(tail.x,tail.y);
      }
      context.globalAlpha=.70;context.lineWidth=1.5;context.stroke();
      context.globalAlpha=1;context.fillStyle=color;context.shadowColor=color;context.shadowBlur=10;
      context.beginPath();context.arc(p.x,p.y,2.1,0,Math.PI*2);context.fill();context.shadowBlur=0;
    }
  }
  function drawPlaces() {
    hits=[]; const boxes=[];
    const order=[...places.keys()].sort((a,b)=>Number(b===selection)-Number(a===selection));
    for (const i of order) {
      const place=places[i], p=pos(place), active=i===selection;
      hits.push({...p,index:i});
      context.beginPath();context.arc(p.x,p.y,active?5:3.1,0,Math.PI*2);
      context.fillStyle=active?'#ffc18b':'#deefe4';context.fill();
      context.strokeStyle=active?'#ffc18b':'#8fe5cb';context.globalAlpha=.5;
      context.beginPath();context.arc(p.x,p.y,active?10:6,0,Math.PI*2);context.lineWidth=.9;context.stroke();context.globalAlpha=1;
      context.font=(active?'600 ':'500 ')+(width<500?10:12)+'px -apple-system, sans-serif';
      const label=place.name, tw=context.measureText(label).width;
      const start=place.side>0 ? p.x+9 : p.x-tw-9;
      const x=Math.max(7, Math.min(width-tw-7,start));
      const baselines=[p.y-10,p.y+18,p.y-26,p.y+33,p.y-42];
      const y=baselines.find(y=>!boxes.some(b=>x<b.r+4 && x+tw>b.l-4 && y>b.t-3 && y-11<b.b+3));
      if(y===undefined)continue;
      boxes.push({l:x,r:x+tw,t:y-11,b:y+2});
      context.lineJoin='round';context.strokeStyle='#102024';context.lineWidth=4;context.strokeText(label,x,y);
      context.fillStyle=active?'#ffdfbb':'#e2eae3';context.fillText(label,x,y);
    }
  }
  mapCanvas.onclick = event => {
    const rect=mapCanvas.getBoundingClientRect(), x=event.clientX-rect.left,y=event.clientY-rect.top;
    const hit=hits.reduce((best,h)=>Math.hypot(x-h.x,y-h.y)<Math.hypot(x-best.x,y-best.y)?h:best,hits[0]);
    if(hit && Math.hypot(x-hit.x,y-hit.y)<18) selectPlace(hit.index===selection?-1:hit.index);
  };
  function drawCampus(time) {
    context.clearRect(0,0,width,height);
    context.fillStyle='#122224';context.fillRect(0,0,width,height);
    context.fillStyle='#29403e';
    for(let x=14;x<width;x+=19)for(let y=13;y<height;y+=19)context.fillRect(x,y,.9,.9);
    if(base.complete && base.naturalWidth)context.drawImage(base,frame.left,frame.top,frame.w,frame.h);
    connections().forEach((pair, i) => drawRoute(pair, i, time));drawPlaces();
  }
  startAnimation(stage, drawCampus);
}
