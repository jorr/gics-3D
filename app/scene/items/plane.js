import { Item } from '../item.js';
import { Vector } from '../vectors.js';
import { Point } from './point.js';
import { Line } from './line.js';
import { Quad } from './quad.js';
import { sortVertices, pointInVolume } from '../util.js';

import log from 'loglevel';

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
   this.n = n;
  }

  hasPoint(p) {
   return this.n.dot(this.pt.vectorTo(p)) == 0;
  }

  hasVector(v) {
   return this.n.cross(v) == 0;
  }

  getRandomPoint() {
   let x = Math.random() * 100;
   let y = Math.random() * 100;
   let A = this.n.x, B = this.n.y, C = this.n.z;
   let D = -(A*this.pt.x + B*this.pt.y + C*this.pt.z);

   //z is not constrained, any z would do
   if (C === 0) {
     if (B === 0) {
       //plane is x=d, so parallel to Oyz, y can be random so we keep it
       return new Point(D,y,Math.random() * 100);
     }
     //else, recalculate y to conform to the two-var equation
     y = -(A*x +D)/B;
     return new Point(x,y,Math.random() * 100);
   }

   let z = -(A*x + B*x + D)/C;
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

  project(projectionData, projection, label) {
    //We will represent the plane as a quad defined by the crossings with the volume
    //TODO: test shrinking
    let quad;
    let { volume } = { ...projectionData };

    //Let's first do the axial parallels
    // if (this.isParallelTo(Plane.Oxz)) {
    //   log.debug('parallel to oxz')
    //   if (this.pt.y > volume.h/2 || this.pt.y < -volume.h/2) return []; //plane is outside volume
    //   //we need to cross all but the top wall and the bottom wall of the mini-volume
    //   let leftCross = this.intersect(Plane.Oyz.parallelThrough(new Point(-volume.w/2,0,0))),
    //   rightCross = this.intersect(Plane.Oyz.parallelThrough(new Point(volume.w/2,0,0))),
    //   frontCross = this.intersect(Plane.Oxy),
    //   backCross = this.intersect(Plane.Oxy.parallelThrough(new Point(0,0,volume.d)));
    //   quad = new Quad(
    //     frontCross.intersect(leftCross),
    //     frontCross.intersect(rightCross),
    //     backCross.intersect(rightCross),
    //     backCross.intersect(leftCross)
    //   );
    // } else if (this.isParallelTo(Plane.Oxy)) {
    //   if (this.pt.z > volume.d || this.pt.z < 0) return []; //plane is outside volume
    //   //we need to cross all but the front wall and the back wall of the mini-volume
    //   let leftCross = this.intersect(Plane.Oyz.parallelThrough(new Point(-volume.w/2,0,0))),
    //   rightCross = this.intersect(Plane.Oyz.parallelThrough(new Point(volume.w/2,0,0))),
    //   topCross = this.intersect(Plane.Oxz.parallelThrough(new Point(0,volume.h/2,0,0)));
    //   bottomCross = this.intersect(Plane.Oxz.parallelThrough(new Point(0,-volume.h/2,0,0)));
    //   quad = new Quad(
    //     topCross.intersect(leftCross),
    //     topCross.intersect(rightCross),
    //     bottomCross.intersect(rightCross),
    //     bottomCross.intersect(leftCross)
    //   );
    // } else if (this.isParallelTo(Plane.Oyz)) {
    //   if (this.pt.x > volume.w/2 || this.pt.x < -volume.w/2) return []; //plane is outside volume
    //   //we need to cross all but the left wall and the right wall of the mini-volume
    //   let frontCross = this.intersect(Plane.Oxy),
    //   backCross = this.intersect(Plane.Oxy.parallelThrough(new Point(0,0,volume.d))),
    //   topCross = this.intersect(Plane.Oxz.parallelThrough(new Point(0,volume.h/2,0,0))),
    //   bottomCross = this.intersect(Plane.Oxz.parallelThrough(new Point(0,-volume.h/2,0,0)));
    //   quad = new Quad(
    //     topCross.intersect(backCross),
    //     topCross.intersect(frontCross),
    //     bottomCross.intersect(frontCross),
    //     bottomCross.intersect(backCross)
    //   );
    // } else {
      //now we need to cross possibly everything; so lets find out a cross that yields us 4 points in the volume
      //note that there may not be such
      let leftCross = this.intersect(Plane.Oyz.parallelThrough(new Point(-volume.w/2,0,0))),
      rightCross = this.intersect(Plane.Oyz.parallelThrough(new Point(volume.w/2,0,0))),
      frontCross = this.intersect(Plane.Oxy.parallelThrough(new Point(0,0,volume.d/2))),
      backCross = this.intersect(Plane.Oxy.parallelThrough(new Point(0,0,volume.d))),
      topCross = this.intersect(Plane.Oxz.parallelThrough(new Point(0,volume.h/2,0,0))),
      bottomCross = this.intersect(Plane.Oxz.parallelThrough(new Point(0,-volume.h/2,0,0)));

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

      quad = new Quad(...sortVertices(crossings.filter(c => c && pointInVolume(c,volume)), this));
    // }

    //TODO: shrink
    log.debug('quad is ready ', quad)
    return quad.project(projectionData, projection, label, 'rgba(124,240,10,0.5)');
  }
}