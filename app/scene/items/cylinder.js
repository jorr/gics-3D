import { Item, Segment2D, Point2D } from '../item.js';
import { Point } from './point.js';
import { Segment } from './segment.js';
import { dist, midpoint } from '../util.js';

import log from 'loglevel';

export class Cylinder extends Item {

  base1;
  base2;
  side;

  constructor(base1, base2) {
    super();
    this.base1 = base1;
    this.base2 = base2;
    this.side = dist(base1.cen, base2.cen);
  }

  // edge(direction) {
  //   let b1point = this.base1.pointOnCircle(direction);
  //   let sideVector = this.base1.cen.vectorTo(this.base2.cen);
  //   return new Segment(b1point, b1point.add(sideVector));
  // }

  get labelPosition() {
    return midpoint(base1.cen, base2.cen);
  }

  project(projectionData, projection) {
    //let direction = projectionData.camera.vectorTo(Point.Origin).perpendicular(this.base1.plane).unit();
    // let screenPlane = projection.screenPlane(projectionData.camera, projectionData.volume);
    // let direction = projectionData.camera.vectorTo(project(projectionData.camera, screenPlane)).perpendicular(this.base1.plane).unit();

    let mainAxisBase1ProjectionOut = {p1: null, p2: null};
    let base1Projection = this.base1.project(projectionData, projection, mainAxisBase1ProjectionOut);
    let mainAxisBase2ProjectionOut = {p1: null, p2: null};
    let base2Projection = this.base2.project(projectionData, projection, mainAxisBase2ProjectionOut);

    return [
      // bases
      base1Projection, base2Projection,
      // connecting edges
      new Segment2D(mainAxisBase1ProjectionOut.p1, mainAxisBase2ProjectionOut.p1),
      new Segment2D(mainAxisBase1ProjectionOut.p2, mainAxisBase2ProjectionOut.p2)
    ];


    // return [
    //   // first base
    //   this.base1.project(projectionData, projection, label),
    //   // second base
    //   this.base2.project(projectionData, projection),
    //   // connecting edges
    //   // get the diameter that lies on the line perpendicular to the camera-origin vector
    //   this.edge(direction).project(projectionData, projection),
    //   this.edge(direction.scale(-1)).project(projectionData, projection)
    // ];
  }

}