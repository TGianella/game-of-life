const query = new URLSearchParams(window.location.search);

export const params = {
  language: query.get('lang'),
  height: query.get('height'),
  width: query.get('width'),
  cellSize: Number(query.get('cell_size')),
  seed: query.get('seed'),
  loop: query.get('loop'),
  loopAfterGenerationCount: query.get('loopGeneration'),
  loopAfterTime: query.get('loopTime'),
  loopIfDead: query.get('loopDeath'),
}

