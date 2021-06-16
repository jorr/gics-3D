import { Item } from '../item.js';
import { Point } from './point.js';
import { Segment } from './segment.js';
import { dist } from '../util.js';

import log from 'loglevel';

export class Cone extends Item {

  base; apex;

  constructor(base, apex) {
    super();
    this.base = base;
    this.apex = apex;
  }

  edge(direction) {
    let bpoint = this.base.pointOnCircle(direction);
    // log.debug(bpoint)
    // log.debug(this.apex)
    return new Segment(bpoint, this.apex);
  }

  project(projectionData, projection, label) {
    let direction = projectionData.camera.vectorTo(Point.Origin).perpendicular(this.base.plane).unit();
    return [
      // base
      this.base.project(projectionData, projection, label),
      // connecting edges
      // get the diameter that lies on the line perpendicular to the camera-origin vector
      this.edge(direction).project(projectionData, projection),
      this.edge(direction.scale(-1)).project(projectionData, projection)
    ];
  }

}