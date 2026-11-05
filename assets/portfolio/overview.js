/* Research navigation only; no measured signal or label data is embedded. */
(() => {
  const root=document.getElementById('research-portfolio');if(!root)return;
  const tabs=[...root.querySelectorAll('[data-lens]')],panels=[...root.querySelectorAll('[data-project]')];
  const names=['01 / Fiber-optic sensing','02 / Movement & space','03 / Knowledge & rules'];
  function select(index,focus=false){
    tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
    panels.forEach((panel,i)=>{panel.hidden=i!==index;});
    root.querySelector('#rp-position').textContent=names[index];
    if(focus)tabs[index].focus();
  }
  panels.forEach((panel,i)=>{panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',tabs[i].id);panel.tabIndex=0;});
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>select(i));
    tab.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowRight')next=(i+1)%tabs.length;
      if(event.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;
      if(event.key==='Home')next=0;
      if(event.key==='End')next=tabs.length-1;
      if(next!==undefined){event.preventDefault();select(next,true);}
    });
  });
  root.querySelector('.rp-lenses').hidden=false;root.querySelector('.rp-map-hint').hidden=false;
  const linked=panels.findIndex(p=>'#'+p.id===location.hash);select(linked>=0?linked:0);
})();
