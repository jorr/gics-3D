import { Item, Segment2D, Point2D } from '../item.js';
import { Point } from './point.js';
import { Segment } from './segment.js';
// import { dist } from '../util.js';

import log from 'loglevel';

export class Cone extends Item {

  base; apex;

  constructor(base, apex) {
    super();
    this.base = base;
    this.apex = apex;
  }

  project(projectionData, projection, label) {
    let mainAxisProjectionOut = {p1: null, p2: null};
    let baseProjection = this.base.project(projectionData, projection, label, mainAxisProjectionOut);
    let apexProjection = this.apex.project(projectionData, projection);
    return [
      // base
      baseProjection,
      // connecting edges
      new Segment2D(mainAxisProjectionOut.p1, apexProjection),
      new Segment2D(mainAxisProjectionOut.p2, apexProjection),
    ];
  }

}