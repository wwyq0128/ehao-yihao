// --- Journal (随笔本) ---
const JOURNAL_KEY = 'ehao_journal_entries';

function getJournalEntries() {
  try {
    return JSON.parse(localStorage.getItem(JOURNAL_KEY)) || [];
  } catch { return []; }
}

function setJournalEntries(entries) {
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
}

function upsertJournalEntry(entry) {
  const entries = getJournalEntries();
  const index = entries.findIndex(item => item.id === entry.id);
  if (index >= 0) {
    entries[index] = { ...entries[index], ...entry };
  } else {
    entries.push(entry);
  }
  entries.sort((a, b) => b.id - a.id);
  setJournalEntries(entries);
  return entries;
}

async function loadJournalEntries() {
  try {
    const res = await fetch('/api/journal');
    const data = await res.json();
    const entries = data.entries || [];
    if (entries.length === 0) {
      await restoreJournalEntries();
      renderJournalEntries(getJournalEntries());
      return;
    }
    setJournalEntries(entries);
    renderJournalEntries(entries);
  } catch {
    renderJournalEntries(getJournalEntries());
  }
}

async function restoreJournalEntries() {
  const entries = getJournalEntries().sort((a, b) => a.id - b.id);
  if (entries.length === 0) return;
  for (const entry of entries) {
    try {
      await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch {}
  }
}

function renderJournalEntries(entries) {
  const container = document.getElementById('journal-entries');
  if (entries.length === 0) {
    container.innerHTML = '<div style="color:#C4A882;text-align:center;padding:20px 0;font-size:14px;">还没有写过随笔 ✦</div>';
    return;
  }

  container.innerHTML = entries.map(e => `
    <div class="journal-entry">
      <div class="entry-date">${e.date}</div>
      <div class="entry-text">${escapeHtml(e.text)}</div>
      <button class="entry-delete" data-id="${e.id}">✕</button>
    </div>
  `).join('');

  container.querySelectorAll('.entry-delete').forEach(btn => {
    btn.addEventListener('click', () => deleteEntry(parseInt(btn.dataset.id)));
  });
}

async function saveEntry() {
  const textarea = document.getElementById('journal-text');
  const status = document.getElementById('journal-status');
  const text = textarea.value.trim();
  if (!text) {
    status.textContent = '写点什么吧 ✦';
    status.style.color = '#C4A882';
    return;
  }

  const now = new Date();
  const dateStr = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0') + ' ' +
    String(now.getHours()).padStart(2, '0') + ':' +
    String(now.getMinutes()).padStart(2, '0');
  const draftEntry = {
    id: Date.now(),
    text,
    date: dateStr
  };

  try {
    const res = await fetch('/api/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draftEntry)
    });
    if (!res.ok) throw new Error('save failed');
    const data = await res.json();
    upsertJournalEntry(data.entry || draftEntry);
    textarea.value = '';
    status.textContent = '已保存 ✦';
    status.style.color = '#8BA97D';
    setTimeout(() => { status.textContent = ''; }, 2000);
    renderJournalEntries(getJournalEntries());
  } catch {
    upsertJournalEntry(draftEntry);
    textarea.value = '';
    status.textContent = '已离线保存 ✦';
    status.style.color = '#C4A882';
    setTimeout(() => { status.textContent = ''; }, 2000);
    renderJournalEntries(getJournalEntries());
  }
}

async function deleteEntry(id) {
  const entries = getJournalEntries().filter(e => e.id !== id);
  setJournalEntries(entries);
  renderJournalEntries(entries);
  try {
    await fetch('/api/journal/' + id, { method: 'DELETE' });
  } catch {}
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Keyboard shortcut: Ctrl+Enter to save in textarea
document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('journal-text');
  if (textarea) {
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        saveEntry();
      }
    });
  }
});

window.saveJournalEntry = saveEntry;
loadJournalEntries();
