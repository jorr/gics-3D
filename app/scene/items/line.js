import { Item } from '../item.js';
import { Point } from './point.js';


export class Line extends Item {
  /**
   * Line type definition
   * @property {Point} pt
   * @property {Vector} u
   */
   pt; u;

   constructor(pt, u) {
    super();
    this.pt = pt;
    this.u = u;
   }
}