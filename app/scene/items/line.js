import { Item, Segment2D } from '../item.js';
import { Point } from './point.js';
import { Plane } from './plane.js';
import { Segment } from './segment.js';
import { Cube } from './cube.js';
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
   drawAsArrow;

   constructor(pt, u, drawAsArrow = false) {
    super();
    this.pt = pt;
    this.u = u.unit();
    this.drawAsArrow = drawAsArrow;
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
    return new Line(Point.Origin, Vector.UnitX, true);
   }

   static get Oy() {
    return new Line(Point.Origin, Vector.UnitY, true);
   }

   static get Oz() {
    return new Line(Point.Origin, Vector.UnitZ, true);
   }

   intersect(arg) {
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
    } else {
      return arg.intersect(this);
    }
   }

  get labelPosition() {
    return this.pt;
  }

  translate(by) { return new Line(this.pt.translate(by), this.u); }
  rotate(by,around) { return new Line(this.pt.rotate(by,around), this.u.rotate(around.u,by));  }
  scale(by) { return new Line(this.pt, this.u); } //we don't scale with respect to the origin, so this stays the same

   project(projectionData, projection) {
    // we need to project the points where the line crosses the volume walls
    let { volume } = { ...projectionData };

    // we can cross the volumeCube like in plane.js but too much work to get the arrow of Oy properly
    // let volumeCube = Cube.volumeCube(volume);
    // let projectedLine = volumeCube.intersect(this);

    // return Object.assign(projectedLine.project(projectionData, projection), { drawAsArrow: this.drawAsArrow });

    let crossings = [
      this.intersect(Plane.Oyz.parallelThrough(new Point(-volume.w/2,0,0))),
      this.intersect(Plane.Oyz.parallelThrough(new Point(volume.w/2,0,0))),
      this.intersect(Plane.Oxy.parallelThrough(new Point(0,0,0))),
      this.intersect(Plane.Oxy.parallelThrough(new Point(0,0,volume.d))),
      this.intersect(Plane.Oxz.parallelThrough(new Point(0,-volume.h/2,0,0))),
      this.intersect(Plane.Oxz.parallelThrough(new Point(0,volume.h/2,0,0))),
    ].filter(c => c && pointInVolume(c, volume)).map(c => projection.projectPoint(c, projectionData));

    //there should be just two at this point, unless special cases that we dont handle
    return Object.assign(new Segment2D(crossings[0], crossings[1]), { drawAsArrow: this.drawAsArrow });
   }

}