# Game of life

<p>
  <img alt="Rust" src="https://img.shields.io/badge/Rust-000000?logo=rust&logoColor=white&style=for-the-badge" />
  <img alt="WebAssembly" src="https://img.shields.io/badge/WebAssembly-654FF0?logo=webassembly&logoColor=white&style=for-the-badge" />
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=white&style=for-the-badge" />
  <img alt="HTML" src="https://img.shields.io/badge/HTML-E34F26?logo=html5&logoColor=white&style=for-the-badge" />
</p>

A web app implementing the game of life, done in Rust + WebAssembly + Js, following [the community's guide](https://rustwasm.github.io/docs/book/game-of-life/introduction.html).

Play with it [here](tgianella.github.io/game-of-life/).

## Features
* It runs fast (fps counter included)
* Wrapping universe (cells on the left/top border are neighbours to those on the right/bottom border)
* Play/Pause simulation at anytime.
* Slider to control the simulation speed.
* Reset or clear the board.
* Click to change a cell state, ctrl-click to create a glider, shift-clitk to create a pulsar

## Features I'd like to implement

### Features
* Select menu to select shape added on ctrl and maj-click
* Rotate shapes
* Select universe size
* Go back in time (highly unrealistic right now !)

### Optimisation
* Transition from canvas to webGL for rendering
* Remove allocation of vectors at each universe tick
* Return list of deltas instead of a whole univers with each tick
* Instantiate only a single universe to remove all dynamic allocation.
