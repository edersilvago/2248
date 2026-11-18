'use strict';

const SIZE = 7;
const SVG_UNIT = 700; // viewBox do SVG; centro da célula (r,c) = (c+0.5)*100

const boardEl = document.getElementById('board');
const cellsEl = document.getElementById('cells');
const polyEl = document.getElementById('poly');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const overlayEl = document.getElementById('overlay');
const finalScoreEl = document.getElementById('finalScore');
const sumBadgeEl = document.getElementById('sumBadge');

const COLORS = {
  2: ['#eee4da', '#776e65'], 4: ['#ede0c8', '#776e65'],
  8: ['#f2b179', '#fff'], 16: ['#f59563', '#fff'],
  32: ['#f67c5f', '#fff'], 64: ['#f65e3b', '#fff'],
  128: ['#edcf72', '#fff'], 256: ['#edcc61', '#fff'],
  512: ['#edc850', '#fff'], 1024: ['#edc53f', '#fff'],
  2048: ['#edc22e', '#fff'], 4096: ['#5f57a6', '#fff'],
  8192: ['#4a3f8f', '#fff'], 16384: ['#2e2a66', '#fff']
};
const FALLBACK = ['#2e2a66', '#fff'];

let grid = [];
let cellEls = [];
let score = 0;
let best = Number(localStorage.getItem('best2248') || 0);
let chain = [];
let chainSum = 0;
let dragging = false;
let over = false;
let justMerged = false;
let spawned = [];
let padPx = 8;

bestEl.textContent = best;

function randInit() {
  const r = Math.random();
  return r < 0.45 ? 2 : r < 0.8 ? 4 : 8;
}

function neighbors8(r, c) {
  const out = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) out.push([nr, nc]);
    }
  }
  return out;
}

// Regra do 2248: a corrente precisa COMEÇAR com dois blocos iguais. Depois,
// cada novo bloco ligado deve ter o mesmo valor do anterior (repetição) ou o
// dobro dele (subida na escada de potências, sem pular etapas).
// O bloco final vale 2x o maior bloco ligado.
function canExtend(cell) {
  const last = chain[chain.length - 1];
  const lastValue = grid[last.r][last.c];
  const n = grid[cell.r][cell.c];
  if (chain.length < 2) return n === lastValue;
  return n === lastValue || n === lastValue * 2;
}

function adjacent(a, b) {
  return Math.max(Math.abs(a.r - b.r), Math.abs(a.c - b.c)) === 1;
}

function inChain(cell) {
  return chain.some(p => p.r === cell.r && p.c === cell.c);
}

// Só existe jogada se houver dois blocos iguais adjacentes: toda corrente
// válida começa com um par igual.
function hasMove() {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = grid[r][c];
      for (const [nr, nc] of neighbors8(r, c)) {
        if (grid[nr][nc] === v) return true;
      }
    }
  }
  return false;
}

function randSpawnValue() {
  let maxVal = 2;
  for (const row of grid) for (const v of row) if (v > maxVal) maxVal = v;
  const cap = Math.max(2, Math.floor(maxVal / 2));
  const r = Math.random();
  let v = r < 0.5 ? 2 : r < 0.8 ? 4 : r < 0.95 ? 8 : 16;
  while (v > cap && v > 2) v /= 2;
  return v;
}

// Gravidade: blocos caem para o fundo de cada coluna e os espaços que sobram
// no topo recebem números novos.
function gravityAndFill() {
  spawned = [];
  for (let c = 0; c < SIZE; c++) {
    const col = [];
    for (let r = SIZE - 1; r >= 0; r--) {
      if (grid[r][c] !== 0) col.push(grid[r][c]);
    }
    let idx = 0;
    for (let r = SIZE - 1; r >= 0; r--) {
      if (idx < col.length) {
        grid[r][c] = col[idx++];
      } else {
        grid[r][c] = randSpawnValue();
        spawned.push(r * SIZE + c);
      }
    }
  }
}

function doMerge() {
  const last = chain[chain.length - 1];
  const lastValue = grid[last.r][last.c];
  const resultValue = lastValue * 2; // 2x o maior bloco da corrente
  const points = chainSum;           // pontuação = soma dos blocos ligados
  const cleared = [];
  chain.forEach((p, i) => {
    if (i < chain.length - 1) cleared.push(p);
  });
  for (const p of cleared) grid[p.r][p.c] = 0;
  grid[last.r][last.c] = resultValue;
  gravityAndFill();
  score += points;
  if (score > best) {
    best = score;
    localStorage.setItem('best2248', String(best));
    bestEl.textContent = best;
  }
  scoreEl.textContent = score;
  justMerged = true;
  if (!hasMove()) {
    over = true;
    finalScoreEl.textContent = 'Pontuação final: ' + score;
    overlayEl.classList.remove('hidden');
  }
}

