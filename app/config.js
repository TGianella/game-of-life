export const defaultValues = {
  language: 'WASM',
  height: 100,
  width: 100,
  cellSize: 9,
  seed: null,
  loop: false,
  loopAfterGenerationCount: false,
  loopAfterTime: false,
  loopIfDead: false,
  generationsLoopPoint: 5000,
  timeLoopPoint: 60000,
  generationsThreshold: 1000,
}

export const logoUrls = {
  js: "https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png",
  wasm: "https://upload.wikimedia.org/wikipedia/commons/1/1f/WebAssembly_Logo.svg",
}

export const colors = {
  gridColorLarge: {
    value: "#CCCCCC",
  },
  gridColorMedium: {
    value: "#EEEEEE",
  },
  gridColorSmall: {
    value: "#fcfcfc",
  },
  aliveColor: {
  value: "#FFFFFF",
      continueCondition: false,
  },
  deadColor: {
  value: "#000000",
      continueCondition: true,
  },
}
