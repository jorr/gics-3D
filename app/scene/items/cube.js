import { Item } from '../item.js';
import { Point } from './point.js';
import { midpoint } from '../util.js';

export class Cube extends Item {
  /**
   * Cube type definition
   * Diagonal points of the cube
   * @property {Point} d1, d2;
   */
   d1; d2;

   constructor(d1, d2) {
    super();
    this.d1 = d1;
    this.d2 = d2;
   }

   get cen() {
    return new Point(midpoint(this.d1, this.d2));
   }

  //  cen - centre
  // A,B,C,...,H - vertices
  // baseA - base closer to the origin
  // baseB - base farther to the origin
  // wallAB, wallAC.. - walls (squares)
}