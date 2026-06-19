// --- Letters System ---
let letters = [];
const READ_IDS_KEY = 'ehao_read_ids';

function getReadIds() {
  try {
    return JSON.parse(localStorage.getItem(READ_IDS_KEY)) || [];
  } catch { return []; }
}

function markReadLocally(id) {
  const ids = getReadIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(READ_IDS_KEY, JSON.stringify(ids));
  }
}

// --- Load letters ---
async function loadLetters() {
  try {
    const res = await fetch('/api/letters');
    const data = await res.json();
    letters = (data.letters || []).sort((a, b) => b.id - a.id);
    renderLettersList();
    checkUnread();
    return letters;
  } catch { return []; }
}

// --- Check unread ---
function checkUnread() {
  const readIds = getReadIds();
  const hasUnread = letters.some(l => !readIds.includes(l.id));
  const badge = document.getElementById('new-letter-badge');
  if (hasUnread) {
    badge.classList.add('show');
  } else {
    badge.classList.remove('show');
  }
  return hasUnread;
}

// --- Render letters list ---
function renderLettersList() {
  const list = document.getElementById('letters-list');
  const readIds = getReadIds();
  list.innerHTML = '';

  if (letters.length === 0) {
    list.innerHTML = '<div style="color:#8B75A0;text-align:center;padding:40px 0;">还没有信，等一等吧 ✦</div>';
    return;
  }

  letters.forEach(l => {
    const isRead = readIds.includes(l.id);
    const item = document.createElement('div');
    item.className = 'letter-item' + (isRead ? ' read' : ' unread');
    item.innerHTML = `
      <div class="letter-date">${l.date}</div>
      <div class="letter-item-title">${l.title}</div>
    `;
    item.addEventListener('click', () => openLetter(l));
    list.appendChild(item);
  });
}

// --- Open letter ---
function openLetter(letter) {
  const overlay = document.getElementById('letter-detail-overlay');
  const dateEl = document.getElementById('letter-date');
  const titleEl = document.getElementById('letter-title');
  const contentEl = document.getElementById('letter-content');

  dateEl.textContent = letter.date;
  titleEl.textContent = letter.title;
  contentEl.textContent = letter.content;

  overlay.classList.remove('hidden');
  setTimeout(() => overlay.classList.add('show'), 10);

  // Mark as read
  markReadLocally(letter.id);
  renderLettersList();
  checkUnread();

  // Tell server
  fetch('/api/letters/' + letter.id + '/read', { method: 'POST' }).catch(() => {});
}

// --- Close letter detail ---
document.getElementById('close-detail').addEventListener('click', () => {
  const overlay = document.getElementById('letter-detail-overlay');
  overlay.classList.remove('show');
  setTimeout(() => overlay.classList.add('hidden'), 400);
});

// Close detail by clicking outside
document.getElementById('letter-detail-overlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    document.getElementById('close-detail').click();
  }
});

// --- Show/Hide letters panel ---
document.getElementById('lighthouse-group').addEventListener('click', () => {
  const overlay = document.getElementById('letters-overlay');
  overlay.classList.remove('hidden');
  setTimeout(() => overlay.classList.add('show'), 10);
  loadLetters();
});

document.getElementById('close-letters').addEventListener('click', () => {
  const overlay = document.getElementById('letters-overlay');
  overlay.classList.remove('show');
  setTimeout(() => overlay.classList.add('hidden'), 400);
});

// Close by clicking outside
document.getElementById('letters-overlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    document.getElementById('close-letters').click();
  }
});

// --- Init ---
loadLetters();
