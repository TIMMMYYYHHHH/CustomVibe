/* ====== CustomVibe — Multi-Design Studio ====== */

/* ---------- TEMPLATE LIBRARY ---------- */
const TEMPLATES = [
  {
    name: 'Paw Life',
    bg: 'linear-gradient(135deg,#FFB3C6,#FFD0B3)',
    bgColor: '#FFB3C6',
    emoji: '🐾',
    label: 'PAW LIFE',
    textColor: '#C4456A',
  },
  {
    name: 'Ocean Vibes',
    bg: 'linear-gradient(135deg,#B3EDE9,#B5D5FF)',
    bgColor: '#B3EDE9',
    emoji: '🌊',
    label: 'OCEAN VIBES',
    textColor: '#2A9D8F',
  },
  {
    name: 'Dream Big',
    bg: 'linear-gradient(135deg,#D4AAFF,#FFB3C6)',
    bgColor: '#D4AAFF',
    emoji: '🦄',
    label: 'DREAM BIG',
    textColor: '#7C3AED',
  },
  {
    name: 'Golden Hour',
    bg: 'linear-gradient(135deg,#FFF0B3,#FFD0B3)',
    bgColor: '#FFF0B3',
    emoji: '☀️',
    label: 'GOLDEN HOUR',
    textColor: '#B45309',
  },
  {
    name: 'Music Life',
    bg: 'linear-gradient(135deg,#B5D5FF,#D4AAFF)',
    bgColor: '#B5D5FF',
    emoji: '🎵',
    label: 'MUSIC IS LIFE',
    textColor: '#1D4ED8',
  },
  {
    name: 'Pizza Gang',
    bg: 'linear-gradient(135deg,#FFD0B3,#FFF0B3)',
    bgColor: '#FFD0B3',
    emoji: '🍕',
    label: 'PIZZA GANG',
    textColor: '#C2410C',
  },
  {
    name: 'In Bloom',
    bg: 'linear-gradient(135deg,#B3EDE9,#FFF0B3)',
    bgColor: '#B3EDE9',
    emoji: '🌸',
    label: 'IN BLOOM',
    textColor: '#2A9D8F',
  },
  {
    name: 'Bold Name',
    bg: 'linear-gradient(135deg,#2D2B3D,#3D1F5E)',
    bgColor: '#2D2B3D',
    emoji: null,
    label: 'YOUR NAME',
    textColor: '#FFB3C6',
  },
];

function buildTemplateGrid() {
  const grid = document.getElementById('templateGrid');
  TEMPLATES.forEach(t => {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.title = t.name;
    card.innerHTML = `
      <div class="template-preview" style="background:${t.bg};">
        ${t.emoji ? `<span style="font-size:1.8rem">${t.emoji}</span>` : ''}
        <span>${t.label}</span>
      </div>
      <div class="template-name">${t.name}</div>
    `;
    card.addEventListener('click', () => applyTemplate(t));
    grid.appendChild(card);
  });
}

function applyTemplate(t) {
  if (canvas.getObjects().length > 0) {
    if (!confirm(`Replace current canvas with the "${t.name}" template?`)) return;
  }
  canvas.clear();
  canvas.setBackgroundColor(t.bgColor, () => {});

  const objects = [];

  if (t.emoji) {
    objects.push(new Promise(resolve => {
      const emoji = new fabric.Text(t.emoji, {
        left: CANVAS_SIZE / 2,
        top: CANVAS_SIZE * 0.35,
        originX: 'center',
        originY: 'center',
        fontSize: Math.round(CANVAS_SIZE * 0.22),
        selectable: true,
      });
      resolve(emoji);
    }));
  }

  objects.push(new Promise(resolve => {
    const text = new fabric.IText(t.label, {
      left: CANVAS_SIZE / 2,
      top: t.emoji ? CANVAS_SIZE * 0.72 : CANVAS_SIZE / 2,
      originX: 'center',
      originY: 'center',
      fontSize: Math.round(CANVAS_SIZE * 0.1),
      fontFamily: 'Nunito',
      fontWeight: '900',
      fill: t.textColor,
      textAlign: 'center',
      charSpacing: 80,
    });
    resolve(text);
  }));

  Promise.all(objects).then(objs => {
    objs.forEach(o => canvas.add(o));
    canvas.renderAll();
    refreshLayers();
    pushHistory();
    showSaveIndicator();
  });
}

