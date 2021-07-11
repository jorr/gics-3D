import { Item, Segment2D } from '../item.js';
import { Point } from './point.js';
import { Plane } from './plane.js';
import { Segment } from './segment.js';
import { Vector } from '../vectors.js';
import { ImpossibleOperationError } from '../../errors.js';
import { pointInVolume } from '../util.js';

import _ from 'lodash';
import log from 'loglevel';


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

   hasPoint(p) {
    return this.u.cross(this.pt.vectorTo(p)).isZero();
   }

   isParallelTo(l) {
    return this.u.isCollinearWith(l.u);
   }

   asVector() {
    return this.u;
   }

   parallelThrough(p) {
    return new Line(p, this.u);
   }

   projectionOn(arg) {
    if (arg instanceof Plane) {
      return new Line(this.pt.projectionOn(arg), this.u.add(arg.n.unit().scale(-arg.n.unit().dot(this.u))));
    } else throw new ImpossibleOperationError('Lines can only be projected on planes');
   }

   static get Ox() {
    return new Line(Point.Origin, Vector.UnitX);
   }

   static get Oy() {
    return new Line(Point.Origin, Vector.UnitY);
   }

   static get Oz() {
    return new Line(Point.Origin, Vector.UnitZ);
   }

   intersect(arg) {
    //TODO: bodies
    if (arg instanceof Line) {
      //check if the lines actually intersect
      if (this.u.cross(arg.u).isZero() || this.u.triple(arg.u, this.pt.vectorTo(arg.pt)) !== 0) {
        return null; //throw new ImpossibleOperationError('Attempt to intersect non-intersecting lines');
      }

      return this.getPointAtParam(
        arg.u.triple(this.u.cross(arg.u),this.pt.vectorTo(arg.pt))/(this.u.cross(arg.u).dot(this.u.cross(arg.u)))
      );
    } else if (arg instanceof Plane) {
      if (this.u.dot(arg.n) === 0) return null; //parallel
      return this.pt.add(this.u.scale(-arg.n.dot(arg.pt.vectorTo(this.pt))/arg.n.dot(this.u)));
    } else if (arg instanceof Segment) {
      return arg.intersect(this);
    }
   }

  get labelPosition() {
    return this.pt;
  }

   project(projectionData, projection) {
    // we need to project the points where the line crosses the volume walls
    let { volume } = { ...projectionData };

    let crossings = [
      this.intersect(Plane.Oyz.parallelThrough(new Point(-volume.w/2,0,0))),
      this.intersect(Plane.Oyz.parallelThrough(new Point(volume.w/2,0,0))),
      this.intersect(Plane.Oxy.parallelThrough(new Point(0,0,0))),
      this.intersect(Plane.Oxy.parallelThrough(new Point(0,0,volume.d))),
      this.intersect(Plane.Oxz.parallelThrough(new Point(0,volume.h/2,0,0))),
      this.intersect(Plane.Oxz.parallelThrough(new Point(0,-volume.h/2,0,0)))
    ].filter(c => c && pointInVolume(c, volume)).map(c => projection.projectPoint(c, projectionData));

    // there should be just two at this point
    return new Segment2D(crossings[0], crossings[1]);

    // alternative calculation, commented out
    /*let p, crossings = [];

    //calculations use the parametric equation of the line: p = pt + s.u
    if (this.u.y !== 0) {
      //crossing top wall (y = volume.h/2)
      p = this.getPointAtParam((volume.h/2 - this.pt.y) / this.u.y);
      if (Math.abs(p.x) <= volume.w/2 && p.z >= 0) crossings.push(p);
      //crossing bottom wall (y = -volume.h/2)
      p = this.getPointAtParam((-volume.h/2 - this.pt.y) / this.u.y);
      if (Math.abs(p.x) <= volume.w/2 && p.z >= 0) crossings.push(p);
    }
    //no need to continue if we have two crossings
    if (this.u.x !== 0 && crossings.length < 2) {
      //crossing left wall (x = -volume.w/2)
      p = this.getPointAtParam((-volume.w/2 - this.pt.x) / this.u.x);
      if (Math.abs(p.y) <= volume.h/2 && p.z >= 0) crossings.push(p);
      //crossing right wall (x = volume.w/2)
      p = this.getPointAtParam((volume.w/2 - this.pt.x) / this.u.x);
      if (crossings.length < 2 && Math.abs(p.y) <= volume.h/2 && p.z >= 0) crossings.push(p);
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
    return Object.assign(new Segment2D(projectedP1, projectedP2), {
      label,
      color
    });*/
   }

}