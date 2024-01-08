
export const changeQueryParams = (param, newValue) => {
  const params = new URLSearchParams(window.location.search);
  const current_url = new URL(window.location);
  params.set(param, newValue);
  current_url.search = params;
  window.history.pushState(null, '', current_url);
}

export const resizeCanvas = (canvas, height, width, cellSize) => {
  canvas.height = (cellSize + 1) * height + 1;
  canvas.width = (cellSize + 1) * width + 1;
}

export const assignByLanguage = (language, wasmValue, jsValue) => language === 'JS' ? jsValue : wasmValue;

export const resetTimer = () => {
  console.timeEnd('1000th generation');
  console.time('1000th generation');
}

export const drawPattern = (universe, pattern, row, col) => {
  for (const [deltaX, deltaY] of pattern) {
    universe.toggle_cell(row + deltaX, col + deltaY);
  }
}

export const isPaused = (animationId) => {
  return animationId === null;
};
