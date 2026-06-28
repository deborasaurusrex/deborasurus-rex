/*
 * game.js — CHROME DINO GAME (canvas-based)
 * ════════════════════════════════════════════
 * The game that gates the 'All About Kate' section.
 * To change the unlock score: edit TARGET_SCORE below.
 * You generally don't need to touch anything else.
 */

/* ═══ DINO GAME ═══ */
(function() {
  const UNLOCK_KEY   = 'debo-cat-unlocked';
  const TARGET_SCORE = 1900;
  const CW = 600, CH = 150;
  const GROUND_Y = 118; // bottom of ground line

  let canvas, ctx, gameState, raf;
  let dinoY, dinoVY, onGround, canDoubleJump;
  let obstacles, clouds, gameScore, gameSpeed, frameCount;
  let groundOffset = 0;

  function getColors() {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      bg:       dark ? '#0a0a0a' : '#f5f0e8',
      ground:   dark ? '#888'    : '#b0a090',
      dino:     dark ? '#efefef' : '#3a2e1f',
      obs:      dark ? '#efefef' : '#5a4030',
      cloud:    dark ? '#333'    : '#ddd8cc',
      scoreCol: dark ? '#efefef' : '#7a9e6f',
      win:      dark ? '#fff'    : '#7a9e6f',
    };
  }

  // ── drawing helpers ──────────────────────────────────────
  function drawDino(c, x, y, frame, jumping) {
    c.fillStyle = getColors().dino;
    // body
    c.fillRect(x,     y+14, 20, 18);
    // head
    c.fillRect(x+8,   y,    14, 14);
    // eye (white dot)
    c.fillStyle = getColors().bg;
    c.fillRect(x+17,  y+3,   3,  3);
    c.fillStyle = getColors().dino;
    // tail
    c.fillRect(x-5,   y+18,  7,  7);
    c.fillRect(x-9,   y+22,  5,  5);
    // legs
    if (jumping) {
      c.fillRect(x+3,  y+32,  5, 8);
      c.fillRect(x+12, y+32,  5, 5);
    } else {
      const p = Math.floor(frame/5)%2;
      c.fillRect(x+3,  y+32,  5, p===0?10:5);
      c.fillRect(x+12, y+32,  5, p===0?5:10);
    }
  }

  function drawCactus(c, obs) {
    c.fillStyle = getColors().obs;
    const {x,w,h} = obs;
    const tx = Math.floor(w*.3), tw = Math.floor(w*.4);
    // trunk
    c.fillRect(x+tx, GROUND_Y-h, tw, h);
    // arms
    const ay = GROUND_Y - Math.floor(h*.65);
    c.fillRect(x,    ay,         w,  Math.floor(h*.14));
    c.fillRect(x,    ay-Math.floor(h*.12), Math.floor(w*.35), Math.floor(h*.12));
    c.fillRect(x+Math.floor(w*.65), ay-Math.floor(h*.1), Math.floor(w*.35), Math.floor(h*.1));
  }

  function drawCloud(c, cl) {
    c.fillStyle = getColors().cloud;
    c.fillRect(cl.x,    cl.y+4,  cl.w,       6);
    c.fillRect(cl.x+4,  cl.y,    cl.w-12,    4);
    c.fillRect(cl.x+10, cl.y-4,  cl.w-22,    4);
  }

  function drawGround(c) {
    const col = getColors().ground;
    c.fillStyle = col;
    c.fillRect(0, GROUND_Y, CW, 2);
    // dashes
    c.fillStyle = col;
    for (let i=0; i<CW; i+=20) {
      const dx = ((i - groundOffset % 20) + 20) % 20;
      c.fillRect(dx + i - (groundOffset%20), GROUND_Y+5, 8, 2);
    }
  }

  // ── game loop ────────────────────────────────────────────
  function tick() {
    if (gameState !== 'running') return;
    raf = requestAnimationFrame(tick);
    frameCount++;

    // speed ramp
    gameSpeed = 5 + Math.min(gameScore / 400, 8);
    // score
    gameScore += gameSpeed * 0.13;
    groundOffset += gameSpeed;

    // dino physics
    if (!onGround) {
      dinoVY += 0.7;
      dinoY  += dinoVY;
      if (dinoY >= GROUND_Y - 42) {
        dinoY = GROUND_Y - 42;
        dinoVY = 0;
        onGround = true;
        canDoubleJump = true;
      }
    }

    // spawn obstacles
    if (frameCount > 60) { // grace period
      const spawnInterval = Math.max(55, 100 - gameScore/25);
      if (frameCount % Math.floor(spawnInterval) === 0) spawnObs();
    }

    // move obstacles
    for (let i = obstacles.length-1; i >= 0; i--) {
      obstacles[i].x -= gameSpeed;
      if (obstacles[i].x + obstacles[i].w < 0) obstacles.splice(i,1);
    }

    // spawn / move clouds
    if (frameCount % 80 === 0) clouds.push({x:CW, y:20+Math.random()*30, w:50+Math.random()*30});
    for (let i=clouds.length-1;i>=0;i--) {
      clouds[i].x -= gameSpeed*0.3;
      if (clouds[i].x+80 < 0) clouds.splice(i,1);
    }

    // collision
    const dx=60, dw=18, dh=40;
    for (const obs of obstacles) {
      if (dx+dw-4 > obs.x+2 && dx+4 < obs.x+obs.w-2 &&
          dinoY+dh-4 > GROUND_Y-obs.h && dinoY+4 < GROUND_Y) {
        gameOver(); return;
      }
    }

    // win
    if (gameScore >= TARGET_SCORE) { winGame(); return; }

    draw();
    updateProgress();
  }

  function spawnObs() {
    const types = [
      {w:16,h:35}, {w:16,h:48}, {w:24,h:35},
    ];
    const t = types[Math.floor(Math.random()*types.length)];
    obstacles.push({x:CW+10, w:t.w, h:t.h});
    // sometimes spawn a second close one
    if (gameScore > 600 && Math.random()<0.35) {
      const t2 = types[Math.floor(Math.random()*types.length)];
      obstacles.push({x:CW+10+t.w+14+Math.random()*20, w:t2.w, h:t2.h});
    }
  }

  function draw() {
    const c = ctx;
    const col = getColors();
    c.clearRect(0,0,CW,CH);
    c.fillStyle = col.bg;
    c.fillRect(0,0,CW,CH);

    clouds.forEach(cl => drawCloud(c, cl));
    drawGround(c);
    obstacles.forEach(obs => drawCactus(c, obs));
    drawDino(c, 60, dinoY, frameCount, !onGround);

    // score
    c.fillStyle = col.scoreCol;
    c.font = '11px "Press Start 2P", monospace';
    c.textAlign = 'right';
    c.fillText(Math.floor(gameScore).toString().padStart(5,'0'), CW-8, 20);
    c.textAlign = 'left';
  }

  function gameOver() {
    gameState = 'over';
    cancelAnimationFrame(raf);
    const overlay = document.getElementById('gameOverlay');
    document.getElementById('overlayScore').textContent =
      'SCORE: ' + Math.floor(gameScore) + ' / ' + TARGET_SCORE;
    overlay.classList.remove('hidden');
    draw();
  }

  function winGame() {
    gameState = 'won';
    cancelAnimationFrame(raf);
    draw();
    // final frame — draw "YOU WIN" on canvas
    ctx.fillStyle = getColors().win;
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('YOU DID IT!', CW/2, CH/2 - 10);
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText('UNLOCKING...', CW/2, CH/2 + 10);
    ctx.textAlign = 'left';

    setTimeout(unlockSection, 1200);
  }

  function updateProgress() {
    const pct = Math.min(gameScore / TARGET_SCORE * 100, 100);
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('progressScore').textContent = Math.floor(gameScore) + ' pts';
  }

  // ── public: restart ──────────────────────────────────────
  window.restartGame = function() {
    document.getElementById('gameOverlay').classList.add('hidden');
    initGame();
  };

  function jump() {
    if (gameState === 'idle') { startGame(); return; }
    if (gameState !== 'running') return;
    if (onGround) {
      dinoVY = -13;
      onGround = false;
      canDoubleJump = true;
    } else if (canDoubleJump) {
      dinoVY = -11;
      canDoubleJump = false;
    }
  }

  function initGame() {
    dinoY = GROUND_Y - 42;
    dinoVY = 0;
    onGround = true;
    canDoubleJump = true;
    obstacles = [];
    clouds = [];
    gameScore = 0;
    gameSpeed = 5;
    frameCount = 0;
    groundOffset = 0;
    gameState = 'idle';

    drawIdleScreen();
    updateProgress();
  }

  function startGame() {
    gameState = 'running';
    raf = requestAnimationFrame(tick);
  }

  function drawIdleScreen() {
    const c = ctx, col = getColors();
    c.fillStyle = col.bg;
    c.fillRect(0,0,CW,CH);
    drawGround(c);
    drawDino(c, 60, GROUND_Y-42, 0, false);
    c.fillStyle = col.scoreCol;
    c.font = '9px "Press Start 2P", monospace';
    c.textAlign = 'center';
    c.fillText('PRESS SPACE OR TAP TO START', CW/2, CH/2 - 10);
    c.textAlign = 'left';
  }

  // ── unlock ───────────────────────────────────────────────
  function unlockSection() {
    document.getElementById('gameLock').style.display = 'none';
    const wrap = document.getElementById('catUnlocked');
    wrap.style.display = 'block';
    document.getElementById('unlockBanner').classList.add('show');
    wrap.scrollIntoView({behavior:'smooth', block:'nearest'});
  }

  // ── init on DOM ready ────────────────────────────────────
  function setup() {
    canvas = document.getElementById('dinoCanvas');
    ctx    = canvas.getContext('2d');

    // input
    document.addEventListener('keydown', e => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault(); jump();
      }
    });
    document.getElementById('gameWrap').addEventListener('click', jump);
    document.getElementById('jumpBtn').addEventListener('click',  e => { e.stopPropagation(); jump(); });

    // re-draw on theme change (handled by polling)
    let lastTheme = document.documentElement.getAttribute('data-theme');
    setInterval(() => {
      const t = document.documentElement.getAttribute('data-theme');
      if (t !== lastTheme) { lastTheme = t; if (gameState==='idle') drawIdleScreen(); }
    }, 300);

    initGame();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
})();
