import { Item, Segment2D } from '../item.js';
import { Point } from './point.js';
import { Line } from './line.js';
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
    return dist(this.p1, this.p2);
   }

   lineOn() {
    return new Line(this.p1, this.p1.vectorTo(this.p2));
   }

   asVector() {
    return this.p1.vectorTo(this.p2);
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

   pointsToTransform() {
    return [this.p1, this.p2];
  }

   project(projectionData, projection, label) {
    //TODO: there is a redundancy here because the endpoints are bound and we are drawing them twice. Solve?
    //can do a flag
    let projectedP1 = projection.projectPoint(this.p1, projectionData),
        projectedP2 = projection.projectPoint(this.p2, projectionData);
    return Object.assign(new Segment2D(projectedP1, projectedP2),
    {
      label
    });
   }
}