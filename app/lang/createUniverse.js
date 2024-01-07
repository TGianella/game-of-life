import { Universe as UniverseWasm } from "wasm-game-of-life";
import { Universe as UniverseJs } from "js-game-of-life";

export const createUniverseWasm = (blank, width, height) => UniverseWasm.new(blank, width, height);

export const createUniverseJs = (blank, width, height) => new UniverseJs(blank, width, height);