function cellFromPoint(x, y) {
  const rect = boardEl.getBoundingClientRect();
  const px = x - rect.left;
  const py = y - rect.top;
  if (px < 0 || py < 0 || px >= rect.width || py >= rect.height) return null;
  const inner = rect.width - padPx * 2;
  const ix = px - padPx, iy = py - padPx;
  if (ix < 0 || iy < 0 || ix >= inner || iy >= inner) return null;
  const c = Math.floor((ix / inner) * SIZE);
  const r = Math.floor((iy / inner) * SIZE);
  return { r, c };
}

// Cria os 49 divs uma única vez; render() só atualiza, sem reconstruir DOM
function buildCells() {
  cellsEl.innerHTML = '';
  cellEls = [];
  const frag = document.createDocumentFragment();
  for (let i = 0; i < SIZE * SIZE; i++) {
    const el = document.createElement('div');
    el.className = 'cell';
    frag.appendChild(el);
    cellEls.push(el);
  }
  cellsEl.appendChild(frag);
}

// Ajusta o tabuleiro ao maior quadrado que cabe na área disponível
function fitBoard() {
  const wrap = document.getElementById('boardWrap');
  const size = Math.max(120, Math.min(wrap.clientWidth, wrap.clientHeight));
  boardEl.style.width = size + 'px';
  boardEl.style.height = size + 'px';
  padPx = Math.max(4, Math.round(size * 0.016));
  boardEl.style.setProperty('--pad', padPx + 'px');
}

function render() {
  fitBoard();
  const inner = boardEl.clientWidth - padPx * 2;
  const base = inner / SIZE;
  const chainSet = new Set(chain.map(p => p.r * SIZE + p.c));
  const last = chain[chain.length - 1];
  const spawnedSet = new Set(spawned);
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const idx = r * SIZE + c;
      const el = cellEls[idx];
      const v = grid[r][c];
      const [bg, fg] = COLORS[v] || FALLBACK;
      const font = v < 100 ? base * 0.42 : v < 1000 ? base * 0.34 : base * 0.27;
      el.textContent = v > 0 ? v : '';
      el.style.background = bg;
      el.style.color = fg;
      el.style.fontSize = font.toFixed(1) + 'px';
      const isTail = last && last.r === r && last.c === c;
      let cls = 'cell';
      if (chainSet.has(idx)) cls += ' chain';
      if (isTail) cls += ' tail';
      if (isTail && justMerged) cls += ' pop';
      if (spawnedSet.has(idx)) cls += ' new';
      el.className = cls;
    }
  }

  if (chain.length > 0) {
    polyEl.setAttribute('points', chain.map(p => `${(p.c + 0.5) * (SVG_UNIT / SIZE)},${(p.r + 0.5) * (SVG_UNIT / SIZE)}`).join(' '));
  } else {
    polyEl.setAttribute('points', '');
  }

  if (chain.length > 1) {
    const lastValue = grid[last.r][last.c];
    sumBadgeEl.textContent = '= ' + (lastValue * 2);
    sumBadgeEl.style.fontSize = (base * 0.34).toFixed(1) + 'px';
    sumBadgeEl.classList.remove('hidden');
  } else {
    sumBadgeEl.classList.add('hidden');
  }

  justMerged = false;
  spawned = [];
}

function newGame() {
  score = 0;
  over = false;
  chain = [];
  chainSum = 0;
  dragging = false;
  scoreEl.textContent = '0';
  overlayEl.classList.add('hidden');
  do {
    grid = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, randInit));
  } while (!hasMove());
  buildCells();
  render();
}

boardEl.addEventListener('pointerdown', e => {
  if (over) return;
  const cell = cellFromPoint(e.clientX, e.clientY);
  if (!cell) return;
  dragging = true;
  chain = [cell];
  chainSum = grid[cell.r][cell.c];
  render();
  boardEl.setPointerCapture(e.pointerId);
});

boardEl.addEventListener('pointermove', e => {
  if (!dragging || over) return;
  const cell = cellFromPoint(e.clientX, e.clientY);
  if (!cell) return;
  const last = chain[chain.length - 1];
  if (cell.r === last.r && cell.c === last.c) return;
  // voltar sobre a célula anterior desfaz o último passo
  const prev = chain[chain.length - 2];
  if (prev && prev.r === cell.r && prev.c === cell.c) {
    chainSum -= grid[last.r][last.c];
    chain.pop();
    render();
    return;
  }
  if (!inChain(cell) && adjacent(last, cell) && canExtend(cell)) {
    chain.push(cell);
    chainSum += grid[cell.r][cell.c];
    render();
  }
});

function endDrag() {
  if (!dragging) return;
  dragging = false;
  if (chain.length >= 2 && !over) doMerge();
  chain = [];
  chainSum = 0;
  render();
}

boardEl.addEventListener('pointerup', endDrag);
boardEl.addEventListener('pointercancel', endDrag);
boardEl.addEventListener('contextmenu', e => e.preventDefault());

// Responsivo: recalcula tamanhos quando a janela muda
window.addEventListener('resize', render);

document.getElementById('restart').addEventListener('click', () => {
  if (confirm('Reiniciar o jogo? A pontuação atual será perdida.')) newGame();
});
document.getElementById('playAgain').addEventListener('click', newGame);

newGame();
