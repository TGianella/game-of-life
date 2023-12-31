import { Universe as UniverseWasm } from "wasm-game-of-life";
import { Universe as UniverseJs } from "./pkg/game-of-life.js";

export const createUniverseWasm = (blank, width, height) => new UniverseWasm(blank, width, height);

export const createUniverseJs = (blank, width, height) => new UniverseJs(blank, width, height);
