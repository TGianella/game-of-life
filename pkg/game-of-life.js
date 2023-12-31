export class Cell {
  constructor(state) {
    this.state = state;
  }

  toggle() {
    this.state = 1 - this.state;
  }
}

export class Universe {
  constructor(blank, width, height, seed = null) {
    this.width = width;
    this.height = height;
    if (!seed) {
      this.cells = [...Array(this.width * this.height).keys()].map((i) => {
        if (!blank) {
          if (Math.random() < 0.5) {
            return new Cell(1);
          } else {
            return new Cell(0);
          }
        } else {
          return new Cell(0);
        }
      });
    } else {
      this.cells = seed.map(i => new Cell(i));
    }
  }

  get_index(row, column) {
    return row * this.width + column
  }

  live_neighbor_count(row, column) {
    let count = 0;

    const north = row === 0 ? this.height - 1 : row - 1;
    const south = row === this.height - 1 ? 0 : row + 1;
    const west = column === 0 ? this. width - 1 : column - 1;
    const east = column === this.width - 1 ? 0 : column + 1;

    const nw = this.get_index(north, west);
    count += this.cells[nw].state;
    
    const n = this.get_index(north, column);
    count += this.cells[n].state;

    const ne = this.get_index(north, east);
    count += this.cells[ne].state;

    const w = this.get_index(row, west);
    count += this.cells[w].state;

    const e = this.get_index(row, east);
    count += this.cells[e].state;

    const sw = this.get_index(south, west);
    count += this.cells[sw].state;

    const s = this.get_index(south, column);
    count += this.cells[s].state;

    const se = this.get_index(south, east);
    count += this.cells[se].state;

    return count;
  }

  tick() {
    // let tickTimer = new Timer("Universe.tick");
    // let generationTimer = new Timer("new generation");
    const next = [...this.cells];

    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        const idx = this.get_index(row, col);
        const cell = this.cells[idx];
        const live_neighbors = this.live_neighbor_count(row, col);

        let next_cell;

        if (cell.state) {
          if (live_neighbors < 2) {
            next_cell = new Cell(0);
          } else if (live_neighbors > 1 && live_neighbors < 4) {
            next_cell = new Cell(1);
          } else if (live_neighbors > 3) {
            next_cell = new Cell(0);
          } else {
            next_cell = cell;
          }
        } else {
          if (live_neighbors === 3) {
            next_cell = new Cell(1);
          } else {
            next_cell = cell;
          }
        }

        next[idx] = next_cell;
      }
    }
    // let freeTimer = new Timer("free old cells");
    this.cells = next;
    // generationTimer.drop();
    // freeTimer.drop();
    // tickTimer.drop();
  }

  set_width(width) {
    self.width = width;
    self.cells = ([...Array(width * this.height)].map((i) => new Cell(0)));
  }
  
  set_height(height) {
    self.height = height;
    self.cells = ([...Array(this.width * height)].map((i) => new Cell(0)));
  }

  toggle_cell(row, column) {
    const idx = this.get_index(row, column);
    this.cells[idx].toggle();
  }
}

export class Timer {
  constructor(name) {
    console.time(name)
    this.name = name;
  }

  drop() {
    console.timeEnd(this.name);
  }
}

