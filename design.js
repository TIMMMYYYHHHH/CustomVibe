/* ====== CustomVibe — Design Studio ====== */

const CANVAS_SIZE = Math.min(window.innerWidth < 700 ? window.innerWidth - 48 : 500, 500);

const canvas = new fabric.Canvas('designCanvas', {
  width: CANVAS_SIZE,
  height: CANVAS_SIZE,
  backgroundColor: '#ffffff',
  preserveObjectStacking: true,
});

/* ---- History ---- */
let history = [];
let histCursor = -1;

function pushHistory() {
  history = history.slice(0, histCursor + 1);
  history.push(JSON.stringify(canvas.toJSON()));
  if (history.length > 30) history.shift();
  histCursor = history.length - 1;
}

function undo() {
  if (histCursor <= 0) return;
  histCursor--;
  canvas.loadFromJSON(JSON.parse(history[histCursor]), () => canvas.renderAll());
}

/* ---- Save toast ---- */
function showToast() {
  const t = document.getElementById('saveToast');
  t.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(t._t);
  t._t = setTimeout(() => { t.style.transform = 'translateX(-50%) translateY(80px)'; }, 2000);
}

/* ---- Auto-save to localStorage ---- */
let saveTimer = null;
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem('cv_design_json', JSON.stringify(canvas.toJSON()));
      localStorage.setItem('cv_design_thumb', canvas.toDataURL({ format: 'png', multiplier: 0.4 }));
      showToast();
    } catch(e) {}
  }, 1500);
}

/* ---- Restore ---- */
(function restoreDesign() {
  try {
    const saved = localStorage.getItem('cv_design_json');
    if (saved) {
      canvas.loadFromJSON(JSON.parse(saved), () => {
        canvas.renderAll();
        pushHistory();
      });
      return;
    }
  } catch(e) {}
  pushHistory();
})();

/* ---- Image upload ---- */
const uploadZone = document.getElementById('uploadZone');
const uploadInput = document.getElementById('imageUpload');

uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.style.borderColor = 'var(--purple-light)'; });
uploadZone.addEventListener('dragleave', () => { uploadZone.style.borderColor = ''; });
uploadZone.addEventListener('drop', e => {
  e.preventDefault(); uploadZone.style.borderColor = '';
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) loadFile(file);
});
uploadInput.addEventListener('change', e => { if (e.target.files[0]) loadFile(e.target.files[0]); });

