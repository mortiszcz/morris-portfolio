/* Interactive page layers — must load before the shell, which calls window.__fx on boot */
(function(){
 var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 var clamp=function(v,a,b){return v<a?a:v>b?b:v;};
 var smooth=function(e0,e1,x){var t=clamp((x-e0)/((e1-e0)||1e-6),0,1);return t*t*(3-2*t);};

 /* scroll-triggered page effects (once) */
 var fio=new IntersectionObserver(function(es){es.forEach(function(e){ if(e.isIntersecting){e.target.classList.add('fx-on');fio.unobserve(e.target);} });},{threshold:.45});

 /* ---- AccordionGallery (vertical) ---- */
 function agInit(el){
  if(el.dataset.ok) return; el.dataset.ok=1;
  var panels=[].slice.call(el.querySelectorAll('.ag-panel')), n=panels.length;
  var r=clamp(+el.dataset.ratio||.52,.2,.9), grow=n>1?r*(n-1)/(1-r):1, tilt=+el.dataset.tilt||8,
      par=+el.dataset.parallax||.5, ms=+el.dataset.msize||400, active=clamp(+el.dataset.default||0,0,n-1);
  function apply(){
   panels.forEach(function(p,i){
    var on=i===active, rot=on?0:(i<active?tilt:-tilt);
    p.style.flexGrow=on?grow:1;
    p.style.transform=reduce?'none':'rotateX('+(-rot)+'deg)';
    p.classList.toggle('on',on); p.setAttribute('aria-current',on?'true':'false');
    var drift=clamp(active-i,-1.5,1.5), shift=on?0:drift*par*ms*0.06;
    p.querySelector('.ag-media').style.transform='translate(-50%,-50%) translateY('+shift.toFixed(1)+'px)';
   });
  }
  var sec=el.closest('section');
  if(sec){
   el.addEventListener('pointerenter',function(e){ if(e.pointerType!=='touch') sec.classList.add('ag-wide'); });
   el.addEventListener('pointerleave',function(e){ if(e.pointerType!=='touch') sec.classList.remove('ag-wide'); });
   el.addEventListener('focusin',function(){ sec.classList.add('ag-wide'); });
   el.addEventListener('focusout',function(){ setTimeout(function(){ if(!el.contains(document.activeElement)) sec.classList.remove('ag-wide'); },0); });
   sec.addEventListener('click',function(e){ if(!el.contains(e.target)) sec.classList.remove('ag-wide'); });
   var ph=sec.querySelector('#_idContainer783');
   if(ph){
    ph.addEventListener('pointerenter',function(e){ if(e.pointerType!=='touch'){ sec.classList.remove('ag-wide'); sec.classList.add('ph-wide'); } });
    ph.addEventListener('pointerleave',function(e){ if(e.pointerType!=='touch') sec.classList.remove('ph-wide'); });
    ph.addEventListener('click',function(e){ e.stopPropagation(); sec.classList.remove('ag-wide'); sec.classList.toggle('ph-wide'); });
    sec.addEventListener('click',function(e){ if(!ph.contains(e.target)) sec.classList.remove('ph-wide'); });
    el.addEventListener('pointerenter',function(){ sec.classList.remove('ph-wide'); });
   }
  }
  panels.forEach(function(p,i){
   p.addEventListener('click',function(){ if(sec) sec.classList.add('ag-wide'); });
   p.addEventListener('pointerenter',function(e){ if(e.pointerType!=='touch' && active!==i){active=i;apply();} });
   p.addEventListener('click',function(){ if(active!==i){active=i;apply();} });
   p.addEventListener('focus',function(){ if(active!==i){active=i;apply();} });
   p.addEventListener('keydown',function(e){
    if(e.key==='ArrowDown'||e.key==='ArrowRight'){e.preventDefault();panels[(i+1)%n].focus();}
    else if(e.key==='ArrowUp'||e.key==='ArrowLeft'){e.preventDefault();panels[(i-1+n)%n].focus();}
   });
  });
  apply();
 }

 /* ---- expanding grid, aspect locked ---- */
 function xgInit(el){
  if(el.dataset.ok) return; el.dataset.ok=1;
  var d=JSON.parse(el.dataset.xg), cells=[].slice.call(el.querySelectorAll('.xg-cell')), cur=-1;
  var A=d.cells.map(function(c){return c.w/c.h;});
  var AV=A.reduce(function(x,y){return x+y;},0)/A.length;
  function rest(){ return d.cells.map(function(c){return {x:c.x,y:c.y,w:c.w,h:c.h};}); }
  function lay(k){
   /* big tile on the left, the other three stacked on the right; one shared aspect keeps the block square-edged */
   var W=d.W,H=d.H,g=8.5,A=AV;
   var Hb=(W-g+2*g*A/3)*3/(4*A), Wb=Hb*A, th=(Hb-2*g)/3, tw=W-Wb-g, y0=(H-Hb)/2, o=[], j=0;
   o[k]={x:0,y:y0,w:Wb,h:Hb};
   for(var i=0;i<4;i++){ if(i===k) continue; o[i]={x:Wb+g,y:y0+j*(th+g),w:tw,h:th}; j++; }
   return o;
  }
  function tf(q,c){
   var s=Math.max(q.w/c.w,q.h/c.h), tx=(q.w-s*c.w)/2, ty=(q.h-s*c.h)/2;
   return 'translate('+tx.toFixed(2)+'px,'+ty.toFixed(2)+'px) scale('+s.toFixed(5)+') translate('+(-c.X0)+'px,'+(-c.Y0)+'px)';
  }
  function set(k){
   if(k===cur) return; cur=k;
   var L=k<0?rest():lay(k);
   cells.forEach(function(cell,i){
    var q=L[i], c=d.cells[i];
    cell.style.left=q.x.toFixed(2)+'px'; cell.style.top=q.y.toFixed(2)+'px';
    cell.style.width=q.w.toFixed(2)+'px'; cell.style.height=q.h.toFixed(2)+'px';
    cell.firstElementChild.style.transform=tf(q,c);
    cell.classList.toggle('on',i===k);
   });
   el.classList.toggle('has-on',k>=0);
  }
  /* switch only on real pointer movement, and not while a layout change is still settling */
  var lock=0;
  el.addEventListener('pointermove',function(e){
   if(e.pointerType==='touch') return;
   var c=e.target.closest('.xg-cell'); if(!c) return;
   var i=cells.indexOf(c), now=performance.now();
   if(i===cur || now<lock) return;
   set(i); lock=now+700;
  });
  el.addEventListener('pointerleave',function(e){ if(e.pointerType!=='touch') set(-1); });
  el.addEventListener('click',function(e){ var c=e.target.closest('.xg-cell'); if(!c) return; var i=cells.indexOf(c); set(i===cur?-1:i); });
  cells.forEach(function(c,i){ c.addEventListener('focus',function(){set(i);}); c.addEventListener('blur',function(){ setTimeout(function(){ if(!el.contains(document.activeElement)) set(-1); },0); }); });
 }

 /* ---- BOM hover: reticle + label highlight ---- */
 function bomInit(el){
  if(el.dataset.ok) return; el.dataset.ok=1;
  var page=el.closest('.scaler')||document, on=null;
  function clear(){ if(on){ on.lab.classList.remove('lab-on'); on.line.classList.remove('line-on'); on=null; } el.removeAttribute('data-on'); }
  el.querySelectorAll('.bom-hit').forEach(function(h){
   var lab=page.querySelector('#_idContainer'+h.dataset.lab), line=page.querySelector('#_idContainer'+h.dataset.line);
   function go(){ clear(); on={lab:lab,line:line}; lab.classList.add('lab-on'); line.classList.add('line-on'); el.setAttribute('data-on',h.dataset.i); }
   h.addEventListener('pointerenter',go); h.addEventListener('click',go); h.addEventListener('pointerleave',clear);
  });
 }

 /* ---- p.11 focus ---- */
 function hsInit(sec){
  if(sec.dataset.hsok) return; sec.dataset.hsok=1;
  var zw=sec.querySelector('.hs-zoom'), layer=sec.querySelector('.hs-layer'), frame=sec.querySelector('.frame'); if(!zw||!layer) return;
  var mo=new MutationObserver(function(){ if(sec.classList.contains('fx-on')){ mo.disconnect(); setTimeout(function(){sec.classList.add('hs-ready');},3200); } });
  mo.observe(sec,{attributes:true,attributeFilter:['class']});
  var P=[].slice.call(sec.querySelectorAll('.hs-p')), pools=[].slice.call(sec.querySelectorAll('.hs-pool'));
  var zc=layer.querySelector('.hs-zcard'), D=JSON.parse(zc.dataset.hs), cur=-1, intent=0, leaveT=0;
  function box(i){ return P[i].dataset.bb.split(',').map(Number); }
  function zoom(i){
   i=+i; if(i===cur) return; cur=i;
   var b=box(i), cx=(b[0]+b[2])/2, cy=(b[1]+b[3])/2, h=b[3]-b[1];
   var s=Math.max(1.35,Math.min(2.2,900/h)), W=1920, H=1080, IH=1206.78;
   var tx=W*0.36-s*cx, ty=H*0.5-s*cy;
   tx=Math.min(0,Math.max(W-s*W,tx)); ty=Math.min(0,Math.max(H-s*IH,ty));
   zw.style.transform='translate('+tx.toFixed(1)+'px,'+ty.toFixed(1)+'px) scale('+s.toFixed(3)+')';
   P.forEach(function(p,k){p.classList.toggle('on',k===i);}); pools.forEach(function(p,k){p.classList.toggle('on',k===i);});
   sec.classList.add('zoomed');
   zc.querySelector('.hs-zn').textContent=D[i][0]; zc.querySelector('.hs-zt').textContent=D[i][1]; zc.querySelector('.hs-zd').textContent=D[i][2];
   zc.querySelectorAll('.hs-chip').forEach(function(c){c.classList.toggle('on',+c.dataset.i===i);});
  }
  function unzoom(){ if(cur<0) return; cur=-1; zw.style.transform=''; sec.classList.remove('zoomed');
   P.forEach(function(p){p.classList.remove('on');}); pools.forEach(function(p){p.classList.remove('on');}); }
  function hoverIn(i,e){ if(e&&e.pointerType==='touch') return; clearTimeout(leaveT); if(cur>=0) return; clearTimeout(intent); intent=setTimeout(function(){zoom(i);},220); }
  function hoverOut(e){ if(e&&e.pointerType==='touch') return; clearTimeout(intent); }
  P.forEach(function(p){
   p.addEventListener('pointerenter',function(e){hoverIn(p.dataset.i,e);});
   p.addEventListener('pointerleave',hoverOut);
   p.addEventListener('click',function(e){ e.stopPropagation(); if(cur===+p.dataset.i) unzoom(); else zoom(p.dataset.i); });
  });
  layer.querySelectorAll('.hs-dot,.hs-card').forEach(function(n){
   n.addEventListener('pointerenter',function(e){hoverIn(n.dataset.i,e);});
   n.addEventListener('pointerleave',hoverOut);
   n.addEventListener('click',function(e){ e.stopPropagation(); zoom(n.dataset.i); });
  });
  zc.querySelectorAll('.hs-chip').forEach(function(c){ c.addEventListener('click',function(e){ e.stopPropagation(); zoom(c.dataset.i); }); });
  zc.querySelector('.hs-back').addEventListener('click',function(e){ e.stopPropagation(); unzoom(); });
  zc.addEventListener('click',function(e){ e.stopPropagation(); });
  frame.addEventListener('click',function(){ unzoom(); });
  frame.addEventListener('pointerleave',function(e){ if(e.pointerType==='touch') return; clearTimeout(intent); leaveT=setTimeout(unzoom,350); });
  frame.addEventListener('pointerenter',function(){ clearTimeout(leaveT); });
  document.addEventListener('keydown',function(e){ if(cur>=0&&e.key==='Escape') unzoom(); });
  sec.querySelectorAll('.hs-legend li').forEach(function(li){ li.addEventListener('click',function(){ if(cur===+li.dataset.i) unzoom(); else zoom(li.dataset.i); }); });
 }

 /* ---- p.2 icons: play once per hover, and once in sequence on arrival ---- */
 function icoInit(fxl){
  if(fxl.dataset.ok) return; fxl.dataset.ok=1;
  var sec=fxl.closest('section'); if(!sec) return;
  var busy={}, T={speed:1350,cost:1400,batt:1750};
  function play(k){
   if(busy[k]||reduce) return; busy[k]=1;
   sec.classList.remove('p-'+k); void sec.offsetWidth; sec.classList.add('p-'+k);
   setTimeout(function(){ sec.classList.remove('p-'+k); busy[k]=0; }, T[k]);
  }
  fxl.querySelectorAll('.ico-hit').forEach(function(h){
   h.addEventListener('pointerenter',function(){ play(h.dataset.k); });
   h.addEventListener('click',function(){ play(h.dataset.k); });
  });
  var mo=new MutationObserver(function(){ if(sec.classList.contains('fx-on')){ mo.disconnect();
   setTimeout(function(){play('speed');},250); setTimeout(function(){play('cost');},900); setTimeout(function(){play('batt');},1550); } });
  mo.observe(sec,{attributes:true,attributeFilter:['class']});
 }

 /* ---- ScrollExpand (window scroll) ---- */
 var XP=[];
 function xpInit(sec){
  if(sec.dataset.ok) return; sec.dataset.ok=1;
  var c=JSON.parse(sec.dataset.xp), s={sec:sec,c:c,track:sec.querySelector('.xp-track'),stage:sec.querySelector('.xp-stage'),
   frame:sec.querySelector('.xp-frame'),media:sec.querySelector('.xp-media'),hint:sec.querySelector('.xp-hint'),ov:sec.querySelector('.xp-overlay'),scrim:sec.querySelector('.xp-scrim'),cur:0,tgt:0,raf:0,run:false,W:0,H:0};
  XP.push(s); measure(s); s.tgt=s.cur=read(s); paint(s,s.cur);
 }
 function measure(s){
  var H=window.innerHeight, W=s.sec.clientWidth||window.innerWidth, c=s.c; if(!W||!H) return;
  s.W=W; s.H=H;
  s.stage.style.height=H+'px';
  s.track.style.height=(H*(1+Math.max(0,c.scrollDistance)+Math.max(0,c.holdDistance)))+'px';
  var ia=c.iw/c.ih, sc=(W/H>=1)?Math.max(W/c.iw,H/c.ih):W/c.iw, rw=c.iw*sc, rh=c.ih*sc, ox=(W-rw)/2, oy=(W/H<1)?Math.min((H-rh)/2,Math.max(64,H*.1)):(H-rh)/2;
  s.box={x:ox,y:oy,w:rw,h:rh};
  var m=s.media.style; m.left=ox+'px'; m.top=oy+'px'; m.width=rw+'px'; m.height=rh+'px';
  m.transformOrigin=(c.fx*rw)+'px '+(c.fy*rh)+'px';
  s.focus={x:ox+c.fx*rw,y:oy+c.fy*rh};
  s.end={l:Math.max(0,ox),t:Math.max(0,oy),r:Math.min(W,ox+rw),b:Math.min(H,oy+rh)};
  var portrait=W/H<1, sw=Math.min((portrait?84:c.startWidth)/100*W,s.end.r-s.end.l), sh=Math.min((portrait?36:c.startHeight)/100*H,s.end.b-s.end.t);
  var l=clamp(s.focus.x-sw/2,s.end.l,s.end.r-sw), t=clamp(s.focus.y-sh/2,s.end.t,s.end.b-sh);
  s.start={l:l,t:t,r:l+sw,b:t+sh};
  if(s.ov){ if(portrait){ s.ov.style.top=(s.end.b+18)+'px'; s.ov.style.bottom='auto'; } else { s.ov.style.top=''; s.ov.style.bottom=''; } }
 }
 function read(s){
  if(!s.H) return 0;
  var top=s.track.getBoundingClientRect().top;
  return clamp(-top/(s.H*Math.max(.01,s.c.scrollDistance)),0,1);
 }
 function paint(s,p){
  if(!s.start) return;
  var c=s.c, e=smooth(0,1,p), a=s.start, b=s.end;
  var l=a.l+(b.l-a.l)*e, t=a.t+(b.t-a.t)*e, r=a.r+(b.r-a.r)*e, bt=a.b+(b.b-a.b)*e, rad=c.startRadius+(c.endRadius-c.startRadius)*e;
  s.frame.style.clipPath='inset('+t.toFixed(1)+'px '+(s.W-r).toFixed(1)+'px '+(s.H-bt).toFixed(1)+'px '+l.toFixed(1)+'px round '+rad.toFixed(1)+'px)';
  s.media.style.transform='scale('+(c.mediaZoom+(1-c.mediaZoom)*e).toFixed(4)+')';
  if(s.scrim) s.scrim.style.opacity=((c.overlayScrim||0)*e).toFixed(3);
  if(s.ov){ var inn=smooth(.68,1,p); s.ov.style.opacity=inn.toFixed(3);
   s.ov.style.transform='translate3d(0,'+(18*(1-inn)).toFixed(1)+'px,0)'; }
  if(s.hint){ var g=smooth(0,.12,p); s.hint.style.opacity=(1-g).toFixed(3); s.hint.style.transform='translate3d(0,'+(8*g).toFixed(1)+'px,0)'; }
 }
 function tick(s){
  var k=s.c.smoothing<=0?1:1-Math.exp(-1/(60*s.c.smoothing));
  s.cur+=(s.tgt-s.cur)*k;
  if(Math.abs(s.tgt-s.cur)<.0004){s.cur=s.tgt;s.run=false;}
  paint(s,s.cur);
  s.raf=s.run?requestAnimationFrame(function(){tick(s);}):0;
 }
 function xpScroll(){
  XP.forEach(function(s){
   if(!s.sec.offsetParent) return;
   s.tgt=read(s);
   if(reduce||s.c.smoothing<=0){s.cur=s.tgt;paint(s,s.cur);return;}
   if(!s.run){s.run=true; if(!s.raf) s.raf=requestAnimationFrame(function(){tick(s);});}
  });
 }
 function xpResize(){ XP.forEach(function(s){ if(!s.sec.offsetParent) return; measure(s); s.tgt=s.cur=read(s); paint(s,s.cur); }); }
 window.addEventListener('scroll',xpScroll,{passive:true});
 window.addEventListener('resize',xpResize);
 window.addEventListener('load',xpResize);

 window.__fx=function(root){
  root=root||document;
  root.querySelectorAll('[data-fx]').forEach(function(e){ if(reduce) e.classList.add('fx-on'); else fio.observe(e); });
  root.querySelectorAll('.ag').forEach(agInit);
  root.querySelectorAll('.xg').forEach(xgInit);
  root.querySelectorAll('.bom-fx').forEach(bomInit);
  root.querySelectorAll('.hs-page').forEach(hsInit);
  root.querySelectorAll('.xp').forEach(xpInit);
  root.querySelectorAll('.ico-fx').forEach(icoInit);
  xpResize();
 };
})();

