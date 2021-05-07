import { Item, Segment2D } from '../item.js';
import { Point } from './point.js';
import _ from 'lodash';


export class Line extends Item {
  /**
   * Line type definition
   * @property {Point} pt
   * @property {Vector} u
   */
   pt; u;

   constructor(pt, u) {
    super();
    this.pt = pt;
    this.u = u;
   }

   getPointAtParam(s) {
    return new Point(
      this.pt.x + s*this.u.x,
      this.pt.y + s*this.u.y,
      this.pt.z + s*this.u.z
    );
   }

   project(projectionData, projection, label) {
    //We need to project the points where the line crosses the volume walls
    let p, crossings = [];
    let { volume } = { ...projectionData };

    //calculations use the parametric equation of the line: p = pt + s.u
    if (this.u.y !== 0) {
      //crossing top wall (y = volume.h/2)
      p = this.getPointAtParam((volume.h/2 - this.pt.y) / this.u.y);
      if (Math.abs(p.x) <= volume.w/2 && p.z > 0) crossings.push(p);
      //crossing bottom wall (y = -volume.h/2)
      p = this.getPointAtParam((-volume.h/2 - this.pt.y) / this.u.y);
      if (Math.abs(p.x) <= volume.w/2 && p.z > 0) crossing.push(p);
    }
    //no need to continue if we have two crossings
    if (this.u.x !== 0 && crossings.length < 2) {
      //crossing left wall (x = -volume.w/2)
      p = this.getPointAtParam((-volume.w/2 - this.pt.x) / this.u.x);
      if (Math.abs(p.y) <= volume.h/2 && p.z > 0) crossings.push(p);
      //crossing right wall (x = volume.w/2)
      p = this.getPointAtParam((volume.w/2 - this.pt.x) / this.u.x);
      if (crossings.length < 2 && Math.abs(p.y) <= volume.h/2 && p.z > 0) crossings.push(p);
    }
    //no need to continue if we have two crossings
    if (this.u.z !== 0 && crossings.length < 2) {
      //crossing front wall (z = 0)
      p = this.getPointAtParam(-this.pt.z / this.u.z);
      if (Math.abs(p.y) <= volume.h/2 && Math.abs(p.x) <= volume.w/2) crossings.push(p);
      //crossing back wall (z = volume.d)
      p = this.getPointAtParam((volume.d - this.pt.z) / this.u.z);
      if (crossings.length < 2 && Math.abs(p.y) <= volume.h/2  && Math.abs(p.x) <= volume.w/2) crossings.push(p);
    }

    //we should now have two points in crossings
    const projectedP1 = projection.projectPoint(crossings[0], projectionData),
        projectedP2 = projection.projectPoint(crossings[1], projectionData);
    return Object.assign(new Segment2D, {
      p1: projectedP1,
      p2: projectedP2,
      label
    });
   }

}