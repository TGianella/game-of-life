import { memory } from "wasm-game-of-life/wasm_game_of_life_bg";
import { importUniverseWasm, importUniverseJs } from "./lang/importUniverse";
import { createUniverseWasm, createUniverseJs } from "./lang/createUniverse";
import { checkCellWasm, checkCellJs } from "./lang/checkCell";
import { compareUniverseWasm, compareUniverseJs, reassignUniverseWasm, reassignUniverseJs } from "./lang/compareUniverse";
import { glider, pulsar } from "./patterns"
import { assignByLanguage, changeQueryParams, drawPattern, resizeCanvas, isPaused } from "./utils/utils";
import { drawCells, drawGrid } from "./utils/draw.utils";
import { updateGenerationsCount, resetTimerAndGenerations } from "./utils/timer.utils";
import { fps } from "./fps";
import { defaultValues, logoUrls } from "./config";
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



let seed = params.seed || defaultValues.seed
let language = params.language || defaultValues.language;
let height = Math.sqrt(seed.length) || params.height || defaultValues.height;
let width = Math.sqrt(seed.length) || params.width || defaultValues.width;
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
logo.setAttribute('src', assignByLanguage(language, logoUrls.wasm, logoUrls.js));

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
  if (isPaused(animationId)) {
    // drawGrid(ctx, width, cellSize, height);
    drawCells(ctx, universe, memory, width, height, cellSize, importUniverse, checkCell);
    universe.tick();
    generationsCount = updateGenerationsCount(generationsCount,1);
  }
}

nextFrameButton.addEventListener("click", (event) => nextFrame());

resetRandomButton.addEventListener("click", event => {
  universe = createUniverse(false, width, height);
  generationsCount = resetTimerAndGenerations();
  drawCells(ctx, universe, memory, width, height, cellSize, importUniverse, checkCell);
})

resetBlankButton.addEventListener("click", event => {
  if (!isPaused(animationId)) {
    pause();
  }
  universe = createUniverse(true, width, height);
  generationsCount = resetTimerAndGenerations();
  drawCells(ctx, universe, memory, width, height, cellSize, importUniverse, checkCell);
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
  if (isPaused(animationId)) {
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

  drawGrid(ctx, width, cellSize, height);
  drawCells(ctx, universe, memory, width, height, cellSize, importUniverse, checkCell);
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
  logo.setAttribute('src', assignByLanguage(language, logoUrls.wasm, logoUrls.js));


  universe = createUniverse(false, width, height);
  generationsCount = resetTimerAndGenerations();
  drawCells(ctx, universe, memory, width, height, cellSize, importUniverse, checkCell);
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

  // drawGrid(ctx, width, cellSize, height);
  drawCells(ctx, universe, memory, width, height, cellSize, importUniverse, checkCell);
});

function renderLoop() {
  timeElapsed = performance.now() - startTime;

  if (loopShouldReset()) {
    universe = createUniverse(false, width, height);
    startTime = performance.now();
    generationsCount = resetTimerAndGenerations();
    drawCells(ctx, universe, memory, width, height, cellSize, importUniverse, checkCell);
  }

  fps.render();
  generationsCount = updateGenerationsCount(generationsCount, ticksFrequency);

  drawCells(ctx, universe, memory, width, height, cellSize, importUniverse, checkCell);

  for (let i = 0; i < ticksFrequency; i++) {
    universe.tick();
  }

  if (generationsCount === 1000) {
    console.timeEnd('1000th generation');
  }

  animationId = requestAnimationFrame(renderLoop);
}

drawGrid(ctx, width, cellSize, height);
play();
