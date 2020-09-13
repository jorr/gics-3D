import { Point } from './items/point.js';
import { Point2D } from './item.js';
import { pointInVolume } from './util.js';

class Projection {
  projectPoint(p, camera, screen, volume) {
    return null;
    // return Point2D
  }
}

export class CabinetProjection extends Projection {
  angle = Math.atan(2);
  shortening = 0.5;

  projectPoint(p, camera, screen, volume) {
    if (!pointInVolume(p, volume)) return null;
    let px = p.x + this.shortening*p.z*Math.cos(this.angle),
        py = p.y + this.shortening*p.z*Math.sin(this.angle);

    //TODO: do we need the lines below for SVG?
    // normalize px and py to [0,1]
    px = (px + 0.5*screen.w) / screen.w;
    py = (py + 0.5*screen.h) / screen.h;
    // move to raster space
    px = Math.floor(px * screen.w);
    py = Math.floor(py * screen.h);

    return Object.assign(new Point2D, { x: px, y: py });
  }
}