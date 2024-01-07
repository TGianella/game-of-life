export const compareUniverseWasm = (pastUniverse, presentUniverse) => pastUniverse.toString() === presentUniverse.toString()

export const compareUniverseJs = (pastUniverse, presentUniverse) => pastUniverse.toString() === presentUniverse.map(cell => cell.state).toString();

export const reassignUniverseWasm = (presentUniverse) => new Uint8Array(presentUniverse);

export const reassignUniverseJs = (presentUniverse) => new Uint8Array(presentUniverse.map(cell => cell.state));

