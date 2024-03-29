import { Quad } from './quad.js';
import { Plane } from './plane.js';
import { centroid } from '../util.js';

import log from 'loglevel';

export class Square extends Quad {

   constructor(A, B, C) {
    super(A,B,C,A.add(B.vectorTo(C)));
   }

  get cen() {
    return centroid(this.vertices);
  }

   get side() {
    return this.A.vectorTo(this.B).norm;
   }

   pointsToTransform() {
    return [this.A, this.B, this.C, this.D];
  }
}

export class Rhomb extends Square {
  get angle() {
    return angle(this.A.vectorTo(this.B), this.A.vectorTo(this.D));
  }
}

export class Rectangle extends Square {
  get side() {
    throw new MethodNotImplementedError('side', this);
  }

  get longerside() {
    let sideA = this.A.vectorTo(this.B).norm, sideB = this.A.vectorTo(this.D).norm;
    return Math.max(sideA, sideB);
  }

  get diagonalangle() {
    return angle(this.A.vectorTo(this.C), this.B.vectorTo(this.D));
  }

  sideAsSegment(long = true) {
    let sideA = this.A.vectorTo(this.B).norm, sideB = this.A.vectorTo(this.D).norm;
    return sideA > sideB ? new Segment(this.A, this.B) : new Segment(this.A, this.D);
  }

}

export class Parallelogram extends Rectangle {
  get angle() {
    return angle(this.A.vectorTo(this.B), this.A.vectorTo(this.D));
  }
}