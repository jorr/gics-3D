import { Item, Ellipse2D, Point2D, Segment2D } from '../item.js';
import { Point } from './point.js';
import { Line } from './line.js';
import { Plane } from './plane.js';
import { dist2D, angle2D } from '../util.js';

import log from 'loglevel';

export class Circle extends Item {
  /**
   * Circle type definition
   * @property {Point} cen
   * @property {Point} p1
   * @property {Point} p2
   */
   cen; p1; p2; plane; rad;

   constructor(cen, p1, p2) {
    super();

    //TODO: fix to plane, rad, cen

    this.cen = cen;
    this.p1 = p1;
    this.p2 = p2;
    this.rad = cen.vectorTo(p1).norm;
    this.plane = new Plane(cen, cen.vectorTo(p1).cross(cen.vectorTo(p2)).unit());
   }

   get diam() {
    return rad*2;
   }

   pointOnCircle(direction) {
    direction = direction || this.plane.getCoplanarVector();
    return this.cen.add(direction.unit().scale(this.rad));
   }

   hasPoint(p) {
    return dist(p,this.cen) == this.rad && this.plane.hasPoint(p);
   }

   pointsToTransform() {
    return [this.cen, this.p1, this.p2];
  }

   project(projectionData, projection, label) {
    // let cenp1 = this.cen.vectorTo(this.p1);
    // let cenp2 = intersect(this.plane, new Plane(this.cen, cenp1));
    // let p2 = this.cen.add(cenp2.u.unit().scale(this.rad));

    log.debug('projecting circle labeled ', label);

    let projectedP1 = projection.projectPoint(this.p1, projectionData),
        projectedP2 = projection.projectPoint(this.p2, projectionData),
        projectedCen = projection.projectPoint(this.cen, projectionData);

    if (projectedP1.equals(projectedCen) || projectedP2.equals(projectedCen)) {
      // this means the camera sight is parallel to the circle so we need to draw as segment
      let diamP1 = this.cen.add(this.cen.vectorTo(this.p1).scale(-1));
      let projectedDiamP1 = projection.projectPoint(diamP1, projectionData);
      return Object.assign(new Segment2D, {p1:projectedP1, p2:projectedDiamP1, label});
    }

    else return Object.assign(new Ellipse2D, {
      c: projectedCen,
      rx: dist2D(projectedCen, projectedP1),
      ry: dist2D(projectedCen, projectedP2),
      rotate: angle2D( // the angle between a radius of the ellipse and Ox in 2D
        Object.assign(new Segment2D, {p1:projectedCen, p2:projectedP1}),
        Object.assign(new Segment2D, {
          p1:Object.assign(new Point2D, {x:0,y:0}),
          p2:Object.assign(new Point2D, {x:1,y:0})
        })
      ),
      label
    });
   }
}