/* ---------- SAVE INDICATOR ---------- */
function showSaveIndicator() {
  const el = document.getElementById('saveIndicator');
  if (!el) return;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 2000);
}

/* ---------- PERSISTENCE ---------- */
const STORAGE_KEY = 'cv_studio_state';

function persistState() {
  saveCurrentDesign();
  try {
    const state = { designs, activeId, nextId };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    showSaveIndicator();
  } catch(e) { /* quota exceeded — silent */ }
}

function restoreState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const state = JSON.parse(raw);
    if (!state.designs || !state.designs.length) return false;
    designs.length = 0;
    state.designs.forEach(d => designs.push(d));
    nextId = state.nextId || designs.length + 1;
    activeId = state.activeId || designs[0].id;
    designs.forEach(d => { if (!histories[d.id]) histories[d.id] = { stack: [], cursor: -1 }; });
    return true;
  } catch(e) { return false; }
}

let persistTimer = null;
function debouncedPersist() {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(persistState, 1500);
}

const CANVAS_SIZE = Math.min(window.innerWidth < 900 ? window.innerWidth - 40 : 500, 500);

/* ---------- CANVAS INIT ---------- */
const canvas = new fabric.Canvas('designCanvas', {
  width: CANVAS_SIZE,
  height: CANVAS_SIZE,
  backgroundColor: '#ffffff',
  preserveObjectStacking: true,
});

/* ---------- MULTI-DESIGN STATE ---------- */
let designs = [{ id: 1, name: 'Design 1', json: null, thumbnail: null }];
let activeId = 1;
let nextId = 2;

/* per-design undo/redo */
const histories = { 1: { stack: [], cursor: -1 } };

/* ---------- STICKERS ---------- */
const STICKERS = [
  '🌸','🌺','🌻','🌈','⭐','🔥','💫','✨','❤️','💜',
  '🐶','🐱','🦊','🦋','🐝','🌊','🍦','🎨','🎵','🎉',
  '💎','👑','🏆','🌙','🦄','🍕','🎸','🌴','🐾','🦜'
];

/* ---------- HELPERS ---------- */
function getActive() { return designs.find(d => d.id === activeId); }

function pushHistory() {
  const h = histories[activeId];
  h.stack = h.stack.slice(0, h.cursor + 1);
  const snap = canvas.toJSON(['data-role', 'flipX', 'flipY']);
  h.stack.push(JSON.stringify(snap));
  if (h.stack.length > 25) { h.stack.shift(); }
  h.cursor = h.stack.length - 1;
}

function snapshotThumbnail() {
  return canvas.toDataURL({ format: 'png', multiplier: 0.35 });
}

/* ---------- SAVE / RESTORE DESIGN ---------- */
function saveCurrentDesign() {
  const d = getActive();
  if (!d) return;
  d.json = JSON.stringify(canvas.toJSON(['data-role', 'flipX', 'flipY']));
  d.thumbnail = snapshotThumbnail();
}

function loadDesign(d) {
  if (d.json) {
    canvas.loadFromJSON(JSON.parse(d.json), () => {
      canvas.renderAll();
      refreshLayers();
    });
  } else {
    canvas.clear();
    canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
    refreshLayers();
  }
  resetImageSliders();
}

/* ---------- SWITCH DESIGN ---------- */
function switchDesign(id) {
  saveCurrentDesign();
  activeId = id;
  if (!histories[id]) histories[id] = { stack: [], cursor: -1 };
  const d = designs.find(d => d.id === id);
  loadDesign(d);
  renderTabs();
  pushHistory();
}

/* ---------- CREATE DESIGN ---------- */
function createDesign() {
  saveCurrentDesign();
  const id = nextId++;
  const name = `Design ${designs.length + 1}`;
  designs.push({ id, name, json: null, thumbnail: null });
  histories[id] = { stack: [], cursor: -1 };
  activeId = id;
  canvas.clear();
  canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
  refreshLayers();
  renderTabs();
  pushHistory();
}

/* ---------- DELETE DESIGN ---------- */
function deleteDesign(id) {
  if (designs.length === 1) { alert('You need at least one design.'); return; }
  if (!confirm(`Delete "${designs.find(d=>d.id===id)?.name}"?`)) return;
  designs = designs.filter(d => d.id !== id);
  delete histories[id];
  if (activeId === id) {
    activeId = designs[designs.length - 1].id;
    loadDesign(getActive());
  }
  renderTabs();
}

