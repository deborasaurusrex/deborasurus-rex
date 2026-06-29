/*
app.js — CORE APPLICATION LOGIC
══════════════════════════════════
Theme toggle, score display, toast notifications,
guestbook, mystery fill-in, identity votes, keyboard
shortcuts, category display, and page initialization.
*/

/* ═══ THEME ═══ */
let theme = localStorage.getItem('debo-theme') || 'light';
let score = 0;
let scoreInterval = null;

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  document.getElementById('themeLabel').textContent = t === 'dark' ? '☀️ Fossil Mode' : '🌙 Dino Mode';
  document.getElementById('dinoEmoji').textContent = t === 'dark' ? '🦖' : '🦕';
  if (t === 'dark') {
    if (!scoreInterval) scoreInterval = setInterval(() => {
      score += 3;
      updateScore();
    }, 200);
  } else {
    if (scoreInterval) { clearInterval(scoreInterval); scoreInterval = null; }
  }
}

function updateScore() {
  const hi = Math.max(score, parseInt(localStorage.getItem('debo-hi') || '0'));
  localStorage.setItem('debo-hi', hi);
  document.getElementById('scoreDisplay').textContent = 
    'HI ' + String(hi).padStart(5,'0') + ' ' + String(score).padStart(5,'0');
}

function toggleTheme() {
  theme = theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('debo-theme', theme);
  applyTheme(theme);
}

/* ═══ DINO JUMP ═══ */
function dinoJump() {
  const el = document.getElementById('dinoEmoji');
  el.classList.add('jump');
  if (theme === 'dark') { score += 10; updateScore(); }
  setTimeout(() => el.classList.remove('jump'), 500);
}

/* ═══ TOAST ═══ */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

/* ═══ MYSTERY ═══ */
async function loadMystery() {
  try {
    // UPDATED: Using apiUrl() to connect to Railway
    const res = await fetch(apiUrl('/mystery'));
    const data = await res.json();
    renderMystery(data);
  } catch(e) {
    document.getElementById('mysteryContainer').innerHTML = 
      '<div class="empty-state">Couldn\'t load mysteries 🦴</div>';
  }
}

function renderMystery(data) {
  const container = document.getElementById('mysteryContainer');
  container.innerHTML = '';
  for (const [key, info] of Object.entries(data)) {
    const div = document.createElement('div');
    div.className = 'mystery-q';
    div.innerHTML = `
      <div class="mystery-prompt">${info.prompt}</div>
      <div class="mystery-answers-list" id="mystery-pills-${key}">
        ${info.answers.length === 0 
          ? '<span style="font-size:12px;color:var(--text2)">No answers yet — be the first!</span>' 
          : info.answers.map(a => `<span class="mystery-answer-pill" title="${escHtml(a.visitor_name)}">${escHtml(a.answer)}</span>`).join('')
        }
      </div>
      <div class="mystery-input-row">
        <input type="text" id="mystery-input-${key}" placeholder="Your answer…" maxlength="200">
        <button class="btn btn-sm" onclick="submitMystery('${key}')" data-track="submit_mystery_answer">Add</button>
      </div>
    `;
    container.appendChild(div);
  }
}

async function submitMystery(key) {
  const input = document.getElementById(`mystery-input-${key}`);
  const answer = input.value.trim();
  if (!answer) return;
  
  try {
    // UPDATED: Using apiUrl() to connect to Railway
    const res = await fetch(apiUrl('/mystery'), {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ question_key: key, answer, visitor_name: 'Visitor' })
    });
    if (!res.ok) throw new Error();
    
    input.value = '';
    const pillsDiv = document.getElementById(`mystery-pills-${key}`);
    const prev = pillsDiv.querySelector('span[style]');
    if (prev) pillsDiv.removeChild(prev);
    
    const pill = document.createElement('span');
    pill.className = 'mystery-answer-pill';
    pill.textContent = answer;
    pillsDiv.appendChild(pill);
    
    showToast('Answer added! 🦕');
    if (theme === 'dark') { score += 20; updateScore(); }
  } catch(e) {
    showToast('Oops, something roared 🦖');
  }
}

/* ═══ IDENTITY ═══ */
async function loadIdentity() {
  try {
    // UPDATED: Using apiUrl() to connect to Railway
    const res = await fetch(apiUrl('/identity'));
    const data = await res.json();
    renderIdentity(data);
  } catch(e) {
    document.getElementById('identityContainer').innerHTML = 
      '<div class="empty-state">Couldn\'t load categories 🦴</div>';
  }
}

function renderIdentity(data) {
  const container = document.getElementById('identityContainer');
  container.innerHTML = '';
  for (const [key, info] of Object.entries(data)) {
    const div = document.createElement('div');
    div.className = 'identity-cat';
    
    const optionsHtml = info.options.length === 0
      ? '<span style="font-size:12px;color:var(--text2)">Cast the first vote!</span>'
      : info.options.map(o => `<div class="identity-result"><span>${escHtml(o.option_text)}</span><span class="count">${o.votes}</span></div>`).join('');
      
    div.innerHTML = `
      <div class="identity-label">${info.label}</div>
      <div class="identity-results" id="identity-results-${key}">${optionsHtml}</div>
      <div class="identity-input-row">
        <input type="text" id="identity-input-${key}" placeholder="Kate is…" maxlength="100">
        <button class="btn btn-sm" onclick="submitIdentity('${key}')" data-track="submit_identity_vote">Vote</button>
      </div>
    `;
    container.appendChild(div);
  }
}

