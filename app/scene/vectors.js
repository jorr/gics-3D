import { intersect } from './util.js';
import { Plane } from './items/plane.js';
import { Line } from './items/line.js';

import log from 'loglevel';

export class Vector {
  /**
   * Vector type definition
   * @property {number} x
   * @property {number} y
   * @property {number} z
   */
  x; y; z;

  constructor(x,y,z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  get norm() {
    return Math.sqrt(this.x**2 + this.y**2 + this.z**2);
  }

  isCollinearWith(v) {
    return !this.cross(v).isNonZero();
  }

  isNonZero() {
    return this.x !=0 || this.y !=0 || this.z != 0;
  }

  dot(v) {
    return this.x*v.x + this.y*v.y + this.z*v.z;
  }

  cross(v) {
    return new Vector(
      this.y*v.z - this.z*v.y,
      this.z*v.x - this.x*v.z,
      this.x*v.y - this.y*v.x
    );
  }

  triple(v1, v2) {
    return this.cross(v1).dot(v2);
  }

  add(v) {
    return new Vector(
      this.x + v.x,
      this.y + v.y,
      this.z + v.z
    );
  }

  reverse() {
    return new Vector(
      -this.x,
      -this.y,
      -this.z
    );
  }

  scale(n) {
    return new Vector(
      n*this.x, n*this.y, n*this.z
    );
  }

  unit() {
    const m = this.norm;
    return new Vector(
      this.x/m, this.y/m, this.z/m
    );
  }

  //finds a vector perpendicular to the current vector, lying in a plane
  perpendicular(plane) {
    if (!plane || plane.n.isCollinearWith(this)) {
      // find the cross product with any vector, non-collinear with this
      let v = Line.Oz.u;
      if (this.isCollinearWith(v)) v = Line.Ox.u;
      return this.cross(v).unit();
    } else {
      // build a plane with the given vector as normal
      let normalPlane = new Plane(plane.pt, this);
      let crossing = intersect(plane, normalPlane);
      return crossing.u.unit();
    }
  }

  rotate(axis, angle) {
    let uaxis = axis.unit();
    return uaxis.scale((1 - Math.cos(angle))*uaxis.dot(this))
      .add(this.scale(Math.cos(angle))).add(uaxis.cross(this).scale(Math.sin(angle)));
  }

  static random() {
    return new Vector(Math.random(), Math.random(), Math.random());
  }

};

export class Matrix {
  /**
    * Matrix type definition
   * @property {number[][]} matrix
   */
  matrix;

  multiplyBy(m) {
    let result = new Array(this.matrix.length).fill(0).map(row => new Array(m[0].length).fill(0));

    return result.map((row, i) => {
        return row.map((val, j) => {
            return this.matrix[i].reduce((sum, elm, k) => sum + (elm*m[k][j]) ,0)
        })
    })
  }

  inverse() {
    return matrix;
    //TODO: inverse
  }
}
