(function() {
  const gate = document.getElementById('site-gate');
  const input = document.getElementById('gate-password');
  const btn = document.getElementById('gate-btn');
  const error = document.getElementById('gate-error');
  const STORAGE_KEY = 'ehao_gate_passed';

  // 如果之前已经验证过，直接跳过
  if (localStorage.getItem(STORAGE_KEY) === 'true') {
    gate.classList.add('hidden');
    return;
  }

  // 显示门
  gate.classList.remove('hidden');

  async function verify(password) {
    try {
      const res = await fetch('/api/verify-site-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      return data.ok === true;
    } catch { return false; }
  }

  async function handleEnter() {
    const pw = input.value.trim();
    if (!pw) {
      input.classList.add('error');
      setTimeout(() => input.classList.remove('error'), 400);
      return;
    }

    const ok = await verify(pw);
    if (ok) {
      localStorage.setItem(STORAGE_KEY, 'true');
      gate.classList.add('fade-out');
      setTimeout(() => gate.classList.add('hidden'), 800);
      error.classList.remove('show');
    } else {
      input.classList.add('error');
      error.classList.add('show');
      setTimeout(() => {
        input.classList.remove('error');
      }, 400);
      input.value = '';
      input.focus();
    }
  }

  btn.addEventListener('click', handleEnter);
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') handleEnter();
  });

  input.focus();
})();
