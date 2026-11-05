/* Media-only exhibit. No recordings, signal arrays, or label arrays are loaded. */
(() => {
  'use strict';
  const root=document.getElementById('das-story');if(!root)return;
  const $=id=>document.getElementById(id),base=root.dataset.assets+'media/';
  const walking=$('das-walking'),a=$('das-compare-a'),b=$('das-compare-b');
  const button=$('das-compare-play'),slider=$('das-compare-time'),clock=$('das-compare-clock'),status=$('das-compare-status');
  const bands=['0.01–5 Hz','0.01–10 Hz','0.01–20 Hz','0.01–30 Hz','0.1–5 Hz','1–5 Hz','5–10 Hz','10–30 Hz'];
  const mediaNames=Array.from({length:8},(_,i)=>'filter-'+i);
  let time=0,playing=false,starting=false,generation=0;
  function pause(){generation++;starting=false;playing=false;a.pause();b.pause();button.textContent='Play ▶';button.setAttribute('aria-label','Play filter comparison');}
  function display(){const seconds=Math.min(45.056,time*4);slider.value=seconds;slider.setAttribute('aria-valuetext',seconds.toFixed(1)+' seconds');clock.textContent=seconds.toFixed(1)+' / 45.1 s';}
  function ready(){button.disabled=!(a.readyState>=2&&b.readyState>=2);if(!button.disabled)status.textContent='';}
  async function play(){
    if(playing||starting){pause();return;}
    if(button.disabled)return;
    const mine=++generation;starting=true;time=a.currentTime;b.currentTime=time;
    try{await Promise.all([a.play(),b.play()]);if(mine!==generation)return;starting=false;playing=true;button.textContent='Pause Ⅱ';button.setAttribute('aria-label','Pause filter comparison');}
    catch(error){if(mine!==generation)return;pause();status.textContent='Playback could not start. Press Play to retry.';}
  }
  for(const [side,v,initial] of [['a',a,0],['b',b,5]]){
    const select=$('das-filter-'+side);
    bands.forEach((label,i)=>{const option=document.createElement('option');option.value=i;option.textContent=label;select.append(option);});select.value=initial;
    v.addEventListener('loadedmetadata',()=>{v.currentTime=Math.min(time,Math.max(0,v.duration-.05));});
    v.addEventListener('loadeddata',ready);v.addEventListener('canplay',ready);
    v.addEventListener('error',()=>{pause();button.disabled=true;status.textContent='An animation could not be loaded. Try another frequency band or refresh the page.';});
    v.addEventListener('waiting',()=>{if(playing){pause();status.textContent='Buffering the animations. Press Play when ready.';}});
    select.addEventListener('change',()=>{pause();button.disabled=true;status.textContent='Loading selected frequency band…';v.poster=base+mediaNames[Number(select.value)]+'.png?v=paper8';v.src=base+mediaNames[Number(select.value)]+'.mp4?v=paper8';v.setAttribute('aria-label',bands[Number(select.value)]+' filtered signal animation');v.load();});
    if(v.readyState>=1)v.currentTime=Math.min(time,Math.max(0,v.duration-.05));
  }
  a.addEventListener('timeupdate',()=>{if(playing){time=a.currentTime;if(Math.abs(b.currentTime-time)>.15)b.currentTime=time;display();}});
  a.addEventListener('ended',()=>{pause();time=0;a.currentTime=0;b.currentTime=0;display();});
  slider.addEventListener('input',()=>{pause();time=Number(slider.value)/4;for(const v of [a,b])if(v.readyState>=1)v.currentTime=Math.min(time,v.duration);display();});
  button.addEventListener('click',play);
  // Timing constants describe the rendered media, not measured signal/label arrays.
  // Source frames span 6–42.9167 s, encoded at 24 fps and 2× real time.
  const walkPlay=$('das-walk-play'),walkTime=$('das-walk-time'),walkClock=$('das-walk-clock');
  const walkSpeed=$('das-walk-speed'),walkStatus=$('das-media-status');
  const walkBack=$('das-walk-back'),walkNext=$('das-walk-next');
  let walkGeneration=0,walkStarting=false,walkFrame=0;
  walking.controls=false;$('das-walk-controls').hidden=false;
  function walkEnd(){return Number.isFinite(walking.duration)?Math.max(0,walking.duration-1/24):18.458333;}
  function walkDisplay(){
    const current=6+Math.min(walking.currentTime,walkEnd())*2,end=6+walkEnd()*2;
    walkTime.max=String(end);walkTime.value=String(current);
    walkTime.setAttribute('aria-valuetext',current.toFixed(2)+' seconds');
    walkClock.textContent=current.toFixed(1)+' / '+end.toFixed(1)+' s';
  }
  function walkButton(){
    const running=!walking.paused&&!walking.ended;
    walkPlay.textContent=running?'Pause Ⅱ':'Play ▶';
    walkPlay.setAttribute('aria-label',running?'Pause walking passage':'Play walking passage');
  }
  function walkPause(){walkGeneration++;walkStarting=false;walking.pause();cancelAnimationFrame(walkFrame);walkButton();}
  function walkReady(){
    const loaded=walking.readyState>=2;
    for(const el of [walkPlay,walkTime,walkBack,walkNext])el.disabled=!loaded;
    if(loaded)walkStatus.textContent='';walkDisplay();
  }
  function walkTick(){walkDisplay();if(!walking.paused&&!walking.ended)walkFrame=requestAnimationFrame(walkTick);}
  function walkSeek(mediaTime){
    walkPause();if(walking.readyState<1)return;
    walking.currentTime=Math.max(0,Math.min(walkEnd(),Math.round(mediaTime*24)/24));walkDisplay();
  }
  walkPlay.addEventListener('click',async()=>{
    if(!walking.paused||walkStarting){walkPause();return;}
    if(walkPlay.disabled)return;
    if(walking.currentTime>=walkEnd())walking.currentTime=0;
    const mine=++walkGeneration;walkStarting=true;
    try{await walking.play();if(mine!==walkGeneration)return;walkStarting=false;walkButton();}
    catch(error){if(mine!==walkGeneration)return;walkPause();walkStatus.textContent='Playback could not start. Press Play to retry.';}
  });
  walkTime.addEventListener('input',()=>walkSeek((Number(walkTime.value)-6)/2));
  walkBack.addEventListener('click',()=>walkSeek(walking.currentTime-1/24));
  walkNext.addEventListener('click',()=>walkSeek(walking.currentTime+1/24));
  walkSpeed.addEventListener('change',()=>{walking.playbackRate=Number(walkSpeed.value)/2;});
  $('das-walk-focus').addEventListener('click',()=>{
    const focused=$('das-walk-stage').classList.toggle('das-fiber-focus');
    $('das-walk-focus').setAttribute('aria-pressed',String(focused));
    $('das-walk-focus').textContent=focused?'Show all signals':'Focus on fiber';
  });
  for(const event of ['loadeddata','canplay'])walking.addEventListener(event,walkReady);
  walking.addEventListener('loadedmetadata',()=>{walking.playbackRate=Number(walkSpeed.value)/2;walkDisplay();});
  walking.addEventListener('play',()=>{cancelAnimationFrame(walkFrame);walkButton();walkTick();});
  walking.addEventListener('pause',()=>{cancelAnimationFrame(walkFrame);walkButton();});
  walking.addEventListener('timeupdate',walkDisplay);
  walking.addEventListener('seeked',walkDisplay);
  walking.addEventListener('ended',()=>{walkPause();walkDisplay();});
  root.querySelectorAll('[data-scene]').forEach(el=>el.addEventListener('click',()=>{
    if(el.getAttribute('aria-pressed')==='true')return;
    walkPause();const scene=el.dataset.scene;
    for(const control of [walkPlay,walkTime,walkBack,walkNext])control.disabled=true;
    walking.poster=base+'walking-'+scene+'.png?v=soft3';walking.src=base+'walking-'+scene+'.mp4?v=soft3';
    walking.setAttribute('aria-label',scene+' passage with measured DAS signal and highlighted existing event labels');walking.load();
    root.querySelectorAll('[data-scene]').forEach(item=>item.setAttribute('aria-pressed',String(item===el)));
    walkStatus.textContent='Loading walking passage…';walkDisplay();
  }));
  walking.addEventListener('error',()=>{walkPause();for(const control of [walkPlay,walkTime,walkBack,walkNext])control.disabled=true;walkStatus.textContent='The walking animation could not be loaded. Refresh to retry, or view the original research figures below.';});
  walkReady();
  document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();walkPause();}});
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{if(!entries[0].isIntersecting){pause();walkPause();}},{threshold:0}).observe(root);
  display();ready();
})();
