import { memory } from "wasm-game-of-life/wasm_game_of_life_bg";
import { importUniverseWasm, importUniverseJs } from "./importUniverse";
import { createUniverseWasm, createUniverseJs } from "./createUniverse";
import { checkCellWasm, checkCellJs } from "./checkCell";
import { compareUniverseWasm, compareUniverseJs, reassignUniverseWasm, reassignUniverseJs } from "./compareUniverse";
import { glider, pulsar } from "./patterns"
import { changeQueryParams, resizeCanvas } from "./utils"
import { fps } from "./fps";

const playPauseButton = document.getElementById("play-pause");
const ticksSlider = document.getElementById("ticks-frequency");
const resetRandomButton = document.getElementById("reset-universe-random");
const resetBlankButton = document.getElementById("reset-universe-dead");
const nextFrameButton = document.getElementById("next-frame");
const generationsCounter = document.getElementById("generations-counter");
const heightInput = document.getElementById("height");
const widthInput = document.getElementById("width");
const cellSizeSelector = document.getElementById("cell-size");
const panelButton = document.getElementById("panelBtn");
const panel = document.getElementById("panel");
const logo = document.querySelector("img");
const loopBtn = document.getElementById("loop");
const loopPanel = document.getElementById("loopPanel");
const loopGenerationToggle = document.getElementById("loopGenerationToggle");
const loopTimeToggle = document.getElementById("loopTimeToggle");
const loopOnDeathToggle = document.getElementById("loopOnDeathToggle");

const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

const colors = [
  [ALIVE_COLOR, true],
  [DEAD_COLOR, false],
];

const logoWasmPath = "https://upload.wikimedia.org/wikipedia/commons/1/1f/WebAssembly_Logo.svg";
const logoJsPath = "https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png";

const query = new URLSearchParams(window.location.search);
let language = query.get('lang');
let height = query.get('height');
let width = query.get('width');
let cellSize = Number(query.get('cell_size')); //px
let loop = query.get('loop');
let loopAfterGenerationCount = query.get('loopGeneration');
let loopAfterTime = query.get('loopTime');
let loopIfDead = query.get('loopDeath');

language = language || 'WASM';
height = height || 100;
width = width || 100;
cellSize = cellSize || 9;
loop = loop || false;
loopAfterGenerationCount = loopAfterGenerationCount || false;
loopAfterTime = loopAfterTime || false;
loopIfDead = loopIfDead || false;
let generationsLoopPoint = 5000;
let timeLoopPoint = 60000;
let startTime = performance.now();
let timeElapsed;
let pastUniverse = [];
let generationsThreshold = 1000;

const assignByLanguage = (wasmValue, jsValue) => language === 'JS' ? jsValue : wasmValue;

let importUniverse = assignByLanguage(importUniverseWasm, importUniverseJs);
let createUniverse = assignByLanguage(createUniverseWasm, createUniverseJs);
let checkCell = assignByLanguage(checkCellWasm, checkCellJs);
let compareUniverse = assignByLanguage(compareUniverseWasm, compareUniverseJs);
let reassignUniverse = assignByLanguage(reassignUniverseWasm, reassignUniverseJs);
logo.setAttribute('src', assignByLanguage(logoWasmPath, logoJsPath));

heightInput.value = height;
widthInput.value = width;
cellSizeSelector.value = cellSize;

loopBtn.textContent = loop ? "Disable loop" : "Enable loop";
loopGenerationToggle.checked = loopAfterGenerationCount;
loopTimeToggle.checked = loopAfterTime;
loopOnDeathToggle.checked = loopIfDead;

// Construct the universe, get its width and height.
let universe = createUniverse(false, width, height);

// Give the canvas room for all of our cells and a 1px border
// around each of them.
const canvas = document.getElementById("game-of-life-canvas");
canvas.height = (cellSize + 1) * height + 1;
canvas.width = (cellSize + 1) * width + 1;

const ctx = canvas.getContext('2d');

let animationId = null;
let ticksFrequency = 1;
let generationsCount = 0;
console.time('1000th generation');



function updateGenerationsCount(step) {
  generationsCount += Number(step);
  generationsCounter.textContent = `Generation ${generationsCount}`
}

const universeIsDead = () => {
  if (generationsCount > generationsThreshold && generationsCount % 6 === 0) {
    const presentUniverse = importUniverse(universe, memory, width, height);
    if (compareUniverse(pastUniverse, presentUniverse)) {
      return true;
    } else {
      pastUniverse = reassignUniverse(presentUniverse);
      return false;
    }
  } else {
    return false;
  }
}

const loopShouldReset = () => {
  return (
    loop && 
    (loopAfterGenerationCount && generationsCount >= generationsLoopPoint) || 
    (loopAfterTime && timeElapsed >= timeLoopPoint) ||
    (loopIfDead && universeIsDead())
  );
}

const resetTimer = () => {
  console.timeEnd('1000th generation');
  console.time('1000th generation');
}

const resetGenerationsCount = () => {
  generationsCount = 0;
  updateGenerationsCount(0);
}

const resetTimerAndGenerations = () => {
  resetTimer();
  resetGenerationsCount();
}

nextFrameButton.addEventListener("click", event => {
  if (isPaused()) {
    drawGrid();
    drawCells();
    universe.tick();
    updateGenerationsCount(1);
  }
})

resetRandomButton.addEventListener("click", event => {
  universe = createUniverse(false, width, height);
  resetTimerAndGenerations();
  drawCells();
})

resetBlankButton.addEventListener("click", event => {
  if (!isPaused()) {
    pause();
  }
  universe = createUniverse(true, width, height);
  resetTimerAndGenerations();
  drawCells();
})

