import { Point } from './items/point.js';
import { Vector, Vector2D } from './vectors.js';
import { Point2D, Ellipse2D, Segment2D } from './item.js';
import { Plane } from './items/plane.js';
import { Line } from './items/line.js';
import { Segment } from './items/segment.js';
import { midpoint, dist, pointInVolume, angle } from './util.js';
import { dist2D, angle2D, ellipseConvertConjugateDiametersToAxes } from './util2d.js';

import log from 'loglevel';

class Projection {
  projectPoint(p, { camera, volume }) {
    throw new MethodNotImplemented('projectPoint', this);
    // return Point2D
  }

  projectCircle(circle, { camera, volume }) {
    throw new MethodNotImplemented('projectPoint', this);
    //return Point2D
  }

  screenPlane(camera, volume) {
    // Assume screen is behind the viewing volume
    // The screen is always perpendicular to Oz, so its normal vector is (0,0,-1)
    return new Plane(new Point(0,0,-100), new Vector(0,0,-1));
  }

  screenSize(camera, volume) {
    // The screen size should accomodate viewing the endpoints of the volume
    let projectedEndpoints = [
      this.projectPoint(new Point(-volume.w/2,0,0), {camera, volume}),
      this.projectPoint(new Point(volume.w/2,0,0), {camera, volume}),
      this.projectPoint(new Point(0,-volume.h/2,0), {camera, volume}),
      this.projectPoint(new Point(0,volume.h/2,0), {camera, volume}),
      this.projectPoint(new Point(-volume.w/2,0,volume.d), {camera, volume}),
      this.projectPoint(new Point(volume.w/2,0,volume.d), {camera, volume}),
      this.projectPoint(new Point(0,-volume.h/2,volume.d), {camera, volume}),
      this.projectPoint(new Point(0,volume.h/2,volume.d), {camera, volume}),
    ];
    let size =  {
      w: Math.max(projectedEndpoints[1].x, projectedEndpoints[5].x) - Math.min(projectedEndpoints[0].x, projectedEndpoints[4].x),
      h: Math.max(projectedEndpoints[3].y, projectedEndpoints[7].y) - Math.min(projectedEndpoints[2].y, projectedEndpoints[6].y)
    };
    return size;
  }
}

export class CabinetProjection extends Projection {
  angle = Math.PI/180*45; //Math.atan(2);
  shortening = 0.5;

  //direction = new Vector(0.5,0,1);

  //TODO: log cutoff points
  projectPoint(p, { camera, volume }) {
    // if (!pointInVolume(p, volume)) return null;
    let projection = { x: p.x + this.shortening*p.z*Math.cos(this.angle),
        y: p.y + this.shortening*p.z*Math.sin(this.angle) };

    // // TODO: do we need the lines below for SVG?
    // // normalize px and py to [0,1]
    // px = (px + 0.5*screen.w) / screen.w;
    // py = (py + 0.5*screen.h) / screen.h;
    // // move to raster space
    // px = Math.floor(px * screen.w);
    // py = Math.floor(py * screen.h);

    // return Object.assign(new Point2D, {x: px, y: py});
    // let plane = this.screenPlane(camera, volume);
    // let projection = p.add(this.direction.scale(-plane.n.dot(plane.pt.vectorTo(p))/plane.n.dot(this.direction)));
    // log.debug('projecting: ', p.x, p.y, p.z);
    // log.debug('projected at: ', projection.x, projection.y);

    return Object.assign(new Point2D, projection);
  }

