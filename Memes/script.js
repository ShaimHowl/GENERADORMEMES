/* Generador de Memes de Shaim y Jansen */

const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d');

// Controles
const imageInput = document.getElementById('imageInput');
const topTextInput = document.getElementById('topText');
const bottomTextInput = document.getElementById('bottomText');
const fontFamilySelect = document.getElementById('fontFamily');
const fontSizeRange = document.getElementById('fontSize');
const textColorInput = document.getElementById('textColor');
const strokeColorInput = document.getElementById('strokeColor');
const strokeWidthRange = document.getElementById('strokeWidth');
const letterSpacingRange = document.getElementById('letterSpacing');
const alignmentSelect = document.getElementById('alignment');
const shadowToggle = document.getElementById('shadowToggle');

const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');
const randomBgBtn = document.getElementById('randomBg');
const fitToScreenBtn = document.getElementById('fitToScreen');
const resetPositionsBtn = document.getElementById('resetPositions');

// Estado
let image = null;
let scale = 1; // escala para la vista (no para exportar)
let drawing = false;
const state = {
  top: {
    text: '',
    x: canvas.width / 2,
    y: 80,
    selected: false
  },
  bottom: {
    text: '',
    x: canvas.width / 2,
    y: canvas.height - 60,
    selected: false
  },
  style: {
    fontFamily: 'Impact',
    fontSize: 64,
    textColor: '#ffffff',
    strokeColor: '#000000',
    strokeWidth: 6,
    letterSpacing: 0,
    align: 'center',
    shadow: true
  }
};

// Utilidades de dibujo
function applyTextStyle(ctxLocal, style) {
  ctxLocal.font = `${style.fontSize}px ${style.fontFamily}`;
  ctxLocal.textAlign = style.align;
  ctxLocal.textBaseline = 'middle';
  ctxLocal.fillStyle = style.textColor;
  ctxLocal.strokeStyle = style.strokeColor;
  ctxLocal.lineWidth = style.strokeWidth;
  if (style.shadow) {
    ctxLocal.shadowColor = 'rgba(0,0,0,0.35)';
    ctxLocal.shadowBlur = 8;
    ctxLocal.shadowOffsetX = 2;
    ctxLocal.shadowOffsetY = 2;
  } else {
    ctxLocal.shadowColor = 'transparent';
    ctxLocal.shadowBlur = 0;
    ctxLocal.shadowOffsetX = 0;
    ctxLocal.shadowOffsetY = 0;
  }
}

function drawTextWithSpacing(ctxLocal, text, x, y, style) {
  const t = text || '';
  if (!t) return;

  // Alineación manual con espaciado
  const chars = [...t];
  const metrics = chars.map(ch => ctxLocal.measureText(ch).width);
  const spacing = style.letterSpacing;
  const totalWidth = metrics.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);

  let startX = x;
  if (style.align === 'center') startX = x - totalWidth / 2;
  else if (style.align === 'right') startX = x - totalWidth;

  let cursor = startX;
  ctxLocal.lineJoin = 'round';

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const w = metrics[i];
    // Stroke primero para look tipo meme
    if (style.strokeWidth > 0) ctxLocal.strokeText(ch, cursor + w / 2, y);
    ctxLocal.fillText(ch, cursor + w / 2, y);
    cursor += w + spacing;
  }
}

// Fondo dinámico por defecto
function drawDefaultBackground(ctxLocal, w, h) {
  const grad = ctxLocal.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#1b2a4a');
  grad.addColorStop(1, '#0c1430');
  ctxLocal.fillStyle = grad;
  ctxLocal.fillRect(0, 0, w, h);

  // patrón suave
  ctxLocal.globalAlpha = 0.15;
  for (let i = 0; i < 120; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = Math.random() * 2 + 0.5;
    ctxLocal.beginPath();
    ctxLocal.arc(x, y, r, 0, Math.PI * 2);
    ctxLocal.fillStyle = i % 2 === 0 ? '#6ce1ff' : '#9bff9b';
    ctxLocal.fill();
  }
  ctxLocal.globalAlpha = 1;

  // Marca sutil
  ctxLocal.fillStyle = 'rgba(255,255,255,0.06)';
  ctxLocal.font = '24px Montserrat, system-ui, sans-serif';
  ctxLocal.textAlign = 'right';
  ctxLocal.fillText('Memes de Shaim y Jansen', w - 12, h - 16);
}

// Dibujo principal
function render() {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  if (image) {
    // Ajuste a canvas manteniendo proporción
    const imgRatio = image.width / image.height;
    const canvasRatio = w / h;
    let drawW, drawH, offsetX = 0, offsetY = 0;

    if (imgRatio > canvasRatio) {
      // imagen más ancha que el canvas
      drawW = w;
      drawH = w / imgRatio;
      offsetY = (h - drawH) / 2;
    } else {
      drawH = h;
      drawW = h * imgRatio;
      offsetX = (w - drawW) / 2;
    }
    ctx.drawImage(image, offsetX, offsetY, drawW, drawH);
  } else {
    drawDefaultBackground(ctx, w, h);
  }

  applyTextStyle(ctx, state.style);
  drawTextWithSpacing(ctx, state.top.text, state.top.x, state.top.y, state.style);
  drawTextWithSpacing(ctx, state.bottom.text, state.bottom.x, state.bottom.y, state.style);
}

