/* Chapter 02 research boards: step players, zoom, scrubber, tooltips */
window.CH={};CH['eval']=(function(){const root=document.getElementById('eval');const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];const RENDER={steps:[["Thirty-nine steps, twelve stages", "The scan line runs through a raw-material warehouse, stage by stage. Every box it lights up is one operation \u2014 <b style='color:#dcdddd'>39</b> in total."], ["Nineteen of them are scans", "A second pass picks out the operations that scan a barcode or capture and import scanned data \u2014 <b style='color:#f8b62d'>19</b> of the 39."], ["Nearly half the work is scanning", "Through the quantification of the warehousing flowchart, nearly half of all warehousing operations turn out to be based on scanning."], ["Explore the flow", "Hover a stage or a step to inspect it, or show only the scanning steps."]],layout:'pin',dur:[1400,1400,1500,0]};

const b=$('#b1');const nodes=$$('.node'),cns=$$('.cn');let mode='all',raf=0,timers=[];
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const EDGE=[190.4,331.54,493.85,634.99,797.3,934.33,1101.74,1242.87,1405.18,1546.33,1708.64,1895.41];
function laser(x,on){$('#laser').setAttribute('opacity',on?1:0);['#lz','#lz2'].forEach(s=>{$(s).setAttribute('x1',x);$(s).setAttribute('x2',x)});$('#trailr').setAttribute('x',x-160)}
function stop(){cancelAnimationFrame(raf);timers.forEach(clearTimeout);timers=[]}
function restart(el,c){el.classList.remove(c);void el.getBoundingClientRect();el.classList.add(c)}
function colNodes(c){return nodes.filter(n=>+n.dataset.c===c)}
function base(kind){nodes.forEach(n=>n.classList.remove('hot','cold','hl'));
 if(kind==='all'){nodes.forEach(n=>n.classList.add('off'));cns.forEach(c=>c.classList.add('off'));$('#den').textContent='0';$('#num').textContent='–'}
 else{nodes.forEach(n=>n.classList.remove('off'));cns.forEach(c=>c.classList.remove('off'));$('#num').textContent='0';$('#den').textContent='39'}}
let tot=0,sc=0;
function reveal(c,kind){restart($('.cf[data-c="'+c+'"]'),'go');const ch=$('.chev[data-c="'+c+'"]');if(ch)restart(ch,'ping');
 colNodes(c).forEach((n,k)=>timers.push(setTimeout(()=>{const i=+n.dataset.i;
  if(kind==='all'){n.classList.remove('off');cns.forEach(e=>{if(+e.dataset.n===i)e.classList.remove('off')});tot++;$('#den').textContent=tot}
  else{if(n.classList.contains('scan')){n.classList.add('hot');sc++;$('#num').textContent=sc}else n.classList.add('cold')}},rm?0:k*30)))}
function sweep(kind){stop();tot=0;sc=0;base(kind);
 if(rm){for(let c=1;c<=12;c++)reveal(c,kind);return}
 const dur=1200,t0=performance.now();let done=0;
 (function f(t){const p=Math.min(1,(t-t0)/dur),x=18+p*1880;laser(x,p<1);
  while(done<12&&x>=EDGE[done]-40){done++;reveal(done,kind)}
  if(p<1)raf=requestAnimationFrame(f)})(t0)}
function finalState(){stop();laser(0,false);nodes.forEach(n=>{n.classList.remove('off','cold','hl');n.classList.toggle('hot',n.classList.contains('scan'))});cns.forEach(c=>c.classList.remove('off'));$('#num').textContent='19';$('#den').textContent='39'}
function applyMode(){nodes.forEach(n=>{const s=n.classList.contains('scan');n.classList.remove('off');n.classList.toggle('hot',mode==='scan'&&s);n.classList.toggle('cold',mode==='scan'&&!s)});cns.forEach(c=>c.classList.remove('off'))}
const VB0=[0,0,1904.4,993.78],ZW=1110,ZH=ZW/(1904.4/993.78),COLX=[18.85,190.4,331.54,493.85,634.99,797.3,934.33,1101.74,1242.87,1405.18,1546.33,1708.64,1895.41];
const SNAME=['Production plan and purchase plan','Supplier label','Receipt of raw materials','Warehousing and putting on shelves','Production picking','Into the warehouse of semi-finished products','Release of semi-finished products','Finished products into warehouse','Finished product out of warehouse','Data query and report','Data collection program','Inventory stocks'];
let vb=VB0.slice(),zr=0,zc=0;
function anim(to){cancelAnimationFrame(zr);const from=vb.slice(),t0=performance.now(),d=rm?1:650;(function f(t){const p=Math.min(1,(t-t0)/d),e=1-Math.pow(1-p,3);vb=from.map((v,i)=>v+(to[i]-v)*e);b.setAttribute('viewBox',vb.join(' '));if(p<1)zr=requestAnimationFrame(f)})(t0)}
function zoom(c){zc=Math.max(1,Math.min(12,c));const cx=(COLX[zc-1]+COLX[zc])/2,x=Math.max(0,Math.min(1904.4-ZW,cx-ZW/2));anim([x,100,ZW,ZH]);root.classList.add('zoomed');$('.zbar .zl').textContent='Stage '+zc+' / 12 — '+SNAME[zc-1];$$('.chev').forEach(g=>g.classList.toggle('cur',+g.dataset.c===zc))}
function unzoom(){if(!zc)return;zc=0;anim(VB0);root.classList.remove('zoomed');$('.zbar .zl').textContent='Click a stage or a step to zoom in';$$('.chev.cur').forEach(g=>g.classList.remove('cur'))}
RENDER.init=function(){
 $$('.chev').forEach(g=>{if(!g.dataset.c||!g.hasAttribute('data-tip'))return;g.addEventListener('click',()=>zc===+g.dataset.c?unzoom():zoom(+g.dataset.c));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();zoom(+g.dataset.c)}})});
 nodes.forEach(n=>n.addEventListener('click',()=>{if(zc!==+n.dataset.c)zoom(+n.dataset.c)}));
 $('.zbar .zp').onclick=()=>zoom((zc||1)-1);$('.zbar .zn').onclick=()=>zoom((zc||0)+1);$('.zbar .zo').onclick=unzoom;
 root.addEventListener('keydown',e=>{if(!zc)return;if(e.key==='Escape')unzoom();if(e.key==='ArrowRight')zoom(zc+1);if(e.key==='ArrowLeft')zoom(zc-1)});
 $$('.seg button').forEach(x=>x.onclick=()=>{mode=x.dataset.m;$$('.seg button').forEach(y=>y.setAttribute('aria-pressed',y===x));applyMode()})};
