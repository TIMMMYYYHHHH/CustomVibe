/* ====== CustomVibe — Design Editor ====== */

const CANVAS_SIZE = Math.min(window.innerWidth < 900 ? window.innerWidth - 48 : 520, 520);

const canvas = new fabric.Canvas('designCanvas', {
  width: CANVAS_SIZE,
  height: CANVAS_SIZE,
  backgroundColor: '#ffffff',
  preserveObjectStacking: true,
});

let currentImage = null;
let textColor = '#ffffff';

/* ---- Image Upload ---- */
const uploadInput = document.getElementById('imageUpload');
const uploadZone  = document.getElementById('uploadZone');

uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.style.background = '#F3E8FF'; });
uploadZone.addEventListener('dragleave', () => { uploadZone.style.background = ''; });
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.style.background = '';
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) loadImage(file);
});

uploadInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) loadImage(file);
});

function loadImage(file) {
  const reader = new FileReader();
  reader.onload = evt => {
    fabric.Image.fromURL(evt.target.result, img => {
      if (currentImage) canvas.remove(currentImage);

      // Scale to fit canvas
      const scale = Math.min(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height);
      img.set({
        left: CANVAS_SIZE / 2,
        top: CANVAS_SIZE / 2,
        originX: 'center',
        originY: 'center',
        scaleX: scale,
        scaleY: scale,
      });

      currentImage = img;
      canvas.insertAt(img, 0);
      canvas.setActiveObject(img);
      canvas.renderAll();

      // Sync sliders
      document.getElementById('imgScale').value = Math.round(scale * 100);
      document.getElementById('scaleVal').textContent = Math.round(scale * 100);
      document.getElementById('imgRotate').value = 0;
      document.getElementById('rotateVal').textContent = 0;
    });
  };
  reader.readAsDataURL(file);
}

/* ---- Image Scale / Rotate Sliders ---- */
document.getElementById('imgScale').addEventListener('input', function () {
  document.getElementById('scaleVal').textContent = this.value;
  if (!currentImage) return;
  const s = this.value / 100;
  currentImage.set({ scaleX: s, scaleY: s });
  canvas.renderAll();
});

document.getElementById('imgRotate').addEventListener('input', function () {
  document.getElementById('rotateVal').textContent = this.value;
  if (!currentImage) return;
  currentImage.set('angle', Number(this.value));
  canvas.renderAll();
});

document.getElementById('fitImageBtn').addEventListener('click', () => {
  if (!currentImage) return;
  const scale = Math.min(CANVAS_SIZE / currentImage.width, CANVAS_SIZE / currentImage.height);
  currentImage.set({ scaleX: scale, scaleY: scale, left: CANVAS_SIZE/2, top: CANVAS_SIZE/2, originX:'center', originY:'center', angle: 0 });
  canvas.renderAll();
  document.getElementById('imgScale').value = Math.round(scale * 100);
  document.getElementById('scaleVal').textContent = Math.round(scale * 100);
  document.getElementById('imgRotate').value = 0;
  document.getElementById('rotateVal').textContent = 0;
});

document.getElementById('fillImageBtn').addEventListener('click', () => {
  if (!currentImage) return;
  const scale = Math.max(CANVAS_SIZE / currentImage.width, CANVAS_SIZE / currentImage.height);
  currentImage.set({ scaleX: scale, scaleY: scale, left: CANVAS_SIZE/2, top: CANVAS_SIZE/2, originX:'center', originY:'center', angle: 0 });
  canvas.renderAll();
  document.getElementById('imgScale').value = Math.round(scale * 100);
  document.getElementById('scaleVal').textContent = Math.round(scale * 100);
});

/* ---- Text ---- */
const fontSizeSlider = document.getElementById('fontSizeSlider');
fontSizeSlider.addEventListener('input', function () {
  document.getElementById('fontSizeVal').textContent = this.value;
  const obj = canvas.getActiveObject();
  if (obj && obj.type === 'i-text') { obj.set('fontSize', Number(this.value)); canvas.renderAll(); }
});

document.getElementById('addTextBtn').addEventListener('click', () => {
  const val = document.getElementById('textInput').value.trim() || 'Your Text';
  const text = new fabric.IText(val, {
    left: CANVAS_SIZE / 2,
    top: CANVAS_SIZE / 2,
    originX: 'center',
    originY: 'center',
    fontSize: Number(fontSizeSlider.value),
    fontFamily: document.getElementById('fontSelect').value,
    fill: textColor,
    fontWeight: 'bold',
    shadow: 'rgba(0,0,0,0.4) 2px 2px 4px',
  });
  canvas.add(text);
  canvas.setActiveObject(text);
  canvas.renderAll();
});

/* ---- Text Color Swatches ---- */
document.querySelectorAll('[data-color]').forEach(swatch => {
  swatch.addEventListener('click', () => {
    document.querySelectorAll('[data-color]').forEach(s => s.classList.remove('active'));
    swatch.classList.add('active');
    textColor = swatch.dataset.color;
    const obj = canvas.getActiveObject();
    if (obj && obj.type === 'i-text') { obj.set('fill', textColor); canvas.renderAll(); }
  });
});

document.getElementById('customTextColor').addEventListener('input', function () {
  textColor = this.value;
  const obj = canvas.getActiveObject();
  if (obj && obj.type === 'i-text') { obj.set('fill', textColor); canvas.renderAll(); }
});

/* ---- Background Color ---- */
document.querySelectorAll('[data-bg]').forEach(swatch => {
  swatch.addEventListener('click', () => {
    canvas.setBackgroundColor(swatch.dataset.bg, canvas.renderAll.bind(canvas));
  });
});
document.getElementById('customBgColor').addEventListener('input', function () {
  canvas.setBackgroundColor(this.value, canvas.renderAll.bind(canvas));
});

/* ---- Delete / Clear ---- */
document.getElementById('deleteSelBtn').addEventListener('click', () => {
  const obj = canvas.getActiveObject();
  if (!obj) return;
  if (obj === currentImage) currentImage = null;
  canvas.remove(obj);
  canvas.renderAll();
});

document.getElementById('clearBtn').addEventListener('click', () => {
  if (!confirm('Clear everything and start over?')) return;
  canvas.clear();
  canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
  currentImage = null;
  document.getElementById('imgScale').value = 100;
  document.getElementById('scaleVal').textContent = 100;
  document.getElementById('imgRotate').value = 0;
  document.getElementById('rotateVal').textContent = 0;
});

/* ---- Download ---- */
document.getElementById('downloadBtn').addEventListener('click', () => {
  const dataURL = canvas.toDataURL({ format: 'png', multiplier: 2 });
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = 'customvibe-magnet-preview.png';
  a.click();
});

/* ---- Sync font size slider when text object is selected ---- */
canvas.on('selection:created', syncControls);
canvas.on('selection:updated', syncControls);

function syncControls(e) {
  const obj = e.selected && e.selected[0];
  if (!obj) return;
  if (obj.type === 'i-text') {
    fontSizeSlider.value = obj.fontSize;
    document.getElementById('fontSizeVal').textContent = obj.fontSize;
  }
  if (obj === currentImage) {
    const scale = Math.round(obj.scaleX * 100);
    document.getElementById('imgScale').value = scale;
    document.getElementById('scaleVal').textContent = scale;
    document.getElementById('imgRotate').value = Math.round(obj.angle);
    document.getElementById('rotateVal').textContent = Math.round(obj.angle);
  }
}
