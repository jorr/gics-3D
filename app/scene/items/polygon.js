import { Item, Polygon2D, Angle2D } from '../item.js';
import { Segment } from './segment.js';
import { centroid } from '../util.js';

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

  get edges() {
    return this.vertices.map((v,i) => new Segment(v, this.vertices[(i+1)%this.vertices.length]));
  }

  get labelPosition() {
    return centroid(this.vertices);
  }

  get cen() {
    return centroid(this.vertices);
  }

  project(projectionData, projection) {
    return new Polygon2D(this.vertices.map(v => projection.projectPoint(v, projectionData)));
  }
};