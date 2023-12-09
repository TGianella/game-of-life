/* tslint:disable */
/* eslint-disable */
/**
*/
export enum Cell {
  Dead = 0,
  Alive = 1,
}
/**
*/
export class Universe {
  free(): void;
/**
*/
  tick(): void;
/**
* @param {boolean} blank
* @param {number} width
* @param {number} height
* @returns {Universe}
*/
  static new(blank: boolean, width: number, height: number): Universe;
/**
* @param {number} width
*/
  set_width(width: number): void;
/**
* @param {number} height
*/
  set_height(height: number): void;
/**
* @returns {string}
*/
  render(): string;
/**
* @returns {number}
*/
  width(): number;
/**
* @returns {number}
*/
  height(): number;
/**
* @returns {number}
*/
  cells(): number;
/**
* @param {number} row
* @param {number} column
*/
  toggle_cell(row: number, column: number): void;
}
