import { Item, Polygon2D, Segment2D } from '../item.js';
import { Point } from './point.js';
import { Segment } from './segment.js';
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

  base; direction;

  constructor(base, direction) { //TODO: do we need direction, it can be calculated?
    super();

    this.base = base;
    this.direction = new Segment(this.base.A, this.base.A.add(direction));;
  }

  get cen() {
    return this.base.A.add(new Vector(this.base.side/2, this.base.side/2, this.base.side/2));
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
    return this.base.vertices.concat(this.base.vertices.map(v => v.add(this.direction.asVector())));
  }

  get labelPosition() {
    return centroid(this.base.vertices);
  }

  translate(by) { return new Cube(this.base.translate(by), this.direction); }
  rotate(by,around) { return new Cube(this.base.rotate(by,around), this.direction.rotate(by,around));  }
  scale(by) { return new Cube(this.base.scale(by), this.direction.scale(by)); }

  project(projectionData, projection) {
    return [
      // first wall
      new Polygon2D(this.base.vertices.map(v => projection.projectPoint(v, projectionData))),
      // second wall
      new Polygon2D(this.base.vertices.map(v => projection.projectPoint(v.add(this.direction.asVector()), projectionData))),
      // connecting edges
      this.base.vertices.map(v => new Segment(v, v.add(this.direction.asVector())).project(projectionData, projection)),
    ];
  }

}