RENDER.step=function(i){const seg=$('.seg');if(seg)seg.hidden=i<3;if(i<2)unzoom();
 if(i===0)sweep('all');else if(i===1)sweep('scan');else if(i===2)finalState();else{stop();laser(0,false);$('#num').textContent='19';$('#den').textContent='39';applyMode()}};
RENDER.hover=function(t,on){const c=t.classList.contains('chev')?+t.dataset.c:null;
 if(c){b.classList.toggle('dimc',on);$$('.inc').forEach(e=>e.classList.remove('inc'));const f=$('#focus');if(on){colNodes(c).forEach(n=>n.classList.add('inc'));cns.forEach(k=>{const n=nodes[+k.dataset.n];if(n&&+n.dataset.c===c)k.classList.add('inc')});const band=$('.band[data-c="'+c+'"]');f.setAttribute('x',band.getAttribute('x'));f.setAttribute('width',band.getAttribute('width'))}f.setAttribute('opacity',on?1:0)}
 if(t.classList.contains('node'))t.classList.toggle('hl',on)};

return RENDER})();
CH['user']=(function(){const root=document.getElementById('user');const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];const RENDER={steps:[["Persona", "A warehouse worker whose goals are to be faster, reach higher performance and make fewer errors. What they told us sits below the portrait."], ["Scenario", "Where the scanner is used meets when it is used. Peak retail events drive high-frequency triggering \u2014 so timing and frequency of use become a niche direction."], ["Goal", "Three circles overlap \u2014 performance, actions and users: the size of the scanned object and barcode position, standard and continuous modes, from warehousing to retail."], ["From end user to function", "Read left to right: who the user is, where and when they scan, and what the product has to do \u2014 the why behind every function."], ["Explore", "Hover a circle to isolate what it contains."]],layout:'pin',dur:[1000,1100,1100,600,0]};

const b=$('#b3');const G=k=>$$('[data-g~="'+k+'"]');
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const seq={0:[['pinfo',.1],['b1',.3],['b2',.45],['b3',.6],['b4',.75]],1:[['where',.18],['wi',.3],['when',.42],['wh',.54],['lens1',.66],['hf',.7],['arw',.78],['acc',.82],['concl',.9]],2:[['perf',.2],['act',.32],['use',.44],['lens2',.52],['lens3',.56],['lens4',.6],['why',.7]]};
function show(key,on){(key.startsWith('lens')?[$('#'+key)]:G(key)).forEach(e=>e.classList.toggle('h',!on))}
RENDER.step=function(i){$('#flowfill').style.transform='scaleX('+[.34,.67,1,1,1][Math.max(0,i)]+')'};
RENDER.init=function(){$$('[data-g~="vc"],[data-g~="gc"]').forEach(c=>c.setAttribute('pathLength','1'))};
RENDER.frame=function(i,t,pr){
 Object.entries(seq).forEach(([s,list])=>{s=+s;list.forEach(([k,th])=>show(k,rm||i>s||(i===s&&Math.min(1,t*1.6)>=th)))});
 const draw=(sel,s)=>{const v=rm||i>s?0:i===s?Math.max(0,1-t*2.2):1;G(sel).forEach(c=>c.style.strokeDashoffset=v)};draw('vc',1);draw('gc',2);
};
RENDER.hover=function(t,on){const k=t.dataset.k;if(!k)return;b.classList.toggle('fz',on);$$('.on').forEach(e=>e.classList.remove('on'));if(on){G(k).forEach(e=>e.classList.add('on'));G(k==='perf'?'gc-perf':k==='act'?'gc-act':k==='use'?'gc-use':'vc-'+k).forEach(e=>e.classList.add('on'))}};

return RENDER})();
CH['design']=(function(){const root=document.getElementById('design');const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];const RENDER={steps:[["Design considerations", "Scanning scenarios, read-head position, shift length and battery life, played together."], ["Explore", "Hover a photo, or drag the scanner position along the axis. The closer the read head sits to the fingertip, the more sensitive it is and the faster it fires."]],layout:'pin',dur:[3200,0]};

const b=$('#b2');
const G=k=>$$('[data-g~="'+k+'"]');
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const D={x1:499.59,y1:750.05,x2:1097.55,y2:257.2};
let pos=.4;
function zoneOf(t){return t<.3?'w':t<.66?'b':'f'}
const NAMES={w:'Wrist',b:'Back of hand',f:'Finger'};
function sel(z,on){b.classList.toggle('dimph',on);$$('[data-g~="ph"],[data-g~="hc"],[data-g~="pz"],.pzf').forEach(e=>e.classList.remove('sel'));if(on){['ph-','hc-','pz-','pzf-'].forEach(pf=>G(pf+z).forEach(e=>e.classList.add('sel')))}}
function setPos(t){pos=Math.max(0,Math.min(1,t));const x=D.x1+(D.x2-D.x1)*pos,y=D.y1+(D.y2-D.y1)*pos;
 $('#sv').setAttribute('x1',x);$('#sv').setAttribute('x2',x);$('#sv').setAttribute('y2',y);$('#sh').setAttribute('y1',y);$('#sh').setAttribute('y2',y);$('#sh').setAttribute('x2',x);
 ['#sd','#sd2'].forEach(s=>{$(s).setAttribute('cx',x);$(s).setAttribute('cy',y)});$('#knob').setAttribute('transform','translate('+x+',769)');$('#knob').setAttribute('aria-valuenow',Math.round(pos*100));
 const z=zoneOf(pos);$('#sread').textContent=NAMES[z];$('#sread').setAttribute('x',Math.min(1060,Math.max(560,x)));$('#sread').setAttribute('y',Math.max(250,y-30));sel(z,true)}
function toSvg(e){const p=b.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(b.getScreenCTM().inverse())}
RENDER.init=function(){
 const dg=G('diag')[0];const L=dg.getTotalLength?dg.getTotalLength():780;dg.style.strokeDasharray=L;dg.style.strokeDashoffset=L;b.dataset.L=L;
 b.classList.add('pre','z','zb');
 let drag=false;const k=$('#knob');RENDER.userDrag=()=>drag;
 k.addEventListener('pointerdown',e=>{drag=true;RENDER.touched=true;k.setPointerCapture(e.pointerId);e.preventDefault()});
 k.addEventListener('pointermove',e=>{if(!drag)return;const p=toSvg(e);setPos((p.x-D.x1)/(D.x2-D.x1))});
 k.addEventListener('pointerup',()=>drag=false);
 const hit=$('#hit');hit.addEventListener('pointerdown',e=>{drag=true;RENDER.touched=true;k.setPointerCapture(e.pointerId);const q=toSvg(e);setPos((q.x-D.x1)/(D.x2-D.x1));e.preventDefault()});
 const PICK={f:.86,b:.52,w:.14};
 $$('.pzf').forEach(f=>f.addEventListener('click',()=>{RENDER.touched=true;setPos(PICK[f.dataset.pick])}));
 G('hc').forEach(c=>c.addEventListener('click',()=>{RENDER.touched=true;const z=c.dataset.g.match(/hc-(\w)/)[1];setPos(PICK[z])}));
 k.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowUp'){setPos(pos+.05);e.preventDefault()}if(e.key==='ArrowLeft'||e.key==='ArrowDown'){setPos(pos-.05);e.preventDefault()}});
 // tips for text labels
 G('lb').forEach(t=>{const c=[...t.dataset.g.split(' ')].find(x=>x.startsWith('lb-'));const tp={'lb-scanner':'Scanner — the read head and housing','lb-base':'Build-on base — mounts the scanner to the glove','lb-gloves':'Gloves — worn for a whole shift','lb-fabric':'Ventilative fabric — breathable panel','lb-trigger':'Trigger — fired with the thumb'}[c];if(tp)t.dataset.tip=tp});
 G('lb2').forEach(t=>{const c=t.dataset.g.split(' ').find(x=>x.startsWith('pt-'));t.dataset.tip={'pt-battery':'Battery','pt-pcb':'PCB','pt-eink':'E-ink screen','pt-engine':'Scanning engine'}[c]});
 G('hc-w').forEach(e=>e.dataset.tip='Wrist');G('hc-b').forEach(e=>e.dataset.tip='Back of hand');G('hc-f').forEach(e=>e.dataset.tip='Finger');
};
function part(prefix,cls,key,on){b.classList.toggle(cls,on);$$('[data-g~="'+prefix+'"],[data-g~="ld"],[data-g~="lb"],[data-g~="pl"],[data-g~="lb2"]').forEach(e=>e.classList.remove('sel'));if(on)G(key).forEach(e=>e.classList.add('sel'))}
RENDER.hover=function(t,on){const g=(t.dataset.g||'').split(' ');
 const ph=g.find(x=>/^(ph|hc)-/.test(x));if(ph){sel(ph.slice(3),on);if(!on)setPos(pos)}
 const lb=g.find(x=>/^(lb|ov|ld)-/.test(x));if(lb){const k=lb.split('-')[1];part('ov','dimov',k,false);if(on){b.classList.add('dimov');['ov','ld','lb'].forEach(p=>G(p+'-'+k).forEach(e=>e.classList.add('sel')))}}
 const pt=g.find(x=>/^pt-/.test(x));if(pt){b.classList.toggle('dimpt',on);$$('[data-g~="pt"],[data-g~="pl"],[data-g~="lb2"]').forEach(e=>e.classList.remove('sel'));if(on)G(pt).forEach(e=>e.classList.add('sel'))}
};
function count(el,to,dec,suf){if(el.dataset.done)return;el.dataset.done=1;const t0=performance.now();(function f(t){const p=rm?1:Math.min(1,(t-t0)/1100);const v=to*(1-Math.pow(1-p,3));el.textContent=(dec?v.toFixed(1):Math.round(v))+suf;if(p<1)requestAnimationFrame(f)})(t0)}
RENDER.step=function(i){
 $$('.sel').forEach(e=>e.classList.remove('sel'));b.classList.remove('dimov','dimpt','dimph');
 const dg=G('diag')[0],L=+b.dataset.L;
 if(i===0){RENDER.cnt=false;b.classList.add('pre','zb');['pct','hrs'].forEach(k=>G(k).forEach(e=>delete e.dataset.done));G('pct')[0].textContent='0%';G('hrs').forEach(e=>e.textContent='0hrs');
  dg.style.strokeDashoffset=L;G('ph').forEach(e=>e.style.opacity=0);G('sh').forEach(e=>e.style.transform='scaleX(0)');
  requestAnimationFrame(()=>requestAnimationFrame(()=>b.classList.remove('zb')))}
 else{b.classList.remove('pre','zb');dg.style.strokeDashoffset=0;G('ph').forEach(e=>e.style.opacity='');G('sh').forEach(e=>e.style.transform='none');startCounts();setPos(pos)}
};
function startCounts(){if(RENDER.cnt)return;RENDER.cnt=true;count(G('pct')[0],70,0,'%');count(G('hrs').find(e=>e.dataset.g.includes('b2')),13.5,1,'hrs');count(G('hrs').find(e=>e.dataset.g.includes('b1')),8,0,'hrs')}
RENDER.frame=function(i,t){
 if(i!==0)return;
 const dg=G('diag')[0],L=+b.dataset.L,tt=rm?1:Math.min(1,t*1.4);
 dg.style.strokeDashoffset=L*(1-tt);
 ['w','b','f'].forEach((z,k)=>G('ph-'+z).forEach(e=>e.style.opacity=(tt>(k+.4)/3.4)?'':0));
 if(!RENDER.touched){setPos(.08+.84*tt);b.classList.remove('dimph')}
 const h=rm?24:Math.min(24,t*26),x=51.35+(1388.8-51.35)*h/24;$('#phl').setAttribute('x1',x);$('#phl').setAttribute('x2',x);$('#phc').setAttribute('cx',x);$('#pht').setAttribute('x',x);$('#pht').textContent=Math.floor(h)+' h';
 const segs=[[0,7],[8,15],[16,23]];G('sh').forEach(e=>{const n=+e.dataset.g.match(/sh(\d)/)[1]-1;const [a,z]=segs[n];e.style.transform='scaleX('+Math.max(0,Math.min(1,(h-a)/(z-a)))+')'});
 if(t>.3)startCounts();
};

return RENDER})();


