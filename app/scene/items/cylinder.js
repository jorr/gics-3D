import { Item } from '../item.js';
import { Point } from './point.js';
import { Segment } from './segment.js';
import { dist } from '../util.js';

import log from 'loglevel';

const DEFAULT_SIDE = 100;

export class Cylinder extends Item {

  base1;
  base2;
  side;

  constructor(base1, base2) {
    super();
    this.base1 = base1;
    this.base2 = base2;
    log.debug(base2);
    this.side = dist(base1.cen, base2.cen);
  }

  edge(direction) {
    let b1point = this.base1.pointOnCircle(direction);
    let sideVector = this.base1.cen.vectorTo(this.base2.cen);
    return new Segment(b1point, b1point.add(sideVector));
  }

  project(projectionData, projection, label) {
    let direction = projectionData.camera.vectorTo(Point.Origin).perpendicular(this.base1.plane).unit();
    return [
      // first base
      this.base1.project(projectionData, projection, label),
      // second base
      this.base2.project(projectionData, projection),
      // connecting edges
      // get the diameter that lies on the line perpendicular to the camera-origin vector
      this.edge(direction).project(projectionData, projection),
      this.edge(direction.scale(-1)).project(projectionData, projection)
    ];
  }

}