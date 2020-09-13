import { Item, Segment2D } from '../item.js';
import { Point } from './point.js';
import { dist } from '../util.js';


export class Segment extends Item {
  /**
   * Segment type definition
   * @property {Point} p1
   * @property {Point} p2
   */
   p1; p2;

   constructor(p1, p2) {
    super();

    this.p1 = p1;
    this.p2 = p2;
   }

   get len() {
    return dist(p2,p1);
   }

   project(camera, screen, volume, projection, label) {
    //TODO: there is a redundancy here because the endpoints are bound and we are drawing them twice. Solve?
    //can do a flag
    let projectedP1 = projection.projectPoint(this.p1, camera, screen, volume),
        projectedP2 = projection.projectPoint(this.p2, camera, screen, volume);
    return Object.assign(new Segment2D,{
      p1: projectedP1,
      p2: projectedP2,
      label
    });
   }
}