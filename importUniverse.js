export const importUniverseWasm = (universe, memory, width, height) => {
  const cellsPtr = universe.cells();
  const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

  return cells;
}

export const importUniverseJs = (universe) => universe.cells
