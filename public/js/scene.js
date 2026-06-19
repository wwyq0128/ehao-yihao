// --- Sky Gradient ---
(function() {
  const svg = document.getElementById('scene-svg');
  const defs = svg.querySelector('defs');
  const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  grad.id = 'sky-grad';
  grad.setAttribute('x1', '0'); grad.setAttribute('y1', '0');
  grad.setAttribute('x2', '0'); grad.setAttribute('y2', '1');
  const stops = [
    { offset: '0%', color: '#FF7B54' },
    { offset: '35%', color: '#E55D87' },
    { offset: '65%', color: '#7B4B8C' },
    { offset: '100%', color: '#FFAE7A' }
  ];
  stops.forEach(s => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    el.setAttribute('offset', s.offset);
    el.setAttribute('stop-color', s.color);
    grad.appendChild(el);
  });
  defs.appendChild(grad);
})();

// --- Fireflies Canvas ---
const canvas = document.getElementById('fireflies-canvas');
const ctx = canvas.getContext('2d');
let fireflies = [];
let mouseX = -1000, mouseY = -1000;
let warmWords = [];
let usedWordIds = new Set();

let animFrame;
let canvasW, canvasH;

function resizeCanvas() {
  canvasW = window.innerWidth;
  canvasH = window.innerHeight;
  canvas.width = canvasW;
  canvas.height = canvasH;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Load warm words
async function loadWarmWords() {
  try {
    const res = await fetch('/api/warm-words');
    const data = await res.json();
    warmWords = data.words || [];
  } catch { warmWords = []; }
}

// Get a random unused warm word
function getRandomWord() {
  const available = warmWords.filter(w => !usedWordIds.has(w.id));
  if (available.length === 0) usedWordIds.clear();
  const pool = available.length > 0 ? available : warmWords;
  if (pool.length === 0) return { text: '今天也很好' };
  const w = pool[Math.floor(Math.random() * pool.length)];
  usedWordIds.add(w.id);
  return w;
}

// Show warm word
const popup = document.getElementById('warm-word-popup');
const popupText = document.getElementById('warm-word-text');
let popupTimer = null;

function showWarmWord() {
  const w = getRandomWord();
  popupText.textContent = w.text;
  popup.classList.remove('hidden');
  popup.classList.add('show');
  if (popupTimer) clearTimeout(popupTimer);
  popupTimer = setTimeout(() => {
    popup.classList.remove('show');
    setTimeout(() => popup.classList.add('hidden'), 400);
  }, 4000);
}

function hideWarmWord() {
  popup.classList.remove('show');
  setTimeout(() => popup.classList.add('hidden'), 400);
  if (popupTimer) clearTimeout(popupTimer);
}

popup.addEventListener('click', hideWarmWord);

// Create fireflies
function createFireflies(count) {
  fireflies = [];
  for (let i = 0; i < count; i++) {
    fireflies.push({
      x: Math.random() * canvasW,
      y: Math.random() * canvasH * 0.8 + canvasH * 0.1,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.2,
      size: Math.random() * 3 + 2,
      baseOpacity: Math.random() * 0.5 + 0.3,
      opacity: 0,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.01,
      hoverX: Math.random() * 200 - 100,
      hoverY: Math.random() * 100 - 50,
      centerX: Math.random() * canvasW,
      centerY: Math.random() * canvasH * 0.7 + canvasH * 0.15,
      clicked: false
    });
  }
}

// Click detection
canvas.addEventListener('click', function(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  for (const f of fireflies) {
    const dx = x - f.x;
    const dy = y - f.y;
    if (dx * dx + dy * dy < 900) {
      showWarmWord();
      return;
    }
  }
});

canvas.addEventListener('mousemove', function(e) {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

canvas.addEventListener('mouseleave', function() {
  mouseX = -1000; mouseY = -1000;
});

// Draw fireflies
function drawFireflies(time) {
  ctx.clearRect(0, 0, canvasW, canvasH);

  for (const f of fireflies) {
    // Gentle drift
    f.vx += (Math.random() - 0.5) * 0.02;
    f.vy += (Math.random() - 0.5) * 0.02;
    f.vx *= 0.98;
    f.vy *= 0.98;

    // Move toward center with gentle attraction
    const dxCenter = f.centerX - f.x;
    const dyCenter = f.centerY - f.y;
    f.vx += dxCenter * 0.0001;
    f.vy += dyCenter * 0.0001;

    // Hover oscillation
    f.x += f.vx + Math.sin(time * f.speed + f.phase) * 0.1;
    f.y += f.vy + Math.cos(time * f.speed * 0.7 + f.phase) * 0.1;

    // Glow pulse
    f.opacity = f.baseOpacity * (0.5 + 0.5 * Math.sin(time * f.speed * 2 + f.phase));

    // Draw glow
    const gradient = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 5);
    gradient.addColorStop(0, `rgba(255,224,102,${f.opacity * 0.8})`);
    gradient.addColorStop(0.3, `rgba(255,200,80,${f.opacity * 0.3})`);
    gradient.addColorStop(1, 'rgba(255,200,80,0)');

    ctx.beginPath();
    ctx.arc(f.x, f.y, f.size * 5, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw core
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 248, 200, ${f.opacity})`;
    ctx.fill();

    // Mouse proximity - gentle attraction
    const dx = mouseX - f.x;
    const dy = mouseY - f.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 100 && dist > 5) {
      f.vx += (dx / dist) * 0.02;
      f.vy += (dy / dist) * 0.02;
    }
  }
}

// Animation loop
function animate(time) {
  drawFireflies(time);
  animFrame = requestAnimationFrame(animate);
}

// Init
loadWarmWords().then(() => {
  const count = window.innerWidth > 1200 ? 40 : window.innerWidth > 768 ? 30 : 20;
  createFireflies(count);
  animate(0);
});

// Recreate on resize
window.addEventListener('resize', () => {
  resizeCanvas();
  if (fireflies.length > 0) {
    const count = window.innerWidth > 1200 ? 40 : window.innerWidth > 768 ? 30 : 20;
    createFireflies(count);
  }
});
