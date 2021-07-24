import { Polygon } from './polygon.js';
import { Plane } from './plane.js';

import log from 'loglevel';

export class Quad extends Polygon {
  /**
   * Square type definition
   * @property {Point} A, B, C, D
   */
   A; B; C; D;

   constructor(A, B, C, D) {
    let n = A.vectorTo(B).cross(A.vectorTo(C)).unit();
    if (n.y < 0) n = n.scale(-1); //TODO: check rhs vs lhs in a smarter way
    super(4, new Plane(A, n));

    this.A = A; this.B = B; this.C = C; this.D = D;
   }

   //we use this.constructor here in order to assign proper type on descendants
  translate(by) { return new this.constructor(...this.vertices.map(v => v.translate(by))); }
  rotate(by,around) { return new this.constructor(...this.vertices.map(v => v.rotate(by,around)));  }
  scale(by) { return new this.constructor(...this.vertices.map(v => this.cen.add(this.cen.vectorTo(v).scale(by)))); }

  get vertices() {
    return [this.A, this.B, this.C, this.D];
  }
}