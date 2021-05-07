import { Point } from './items/point.js';
import { Vector } from './vectors.js';
import { Point2D } from './item.js';
import { pointInVolume } from './util.js';
import { Plane } from './items/plane.js';

class Projection {
  projectPoint(p, { camera, volume }) {
    return null;
    // return Point2D
  }

  screenSize(camera, volume) {
    return {x: 0, y: 0};
  }
}

export class CabinetProjection extends Projection {
  angle = Math.atan(2);
  shortening = 0.5;

  //TODO: log cutoff points
  projectPoint(p, { camera, volume }) {
    // if (!pointInVolume(p, volume)) return null;
    let px = p.x + this.shortening*p.z*Math.cos(this.angle),
        py = p.y + this.shortening*p.z*Math.sin(this.angle);

    // TODO: do we need the lines below for SVG?
    // normalize px and py to [0,1]
    px = (px + 0.5*screen.w) / screen.w;
    py = (py + 0.5*screen.h) / screen.h;
    // move to raster space
    px = Math.floor(px * screen.w);
    py = Math.floor(py * screen.h);

    return Object.assign(new Point2D, {x: px, y: py});
  }
}

export class PerspectiveProjection extends Projection {

  //TODO: log cutoff points
  projectPoint(p, { camera, volume }) {
    // console.log('projecting: ', p);
    // if (!pointInVolume(p, volume)) return null; // this doesnt seem to be necessary
    let direction = camera.vectorTo(p);
    let plane = this.screenPlane(camera, volume);

    // console.log('camera to p, ', direction);
    let projection = p.add(direction.scale(-plane.n.dot(plane.pt.vectorTo(p))/plane.n.dot(direction)));
    // console.log('projected: ', projection);

    return Object.assign(new Point2D, {x: projection.x, y: projection.y});
  }

  screenPlane(camera, volume) {
    // Assume screen is behind the viewing volume at a distance equal to the camera offset on Z
    // The screen is always perpendicular to Oz, so its normal vector is (0,0,-1)
    return new Plane(new Point(0,0,volume.d - camera.z), new Vector(0,0,-1));
  }

  screenSize(camera, volume) {
    // The screen size should accomodate viewing the endpoints of the volume
    let projectedEndpoints = [
      this.projectPoint(new Point(-volume.w/2,0,0), {camera, volume}),
      this.projectPoint(new Point(volume.w/2,0,0), {camera, volume}),
      this.projectPoint(new Point(0,-volume.h/2,0), {camera, volume}),
      this.projectPoint(new Point(0,volume.h/2,0), {camera, volume}),
    ];
    let size =  {
      w: projectedEndpoints[1].x - projectedEndpoints[0].x,
      h: projectedEndpoints[3].y - projectedEndpoints[2].y
    };
    console.log(size);
    return size;
  }
}