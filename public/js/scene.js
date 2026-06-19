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



// --- Mood System ---
const MOOD_THEMES = {
  dusk: {
    sky: ['#FF7B54', '#E55D87', '#7B4B8C', '#FFAE7A'],
    bg: '#FF7B54',
    ocean: ['#2C6E8F', '#1A4A6B', '#0E2D44'],
    sun: { visible: true, color: '#FFD700', glow: '#FF9F1C', cx: '800', cy: '580', reflection: true },
    waveColors: ['#2C6E8F', '#4A9BB5', '#1A4A6B', '#0E2D44'],
    titleColor: '#FFF0D0',
    subtitleColor: '#FFD4B8',
    label: '黄昏'
  },
  night: {
    sky: ['#0B0D2E', '#1A1B4B', '#2D2B5E', '#1A1B4B'],
    bg: '#0B0D2E',
    ocean: ['#0A1628', '#06101E', '#030B14'],
    sun: { visible: false, color: '', glow: '', cx: '800', cy: '200', reflection: false },
    moon: { visible: true, color: '#E8E0FF', glow: '#C8B8FF', cx: '800', cy: '200' },
    waveColors: ['#0A1628', '#1A2A4A', '#06101E', '#030B14'],
    titleColor: '#E8E0FF',
    subtitleColor: '#A090C8',
    label: '星夜'
  },
  dawn: {
    sky: ['#FF9E7A', '#FFB8A0', '#C8A0C8', '#8BA0C8'],
    bg: '#FF9E7A',
    ocean: ['#4A7B8F', '#3A6A7F', '#2A5A6F'],
    sun: { visible: true, color: '#FFD4A0', glow: '#FFB080', cx: '800', cy: '620', reflection: true },
    waveColors: ['#4A7B8F', '#6A9BB5', '#3A6A7F', '#2A5A6F'],
    titleColor: '#FFF0E0',
    subtitleColor: '#FFD4B8',
    label: '晨曦'
  },
  clear: {
    sky: ['#4A90D9', '#6AA8E8', '#8AB8E8', '#B0D0F0'],
    bg: '#4A90D9',
    ocean: ['#1A6A8F', '#2A7A9F', '#1A5A7F', '#0A4A6F'],
    sun: { visible: true, color: '#FFE88A', glow: '#FFD060', cx: '800', cy: '200', reflection: true },
    waveColors: ['#1A6A8F', '#4A9BB5', '#1A5A7F', '#0A4A6F'],
    titleColor: '#FFFFFF',
    subtitleColor: '#E0E8F0',
    label: '晴空'
  }
};

let currentMood = 'dusk';

