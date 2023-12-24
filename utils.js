
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
