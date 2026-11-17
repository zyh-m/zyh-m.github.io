const {THREE,OrbitControls,GLTFLoader} = window.Architecture;
const floorMenu=document.getElementById('floor');
const layoutButtons=[...document.querySelectorAll('[data-layout]')];
const floorNames=['01','02','03','04','05','06','07'];
floorNames.forEach((name,i)=>floorMenu.add(new Option('Level '+name,String(i))));
const layouts={Opened:16,Assembled:3.6,Plan:0};
let mode='Opened',selected=-1, model, camera,renderer,controls;
let routes=[],floorGroups=[],labels=[],phaseRoutes='';
const scene=new THREE.Scene(),flowLayer=new THREE.Group();
scene.add(flowLayer);
const palette={up:'#247b68',down:'#bb6842'};
function focusHeight() {return mode==='Plan'?0:3*layouts[mode];}
function applyCamera() {
  const center=focusHeight();
  camera.up.set(0,1,0);
  controls.target.set(0,center,1);
  if(mode==='Plan') {
    camera.up.set(0,0,-1);
    camera.position.set(0,230,.99);
  } else camera.position.set(117,center+94,185);
  controls.enableRotate=mode!=='Plan';
  camera.zoom=1; controls.update();resize();
}
function resize() {
  const w=stage.clientWidth,h=stage.clientHeight,aspect=w/h;
  renderer.setSize(w,h);
  const visibleHeight=Math.max(mode==='Opened'?153:102,(mode==='Plan'?145:170)/aspect);
  camera.left=-visibleHeight*aspect/2;camera.right=-camera.left;
  camera.top=visibleHeight/2;camera.bottom=-camera.top;camera.updateProjectionMatrix();
}
function renderLayout(resetCamera) {
  floorGroups.forEach((floor,i)=>{
    floor.position.y=i*layouts[mode];
    floor.visible=mode!=='Plan' || i===selected;
    floor.traverse(o=>{
      if(o.userData.floor!==undefined && o.material) o.material.color.set(i===selected?'#b8d4b8':'#e2e5d4');
    });
  });
  layoutButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.layout===mode)));
  floorMenu.value=String(selected);
  const label=selected<0?'All levels':'Level '+floorNames[selected];
  const text={Gather:'Connections converge on one level.',Exchange:'Paired levels exchange movement.',Disperse:'Connections fan out from one level.'};
  caption.textContent=mode==='Plan'?label+' in plan view.':label+' · '+text[state.pattern];
  if(resetCamera && camera)applyCamera();
  phaseRoutes='';
}
function selectFloor(i) {
  selected=i;
  if(mode==='Plan' && i<0) mode='Opened';
  renderLayout(true);
}
floorMenu.onchange=()=>selectFloor(Number(floorMenu.value));
layoutButtons.forEach(button=>button.onclick=()=>{
  mode=button.dataset.layout;
  if(mode==='Plan'&&selected<0)selected=3;
  renderLayout(true);
});
window.addEventListener('patternchange',()=>renderLayout(false));
function routePairs() {
  const mid=selected<0?3:selected;
  if(state.pattern==='Exchange') {
    const pairs=floorGroups.map((_,a)=>[a,(a+2)%floorGroups.length]);
    return selected<0?pairs:pairs.filter(pair=>pair.includes(selected));
  }
  return floorGroups.flatMap((_,i)=>i===mid?[]:[state.pattern==='Gather'?[i,mid]:[mid,i]]);
}
function rebuildRoutes() {
  const key=[mode,state.pattern,selected].join('/');
  if(phaseRoutes===key)return;
  phaseRoutes=key;
  flowLayer.traverse(obj=>{if(obj.geometry)obj.geometry.dispose();if(obj.material)obj.material.dispose();});
  flowLayer.clear();routes=[];
  if(mode==='Plan')return;
  for(const [a,b] of routePairs()) {
    const side=a<b?1:-1;
    const x=68, z=9+side*2,y1=floorGroups[a].position.y+1,y2=floorGroups[b].position.y+1;
    const reach=13+Math.abs(b-a)*2;
    const arc=new THREE.CubicBezierCurve3(new THREE.Vector3(x,y1,z),new THREE.Vector3(x+reach,y1,z+side*5),new THREE.Vector3(x+reach,y2,z+side*5),new THREE.Vector3(x,y2,z));
    const color=a<b?palette.up:palette.down;
    const trace=new THREE.Line(new THREE.BufferGeometry().setFromPoints(arc.getPoints(45)),new THREE.LineBasicMaterial({color,transparent:true,opacity:.58}));
    flowLayer.add(trace);
    for(let k=0;k<3;k++) {
      const dot=new THREE.Mesh(new THREE.SphereGeometry(.65,10,8),new THREE.MeshBasicMaterial({color}));
      flowLayer.add(dot);routes.push({arc,dot,offset:k/3+(a+b)*.057});
    }
  }
}
function placeLabels() {
  const w=stage.clientWidth,h=stage.clientHeight;
  for(let i=0;i<labels.length;i++){
    const label=labels[i];
    label.hidden=!floorGroups[i].visible||mode==='Assembled';
    const p=new THREE.Vector3(-67,floorGroups[i].position.y+1,22).project(camera);
    label.style.left=(w*(1+p.x)/2-18)+'px';label.style.top=(h*(1-p.y)/2-5)+'px';
  }
}
async function startModel() {
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setClearColor('#ebece1');stage.append(renderer.domElement);
  camera=new THREE.OrthographicCamera(-110,110,110,-110,.1,1200);
  controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;
  controls.minZoom=.7;controls.maxZoom=3.8;controls.maxPolarAngle=Math.PI*.49;
  scene.add(new THREE.AmbientLight('#ffffff',1.65));
  const light=new THREE.DirectionalLight('#fff8e8',2.1);light.position.set(-60,150,80);scene.add(light);
  const gltf=await new GLTFLoader().loadAsync('./ea.glb');
  model=gltf.scene;scene.add(model);
  model.traverse(node=>{if(node.userData.level)floorGroups.push(node);});
  floorGroups.sort((a,b)=>a.userData.level.localeCompare(b.userData.level));
  floorGroups.forEach((floor,i)=>{
    floor.traverse(o=>{
      if(!o.material)return;
      if(o.isLineSegments){o.material=new THREE.LineBasicMaterial({color:'#53665a',transparent:true,opacity:.61});}
      else if(o.isLine)o.visible=false;
      else if(o.isMesh){
        const plate=o.userData.floor!==undefined;
        o.material=new THREE.MeshStandardMaterial({color:plate?'#e2e5d4':'#9fac97',roughness:.95,side:THREE.DoubleSide});
      }
    });
    const label=document.createElement('span');label.className='floor-label';label.textContent='L'+floorNames[i];stage.append(label);labels.push(label);
  });
  renderLayout(true);new ResizeObserver(resize).observe(stage);
  startAnimation(()=>{
    controls.update();rebuildRoutes();
    for(const p of routes)p.dot.position.copy(p.arc.getPointAt((state.time*.19+p.offset)%1));
    placeLabels();renderer.render(scene,camera);
  });
}
startModel().catch(()=>{
  caption.textContent='The model requires WebGL. Enable graphics acceleration and reopen this page.';
  stage.replaceChildren(Object.assign(document.createElement('p'),{className:'error',textContent:'3D preview unavailable in this browser.'}));
});
