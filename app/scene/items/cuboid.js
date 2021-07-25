//import { Item, Polygon2D, Segment2D } from '../item.js';
import { Polyhedron } from './polyhedron.js';
import { Point } from './point.js';
import { Segment } from './segment.js';
import { Vector } from '../vectors.js';
import { Square, Rectangle } from './regularquad.js';

import log from 'loglevel';

export class Cuboid extends Polyhedron {
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
    this.direction = new Segment(this.base.A, this.base.A.add(direction));
  }

  get cen() {
    return new Segment(this.base.A, this.base.C.add(this.direction.asVector())).
      intersect(new Segment(this.base.B, this.base.D.add(this.direction.asVector())));
  }

  get faces() {
    return [
      this.base,
      this.base.translate(this.direction.asVector()),
      ...this.base.edges.map(e => new Rectangle(e.p1, e.p2, e.p2.add(this.direction.asVector())))
    ];
  }

  get edges() {
    return [
      // first wall
      ...this.base.edges,
      // second wall
      ...this.base.translate(this.direction.asVector()).edges,
      // connecting edges
      this.base.vertices.map(v => new Segment(v, v.add(this.direction.asVector())))
    ];
  }

  get vertices() {
    return this.base.vertices.concat(this.base.vertices.map(v => v.add(this.direction.asVector())));
  }

  get labelPosition() {
    return this.base.labelPosition;
  }

  translate(by) { return new Cuboid(this.base.translate(by), this.direction); }
  rotate(by,around) { return new Cuboid(this.base.rotate(by,around), this.direction.rotate(by,around));  }
  scale(by) { return new Cuboid(this.base.scale(by), this.direction.scale(by)); }

  // project(projectionData, projection) {
  //   return [
  //     // first wall
  //     this.base.project(projectionData, projection),
  //     // second wall
  //     new Polygon2D(this.base.vertices.map(v => projection.projectPoint(v.add(this.direction.asVector()), projectionData))),
  //     // connecting edges
  //     this.base.vertices.map(v => new Segment(v, v.add(this.direction.asVector())).project(projectionData, projection)),
  //   ];
  // }

}