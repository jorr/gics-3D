import { Item, EPSILON } from '../item.js';
import { Vector } from '../vectors.js';
import { Point } from './point.js';
import { Line } from './line.js';
import { Cube } from './cube.js';
import { Segment } from './segment.js';
import { Quad } from './quad.js';
import { Triangle } from './triangle.js';
import { sortVertices, pointInVolume } from '../util.js';

import { ImpossibleOperationError } from '../../errors.js';

import log from 'loglevel';
import _ from 'lodash';

const SHRINK_FACTOR = 0.1;

export class Plane extends Item {
  pt; n;

  constructor(pt, n) {
   super();
   this.pt = pt;
   this.n = n.unit();
  }

  hasPoint(p) {
    let D = -(this.n.x*this.pt.x + this.n.y*this.pt.y + this.n.z*this.pt.z);
    // return this.n.dot(this.pt.vectorTo(p)) === 0; //arithmetic errors, can try to replace with EPSILON
    return this.n.x * p.x + this.n.y * p.y + this.n.z * p.z + D == 0;
  }

  hasVector(v) {
   return this.n.cross(v).isZero();
  }

  getRandomPoint() {
   let x = Math.random() * 300;
   let y = Math.random() * 300;
   let A = this.n.x, B = this.n.y, C = this.n.z;
   let D = -(A*this.pt.x + B*this.pt.y + C*this.pt.z);

   //z is not constrained, any z would do
   if (C === 0) {
     if (B === 0) {
       //plane is x=d, so parallel to Oyz, y can be random so we keep it
       return new Point(D,y,Math.random() * 300);
     }
     //else, recalculate y to conform to the two-var equation
     y = -(A*x +D)/B;
     return new Point(x,y,Math.random() * 300);
   }

   let z = -(A*x + B*y + D)/C;
   return new Point(x,y,z);
  }

  getCoplanarVector() {
   return this.pt.vectorTo(this.getRandomPoint());
  }

  hasLine(l) {
   return this.hasPoint(l.pt) && this.hasVector(l.u);
  }

  isParallelTo(p) {
    if (p instanceof Plane)
      return this.n.isCollinearWith(p.n);
    else if (p instanceof Line)
      return Math.abs(this.n.dot(p.u)) < EPSILON;
    else if (p instanceof Vector)
      return Math.abs(this.n.dot(p)) < EPSILON;
    else if (p instanceof Segment)
      return Math.abs(this.n.dot(p.asVector())) < EPSILON;
  }

  parallelThrough(p) {
    return new Plane(p, this.n);
  }

  static get Oxy() {
    return new Plane(Point.Origin, Vector.UnitZ);
  }

  static get Oxz() {
    return new Plane(Point.Origin, Vector.UnitY);
  }

  static get Oyz() {
    return new Plane(Point.Origin, Vector.UnitX);
  }

  intersect(arg) {
    if (arg instanceof Line) {
      return arg.intersect(this);
    } else if (arg instanceof Plane) {
      if (this.isParallelTo(arg))
        return null;
      let A = this.pt, B = arg.pt, m = this.n, n = arg.n;
      let pt = A.add(
        m.cross(n).cross(m).scale(
          n.dot(A.vectorTo(B)) / (m.cross(n).dot(m.cross(n)))
        )
      );
      return new Line(pt, m.cross(n));
    }
  }

  get labelPosition() {
    return this.pt;
  }

  translate(by) { return new Plane(this.pt.translate(by), this.n); }
  rotate(by,around) { return new Plane(this.pt.rotate(by,around), this.n.rotate(around.u,by));  }
  scale(by) { return new Plane(this.pt, this.n); } //we don't scale with respect to the origin, so this stays the same

  project(projectionData, projection) {
    let { volume } = { ...projectionData };
    let volumeCube = Cube.volumeCube(volume);
    let projectedPlane = volumeCube.intersect(this);

    projectedPlane = projectedPlane.shrink(SHRINK_FACTOR);

    let color = { r: Math.round(Math.random()*255), b: Math.round(Math.random()*255) };
    let projected = projectedPlane.project(projectionData, projection);
    projected.fillColor = `rgba(${color.r},240,${color.b},0.5)`;
    return projected;
  }
}