/* ---------- RENAME DESIGN ---------- */
function renameDesign(id) {
  const d = designs.find(d => d.id === id);
  const newName = prompt('Rename design:', d.name);
  if (newName && newName.trim()) {
    d.name = newName.trim();
    renderTabs();
  }
}

/* ---------- RENDER TABS ---------- */
function renderTabs() {
  const bar = document.getElementById('tabBar');
  bar.querySelectorAll('.design-tab').forEach(t => t.remove());

  const addBtn = document.getElementById('addTabBtn');
  designs.forEach(d => {
    const tab = document.createElement('button');
    tab.className = 'design-tab' + (d.id === activeId ? ' active' : '');
    tab.title = 'Double-click to rename';

    const thumb = d.thumbnail
      ? `<img src="${d.thumbnail}" alt="${d.name}" />`
      : '<span style="font-size:1.1rem;">🖼️</span>';

    const closeBtn = `<button class="tab-close" data-id="${d.id}" title="Delete design">✕</button>`;
    tab.innerHTML = `${thumb}<span class="tab-label">${d.name}</span>${closeBtn}`;

    tab.addEventListener('click', e => {
      if (e.target.classList.contains('tab-close')) return;
      if (d.id !== activeId) switchDesign(d.id);
    });
    tab.addEventListener('dblclick', e => {
      if (!e.target.classList.contains('tab-close')) renameDesign(d.id);
    });
    tab.querySelector('.tab-close').addEventListener('click', e => {
      e.stopPropagation();
      deleteDesign(d.id);
    });

    bar.insertBefore(tab, addBtn);
  });
}

/* ---------- LAYERS PANEL ---------- */
function refreshLayers() {
  const list = document.getElementById('layersList');
  const objs = canvas.getObjects();
  if (!objs.length) {
    list.innerHTML = '<p class="no-layers">No layers yet</p>';
    return;
  }
  list.innerHTML = '';
  [...objs].reverse().forEach((obj, i) => {
    const realIdx = objs.length - 1 - i;
    const isSelected = canvas.getActiveObject() === obj;
    const typeLabel = obj.type === 'i-text' ? `"${obj.text.slice(0, 14)}"` :
                      obj.type === 'text'   ? `"${obj.text.slice(0, 14)}"` :
                      obj.type === 'image'  ? 'Image' : obj.type;
    const typeIcon = obj.type === 'image' ? '🖼️' : obj.type === 'i-text' || obj.type === 'text' ? '✏️' : '🔷';

    const row = document.createElement('div');
    row.className = 'layer-row' + (isSelected ? ' selected' : '');
    row.innerHTML = `
      <span class="layer-type">${typeIcon}</span>
      <span class="layer-name">${typeLabel}</span>
      <button class="layer-action" data-action="up" data-idx="${realIdx}" title="Move up">↑</button>
      <button class="layer-action" data-action="down" data-idx="${realIdx}" title="Move down">↓</button>
      <button class="layer-action" data-action="del" data-idx="${realIdx}" title="Delete">🗑</button>
    `;

    row.addEventListener('click', e => {
      if (e.target.classList.contains('layer-action')) return;
      canvas.setActiveObject(obj);
      canvas.renderAll();
      refreshLayers();
    });

    row.querySelectorAll('.layer-action').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx);
        if (btn.dataset.action === 'up') {
          const o = canvas.item(idx);
          if (o) { o.bringForward(); refreshLayers(); pushHistory(); }
        } else if (btn.dataset.action === 'down') {
          const o = canvas.item(idx);
          if (o) { o.sendBackwards(); refreshLayers(); pushHistory(); }
        } else if (btn.dataset.action === 'del') {
          const o = canvas.item(idx);
          if (o) { canvas.remove(o); refreshLayers(); pushHistory(); canvas.renderAll(); }
        }
      });
    });

    list.appendChild(row);
  });
}

/* ---------- IMAGE UPLOAD ---------- */
const uploadInput = document.getElementById('imageUpload');
const uploadZone  = document.getElementById('uploadZone');

uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.style.background = '#F3EEFF'; });
uploadZone.addEventListener('dragleave', () => { uploadZone.style.background = ''; });
uploadZone.addEventListener('drop', e => {
  e.preventDefault(); uploadZone.style.background = '';
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) loadImageFile(file);
});

uploadInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) loadImageFile(file);
});

