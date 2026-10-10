/* Progressive enhancements for Anas Sarhan's portfolio.
   Keeps motion accessible, uses persisted preferences and no external JS dependencies. */
(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
  const root = document.documentElement;
  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const pointerFine = matchMedia('(hover: hover) and (pointer: fine)');
  const storage = (key, value) => {
    try { if (value === undefined) return localStorage.getItem(key); localStorage.setItem(key, String(value)); }
    catch (_) { return null; }
  };
  let motionOn = storage('mt-motion') !== 'off';
  let glowOn = storage('mt-glow') !== 'off';
  root.classList.toggle('motion-off', !motionOn);
  const canAnimate = () => motionOn && !prefersReducedMotion.matches;
  const scrollMode = () => canAnimate() ? 'smooth' : 'auto';

  // Dark / light theme persists. Toggling never changes source identity or palette hierarchy.
  function setTheme(t) {
    root.classList.toggle('light', t === 'light');
    root.classList.toggle('dark', t !== 'light');
    $('.theme-icon').textContent = t === 'light' ? '☀' : '☾';
    storage('mt-theme', t);
  }
  setTheme(storage('mt-theme') === 'light' ? 'light' : 'dark');
  $('#themeButton').addEventListener('click', () => setTheme(root.classList.contains('light') ? 'dark' : 'light'));
  function updateMotion() {
    root.classList.toggle('motion-off', !motionOn);
    $('#motionButton').classList.toggle('is-on', motionOn);
    $('#motionButton').setAttribute('aria-pressed', String(motionOn));
    $('#mobileMotionButton').textContent = `Motion: ${motionOn ? 'On' : 'Off'}`;
    if (!motionOn) $$('.will-reveal').forEach(el=>el.classList.add('is-visible'));
  }
  updateMotion();
  function toggleMotion() { motionOn = !motionOn; storage('mt-motion', motionOn?'on':'off'); updateMotion(); }
  $('#motionButton').addEventListener('click', toggleMotion);
  $('#mobileMotionButton').addEventListener('click', toggleMotion);
  function updateGlow() {
    $('#glowButton').classList.toggle('is-on', glowOn);
    $('#glowButton').setAttribute('aria-pressed', String(glowOn));
    if (!glowOn) $('#cursorGlow').classList.remove('active');
  }
  updateGlow();
  $('#glowButton').addEventListener('click', () => {glowOn=!glowOn;storage('mt-glow',glowOn?'on':'off');updateGlow();});
  if(pointerFine.matches){
    window.addEventListener('pointermove', e => {
      if (!glowOn || !canAnimate()) return;
      const el=$('#cursorGlow');el.style.left=e.clientX+'px';el.style.top=e.clientY+'px';el.classList.add('active');
    }, {passive:true});
    document.addEventListener('pointerleave', ()=>$('#cursorGlow').classList.remove('active'));
  }

  // Mobile navigation is a real menu; Escape and link navigation dismiss it.
  const mobileNav=$('#mobileNav'),menuButton=$('#menuButton');
  function setMenu(open) {
    mobileNav.hidden=!open;
    menuButton.setAttribute('aria-expanded',String(open));
    menuButton.setAttribute('aria-label',open?'Close menu':'Open menu');
    menuButton.querySelector('.hamburger').textContent=open?'×':'☰';
    document.body.classList.toggle('menu-open',open);
  }
  menuButton.addEventListener('click',()=>setMenu(mobileNav.hidden));
  $$('#mobileNav a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  window.addEventListener('resize',()=>{if(innerWidth>975)setMenu(false);},{passive:true});

  // Single scroll observer to manage nav highlighting and back-to-top visibility.
  const header=$('#siteHeader'),back=$('#backTop');
  const onScroll=()=>{header.classList.toggle('scrolled',scrollY>8);back.hidden=scrollY<640;};
  onScroll();window.addEventListener('scroll',onScroll,{passive:true});
  back.addEventListener('click',()=>window.scrollTo({top:0,behavior:scrollMode()}));
  const anchors=$$('.desktop-nav a');
  if('IntersectionObserver' in window){
    const navObserver=new IntersectionObserver(entries=>{
      const candidates=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);
      if(!candidates.length)return;
      const id=candidates[0].target.id;
      anchors.forEach(a=>a.classList.toggle('nav-active',a.getAttribute('href')==='#'+id));
    },{rootMargin:'-22% 0px -64% 0px',threshold:[0,.2,.5]});
    $$('main section[id]').forEach(s=>navObserver.observe(s));
  }

  // Scroll reveal: only defer elements below initial viewport, never hide content if JS fails.
  const visibleInitial=(el)=>el.getBoundingClientRect().top<innerHeight*.94;
  if('IntersectionObserver' in window && canAnimate()){
    const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{
      if(!e.isIntersecting)return;
      e.target.classList.add('is-visible');revealObserver.unobserve(e.target);
    }),{threshold:.045,rootMargin:'0px 0px -26px 0px'});
    $$('.reveal').forEach(el=>{
      if(visibleInitial(el))return;
      el.classList.add('will-reveal');revealObserver.observe(el);
    });
  }

  // Same sequential per-letter reveal used in the approved portfolio, with readable fallback.
  $$('.section-wordmark').forEach(el=>{
    const text=el.textContent.trim();
    el.setAttribute('aria-label',text);
    el.innerHTML='';
    Array.from(text).forEach((char,i)=>{
      const span=document.createElement('span');span.className='letter';span.style.setProperty('--i',i);
      span.textContent=char===' '? '\u00a0':char;span.setAttribute('aria-hidden','true');el.appendChild(span);
    });
  });
  const banners=$$('.section-banner');
  if('IntersectionObserver' in window){
    const titlesIO=new IntersectionObserver(entries=>entries.forEach(e=>{
      if(e.isIntersecting){e.target.classList.add('entered');titlesIO.unobserve(e.target);}
    }),{threshold:.14});banners.forEach(b=>titlesIO.observe(b));
  }else banners.forEach(b=>b.classList.add('entered'));

  // Interactive skill tabs with tab semantics + keyboard arrows, no cross-section rerender.
  const tabs=$$('.skill-tab'),panels=$$('.skill-group');
  const selectTab=(i,focus=false)=>{
    tabs.forEach((tab,k)=>{
      const active=k===i;
      tab.classList.toggle('selected',active);
      tab.setAttribute('aria-selected',String(active));
      tab.tabIndex=active?0:-1;
      panels[k].hidden=!active;
    });
    if(focus)tabs[i].focus();
  };
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>selectTab(i));
    tab.addEventListener('keydown',e=>{
      if(!['ArrowLeft','ArrowRight','ArrowDown','ArrowUp','Home','End'].includes(e.key))return;
      e.preventDefault();
      const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:((i+(['ArrowRight','ArrowDown'].includes(e.key)?1:-1)+tabs.length)%tabs.length);
      selectTab(next,true);
    });
  });
  selectTab(0);

  // Visual galleries are explicit conceptual diagrams, never presented as real screenshots.
  $$('.project-featured').forEach(card=>{
    const art=$('.project-visual',card),dots=$$('.gallery-dot',card),stage=$('.gallery-stage-tag',card),rings=$$('.visual-ring',card);
    dots.forEach((dot,i)=>dot.addEventListener('click',()=>{
      dots.forEach((d,k)=>{d.classList.toggle('selected',i===k);d.setAttribute('aria-pressed',String(i===k));});
      const label=dot.getAttribute('aria-label');stage.textContent=`0${i+1} / ${label}`;
      art.dataset.slide=String(i);
      rings.forEach((r,k)=>r.style.transform=`rotate(${i*(k?42:-55)}deg) scale(${1+i*.07})`);
    }));
  });

  // Experience timeline: one open card by default; click an open one to close it.
  $$('.experience-item').forEach(item=>{
    const button=$('.experience-head',item),panel=$('.experience-details',item);
    button.addEventListener('click',()=>{
      const opening=button.getAttribute('aria-expanded')!=='true';
      $$('.experience-item').forEach(x=>{$('.experience-head',x).setAttribute('aria-expanded','false');$('.experience-details',x).hidden=true;});
      button.setAttribute('aria-expanded',String(opening));panel.hidden=!opening;
    });
  });

  // Certification filters: no fake dates, issuers or certificate validation links.
  $$('.cert-filter').forEach(button=>button.addEventListener('click',()=>{
    const f=button.dataset.filter;
    $$('.cert-filter').forEach(x=>{x.classList.toggle('selected',x===button);x.setAttribute('aria-pressed',String(x===button));});
    $$('.cert-card').forEach(card=>{card.hidden=f!=='All' && card.dataset.category!==f;});
  }));

  // Command palette is an accessible keyboard shortcut and clickable navigation panel.
  const dialog=$('#commandDialog');
  const openCommand=()=>{setMenu(false);dialog.hidden=false;$('#commandClose').focus();};
  const closeCommand=()=>{dialog.hidden=true;};
  $('#commandButton').addEventListener('click',openCommand);
  $('#commandClose').addEventListener('click',closeCommand);
  dialog.addEventListener('mousedown',e=>{if(e.target===dialog)closeCommand();});
  $$('#commandDialog a').forEach(a=>a.addEventListener('click',closeCommand));
  window.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();dialog.hidden?openCommand():closeCommand();}
    if(e.key==='Escape'){closeCommand();setMenu(false);}
  });

  // Portrait: a gentle moving stage and pointer-controlled depth, independent of
  // the reveal/scroll animations. Only use transform CSS values, never redraw the image.
  const portraitFrame=$('#portraitFrame');
  const portraitRegion=$('.portrait-region');
  if(portraitFrame && portraitRegion){
    let portraitRaf=0;
    const resetPortrait=()=>{
      if(portraitRaf)cancelAnimationFrame(portraitRaf);
      portraitFrame.classList.remove('portrait-interacting');
      portraitFrame.style.rotate='0 0 1 0deg';
      portraitFrame.style.setProperty('--portrait-x','0px');
      portraitFrame.style.setProperty('--portrait-y','0px');
    };
    if(pointerFine.matches){
      portraitRegion.addEventListener('pointermove',(e)=>{
        if(!canAnimate() || e.pointerType==='touch'){resetPortrait();return;}
        if(portraitRaf) cancelAnimationFrame(portraitRaf);
        portraitRaf=requestAnimationFrame(()=>{
          const rect=portraitFrame.getBoundingClientRect();
          if(!rect.width || !rect.height)return;
          const x=Math.min(1,Math.max(0,(e.clientX-rect.left)/rect.width));
          const y=Math.min(1,Math.max(0,(e.clientY-rect.top)/rect.height));
          portraitFrame.classList.add('portrait-interacting');
          const dx=(x-.5)*2,dy=(y-.5)*2,deg=Math.hypot(dx,dy)*4.4;
          portraitFrame.style.rotate=`${(-dy).toFixed(3)} ${dx.toFixed(3)} 0 ${deg.toFixed(2)}deg`;
          portraitFrame.style.setProperty('--portrait-x',`${((x-.5)*13).toFixed(2)}px`);
          portraitFrame.style.setProperty('--portrait-y',`${((y-.5)*8).toFixed(2)}px`);
        });
      },{passive:true});
      portraitRegion.addEventListener('pointerleave',resetPortrait);
    }
    prefersReducedMotion.addEventListener?.('change',resetPortrait);
    window.addEventListener('blur',resetPortrait);
    portraitFrame.dataset.portraitInteractive='true';
  }

  // Lightweight desktop-only tilt; never trigger on touch or reduced-motion preferences.
  if(pointerFine.matches){
    $$('.project-card,.cert-card,.about-story,.profile-panel,.achievement-card,.contact-links,.skills-panel').forEach(card=>{
      card.classList.add('tilt-card');let frame;
      card.addEventListener('pointermove',e=>{
        if(!canAnimate())return;
        if(frame)cancelAnimationFrame(frame);
        frame=requestAnimationFrame(()=>{
          const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
          const clx=Math.max(0,Math.min(1,x)),cly=Math.max(0,Math.min(1,y));
          card.style.setProperty('--x',`${(clx*100).toFixed(1)}%`);
          card.style.setProperty('--y',`${(cly*100).toFixed(1)}%`);
          const dx=(clx-.5)*2,dy=(cly-.5)*2;
          card.style.rotate=`${(-dy).toFixed(3)} ${dx.toFixed(3)} 0 ${(Math.hypot(dx,dy)*1.8).toFixed(2)}deg`;
        });
      },{passive:true});
      card.addEventListener('pointerleave',()=>{
        if(frame)cancelAnimationFrame(frame);
        card.style.rotate='0 0 1 0deg';card.style.setProperty('--x','50%');card.style.setProperty('--y','50%');
      });
    });
  }
})();
