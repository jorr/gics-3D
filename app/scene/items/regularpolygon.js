import { Polygon, Polygon2D } from '../item.js';
import { Plane } from './plane.js';

import log from 'loglevel';

export class RegularPolygon extends Polygon {
  vertices;

  constructor(vertices) {
    log.debug('VV: ',vertices)
    super(vertices.length, new Plane(vertices[0], vertices[0].vectorTo(vertices[1]).cross(vertices[1].vectorTo(vertices[2]))));

    this.vertices = vertices;
  }

  get side() {
    return this.vertices[0].vectorTo(this.vertices[1]).norm;
  }

  pointsToTransform() {
    return this.vertices;
  }

  project(projectionData, projection, label) {
    return Object.assign(
      new Polygon2D(this.vertices.map(v => projection.projectPoint(v, projectionData))),
      { label }
    );
  }
}