(function(){
 const RMQ=matchMedia('(prefers-reduced-motion: reduce)');
 Object.entries(CH).forEach(([id,R])=>{const sec=document.getElementById(id);R.sec=sec;R.cur=-1;R.t=0;R.playing=false;R.seen=false;sec.dataset.step='-1';
  const n=R.steps.length;const dots=sec.querySelector('.dots');
  const pb=document.createElement('button');pb.type='button';pb.className='pp';pb.setAttribute('aria-label','Play');pb.innerHTML='<svg viewBox="0 0 16 16" aria-hidden="true"><path class="i-play" d="M4 2.5v11l9-5.5z"/><path class="i-pause" d="M4 2.5h3v11H4zM9 2.5h3v11H9z"/><path class="i-re" d="M8 2.5a5.5 5.5 0 1 1-5.2 3.7l1.4.5A4 4 0 1 0 8 4v2L4.8 3.2 8 .5z"/></svg>';dots.before(pb);R.pb=pb;
  R.steps.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Play from step '+(i+1)+': '+s[0]);b.innerHTML='<i><b></b></i>';b.onclick=()=>{R.touched=false;go(R,i,true)};dots.appendChild(b)});
  R.segs=[...dots.children];
  pb.onclick=()=>{if(R.playing){R.playing=false}else{if(R.cur===n-1||R.cur<0){R.touched=false;go(R,0,true)}else R.playing=true}ui(R)};
  sec.querySelector('.board').addEventListener('pointerdown',()=>{if(R.playing){R.playing=false;R.touched=true;ui(R)}});
  R.init&&R.init();
  new IntersectionObserver(es=>es.forEach(e=>{R.vis=e.isIntersecting;if(e.isIntersecting){if(!R.seen){R.seen=true;go(R,0,true)}else if(R.wasPlaying){R.playing=true;ui(R)}}else{R.wasPlaying=R.playing;R.playing=false;ui(R)}}),{threshold:.55}).observe(sec)});
 function ui(R){const n=R.steps.length;R.pb.dataset.s=R.playing?'pause':(R.cur===n-1?'re':'play');R.pb.setAttribute('aria-label',R.playing?'Pause':(R.cur===n-1?'Replay':'Play'));
  R.segs.forEach((b,j)=>{const f=j<R.cur?1:j===R.cur?(j===n-1?1:R.t):0;b.querySelector('b').style.transform='scaleX('+f+')';b.setAttribute('aria-current',j===R.cur?'step':'false')})}
 function go(R,i,play){const n=R.steps.length;R.cur=i;R.t=0;R.sec.dataset.step=i;const s=R.steps[i];const cap=R.sec.querySelector('.cap');
  cap.querySelector('.no').textContent=String(i+1).padStart(2,'0')+' / '+String(n).padStart(2,'0');cap.querySelector('h3').textContent=s[0];cap.querySelector('p').innerHTML=s[1];
  R.playing=play&&i<n-1;R.step&&R.step(i);R.frame&&R.frame(i,RMQ.matches?1:0,(i)/n);ui(R)}
 let last=performance.now();
 function loop(now){const dt=Math.min(100,now-last);last=now;
  Object.values(CH).forEach(R=>{if(!R.playing||R.cur<0)return;const d=RMQ.matches?600:(R.dur[R.cur]||4500);R.t=Math.min(1,R.t+dt/d);R.frame&&R.frame(R.cur,R.t,(R.cur+R.t)/R.steps.length);
   if(R.t>=1){if(R.cur<R.steps.length-1)go(R,R.cur+1,true);else R.playing=false}ui(R)});
  requestAnimationFrame(loop)}
 requestAnimationFrame(loop);
 const tip=document.createElement('div');tip.className='rsx-tip';document.body.appendChild(tip);let te=null;
 const own=t=>{const s=t.closest('.chapter');return s&&CH[s.id]};
 document.addEventListener('pointerover',e=>{const t=e.target.closest&&e.target.closest('[data-tip]');if(!t)return;te=t;tip.innerHTML=t.dataset.tip;tip.classList.add('show');const R=own(t);R&&R.hover&&R.hover(t,true)});
 document.addEventListener('pointermove',e=>{if(!te)return;tip.style.left=Math.min(innerWidth-140,Math.max(140,e.clientX))+'px';tip.style.top=e.clientY+'px'});
 document.addEventListener('pointerout',e=>{const t=e.target.closest&&e.target.closest('[data-tip]');if(t&&!t.contains(e.relatedTarget)){const R=own(t);R&&R.hover&&R.hover(t,false);te=null;tip.classList.remove('show')}});
})();
