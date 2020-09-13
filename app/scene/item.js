import path from 'path';
import fs from 'fs';

export class Item {
  project(camera, screen, volume, label) {}
};

export class Vector {
  /**
   * Vector type definition
   * @property {number} x
   * @property {number} y
   * @property {number} z
   */
   x; y; z;

   constructor(x,y,z) {
    this.x = x;
    this.y = y;
    this.z = z;
   }

   dot(v) {
    return this.x*v.x + this.y*v.y + this.z*v.z;
   }

   cross(v) {
    return new Vector({
      x: this.y*v.z - this.z*v.y,
      y: this.z*v.x - this.x*v.z,
      z: this.x*v.y - this.y*v.x
    });
   }
};

class Element2D {
  label;
}

export class Point2D extends Element2D {
  x; y;
}

export class Segment2D extends Element2D {
  p1; p2;
}

export class Polygon2D extends Element2D {
  points;
}

export class Ellipse2D extends Element2D {
  c; rx; ry; rot;
}