/* Page shell: reveal on scroll, page scaling, nav state, progress bar */
(function(){
 var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 var desktop=function(){ return window.matchMedia('(min-width:900px)').matches && !reduce; };

 function split(root){
  (root||document).querySelectorAll('[data-split]').forEach(function(el){
   if(el.dataset.done) return; el.dataset.done='1';
   var walk=function(n){
    if(n.nodeType===3){
     var f=document.createDocumentFragment();
     n.textContent.split(/(\s+)/).forEach(function(t){
      if(!t.trim()){f.appendChild(document.createTextNode(t));return;}
      var s=document.createElement('span'); s.className='word'; s.textContent=t; f.appendChild(s);
     });
     n.parentNode.replaceChild(f,n);
    } else if(n.nodeType===1){ Array.prototype.slice.call(n.childNodes).forEach(walk); }
   };
   Array.prototype.slice.call(el.childNodes).forEach(walk);
  });
 }
 var io=new IntersectionObserver(function(es){
  es.forEach(function(e){
   if(!e.isIntersecting) return;
   var el=e.target; el.classList.add('in');
   el.querySelectorAll('.word').forEach(function(w,i){ w.style.transitionDelay=(i*26)+'ms'; w.classList.add('in'); });
   io.unobserve(el);
  });
 },{threshold:.15,rootMargin:'0px 0px -5% 0px'});
 function observe(root){ (root||document).querySelectorAll('.rv,.pg').forEach(function(e){ io.observe(e); }); }

 function scale(root){
  (root||document).querySelectorAll('.frame').forEach(function(f){
   var sc=f.querySelector('.scaler'); if(!sc) return;
   var w=f.clientWidth || f.getBoundingClientRect().width;
   if(w) sc.style.setProperty('--s',(w/1920).toFixed(5));
  });
 }

 function layout(){ scale(); }
 var nav=document.getElementById('nav'), prog=document.getElementById('prog');
 function onScroll(){
  var y=window.scrollY||window.pageYOffset;
  if(nav) nav.classList.toggle('stuck', y>26);
  var h=document.documentElement.scrollHeight-window.innerHeight;
  if(prog) prog.style.width=(Math.min(Math.max(y/Math.max(h,1),0),1)*100).toFixed(2)+'%';
  var root=document.querySelector('.project.on')||document;
  var links=document.querySelectorAll('.navblock.on .seclink, nav .seclink');
  var cur=0;
  links.forEach(function(a,i){ var t=root.querySelector(a.getAttribute('data-target'));
   if(t && t.getBoundingClientRect().top<=window.innerHeight*0.45) cur=i; });
  links.forEach(function(a,i){ a.classList.toggle('on',i===cur); });
 }
 document.addEventListener('click',function(ev){
  var a=ev.target.closest('.seclink'); if(!a) return; ev.preventDefault();
  var root=document.querySelector('.project.on')||document;
  var t=root.querySelector(a.getAttribute('data-target'));
  if(!t) return;
  var ty2=t.getBoundingClientRect().top+(window.scrollY||window.pageYOffset);
  window.scrollTo({top:ty2,behavior:reduce?'auto':'smooth'});
 });
 window.__boot=function(root){ split(root); observe(root); layout(); if(window.__fx) window.__fx(root); onScroll(); };
 window.addEventListener('scroll',onScroll,{passive:true});
 window.addEventListener('resize',function(){ layout(); onScroll(); });
 window.addEventListener('load',function(){ layout(); onScroll(); });
 window.__boot(document);
})();