async function submitIdentity(key) {
  const input = document.getElementById(`identity-input-${key}`);
  const option_text = input.value.trim();
  if (!option_text) return;
  
  try {
    // UPDATED: Using apiUrl() to connect to Railway
    const res = await fetch(apiUrl('/identity'), {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ category: key, option_text, visitor_name: 'Visitor' })
    });
    if (!res.ok) throw new Error();
    
    input.value = '';
    await loadIdentity();
    showToast('Vote cast! Democracy wins 🦕');
    if (theme === 'dark') { score += 15; updateScore(); }
  } catch(e) {
    showToast('Vote failed to roar through 🦖');
  }
}

/* ═══ GUESTBOOK ═══ */
let selectedEmoji = '🦕';

function selectEmoji(el) {
  document.querySelectorAll('.emoji-option').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  selectedEmoji = el.dataset.emoji;
}

async function loadGuestbook() {
  try {
    // UPDATED: Using apiUrl() to connect to Railway
    const res = await fetch(apiUrl('/guestbook'));
    const entries = await res.json();
    renderGuestbook(entries);
  } catch(e) {
    document.getElementById('guestbookEntries').innerHTML = 
      '<div class="empty-state">Guestbook taking a nap 🦕</div>';
  }
}

function renderGuestbook(entries) {
  const container = document.getElementById('guestbookEntries');
  if (entries.length === 0) {
    container.innerHTML = '<div class="empty-state">No entries yet — write the first one! 🦕</div>';
    return;
  }
  
  container.innerHTML = entries.map(e => {
    const date = new Date(e.created_at + 'Z');
    const timeStr = date.toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric'});
    return `
      <div class="guestbook-entry">
        <div class="entry-header">
          <span class="entry-emoji">${e.dino_emoji}</span>
          <span class="entry-name">${escHtml(e.visitor_name)}</span>
          <span class="entry-time">${timeStr}</span>
        </div>
        <div class="entry-msg">${escHtml(e.message)}</div>
      </div>
    `;
  }).join('');
}

async function submitGuestbook(e) {
  e.preventDefault();
  const name = document.getElementById('gbName').value.trim();
  const message = document.getElementById('gbMessage').value.trim();
  if (!name || !message) return;
  
  try {
    // UPDATED: Using apiUrl() to connect to Railway
    const res = await fetch(apiUrl('/guestbook'), {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ visitor_name: name, message, dino_emoji: selectedEmoji })
    });
    if (!res.ok) throw new Error();
    
    document.getElementById('gbName').value = '';
    document.getElementById('gbMessage').value = '';
    showToast('Signed! Welcome to the pack 🦕');
    if (theme === 'dark') { score += 50; updateScore(); }
    await loadGuestbook();
  } catch(e) {
  showToast('Error: ' + e.message + ' | URL: ' + apiUrl('/guestbook'));
  }
}

/* ═══ HTML ESCAPE ═══ */
// FIXED: Properly escapes HTML entities to prevent formatting issues
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ═══ KEYBOARD SHORTCUT (dark mode: hero dino jump) ═══ */
document.addEventListener('keydown', function(e) {
  if ((e.code === 'Space' || e.code === 'ArrowUp') && theme === 'dark') {
    const lock = document.getElementById('gameLock');
    if (lock && lock.style.display !== 'none' && lock.offsetParent !== null) return;
    dinoJump();
  }
});

/* ═══ POEM ACCORDION ═══ */
window.togglePoem = function (idx) {
  const item = document.getElementById('poem-' + idx);
  if (!item) return;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.poem-item').forEach(p => p.classList.remove('open'));
  if (!isOpen) {
    item.classList.add('open');
    setTimeout(() => item.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  }
};

/* ═══ CATEGORIES ═══ */
function showCat(key) {
  // Render the panel content from about-data.js on first open
  renderCatPanel(key);
  const panel = document.getElementById('cat-' + key);
  const btn   = [...document.querySelectorAll('.cat-btn')].find(b => b.getAttribute('onclick') === `showCat('${key}')`);
  const isOpen = panel && panel.classList.contains('visible');
  
  document.querySelectorAll('.cat-panel').forEach(p => p.classList.remove('visible'));
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  
  if (!isOpen && panel) {
    panel.classList.add('visible');
    if (btn) btn.classList.add('active');
    setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  }
  
  if (theme === 'dark') { score += 5; updateScore(); }
}

/* ═══ INIT ═══ */
applyTheme(theme);
renderPoems();    // from poems.js
loadMystery();
loadIdentity();
loadGuestbook();
