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

  projectionVector(p, {camera, volume}) {
    throw new MethodNotImplemented('projectPoint', this);
    //return Vector
  }
}

export class CabinetProjection extends Projection {
  angle = Math.PI/180*45;
  shortening = 0.5; // = 1/Math.tan(Math.atan(2));

  projectionVector(p, {camera, volume}) {
    return new Vector(3,4,-10).unit(); //from Applied Geometry for CG and CAD
  }

  projectPoint(p, { camera, volume }, in3D = false) {
    // if (!pointInVolume(p, volume)) return null;
    // let projection = { x: p.x + this.shortening*p.z*Math.cos(this.angle),
        // y: p.y + this.shortening*p.z*Math.sin(this.angle) };

    let direction = this.projectionVector(p, {camera,volume});
    let plane = this.screenPlane(camera, volume);
    let projection = p.add(direction.scale(-plane.n.dot(plane.pt.vectorTo(p))/plane.n.dot(direction)));

    if (in3D) return projection;
    return Object.assign(new Point2D, projection);
  }

  projectCircle(c, { camera, volume }, mainAxisProjectionOut = null) {
    //this implements https://math.stackexchange.com/a/2412079
    let screenPlane = this.screenPlane(camera, volume), p1, p2,
    projectedP1, projectedP2, projectedCen, rx, ry, mainAxisSegment;

    // let screenPlane = this.screenPlane(camera, volume);
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

    rx = dist2D(projectedP1, projectedP2)/2;
    ry = dist2D(projectedP3, projectedP4)/2;
    mainAxisSegment = Vector2D.fromPoints(projectedP1, projectedP2);
    // log.debug(angle2D( // the angle between a radius of the ellipse and Ox in 2D
    //     mainAxisSegment,
    //     new Vector2D(1,0)
    //   ));

    if (mainAxisProjectionOut) {
      mainAxisProjectionOut.p1 = projectedP1;
      mainAxisProjectionOut.p2 = projectedP2;
    }

    let ellipseParams = ellipseConvertConjugateDiametersToAxes(
      projectedCen, new Segment2D(projectedP1, projectedP2), new Segment2D(projectedP3, projectedP4),
//      mainAxisProjectionOut
    );

    // delete ellipseParams.mainAxisProjectionOut;

    // let screenPlane = this.screenPlane(camera, volume);
    // let direction = screenPlane.n.perpendicular(c.plane).unit();


    // let d1 = c.cen.add(direction.scale(c.rad));
    // let d2 = c.cen.add(direction.scale(-c.rad));

    // let directionPerp = direction.perpendicular(c.plane).unit();

    // let p1 = c.cen.add(directionPerp.scale(c.rad));
    // let p2 = c.cen.add(directionPerp.scale(-c.rad));

    // //let F = Plane.Oxy.intersect(new Line(p1, p1.vectorTo(p2)));

    // //let conjugateDiamDirection = direction.perpendicular(c.plane).unit();
    // //let p3 = c.cen.add(conjugateDiamDirection.scale(c.rad));
    // //let p4 = c.cen.add(conjugateDiamDirection.scale(-c.rad));

    // let projectedP1 = this.projectPoint(p1, { camera, volume });
    // let projectedP2 = this.projectPoint(p2, { camera, volume });
    // let projectedCen = this.projectPoint(c.cen, { camera, volume });

    // let projectedD1 = this.projectPoint(d1, { camera, volume });
    // let projectedD2 = this.projectPoint(d2, { camera, volume });

    // let crossDirectionVector = Vector2D.fromPoints(projectedD1, projectedD2).unit();
    // //let conjugateRadius = dist2D(projectedCen,projectedP1) * 

    // let projectedP3 = projectedCen.add(crossDirectionVector.scale(conjugateRadius));
    // let projectedP4 = projectedCen.add(crossDirectionVector.scale(-conjugateRadius));

    // let rx = dist2D(projectedP1, projectedP2)/2;
    // let ry = dist2D(projectedP3, projectedP4)/2;
    // let mainAxisSegment = Vector2D.fromPoints(projectedP1, projectedP2);

    // let ellipseParams = ellipseConvertConjugateDiametersToAxes(
    //   projectedCen, new Segment2D(projectedP1, projectedP2), new Segment2D(projectedP3, projectedP4),
    //   mainAxisProjectionOut
    // );

    let rotate = angle2D( // the angle between a radius of the ellipse and Ox in 2D
      mainAxisSegment,
      new Vector2D(1,0)
    );

    //delete ellipseParams.mainAxisProjectionOut; 

    //BOYKO
    // let a = c.plane.getCoplanarVector().unit();
    // let b = c.plane.n.cross(a).unit(); log.debug(a,b)
    // let n = screenPlane.n;
    // let u = this.projectionVector(c.cen, {camera, volume});//.unit();

    // let aprim = u.cross(a).cross(n).scale(c.rad/n.dot(u));
    // let bprim = u.cross(b).cross(n).scale(c.rad/n.dot(u));

    // let cprim = this.projectPoint(c.cen,{camera,volume},true); log.debug(cprim)

    // if (mainAxisProjectionOut) {
    //   mainAxisProjectionOut.p1 = projectedP1;
    //   mainAxisProjectionOut.p2 = projectedP2;
    // }

    // let points = [];
    // for (let fi = 0; fi < 4*Math.PI; fi = fi + 0.01) {
    //   let point = cprim.add(aprim.scale(Math.cos(fi))).add(bprim.scale(Math.sin(fi)));
    //   points.push(Object.assign(new Point2D,point));
    // }

    // return [projectedP1, projectedP2, projectedP3, projectedP4, projectedCen, Object.assign(new Ellipse2D, {
    //   c: projectedCen,
    //   // ...ellipseParams
    //   rx: rx,
    //   ry: ry,
    //   rotate
    //   // points
    // })];

    return Object.assign(new Ellipse2D, {
      c: projectedCen,
      // ...ellipseParams
      rx: rx,
      ry: ry,
      rotate
    });
  }
}

