import { Item } from '../item.js';
import { Point } from './point.js';
import { Plane } from './plane.js';
import { Vector } from '../vectors.js';
import { Circle } from './circle.js';

import log from 'loglevel';

export class Sphere extends Item {

  cen; rad;

  constructor(centre, radius) {
    super();
    this.cen = centre;
    this.rad = radius;
  }

  get labelPosition() {
    return this.cen;
  }

  project(projectionData, projection) {

    let screenPlane = projection.screenPlane(projectionData.camera, projectionData.volume);
    //let's first draw a circle in the screen plane
    let mainCircle = new Circle(this.cen, this.rad, screenPlane);
    //TODO: fix when circles are fixed
    let circumferenceN = screenPlane.getCoplanarVector(); //screenPlane.n.isCollinearWith(Vector.UnitY) ? screenPlane.getCoplanarVector() : Vector.UnitY;
    let circumferenceCircle = new Circle(this.cen, this.rad, new Plane(this.cen, circumferenceN));

    //let direction = projectionData.camera.vectorTo(project(projectionData.camera, screenPlane)).perpendicular(this.base1.plane).unit();

    // let mainAxisProjectionOut = {p1: null, p2: null};
    // let baseProjection = this.base.project(projectionData, projection, mainAxisProjectionOut);
    // let apexProjection = this.apex.project(projectionData, projection);
    return [
      mainCircle.project(projectionData, projection),
      circumferenceCircle.project(projectionData, projection)
    ];
  }

}