  projectCircle(c, { camera, volume }, mainAxisProjectionOut = null) {
    let screenPlane = this.screenPlane(camera, volume), p1, p2,
        projectedP1, projectedP2, projectedCen, rx, ry, mainAxisSegment;
    let direction = screenPlane.n.perpendicular(c.plane).unit();

    p1 = c.cen.add(direction.scale(c.rad));
    p2 = c.cen.add(direction.scale(-c.rad));
    let conjugateDiamDirection = direction.perpendicular(c.plane).unit();
    let p3 = c.cen.add(conjugateDiamDirection.scale(c.rad));
    let p4 = c.cen.add(conjugateDiamDirection.scale(-c.rad));

    projectedP1 = this.projectPoint(p1, { camera, volume });
    projectedP2 = this.projectPoint(p2, { camera, volume });
    let projectedP3 = this.projectPoint(p3, { camera, volume });
    let projectedP4 = this.projectPoint(p4, { camera, volume });
    projectedCen = this.projectPoint(c.cen, { camera, volume });

    // log.debug('original centre ', c.cen)
    // log.debug('projected cen ', projectedCen)

    rx = dist2D(projectedP1, projectedP2)/2;
    ry = dist2D(projectedP3, projectedP4)/2;
    mainAxisSegment = Vector2D.fromPoints(projectedP1, projectedP2);

    let ellipseParams = ellipseConvertConjugateDiametersToAxes(
      projectedCen, new Segment2D(projectedP1, projectedP2), new Segment2D(projectedP3, projectedP4),
      mainAxisProjectionOut
    );

    delete ellipseParams.mainAxisProjectionOut;

    return Object.assign(new Ellipse2D, {
      c: projectedCen,
      ...ellipseParams
      // rx,
      // ry,
      // rotate: angle2D( // the angle between a radius of the ellipse and Ox in 2D
      //   mainAxisSegment,
      //   new Vector2D(1,0)
      // )
    });
  }
}

export class PerspectiveProjection extends Projection {

  projectPoint(p, { camera, volume }, in3D = false) {
    // log.debug('projecting: ', p);
    // if (!pointInVolume(p, volume)) return null; // this doesnt seem to be necessary
    let direction = camera.vectorTo(p);
    let plane = this.screenPlane(camera, volume);

     // log.debug('camera to p, ', direction);
    let projection = p.add(direction.scale(-plane.n.dot(plane.pt.vectorTo(p))/plane.n.dot(direction)));
    // log.debug('projected: ', projection);

    if (in3D) return projection;
    else return Object.assign(new Point2D, {x: projection.x, y: projection.y});
  }