function applyMood(mood) {
  const theme = MOOD_THEMES[mood];
  if (!theme) return;
  currentMood = mood;
  
  // Update sky gradient
  const svg = document.getElementById('scene-svg');
  const defs = svg.querySelector('defs');
  const oldGrad = document.getElementById('sky-grad');
  if (oldGrad) oldGrad.remove();
  
  const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  grad.id = 'sky-grad';
  grad.setAttribute('x1', '0'); grad.setAttribute('y1', '0');
  grad.setAttribute('x2', '0'); grad.setAttribute('y2', '1');
  theme.sky.forEach(c => {
    const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop.setAttribute('offset', theme.sky.indexOf(c) * 33 + '%');
    stop.setAttribute('stop-color', c);
    grad.appendChild(stop);
  });
  defs.appendChild(grad);
  document.getElementById('sky').setAttribute('fill', 'url(#sky-grad)');
  
  // Update background
  document.body.style.background = theme.bg;
  
  // Update sun
  const sun = document.getElementById('sun');
  const sunGlow = document.querySelector('#scene-svg circle[cx="800"][cy="560"]');
  const sunReflection = document.getElementById('sun-reflection');
  
  if (theme.sun.visible) {
    sun.style.display = '';
    if (sunGlow) sunGlow.style.display = '';
    if (sunReflection) sunReflection.style.display = '';
    sun.setAttribute('cx', theme.sun.cx);
    sun.setAttribute('cy', theme.sun.cy);
    sun.setAttribute('fill', theme.sun.color);
    if (sunGlow) {
      sunGlow.setAttribute('cx', theme.sun.cx);
      sunGlow.setAttribute('cy', parseFloat(theme.sun.cy) - 20 + '');
    }
  } else {
    sun.style.display = 'none';
    if (sunGlow) sunGlow.style.display = 'none';
    if (sunReflection) sunReflection.style.display = 'none';
  }
  
  // Handle moon for night mode
  let moonGroup = document.getElementById('moon-group');
  if (theme.moon && theme.moon.visible) {
    if (!moonGroup) {
      moonGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      moonGroup.id = 'moon-group';
      const moonGlow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      moonGlow.id = 'moon-glow';
      moonGlow.setAttribute('r', '60');
      moonGlow.setAttribute('fill', 'url(#moon-glow-grad)');
      moonGroup.appendChild(moonGlow);
      const moon = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      moon.id = 'moon';
      moon.setAttribute('r', '30');
      moon.setAttribute('fill', theme.moon.color);
      moon.setAttribute('filter', 'url(#soft-glow)');
      moonGroup.appendChild(moon);
      svg.querySelector('g.clouds').before(moonGroup);
      
      // Moon glow gradient
      const moonGrad = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
      moonGrad.id = 'moon-glow-grad';
      moonGrad.setAttribute('cx', '50%'); moonGrad.setAttribute('cy', '50%'); moonGrad.setAttribute('r', '50%');
      const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop1.setAttribute('offset', '0%'); stop1.setAttribute('stop-color', theme.moon.glow); stop1.setAttribute('stop-opacity', '0.3');
      const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop2.setAttribute('offset', '100%'); stop2.setAttribute('stop-color', theme.moon.glow); stop2.setAttribute('stop-opacity', '0');
      moonGrad.appendChild(stop1); moonGrad.appendChild(stop2);
      defs.appendChild(moonGrad);
    }
    moonGroup.style.display = '';
    moonGroup.setAttribute('transform', 'translate(800, 200)');
    document.getElementById('moon').setAttribute('fill', theme.moon.color);
  } else if (moonGroup) {
    moonGroup.style.display = 'none';
  }
  
  // Add/remove stars for night mode
  let starsGroup = document.getElementById('stars-group');
  if (mood === 'night') {
    if (!starsGroup) {
      starsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      starsGroup.id = 'stars-group';
      for (let i = 0; i < 60; i++) {
        const star = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        star.setAttribute('class', 'star');
        star.setAttribute('cx', Math.random() * 1600 + '');
        star.setAttribute('cy', Math.random() * 400 + '');
        star.setAttribute('r', (Math.random() * 1.5 + 0.5) + '');
        star.setAttribute('fill', '#FFF');
        star.setAttribute('opacity', (Math.random() * 0.5 + 0.2) + '');
        star.style.animationDelay = (Math.random() * 3) + 's';
        star.style.animationDuration = (Math.random() * 2 + 2) + 's';
        starsGroup.appendChild(star);
      }
      svg.querySelector('g.clouds').before(starsGroup);
    }
    starsGroup.style.display = '';
  } else if (starsGroup) {
    starsGroup.style.display = 'none';
  }
  
  // Update waves
  const waveEls = document.querySelectorAll('.wave');
  if (waveEls.length >= 4) {
    waveEls[0].style.background = 'linear-gradient(180deg, transparent 40%, ' + theme.waveColors[0] + ' 41%, ' + theme.waveColors[3] + ' 100%)';
    waveEls[2].style.background = 'radial-gradient(ellipse at 50% 0%, transparent 50%, ' + theme.waveColors[1] + ' 51%, transparent 52%)';
    waveEls[3].style.background = 'linear-gradient(180deg, transparent 50%, ' + theme.waveColors[3] + ' 51%, ' + theme.waveColors[3] + ' 100%)';
  }
  
  // Update title colors
  document.getElementById('title').style.color = theme.titleColor;
  document.getElementById('subtitle').style.color = theme.subtitleColor;
  
  // Update mood buttons
  document.querySelectorAll('.mood-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mood === mood);
  });
  
  // Save preference
  localStorage.setItem('ehao_mood', mood);
}

// --- Ocean Sparkles (on canvas) ---
let oceanSparkles = [];
function createOceanSparkles() {
  oceanSparkles = [];
  const count = 30;
  for (let i = 0; i < count; i++) {
    oceanSparkles.push({
      x: Math.random() * canvasW,
      y: canvasH * (0.62 + Math.random() * 0.35),
      size: Math.random() * 2 + 1,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.01,
      opacity: 0
    });
  }
}

