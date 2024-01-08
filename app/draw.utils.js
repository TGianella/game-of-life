import colors from "./colors.constants.json";

const getIndex = (row, width, column) => {
    return row * width + column;
};

const fillCells = (ctx, cells, continueCondition, width, height, cellSize, checkCell) => {
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const idx = getIndex(row, width, col);
            if (checkCell(cells[idx]) === continueCondition) {
                continue;
            }

            ctx.fillRect(
                col * (cellSize + 1) + 1,
                row * (cellSize + 1) + 1,
                cellSize,
                cellSize
            );
        }
    }
}

export const drawCells = (ctx, universe, memory, width, height, cellSize, importUniverse, checkCell) => {
    const cells = importUniverse(universe, memory, width, height);
    const cellColors = Object.values(colors).filter(color => color.continueCondition !== undefined);

    ctx.beginPath();

    for (const color of cellColors) {
        ctx.fillStyle = color.value;
        fillCells(ctx, cells, color.continueCondition, width, height, cellSize, checkCell);
    }

    ctx.stroke();
}

export const drawGrid = (ctx, width, cellSize, height) => {
    ctx.beginPath();
    ctx.strokeStyle = colors.gridColor.value;

    // Vertical lines.
    for (let i = 0; i <= width; i++) {
        ctx.moveTo(i * (cellSize + 1) + 1, 0);
        ctx.lineTo(i * (cellSize + 1) + 1, (cellSize + 1) * height + 1);
    }

    // Vertical lines.
    for (let j = 0; j <= height; j++) {
        ctx.moveTo(0,                           j * (cellSize + 1) + 1);
        ctx.lineTo((cellSize + 1) * width + 1, j * (cellSize + 1) + 1);
    }

    ctx.stroke();
}