// Eventos de UI
imageInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    image = img;
    // Redimensiona canvas al tamaño de la imagen (exportación nítida)
    canvas.width = img.width;
    canvas.height = img.height;
    // Reposiciona textos proporcionalmente
    state.top.x = canvas.width / 2;
    state.top.y = Math.max(60, canvas.height * 0.08);
    state.bottom.x = canvas.width / 2;
    state.bottom.y = Math.min(canvas.height - 60, canvas.height * 0.92);
    render();
    fitToScreen(); // ajusta la vista al contenedor
    URL.revokeObjectURL(url);
  };
  img.src = url;
});

topTextInput.addEventListener('input', e => {
  state.top.text = e.target.value.toUpperCase();
  render();
});
bottomTextInput.addEventListener('input', e => {
  state.bottom.text = e.target.value.toUpperCase();
  render();
});
fontFamilySelect.addEventListener('change', e => {
  state.style.fontFamily = e.target.value;
  render();
});
fontSizeRange.addEventListener('input', e => {
  state.style.fontSize = parseInt(e.target.value, 10);
  render();
});
textColorInput.addEventListener('input', e => {
  state.style.textColor = e.target.value;
  render();
});
strokeColorInput.addEventListener('input', e => {
  state.style.strokeColor = e.target.value;
  render();
});
strokeWidthRange.addEventListener('input', e => {
  state.style.strokeWidth = parseInt(e.target.value, 10);
  render();
});
letterSpacingRange.addEventListener('input', e => {
  state.style.letterSpacing = parseInt(e.target.value, 10);
  render();
});
alignmentSelect.addEventListener('change', e => {
  state.style.align = e.target.value;
  render();
});
shadowToggle.addEventListener('change', e => {
  state.style.shadow = e.target.checked;
  render();
});

// Arrastre de textos
let dragTarget = null;

function getMousePos(evt) {
  const rect = canvas.getBoundingClientRect();
  const x = (evt.clientX - rect.left) * (canvas.width / rect.width);
  const y = (evt.clientY - rect.top) * (canvas.height / rect.height);
  return { x, y };
}

canvas.addEventListener('mousedown', evt => {
  const { x, y } = getMousePos(evt);
  // detección simple: proximidad vertical a los textos
  const threshold = state.style.fontSize * 0.8;
  if (Math.abs(y - state.top.y) < threshold) dragTarget = 'top';
  else if (Math.abs(y - state.bottom.y) < threshold) dragTarget = 'bottom';
});

canvas.addEventListener('mousemove', evt => {
  if (!dragTarget) return;
  const { x, y } = getMousePos(evt);
  if (dragTarget === 'top') {
    state.top.x = x;
    state.top.y = y;
  } else {
    state.bottom.x = x;
    state.bottom.y = y;
  }
  render();
});

canvas.addEventListener('mouseup', () => { dragTarget = null; });
canvas.addEventListener('mouseleave', () => { dragTarget = null; });

// Doble clic para editar rápido
canvas.addEventListener('dblclick', evt => {
  const { y } = getMousePos(evt);
  const threshold = state.style.fontSize * 0.8;
  if (Math.abs(y - state.top.y) < threshold) {
    topTextInput.focus();
    topTextInput.select();
  } else if (Math.abs(y - state.bottom.y) < threshold) {
    bottomTextInput.focus();
    bottomTextInput.select();
  }
});

// Botones
downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'meme-shaim-jansen.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

clearBtn.addEventListener('click', () => {
  image = null;
  canvas.width = 800;
  canvas.height = 600;
  state.top.text = '';
  state.bottom.text = '';
  state.top.x = canvas.width / 2;
  state.bottom.x = canvas.width / 2;
  state.top.y = 80;
  state.bottom.y = canvas.height - 60;
  state.style = {
    fontFamily: 'Impact',
    fontSize: 64,
    textColor: '#ffffff',
    strokeColor: '#000000',
    strokeWidth: 6,
    letterSpacing: 0,
    align: 'center',
    shadow: true
  };
  render();
  fitToScreen();
});

randomBgBtn.addEventListener('click', () => {
  image = null; // usar el fondo por defecto
  render();
});

fitToScreenBtn.addEventListener('click', fitToScreen);

resetPositionsBtn.addEventListener('click', () => {
  state.top.x = canvas.width / 2;
  state.bottom.x = canvas.width / 2;
  state.top.y = Math.max(60, canvas.height * 0.08);
  state.bottom.y = Math.min(canvas.height - 60, canvas.height * 0.92);
  render();
});

// Ajuste de visualización (CSS mantiene el canvas responsivo; esto ayuda a la precisión del arrastre)
function fitToScreen() {
  // El canvas ya es responsivo por CSS; esta función puede usarse para forzar un re-render
  render();
}

// Inicial
state.top.text = '';
state.bottom.text = '';
render();
fitToScreen();
