import { Item, Polygon2D, Segment2D } from '../item.js';
import { Point } from './point.js';
import { Vector } from '../vectors.js';
import { midpoint } from '../util.js';

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

 //TODO: consider A,B,C....also direction?

  A; B; v; // AB is a side of the cube, v is a vector that is not colinear with them, so that ABv is the wall ABCD
  side;
  sign;

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

  // get vertices() {
  //   return [
  //     this.A, this.B, this.C, this.D,
  //     this.A1, this.B1, this.C1, this.D1
  //   ];
  // }

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

  static fromCentreAndParallelToAxi(cen, len) {
    //if the cube is parallel to the axi then the vector from A to CEN is radius times the unit vector
    len = len ?? DEFAULT_SIDE;
    let A = cen.add(new Vector(-len/2,-len/2,-len/2));
    let B = cen.add(new Vector(len/2,-len/2,-len/2));
    let v = A.vectorTo(cen.add(new Vector(len/2,-len/2,len/2))); //let's use C
    return new Cube(A, B, v);
  }

  static fromBaseAndLength(base, len, direction) {
  }

  //  cen - centre
  // A,B,C,...,H - vertices
  // baseA - base closer to the origin
  // baseB - base farther to the origin
  // wallAB, wallAC.. - walls (squares)

  project(projectionData, projection, label) {
    return [
      // first wall
      Object.assign(new Polygon2D, {
        points: [this.A, this.B, this.C, this.D].map(v => {
          log.debug("vertex: ", v);
          log.debug("projected as: ", projection.projectPoint(v, projectionData))
          return projection.projectPoint(v, projectionData);
        }),
        label
      }),
      // second wall
      Object.assign(new Polygon2D, {
        points: [this.A1, this.B1, this.C1, this.D1].map(v => projection.projectPoint(v, projectionData))
      }),
      // connecting edges
      Object.assign(new Segment2D, { p1: this.A.project(projectionData, projection), p2: this.A1.project(projectionData, projection)}),
      Object.assign(new Segment2D, { p1: this.B.project(projectionData, projection), p2: this.B1.project(projectionData, projection)}),
      Object.assign(new Segment2D, { p1: this.C.project(projectionData, projection), p2: this.C1.project(projectionData, projection)}),
      Object.assign(new Segment2D, { p1: this.D.project(projectionData, projection), p2: this.D1.project(projectionData, projection)}),
    ];
  }

}