function loadFile(file) {
  const reader = new FileReader();
  reader.onload = evt => {
    fabric.Image.fromURL(evt.target.result, img => {
      const scale = Math.min(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height);
      img.set({ left: CANVAS_SIZE/2, top: CANVAS_SIZE/2, originX:'center', originY:'center', scaleX:scale, scaleY:scale });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      syncImgSliders(img);
      pushHistory();
      scheduleSave();
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
  document.getElementById('imgOpacity').value = Math.round((img.opacity ?? 1) * 100);
  document.getElementById('imgOpacityVal').textContent = Math.round((img.opacity ?? 1) * 100);
}

document.getElementById('imgScale').addEventListener('input', function() {
  document.getElementById('scaleVal').textContent = this.value;
  const obj = canvas.getActiveObject();
  if (obj && obj.type === 'image') { const s = this.value/100; obj.set({scaleX:s,scaleY:s}); canvas.renderAll(); }
});
document.getElementById('imgScale').addEventListener('change', () => { pushHistory(); scheduleSave(); });

document.getElementById('imgRotate').addEventListener('input', function() {
  document.getElementById('rotateVal').textContent = this.value;
  const obj = canvas.getActiveObject();
  if (obj && obj.type === 'image') { obj.set('angle', Number(this.value)); canvas.renderAll(); }
});
document.getElementById('imgRotate').addEventListener('change', () => { pushHistory(); scheduleSave(); });

document.getElementById('imgOpacity').addEventListener('input', function() {
  document.getElementById('imgOpacityVal').textContent = this.value;
  const obj = canvas.getActiveObject();
  if (obj) { obj.set('opacity', this.value/100); canvas.renderAll(); }
});
document.getElementById('imgOpacity').addEventListener('change', () => { pushHistory(); scheduleSave(); });

document.getElementById('fitBtn').addEventListener('click', () => {
  const obj = canvas.getActiveObject();
  if (!obj || obj.type !== 'image') return;
  const s = Math.min(CANVAS_SIZE/obj.width, CANVAS_SIZE/obj.height);
  obj.set({scaleX:s,scaleY:s,left:CANVAS_SIZE/2,top:CANVAS_SIZE/2,originX:'center',originY:'center',angle:0});
  canvas.renderAll(); syncImgSliders(obj); pushHistory(); scheduleSave();
});

document.getElementById('fillBtn').addEventListener('click', () => {
  const obj = canvas.getActiveObject();
  if (!obj || obj.type !== 'image') return;
  const s = Math.max(CANVAS_SIZE/obj.width, CANVAS_SIZE/obj.height);
  obj.set({scaleX:s,scaleY:s,left:CANVAS_SIZE/2,top:CANVAS_SIZE/2,originX:'center',originY:'center'});
  canvas.renderAll(); syncImgSliders(obj); pushHistory(); scheduleSave();
});

/* ---- Text ---- */
let activeTextColor = '#ffffff';

document.querySelectorAll('[data-color]').forEach(sw => {
  sw.addEventListener('click', () => {
    document.querySelectorAll('[data-color]').forEach(s => s.classList.remove('active'));
    sw.classList.add('active');
    activeTextColor = sw.dataset.color;
    const obj = canvas.getActiveObject();
    if (obj && (obj.type === 'i-text' || obj.type === 'text')) {
      obj.set('fill', activeTextColor); canvas.renderAll(); scheduleSave();
    }
  });
});

document.getElementById('customTextColor').addEventListener('input', function() {
  activeTextColor = this.value;
  const obj = canvas.getActiveObject();
  if (obj && (obj.type === 'i-text' || obj.type === 'text')) { obj.set('fill', activeTextColor); canvas.renderAll(); }
});
document.getElementById('customTextColor').addEventListener('change', () => { pushHistory(); scheduleSave(); });

const fontSizeSlider = document.getElementById('fontSizeSlider');
fontSizeSlider.addEventListener('input', function() {
  document.getElementById('fontSizeVal').textContent = this.value;
  const obj = canvas.getActiveObject();
  if (obj && (obj.type === 'i-text' || obj.type === 'text')) { obj.set('fontSize', Number(this.value)); canvas.renderAll(); }
});
fontSizeSlider.addEventListener('change', () => { pushHistory(); scheduleSave(); });

document.getElementById('addTextBtn').addEventListener('click', () => {
  const val = document.getElementById('textInput').value.trim() || 'Your Text';
  const text = new fabric.IText(val, {
    left: CANVAS_SIZE/2, top: CANVAS_SIZE/2,
    originX: 'center', originY: 'center',
    fontSize: Number(fontSizeSlider.value),
    fontFamily: 'Inter, sans-serif',
    fontWeight: '700',
    fill: activeTextColor,
  });
  canvas.add(text);
  canvas.setActiveObject(text);
  canvas.renderAll();
  pushHistory();
  scheduleSave();
});

/* ---- Background ---- */
document.querySelectorAll('[data-bg]').forEach(sw => {
  sw.addEventListener('click', () => {
    canvas.setBackgroundColor(sw.dataset.bg, () => { canvas.renderAll(); pushHistory(); scheduleSave(); });
  });
});
document.getElementById('customBgColor').addEventListener('input', function() {
  canvas.setBackgroundColor(this.value, canvas.renderAll.bind(canvas));
});
document.getElementById('customBgColor').addEventListener('change', () => { pushHistory(); scheduleSave(); });

/* ---- Actions ---- */
document.getElementById('undoBtn').addEventListener('click', undo);

document.getElementById('deleteBtn').addEventListener('click', () => {
  const obj = canvas.getActiveObject();
  if (!obj) return;
  canvas.remove(obj); canvas.renderAll(); pushHistory(); scheduleSave();
});

document.getElementById('clearBtn').addEventListener('click', () => {
  if (!confirm('Clear the canvas?')) return;
  canvas.clear();
  canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
  pushHistory(); scheduleSave();
});

/* ---- Download ---- */
document.getElementById('downloadBtn').addEventListener('click', () => {
  const url = canvas.toDataURL({ format: 'png', multiplier: 2 });
  const a = document.createElement('a');
  a.href = url;
  a.download = 'customvibe-magnet.png';
  a.click();
});

/* ---- Send to quote ---- */
document.getElementById('sendToQuoteBtn').addEventListener('click', () => {
  try {
    localStorage.setItem('cv_design_thumb', canvas.toDataURL({ format: 'png', multiplier: 0.4 }));
  } catch(e) {}
  window.location.href = 'quote.html';
});

/* ---- Keyboard shortcuts ---- */
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
  if ((e.key === 'Delete' || e.key === 'Backspace')) {
    const obj = canvas.getActiveObject();
    if (obj && obj.type !== 'i-text') { canvas.remove(obj); canvas.renderAll(); pushHistory(); scheduleSave(); }
  }
});

/* ---- Canvas events ---- */
canvas.on('object:modified', () => { pushHistory(); scheduleSave(); });
canvas.on('selection:created', e => {
  const obj = e.selected && e.selected[0];
  if (obj && obj.type === 'image') syncImgSliders(obj);
});
canvas.on('selection:updated', e => {
  const obj = e.selected && e.selected[0];
  if (obj && obj.type === 'image') syncImgSliders(obj);
});

window.addEventListener('beforeunload', () => {
  try {
    localStorage.setItem('cv_design_json', JSON.stringify(canvas.toJSON()));
    localStorage.setItem('cv_design_thumb', canvas.toDataURL({ format: 'png', multiplier: 0.4 }));
  } catch(e) {}
});
