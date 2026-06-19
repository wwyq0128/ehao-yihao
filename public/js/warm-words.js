// Warm words are loaded and shown via scene.js
// This file provides additional warm-word utilities

// Pulse the lighthouse glow when there's a new letter
function pulseLighthouse(hasUnread) {
  const badge = document.getElementById('new-letter-badge');
  const glow = document.querySelector('#lighthouse-group circle:last-child');
  if (hasUnread) {
    badge.classList.add('show');
  } else {
    badge.classList.remove('show');
  }
}
