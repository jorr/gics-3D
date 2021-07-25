import { Item } from '../item.js';
import { Point } from './point.js';
import { Plane } from './plane.js';
import { Line } from './line.js';
import { Vector } from '../vectors.js';
import { Circle } from './circle.js';
import { dist } from '../util.js';

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

  translate(by) { return new Sphere(this.cen.translate(by), this.rad); }
  rotate(by,around) { return new Sphere(this.cen.rotate(by,around), this.rad);  }
  scale(by) { return new Sphere(this.cen, this.rad*by); }

  intersect(arg) {
    if (arg instanceof Line) {
      //absolutely the same as the circle case
      //this implements: https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-sphere-intersection
      let d = dist(this.cen, arg);
      if (d > this.rad) return null; //the line doesn't cross the sphere
      if (d == this.rad) return this.cen.projectionOn(arg); //line is tangent to sphere
      //line actually crosses the sphere, we need to find the segment
      let P = this.cen.projectionOn(arg);
      let PP1 = Math.sqrt(this.rad**2 - d**2);
      let PPt = dist(arg.pt, P);
      //note that we store lines with unit vectors and so we can use the lengths as params
      return new Segment(arg.getPointAtParam(PPt-PP1), arg.getPointAtParam(PPt+PP1));
    } else if (arg instanceof Plane) {
      let P = this.cen.projectionOn(arg);
      let d = dist(this.cen, arg);
      let r = Math.sqrt(this.rad**2 - d**2);
      return new Circle(P, r, arg);
    }
    else throw new ImpossibleOperationError("Bodies can only be intersected by lines and planes");
  }

  project(projectionData, projection) {

    let screenPlane = projection.screenPlane(projectionData.camera, projectionData.volume);
    //let's first draw a circle in the screen plane
    let mainCircle = new Circle(this.cen, this.rad, screenPlane);

    //let circumferenceN = screenPlane.getCoplanarVector(); //screenPlane.n.isCollinearWith(Vector.UnitY) ? screenPlane.getCoplanarVector() : Vector.UnitY;
    let circumferenceCircle = new Circle(this.cen, this.rad, new Plane(this.cen, screenPlane.n.perpendicular()));

    //let direction = projectionData.camera.vectorTo(project(projectionData.camera, screenPlane)).perpendicular(this.base1.plane).unit();

    // let mainAxisProjectionOut = {p1: null, p2: null};
    // let baseProjection = this.base.project(projectionData, projection, mainAxisProjectionOut);
    // let apexProjection = this.apex.project(projectionData, projection);
    return [
      mainCircle.project(projectionData, projection),
      Object.assign(circumferenceCircle.project(projectionData, projection), { style: {linetype: 'dotted'}})
    ];
  }

}