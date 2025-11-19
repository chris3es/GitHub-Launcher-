// script.js
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d', { alpha: false });

const scoreEl = document.getElementById('score');
const bestEl  = document.getElementById('best');
const livesEl = document.getElementById('lives');

const btnPause = document.getElementById('btn-pause');
const btnRestart = document.getElementById('btn-restart');

const W = canvas.width, H = canvas.height;

const keys = new Set();
addEventListener('keydown', e => {
  keys.add(e.key.toLowerCase());
  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) e.preventDefault();
});
addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const rand  = (a, b) => a + Math.random() * (b - a);

const state = {
  running: true,
  score: 0,
  best: +(localStorage.getItem('pd.best') || 0),
  lives: 3,
  t: 0,
  difficulty: 1,
  player: { x: W/2, y: H-40, w: 22, h: 22, speed: 210 },
  hazards: [],
  spawnTimer: 0,
};
bestEl.textContent = state.best.toFixed(1);

function reset(full=false) {
  state.score = 0;
  state.t = 0;
  state.difficulty = 1;
  state.player.x = W/2;
  state.player.y = H - 40;
  state.hazards.length = 0;
  state.spawnTimer = 0;
  if (full) { state.lives = 3; }
  livesEl.textContent = state.lives;
}
function togglePause() {
  state.running = !state.running;
  btnPause.setAttribute('aria-pressed', String(!state.running));
  btnPause.textContent = state.running ? 'Pause' : 'Resume';
}

addEventListener('keypress', e => {
  const k = e.key.toLowerCase();
  if (k === 'p') togglePause();
  if (k === 'r') { reset(true); state.running = true; btnPause.setAttribute('aria-pressed', 'false'); btnPause.textContent = 'Pause'; }
});
btnPause.addEventListener('click', togglePause);
btnRestart.addEventListener('click', () => { reset(true); state.running = true; btnPause.setAttribute('aria-pressed', 'false'); btnPause.textContent = 'Pause'; });

function spawnHazard() {
  const size = rand(10, 28);
  const x = rand(size, W - size);
  const speed = rand(80, 180) * (0.7 + state.difficulty * 0.3);
  const type = Math.random() < 0.15 ? 'zig' : 'fall';
  const color = type === 'zig' ? '#ff8c69' : '#5aa9ff';
  state.hazards.push({ x, y: -size, w: size, h: size, vy: speed, vx: (type==='zig'? rand(-60,60):0), type, color });
}

function update(dt) {
  state.t += dt;
  state.difficulty = 1 + state.t * 0.08;

  // player input
  const p = state.player;
  const left  = keys.has('a') || keys.has('arrowleft');
  const right = keys.has('d') || keys.has('arrowright');
  const up    = keys.has('w') || keys.has('arrowup');
  const down  = keys.has('s') || keys.has('arrowdown');

  p.x += (right - left) * p.speed * dt;
  p.y += (down - up)     * p.speed * dt;
  p.x = clamp(p.x, p.w/2, W - p.w/2);
  p.y = clamp(p.y, p.h/2, H - p.h/2);

  // spawn timing
  state.spawnTimer -= dt;
  const spawnRate = clamp(0.9 - state.t * 0.03, 0.18, 0.9); // seconds
  if (state.spawnTimer <= 0) {
    spawnHazard();
    state.spawnTimer = spawnRate;
  }

  // hazards movement
  for (const h of state.hazards) {
    h.y += h.vy * dt;
    h.x += h.vx * dt;
    if (h.type === 'zig') h.vx += Math.sin(state.t * 2.2) * 8 * dt;
  }
  // remove off-screen
  for (let i = state.hazards.length - 1; i >= 0; i--) {
    if (state.hazards[i].y - state.hazards[i].h > H) state.hazards.splice(i, 1);
  }

  // collisions
  for (let i = state.hazards.length - 1; i >= 0; i--) {
    const h = state.hazards[i];
    if (Math.abs(p.x - h.x) < (p.w/2 + h.w/2) && Math.abs(p.y - h.y) < (p.h/2 + h.h/2)) {
      state.hazards.splice(i, 1);
      state.lives--;
      livesEl.textContent = state.lives;
      if (state.lives <= 0) { gameOver(); break; }
    }
  }

  // scoring
  state.score += dt * 10 * Math.sqrt(state.difficulty);
  scoreEl.textContent = state.score.toFixed(1);
}

function gameOver() {
  state.running = false;
  state.best = Math.max(state.best, state.score);
  localStorage.setItem('pd.best', state.best.toFixed(1));
  bestEl.textContent = state.best.toFixed(1);
}

function render() {
  // background
  ctx.fillStyle = '#0f1117';
  ctx.fillRect(0, 0, W, H);

  // grid flair
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 32) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y = 0; y < H; y += 32) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // player
  const p = state.player;
  ctx.fillStyle = '#79c0ff';
  ctx.fillRect(p.x - p.w/2, p.y - p.h/2, p.w, p.h);

  // hazards
  for (const h of state.hazards) {
    ctx.fillStyle = h.color;
    ctx.fillRect(h.x - h.w/2, h.y - h.h/2, h.w, h.h);
  }

  // UI overlays
  if (!state.running) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0,0,W,H);
    ctx.fillStyle = '#c9d1d9';
    ctx.textAlign = 'center';
    ctx.font = 'bold 24px system-ui';
    ctx.fillText('Game Over', W/2, H/2 - 20);
    ctx.font = '14px system-ui';
    ctx.fillText(`Score: ${state.score.toFixed(1)}   Best: ${state.best.toFixed(1)}`, W/2, H/2 + 10);
    ctx.fillText('Press R or click Restart', W/2, H/2 + 36);
  }
}

// fixed timestep update, rAF render
let acc = 0, last = performance.now(), step = 1/120;
function loop(now) {
  const dt = Math.min(0.25, (now - last) / 1000);
  last = now;
  if (state.running) acc += dt;
  while (acc >= step) { update(step); acc -= step; }
  render();
  requestAnimationFrame(loop);
}
reset(true);
requestAnimationFrame(loop);
