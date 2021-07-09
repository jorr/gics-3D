import { Item, Polygon2D, Segment2D } from '../item.js';
import { Point } from './point.js';
import { Segment } from './segment.js';
import { Vector } from '../vectors.js';
import { Square, Rectangle } from './regularquad.js';

import log from 'loglevel';

export class Cuboid extends Item {
/**
 * Cube type definition

 D1—————C1
A1————B1|
| :   | |
| D---|-C
A—————B

 *
 */

  base;
  direction;

  constructor(base, direction) {
    super();
    if (!(base instanceof Rectangle) && !(base instanceof Square))
      throw new ImpossibleOperationError('A cuboid must have a rectangle base');
    this.base = base;
    this.direction = direction;
  }

  get cen() {
    return new Segment(this.base.A, this.base.C.add(this.direction)).
      intersect(new Segment(this.base.B, this.base.D.add(this.direction)));
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
    return this.base.vertices.concat(this.base.vertices.map(v => v.add(this.direction)));
  }

  get labelPosition() {
    return this.base.labelPosition;
  }

  project(projectionData, projection) {
    return [
      // first wall
      this.base.project(projectionData, projection),
      // second wall
      new Polygon2D(this.base.vertices.map(v => projection.projectPoint(v.add(this.direction), projectionData))),
      // connecting edges
      this.base.vertices.map(v => new Segment(v, v.add(this.direction)).project(projectionData, projection)),
    ];
  }

}