function loadImageFile(file) {
  const reader = new FileReader();
  reader.onload = evt => {
    fabric.Image.fromURL(evt.target.result, img => {
      const scale = Math.min(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height);
      img.set({
        left: CANVAS_SIZE / 2, top: CANVAS_SIZE / 2,
        originX: 'center', originY: 'center',
        scaleX: scale, scaleY: scale,
        'data-role': 'image',
      });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      syncImgSliders(img);
      refreshLayers();
      pushHistory();
    });
  };
  reader.readAsDataURL(file);
}

function syncImgSliders(img) {
  const s = Math.round(img.scaleX * 100);
  document.getElementById('imgScale').value = s;
  document.getElementById('scaleVal').textContent = s;
  document.getElementById('imgRotate').value = Math.round(img.angle || 0);
  document.getElementById('rotateVal').textContent = Math.round(img.angle || 0);
  document.getElementById('imgOpacity').value = Math.round((img.opacity || 1) * 100);
  document.getElementById('imgOpacityVal').textContent = Math.round((img.opacity || 1) * 100);
}

function resetImageSliders() {
  document.getElementById('imgScale').value = 100;
  document.getElementById('scaleVal').textContent = 100;
  document.getElementById('imgRotate').value = 0;
  document.getElementById('rotateVal').textContent = 0;
  document.getElementById('imgOpacity').value = 100;
  document.getElementById('imgOpacityVal').textContent = 100;
}

/* -- Image controls -- */
document.getElementById('imgScale').addEventListener('input', function () {
  document.getElementById('scaleVal').textContent = this.value;
  const obj = canvas.getActiveObject();
  if (!obj || obj.type !== 'image') return;
  const s = this.value / 100;
  obj.set({ scaleX: s, scaleY: s });
  canvas.renderAll();
});
document.getElementById('imgScale').addEventListener('change', pushHistory);

document.getElementById('imgRotate').addEventListener('input', function () {
  document.getElementById('rotateVal').textContent = this.value;
  const obj = canvas.getActiveObject();
  if (!obj || obj.type !== 'image') return;
  obj.set('angle', Number(this.value));
  canvas.renderAll();
});
document.getElementById('imgRotate').addEventListener('change', pushHistory);

document.getElementById('imgOpacity').addEventListener('input', function () {
  document.getElementById('imgOpacityVal').textContent = this.value;
  const obj = canvas.getActiveObject();
  if (!obj) return;
  obj.set('opacity', this.value / 100);
  canvas.renderAll();
});
document.getElementById('imgOpacity').addEventListener('change', pushHistory);

document.getElementById('fitImageBtn').addEventListener('click', () => {
  const obj = canvas.getActiveObject();
  if (!obj || obj.type !== 'image') return;
  const s = Math.min(CANVAS_SIZE / obj.width, CANVAS_SIZE / obj.height);
  obj.set({ scaleX: s, scaleY: s, left: CANVAS_SIZE/2, top: CANVAS_SIZE/2, originX:'center', originY:'center', angle:0 });
  canvas.renderAll(); syncImgSliders(obj); pushHistory();
});

document.getElementById('fillImageBtn').addEventListener('click', () => {
  const obj = canvas.getActiveObject();
  if (!obj || obj.type !== 'image') return;
  const s = Math.max(CANVAS_SIZE / obj.width, CANVAS_SIZE / obj.height);
  obj.set({ scaleX: s, scaleY: s, left: CANVAS_SIZE/2, top: CANVAS_SIZE/2, originX:'center', originY:'center' });
  canvas.renderAll(); syncImgSliders(obj); pushHistory();
});

document.getElementById('flipHBtn').addEventListener('click', () => {
  const obj = canvas.getActiveObject();
  if (!obj) return;
  obj.set('flipX', !obj.flipX);
  canvas.renderAll(); pushHistory();
});
document.getElementById('flipVBtn').addEventListener('click', () => {
  const obj = canvas.getActiveObject();
  if (!obj) return;
  obj.set('flipY', !obj.flipY);
  canvas.renderAll(); pushHistory();
});

/* ---------- TEXT CONTROLS ---------- */
let isBold = false, isItalic = false, isUnderline = false;
let textColor = '#2D2B3D';

const fontSizeSlider = document.getElementById('fontSizeSlider');
fontSizeSlider.addEventListener('input', function () {
  document.getElementById('fontSizeVal').textContent = this.value;
  const obj = canvas.getActiveObject();
  if (obj && (obj.type === 'i-text' || obj.type === 'text')) {
    obj.set('fontSize', Number(this.value));
    canvas.renderAll();
  }
});
fontSizeSlider.addEventListener('change', pushHistory);

