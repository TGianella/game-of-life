const query = new URLSearchParams(window.location.search);

export const params = {
  language: query.get('lang'),
  height: query.get('height'),
  width: query.get('width'),
  cellSize: Number(query.get('cell_size')),
  loop: query.get('loop'),
  loopAfterGenerationCount: query.get('loopGeneration'),
  loopAfterTime: query.get('loopTime'),
  loopIfDead: query.get('loopDeath'),
  generationsPerRender: query.get('genPerRender'),
}

