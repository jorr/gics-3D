import { Polygon } from './polygon.js';
import { Plane } from './plane.js';
import { Segment } from './segment.js';

import log from 'loglevel';

export class Triangle extends Polygon {
   A; B; C;

   constructor(A, B, C) {
    let n = A.vectorTo(B).cross(A.vectorTo(C)).unit();
    if (n.y < 0) n = n.scale(-1); //TODO: check rhs vs lhs in a smarter way
    super([A,B,C], new Plane(A, n));

    this.A = A; this.B = B; this.C = C;
   }

  get a() {
    return new Segment(this.B, this.C);
  }

  get b() {
    return new Segment(this.A, this.C);
  }

  get c() {
    return new Segment(this.A, this.B);
  }

  translate(by) { return new this.constructor(...this.vertices.map(v => v.translate(by))); }
  rotate(by,around) { return new this.constructor(...this.vertices.map(v => v.rotate(by,around)));  }
  scale(by) { return new this.constructor(...this.vertices.map(v => v.add(v.vectorTo(this.cen).scale(by)))); }
}