// --- Journal (随笔本) ---
const JOURNAL_KEY = 'ehao_journal_entries';
const JOURNAL_DATE_KEY = 'ehao_journal_dates';

function getJournalEntries() {
  try {
    return JSON.parse(localStorage.getItem(JOURNAL_KEY)) || [];
  } catch { return []; }
}

function saveEntry() {
  const textarea = document.getElementById('journal-text');
  const status = document.getElementById('journal-status');
  const text = textarea.value.trim();
  if (!text) {
    status.textContent = '写点什么吧 ✦';
    status.style.color = '#C4A882';
    return;
  }
  
  const entries = getJournalEntries();
  const now = new Date();
  const dateStr = now.getFullYear() + '-' + 
    String(now.getMonth() + 1).padStart(2, '0') + '-' + 
    String(now.getDate()).padStart(2, '0') + ' ' +
    String(now.getHours()).padStart(2, '0') + ':' +
    String(now.getMinutes()).padStart(2, '0');
  
  entries.unshift({
    id: Date.now(),
    text: text,
    date: dateStr
  });
  
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
  textarea.value = '';
  status.textContent = '已保存 ✦';
  status.style.color = '#8BA97D';
  setTimeout(() => { status.textContent = ''; }, 2000);
  loadJournalEntries();
}

function loadJournalEntries() {
  const container = document.getElementById('journal-entries');
  const entries = getJournalEntries();
  
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

function deleteEntry(id) {
  let entries = getJournalEntries();
  entries = entries.filter(e => e.id !== id);
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
  loadJournalEntries();
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
