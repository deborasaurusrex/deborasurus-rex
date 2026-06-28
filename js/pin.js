/*
 * pin.js — PIN LOCK FOR POEMS SECTION
 * ══════════════════════════════════════
 * TO CHANGE THE PIN: edit the CORRECT value below.
 * It must be exactly 6 digits (numbers only).
 */

/* ═══ PIN LOCK ═══ */
(function () {
  const CORRECT = '101613';

  function render(val) {
    for (let i = 0; i < 6; i++) {
      const box = document.getElementById('pb' + i);
      if (!box) return;
      box.textContent = i < val.length ? '●' : '';
      box.classList.toggle('filled',  i < val.length);
      box.classList.toggle('active',  i === val.length);
    }
  }

  window.focusPinInput = function () {
    const inp = document.getElementById('pinHidden');
    if (inp) inp.focus();
  };

  window.onPinFocus = function () {
    const boxes = document.getElementById('pinBoxes');
    if (boxes) boxes.classList.add('focused');
  };
  window.onPinBlur = function () {
    const boxes = document.getElementById('pinBoxes');
    if (boxes) boxes.classList.remove('focused');
  };

  window.onPinInput = function () {
    const inp = document.getElementById('pinHidden');
    // keep only digits
    inp.value = inp.value.replace(/\D/g, '').slice(0, 6);
    const val = inp.value;
    render(val);
    document.getElementById('pinError').textContent = '';

    if (val.length === 6) {
      if (val === CORRECT) {
        unlock();
      } else {
        wrong();
      }
    }
  };

  function wrong() {
    const boxes = document.getElementById('pinBoxes');
    boxes.classList.add('shake');
    document.getElementById('pinError').textContent = 'Wrong PIN — try again.';
    setTimeout(() => {
      boxes.classList.remove('shake');
      const inp = document.getElementById('pinHidden');
      inp.value = '';
      render('');
      document.getElementById('pinError').textContent = '';
      inp.focus();
    }, 500);
  }

  function unlock() {
    // brief flash then reveal
    setTimeout(() => {
      document.getElementById('poemPinLock').style.display  = 'none';
      const content = document.getElementById('poemsContent');
      content.style.display = 'block';
      document.getElementById('poemsUnlockBanner').classList.add('show');
      content.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 200);
  }

  // allow typing on keyboard directly when poem card is visible
  document.addEventListener('keydown', function (e) {
    const lock = document.getElementById('poemPinLock');
    if (!lock || lock.style.display === 'none') return;
    if (/^\d$/.test(e.key)) {
      const inp = document.getElementById('pinHidden');
      inp.focus();
    }
  });
})();

/* ── Poem accordion ── */
window.togglePoem = function (idx) {
  const item = document.getElementById('poem-' + idx);
  if (!item) return;
  const isOpen = item.classList.contains('open');
  // close all
  document.querySelectorAll('.poem-item').forEach(p => p.classList.remove('open'));
  if (!isOpen) {
    item.classList.add('open');
    setTimeout(() => item.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  }
};

