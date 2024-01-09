import { Universe as UniverseWasm } from "wasm-game-of-life";
import { Universe as UniverseJs } from "js-game-of-life";

export const createUniverseWasm = (blank, width, height, seed = null) => UniverseWasm.new(blank, width, height, seed);

export const createUniverseJs = (blank, width, height, seed = null) => new UniverseJs(blank, width, height, seed);
