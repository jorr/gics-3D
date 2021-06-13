import { Item, Segment2D } from '../item.js';
import { Point } from './point.js';

import log from 'loglevel';

export class Pyramid extends Item {

  base; apex;

  constructor(base, apex) {
    super();
    this.base = base;
    this.apex = apex;
  }

  // edge(direction) {
  //   let b1point = this.base1.pointOnCircle(direction);
  //   let sideVector = this.base1.cen.vectorTo(this.base2.cen);
  //   return new Segment(b1point, b1point.add(sideVector));
  // }

  project(projectionData, projection, label) {
    let apexProjection = this.apex.project(projectionData, projection);
    return [
      // base
      this.base.project(projectionData, projection, label), apexProjection,
      // connecting edges
      this.base.vertices.map(v => {
        return Object.assign(new Segment2D, { p1: v.project(projectionData, projection), p2: apexProjection})
      })
    ];
  }

}