document.getElementById('boldBtn').addEventListener('click', function () {
  isBold = !isBold;
  this.classList.toggle('active', isBold);
  const obj = canvas.getActiveObject();
  if (obj && (obj.type === 'i-text' || obj.type === 'text')) {
    obj.set('fontWeight', isBold ? 'bold' : 'normal');
    canvas.renderAll(); pushHistory();
  }
});
document.getElementById('italicBtn').addEventListener('click', function () {
  isItalic = !isItalic;
  this.classList.toggle('active', isItalic);
  const obj = canvas.getActiveObject();
  if (obj && (obj.type === 'i-text' || obj.type === 'text')) {
    obj.set('fontStyle', isItalic ? 'italic' : 'normal');
    canvas.renderAll(); pushHistory();
  }
});
document.getElementById('underlineBtn').addEventListener('click', function () {
  isUnderline = !isUnderline;
  this.classList.toggle('active', isUnderline);
  const obj = canvas.getActiveObject();
  if (obj && (obj.type === 'i-text' || obj.type === 'text')) {
    obj.set('underline', isUnderline);
    canvas.renderAll(); pushHistory();
  }
});

document.querySelectorAll('.align-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.align-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const obj = canvas.getActiveObject();
    if (obj && (obj.type === 'i-text' || obj.type === 'text')) {
      obj.set('textAlign', this.dataset.align);
      canvas.renderAll(); pushHistory();
    }
  });
});

document.getElementById('addTextBtn').addEventListener('click', () => {
  const val = document.getElementById('textInput').value.trim() || 'Your Text';
  const text = new fabric.IText(val, {
    left: CANVAS_SIZE / 2, top: CANVAS_SIZE / 2,
    originX: 'center', originY: 'center',
    fontSize: Number(fontSizeSlider.value),
    fontFamily: document.getElementById('fontSelect').value,
    fontWeight: isBold ? 'bold' : 'normal',
    fontStyle: isItalic ? 'italic' : 'normal',
    underline: isUnderline,
    fill: textColor,
    shadow: 'rgba(0,0,0,0.18) 1px 1px 3px',
  });
  canvas.add(text);
  canvas.setActiveObject(text);
  canvas.renderAll();
  refreshLayers();
  pushHistory();
});

/* -- text color swatches -- */
document.querySelectorAll('[data-color]').forEach(swatch => {
  swatch.addEventListener('click', () => {
    document.querySelectorAll('[data-color]').forEach(s => s.classList.remove('active'));
    swatch.classList.add('active');
    textColor = swatch.dataset.color;
    const obj = canvas.getActiveObject();
    if (obj && (obj.type === 'i-text' || obj.type === 'text')) {
      obj.set('fill', textColor);
      canvas.renderAll(); pushHistory();
    }
  });
});
document.getElementById('customTextColor').addEventListener('input', function () {
  textColor = this.value;
  const obj = canvas.getActiveObject();
  if (obj && (obj.type === 'i-text' || obj.type === 'text')) {
    obj.set('fill', textColor);
    canvas.renderAll();
  }
});
document.getElementById('customTextColor').addEventListener('change', pushHistory);

/* ---------- STICKERS ---------- */
const grid = document.getElementById('stickerGrid');
STICKERS.forEach(emoji => {
  const btn = document.createElement('button');
  btn.className = 'sticker-btn';
  btn.textContent = emoji;
  btn.addEventListener('click', () => {
    const t = new fabric.Text(emoji, {
      left: CANVAS_SIZE / 2, top: CANVAS_SIZE / 2,
      originX: 'center', originY: 'center',
      fontSize: 52, selectable: true,
    });
    canvas.add(t);
    canvas.setActiveObject(t);
    canvas.renderAll();
    refreshLayers();
    pushHistory();
  });
  grid.appendChild(btn);
});

/* ---------- BACKGROUND ---------- */
document.querySelectorAll('[data-bg]').forEach(swatch => {
  swatch.addEventListener('click', () => {
    canvas.setBackgroundColor(swatch.dataset.bg, canvas.renderAll.bind(canvas));
    pushHistory();
  });
});
document.getElementById('customBgColor').addEventListener('input', function () {
  canvas.setBackgroundColor(this.value, canvas.renderAll.bind(canvas));
});
document.getElementById('customBgColor').addEventListener('change', pushHistory);

