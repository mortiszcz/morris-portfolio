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

  const storyPanel = (id, file, alt, caption, extra = '') => `<section class="story-panel" data-story-panel="${id}" ${id === 'strategy' ? '' : 'hidden'}>
    <figure class="story-figure" data-local-editor-id="archetype-${id}" data-editor-label="${escape(alt)}">
      <img src="${asset(file)}" alt="${escape(alt)}" loading="lazy" decoding="async">
      <figcaption>${caption}</figcaption>
      ${extra}
    </figure>
  </section>`;

  const territories = [
    {id:'duo', label:'ZEPHYRUS DUO', x:26, y:35, title:'The opportunity: a performance interaction unit', body:'The original study groups Duo concepts in a high-performance territory. The second screen should extend control and context, while the main display remains the focused output surface.', tag:'DUAL-SCREEN / PERFORMANCE', image:true},
    {id:'creator', label:'MODERN CREATOR', x:63, y:32, title:'Modern creation needs continuous feedback', body:'3D creation and touch-enabled workflows sit toward the high-performance end of the study. A second surface can keep tools and live feedback available without crowding the main canvas.', tag:'3D CREATION / TOUCH'},
    {id:'game', label:'GAME DEVELOPER', x:85, y:18, title:'Build and inspect at the same time', body:'Game development represents a high-performance workflow with multiple working views. The strategic question is how to keep the primary output and supporting controls connected.', tag:'DEVELOPMENT / HIGH PERFORMANCE'},
    {id:'web', label:'WEB / SOFTWARE', x:85, y:48, title:'Keep code, context, and output connected', body:'Web and software workflows illustrate another use for continuous human–computer interaction: supporting information stays visible while the primary task keeps its own space.', tag:'DEVELOPMENT / CONTEXT'},
    {id:'zenbook', label:'ZENBOOK DUO', x:65, y:81, title:'A mobility-led dual-screen reference', body:'The original map places Zenbook Duo 8406 toward lower performance and higher mobility. It provides a reference for screen continuity, not a claim of measured benchmark superiority.', tag:'DUAL-SCREEN / MOBILITY'},
    {id:'pen', label:'PEN + TOUCH', x:17, y:79, title:'Direct input as a different starting point', body:'The ProArt Slate reference anchors pen and touch input in the source study. Duo explores how physical input, an interaction surface, and visual output can work as one system.', tag:'DIRECT INPUT / CREATIVE CONTROL'}
  ];
  const positioningPanel = `<section class="story-panel positioning-panel" data-story-panel="strategy">
    <div class="positioning-map" aria-label="Qualitative performance and interaction positioning map">
      <div class="positioning-axis positioning-axis--vertical" aria-hidden="true"></div><div class="positioning-axis positioning-axis--horizontal" aria-hidden="true"></div>
      <span class="map-axis-label map-axis-label--high">HIGH PERFORMANCE</span><span class="map-axis-label map-axis-label--low">MOBILITY-LED / LOWER PERFORMANCE</span>
      <span class="map-axis-label map-axis-label--input">PEN + TOUCH INPUT</span><span class="map-axis-label map-axis-label--workflow">CREATION + DEVELOPMENT</span>
      <div class="duo-territory" aria-hidden="true"><span>STRATEGIC TERRITORY</span></div>
      ${territories.map(item => `<button type="button" class="positioning-node ${item.image ? 'positioning-node--duo' : ''}" data-territory="${item.id}" aria-pressed="${item.id === 'duo'}" aria-controls="positioning-detail" style="--node-x:${item.x}%;--node-y:${item.y}%">${item.image ? `<img src="${asset('final-open-hq-mobile.webp')}" alt="" loading="lazy" decoding="async">` : '<i aria-hidden="true"></i>'}<span>${item.label}</span></button>`).join('')}
    </div>
    <div class="positioning-detail" id="positioning-detail" role="status"><span>${territories[0].tag}</span><h3>${territories[0].title}</h3><p>${territories[0].body}</p></div>
    <div class="positioning-note"><span>Qualitative strategy map · not benchmark data</span><button type="button" data-map-source>ORIGINAL STUDY ↗</button></div>
  </section>`;

  const concept = mount('concept', 'archetype', chrome() +
    `<div class="archetype-shell">
      <header class="archetype-narrative" data-motion="side">
        <div class="motion-entry">
          <p class="scene-kicker">CONCEPT DEVELOPMENT · 01</p>
          <h2 data-local-editor-id="archetype-heading">ARCHETYPE<br>STRATEGY</h2>
          <p class="archetype-lede">Reframe the Duo from a specialized dual-screen laptop into one high-performance system for creation, play, and continuous interaction.</p>
          <nav class="story-tabs" aria-label="Archetype development sections" role="tablist">
            <button type="button" role="tab" aria-selected="true" data-story-tab="strategy"><span>01</span> POSITION</button>
            <button type="button" role="tab" aria-selected="false" data-story-tab="architecture"><span>02</span> ARCHITECTURE</button>
            <button type="button" role="tab" aria-selected="false" data-story-tab="concepts"><span>03</span> PROPOSALS</button>
          </nav>
          <div class="story-copy" aria-live="polite">
            <section data-story-copy="strategy">
              <strong>Move upward without losing mobility.</strong>
              <p>The opportunity sits between premium mobile computing and uncompromised creator performance.</p>
            </section>
            <section data-story-copy="architecture" hidden>
              <strong>One system, not two stacked screens.</strong>
              <p>Input, interaction, and output are sequenced as a single workspace that changes with the task.</p>
            </section>
            <section data-story-copy="concepts" hidden>
              <strong>Compare architecture before styling.</strong>
              <p>Five proposals were measured against thermal flow, screen border, hinge behavior, and package dimensions.</p>
            </section>
          </div>
        </div>
      </header>
      <div class="archetype-canvas" data-motion="settle">
        <div class="motion-entry">
          ${positioningPanel}
          ${storyPanel('architecture', '010_Im0.png', 'Dual-screen interaction architecture', '<span>INTERACTION ARCHITECTURE</span><strong>Three functional zones become one continuous unit</strong>', `<div class="zone-controls" aria-label="Explore functional zones">
            <button type="button" data-zone="input" style="--zone-color:#4886ff" aria-pressed="true">INPUT</button>
            <button type="button" data-zone="interaction" style="--zone-color:#b673f4" aria-pressed="false">INTERACTION</button>
            <button type="button" data-zone="output" style="--zone-color:#ef8a4f" aria-pressed="false">OUTPUT</button>
            <p class="zone-detail" role="status"><strong>INPUT</strong> Keyboard and touch establish the primary control layer.</p>
          </div>`)}
          ${storyPanel('concepts', '011_Im0.png', 'Five concept proposals compared across architecture criteria', '<span>FIVE ROUTES · ONE SCORECARD</span><strong>Select a proposal to trace the comparison</strong>', `<div class="concept-focus" aria-hidden="true" style="--concept-index:0"></div>
            <div class="concept-switcher" role="tablist" aria-label="Concept proposal focus">
              ${['A','B','C','D','E'].map((letter, index) => `<button type="button" role="tab" aria-selected="${index === 0}" data-concept="${index}">CONCEPT ${letter}</button>`).join('')}
            </div>
            <figure class="dimension-strip"><img src="${asset('012_Im1.png')}" alt="Concept package dimensions" loading="lazy" decoding="async"></figure>`)}
        </div>
      </div>
      <div class="archetype-signals" aria-label="Archetype strategy signals">
        <span><b>175W</b> performance target</span><span><b>3</b> functional zones</span><span><b>5</b> proposals compared</span>
      </div>
    </div>`);

  function setupTabs(root, buttonSelector, panelSelector, buttonKey, panelKey = buttonKey) {
    if (!root) return;
    const buttons = [...root.querySelectorAll(buttonSelector)];
    const panels = [...root.querySelectorAll(panelSelector)];
    const select = (key, focus = false) => {
      if (editing()) return;
      buttons.forEach(button => {
        const selected = button.dataset[buttonKey] === key;
        button.setAttribute('aria-selected', String(selected));
        button.tabIndex = selected ? 0 : -1;
        if (selected && focus) button.focus({preventScroll:true});
      });
      panels.forEach(panel => {
        const selected = panel.dataset[panelKey] === key;
        panel.hidden = !selected;
        if (selected) {
          panel.classList.remove('panel-enter');
          requestAnimationFrame(() => panel.classList.add('panel-enter'));
        }
      });
    };
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => select(button.dataset[buttonKey]));
      button.addEventListener('keydown', event => {
        if (!['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = buttons.length - 1;
        else next = (index + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
        select(buttons[next].dataset[buttonKey], true);
      });
    });
  }

  setupTabs(concept, '[data-story-tab]', '[data-story-panel]', 'storyTab', 'storyPanel');
  setupTabs(concept, '[data-story-tab]', '[data-story-copy]', 'storyTab', 'storyCopy');

  if (concept) {
    concept.querySelectorAll('[data-territory]').forEach(button => button.addEventListener('click', () => {
      const territory = territories.find(item => item.id === button.dataset.territory);
      concept.querySelectorAll('[data-territory]').forEach(node => node.setAttribute('aria-pressed', String(node === button)));
      const detail = concept.querySelector('.positioning-detail');
      detail.innerHTML = `<span>${territory.tag}</span><h3>${territory.title}</h3><p>${territory.body}</p>`;
      detail.classList.remove('panel-enter');
      requestAnimationFrame(() => detail.classList.add('panel-enter'));
    }));
    const sourceViewer = document.createElement('dialog');
    sourceViewer.className = 'positioning-source-viewer';
    sourceViewer.setAttribute('aria-label', 'Original positioning study');
    sourceViewer.innerHTML = `<header><h2>ORIGINAL POSITIONING STUDY</h2><button type="button">CLOSE ×</button></header><img src="${asset('013_Im2.png')}" alt="Original study: performance versus interaction, with Duo, Zenbook, pen and touch, and developer workflows" loading="lazy"><p>This source preserves the original product references and strategy. The interactive map is a qualitative interpretation, not a performance benchmark.</p>`;
    document.body.append(sourceViewer);
    const sourceOpener = concept.querySelector('[data-map-source]');
    sourceOpener.addEventListener('click', () => { sourceViewer.querySelector('img').loading = 'eager'; sourceViewer.showModal(); sourceViewer.querySelector('button').focus(); });
    sourceViewer.querySelector('button').addEventListener('click', () => sourceViewer.close());
    sourceViewer.addEventListener('click', event => { if (event.target === sourceViewer) sourceViewer.close(); });
    sourceViewer.addEventListener('close', () => sourceOpener.focus({preventScroll:true}));
    const descriptions = {
      input:['INPUT', 'Keyboard and touch establish the primary control layer.'],
      interaction:['INTERACTION', 'The second display bridges command, context, and live feedback.'],
      output:['OUTPUT', 'The main display protects focus for the highest-value visual work.']
    };
    const detail = concept.querySelector('.zone-detail');
    concept.querySelectorAll('[data-zone]').forEach(button => button.addEventListener('click', () => {
      if (editing()) return;
      concept.querySelectorAll('[data-zone]').forEach(node => node.setAttribute('aria-pressed', String(node === button)));
      detail.innerHTML = `<strong>${descriptions[button.dataset.zone][0]}</strong>${descriptions[button.dataset.zone][1]}`;
    }));
    const focus = concept.querySelector('.concept-focus');
    concept.querySelectorAll('[data-concept]').forEach(button => button.addEventListener('click', () => {
      if (editing()) return;
      concept.querySelectorAll('[data-concept]').forEach(node => node.setAttribute('aria-selected', String(node === button)));
      focus.style.setProperty('--concept-index', button.dataset.concept);
    }));
  }

  const proposalSteps = [
    {id:'language', number:'01', label:'DESIGN LANGUAGE', title:'Carry the Zephyrus language forward', body:'Two architecture directions tested how the second display could open while the closed silhouette stayed unmistakably Zephyrus.'},
    {id:'principles', number:'02', label:'SELECTION PRINCIPLES', title:'Turn form into evaluation criteria', body:'Opening clarity, a hidden mechanism, and visual stability became the three principles used to judge every proposal.'},
    {id:'mechanism', number:'03', label:'MECHANISM MATRIX', title:'Compare the package before styling', body:'Thickness, hinge travel, border treatment, and cooling space were explored as a system—not as isolated details.'},
    {id:'convergence', number:'04', label:'CONVERGENCE', title:'Shortlist the most stable silhouette', body:'Profile studies reduced the field to a direction that feels integrated when closed and deliberate when deployed.'}
  ];
  const ideation = mount('ideation', 'ideation', chrome() +
    `<div class="ideation-shell">
      <header class="ideation-narrative" data-motion="side"><div class="motion-entry">
        <p class="scene-kicker">CONCEPT DEVELOPMENT · 02</p>
        <h2 data-local-editor-id="ideation-heading">PROPOSAL<br>PROCESS</h2>
        <p class="ideation-lede">A proposal was not selected from appearance alone. Each round translated a design intention into something the team could compare, prototype, and defend.</p>
        <div class="process-steps" role="tablist" aria-label="Proposal development stages">
          ${proposalSteps.map((step, index) => `<button type="button" role="tab" aria-selected="${index === 0}" data-process-tab="${step.id}"><span>${step.number}</span><b>${step.label}</b></button>`).join('')}
        </div>
      </div></header>
      <div class="proposal-copy" aria-live="polite">
        ${proposalSteps.map((step, index) => `<section data-process-copy="${step.id}" ${index ? 'hidden' : ''}><span>${step.number} / 04</span><h3>${step.title}</h3><p>${step.body}</p></section>`).join('')}
      </div>
      <div class="proposal-canvas" data-motion="settle"><div class="motion-entry">
        <section class="proposal-panel proposal-language" data-process-panel="language">
          <img src="${asset('020_Im6.png')}" alt="Two Zephyrus architecture directions and hinge mockups" loading="lazy" decoding="async">
          <div class="proposal-tags"><span>A · CONTINUITY</span><span>B · REVERSED HINGE</span></div>
        </section>
        <section class="proposal-panel proposal-principles" data-process-panel="principles" hidden>
          <img src="${asset('019_Im5.png')}" alt="Three design principles used to evaluate the hinge architecture" loading="lazy" decoding="async">
          <ol>
            <li><b>A</b><span><strong>Opening clarity</strong>Make the transformation readable</span></li>
            <li><b>B</b><span><strong>Hidden structure</strong>Keep mechanics out of the silhouette</span></li>
            <li><b>C</b><span><strong>Visual stability</strong>Resolve an integrated resting form</span></li>
          </ol>
        </section>
        <section class="proposal-panel proposal-mechanism" data-process-panel="mechanism" hidden>
          <img src="${asset('018_Im4.png')}" alt="Hinge mechanism and package thickness proposal matrix" loading="lazy" decoding="async">
          <div class="mechanism-scale"><span>5.0 mm</span><span>5.8 mm</span><span>6.8 mm</span><span>8.0 mm</span></div>
        </section>
        <section class="proposal-panel proposal-convergence" data-process-panel="convergence" hidden>
          <figure class="profile-main"><img src="${asset('017_Im3.png')}" alt="Shortlisted side profile studies" loading="lazy" decoding="async"></figure>
          <div class="profile-variants">
            <img src="${asset('014_Im0.png')}" alt="Side profile proposal A" loading="lazy" decoding="async">
            <img src="${asset('015_Im1.png')}" alt="Side profile proposal B" loading="lazy" decoding="async">
            <img src="${asset('016_Im2.png')}" alt="Side profile proposal C" loading="lazy" decoding="async">
          </div>
        </section>
      </div></div>
      <p class="proposal-note">INTENT → ARCHITECTURE → MECHANISM → PROPOSAL</p>
    </div>`);

  setupTabs(ideation, '[data-process-tab]', '[data-process-panel]', 'processTab', 'processPanel');
  setupTabs(ideation, '[data-process-tab]', '[data-process-copy]', 'processTab', 'processCopy');

  const refinementSteps = [
    {id:'precision', number:'01', label:'PRECISION', title:'Machine the gesture into the shell', body:'CNC finishing sharpens the side wall and removes visual noise, so the silhouette reads as one controlled volume.', file:'021_Im0.png', alt:'CNC machining the Zephyrus Duo side wall', meta:'CNC / POLISHED EDGE'},
    {id:'profile', number:'02', label:'SIDE PROFILE', title:'One edge. Signature above, integration below.', body:'Read the two staggered side views together: the upper edge carries the restrained light signature; the lower edge integrates ports, cooling, and structure into the same silhouette.', file:'023_Im1.png', alt:'Upper side view with light signature', meta:'PAIRED SIDE VIEWS / ONE CONTINUOUS EDGE', paired:true}
  ];

  const refinement = mount('refinement', 'refinement', chrome() +
    `<div class="refinement-shell">
      <header class="refinement-narrative" data-motion="side"><div class="motion-entry">
        <p class="scene-kicker">REFINEMENT · FINAL DESIGN</p>
        <h2 data-local-editor-id="refinement-heading">CONTROL<br>THE EDGE</h2>
        <p class="refinement-lede">Precision shapes the shell. Two staggered side views reveal how the light signature and performance hardware resolve into one continuous edge.</p>
      </div></header>
      <figure class="refinement-product" data-motion="settle" data-local-editor-id="refinement-product" data-editor-label="Zephyrus Duo refined final design">
        <div class="motion-entry"><img src="${asset('022_Im0.png')}" alt="Zephyrus Duo refined final design" loading="lazy" decoding="async"></div>
        <figcaption><span>FINAL FORM</span><strong>One silhouette. Three resolved details.</strong></figcaption>
      </figure>
      <aside class="refinement-focus" data-motion="wipe"><div class="motion-entry">
        <nav class="refinement-tabs" role="tablist" aria-label="Refinement detail focus">
          ${refinementSteps.map((step, index) => `<button type="button" role="tab" aria-selected="${index === 0}" data-refinement-tab="${step.id}"><span>${step.number}</span>${step.label}</button>`).join('')}
        </nav>
        <div class="refinement-visual">
          ${refinementSteps.map((step, index) => `<figure data-refinement-panel="${step.id}" ${index ? 'hidden' : ''}>${step.paired ? `<div class="paired-side-views"><img class="side-view side-view--upper" src="${asset(step.file)}" alt="${step.alt}" loading="lazy" decoding="async"><img class="side-view side-view--lower" src="${asset('024_Im2.png')}" alt="Lower side view with integrated ports, cooling and structure" loading="lazy" decoding="async"><span class="side-view-label side-view-label--upper">LIGHT SIGNATURE</span><span class="side-view-label side-view-label--lower">I/O + STRUCTURE</span></div>` : `<img src="${asset(step.file)}" alt="${step.alt}" loading="lazy" decoding="async">`}<figcaption>${step.meta}</figcaption></figure>`).join('')}
        </div>
        <div class="refinement-copy" aria-live="polite">
          ${refinementSteps.map((step, index) => `<section data-refinement-copy="${step.id}" ${index ? 'hidden' : ''}><span>${step.number} / 02</span><h3>${step.title}</h3><p>${step.body}</p></section>`).join('')}
        </div>
      </div></aside>
      <footer class="refinement-signals" aria-label="Refinement outcomes"><span>01 <b>FORM</b></span><span>02 <b>CRAFT</b></span><span>03 <b>PERFORMANCE</b></span></footer>
    </div>`);

  setupTabs(refinement, '[data-refinement-tab]', '[data-refinement-panel]', 'refinementTab', 'refinementPanel');
  setupTabs(refinement, '[data-refinement-tab]', '[data-refinement-copy]', 'refinementTab', 'refinementCopy');

  if (refinement) {
    const product = refinement.querySelector('.refinement-product');
    refinement.addEventListener('pointermove', event => {
      if (editing() || reducedMotion.matches) return;
      const bounds = refinement.getBoundingClientRect();
      product.style.setProperty('--refine-x', `${((event.clientX - bounds.left) / bounds.width - .5) * 12}px`);
      product.style.setProperty('--refine-y', `${((event.clientY - bounds.top) / bounds.height - .5) * 8}px`);
    });
    refinement.addEventListener('pointerleave', () => {
      product.style.setProperty('--refine-x', '0px');
      product.style.setProperty('--refine-y', '0px');
    });
  }

  const photos = [
    {id:'prototype-front',file:'031_Im4.png',label:'OPEN WORKSPACE',focus:'Screen relationship',phase:'open',box:[83.8,148.2,494.1,511.4],ratio:342/354},
    {id:'prototype-closed',file:'032_Im5.png',label:'CLOSED PACKAGE',focus:'Travel silhouette',phase:'package',box:[84.1,672.5,493.4,278.6],ratio:457/258},
    {id:'prototype-angle',file:'027_Im0.png',label:'OPEN ANGLE',focus:'Reach and sightline',phase:'open',box:[588.3,149.5,630.2,510.4],ratio:363/294,rotate:true},
    {id:'prototype-bottom',file:'029_Im2.png',label:'BASE PACKAGE',focus:'Cooling volume',phase:'package',box:[588.3,671.2,631.3,279.4],ratio:479/212},
    {id:'prototype-back',file:'028_Im1.png',label:'REAR SUPPORT',focus:'Load path',phase:'hinge',box:[1230.8,148.4,651.9,303],ratio:484/225},
    {id:'prototype-hinge',file:'030_Im3.png',label:'HINGE DETAIL',focus:'Tolerance check',phase:'hinge',box:[1230,461.1,654.9,488.3],ratio:484/363}
  ];
  const prototype = mount('prototype', 'prototype', chrome() +
    `<div class="prototype-shell">
      <header class="prototype-heading" data-motion="side"><div class="motion-entry">
        <p class="scene-kicker">PHYSICAL VALIDATION · 01:01</p>
        <h2 data-local-editor-id="prototype-heading">BUILT TO<br>BE JUDGED</h2>
        <p>Full-scale models turned proportion, reach, and hinge behavior into decisions the team could feel—not just see.</p>
      </div></header>
      <nav class="prototype-filters" aria-label="Filter prototype evidence">
        <button type="button" data-prototype-filter="all" aria-pressed="true">ALL</button>
        <button type="button" data-prototype-filter="open" aria-pressed="false">OPEN WORKSPACE</button>
        <button type="button" data-prototype-filter="package" aria-pressed="false">PACKAGE</button>
        <button type="button" data-prototype-filter="hinge" aria-pressed="false">HINGE</button>
      </nav>
      <div class="prototype-gallery" data-filter="all">${photos.map((photo, i) => `<figure class="prototype-photo" data-phase="${photo.phase}" data-local-editor-id="${photo.id}" data-editor-label="${photo.label}" data-motion="${i % 2 ? 'settle' : 'wipe'}" style="${position(...photo.box)};--photo-ratio:${photo.ratio};--delay:${.16 + i * .11}s">
        <div class="motion-entry"><button type="button" data-prototype="${photo.id}" aria-label="Open ${photo.label}" aria-haspopup="dialog"><img src="${asset(photo.file)}" alt="${photo.label}" loading="lazy" decoding="async" ${photo.rotate ? 'class="photo-turn90"' : ''}><span class="photo-index">${String(i + 1).padStart(2,'0')}</span><span class="photo-caption"><b>${photo.label}</b><small>${photo.focus}</small></span></button></div>
      </figure>`).join('')}</div>
      <p class="prototype-note" data-local-editor-id="prototype-note">SELECT A LENS · HOVER TO ISOLATE · OPEN FOR FULL-SCALE EVIDENCE</p>
    </div>`);

  const rotationObserver = new ResizeObserver(entries => entries.forEach(({target}) => {
    target.style.setProperty('--turn-width', `${target.clientHeight}px`);
    target.style.setProperty('--turn-height', `${target.clientWidth}px`);
  }));
  document.querySelectorAll('.photo-turn90').forEach(img => rotationObserver.observe(img.parentElement));

  if (prototype) {
    const gallery = prototype.querySelector('.prototype-gallery');
    prototype.querySelectorAll('[data-prototype-filter]').forEach(button => button.addEventListener('click', () => {
      if (editing()) return;
      gallery.dataset.filter = button.dataset.prototypeFilter;
      prototype.querySelectorAll('[data-prototype-filter]').forEach(node => node.setAttribute('aria-pressed', String(node === button)));
    }));
    const viewer = document.createElement('dialog');
    viewer.className = 'prototype-viewer';
    viewer.setAttribute('aria-label', '實體模型照片檢視');
    viewer.innerHTML = `<button type="button" class="prototype-viewer-close" aria-label="關閉照片檢視">CLOSE</button><div class="prototype-viewer-content"><div class="prototype-viewer-topline"><span>FULL-SCALE VALIDATION</span><b class="prototype-viewer-count">01 / 06</b></div><div class="prototype-viewer-image"><img alt=""></div><div class="prototype-viewer-footer"><p class="prototype-viewer-caption"><strong></strong><span></span></p><div class="prototype-viewer-nav"><button type="button" data-viewer-step="-1">PREVIOUS</button><button type="button" data-viewer-step="1">NEXT</button></div></div></div>`;
    document.body.append(viewer);
    const frame = viewer.querySelector('.prototype-viewer-image');
    const largeImage = frame.querySelector('img');
    const closeButton = viewer.querySelector('.prototype-viewer-close');
    const count = viewer.querySelector('.prototype-viewer-count');
    const captionTitle = viewer.querySelector('.prototype-viewer-caption strong');
    const captionFocus = viewer.querySelector('.prototype-viewer-caption span');
    let opener;
    let currentIndex = 0;
    const close = () => viewer.close();
    const showPhoto = index => {
      currentIndex = (index + photos.length) % photos.length;
      const photo = photos[currentIndex];
      largeImage.src = asset(photo.file);
      largeImage.alt = photo.label;
      largeImage.classList.toggle('photo-turn90', !!photo.rotate);
      frame.style.setProperty('--photo-ratio', photo.ratio);
      count.textContent = `${String(currentIndex + 1).padStart(2,'0')} / ${String(photos.length).padStart(2,'0')}`;
      captionTitle.textContent = photo.label;
      captionFocus.textContent = photo.focus;
    };
    closeButton.addEventListener('click', close);
    viewer.addEventListener('click', event => { if (event.target === viewer) close(); });
    viewer.querySelectorAll('[data-viewer-step]').forEach(button => button.addEventListener('click', () => showPhoto(currentIndex + Number(button.dataset.viewerStep))));
    viewer.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') showPhoto(currentIndex - 1);
      if (event.key === 'ArrowRight') showPhoto(currentIndex + 1);
    });
    viewer.addEventListener('close', () => {
      document.body.classList.remove('prototype-viewing');
      opener?.focus({preventScroll:true});
    });
    rotationObserver.observe(frame);
    prototype.querySelectorAll('[data-prototype]').forEach(button => button.addEventListener('click', () => {
      if (editing()) return;
      opener = button;
      showPhoto(photos.findIndex(item => item.id === button.dataset.prototype));
      viewer.showModal();
      document.body.classList.add('prototype-viewing');
      closeButton.focus();
    }));
  }

  const final = mount('final', 'final', chrome() + `<h2 class="final-heading">FINAL DESIGN</h2>
    <figure class="final-closed" data-motion="side"><div class="motion-entry"><img src="duo-pdf-assets/10-final-design.png" alt="Zephyrus Duo closed top, side, and rear views" loading="lazy" decoding="async"></div></figure>
    <figure class="final-open" data-motion="settle"><div class="motion-entry"><picture><source media="(max-width:760px)" srcset="${asset('final-open-hq-mobile.webp')}"><img src="${asset('final-open-hq.webp')}" width="2560" height="1920" alt="High-resolution frontal render of the open ROG Zephyrus Duo G16" loading="lazy" decoding="async"></picture></div></figure>`);

  const audienceDetails = {
    cool:['Quiet confidence, not visual noise.', 'A controlled dark palette and precise surfaces let capability—not decoration—define the product.'],
    brave:['A signature that earns its place.', 'Use one recognizable lighting gesture to express identity while keeping the rest of the silhouette disciplined.'],
    energetic:['A creative workstation without stereotypes.', 'Make the dual-screen experience approachable through clarity, useful interaction, and a contemporary visual language.']
  };
  document.querySelectorAll('[data-audience]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-audience]').forEach(node => node.setAttribute('aria-pressed', String(node === button)));
    const [heading, body] = audienceDetails[button.dataset.audience];
    const detail = document.getElementById('audience-insight');
    detail.innerHTML = `<span>DESIGN TRANSLATION</span><h3>${heading}</h3><p>${body}</p>`;
    detail.classList.remove('panel-enter');
    requestAnimationFrame(() => detail.classList.add('panel-enter'));
  }));

  // Keep unchanged art in place, but give its arrival an appropriate, different cadence.
  const otherScenes = [];
  [['second-panel','settle'],['hinge','side'],['features','rise']].forEach(([id, motion]) => {
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

  const stages = [concept, ideation, refinement, prototype, final, ...otherScenes].filter(Boolean);
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
