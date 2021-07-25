//import { Item, Polygon2D, Segment2D } from '../item.js';
import { Polyhedron } from './polyhedron.js';
import { Point } from './point.js';
import { Triangle } from './triangle.js';
import { Segment } from './segment.js';

import log from 'loglevel';

export class Pyramid extends Polyhedron {

  base; apex;

  constructor(base, apex) {
    super();
    this.base = base;
    this.apex = apex;
  }

  get vertices() {
    return [this.apex, ...this.base.vertices];
  }

  get faces() {
    return [
      this.base,
      ...this.base.edges.map(e => new Triangle(e.p1, e.p2, this.apex))
    ];
  }

  get edges() {
    return [
      ...this.base.edges,
      this.base.vertices.map(v => new Segment(v, this.apex))
    ];
  }

  get labelPosition() {
    return new Segment(this.base.cen,this.apex).labelPosition;
  }

  translate(by) { return new Pyramid(this.base.translate(by), this.apex.translate(by)); }
  rotate(by,around) { return new Pyramid(this.base.rotate(by,around), this.apex.rotate(by,around));  }
  scale(by) { return new Pyramid(this.base.scale(by), this.base.cen.add(this.base.cen.vectorTo(this.apex).scale(by))); }

  // project(projectionData, projection) {
  //   let apexProjection = this.apex.project(projectionData, projection);
  //   return [
  //     // base
  //     this.base.project(projectionData, projection), apexProjection,
  //     // connecting edges
  //     this.base.vertices.map(v => new Segment2D(v.project(projectionData, projection), apexProjection))
  //   ];
  // }

}