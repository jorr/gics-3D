import { Item, Point2D } from '../item.js';
import { Vector } from '../vectors.js';
import { Plane } from './plane.js';
import { ImpossibleOperationError } from '../../errors.js';
import { EPSILON } from '../util.js';

import log from 'loglevel';

export class Point extends Item {

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
    return Math.abs(this.x - p.x) <= EPSILON && Math.abs(this.y - p.y) <= EPSILON && Math.abs(this.z - p.z) <= EPSILON;
   }

   to2D() {
    return new Point2D(this.x, this.y);
   }

   projectionOn(arg) {
    if (arg instanceof Plane) {
      return this.add(arg.n.unit().scale(-arg.n.unit().dot(arg.pt.vectorTo(this))));
    } else if (arg instanceof Line) {
      return this.add(arg.u.unit().scale(arg.u.unit().dot(arg.pt.vectorTo(this))));
    } else if (arg instanceof Segment) {
      let projection = this.add(arg.lineOn().u.unit().scale(arg.lineOn().u.unit().dot(arg.p1.vectorTo(this))));
      if (arg.hasPoint(projection)) return projection;
      else throw new ImpossibleOperationError('Point projection is outside the segment');
    }
    else throw new ImpossibleOperationError('Points can be projected on lines, segments or planes');
   }

   static get Origin() {
    return new Point(0,0,0);
   }

   project(projectionData, projection, label, color) {
    // log.debug(`projecting point ${label}`);
    let projected = projection.projectPoint(this, projectionData);
    // log.debug(projected)
    projected.label = label;
    projected.color = color;
    return projected;
   }
}