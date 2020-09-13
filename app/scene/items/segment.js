import { Item } from '../item.js';
import { Point } from './point.js';
import { dist } from '../util.js';


export class Segment extends Item {
  /**
   * Segment type definition
   * @property {Point} p1
   * @property {Point} p2
   */
   p1; p2;

   constructor(p1, p2) {
    super();

    this.p1 = p1;
    this.p2 = p2;
   }

   get len() {
    return dist(p2,p1);
   }
}