export class PerspectiveProjection extends Projection {

  projectionVector(p, {camera, volume}) {
    return p.vectorTo(camera);
  }

  projectPoint(p, { camera, volume }, in3D = false) {
    let direction = camera.vectorTo(p);
    let plane = this.screenPlane(camera, volume);

    let projection = p.add(direction.scale(-plane.n.dot(plane.pt.vectorTo(p))/plane.n.dot(direction)));

    if (in3D) return projection;
    else return Object.assign(new Point2D, {x: projection.x, y: projection.y});
  }


  projectCircle(c, { camera, volume }, mainAxisProjectionOut = null) {
    // this implements https://math.stackexchange.com/a/2412079
    // let projectedCen = this.projectPoint(c.cen, { camera, volume });

    //BOYKO
    // let a = c.plane.getCoplanarVector().unit();
    // let b = c.plane.n.cross(a).unit();
    // let u = this.projectionVector(c.cen, {camera, volume}).unit();

    // let aprim = u.cross(a).cross(c.plane.n).scale(c.rad/c.plane.n.dot(u));
    // let bprim = u.cross(b).cross(c.plane.n).scale(c.rad/c.plane.n.dot(u));

    // return Object.assign(new Ellipse2D, { c: projectedCen, aprim, bprim });

    // OLD ALGORITHM

    let screenPlane = this.screenPlane(camera, volume), p1, p2,
    projectedP1, projectedP2, projectedCen, rx, ry, mainAxisSegment;

    // let screenPlane = this.screenPlane(camera, volume);
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

    rx = dist2D(projectedP1, projectedP2)/2;
    ry = dist2D(projectedP3, projectedP4)/2;
    mainAxisSegment = Vector2D.fromPoints(projectedP1, projectedP2);
    // log.debug(angle2D( // the angle between a radius of the ellipse and Ox in 2D
    //     mainAxisSegment,
    //     new Vector2D(1,0)
    //   ));

    if (mainAxisProjectionOut) {
      mainAxisProjectionOut.p1 = projectedP1;
      mainAxisProjectionOut.p2 = projectedP2;
    }

    let rotate = angle2D( // the angle between a radius of the ellipse and Ox in 2D
      mainAxisSegment,
      new Vector2D(1,0)
    );


    let ellipseParams = ellipseConvertConjugateDiametersToAxes(
      projectedCen, new Segment2D(projectedP1, projectedP2), new Segment2D(projectedP3, projectedP4),
//      mainAxisProjectionOut
    );

    return Object.assign(new Ellipse2D, {
      c: projectedCen,
      // ...ellipseParams
      rx: rx,
      ry: ry,
      rotate
    });

    // NEW ALGORITHM

    // let screenPlane = this.screenPlane(camera, volume);
    // let direction = screenPlane.n.perpendicular(c.plane).unit();
    // //this is where the screenplane meets c.plane or any vector if they are parallel

    // let directionPerp = direction.perpendicular(c.plane).unit();

    // let d1 = c.cen.add(directionPerp.scale(c.rad));
    // let d2 = c.cen.add(directionPerp.scale(-c.rad));

    // // log.debug(screenPlane)
    // // log.debug(direction)
    // // log.debug(directionPerp)
    // // log.debug(d1,d2)

    // //let p1 = c.cen.add(directionPerp.scale(c.rad));
    // //let p2 = c.cen.add(directionPerp.scale(-c.rad));
    // //let conjugateDiamDirection = direction.perpendicular(c.plane).unit();
    // //let p3 = c.cen.add(conjugateDiamDirection.scale(c.rad));
    // //let p4 = c.cen.add(conjugateDiamDirection.scale(-c.rad));

    // //let projectedP1 = this.projectPoint(p1, { camera, volume });
    // //let projectedP2 = this.projectPoint(p2, { camera, volume });

    // let projectedD1 = this.projectPoint(d1, { camera, volume });
    // let projectedD2 = this.projectPoint(d2, { camera, volume });

    // if (screenPlane.isParallelTo(c.plane)) {

    //   let p1 = c.cen.add(direction.scale(c.rad));
    //   let p2 = c.cen.add(direction.scale(-c.rad));

    //   let projectedP1 = this.projectPoint(p1, { camera, volume });
    //   let projectedP2 = this.projectPoint(p2, { camera, volume });

    //   let rx = dist2D(projectedP1,projectedP2)/2;
    //   let ry = dist2D(projectedD1,projectedD2)/2;

    //   return Object.assign(new Ellipse2D, {
    //     c: projectedCen,
    //     rx, ry,
    //     rotate: rx === ry ? 0 : angle2D( // the angle between a radius of the ellipse and Ox in 2D
    //       new Vector2D(1,0),
    //       Vector2D.fromPoints(projectedP1,projectedP2)
    //     )
    //   });

    // } else {
    //   let F = Plane.Oxy.intersect(new Line(d1, d1.vectorTo(d2)));

    //   let crossDirectionVector = direction;// Vector2D.fromPoints(projectedP1, projectedP2).unit();
    //   let conjugateRadius = dist2D(projectedCen,projectedD1) * Math.sqrt(dist(d1,F)*dist(d2,F)) / dist(camera,F);

    //   let projectedP1 = projectedCen.add(crossDirectionVector.scale(conjugateRadius));
    //   let projectedP2 = projectedCen.add(crossDirectionVector.scale(-conjugateRadius));

    //   let ellipseParams = ellipseConvertConjugateDiametersToAxes(
    //     projectedCen, new Segment2D(projectedD1, projectedD2), new Segment2D(projectedP1, projectedP2),
    //     mainAxisProjectionOut
    //   );

    //   return Object.assign(new Ellipse2D, {
    //     c: projectedCen,
    //     ...ellipseParams
    //   });
    // }
  }
}