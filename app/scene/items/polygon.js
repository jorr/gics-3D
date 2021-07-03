import { Item, Polygon2D } from '../item.js';
import { Segment } from './segment.js';

import log from 'loglevel';

export class Polygon extends Item {
  plane; n; // number of vertices

  constructor(n, plane) {
    super();
    this.n = n;
    this.plane = plane;

    return new Proxy(this, {
      get: function(target, prop, receiver) {
        if (target[prop]) return Reflect.get(...arguments);
        let v1 = target[prop[0]], v2 = target[prop[1]];
        if (v1 && v2) return new Segment(v1,v2);

        return undefined;
      }
    });
  }

  project(projectionData, projection, label, color) {
    return Object.assign(new Polygon2D(this.vertices.map(v => projection.projectPoint(v, projectionData))), {
      label, color
    });
  }
}