ticksSlider.addEventListener("change", event => {
  ticksFrequency = event.target.value;
});

function play() {
  playPauseButton.textContent = "⏸";
  renderLoop();
}

function pause() {
  playPauseButton.textContent = "▶";
  cancelAnimationFrame(animationId);
  animationId = null;
}

playPauseButton.addEventListener("click", event => {
  if (isPaused()) {
    play();
  } else {
    pause();
  }
});


heightInput.addEventListener("change", event => {
  height = Number(event.target.value);
  changeQueryParams('height', height);
  universe = createUniverse(false, width, height);
  resetTimerAndGenerations();
  resizeCanvas(canvas, height, width, cellSize);
  drawCells();
})

widthInput.addEventListener("change", event => {
  width = Number(event.target.value);
  changeQueryParams('width', width);
  universe = createUniverse(false, width, height);
  resetTimerAndGenerations();
  resizeCanvas(canvas, height, width, cellSize);
  drawCells();
})

cellSizeSelector.addEventListener("change", event => {
  cellSize = Number(event.target.value)
  changeQueryParams('cell_size', cellSize);
  resizeCanvas(canvas, height, width, cellSize);
  drawCells();
})

panelButton.addEventListener('click', event => {
  panel.classList.toggle("open");
})

logo.addEventListener('click', event => {
  language = language === 'WASM' ? 'JS' : 'WASM';
  changeQueryParams('lang', language);
  importUniverse = assignByLanguage(importUniverseWasm, importUniverseJs);
  createUniverse = assignByLanguage(createUniverseWasm, createUniverseJs);
  checkCell = assignByLanguage(checkCellWasm, checkCellJs);
  compareUniverse = assignByLanguage(compareUniverseWasm, compareUniverseJs);
  reassignUniverse = assignByLanguage(reassignUniverseWasm, reassignUniverseJs);
  logo.setAttribute('src', assignByLanguage(logoWasmPath, logoJsPath));


  universe = createUniverse(false, width, height);
  resetTimerAndGenerations();
  drawCells();
})

loopBtn.addEventListener('click', event => {
  loop = !loop;
  changeQueryParams('loop', loop);
  loopBtn.textContent = loop ? "Disable loop" : "Enable loop";
  loopPanel.classList.toggle("hidden");
})

loopGenerationToggle.addEventListener('click', event => {
  loopAfterGenerationCount = !loopAfterGenerationCount;
  changeQueryParams('loopGeneration', loopAfterGenerationCount);
})

loopTimeToggle.addEventListener('click', event => {
  loopAfterTime = !loopAfterTime;
  changeQueryParams('loopTime', loopAfterTime);
})

loopOnDeathToggle.addEventListener('click', event => {
  loopIfDead = !loopIfDead;
  changeQueryParams('loopDeath', loopIfDead);
})

canvas.addEventListener("click", event => {
  const boundingRect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / boundingRect.width;
  const scaleY = canvas.height / boundingRect.height;

  const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
  const canvasTop = (event.clientY - boundingRect.top) * scaleY;

  const row = Math.min(Math.floor(canvasTop / (cellSize + 1)), height - 1);
  const col = Math.min(Math.floor(canvasLeft / (cellSize + 1)), width - 1);

  if (event.ctrlKey === false && event.shiftKey === false) {
    universe.toggle_cell(row, col);
  } else if (event.ctrlKey === true && event.shiftKey === false) {
    drawPattern(glider, row, col);
  } else if (event.ctrlKey === false && event.shiftKey === true) {
    drawPattern(pulsar, row, col);
  }

  drawGrid();
  drawCells();
});

const drawPattern = (pattern, row, col) => {
  for (const [deltaX, deltaY] of pattern) {
    universe.toggle_cell(row + deltaX, col + deltaY);
  }
}

function renderLoop() {
  timeElapsed = performance.now() - startTime;

  if (loopShouldReset()) {
    universe = createUniverse(false, width, height);
    startTime = performance.now();
    resetTimerAndGenerations();
    drawCells();
  }

  fps.render();
  updateGenerationsCount(ticksFrequency);

  drawGrid();
  drawCells();

  for (let i = 0; i < ticksFrequency; i++) {
    universe.tick();
  }

  if (generationsCount === 1000) {
    console.timeEnd('1000th generation');
  }

  animationId = requestAnimationFrame(renderLoop);
}

function isPaused() {
  return animationId === null;
};

function drawGrid() {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  // Vertical lines.
  for (let i = 0; i <= width; i++) {
    ctx.moveTo(i * (cellSize + 1) + 1, 0);
    ctx.lineTo(i * (cellSize + 1) + 1, (cellSize + 1) * height + 1);
  }

  // Vertical lines.
  for (let j = 0; j <= height; j++) {
    ctx.moveTo(0,                           j * (cellSize + 1) + 1);
    ctx.lineTo((cellSize + 1) * width + 1, j * (cellSize + 1) + 1);
  }

  ctx.stroke();
}

function getIndex(row, column) {
  return row * width + column;
};

function drawCells() {
  const cells = importUniverse(universe, memory, width, height);

  ctx.beginPath();

  for (const [color, continueCondition] of colors) {
    ctx.fillStyle = color;
    fillCells(cells, continueCondition);
  } 
  
  ctx.stroke();
}

const fillCells = (cells, state) => {
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col);
      if (checkCell(cells[idx]) === state) {
        continue;
      }

      ctx.fillRect(
        col * (cellSize + 1) + 1,
        row * (cellSize + 1) + 1,
        cellSize,
        cellSize
      );
    }
  }
}



play();

