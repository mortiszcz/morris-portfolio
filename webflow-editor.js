(() => {
  const pageKey = `morris-site-editor-v2:${location.pathname}`;
  const componentKey = 'morris-site-editor-components';
  const targets = [];
  const selectors = {
    text: 'h1,h2,h3,h4,p,.brand,.site-brand,.site-nav a,.nav-links a,.contact,.contact-link,.label,.eyebrow,.section-title,.case-id,.case-meta dd,.hero-summary,.hero-intro',
    media: 'img,video,figure,.portrait,.motion-reel,.hero-image,.feature-stage,.media-slot,.work-card,.work-item,.project-card,.work-tile'
  };
  const nodeLabel = (node, fallback) => {
    const classLabel = typeof node.className === 'string' ? node.className : node.className?.baseVal;
    return String(node.textContent || node.alt || node.getAttribute?.('aria-label') || classLabel || node.tagName || fallback)
      .trim().replace(/\s+/g, ' ').slice(0, 34) || fallback;
  };
  Object.entries(selectors).forEach(([kind, selector]) => document.querySelectorAll(selector).forEach((node) => {
    if (node.closest('.web-editor') || node.matches('svg,source') || node.dataset.webEditorId) return;
    node.dataset.webEditorId = `node-${targets.length}`;
    node.dataset.webEditorKind = kind;
    node.dataset.webEditorLabel = nodeLabel(node, kind);
    targets.push(node);
  }));
  // Keep the legacy selectors above in the same order so saved v2 edits stay attached
  // to the correct layers. The canvas scan below only appends missed visible elements.
  const ignoredCanvasNode = (node) => node.closest('.web-editor,.landing-editor') || node.matches('script,style,template,noscript,svg *,source,option') || node.dataset.webEditorId;
  const addCanvasTarget = (node, kind) => {
    if (ignoredCanvasNode(node)) return;
    node.dataset.webEditorId = `node-${targets.length}`;
    node.dataset.webEditorKind = kind;
    node.dataset.webEditorLabel = nodeLabel(node, kind);
    targets.push(node);
  };
  // Text nested inside bespoke modules (labels, counters, captions and inline spans).
  document.body.querySelectorAll('*').forEach((node) => {
    if ([...node.childNodes].some((child) => child.nodeType === Node.TEXT_NODE && child.textContent.trim())) addCanvasTarget(node, 'text');
  });
  // Interactive modules and visual layers that do not expose a text node of their own.
  document.querySelectorAll('a,button,details,summary,canvas,li,[data-reveal],[data-editor-target],[class*="card" i],[class*="tile" i],[class*="panel" i],[class*="glow" i],[class*="shine" i],[class*="specular" i],[class*="pulse" i],[class*="flow" i],[class*="reel" i]').forEach((node) => {
    const classText = String(node.className || '').toLowerCase();
    const kind = node.matches('canvas') || /glow|shine|specular|pulse|flow/.test(classText) ? 'effect' : 'component';
    addCanvasTarget(node, kind);
  });
  // Structural layers and CSS-painted surfaces were previously absent from the
  // layer list. Register them after legacy targets so existing saved node IDs
  // remain stable across editor upgrades.
  document.querySelectorAll('main,section,article,header,footer,nav,aside,figure,dl,ul,ol,svg,[class*="wrap" i],[class*="grid" i],[class*="stage" i],[class*="surface" i],[class*="background" i],[class*="layout" i]').forEach((node) => addCanvasTarget(node, node.matches('svg') ? 'effect' : 'layout'));
  const styleIsPainted = (style) => {
    const background = style.backgroundColor.replace(/\s+/g, '').toLowerCase();
    const transparent = background === 'transparent' || background === 'rgba(0,0,0,0)' || background === 'rgb(0 0 0/0)';
    const bordered = ['Top','Right','Bottom','Left'].some((edge) => parseFloat(style[`border${edge}Width`]) > 0 && style[`border${edge}Style`] !== 'none');
    return style.backgroundImage !== 'none' || !transparent || bordered || style.boxShadow !== 'none';
  };
  document.body.querySelectorAll('div,span').forEach((node) => {
    if (ignoredCanvasNode(node)) return;
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    // A CSS pseudo-element is not a real DOM layer. Register its owner so the
    // visible decoration can still be selected, moved and styled as one unit.
    const ownsVisiblePseudo = ['::before','::after'].some((pseudo) => {
      const pseudoStyle = getComputedStyle(node, pseudo);
      return !['none', 'normal', ''].includes(pseudoStyle.content) && styleIsPainted(pseudoStyle);
    });
    const painted = styleIsPainted(style) || ownsVisiblePseudo;
    if (painted && rect.width >= 8 && rect.height >= 8 && style.display !== 'none' && style.visibility !== 'hidden') addCanvasTarget(node, 'surface');
  });
  if (!targets.length) return;
  const leafTargets = new Set(targets.filter((node) => !targets.some((other) => other !== node && node.contains(other))));
  const baseline = Object.fromEntries(targets.map((node) => [node.dataset.webEditorId, { style: node.getAttribute('style'), html: node.innerHTML, label: node.dataset.webEditorLabel }]));

  const readJson = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || '') || fallback; } catch (_) { return fallback; } };
  const state = readJson(pageKey, { styles: {}, text: {}, nodes: [], layers: {} });
  state.nodes ||= [];
  state.layers ||= {};
  const components = readJson(componentKey, {});
  const persist = () => { try { localStorage.setItem(pageKey, JSON.stringify(state)); } catch (_) {} };
  // Earlier editor builds allowed the portrait's inner bitmap to receive frame
  // dimensions and transforms. Those saved values can reappear after load and
  // crop the head even when the outer portrait frame is correctly positioned.
  // Keep frame editing on .portrait, but clear only the unsafe inner-image crop.
  const portraitMedia = document.querySelector('.portrait > img');
  if (portraitMedia?.dataset.webEditorId && state.styles[portraitMedia.dataset.webEditorId]) {
    const savedPortraitStyles = state.styles[portraitMedia.dataset.webEditorId];
    const unsafePortraitProperties = ['position', 'inset', 'top', 'right', 'bottom', 'left', 'width', 'height', 'max-width', 'max-height', 'margin', 'padding', 'object-fit', 'object-position', 'transform', 'translate'];
    let portraitStateChanged = false;
    unsafePortraitProperties.forEach((property) => {
      if (property in savedPortraitStyles) {
        delete savedPortraitStyles[property];
        portraitStateChanged = true;
      }
    });
    if (!Object.keys(savedPortraitStyles).length) delete state.styles[portraitMedia.dataset.webEditorId];
    if (portraitStateChanged) persist();
  }
  const persistComponents = () => { try { localStorage.setItem(componentKey, JSON.stringify(components)); } catch (_) {} };
  const applyStyle = (node, property, value, store = true) => {
    node.style.setProperty(property, value);
    if (store) { (state.styles[node.dataset.webEditorId] ||= {})[property] = value; persist(); }
  };
  const addSavedNode = (definition) => {
    const existing = document.querySelector(`[data-web-editor-id="${definition.id}"]`);
    if (existing) return existing;
    const node = document.createElement(definition.tag || 'div');
    node.className = definition.className || 'web-editor-added';
    node.dataset.webEditorId = definition.id;
    node.dataset.webEditorKind = definition.kind || 'component';
    node.dataset.webEditorLabel = definition.label || 'Canvas module';
    node.dataset.webEditorAdded = 'true';
    node.innerHTML = definition.html || '';
    (document.querySelector('main') || document.body).append(node);
    targets.push(node); leafTargets.add(node);
    baseline[definition.id] = { style: node.getAttribute('style'), html: node.innerHTML, label: node.dataset.webEditorLabel };
    return node;
  };
  const syncSavedNodes = () => {
    const ids = new Set(state.nodes.map((node) => node.id));
    document.querySelectorAll('[data-web-editor-added="true"]').forEach((node) => { if (!ids.has(node.dataset.webEditorId)) node.remove(); });
    state.nodes.forEach(addSavedNode);
  };
  syncSavedNodes();
  const renderState = () => {
    syncSavedNodes();
    targets.forEach((node) => {
      const source = baseline[node.dataset.webEditorId];
      if (source.style === null) node.removeAttribute('style'); else node.setAttribute('style', source.style);
      if (leafTargets.has(node)) node.innerHTML = source.html;
      node.dataset.webEditorLabel = source.label || node.dataset.webEditorLabel;
      node.dataset.webEditorLocked = 'false';
      node.classList.remove('web-editor-hover-lift', 'web-editor-hover-tint');
    });
    Object.entries(state.styles).forEach(([id, styles]) => {
      const node = document.querySelector(`[data-web-editor-id="${id}"]`);
      if (!node) return;
      Object.entries(styles).forEach(([property, value]) => node.style.setProperty(property, value));
      if (styles['--web-editor-hover'] && styles['--web-editor-hover'] !== 'none') node.classList.add(`web-editor-hover-${styles['--web-editor-hover']}`);
    });
    Object.entries(state.text).forEach(([id, content]) => { const node = document.querySelector(`[data-web-editor-id="${id}"]`); if (node) node.innerHTML = content; });
    Object.entries(state.layers).forEach(([id, metadata]) => {
      const node = document.querySelector(`[data-web-editor-id="${id}"]`);
      if (!node) return;
      if (metadata.name) node.dataset.webEditorLabel = metadata.name;
      node.dataset.webEditorLocked = String(Boolean(metadata.locked));
    });
  };
  renderState();
  const historyKey = `${pageKey}:history-v1`;
  const savedHistory = readJson(historyKey, { undo: [], redo: [] });
  const history = Array.isArray(savedHistory.undo) ? savedHistory.undo.slice(-80) : [];
  const redo = Array.isArray(savedHistory.redo) ? savedHistory.redo.slice(-80) : [];
  const persistHistory = () => {
    try { localStorage.setItem(historyKey, JSON.stringify({ undo: history.slice(-80), redo: redo.slice(-80) })); } catch (_) {}
  };
  let activeChange = null;
  const snapshot = () => JSON.stringify({ styles: state.styles, text: state.text, nodes: state.nodes, layers: state.layers });
  const beginChange = (name) => {
    if (activeChange === name) return;
    const current = snapshot();
    if (history.at(-1) !== current) history.push(current);
    if (history.length > 80) history.splice(0, history.length - 80);
    redo.length = 0;
    activeChange = name;
    persistHistory();
  };
  const endChange = () => { activeChange = null; };
  const restore = (serialized) => { const next = JSON.parse(serialized); state.styles = next.styles || {}; state.text = next.text || {}; state.nodes = next.nodes || []; state.layers = next.layers || {}; renderState(); persist(); };
  const undoChange = () => {
    if (!history.length) return false;
    const current = snapshot();
    if (redo.at(-1) !== current) redo.push(current);
    if (redo.length > 80) redo.splice(0, redo.length - 80);
    restore(history.pop());
    activeChange = null;
    persistHistory();
    return true;
  };
  const redoChange = () => {
    if (!redo.length) return false;
    const current = snapshot();
    if (history.at(-1) !== current) history.push(current);
    if (history.length > 80) history.splice(0, history.length - 80);
    restore(redo.pop());
    activeChange = null;
    persistHistory();
    return true;
  };

  const toggle = document.createElement('button');
  toggle.className = 'web-editor-toggle'; toggle.type = 'button'; toggle.textContent = 'Edit site'; toggle.setAttribute('aria-expanded', 'false');
  const panel = document.createElement('aside');
  panel.className = 'web-editor'; panel.setAttribute('aria-hidden', 'true');
  panel.innerHTML = `
    <div class="web-editor__head"><div><h2 class="web-editor__title">Site editor</h2><div class="web-editor__modes" role="group" aria-label="Editor mode"><button type="button" data-action="mode-edit" aria-pressed="true">Edit canvas</button><button type="button" data-action="mode-preview" aria-pressed="false">Preview site</button></div></div><div class="web-editor__window-actions"><button class="web-editor__collapse" type="button" data-action="collapse-panel" aria-label="Collapse editor" aria-expanded="true">−</button><button class="web-editor__close" type="button" aria-label="Close editor">×</button></div></div>
    <div class="web-editor__body">
      <p class="web-editor__hint">Edit canvas: select any text, media, surface or section. Drag to nudge; use the corner and edge handles to resize. CSS ::before / ::after artwork is selected through its parent layer. Links are disabled while editing.</p>
      <div class="web-editor__selection"><strong data-selected-name>Nothing selected</strong><span data-selected-kind>select</span></div>
      <section class="web-editor__group web-editor__layers-panel"><h3>Page layers</h3><div class="web-editor__page-label"><span>Current page</span><strong data-layer-page></strong></div><div class="web-editor__layer-legend"><span data-role="structure">Structure</span><span data-role="background">Background</span><span data-role="media">Media</span><span data-role="type">Type</span><span data-role="component">Component</span></div><div class="web-editor__layer-list" data-layers></div><div class="web-editor__actions web-editor__actions--wide web-editor__layer-actions"><button type="button" data-action="layer-rename">Rename</button><button type="button" data-action="layer-lock">Lock / unlock</button><button type="button" data-action="layer-toggle">Hide / show</button><button type="button" data-action="layer-forward">Bring forward</button><button type="button" data-action="layer-back">Send backward</button><button type="button" data-action="layer-top">Bring to front</button><button type="button" data-action="layer-bottom">Send to back</button></div><small class="web-editor__note">Built like a website document: Header, each content section and Footer form groups. Backgrounds and effects sit beneath media, type and interactive components. Every HTML page keeps its own layer state.</small></section>
      <section class="web-editor__group"><h3>Selection tools</h3><div class="web-editor__actions web-editor__actions--wide"><button type="button" data-action="match-type">Select matching type</button><button type="button" data-action="match-frame">Select matching frame</button><button type="button" data-action="select-parent">Select parent layer</button><button type="button" data-action="clear-selection">Clear selection</button></div><small class="web-editor__note">Hold Ctrl or ⌘ while clicking to add or remove layers. Use Select parent layer when a full-size child covers its outer section.</small></section>
      <section class="web-editor__group"><h3>Add to canvas</h3><div class="web-editor__palette" data-palette><button type="button" draggable="true" data-add="media"><span>Media frame</span><small>Drop image / video</small></button><button type="button" draggable="true" data-add="heading"><span>Heading</span><small>Display copy</small></button><button type="button" draggable="true" data-add="text"><span>Text block</span><small>Body copy</small></button><button type="button" draggable="true" data-add="divider"><span>Divider</span><small>Layout rule</small></button><button type="button" draggable="true" data-add="spacer"><span>Spacer</span><small>Breathing room</small></button><button type="button" draggable="true" data-add="glow"><span>Light effect</span><small>Editable colour</small></button></div><small class="web-editor__note">Drag a module from this panel onto the canvas. It is saved locally to this page and can be replaced or restyled later.</small></section>
      <section class="web-editor__group" data-text-controls><h3>Typography & text frame</h3>
        <div class="web-editor__control"><label>Typeface</label><select data-style="font-family"><option value="Inter,Arial,sans-serif">Inter</option><option value="Bahnschrift,Arial,sans-serif">Bahnschrift</option><option value="Arial,Helvetica,sans-serif">Arial</option><option value="Georgia,serif">Georgia</option></select></div>
        <div class="web-editor__control"><label>Text colour</label><input data-style="color" type="color"></div>
        <div class="web-editor__control"><label>Font size</label><input data-style="font-size" data-unit="px" type="number" min="8" max="260"></div>
        <div class="web-editor__control"><label>Weight</label><select data-style="font-weight"><option>300</option><option>400</option><option>500</option><option>600</option><option>700</option><option>800</option></select></div>
        <div class="web-editor__control"><label>Line height</label><input data-style="line-height" type="number" min=".6" max="3" step=".05"></div>
        <div class="web-editor__control"><label>Letter spacing</label><input data-style="letter-spacing" data-unit="em" type="number" min="-.1" max=".5" step=".005"></div>
        <div class="web-editor__control"><label>Horizontal align</label><select data-style="text-align"><option value="left">Left</option><option value="center">Centre</option><option value="right">Right</option><option value="justify">Justify</option></select></div>
        <div class="web-editor__control"><label>Text frame width</label><input data-style="width" data-unit="px" type="number" min="20" max="2400"></div>
        <div class="web-editor__control"><label>Line wrapping</label><select data-style="white-space"><option value="normal">Wrap</option><option value="nowrap">One line</option></select></div>
        <div class="web-editor__control"><label>Edit wording</label><input data-action="editable" type="checkbox"></div>
      </section>
      <section class="web-editor__group"><h3>Object frame</h3>
        <div class="web-editor__control"><label>Width</label><input data-style="width" data-unit="px" type="number" min="20" max="3000"></div><div class="web-editor__control"><label>Height</label><input data-style="height" data-unit="px" type="number" min="20" max="2000"></div><div class="web-editor__control"><label>Outer margin</label><input data-style="margin" data-unit="px" type="number" min="0" max="1200"></div><div class="web-editor__control"><label>Inner padding</label><input data-style="padding" data-unit="px" type="number" min="0" max="1200"></div><div class="web-editor__control"><label>Child gap</label><input data-style="gap" data-unit="px" type="number" min="0" max="800"></div><div class="web-editor__control"><label>Opacity</label><input data-style="opacity" type="range" min="0" max="1" step=".01"></div><div class="web-editor__control"><label data-radius-label>Corner radius — selected layer</label><input data-style="border-radius" data-unit="px" type="number" min="0" max="200"></div><small class="web-editor__note" data-radius-note>Applies only to the outlined layer.</small><div class="web-editor__control"><label>Background</label><input data-style="background-color" type="color"></div><div class="web-editor__control"><label>Hover style</label><select data-action="hover"><option value="none">None</option><option value="lift">Lift</option><option value="tint">Tint / contrast</option></select></div><div class="web-editor__control"><label>Placement</label><select data-action="placement"><option value="flow">Flow with layout</option><option value="free">Free canvas</option></select></div>
      </section>
      <section class="web-editor__group"><h3>Surface & gradient</h3>
        <div class="web-editor__control"><label>Gradient type</label><select data-action="gradient-type"><option value="solid">Solid</option><option value="linear">Linear</option><option value="radial">Radial</option></select></div><div class="web-editor__control"><label>Start colour</label><input data-action="gradient-start" type="color" value="#1b1d23"></div><div class="web-editor__control"><label>End colour</label><input data-action="gradient-end" type="color" value="#2d3557"></div><div class="web-editor__control"><label>Angle</label><input data-action="gradient-angle" type="number" value="135" min="0" max="360"></div><div class="web-editor__control"><label>Glass blur</label><input data-action="blur" type="range" min="0" max="40" value="0"></div>
      </section>
      <section class="web-editor__group web-editor__colour-library"><h3>Recent colours</h3><div class="web-editor__colour-target"><span>Apply to</span><strong data-recent-colour-target>Background</strong></div><div class="web-editor__swatches" data-recent-colours><small>Choose a colour above to start building your palette.</small></div><button type="button" class="web-editor__clear-colours" data-action="clear-recent-colours">Clear recent colours</button></section>
      <section class="web-editor__group"><h3>Transform</h3>
        <div class="web-editor__control"><label>X position</label><input data-transform="x" type="number" min="-2000" max="2000"></div><div class="web-editor__control"><label>Y position</label><input data-transform="y" type="number" min="-2000" max="2000"></div><div class="web-editor__control"><label>Scale</label><input data-transform="scale" type="number" min=".1" max="3" step=".01"></div><div class="web-editor__control"><label>Rotate</label><input data-transform="rotate" type="number" min="-180" max="180"></div>
      </section>
      <section class="web-editor__group"><h3>Alignment, grid & preview</h3><div class="web-editor__control"><label>Column grid</label><select data-action="grid"><option value="6">6 columns</option><option value="12">12 columns</option><option value="18">18 columns</option><option value="24" selected>24 columns</option></select></div><div class="web-editor__control"><label>Row density</label><select data-action="grid-rows"><option value="6">Balanced</option><option value="8">Fine</option><option value="12" selected>Dense</option><option value="16">Extra dense</option></select></div><div class="web-editor__control"><label>Snap placement</label><input data-action="snap" type="checkbox" checked></div><div class="web-editor__actions web-editor__actions--wide"><button type="button" data-action="snap-left">Snap left edge</button><button type="button" data-action="snap-top">Snap top edge</button><button type="button" data-action="align-left">Align left</button><button type="button" data-action="align-centre">Align centre</button><button type="button" data-action="align-right">Align right</button><button type="button" data-action="align-top">Align top</button><button type="button" data-action="align-middle">Align middle</button><button type="button" data-action="align-bottom">Align bottom</button><button type="button" data-action="align-reset">Clear align</button><button type="button" data-action="preview-tablet">Tablet</button><button type="button" data-action="preview-mobile">Mobile</button></div><small class="web-editor__note">Snap just the edge you choose; the opposite edge and all resize handles remain free for flexible text frames and media crops.</small></section>
      <section class="web-editor__group"><h3>Reusable components</h3><div class="web-editor__actions web-editor__actions--wide"><button type="button" data-action="save-component">Save selected style</button><button type="button" data-action="clear-components">Clear library</button></div><div class="web-editor__component-list" data-components></div></section>
      <section class="web-editor__group"><h3>Media quick preview</h3><div class="web-editor__actions web-editor__actions--wide"><button type="button" data-action="replace-media">Choose media</button><button type="button" data-action="restore-media">Restore</button></div><small class="web-editor__note">Local preview only—use it to test a crop before adding final source files.</small><input data-action="media-file" type="file" accept="image/*,video/*" hidden></section>
      <div class="web-editor__actions"><button type="button" data-action="undo">Undo</button><button type="button" data-action="redo">Redo</button><button type="button" data-action="delete">Delete selected</button><button type="button" data-action="reset-node">Reset selected</button><button type="button" data-action="reset-page">Reset this page</button><button type="button" data-action="export">Export JSON</button><button type="button" data-action="import">Import JSON</button></div><input data-action="settings-file" type="file" accept="application/json" hidden>
    </div>`;
  const frame = document.createElement('div');
  frame.className = 'web-editor-frame';
  frame.innerHTML = ['nw','n','ne','e','se','s','sw','w'].map((edge) => `<button type="button" class="web-editor-handle" data-resize="${edge}" aria-label="Resize ${edge}"></button>`).join('');
  const snapGuides = document.createElement('div');
  snapGuides.className = 'web-editor-snap-guides';
  snapGuides.innerHTML = '<i data-snap-axis="x"></i><i data-snap-axis="y"></i>';
  document.body.append(toggle, panel, snapGuides, frame);
  panel.querySelector('[data-layer-page]').textContent = decodeURIComponent(location.pathname.split('/').pop() || document.title || 'Current page');

  const editorWindowKey = 'morris-site-editor-window-v1';
  const editorWindowState = readJson(editorWindowKey, { left: null, top: null, width: null, height: null, collapsed: false });
  const persistEditorWindow = () => { try { localStorage.setItem(editorWindowKey, JSON.stringify(editorWindowState)); } catch (_) {} };
  const clampEditorWindow = () => {
    if (!Number.isFinite(editorWindowState.left) || !Number.isFinite(editorWindowState.top)) return;
    const rect = panel.getBoundingClientRect();
    editorWindowState.left = Math.max(8, Math.min(editorWindowState.left, window.innerWidth - Math.min(rect.width, window.innerWidth - 16) - 8));
    editorWindowState.top = Math.max(8, Math.min(editorWindowState.top, window.innerHeight - Math.min(rect.height, window.innerHeight - 16) - 8));
    panel.style.left = `${editorWindowState.left}px`;
    panel.style.top = `${editorWindowState.top}px`;
    panel.style.right = 'auto';
  };
  if (Number.isFinite(editorWindowState.width)) panel.style.width = `${editorWindowState.width}px`;
  if (Number.isFinite(editorWindowState.height)) panel.style.height = `${editorWindowState.height}px`;
  panel.classList.toggle('is-collapsed', Boolean(editorWindowState.collapsed));
  const collapseControl = panel.querySelector('[data-action="collapse-panel"]');
  collapseControl.textContent = editorWindowState.collapsed ? '+' : '−';
  collapseControl.setAttribute('aria-expanded', String(!editorWindowState.collapsed));
  clampEditorWindow();

  let selected = null, drag = null, resize = null, editorMode = 'preview';
  const selectedNodes = new Set();
  const selection = () => selectedNodes.size ? [...selectedNodes].filter((node) => node.isConnected) : selected ? [selected] : [];
  const isLayerLocked = (node) => Boolean(node && state.layers[node.dataset.webEditorId]?.locked);
  const applyToSelection = (callback) => selection().filter((node) => !isLayerLocked(node)).forEach(callback);
  let gridColumns = Number(localStorage.getItem('morris-editor-grid-v3-columns') || 24);
  let gridRows = Number(localStorage.getItem('morris-editor-grid-v3-rows') || 12);
  let snapEnabled = localStorage.getItem('morris-editor-grid-v3-snap') !== 'false';
  const selectedName = panel.querySelector('[data-selected-name]');
  const selectedKind = panel.querySelector('[data-selected-kind]');
  const recentColoursKey = 'morris-site-editor-recent-colours-v1';
  let recentColours = readJson(recentColoursKey, []);
  if (!Array.isArray(recentColours)) recentColours = [];
  recentColours = recentColours.filter((colour) => /^#[0-9a-f]{6}$/i.test(colour)).slice(0, 16);
  let activeColourInput = panel.querySelector('[data-style="background-color"]');
  const colourTargetName = (input) => input?.closest('.web-editor__control')?.querySelector('label')?.textContent?.trim() || 'Background';
  const setActiveColourInput = (input) => {
    if (!input?.matches('input[type="color"]')) return;
    activeColourInput = input;
    panel.querySelector('[data-recent-colour-target]').textContent = colourTargetName(input);
    panel.querySelectorAll('input[type="color"]').forEach((item) => item.classList.toggle('is-colour-target', item === input));
    panel.querySelectorAll('[data-colour-swatch]').forEach((item) => item.classList.toggle('is-current', item.dataset.colourSwatch.toLowerCase() === input.value.toLowerCase()));
  };
  const persistRecentColours = () => { try { localStorage.setItem(recentColoursKey, JSON.stringify(recentColours.slice(0, 16))); } catch (_) {} };
  const renderRecentColours = () => {
    const library = panel.querySelector('[data-recent-colours]');
    library.innerHTML = recentColours.length ? recentColours.map((colour) => `<button type="button" data-colour-swatch="${colour}" title="${colour.toUpperCase()}" aria-label="Apply ${colour.toUpperCase()}" style="--swatch-colour:${colour}"></button>`).join('') : '<small>Choose a colour above to start building your palette.</small>';
    if (activeColourInput) setActiveColourInput(activeColourInput);
  };
  const rememberColour = (colour) => {
    const normalized = String(colour).toLowerCase();
    if (!/^#[0-9a-f]{6}$/.test(normalized)) return;
    recentColours = [normalized, ...recentColours.filter((item) => item.toLowerCase() !== normalized)].slice(0, 16);
    persistRecentColours(); renderRecentColours();
  };
  renderRecentColours();
  const radiusLabel = panel.querySelector('[data-radius-label]');
  const radiusNote = panel.querySelector('[data-radius-note]');
  const computed = (node, property) => getComputedStyle(node).getPropertyValue(property).trim();
  const toHex = (value) => { const parts = value.match(/\d+/g); return parts?.length >= 3 ? `#${parts.slice(0, 3).map((part) => Number(part).toString(16).padStart(2, '0')).join('')}` : '#ffffff'; };
  const transform = (node) => ({ x: Number(node.dataset.editorX || 0), y: Number(node.dataset.editorY || 0), scale: Number(node.dataset.editorScale || 1), rotate: Number(node.dataset.editorRotate || 0) });
  const applyTransform = (node) => { const value = transform(node); applyStyle(node, 'transform', `translate3d(${value.x}px, ${value.y}px, 0) rotate(${value.rotate}deg) scale(${value.scale})`); };
  const gridUnit = (horizontal = true) => horizontal ? window.innerWidth / gridColumns : window.innerHeight / gridRows;
  const nearestGridLine = (value, horizontal = true) => Math.round(value / gridUnit(horizontal)) * gridUnit(horizontal);
  const snap = (value, horizontal = true) => snapEnabled ? nearestGridLine(value, horizontal) : value;
  const snapThreshold = (horizontal = true) => Math.max(6, Math.min(14, gridUnit(horizontal) * .14));
  const snapBoundsAxis = (start, size, delta, horizontal = true) => {
    if (!snapEnabled) return { delta, guide: null };
    const anchors = [start + delta, start + size / 2 + delta, start + size + delta];
    let result = { delta, guide: null, distance: Infinity };
    anchors.forEach((anchor) => {
      const guide = nearestGridLine(anchor, horizontal);
      const distance = Math.abs(guide - anchor);
      if (distance < result.distance) result = { delta: delta + guide - anchor, guide, distance };
    });
    return result.distance <= snapThreshold(horizontal) ? result : { delta, guide: null };
  };
  const snapResizeEdge = (coordinate, horizontal = true) => {
    if (!snapEnabled) return { coordinate, guide: null };
    const guide = nearestGridLine(coordinate, horizontal);
    return Math.abs(guide - coordinate) <= snapThreshold(horizontal) ? { coordinate: guide, guide } : { coordinate, guide: null };
  };
  const showSnapGuides = (x = null, y = null) => {
    const xGuide = snapGuides.querySelector('[data-snap-axis="x"]');
    const yGuide = snapGuides.querySelector('[data-snap-axis="y"]');
    xGuide.hidden = !Number.isFinite(x); yGuide.hidden = !Number.isFinite(y);
    if (Number.isFinite(x)) xGuide.style.left = `${x}px`;
    if (Number.isFinite(y)) yGuide.style.top = `${y}px`;
    snapGuides.classList.toggle('is-visible', Number.isFinite(x) || Number.isFinite(y));
  };
  const syncGrid = () => { document.body.style.setProperty('--web-editor-columns', gridColumns); document.body.style.setProperty('--web-editor-row-density', gridRows); document.body.dataset.webEditorGrid = String(gridColumns); panel.querySelector('[data-action="grid"]').value = String(gridColumns); panel.querySelector('[data-action="grid-rows"]').value = String(gridRows); panel.querySelector('[data-action="snap"]').checked = snapEnabled; };
  const updateFrame = () => { if (!selected || !document.body.classList.contains('web-editor-active')) { frame.classList.remove('is-visible'); return; } const nodes = selection(); const rects = nodes.map((node) => node.getBoundingClientRect()); const left = Math.min(...rects.map((rect) => rect.left)), top = Math.min(...rects.map((rect) => rect.top)), right = Math.max(...rects.map((rect) => rect.right)), bottom = Math.max(...rects.map((rect) => rect.bottom)); frame.dataset.kind = nodes.length > 1 ? 'multi' : selected.dataset.webEditorKind; frame.dataset.locked = String(nodes.some(isLayerLocked)); frame.style.left = `${left}px`; frame.style.top = `${top}px`; frame.style.width = `${right - left}px`; frame.style.height = `${bottom - top}px`; frame.classList.add('is-visible'); };
  const renderComponents = () => { const list = panel.querySelector('[data-components]'); const names = Object.keys(components); list.innerHTML = names.length ? names.map((component) => `<button type="button" data-component="${component}">${component}</button>`).join('') : '<small class="web-editor__note">No saved components yet.</small>'; };
  const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[character]));
  const layerRole = (node) => {
    const kind = node.dataset.webEditorKind;
    if (kind === 'layout' || node.matches('header,main,section,article,footer,nav,aside')) return 'structure';
    if (kind === 'effect' || kind === 'surface') return 'background';
    if (kind === 'media') return 'media';
    if (kind === 'text') return 'type';
    return 'component';
  };
  const layerHosts = [...document.querySelectorAll('header,main > section,main > article,footer')];
  const layerGroup = (node) => {
    const host = layerHosts.find((candidate) => candidate === node || candidate.contains(node));
    if (!host) return { key: node.closest('main') ? 'page-canvas' : 'global-canvas', label: node.closest('main') ? 'Page canvas' : 'Global canvas' };
    const index = layerHosts.indexOf(host);
    if (host.matches('header')) return { key: `group-${index}`, label: 'Header / navigation' };
    if (host.matches('footer')) return { key: `group-${index}`, label: 'Footer' };
    const heading = host.querySelector('h1,h2,.section-title,.case-id,.eyebrow,.label');
    const text = (host.id || heading?.textContent || host.getAttribute('aria-label') || host.className || `Section ${index + 1}`).trim().replace(/\s+/g, ' ').slice(0, 36);
    return { key: `group-${index}`, label: text || `Section ${index + 1}` };
  };
  const renderLayers = () => {
    const list = panel.querySelector('[data-layers]');
    const closedGroups = new Set([...list.querySelectorAll('[data-layer-group]:not([open])')].map((group) => group.dataset.layerGroup));
    const groups = new Map();
    targets.filter((node) => node.isConnected).forEach((node) => {
      const group = layerGroup(node);
      if (!groups.has(group.key)) groups.set(group.key, { ...group, nodes: [] });
      groups.get(group.key).nodes.push(node);
    });
    list.innerHTML = [...groups.values()].map((group, groupIndex) => {
      const rows = group.nodes.slice().reverse().map((node) => {
        const id = node.dataset.webEditorId;
        const active = selectedNodes.has(node) ? 'true' : 'false';
        const hidden = computed(node, 'display') === 'none';
        const locked = isLayerLocked(node);
        const role = layerRole(node);
        return `<div class="web-editor__layer-row${hidden ? ' is-hidden' : ''}${locked ? ' is-locked' : ''}" data-layer-row="${id}"><button type="button" class="web-editor__layer-select" data-layer="${id}" aria-current="${active}" title="Select ${escapeHtml(node.dataset.webEditorLabel)}"><span class="web-editor__layer-role" data-role="${role}">${role.slice(0, 2)}</span><span class="web-editor__layer-name">${escapeHtml(node.dataset.webEditorLabel)}</span></button><button type="button" class="web-editor__layer-icon" data-action="layer-row-visibility" data-layer-id="${id}" title="${hidden ? 'Show layer' : 'Hide layer'}" aria-label="${hidden ? 'Show layer' : 'Hide layer'}">${hidden ? 'H' : 'V'}</button><button type="button" class="web-editor__layer-icon" data-action="layer-row-lock" data-layer-id="${id}" title="${locked ? 'Unlock layer' : 'Lock layer'}" aria-label="${locked ? 'Unlock layer' : 'Lock layer'}">${locked ? 'L' : 'U'}</button></div>`;
      }).join('');
      return `<details class="web-editor__layer-group" data-layer-group="${group.key}"${closedGroups.has(group.key) ? '' : ' open'}><summary><span>${String(groupIndex + 1).padStart(2, '0')}</span><strong>${escapeHtml(group.label)}</strong><em>${group.nodes.length}</em></summary><div class="web-editor__layer-group-body">${rows}</div></details>`;
    }).join('');
  };
  const select = (node, options = {}) => {
    document.querySelectorAll('.web-editor-selected').forEach((element) => element.classList.remove('web-editor-selected'));
    if (!node) selectedNodes.clear();
    else if (options.append) { if (selectedNodes.has(node)) selectedNodes.delete(node); else selectedNodes.add(node); }
    else { selectedNodes.clear(); selectedNodes.add(node); }
    selected = selectedNodes.has(node) ? node : selection()[0] || null;
    if (!selected) { selectedName.textContent = 'Nothing selected'; selectedKind.textContent = 'select'; renderLayers(); updateFrame(); return; }
    selection().forEach((item) => item.classList.add('web-editor-selected'));
    const count = selection().length;
    selectedName.textContent = count > 1 ? `${count} layers selected` : selected.dataset.webEditorLabel;
    selectedKind.textContent = count > 1 ? 'multi-edit' : isLayerLocked(selected) ? `${selected.dataset.webEditorKind} · locked` : selected.dataset.webEditorKind;
    const isText = selected.dataset.webEditorKind === 'text';
    radiusLabel.textContent = isText ? 'Text background radius' : 'Corner radius — selected layer';
    radiusNote.textContent = isText ? 'Text radius is visible only after a background is set. Select an image or its figure frame to round its crop.' : 'Applies only to the outlined layer. Select the outer media frame to round the crop.';
    panel.querySelector('[data-text-controls]').hidden = selection().some((item) => item.dataset.webEditorKind !== 'text');
    panel.querySelectorAll('[data-style]').forEach((input) => {
      const property = input.dataset.style;
      if (input.type === 'color') input.value = toHex(computed(selected, property));
      else if (property === 'font-family') { const font = computed(selected, property); input.value = [...input.options].find((option) => font.includes(option.value.split(',')[0]))?.value || input.options[0].value; }
      else { const numeric = parseFloat(computed(selected, property)); input.value = Number.isFinite(numeric) ? numeric : ''; }
    });
    const defaultColourInput = panel.querySelector(selected.dataset.webEditorKind === 'text' ? '[data-style="color"]' : '[data-style="background-color"]');
    setActiveColourInput(defaultColourInput);
    const value = transform(selected); panel.querySelectorAll('[data-transform]').forEach((input) => { input.value = value[input.dataset.transform]; }); renderLayers(); updateFrame();
  };
  const setMode = (mode) => {
    editorMode = mode;
    const editing = mode === 'edit' && panel.classList.contains('is-open');
    document.body.classList.toggle('web-editor-active', editing);
    panel.classList.toggle('is-preview', mode === 'preview');
    panel.querySelector('[data-action="mode-edit"]').setAttribute('aria-pressed', String(mode === 'edit'));
    panel.querySelector('[data-action="mode-preview"]').setAttribute('aria-pressed', String(mode === 'preview'));
    if (!editing) select(null);
    syncGrid(); updateFrame();
  };
  const setOpen = (force) => { const open = force ?? !panel.classList.contains('is-open'); panel.classList.toggle('is-open', open); panel.setAttribute('aria-hidden', String(!open)); toggle.setAttribute('aria-expanded', String(open)); if (open) setMode('edit'); else { editorMode = 'preview'; document.body.classList.remove('web-editor-active'); panel.classList.remove('is-preview'); select(null); syncGrid(); updateFrame(); } };
  const unlockedEditableFrom = (element) => {
    let candidate = element?.closest?.('[data-web-editor-id]') || null;
    while (candidate && isLayerLocked(candidate)) candidate = candidate.parentElement?.closest?.('[data-web-editor-id]') || null;
    return candidate;
  };
  const editableTargetFromEvent = (event) => {
    const direct = event.target instanceof Element ? unlockedEditableFrom(event.target) : null;
    if (direct) return direct;
    return document.elementsFromPoint(event.clientX, event.clientY).map(unlockedEditableFrom).find(Boolean) || null;
  };
  const applyGradient = () => {
    if (!selected) return;
    const type = panel.querySelector('[data-action="gradient-type"]').value;
    const first = panel.querySelector('[data-action="gradient-start"]').value;
    const second = panel.querySelector('[data-action="gradient-end"]').value;
    const angle = panel.querySelector('[data-action="gradient-angle"]').value;
    const value = type === 'linear' ? `linear-gradient(${angle}deg, ${first}, ${second})` : type === 'radial' ? `radial-gradient(circle at 50% 50%, ${first}, ${second})` : first;
    applyToSelection((node) => applyStyle(node, 'background', value));
  };
  const snapEdgeToGrid = (node, horizontal = true) => {
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const value = transform(node);
    const current = horizontal ? rect.left : rect.top;
    const target = snap(current, horizontal);
    node.dataset[horizontal ? 'editorX' : 'editorY'] = String(Math.round((horizontal ? value.x : value.y) + target - current));
    applyTransform(node);
  };
  const layerOrder = (node, direction) => {
    if (!node) return;
    const raw = Number.parseInt(computed(node, 'z-index'), 10);
    const current = Number.isFinite(raw) ? raw : 0;
    if (computed(node, 'position') === 'static') applyStyle(node, 'position', 'relative');
    const next = direction === 'top' ? 100 : direction === 'bottom' ? -1 : current + direction;
    applyStyle(node, 'z-index', String(next)); renderLayers();
  };
  const toggleLayerLock = (node) => {
    if (!node) return;
    const id = node.dataset.webEditorId;
    const metadata = (state.layers[id] ||= {});
    metadata.locked = !metadata.locked;
    if (!metadata.locked && !metadata.name) delete state.layers[id];
    persist(); renderState(); renderLayers(); updateFrame();
  };
  const renameLayer = (node) => {
    if (!node) return;
    const id = node.dataset.webEditorId;
    const original = baseline[id]?.label || node.dataset.webEditorLabel;
    const value = prompt('Layer name', node.dataset.webEditorLabel);
    if (value === null) return;
    const name = value.trim();
    const metadata = (state.layers[id] ||= {});
    if (name && name !== original) metadata.name = name;
    else delete metadata.name;
    if (!metadata.name && !metadata.locked) delete state.layers[id];
    persist(); renderState(); select(node);
  };
  const toggleLayerVisibility = (node) => {
    if (!node) return;
    const wasSelected = selectedNodes.has(node);
    const styles = state.styles[node.dataset.webEditorId] || {};
    if (computed(node, 'display') === 'none') delete styles.display;
    else styles.display = 'none';
    state.styles[node.dataset.webEditorId] = styles; persist(); renderState(); renderLayers();
    if (computed(node, 'display') === 'none') { if (wasSelected) select(null); }
    else select(node);
  };
  const selectNodes = (nodes) => {
    const available = nodes.filter((node) => node?.isConnected);
    if (!available.length) return select(null);
    select(available[0]); available.slice(1).forEach((node) => select(node, { append: true }));
  };
  const sameProperties = (source, candidate, properties) => properties.every((property) => computed(source, property) === computed(candidate, property));
  const selectMatching = (mode) => {
    if (!selected) return;
    const properties = mode === 'type'
      ? ['font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'text-transform', 'color']
      : ['width', 'height', 'opacity', 'border-radius', 'object-fit'];
    const matches = targets.filter((node) => node.isConnected && computed(node, 'display') !== 'none' && (mode !== 'type' || node.dataset.webEditorKind === 'text') && sameProperties(selected, node, properties));
    selectNodes(matches);
  };
  const newModule = (type, clientX = window.innerWidth / 2, clientY = window.innerHeight / 2) => {
    const id = `added-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const modules = {
      media: { tag: 'figure', kind: 'media', label: 'Media placeholder', className: 'web-editor-added web-editor-added--media', html: '<span>DROP IMAGE OR VIDEO</span>' },
      heading: { tag: 'h2', kind: 'text', label: 'New heading', className: 'web-editor-added web-editor-added--heading', html: 'NEW HEADING' },
      text: { tag: 'p', kind: 'text', label: 'New text block', className: 'web-editor-added web-editor-added--text', html: 'Write a short description for this part of the project.' },
      divider: { tag: 'div', kind: 'component', label: 'Divider', className: 'web-editor-added web-editor-added--divider', html: '' },
      spacer: { tag: 'div', kind: 'component', label: 'Spacer', className: 'web-editor-added web-editor-added--spacer', html: '' },
      glow: { tag: 'div', kind: 'effect', label: 'Light effect', className: 'web-editor-added web-editor-added--glow', html: '' }
    };
    const definition = { id, ...(modules[type] || modules.media) };
    state.nodes.push(definition);
    const node = addSavedNode(definition);
    const anchor = node.offsetParent || document.documentElement;
    const anchorRect = anchor.getBoundingClientRect();
    const styles = {
      position: 'absolute', left: `${Math.round(clientX - anchorRect.left)}px`, top: `${Math.round(clientY - anchorRect.top)}px`, 'z-index': '30',
      width: type === 'media' ? '420px' : type === 'divider' ? '360px' : type === 'spacer' ? '240px' : type === 'glow' ? '260px' : '420px',
      height: type === 'media' ? '236px' : type === 'divider' ? '1px' : type === 'spacer' ? '80px' : type === 'glow' ? '260px' : 'auto'
    };
    Object.entries(styles).forEach(([property, value]) => applyStyle(node, property, value));
    persist(); select(node); renderLayers(); return node;
  };
  renderComponents(); renderLayers(); syncGrid();

  toggle.addEventListener('click', () => setOpen());
  panel.querySelector('.web-editor__close').addEventListener('click', () => setOpen(false));
  const setPanelCollapsed = (collapsed) => {
    editorWindowState.collapsed = collapsed;
    panel.classList.toggle('is-collapsed', collapsed);
    collapseControl.textContent = collapsed ? '+' : '−';
    collapseControl.setAttribute('aria-expanded', String(!collapsed));
    persistEditorWindow();
    requestAnimationFrame(() => { clampEditorWindow(); updateFrame(); });
  };
  collapseControl.addEventListener('click', (event) => { event.stopPropagation(); setPanelCollapsed(!panel.classList.contains('is-collapsed')); });
  let editorWindowDrag = null;
  panel.querySelector('.web-editor__head').addEventListener('pointerdown', (event) => {
    if (event.target.closest('button,input,select,a,.web-editor__modes')) return;
    const rect = panel.getBoundingClientRect();
    panel.style.left = `${rect.left}px`;
    panel.style.top = `${rect.top}px`;
    panel.style.right = 'auto';
    editorWindowDrag = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, left: rect.left, top: rect.top };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  });
  document.addEventListener('pointermove', (event) => {
    if (!editorWindowDrag || event.pointerId !== editorWindowDrag.pointerId) return;
    const rect = panel.getBoundingClientRect();
    editorWindowState.left = Math.max(8, Math.min(editorWindowDrag.left + event.clientX - editorWindowDrag.startX, window.innerWidth - rect.width - 8));
    editorWindowState.top = Math.max(8, Math.min(editorWindowDrag.top + event.clientY - editorWindowDrag.startY, window.innerHeight - rect.height - 8));
    panel.style.left = `${editorWindowState.left}px`;
    panel.style.top = `${editorWindowState.top}px`;
  });
  document.addEventListener('pointerup', (event) => {
    if (!editorWindowDrag || event.pointerId !== editorWindowDrag.pointerId) return;
    editorWindowDrag = null;
    persistEditorWindow();
  });
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      if (!panel.classList.contains('is-open') || panel.classList.contains('is-collapsed')) return;
      const rect = panel.getBoundingClientRect();
      editorWindowState.width = Math.round(rect.width);
      editorWindowState.height = Math.round(rect.height);
      persistEditorWindow();
    }).observe(panel);
  }
  window.addEventListener('resize', () => { clampEditorWindow(); persistEditorWindow(); });
  let canvasInsertType = '';
  panel.addEventListener('dragstart', (event) => { const module = event.target.closest('[data-add]'); if (!module) return; canvasInsertType = module.dataset.add; event.dataTransfer.effectAllowed = 'copy'; event.dataTransfer.setData('text/plain', canvasInsertType); });
  panel.addEventListener('dragend', () => { canvasInsertType = ''; });
  document.addEventListener('dragover', (event) => { if (canvasInsertType && document.body.classList.contains('web-editor-active') && !event.target.closest('.web-editor')) event.preventDefault(); });
  document.addEventListener('drop', (event) => { if (!canvasInsertType || !document.body.classList.contains('web-editor-active') || event.target.closest('.web-editor')) return; event.preventDefault(); const type = canvasInsertType; canvasInsertType = ''; beginChange('add-module'); newModule(type, event.clientX, event.clientY); endChange(); });
  document.addEventListener('keydown', (event) => {
    if (event.altKey && event.key.toLowerCase() === 'e') { event.preventDefault(); setOpen(); }
    if (event.key === 'Escape') setOpen(false);
    if (!document.body.classList.contains('web-editor-active')) return;
    if ((event.key === 'Delete' || event.key === 'Backspace') && selected && !event.target.closest('input,select,textarea,[contenteditable="true"]')) { event.preventDefault(); beginChange('delete'); applyToSelection((node) => applyStyle(node, 'display', 'none')); select(null); endChange(); return; }
    const modifier = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();
    if (modifier && key === 'z' && !event.shiftKey) { event.preventDefault(); if (undoChange() && selected) select(selected); }
    if (modifier && (key === 'y' || (key === 'z' && event.shiftKey))) { event.preventDefault(); if (redoChange() && selected) select(selected); }
  });
  document.addEventListener('pointerdown', (event) => {
    if (!document.body.classList.contains('web-editor-active') || event.target.closest('.web-editor, .web-editor-frame, .web-editor-toggle')) return;
    const node = editableTargetFromEvent(event); if (!node) return;
    const append = event.ctrlKey || event.metaKey;
    select(node, { append }); if (node.isContentEditable || append || isLayerLocked(node)) return;
    event.preventDefault(); beginChange('drag');
    const nodes = selection().filter((item) => !isLayerLocked(item));
    if (!nodes.length) return;
    const rects = nodes.map((item) => item.getBoundingClientRect());
    const left = Math.min(...rects.map((rect) => rect.left));
    const top = Math.min(...rects.map((rect) => rect.top));
    const right = Math.max(...rects.map((rect) => rect.right));
    const bottom = Math.max(...rects.map((rect) => rect.bottom));
    drag = { node, nodes, startX: event.clientX, startY: event.clientY, bounds: { left, top, width: right - left, height: bottom - top }, positions: new Map(nodes.map((item) => [item, transform(item)])) };
    nodes.forEach((item) => item.classList.add('web-editor-dragging'));
  });
  document.addEventListener('dblclick', (event) => {
    if (!document.body.classList.contains('web-editor-active') || event.target.closest('.web-editor, .web-editor-frame, .web-editor-toggle')) return;
    const node = editableTargetFromEvent(event);
    if (!node || isLayerLocked(node) || node.dataset.webEditorKind !== 'text') return;
    event.preventDefault(); event.stopImmediatePropagation(); select(node); node.contentEditable = 'true'; node.spellcheck = true; node.focus();
  }, true);
  document.addEventListener('pointermove', (event) => {
    if (resize) {
      const dx = event.clientX - resize.startX, dy = event.clientY - resize.startY;
      let adjustedX = dx, adjustedY = dy, guideX = null, guideY = null;
      if (resize.edge.includes('e')) { const result = snapResizeEdge(resize.rect.right + dx, true); adjustedX = result.coordinate - resize.rect.right; guideX = result.guide; }
      if (resize.edge.includes('w')) { const result = snapResizeEdge(resize.rect.left + dx, true); adjustedX = result.coordinate - resize.rect.left; guideX = result.guide; }
      let width = resize.width, height = resize.height, x = resize.x, y = resize.y;
      const isText = resize.node.dataset.webEditorKind === 'text';
      if (!isText && resize.edge.includes('s')) { const result = snapResizeEdge(resize.rect.bottom + dy, false); adjustedY = result.coordinate - resize.rect.bottom; guideY = result.guide; }
      if (!isText && resize.edge.includes('n')) { const result = snapResizeEdge(resize.rect.top + dy, false); adjustedY = result.coordinate - resize.rect.top; guideY = result.guide; }
      if (resize.edge.includes('e')) width = resize.width + adjustedX;
      if (resize.edge.includes('w')) { width = resize.width - adjustedX; x = resize.x + adjustedX; }
      if (!isText && resize.edge.includes('s')) height = resize.height + adjustedY;
      if (!isText && resize.edge.includes('n')) { height = resize.height - adjustedY; y = resize.y + adjustedY; }
      width = Math.max(24, width); height = Math.max(24, height);
      applyStyle(resize.node, 'width', `${Math.round(width)}px`);
      if (isText) { applyStyle(resize.node, 'max-width', 'none'); applyStyle(resize.node, 'height', 'auto'); }
      else applyStyle(resize.node, 'height', `${Math.round(height)}px`);
      resize.node.dataset.editorX = String(Math.round(x)); resize.node.dataset.editorY = String(Math.round(y));
      applyTransform(resize.node); showSnapGuides(guideX, guideY); updateFrame(); return;
    }
    if (!drag) return;
    const rawX = event.clientX - drag.startX, rawY = event.clientY - drag.startY;
    const snappedX = snapBoundsAxis(drag.bounds.left, drag.bounds.width, rawX, true);
    const snappedY = snapBoundsAxis(drag.bounds.top, drag.bounds.height, rawY, false);
    const shiftX = Math.round(snappedX.delta), shiftY = Math.round(snappedY.delta);
    drag.nodes.forEach((node) => { const value = drag.positions.get(node); node.dataset.editorX = String(Math.round(value.x + shiftX)); node.dataset.editorY = String(Math.round(value.y + shiftY)); applyTransform(node); });
    showSnapGuides(snappedX.guide, snappedY.guide);
    renderLayers(); updateFrame();
  });
  document.addEventListener('pointerup', () => { if (drag) drag.nodes.forEach((node) => node.classList.remove('web-editor-dragging')); drag = null; resize = null; showSnapGuides(); endChange(); updateFrame(); });
  frame.addEventListener('pointerdown', (event) => {
    const handle = event.target.closest('[data-resize]'); if (!handle || !selected || isLayerLocked(selected) || selection().length > 1) return;
    event.preventDefault(); event.stopPropagation(); beginChange('resize');
    const rect = selected.getBoundingClientRect(), value = transform(selected);
    resize = { node: selected, edge: handle.dataset.resize, startX: event.clientX, startY: event.clientY, width: rect.width, height: rect.height, rect, x: value.x, y: value.y };
  });
  panel.addEventListener('input', (event) => {
    if (!selected) return;
    const input = event.target; beginChange('control');
    if (input.dataset.style) {
      const value = input.type === 'color' ? input.value : `${input.value}${input.dataset.unit || ''}`;
      applyToSelection((node) => { applyStyle(node, input.dataset.style, value); if (input.dataset.style === 'width' && node.dataset.webEditorKind === 'text') { applyStyle(node, 'max-width', 'none'); applyStyle(node, 'height', 'auto'); } });
    }
    if (input.dataset.transform && selection().length === 1 && !isLayerLocked(selected)) { selected.dataset[`editor${input.dataset.transform[0].toUpperCase()}${input.dataset.transform.slice(1)}`] = input.value; applyTransform(selected); }
    if (input.dataset.action?.startsWith('gradient')) applyGradient();
    if (input.dataset.action === 'blur') applyToSelection((node) => applyStyle(node, 'backdrop-filter', `blur(${input.value}px)`));
  });
  panel.addEventListener('pointerdown', (event) => { const input = event.target.closest('input[type="color"]'); if (input) setActiveColourInput(input); });
  panel.addEventListener('change', (event) => {
    const input = event.target;
    if (input.matches('input[type="color"]')) { setActiveColourInput(input); rememberColour(input.value); }
    if (input.dataset.action === 'grid') { gridColumns = Number(input.value); localStorage.setItem('morris-editor-grid-v3-columns', String(gridColumns)); syncGrid(); return; }
    if (input.dataset.action === 'grid-rows') { gridRows = Number(input.value); localStorage.setItem('morris-editor-grid-v3-rows', String(gridRows)); syncGrid(); return; }
    if (input.dataset.action === 'snap') { snapEnabled = input.checked; localStorage.setItem('morris-editor-grid-v3-snap', String(snapEnabled)); syncGrid(); return; }
    if (!selected || isLayerLocked(selected)) return;
    if (input.dataset.action?.startsWith('gradient')) applyGradient();
    if (input.dataset.action === 'editable') { selected.contentEditable = String(input.checked); selected.spellcheck = true; if (input.checked) selected.focus(); }
    if (input.dataset.action === 'placement') { applyToSelection((node) => { if (input.value === 'free') { applyStyle(node, 'position', 'absolute'); applyStyle(node, 'z-index', '20'); } else { applyStyle(node, 'position', ''); applyStyle(node, 'z-index', ''); } }); }
    if (input.dataset.action === 'hover') { applyToSelection((node) => { node.classList.remove('web-editor-hover-lift', 'web-editor-hover-tint'); if (input.value !== 'none') node.classList.add(`web-editor-hover-${input.value}`); applyStyle(node, '--web-editor-hover', input.value); }); }
    endChange();
  });
  document.addEventListener('beforeinput', (event) => { const node = event.target.closest?.('[data-web-editor-id][contenteditable="true"]'); if (node) beginChange('text'); });
  document.addEventListener('input', (event) => { const node = event.target.closest?.('[data-web-editor-id][contenteditable="true"]'); if (node) { state.text[node.dataset.webEditorId] = node.innerHTML; persist(); } });
  document.addEventListener('focusout', (event) => { if (event.target.closest?.('[data-web-editor-id][contenteditable="true"]')) endChange(); });
  document.addEventListener('click', (event) => {
    if (!document.body.classList.contains('web-editor-active') || event.target.closest('.web-editor, .web-editor-frame, .web-editor-toggle')) return;
    event.preventDefault(); event.stopImmediatePropagation();
  }, true);
  window.addEventListener('scroll', updateFrame, { passive: true });
  window.addEventListener('resize', () => { syncGrid(); updateFrame(); });
  panel.addEventListener('click', (event) => {
    const colourSwatch = event.target.closest('[data-colour-swatch]');
    if (colourSwatch) {
      if (!selected || !activeColourInput) return;
      activeColourInput.value = colourSwatch.dataset.colourSwatch;
      activeColourInput.dispatchEvent(new Event('input', { bubbles: true }));
      activeColourInput.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }
    const control = event.target.closest('button,[data-action],[data-component],[data-layer]');
    if (!control) return;
    const action = control.dataset.action, component = control.dataset.component, layer = control.dataset.layer, layerId = control.dataset.layerId, add = control.dataset.add;
    if (action === 'clear-recent-colours') { recentColours = []; persistRecentColours(); renderRecentColours(); return; }
    if (action === 'layer-row-visibility' && layerId) { const node = document.querySelector(`[data-web-editor-id="${layerId}"]`); if (node) { beginChange('layer-visibility'); toggleLayerVisibility(node); endChange(); } return; }
    if (action === 'layer-row-lock' && layerId) { const node = document.querySelector(`[data-web-editor-id="${layerId}"]`); if (node) { beginChange('layer-lock'); toggleLayerLock(node); endChange(); } return; }
    if (layer) { const node = document.querySelector(`[data-web-editor-id="${layer}"]`); if (node) select(node); return; }
    if (add) { beginChange('add-module'); newModule(add); endChange(); return; }
    if (component && selected) { applyToSelection((node) => Object.entries(components[component].styles).forEach(([property, value]) => applyStyle(node, property, value))); return; }
    if (!action) return;
    if (action === 'mode-edit') { setMode('edit'); return; }
    if (action === 'mode-preview') { setMode('preview'); return; }
    if (action === 'match-type') { selectMatching('type'); return; }
    if (action === 'match-frame') { selectMatching('frame'); return; }
    if (action === 'select-parent' && selected) { const parent = selected.parentElement?.closest('[data-web-editor-id]'); if (parent) select(parent); return; }
    if (action === 'clear-selection') { select(null); return; }
    if (!['undo', 'redo', 'export', 'import'].includes(action)) beginChange('action');
    if (action === 'undo') { if (undoChange() && selected) select(selected); return; }
    if (action === 'redo') { if (redoChange() && selected) select(selected); return; }
    if (action === 'delete' && selected) { applyToSelection((node) => applyStyle(node, 'display', 'none')); select(null); endChange(); return; }
    if (action === 'snap-left' && selected) { applyToSelection((node) => snapEdgeToGrid(node, true)); endChange(); return; }
    if (action === 'snap-top' && selected) { applyToSelection((node) => snapEdgeToGrid(node, false)); endChange(); return; }
    if (action === 'layer-forward' && selected) { applyToSelection((node) => layerOrder(node, 1)); endChange(); return; }
    if (action === 'layer-back' && selected) { applyToSelection((node) => layerOrder(node, -1)); endChange(); return; }
    if (action === 'layer-top' && selected) { applyToSelection((node) => layerOrder(node, 'top')); endChange(); return; }
    if (action === 'layer-bottom' && selected) { applyToSelection((node) => layerOrder(node, 'bottom')); endChange(); return; }
    if (action === 'layer-toggle' && selected) { selection().slice().forEach(toggleLayerVisibility); endChange(); return; }
    if (action === 'layer-lock' && selected) { selection().slice().forEach(toggleLayerLock); endChange(); return; }
    if (action === 'layer-rename' && selected) { renameLayer(selected); endChange(); return; }
    if (action === 'reset-node' && selected) { const ids = new Set(selection().map((node) => node.dataset.webEditorId)); state.nodes = state.nodes.filter((node) => !ids.has(node.id)); ids.forEach((id) => { delete state.styles[id]; delete state.text[id]; delete state.layers[id]; }); persist(); location.reload(); }
    if (action === 'reset-page') { localStorage.removeItem(pageKey); location.reload(); }
    if (action === 'export') { const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'morris-page-editor.json'; link.click(); URL.revokeObjectURL(link.href); }
    if (action === 'import') panel.querySelector('[data-action="settings-file"]').click();
    if (action === 'align-left' && selected) applyToSelection((node) => { applyStyle(node, 'text-align', 'left'); applyStyle(node, 'margin-inline', '0 auto 0 0'); });
    if (action === 'align-centre' && selected) applyToSelection((node) => { applyStyle(node, 'text-align', 'center'); applyStyle(node, 'margin-inline', 'auto'); });
    if (action === 'align-right' && selected) applyToSelection((node) => { applyStyle(node, 'text-align', 'right'); applyStyle(node, 'margin-inline', '0 0 0 auto'); });
    if (action === 'align-top' && selected) applyToSelection((node) => { applyStyle(node, 'align-self', 'start'); applyStyle(node, 'margin-block', '0 auto'); });
    if (action === 'align-middle' && selected) applyToSelection((node) => { applyStyle(node, 'align-self', 'center'); applyStyle(node, 'margin-block', 'auto'); });
    if (action === 'align-bottom' && selected) applyToSelection((node) => { applyStyle(node, 'align-self', 'end'); applyStyle(node, 'margin-block', 'auto 0'); });
    if (action === 'align-reset' && selected) applyToSelection((node) => { applyStyle(node, 'text-align', ''); applyStyle(node, 'margin-inline', ''); applyStyle(node, 'align-self', ''); applyStyle(node, 'margin-block', ''); });
    if (action === 'preview-tablet' || action === 'preview-mobile') document.body.classList.toggle(`web-editor-preview-${action.split('-')[1]}`);
    if (action === 'save-component' && selected) { const name = prompt('Component name'); if (name) { components[name] = { styles: { ...(state.styles[selected.dataset.webEditorId] || {}) } }; persistComponents(); renderComponents(); } }
    if (action === 'clear-components') { Object.keys(components).forEach((name) => delete components[name]); persistComponents(); renderComponents(); }
    if (action === 'replace-media' && selected) panel.querySelector('[data-action="media-file"]').click();
    if (action === 'restore-media' && selected) { const media = selected.matches('img,video') ? selected : selected.querySelector('img,video'); if (media?.dataset.editorOriginalSrc) { media.src = media.dataset.editorOriginalSrc; delete media.dataset.editorOriginalSrc; } }
    endChange();
  });
  panel.querySelector('[data-action="settings-file"]').addEventListener('change', async (event) => { const file = event.target.files[0]; if (!file) return; try { localStorage.setItem(pageKey, JSON.stringify(JSON.parse(await file.text()))); location.reload(); } catch (_) { alert('Please choose a valid Site Editor JSON file.'); } });
  panel.querySelector('[data-action="media-file"]').addEventListener('change', (event) => { if (!selected) return; const file = event.target.files[0]; let media = selected.matches('img,video') ? selected : selected.querySelector('img,video'); if (!media && selected.dataset.webEditorKind === 'media') { media = document.createElement('img'); media.alt = 'Portfolio media preview'; selected.prepend(media); } if (!file || !media) return alert('Select an image or video module first.'); media.dataset.editorOriginalSrc ??= media.currentSrc || media.src; media.hidden = false; media.src = URL.createObjectURL(file); if (media.tagName === 'VIDEO') media.load(); });
})();
