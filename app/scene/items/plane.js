import { Item } from '../item.js';
import { Vector } from '../vectors.js';
import { Point } from './point.js';

import log from 'loglevel';

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

   hasPoint(p) {
    return this.n.dot(this.pt.vectorTo(p)) == 0;
   }

   hasVector(v) {
    return this.n.cross(v) == 0;
   }

   getRandomPoint() {
    let x = Math.random() * 100;
    let y = Math.random() * 100;
    let A = this.n.x, B = this.n.y, C = this.n.z;

    if (C === 0) {
      // n is parallel to Oxy, then the plane is either Oxz or Ozy
      if (Plane.Oxz.hasPoint(this.pt)) // equation is y = d
        return new Point(0,y,0);
      else
        return new Point(x,0,0);
    }

    let D = -(A*this.pt.x + B*this.pt.y + C*this.pt.z);
    let z = -(A*x + B*x + D)/C;
    return new Point(x,y,z);
   }

   getCoplanarVector() {
    return this.pt.vectorTo(this.getRandomPoint());
   }

   hasLine(l) {
    return this.hasPoint(l.pt) && this.hasVector(l.u);
   }

   static get Oxy() {
    return new Plane(Point.Origin, new Vector(0,0,1));
   }

   static get Oxz() {
    return new Plane(Point.Origin, new Vector(0,1,0));
   }

   static get Oyz() {
    return new Plane(Point.Origin, new Vector(1,0,0));
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

