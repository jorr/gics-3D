//import { Item, Polygon2D, Segment2D } from '../item.js';
import { Polyhedron } from './polyhedron.js';
import { Point } from './point.js';
import { Polygon } from './polygon.js';
import { Segment } from './segment.js';
import { Rectangle } from './regularquad.js';
import { dist } from '../util.js';
import { ImpossibleOperationError } from '../../errors.js';

import log from 'loglevel';

export class Prism extends Polyhedron {

  base1;
  base2;
  direction;

  //NOTE: having two bases in the constructor makes it needlessly hard to construct the edges
  constructor(base, direction) {
    super();
    this.base1 = base;
    if (!base instanceof Polygon) {
      throw new ImpossibleOperationError('Prism\'s base needs to be a polygon');
    }

    this.base2 = new base.constructor(...base.vertices.map(v => v.add(direction)));
    this.direction = new Segment(base.A, base.A.add(direction));
  }

  get vertices() {
    return [].concat(this.base1.vertices, this.base2.vertices);
  }

  get faces() {
    return [
      this.base1,
      this.base2,
      ...this.base1.edges.map(e => new Rectangle(e.p1, e.p2, e.p2.add(this.direction.asVector())))
    ];
  }

  get edges() {
    return [
      // first wall
      ...this.base.edges,
      // second wall
      ...this.base2.edges,
      // connecting edges
      this.base.vertices.map(v => new Segment(v, v.add(this.direction.asVector())))
    ];
  }

  get labelPosition() {
    return new Segment(this.base1.cen, this.base2.cen).labelPosition;
  }

  translate(by) { return new Prism(this.base.translate(by), this.direction); }
  rotate(by,around) { return new Prism(this.base.rotate(by,around), this.direction.rotate(by,around));  }
  scale(by) { return new Prism(this.base.scale(by), this.direction.scale(by)); }

  // project(projectionData, projection) {
  //   return [
  //     // first base
  //     this.base1.project(projectionData, projection),
  //     // second base
  //     this.base2.project(projectionData, projection),
  //     // connecting edges
  //     this.edges.map(e => e.project(projectionData, projection))
  //   ];
  // }

}