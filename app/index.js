import { memory } from "wasm-game-of-life/wasm_game_of_life_bg";
import { importUniverseWasm, importUniverseJs } from "./lang/importUniverse";
import { createUniverseWasm, createUniverseJs } from "./lang/createUniverse";
import { checkCellWasm, checkCellJs } from "./lang/checkCell";
import { compareUniverseWasm, compareUniverseJs, reassignUniverseWasm, reassignUniverseJs } from "./lang/compareUniverse";
import { glider, pulsar } from "./patterns"
import { assignByLanguage, changeQueryParams, drawPattern, resizeCanvas } from "./utils";
import { updateGenerationsCount, resetTimerAndGenerations } from "./timer.utils";
import { fps } from "./fps";
import { defaultValues } from "./config";
import { params } from "./paramsInit";

import {
  playPauseButton,
  ticksSlider,
  resetRandomButton,
  resetBlankButton,
  nextFrameButton,
  heightInput,
  widthInput,
  cellSizeSelector,
  panelButton,
  panel,
  logo,
  loopBtn,
  loopPanel,
  loopGenerationToggle,
  loopTimeToggle,
  loopOnDeathToggle
} from "./documentSelectors";

const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

const colors = [
  [ALIVE_COLOR, true],
  [DEAD_COLOR, false],
];

const logoWasmPath = "https://upload.wikimedia.org/wikipedia/commons/1/1f/WebAssembly_Logo.svg";
const logoJsPath = "https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png";

let language = params.language || defaultValues.language;
let height = params.height || defaultValues.height;
let width = params.width || defaultValues.width;
let cellSize = params.cellSize || defaultValues.cellSize; //px
let loop = params.loop || defaultValues.loop;
let loopAfterGenerationCount = params.loopAfterGenerationCount || defaultValues.loopAfterGenerationCount;
let loopAfterTime = params.loopAfterTime || defaultValues.loopAfterTime;
let loopIfDead = params.loopIfDead || defaultValues.loopIfDead;
let generationsLoopPoint = defaultValues.generationsLoopPoint;
let timeLoopPoint = defaultValues.timeLoopPoint;
let generationsThreshold = defaultValues.generationsThreshold;
let startTime = performance.now();
let timeElapsed;
let pastUniverse = [];

let importUniverse = assignByLanguage(language, importUniverseWasm, importUniverseJs);
let createUniverse = assignByLanguage(language, createUniverseWasm, createUniverseJs);
let checkCell = assignByLanguage(language, checkCellWasm, checkCellJs);
let compareUniverse = assignByLanguage(language, compareUniverseWasm, compareUniverseJs);
let reassignUniverse = assignByLanguage(language, reassignUniverseWasm, reassignUniverseJs);
logo.setAttribute('src', assignByLanguage(language, logoWasmPath, logoJsPath));

heightInput.value = height;
widthInput.value = width;
cellSizeSelector.value = cellSize;

if (loop) {
  loopPanel.classList.toggle('hidden');
}

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

const nextFrame = () => {
  if (isPaused()) {
    drawGrid();
    drawCells();
    universe.tick();
    generationsCount = updateGenerationsCount(generationsCount,1);
  }
}

nextFrameButton.addEventListener("click", (event) => nextFrame());

resetRandomButton.addEventListener("click", event => {
  universe = createUniverse(false, width, height);
  generationsCount = resetTimerAndGenerations();
  drawCells();
})

resetBlankButton.addEventListener("click", event => {
  if (!isPaused()) {
    pause();
  }
  universe = createUniverse(true, width, height);
  generationsCount = resetTimerAndGenerations();
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

const modifyBoard = (label, value, resize) => {
  switch (label) {
    case 'height':
      height = value;
      break;
    case 'width':
      width = value;
      break;
    case 'cellSize':
      cellSize = Number(value);
      break;
  }
  changeQueryParams(label, value)
  resizeCanvas(canvas, height, width, cellSize);

  if (resize) {
    universe = createUniverse(false, width, height);
    generationsCount = resetTimerAndGenerations();
  }

  drawCells();
}

heightInput.addEventListener("change", event => modifyBoard('height', event.target.value, true))

widthInput.addEventListener("change", event => modifyBoard('width', event.target.value, true))

cellSizeSelector.addEventListener("change", event => modifyBoard('cellSize', event.target.value, false))

panelButton.addEventListener('click', event => {
  panel.classList.toggle("open");
})

logo.addEventListener('click', event => {
  language = language === 'WASM' ? 'JS' : 'WASM';
  changeQueryParams('lang', language);
  importUniverse = assignByLanguage(language, importUniverseWasm, importUniverseJs);
  createUniverse = assignByLanguage(language, createUniverseWasm, createUniverseJs);
  checkCell = assignByLanguage(language, checkCellWasm, checkCellJs);
  compareUniverse = assignByLanguage(language, compareUniverseWasm, compareUniverseJs);
  reassignUniverse = assignByLanguage(language, reassignUniverseWasm, reassignUniverseJs);
  logo.setAttribute('src', assignByLanguage(language, logoWasmPath, logoJsPath));


  universe = createUniverse(false, width, height);
  generationsCount = resetTimerAndGenerations();
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
    drawPattern(universe, glider, row, col);
  } else if (event.ctrlKey === false && event.shiftKey === true) {
    drawPattern(universe, pulsar, row, col);
  }

  drawGrid();
  drawCells();
});

function renderLoop() {
  timeElapsed = performance.now() - startTime;

  if (loopShouldReset()) {
    universe = createUniverse(false, width, height);
    startTime = performance.now();
    generationsCount = resetTimerAndGenerations();
    drawCells();
  }

  fps.render();
  generationsCount = updateGenerationsCount(generationsCount, ticksFrequency);

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
