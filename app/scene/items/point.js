import { Item, Point2D } from '../item.js';
import { Vector } from '../vectors.js';

import log from 'loglevel';

export class Point extends Item {
    /**
   * Point type definition
   * @property {x} x
   */
   x; y; z;

   constructor(x, y, z) {
    super();

    if (x instanceof Point || x instanceof Vector) { //construct from another point or radius vector
      let copy = x;
      this.x = copy.x; this.y = copy.y; this.z = copy.z;
    } else { //construct from coordinates
      this.x = x; this.y = y; this.z = z;
    }
   }

   get rvector() { return new Vector(this.x, this.y, this.z); }

   vectorTo(p) {
    return new Vector(
      p.x - this.x,
      p.y - this.y,
      p.z - this.z
    );
   }

   add(v) {
    return new Point(this.rvector.add(v));
   }

   equals(p) {
    return this.x === p.x && this.y === p.y && this.z === p.z;
   }

   static get Origin() {
    return new Point(0,0,0);
   }

   project(projectionData, projection, label) {
    // log.debug(`projecting point ${label}`);
    let projected = projection.projectPoint(this, projectionData);
    // log.debug(projected)
    projected.label = label;
    return projected;
   }
}