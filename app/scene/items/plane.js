import { Item } from '../item.js';
import { Vector } from '../vectors.js';
import { Point } from './point.js';
import { Line } from './line.js';
import { Quad } from './quad.js';
import { Triangle } from './triangle.js';
import { sortVertices, pointInVolume, shrinkPolygon } from '../util.js';

import { ImpossibleOperationError } from '../../errors.js';

import log from 'loglevel';
import _ from 'lodash';

const SHRINK_FACTOR = 0.2;

export class Plane extends Item {
  /**
  * Plane type definition
  * @property {Point} pt
  * @property {Vector} n
  */
  pt; n;

  constructor(pt, n) {
   super();
   this.pt = pt;
   this.n = n.unit();
  }

  hasPoint(p) {
    let D = -(this.n.x*this.pt.x + this.n.y*this.pt.y + this.n.z*this.pt.z);
    // BOYKO: why does this not always work? return this.n.dot(this.pt.vectorTo(p)) === 0;
    return this.n.x * p.x + this.n.y * p.y + this.n.z * p.z + D == 0;
  }

  hasVector(v) {
   return this.n.cross(v).isZero();
  }

  getRandomPoint() {
   let x = Math.random() * 200;
   let y = Math.random() * 200;
   let A = this.n.x, B = this.n.y, C = this.n.z;
   let D = -(A*this.pt.x + B*this.pt.y + C*this.pt.z);

   //z is not constrained, any z would do
   if (C === 0) {
     if (B === 0) {
       //plane is x=d, so parallel to Oyz, y can be random so we keep it
       return new Point(D,y,Math.random() * 200);
     }
     //else, recalculate y to conform to the two-var equation
     y = -(A*x +D)/B;
     return new Point(x,y,Math.random() * 200);
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
   return this.n.isCollinearWith(p.n);
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
    //TODO: segment, bodies
  }

  get labelPosition() {
    return this.pt;
  }

  translate(by) { return new Plane(this.pt.translate(by), this.n); }
  rotate(by,around) { return new Plane(this.pt.rotate(by,around), this.n.rotate(around.u,by));  }
  scale(by) { return new Plane(this.pt, this.n); } //we don't scale with respect to the origin, so this stays the same

  project(projectionData, projection) {
    //We will represent the plane as a quad defined by the crossings with the volume
    //TODO: test shrinking
    let projectedPlane;
    let { volume } = { ...projectionData };

    let leftCross = this.intersect(Plane.Oyz.parallelThrough(new Point(-volume.w/2,0,0))),
    rightCross = this.intersect(Plane.Oyz.parallelThrough(new Point(volume.w/2,0,0))),
    frontCross = this.intersect(Plane.Oxy.parallelThrough(new Point(0,0,0))),
    backCross = this.intersect(Plane.Oxy.parallelThrough(new Point(0,0,volume.d))),
    topCross = this.intersect(Plane.Oxz.parallelThrough(new Point(0,volume.h/2,0))),
    bottomCross = this.intersect(Plane.Oxz.parallelThrough(new Point(0,-volume.h/2,0)));

    let crossings = [
      leftCross && topCross ? leftCross.intersect(topCross) : null,
      leftCross && bottomCross ? leftCross.intersect(bottomCross) : null,
      leftCross && backCross ? leftCross.intersect(backCross) : null,
      leftCross && frontCross ? leftCross.intersect(frontCross) : null,
      rightCross && topCross ? rightCross.intersect(topCross) : null,
      rightCross && bottomCross ? rightCross.intersect(bottomCross) : null,
      rightCross && backCross ? rightCross.intersect(backCross) : null,
      rightCross && frontCross ? rightCross.intersect(frontCross) : null,
      topCross && frontCross ? topCross.intersect(frontCross) : null,
      topCross && backCross ? topCross.intersect(backCross) : null,
      bottomCross && frontCross ? bottomCross.intersect(frontCross) : null,
      bottomCross && backCross ? bottomCross.intersect(backCross) : null
    ];

    crossings = sortVertices(_.uniqWith(
      crossings.filter(c => c && pointInVolume(c,volume)),
      (p,q) => p.equals(q)),
    this);

    if (crossings.length === 3) {
      projectedPlane = new Triangle(...crossings);
    }
    else if (crossings.length >= 4)
      projectedPlane = new Quad(...crossings.slice(0,4));
    else throw new ImpossibleOperationError("Plane crosses volume in a weird way");

    projectedPlane = shrinkPolygon(projectedPlane, SHRINK_FACTOR);

    let color = { r: Math.round(Math.random()*255), b: Math.round(Math.random()*255) };
    let projected = projectedPlane.project(projectionData, projection);
    projected.fillColor = `rgba(${color.r},240,${color.b},0.5)`;
    return projected;
  }
}