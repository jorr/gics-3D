import { Item, Segment2D } from '../item.js';
import { Point } from './point.js';
import { Line } from './line.js';
import { dist, midpoint } from '../util.js';

import log from 'loglevel';


export class Segment extends Item {
  /**
   * Segment type definition
   * @property {Point} p1
   * @property {Point} p2
   */
   p1; p2;
   drawAsArrow;

   constructor(p1, p2, drawAsArrow = false) {
    super();

    this.p1 = p1;
    this.p2 = p2;
    this.drawAsArrow = drawAsArrow;
   }

   get len() {
    return dist(this.p1, this.p2);
   }

   lineOn() {
    return new Line(this.p1, this.p1.vectorTo(this.p2));
   }

   asVector() {
    return this.p1.vectorTo(this.p2);
   }

   hasPoint(p) {
    if (!p) return false;
    let p1p = this.p1.vectorTo(p), direction = this.asVector(), dotp1p = direction.dot(p1p);
    return p1p.isCollinearWith(direction) && dotp1p > 0 && dotp1p < direction.dot(direction);
  }

   intersect(arg) {
    let intersection = this.lineOn().intersect(arg);
    return this.hasPoint(intersection) ? intersection : null;
   }

   to2D() {
    return new Segment2D(this.p1.to2D(), this.p2.to2D());
   }

   isParallelTo(s) {
    return this.asVector().isCollinearWith(s.asVector());
   }

   projectionOn(arg) {
    return new Segment(this.p1.projectionOn(arg), this.p2.projectionOn(arg));
   }

   equals(s) {
    return this.p1.equals(s.p1) && this.p2.equals(s.p2);
   }

  translate(by) { return new Segment(this.p1.translate(by), this.p2.translate(by)); }
  rotate(by,around) { return new Segment(this.p1.rotate(by,around), this.p2.rotate(by,around));  }
  scale(by) { return new Segment(this.p1, this.p1.add(this.asVector().scale(by))); }

  get labelPosition() {
    return midpoint(this.p1, this.p2);
  }

   project(projectionData, projection) {
    let projectedP1 = projection.projectPoint(this.p1, projectionData),
        projectedP2 = projection.projectPoint(this.p2, projectionData);
    return Object.assign(new Segment2D(projectedP1, projectedP2), { drawAsArrow: this.drawAsArrow });
   }
}