/* ---------- UNDO / REDO ---------- */
document.getElementById('undoBtn').addEventListener('click', () => {
  const h = histories[activeId];
  if (!h || h.cursor <= 0) return;
  h.cursor--;
  canvas.loadFromJSON(JSON.parse(h.stack[h.cursor]), () => {
    canvas.renderAll();
    refreshLayers();
  });
});
document.getElementById('redoBtn').addEventListener('click', () => {
  const h = histories[activeId];
  if (!h || h.cursor >= h.stack.length - 1) return;
  h.cursor++;
  canvas.loadFromJSON(JSON.parse(h.stack[h.cursor]), () => {
    canvas.renderAll();
    refreshLayers();
  });
});

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault();
    document.getElementById('undoBtn').click();
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
    e.preventDefault();
    document.getElementById('redoBtn').click();
  }
  if (e.key === 'Delete' || e.key === 'Backspace') {
    const active = canvas.getActiveObject();
    if (active && active.type !== 'i-text') {
      canvas.remove(active); canvas.renderAll();
      refreshLayers(); pushHistory();
    }
  }
});

/* ---------- DELETE / CLEAR ---------- */
document.getElementById('deleteSelBtn').addEventListener('click', () => {
  const obj = canvas.getActiveObject();
  if (!obj) return;
  canvas.remove(obj);
  canvas.renderAll();
  refreshLayers();
  pushHistory();
});

document.getElementById('clearBtn').addEventListener('click', () => {
  if (!confirm('Clear this canvas?')) return;
  canvas.clear();
  canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
  resetImageSliders();
  refreshLayers();
  pushHistory();
});

/* ---------- DOWNLOAD ---------- */
document.getElementById('downloadBtn').addEventListener('click', () => {
  const d = getActive();
  const url = canvas.toDataURL({ format: 'png', multiplier: 2 });
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(d?.name || 'design').toLowerCase().replace(/\s+/g,'-')}-customvibe.png`;
  a.click();
});

/* ---------- SEND TO QUOTE ---------- */
document.getElementById('sendToQuoteBtn').addEventListener('click', () => {
  saveCurrentDesign();
  const payload = designs.map(d => ({
    id: d.id,
    name: d.name,
    thumbnail: d.thumbnail || null,
  }));
  try {
    localStorage.setItem('cv_quote_designs', JSON.stringify(payload));
  } catch(e) {
    alert('Designs are too large to save. Try designs with fewer images, or proceed manually.');
  }
  window.location.href = 'quote.html';
});

/* ---------- ADD TAB BUTTON ---------- */
document.getElementById('addTabBtn').addEventListener('click', createDesign);

/* ---------- SYNC CONTROLS ON SELECTION ---------- */
canvas.on('selection:created', syncSelected);
canvas.on('selection:updated', syncSelected);
canvas.on('selection:cleared', () => refreshLayers());

function syncSelected(e) {
  const obj = e.selected && e.selected[0];
  if (!obj) return;
  if (obj.type === 'image') {
    syncImgSliders(obj);
  }
  if (obj.type === 'i-text' || obj.type === 'text') {
    fontSizeSlider.value = obj.fontSize || 32;
    document.getElementById('fontSizeVal').textContent = obj.fontSize || 32;
    isBold = obj.fontWeight === 'bold';
    isItalic = obj.fontStyle === 'italic';
    isUnderline = !!obj.underline;
    document.getElementById('boldBtn').classList.toggle('active', isBold);
    document.getElementById('italicBtn').classList.toggle('active', isItalic);
    document.getElementById('underlineBtn').classList.toggle('active', isUnderline);
  }
  refreshLayers();
}

/* ---------- PUSH HISTORY ON CANVAS CHANGES ---------- */
canvas.on('object:modified', pushHistory);
canvas.on('object:added', refreshLayers);
canvas.on('object:removed', refreshLayers);

/* ---------- ACCORDION TOOLBAR ---------- */
document.querySelectorAll('.acc-header').forEach(header => {
  header.addEventListener('click', function () {
    const target = document.getElementById(this.dataset.target);
    const isOpen = target.classList.contains('open');
    target.classList.toggle('open', !isOpen);
    this.classList.toggle('open', !isOpen);
  });
});

/* ---------- INIT ---------- */
buildTemplateGrid();

if (restoreState()) {
  renderTabs();
  loadDesign(getActive());
  pushHistory();
} else {
  renderTabs();
  pushHistory();
}

canvas.on('object:added',    debouncedPersist);
canvas.on('object:removed',  debouncedPersist);
canvas.on('object:modified', debouncedPersist);

window.addEventListener('beforeunload', persistState);
