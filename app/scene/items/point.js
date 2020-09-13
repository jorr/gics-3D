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
    return new Vector({
      x: p.x - this.x,
      y: p.y - this.y,
      z: p.z - this.y
    });
   }

   project(camera, screen, volume, label) {
      return Object.assign(new Point2D,{
        x: this.x,
        y: this.y,
        label
      });
   }
}