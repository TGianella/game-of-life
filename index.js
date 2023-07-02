import { Universe, Cell } from "wasm-game-of-life";
import { memory } from "./pkg/wasm_game_of_life_bg";

const CELL_SIZE = 5; // px
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

// Construct the universe, get its width and height.
let universe = Universe.new(false);
const width = universe.width();
const height = universe.height();

// Give the canvas room for all of our cells and a 1px border
// around each of them.
const canvas = document.getElementById("game-of-life-canvas");
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;

const ctx = canvas.getContext('2d');

const playPauseButton = document.getElementById("play-pause");
const ticksSlider = document.getElementById("ticks-frequency");
const resetRandomButton = document.getElementById("reset-universe-random");
const resetBlankButton = document.getElementById("reset-universe-dead");
const nextFrameButton = document.getElementById("next-frame");
const generationsCounter = document.getElementById("generations-counter");

let animationId = null;
let ticksFrequency = 1;
let generationsCount = 0;

function updateGenerationsCount(step) {
  generationsCount += Number(step);
  generationsCounter.textContent = `Generations = ${generationsCount}`
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
  universe = Universe.new(false);
  generationsCount = 0;
  updateGenerationsCount(0);
  drawCells();
})

resetBlankButton.addEventListener("click", event => {
  if (!isPaused()) {
    pause();
  }
  universe = Universe.new(true);
  generationsCount = 0;
  updateGenerationsCount(0);
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

canvas.addEventListener("click", event => {
  const boundingRect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / boundingRect.width;
  const scaleY = canvas.height / boundingRect.height;

  const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
  const canvasTop = (event.clientY - boundingRect.top) * scaleY;

  const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);
  const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);

  if (event.ctrlKey === false && event.shiftKey === false) {
    universe.toggle_cell(row, col);
  } else if (event.ctrlKey === true && event.shiftKey === false) {
    universe.toggle_cell(row, col - 1);
    universe.toggle_cell(row - 1, col);
    universe.toggle_cell(row - 1, col + 1);
    universe.toggle_cell(row, col + 1);
    universe.toggle_cell(row + 1, col + 1);
  } else if (event.ctrlKey === false && event.shiftKey === true) {
    universe.toggle_cell(row + 6, col - 4);
    universe.toggle_cell(row + 6, col - 3);
    universe.toggle_cell(row + 6, col - 2);
    universe.toggle_cell(row + 6, col + 2);
    universe.toggle_cell(row + 6, col + 3);
    universe.toggle_cell(row + 6, col + 4);

    universe.toggle_cell(row + 4, col - 6);
    universe.toggle_cell(row + 4, col - 1);
    universe.toggle_cell(row + 4, col + 1);
    universe.toggle_cell(row + 4, col + 6);

    universe.toggle_cell(row + 3, col - 6);
    universe.toggle_cell(row + 3, col - 1);
    universe.toggle_cell(row + 3, col + 1);
    universe.toggle_cell(row + 3, col + 6);

    universe.toggle_cell(row + 2, col - 6);
    universe.toggle_cell(row + 2, col - 1);
    universe.toggle_cell(row + 2, col + 1);
    universe.toggle_cell(row + 2, col + 6);

    universe.toggle_cell(row + 1, col - 4);
    universe.toggle_cell(row + 1, col - 3);
    universe.toggle_cell(row + 1, col - 2);
    universe.toggle_cell(row + 1, col + 2);
    universe.toggle_cell(row + 1, col + 3);
    universe.toggle_cell(row + 1, col + 4);

    universe.toggle_cell(row - 6, col - 4);
    universe.toggle_cell(row - 6, col - 3);
    universe.toggle_cell(row - 6, col - 2);
    universe.toggle_cell(row - 6, col + 2);
    universe.toggle_cell(row - 6, col + 3);
    universe.toggle_cell(row - 6, col + 4);

    universe.toggle_cell(row - 4, col - 6);
    universe.toggle_cell(row - 4, col - 1);
    universe.toggle_cell(row - 4, col + 1);
    universe.toggle_cell(row - 4, col + 6);

    universe.toggle_cell(row - 3, col - 6);
    universe.toggle_cell(row - 3, col - 1);
    universe.toggle_cell(row - 3, col + 1);
    universe.toggle_cell(row - 3, col + 6);

    universe.toggle_cell(row - 2, col - 6);
    universe.toggle_cell(row - 2, col - 1);
    universe.toggle_cell(row - 2, col + 1);
    universe.toggle_cell(row - 2, col + 6);

    universe.toggle_cell(row - 1, col - 4);
    universe.toggle_cell(row - 1, col - 3);
    universe.toggle_cell(row - 1, col - 2);
    universe.toggle_cell(row - 1, col + 2);
    universe.toggle_cell(row - 1, col + 3);
    universe.toggle_cell(row - 1, col + 4);
  }

  drawGrid();
  drawCells();
});

function renderLoop() {
  fps.render();
  updateGenerationsCount(ticksFrequency);

  drawGrid();
  drawCells();

  for (let i = 0; i < ticksFrequency; i++) {
    universe.tick();
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
    ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
    ctx.moveTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
  }

  // Vertical lines.
  for (let j = 0; j <= height; j++) {
    ctx.moveTo(0,                           j * (CELL_SIZE + 1) + 1);
    ctx.moveTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
  }

  ctx.stroke();
}

function getIndex(row, column) {
  return row * width + column;
};

function drawCells() {
  const cellsPtr = universe.cells();
  const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

  ctx.beginPath();

  ctx.fillStyle = ALIVE_COLOR;
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col);
      if (cells[idx] !== 1) {
        continue;
      }

      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  ctx.fillStyle = DEAD_COLOR;
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col);
      if (cells[idx] !== 0) {
        continue;
      }

      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }
  
  ctx.stroke();
}

const fps = new class {
  constructor() {
    this.fps = document.getElementById("fps");
    this.frames = [];
    this.lastFrameTimeStamp = performance.now();
  }

  render() {
    const now = performance.now();
    const delta = now - this.lastFrameTimeStamp;
    this.lastFrameTimeStamp = now;
    const fps = 1 / delta * 1000;

    this.frames.push(fps);
    if (this.frames.length > 100) {
      this.frames.shift();
    }

    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    for (let i = 0; i < this.frames.length; i++) {
      sum += this.frames[i];
      min = Math.min(this.frames[i], min);
      max = Math.max(this.frames[i], max);
    }

    let mean = sum / this.frames.length;

    this.fps.textContent = `
Frames per Second:
         latest = ${Math.round(fps)}
avg of last 100 = ${Math.round(mean)}
min of last 100 = ${Math.round(min)}
max of last 100 = ${Math.round(max)}
`.trim();
  }
};

// drawGrid();
// drawCells();
play();

