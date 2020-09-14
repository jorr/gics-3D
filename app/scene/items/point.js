import { Item, Vector, Point2D } from '../item.js';

export class Point extends Item {
    /**
   * Point type definition
   * @property {Vector} rvector;
   */
   rvector;

   constructor(rvector) {
    super();
    this.rvector = rvector;
   }

   get x() { return this.rvector.x; }
   get y() { return this.rvector.y; }
   get z() { return this.rvector.z; }

   vectorTo(p) {
    return new Vector(
      p.x - this.x,
      p.y - this.y,
      p.z - this.z
    );
   }

   project(camera, screen, volume, projection, label) {
    let projected = projection.projectPoint(this, camera, screen, volume);
    projected.label = label;
    return projected;
   }
}