// --- Seabirds (SVG) ---
let seabirds = [];
function createSeabirds() {
  const svg = document.getElementById('scene-svg');
  const existing = document.getElementById('seabirds-group');
  if (existing) existing.remove();
  
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.id = 'seabirds-group';
  
  for (let i = 0; i < 3; i++) {
    const bird = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    bird.setAttribute('class', 'ocean-birds');
    bird.style.animationDelay = (i * 3) + 's';
    bird.style.animationDuration = (12 + i * 3) + 's';
    const x = 200 + i * 400;
    const y = 380 + i * 30;
    bird.setAttribute('d', 'M' + x + ',' + y + ' Q' + (x+8) + ',' + (y-8) + ' ' + (x+16) + ',' + y + ' Q' + (x+24) + ',' + (y-6) + ' ' + (x+32) + ',' + y);
    bird.setAttribute('fill', 'none');
    bird.setAttribute('stroke', 'rgba(255,200,180,0.25)');
    bird.setAttribute('stroke-width', '1.5');
    bird.setAttribute('stroke-linecap', 'round');
    group.appendChild(bird);
  }
  svg.querySelector('g.clouds').before(group);
}

// Modified drawFireflies to also draw ocean sparkles
const originalDrawFireflies = drawFireflies;
// We'll replace the draw function
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

// Draw fireflies + ocean sparkles
function drawFireflies(time) {
  ctx.clearRect(0, 0, canvasW, canvasH);

  // Draw ocean sparkles
  for (const s of oceanSparkles) {
    s.opacity = 0.15 + 0.25 * (0.5 + 0.5 * Math.sin(time * s.speed * 1.5 + s.phase));
    const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 4);
    grad.addColorStop(0, `rgba(255,255,255,${s.opacity * 0.5})`);
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size * 4, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

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
  createOceanSparkles();
  createSeabirds();
  animate(0);
});

// Mood selector events
document.querySelectorAll('.mood-btn').forEach(btn => {
  btn.addEventListener('click', () => applyMood(btn.dataset.mood));
});

// Restore saved mood
const savedMood = localStorage.getItem('ehao_mood');
if (savedMood && MOOD_THEMES[savedMood]) {
  setTimeout(() => applyMood(savedMood), 100);
}

// Editable subtitle
const subtitle = document.getElementById('subtitle');
const storedSlogan = localStorage.getItem('ehao_slogan');
if (storedSlogan) subtitle.textContent = storedSlogan;

subtitle.addEventListener('dblclick', function() {
  const input = document.getElementById('subtitle-input');
  if (!input) {
    const inp = document.createElement('input');
    inp.id = 'subtitle-input';
    inp.type = 'text';
    inp.value = subtitle.textContent;
    subtitle.parentNode.insertBefore(inp, subtitle.nextSibling);
    inp.style.display = 'block';
    subtitle.style.opacity = '0';
    inp.focus();
    inp.select();
    
    function saveSlogan() {
      const val = inp.value.trim() || '你的小岛';
      subtitle.textContent = val;
      subtitle.style.opacity = '';
      inp.style.display = 'none';
      localStorage.setItem('ehao_slogan', val);
    }
    inp.addEventListener('blur', saveSlogan);
    inp.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { inp.blur(); }
      if (e.key === 'Escape') { inp.value = subtitle.textContent; inp.blur(); }
    });
  }
});

// Journal icon
document.getElementById('journal-icon').addEventListener('click', () => {
  const overlay = document.getElementById('journal-overlay');
  overlay.classList.remove('hidden');
  setTimeout(() => overlay.classList.add('show'), 10);
  if (typeof loadJournalEntries === 'function') loadJournalEntries();
});

document.getElementById('close-journal').addEventListener('click', () => {
  const overlay = document.getElementById('journal-overlay');
  overlay.classList.remove('show');
  setTimeout(() => overlay.classList.add('hidden'), 400);
});

document.getElementById('journal-overlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) document.getElementById('close-journal').click();
});

// Save journal entry
document.getElementById('save-journal').addEventListener('click', () => {
  if (typeof saveJournalEntry === 'function') saveJournalEntry();
});

// Recreate on resize
window.addEventListener('resize', () => {
  resizeCanvas();
  if (fireflies.length > 0) {
    const count = window.innerWidth > 1200 ? 40 : window.innerWidth > 768 ? 30 : 20;
    createFireflies(count);
  }
  createOceanSparkles();
});
