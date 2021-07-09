import { Item, Ellipse2D, Point2D, Segment2D } from '../item.js';
import { Point } from './point.js';
import { Line } from './line.js';
import { Plane } from './plane.js';

import log from 'loglevel';

export class Circle extends Item {
  /**
   * Circle type definition
   * @property {Point} cen
   * @property {Point} p1
   * @property {Point} p2
   */
   cen; plane; rad;

   constructor(cen, rad, plane) {
    super();

    this.cen = cen;
    // this.p1 = p1;
    // this.p2 = p2;
    this.rad = rad; //cen.vectorTo(p1).norm;
    this.plane = plane; //new Plane(cen, cen.vectorTo(p1).cross(cen.vectorTo(p2)).unit());
   }

   get diam() {
    return this.rad*2;
   }

   pointOnCircle(direction) {
    direction = direction || this.plane.getCoplanarVector();
    return this.cen.add(direction.unit().scale(this.rad));
   }

   hasPoint(p) {
    return dist(p,this.cen) == this.rad && this.plane.hasPoint(p);
   }

   pointsToTransform() {
    return [this.cen]; //, this.p1, this.p2];
  }

  get labelPosition() {
    return this.cen;
  }

  project(projectionData, projection, mainAxisProjectionOut = null) {
    return projection.projectCircle(this, projectionData, mainAxisProjectionOut);
  }
}