import { Item, Polygon2D, Segment2D } from '../item.js';
import { Point } from './point.js';
import { Vector } from '../vectors.js';
import { midpoint, centroid } from '../util.js';

import log from 'loglevel';

const DEFAULT_SIDE = 100;

export class Cube extends Item {
/**
 * Cube type definition

 D1—————C1
A1————B1|
| :   | |
| D---|-C
A—————B

 *
 */

 //TODO: switch to a base and direction

  A; B; v; // AB is a side of the cube, v is a vector that is not colinear with them, so that ABv is the wall ABCD
  side;
  sign; //TODO: should we also use this for prism, pyramid, etc?

  constructor(A, B, v, sign = 1) {
    super();
    this.A = A;
    this.B = B;
    this.v = v;
    this.side = A.vectorTo(B).norm;
    this.sign = sign;
  }

  get A1() {
    return this.A.add(this.A.vectorTo(this.B).cross(this.v).unit().scale(this.sign*this.side));
  }

  get B1() {
    return this.A1.add(this.A.vectorTo(this.B));
  }

  get D() {
    return this.A.add(this.A.vectorTo(this.A1).cross(this.A.vectorTo(this.B)).unit().scale(this.sign*this.side));
  }

  get C() {
    return this.D.add(this.A.vectorTo(this.B));
  }

  get D1() {
    return this.D.add(this.A.vectorTo(this.A1));
  }

  get C1() {
    return this.C.add(this.A.vectorTo(this.A1));
  }

  get cen() {
    return this.A.add(this.side/2, this.side/2, this.side/2);
  }

  // get faces() {
  //   return [
  //   ];
  // }

  // get edges() {
  //   return [

  //   ];
  // }

  get vertices() {
    return [
      this.A, this.B, this.C, this.D,
      this.A1, this.B1, this.C1, this.D1
    ];
  }

  // static fromDiagonalPoints(d1, d2) {

  // }

  // static fromCentreLengthAngle(cen, len, ang) {
  //   // TODO: ang
  //   return new Cube(Array.from(Array(10), (_, i) => {
  //     return Point.fromRadiusVector(cen.rvector.add(new Vector(
  //       (-1)**i, (-1)**Math.floor(i/2), (-1)**Math.floor(i/4)
  //     ).scale(len/2)))
  //   }));
  // }

  //TODO: fix the cube to have a base and add new constructors
  get labelPosition() {
    return centroid(this.A, this.B, this.C, this.D);
  }

  static fromCentreAndParallelToAxi(cen, len) {
    //if the cube is parallel to the axi then the vector from A to CEN is radius times the unit vector
    len = len ?? DEFAULT_SIDE;
    let A = cen.add(new Vector(-len/2,-len/2,-len/2));
    let B = cen.add(new Vector(len/2,-len/2,-len/2));
    let v = A.vectorTo(cen.add(new Vector(len/2,-len/2,len/2))); //let's use C
    return new Cube(A, B, v);
  }

  static fromBaseAndLength(base, len, direction) {
    //TODO: finish this
  }

  project(projectionData, projection) {
    return [
      // first wall
      new Polygon2D([this.A, this.B, this.C, this.D].map(v => projection.projectPoint(v, projectionData))),
      // second wall
      new Polygon2D([this.A1, this.B1, this.C1, this.D1].map(v => projection.projectPoint(v, projectionData))),
      // connecting edges
      new Segment2D(this.A.project(projectionData, projection), this.A1.project(projectionData, projection)),
      new Segment2D(this.B.project(projectionData, projection), this.B1.project(projectionData, projection)),
      new Segment2D(this.C.project(projectionData, projection), this.C1.project(projectionData, projection)),
      new Segment2D(this.D.project(projectionData, projection), this.D1.project(projectionData, projection)),
    ];
  }

}