  projectCircle(c, { camera, volume }) {
    // this implements https://math.stackexchange.com/a/2412079

    let screenPlane = this.screenPlane(camera, volume), p1, p2,
        projectedP1, projectedP2, projectedCen, rx, ry, mainAxisSegment;

    if (screenPlane.isParallelTo(c.plane)) {
      log.debug('CIRCLE PARALLEL TO SCREEN')
      // in the simple case, the center is preserved in the projection
      let direction = camera.vectorTo(project(camera, screenPlane)).perpendicular(c.plane).unit();
      p1 = c.cen.add(direction.scale(c.rad));
      p2 = c.cen.add(direction.scale(-c.rad));
      let conjugateDiamDirection = c.cen.vectorTo(p1).perpendicular(c.plane).unit();
      let p3 = c.cen.add(conjugateDiamDirection.scale(c.rad));
      let p4 = c.cen.add(conjugateDiamDirection.scale(-c.rad));

      projectedP1 = this.projectPoint(p1, { camera, volume }, true);
      projectedP2 = this.projectPoint(p2, { camera, volume }, true);
      let projectedP3 = this.projectPoint(p3, { camera, volume }, true);
      let projectedP4 = this.projectPoint(p4, { camera, volume }, true);
      projectedCen = this.projectPoint(c.cen, { camera, volume }, true);

      rx = dist(projectedP1, projectedP2);
      ry = dist(projectedP3, projectedP4);
      mainAxisSegment = new Segment(projectedP1, projectedP2);

      if (rx>ry) {
        let temp = rx; rx=ry; ry=temp;
        mainAxisSegment = new Segment(projectedP3, projectedP4);
      }

    } else {
      let planesIntersect = screenPlane.intersect(c.plane); log.debug(planesIntersect)
      let diamVector = planesIntersect.u.perpendicular(c.plane).unit();
      //TODO: extract intersecting from lines
      let diamVectorCrossesPlanesIntersectAt = new Line(c.cen, diamVector).intersect(planesIntersect);

      let p1 = c.cen.add(diamVector.scale(c.rad))
      let p2 = c.cen.add(diamVector.scale(-c.rad)); //.perpendicular(c.plane)); log.debug(dist(p2,c.cen)); log.debug(p2)

      projectedP1 = this.projectPoint(p1, { camera, volume }, true);
      projectedP2 = this.projectPoint(p2, { camera, volume }, true);

      projectedCen = midpoint(projectedP1, projectedP2);

      if (projectedP1.equals(projectedP2)) {
        log.debug('CIRCLE PARALLEL TO SIGHT')
        // this means the camera sight is parallel to the circle so we need to draw as segment

        let direction = camera.vectorTo(project(camera, screenPlane)).perpendicular(c.plane).unit();
        p1 = c.cen.add(direction.scale(c.rad));
        p2 = c.cen.add(direction.scale(-c.rad));

        projectedP1 = this.projectPoint(p1, { camera, volume });
        projectedP2 = this.projectPoint(p2, { camera, volume });

        return Object.assign(new Segment2D, {p1:projectedP1, p2:projectedP2});
      } else {

        log.debug('CIRCLE SHOULD BE ELLIPSE')

        let conjugateDiamDirection = planesIntersect.u.unit();
        let conjugateRadius =
          dist(projectedCen, projectedP1) *
          Math.sqrt(
            dist(p1,diamVectorCrossesPlanesIntersectAt) *
            dist(p2,diamVectorCrossesPlanesIntersectAt)
          ) /
          dist (camera, diamVectorCrossesPlanesIntersectAt);

        log.debug('congjugate radius, ', conjugateRadius)

        let projectedCD1 = projectedCen.add(conjugateDiamDirection.scale(conjugateRadius)),
            projectedCD2 = projectedCen.add(conjugateDiamDirection.scale(-conjugateRadius));

        let auxiliaryLine = projectedCD1.vectorTo(projectedCD2).perpendicular(screenPlane).unit();
        log.debug(auxiliaryLine)
        let auxQ1 = projectedP2.add(auxiliaryLine.scale(conjugateRadius)),
            auxQ  = projectedP2.add(auxiliaryLine.scale(-conjugateRadius));

        log.debug("POINTS " , dist(projectedCen, auxQ), dist(projectedCen, auxQ1))
        log.debug("ANGLE ", angle(projectedCen.vectorTo(projectedP2),auxiliaryLine) / Math.PI * 180)

        if (dist(projectedCen, auxQ1) < dist(projectedCen, auxQ)) {
          let temp = auxQ1; auxQ1 = auxQ; auxQ = temp;
        }

        let bisector = projectedCen.vectorTo(auxQ).unit().add(projectedCen.vectorTo(auxQ1).unit());
        //TODO: check, this isnt probably right
        rx = dist(projectedCen, auxQ1) + dist(projectedCen, auxQ);
        ry = dist(projectedCen, auxQ1) - dist(projectedCen, auxQ);

        mainAxisSegment = new Segment(projectedCen, projectedCen.add(bisector.unit().scale(rx)));
      }
    }

    return Object.assign(new Ellipse2D, {
      c: projectedCen.to2D(),
      rx,
      ry,
      rotate: angle2D( // the angle between a radius of the ellipse and Ox in 2D
        mainAxisSegment.to2D(),
        Object.assign(new Segment2D, {
          p1:Object.assign(new Point2D, {x:0,y:0}),
          p2:Object.assign(new Point2D, {x:1,y:0})
        })
      )
    });
  }
}