/* No dependencies. Progressive enhancement preserves the original page and v3 editor IDs. */
(() => {
  'use strict';
  const asset = name => `duo-motion-assets/${name}`;
  const editing = () => document.body.classList.contains('is-local-editing');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const position = (x, y, w, h) => `--x:${x / 19.2}%;--y:${y / 10.8}%;--w:${w / 19.2}%;--h:${h / 10.8}%`;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const chrome = () => `<div class="scene-chrome" aria-hidden="true"><span>ROG</span><b>|</b><span>ZEPHYRUS</span><b>|</b><span>DUO</span><b>|</b><span>OFF BLACK</span><b>|</b><span>GX651</span></div><div class="scene-side" aria-hidden="true">FOR THOSE WHO DARE</div>`;
  const title = (id, label, subtitle) => `<h2 class="native-heading" data-local-editor-id="${id}-heading" data-motion="title"><span class="motion-entry" style="display:block">${label}</span></h2>${subtitle ? `<p class="native-subheading" data-local-editor-id="${id}-subtitle" data-motion="title" style="--delay:.12s"><span class="motion-entry" style="display:block">${subtitle}</span></p>` : ''}`;
  function layer(id, file, label, box, motion, delay) {
    return `<figure class="scene-layer" data-local-editor-id="${id}" data-editor-label="${escape(label)}" data-motion="${motion}" style="${position(...box)};--delay:${delay}s"><div class="motion-entry"><img src="${asset(file)}" alt="${escape(label)}" loading="lazy" decoding="async"></div></figure>`;
  }
  function mount(sectionId, name, markup) {
    const section = document.getElementById(sectionId);
    const stage = section?.querySelector('.pdf-scene-stage');
    const original = stage?.querySelector(':scope > img');
    if (!original) return null;
    const page = document.createElement('div');
    page.className = `layered-page ${name}-scene`;
    page.dataset.editorLabel = `${sectionId} · 整頁圖層`;
    if (original.dataset.localEditorId) page.dataset.localEditorId = original.dataset.localEditorId;
    if (original.hasAttribute('style')) page.setAttribute('style', original.getAttribute('style'));
    page.innerHTML = markup;
    stage.classList.remove('reveal-on-scroll', 'is-visible');
    stage.classList.add('layered-stage', `${name}-stage`);
    original.replaceWith(page);
    return stage;
  }

  const concept = mount('concept', 'archetype', chrome() + title('archetype', 'CONCEPT DEVELOPMENT', 'ARCHETYPE DEFINITION') +
    layer('archetype-diagram', '010_Im0.webp', '功能區域：輸入／互動／輸出', [94.8,212.6,622,327.4], 'settle', .22) +
    layer('archetype-positioning', '013_Im2.webp', '產品定位圖', [96,553.4,620.6,410.4], 'rise', .52) +
    // Comparison/radar artwork is intentionally unchanged until high-resolution sources arrive.
    layer('archetype-options', '011_Im0.webp', '原稿方案與雷達圖（待高清素材）', [780,212.6,1067.1,623.5], 'wipe', .34) +
    layer('archetype-dimensions', '012_Im1.webp', '原稿方案尺寸', [778.9,835,1069.3,130], 'rise', .62) +
    `<div class="zone-controls" aria-label="探索功能區域">
      <button type="button" data-zone="input" style="--zone-color:#4886ff" aria-pressed="false" aria-controls="zoneDescription">INPUT</button>
      <button type="button" data-zone="interaction" style="--zone-color:#b673f4" aria-pressed="false" aria-controls="zoneDescription">INTERACTION</button>
      <button type="button" data-zone="output" style="--zone-color:#ef8a4f" aria-pressed="false" aria-controls="zoneDescription">OUTPUT</button>
      <div class="zone-detail" id="zoneDescription" role="status" hidden></div>
    </div>`);

  if (concept) {
    const diagram = concept.querySelector('[data-local-editor-id="archetype-diagram"] .motion-entry');
    diagram.insertAdjacentHTML('beforeend', `<svg class="zone-overlay" viewBox="0 0 1993 1049" preserveAspectRatio="none" aria-label="雙螢幕功能分區">
      <polygon data-zone="input" role="button" tabindex="0" aria-label="藍色：Input 輸入區" style="--zone-color:#4886ff;--delay:.5s" points="970,623 1544,841 1351,943 772,706"/>
      <polygon data-zone="interaction" role="button" tabindex="0" aria-label="紫色：Interaction 互動區" style="--zone-color:#b673f4;--delay:.75s" points="1166,478 1738,676 1565,828 989,613"/>
      <polygon data-zone="output" role="button" tabindex="0" aria-label="橘色：Output 輸出區" style="--zone-color:#ef8a4f;--delay:1s" points="1360,43 1945,191 1757,680 1186,483"/>
    </svg>`);
    const descriptions = {
      input:['INPUT / 輸入區', '藍色區域：鍵盤與觸控操作，承接使用者的主要輸入。'],
      interaction:['INTERACTION / 互動區', '紫色區域：第二螢幕，連接操作與內容，提供延伸資訊與互動空間。'],
      output:['OUTPUT / 輸出區', '橘色區域：主螢幕，負責主要畫面與內容呈現。']
    };
    const detail = concept.querySelector('.zone-detail');
    let active = null;
    function activate(zone) {
      if (editing()) return;
      active = active === zone ? null : zone;
      concept.querySelectorAll('[data-zone]').forEach(node => {
        node.classList.remove('zone-pulse');
        node.classList.toggle('is-active', node.dataset.zone === active);
        node.setAttribute('aria-pressed', String(node.dataset.zone === active));
      });
      detail.hidden = !active;
      if (active) detail.innerHTML = `<strong>${descriptions[active][0]}</strong>${descriptions[active][1]}`;
    }
    concept.querySelectorAll('[data-zone]').forEach(node => {
      node.addEventListener('click', () => activate(node.dataset.zone));
      if (node.tagName.toLowerCase() === 'polygon') node.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(node.dataset.zone); }
      });
    });
    concept.addEventListener('keydown', event => { if (event.key === 'Escape' && active) activate(active); });
  }

  const ideation = mount('ideation', 'ideation', chrome() + title('ideation', 'CONCEPT DEVELOPMENT', 'IDEATION') +
    `<div class="ideation-backplate" style="left:3.03%;top:14.44%;width:47.55%;height:81.7%"></div>
     <div class="ideation-backplate" style="left:52.29%;top:15.74%;width:43.07%;height:32.5%"></div>
     <div class="ideation-backplate" style="left:52.29%;top:53.8%;width:43.07%;height:35.2%"></div>` +
    layer('ideation-hinge-study','020_Im6.webp','開合架構與側面草圖',[68.3,187.8,894.3,583.4],'wipe',.22) +
    layer('ideation-design-principles','019_Im5.webp','三種轉軸設計方向',[68.3,783.9,894.3,250.7],'rise',.62) +
    layer('ideation-cover-study','018_Im4.webp','上蓋語彙與厚度探索',[1007.8,184.3,815.6,331.5],'side',.42) +
    layer('ideation-profile','017_Im3.webp','機身側面比例',[1057.8,641.3,412.1,256.9],'settle',.62) +
    layer('ideation-vent-a','014_Im0.webp','散熱輪廓探索 A',[1508.8,625.1,297.8,111.6],'side',.74) +
    layer('ideation-vent-b','015_Im1.webp','散熱輪廓探索 B',[1508.8,736.3,313.3,105.1],'side',.88) +
    layer('ideation-vent-c','016_Im2.webp','散熱輪廓探索 C',[1508.8,841.6,297.8,73.2],'side',1.02));

  const photos = [
    {id:'prototype-front',file:'031_Im4.webp',label:'實體模型 · 正面與雙螢幕',box:[83.8,148.2,494.1,511.4],ratio:342/354},
    {id:'prototype-closed',file:'032_Im5.webp',label:'實體模型 · 閉合外觀',box:[84.1,672.5,493.4,278.6],ratio:457/258},
    {id:'prototype-angle',file:'027_Im0.webp',label:'實體模型 · 開合角度',box:[588.3,149.5,630.2,510.4],ratio:363/294,rotate:true},
    {id:'prototype-bottom',file:'029_Im2.webp',label:'實體模型 · 底部結構',box:[588.3,671.2,631.3,279.4],ratio:479/212},
    {id:'prototype-back',file:'028_Im1.webp',label:'實體模型 · 背面結構',box:[1230.8,148.4,651.9,303],ratio:484/225},
    {id:'prototype-hinge',file:'030_Im3.webp',label:'實體模型 · 轉軸細節',box:[1230,461.1,654.9,488.3],ratio:484/363}
  ];
  const prototype = mount('prototype', 'prototype', title('prototype', 'PROTOTYPING') +
    `<div class="prototype-gallery">${photos.map((photo, i) => `<figure class="prototype-photo" data-local-editor-id="${photo.id}" data-editor-label="${photo.label}" data-motion="${i % 2 ? 'settle' : 'wipe'}" style="${position(...photo.box)};--photo-ratio:${photo.ratio};--delay:${.18 + i * .12}s">
      <div class="motion-entry"><button type="button" data-prototype="${photo.id}" aria-label="放大檢視：${photo.label}" aria-haspopup="dialog"><img src="${asset(photo.file)}" alt="${photo.label}" loading="lazy" decoding="async" ${photo.rotate ? 'class="photo-turn90"' : ''}><span class="photo-caption">${photo.label} ↗</span></button></div>
    </figure>`).join('')}</div>
    <p class="prototype-note" data-local-editor-id="prototype-note">PHYSICAL PROTOTYPE — 懸停探索細節・點擊放大檢視</p>`);

  const rotationObserver = new ResizeObserver(entries => entries.forEach(({target}) => {
    target.style.setProperty('--turn-width', `${target.clientHeight}px`);
    target.style.setProperty('--turn-height', `${target.clientWidth}px`);
  }));
  document.querySelectorAll('.photo-turn90').forEach(img => rotationObserver.observe(img.parentElement));

  if (prototype) {
    const viewer = document.createElement('dialog');
    viewer.className = 'prototype-viewer';
    viewer.setAttribute('aria-label', '實體模型照片檢視');
    viewer.innerHTML = `<button type="button" class="prototype-viewer-close" aria-label="關閉照片檢視">關閉 ×</button><div class="prototype-viewer-content"><div class="prototype-viewer-image"><img alt=""></div><p class="prototype-viewer-caption"></p></div>`;
    document.body.append(viewer);
    const frame = viewer.querySelector('.prototype-viewer-image');
    const largeImage = frame.querySelector('img');
    const closeButton = viewer.querySelector('.prototype-viewer-close');
    let opener;
    const close = () => viewer.close();
    closeButton.addEventListener('click', close);
    viewer.addEventListener('click', event => { if (event.target === viewer) close(); });
    viewer.addEventListener('close', () => {
      document.body.classList.remove('prototype-viewing');
      opener?.focus({preventScroll:true});
    });
    rotationObserver.observe(frame);
    prototype.querySelectorAll('[data-prototype]').forEach(button => button.addEventListener('click', () => {
      if (editing()) return;
      const photo = photos.find(item => item.id === button.dataset.prototype);
      opener = button;
      largeImage.src = asset(photo.file);
      largeImage.alt = photo.label;
      largeImage.classList.toggle('photo-turn90', !!photo.rotate);
      frame.style.setProperty('--photo-ratio', photo.ratio);
      viewer.querySelector('.prototype-viewer-caption').textContent = photo.label;
      viewer.showModal();
      document.body.classList.add('prototype-viewing');
      closeButton.focus();
    }));
  }

  // Keep unchanged art in place, but give its arrival an appropriate, different cadence.
  const otherScenes = [];
  [['refinement','wipe'],['second-panel','settle'],['hinge','side'],['features','rise'],['final','settle']].forEach(([id, motion]) => {
    const stage = document.querySelector(`#${id} .pdf-scene-stage`);
    const image = stage?.querySelector(':scope > img');
    if (!image) return;
    stage.classList.remove('reveal-on-scroll','is-visible');
    stage.classList.add('flat-motion-scene');
    stage.dataset.motion = motion;
    const surface = document.createElement('div');
    surface.className = 'flat-motion-surface motion-entry';
    image.replaceWith(surface);
    surface.append(image);
    otherScenes.push(stage);
  });

  const stages = [concept, ideation, prototype, ...otherScenes].filter(Boolean);
  function startMotion(stage) {
    stage.classList.remove('motion-pending');
    stage.classList.add('motion-ready');
    stage.querySelectorAll('.zone-overlay polygon').forEach(node => node.classList.add('zone-pulse'));
  }
  // Warm up lazy images ahead of the viewport, then allow a bounded decode wait before entry.
  const warmup = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('img').forEach(img => { img.loading = 'eager'; img.decode?.().catch(() => {}); });
    warmup.unobserve(entry.target);
  }), {rootMargin:'700px 0px'});
  const entrance = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const stage = entry.target;
    entrance.unobserve(stage);
    const decoded = [...stage.querySelectorAll('img')].map(img => {img.loading = 'eager'; return img.decode?.().catch(() => {});});
    Promise.race([Promise.all(decoded), new Promise(resolve => setTimeout(resolve, 800))]).then(() => startMotion(stage));
  }), {threshold:.08, rootMargin:'0px 0px -8% 0px'});
  stages.forEach(stage => {
    if (reducedMotion.matches) {startMotion(stage);return;}
    stage.classList.add('motion-pending');
    warmup.observe(stage);
    entrance.observe(stage);
  });
  reducedMotion.addEventListener('change', event => {
    if (event.matches) stages.forEach(startMotion);
  });
  window.dispatchEvent(new Event('duo:layers-ready'));
})();
