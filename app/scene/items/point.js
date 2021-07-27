import { EPSILON, Item, Point2D } from '../item.js';
import { Vector } from '../vectors.js';
import { Plane } from './plane.js';
import { Line } from './line.js';
import { Segment } from './segment.js';
import { ImpossibleOperationError } from '../../errors.js';

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

    // round the coordinates to avoid fp errors
    // this.x = Math.round((this.x + EPSILON) * 100000) / 100000;
    // this.y = Math.round((this.y + EPSILON) * 100000) / 100000;
    // this.z = Math.round((this.z + EPSILON) * 100000) / 100000;
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


  translate(by) { return this.add(by); }
  scale(by) { return new Point(this.rvector); } //we don't scale with respect to the origin, so this stays the same

  rotate(angle, axis) {
    let uaxis = axis.u.unit();
    return axis.pt.add(uaxis.scale((1 - Math.cos(angle))*uaxis.dot(axis.pt.vectorTo(this))))
      .add(axis.pt.vectorTo(this).scale(Math.cos(angle)))
      .add(uaxis.cross(axis.pt.vectorTo(this)).scale(Math.sin(angle)));
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
      return arg.pt.add(arg.u.unit().scale(arg.u.unit().dot(arg.pt.vectorTo(this))));
    } else if (arg instanceof Segment) {
      return arg.p1.add(arg.lineOn().u.unit().scale(arg.lineOn().u.unit().dot(arg.p1.vectorTo(this))));
      //if (arg.hasPoint(projection)) return projection;
      //else throw new ImpossibleOperationError('Point projection is outside the segment');
    }
    else throw new ImpossibleOperationError('Points can be projected on lines, segments or planes');
   }

   static get Origin() {
    return new Point(0,0,0);
   }

   get labelPosition() {
    return this;
   }

   project(projectionData, projection) {
    let projected = projection.projectPoint(this, projectionData);
    return projected;
   }
}