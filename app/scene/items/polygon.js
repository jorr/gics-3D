import { Item, Polygon2D, Angle2D } from '../item.js';
import { Segment } from './segment.js';
import { Line } from './line.js';
import { Plane } from './plane.js';
import { centroid, pointInPolygon } from '../util.js';
import { ImpossibleOperationError } from '../../errors.js';

import log from 'loglevel';

export class Polygon extends Item {
  vertices; plane;

  constructor(vertices, plane) {
    super();
    this.vertices = vertices;
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

  intersect(arg) {
    if (arg instanceof Line) {
      let p = arg.intersect(this.plane);
      if (!p) {
        //line is parallel to polygon
        if (this.plane.hasPoint(arg.pt)) {
          //line lies in polygon
          let crossings = this.edges.map(e => e.intersect(arg)).filter(c => !!c);
          if (crossings.length == 0) return null;
          else if (crossings.length == 1) return crossings[0];
          return new Segment(crossings[0], crossings[1]);
        }
        else return null;
      }
      return pointInPolygon(p, this.vertices) ? p : null;
    }
    else if (arg instanceof Plane) {
      let crossLine = this.plane.intersect(arg);
      return crossLine ? this.intersect(crossLine) : null;
    }
    else throw new ImpossibleOperationError("Bodies can only be intersected by lines and planes");
  }

  shrink(factor) {
    let centre = this.cen;
    return new Polygon(this.vertices.map(v => v.add(v.vectorTo(centre).scale(factor))));
  }

  project(projectionData, projection) {
    return new Polygon2D(this.vertices.map(v => projection.projectPoint(v, projectionData)));
  }
};