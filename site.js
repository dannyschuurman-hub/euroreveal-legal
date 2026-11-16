/* Euromunten. Local, native scroll choreography. No network calls. */
'use strict';
window.krasFrame = function (tick) {
  const progress = Math.max(0, Math.min(14, tick)) / 14;
  const reveal = 1 - Math.pow(1 - progress, 3);
  return { reveal, text: progress === 0 ? '€ ··' : (reveal < .7 ? '€ 2·' : '€ 29') };
};
(() => {
  if (!document.querySelector('.home')) return;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  root.classList.add('js');
  const clamp = v => Math.max(0, Math.min(1, v));
  const segment = (v,a,b) => clamp((v-a)/(b-a));
  const hero=$('.hero'), film=$('.film'), pan=$('.pan');
  let timer=null, revealed=false;
  function paintScratch(tick) {
    const frame=window.krasFrame(tick);
    $('.value').textContent=frame.text;
    $$('.scratch-small').forEach(el=>{el.textContent=frame.text;el.style.setProperty('--scratch',frame.reveal)});
    $('.value-block').style.setProperty('--scratch',frame.reveal);
  }
  function krasOpen() {
    if(timer) return;
    revealed=true;
    let tick=0;paintScratch(0);
    $('.value-block').classList.add('scratching');
    if(motion.matches) { paintScratch(14);return; }
    timer=setInterval(()=>{paintScratch(++tick);if(tick===14){clearInterval(timer);timer=null;$('.value-block').classList.remove('scratching');$$('[data-scratch]').forEach(b=>b.firstChild.textContent=b.dataset.replay+' ');}},64);
  }
  $$('[data-scratch]').forEach(b=>b.addEventListener('click',krasOpen));
  $$('[data-open]').forEach(b=>b.addEventListener('click',()=>{if(motion.matches){krasOpen();return;}const top=film.offsetTop+(film.offsetHeight-innerHeight)*.78;window.scrollTo({top,behavior:'smooth'});krasOpen();}));
  $$('[data-save]').forEach(b=>b.addEventListener('click',()=>{window.scrollTo({top:film.offsetTop+(film.offsetHeight-innerHeight)*.95,behavior:motion.matches?'instant':'smooth'});schedule()}));
  const sectionIds=['avond','scan','herkomst','fabel','boekje','privacy','slot'];
  
  const progress=el=>clamp(-el.getBoundingClientRect().top/(el.offsetHeight-innerHeight));
  function update() {

    let current=0;sectionIds.forEach((id,i)=>{if($('#'+id).getBoundingClientRect().top<=innerHeight*.45)current=i});
    $$('.coin-rail a').forEach((a,i)=>{a.classList.toggle('filled',i<=current);if(i===current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});
    if(current===4)document.body.dataset.light='';else delete document.body.dataset.light;
    if(motion.matches){const rp=$(".rings-panel");rp.inert=false;rp.style.pointerEvents="";paintScratch(14);return;}
    const h=progress(hero),f=progress(film),p=progress(pan);
    const dive=segment(h,.42,1);
    $('.camera').style.transform=`scale(${1+dive*2.8}) translateY(${-dive*13}%)`;
    $('.hero-word').style.transform=`translateY(${h*300}px)`;
    $('.hero-word').style.opacity=1-segment(h,.24,.62);
    $('.near').style.transform=`translateY(${-h*8}%) scale(${1+h*.18})`;
    $('.far').style.transform=`translateY(${-h*3}%)`;
    $('.hero-bottom').style.opacity=1-segment(h,0,.27);
    $('.dive-shade').style.opacity=segment(h,.76,1);
    const phase=f<.23?0:f<.44?1:f<.65?2:f<.92?3:4;
    film.dataset.phase=phase;
    $$('.beat').forEach((el,i)=>el.classList.toggle('active',i===phase));
    $('.rings-panel').style.opacity=segment(f,.17,.24);$('.rings-panel').style.pointerEvents=phase===1?'auto':'none';
    $('.compare-panel').style.opacity=segment(f,.42,.48);
    $('.compare-panel').inert=phase!==2;
    $('.compare-panel').setAttribute('aria-hidden',String(phase!==2));
    $('.reveal-panel').style.opacity=segment(f,.64,.7);
    $('.reveal-panel').style.pointerEvents=phase===3?'auto':'none';
    $('.reveal-panel').inert=phase!==3;
    $('.reveal-panel').setAttribute('aria-hidden',String(phase!==3));
    $('.book-panel').style.opacity=segment(f,.91,.95);
    $('.book-panel').inert=phase!==4;
    $('.book-panel').setAttribute('aria-hidden',String(phase!==4));
    $('.rings-panel').inert=phase!==1;
    $('.value-block').style.opacity=segment(f,.65,.71);
    $('.value-block').style.visibility=f>.64?'visible':'hidden';
    $('.value-block').style.transform=`translateY(${(1-segment(f,.65,.72))*30}px)`;
    $('.live-phone').style.setProperty('--arrival',1+Math.pow(1-segment(f,0,.14),2)*.18);
    if(f>.76&&!revealed)krasOpen();
    $('.pan-track').style.transform=`translateX(${-p*($('.pan-track').scrollWidth-innerWidth+innerWidth*.08)}px)`;
    $$('.pan-track figure').forEach(fig=>{const cap=fig.querySelector('figcaption'),r=fig.getBoundingClientRect(),cw=cap.offsetWidth,base=r.width*.06,edge=Math.max(16,innerWidth*.04);
      const visL=Math.max(r.left,edge),visR=Math.min(r.right,innerWidth-edge),room=visR-visL;
      cap.style.left=Math.min(Math.max(base,visL-r.left),Math.max(base,r.width-cw-base))+'px';
      cap.style.opacity=clamp((room-cw)/80);});
  }
  let raf=null;
  function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=null;update()})}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);motion.addEventListener('change',()=>{if(motion.matches&&timer){clearInterval(timer);timer=null;paintScratch(14)}root.classList.toggle('reduced',motion.matches);schedule()});
  root.classList.toggle('reduced',motion.matches);update();
  $$('.skip').forEach(a=>a.addEventListener('click',()=>{$('#inhoud').setAttribute('tabindex','-1');$('#inhoud').focus({preventScroll:true})}));
})();
