import {generationsCounter} from "../documentSelectors";
import {resetTimer} from "./utils";

const increaseGenerationsCount = (generationsCount, step) => generationsCount + Number(step);

const displayGenerationsCount = (generationsCount) => {
    generationsCounter.textContent = `Generation ${generationsCount}`
}

export const updateGenerationsCount = (generationsCount, step) => {
    const newGenerationsCount = increaseGenerationsCount(generationsCount, step);
    displayGenerationsCount(newGenerationsCount);

    return newGenerationsCount;
}

const resetGenerationsCount = () => {
    const newGenerationsCount = 0;
    displayGenerationsCount(newGenerationsCount);

    return newGenerationsCount;
}

export const resetTimerAndGenerations = () => {
    resetTimer();

    return resetGenerationsCount();
}