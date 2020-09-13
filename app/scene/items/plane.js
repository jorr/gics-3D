import { Item } from '../item.js';
import { Point } from './point.js';


export class Plane extends Item {
  /**
   * Plane type definition
   * @property {Point} pt
   * @property {Vector} n
   */
   pt; n;

   constructor(pt, n) {
    super();
    this.pt = pt;
    this.n = n;
   }

   // crossWith(o) {
   //    if (o instanceof Plane) {
   //      return new Line(
   //        ,
   //        this.n.cross(o.n)
   //      );
   //    } else if (o instanceof Line) {
   //      return new Point();
   //    }
   //    return null;
   // }
}

