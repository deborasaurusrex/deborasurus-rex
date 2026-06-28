/*
 * music.js — AMBIENT BACKGROUND MUSIC ENGINE
 * ═════════════════════════════════════════════
 * Procedural music via Web Audio API.
 * You generally don't need to touch this file.
 * To change the tempo: edit BEAT (seconds per note).
 * To change the vibe: edit PATS (note index patterns).
 */

/* ═══ AMBIENT MUSIC ═══ */
(function () {
  let actx = null, master = null, reverbIn = null;
  let playing = false, armed = false;
  let melodyTimer = null, patIdx = 0, noteIdx = 0;
  let padOscs = [];

  // C pentatonic major, three octaves
  const FREQ = [65.41, 98.00, 130.81,164.81,196.00,220.00,261.63,
                293.66,329.63,392.00,440.00,523.25,587.33,659.25,784.00,880.00];

  // Upbeat jumpy patterns — big leaps, ascending runs, bouncy rhythms
  const PATS = [
    [6,11,7,12,8,13,9,13,8,11,6,9],   // big upward leaps
    [6,9,6,11,6,13,11,9,6,4,6,9],     // repeated root with jumps
    [4,9,6,11,9,13,11,9,6,4,6,11],    // wide interval hops
    [9,13,11,14,13,11,9,6,9,11,13,15],// high register run
    [6,7,9,11,13,11,9,7,6,4,6,9],     // fast ascending scale + drop
    [4,11,6,13,9,15,11,13,9,11,6,9],  // wild jumps
    [9,6,11,7,13,9,11,6,9,4,6,9],     // syncopated leaps
  ];

  function boot() {
    if (actx) return;
    actx  = new (window.AudioContext || window.webkitAudioContext)();
    master = actx.createGain();
    master.gain.value = 0;
    master.connect(actx.destination);

    // Simple feedback-delay reverb
    const delay    = actx.createDelay(0.6);
    const fbGain   = actx.createGain();
    const wetGain  = actx.createGain();
    delay.delayTime.value = 0.18; // shorter delay = tighter, bouncier echo
    fbGain.gain.value     = 0.28;
    wetGain.gain.value    = 0.18;
    delay.connect(fbGain);
    fbGain.connect(delay);
    delay.connect(wetGain);
    wetGain.connect(master);
    reverbIn = delay;
  }

  function makePad() {
    // Soft chord: C + E + G + A spread across two octaves
    [[130.81,0],[164.81,1],[196.00,-1],[220.00,0],[261.63,1]].forEach(([f, detune]) => {
      const osc  = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      osc.detune.value    = detune * 4;
      gain.gain.value     = 0.038;
      osc.connect(gain);
      gain.connect(master);
      osc.start();
      padOscs.push({osc, gain});
    });
  }

  function playNote(freq, dur, t) {
    const osc  = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = 'triangle'; // brighter than sine, less harsh than square
    osc.frequency.value = freq;
    // snappy attack, quick decay = bouncy feel
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.09, t + 0.02);  // fast attack
    gain.gain.setValueAtTime(0.09, t + dur * 0.35);
    gain.gain.linearRampToValueAtTime(0, t + dur * 0.85);
    osc.connect(gain);
    gain.connect(master);
    gain.connect(reverbIn);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  // Rhythmic bass thump on beats
  let bassStep = 0;
  function playBass(t) {
    const osc  = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(130.81, t);
    osc.frequency.exponentialRampToValueAtTime(65.41, t + 0.12);
    gain.gain.setValueAtTime(0.11, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  const BEAT = 0.22; // seconds per note (~270 bpm feel, but swung)
  const BEAT_STEPS = 8; // bass hits every N melody notes

  function tick() {
    if (!playing) return;
    const pat  = PATS[patIdx % PATS.length];
    const freq = FREQ[pat[noteIdx % pat.length]];

    // vary note length: mostly short, occasional held note
    const roll = Math.random();
    const dur  = roll < 0.65 ? BEAT * (0.8 + Math.random() * 0.4)   // short punchy
               : roll < 0.85 ? BEAT * 2                               // held
               :                BEAT * 0.5;                            // quick flick

    playNote(freq, dur, actx.currentTime);

    // bass on every other beat
    if (bassStep % 2 === 0) playBass(actx.currentTime);
    bassStep++;

    noteIdx++;
    if (noteIdx >= pat.length) { noteIdx = 0; patIdx++; }

    melodyTimer = setTimeout(tick, dur * 900); // slight swing feel
  }

  function fadeIn() {
    master.gain.cancelScheduledValues(actx.currentTime);
    master.gain.setValueAtTime(master.gain.value, actx.currentTime);
    master.gain.linearRampToValueAtTime(0.19, actx.currentTime + 1.5);
  }
  function fadeOut() {
    master.gain.cancelScheduledValues(actx.currentTime);
    master.gain.setValueAtTime(master.gain.value, actx.currentTime);
    master.gain.linearRampToValueAtTime(0, actx.currentTime + 2);
  }

  function startMusic() {
    boot();
    if (actx.state === 'suspended') actx.resume();
    if (playing) return;
    playing = true;
    if (padOscs.length === 0) makePad();
    fadeIn();
    tick();
    updateBtn();
  }

  function stopMusic() {
    playing = false;
    clearTimeout(melodyTimer);
    fadeOut();
    updateBtn();
  }

  function updateBtn() {
    const b = document.getElementById('musicBtn');
    if (b) b.textContent = playing ? '🔊' : '🔇';
  }

  window.toggleMusic = function () {
    if (!armed) {
      armed = true;
      startMusic();
    } else {
      playing ? stopMusic() : startMusic();
    }
  };

  // Auto-start softly on the very first user gesture anywhere on the page
  function onGesture() {
    if (armed) return;
    armed = true;
    startMusic();
    document.removeEventListener('click',      onGesture);
    document.removeEventListener('keydown',    onGesture);
    document.removeEventListener('touchstart', onGesture);
  }
  document.addEventListener('click',      onGesture, {once:true});
  document.addEventListener('keydown',    onGesture, {once:true});
  document.addEventListener('touchstart', onGesture, {once:true});
})();
