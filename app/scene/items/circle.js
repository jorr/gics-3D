import { Item, Ellipse2D, Point2D, Segment2D } from '../item.js';
import { Point } from './point.js';
import { Line } from './line.js';
import { Plane } from './plane.js';
import { dist } from '../util.js';

import log from 'loglevel';

export class Circle extends Item {

   cen; rad; plane;

   constructor(cen, rad, plane) {
    super();

    this.cen = cen;
    this.rad = rad;
    this.plane = plane;
   }

   get diam() {
    return this.rad*2;
   }

   pointOnCircle(direction) {
    direction = direction || this.plane.getCoplanarVector();
    return this.cen.add(direction.unit().scale(this.rad));
   }

   hasPoint(p) {
    return dist(p,this.cen) == this.rad && this.plane.hasPoint(p);
   }

   intersect(arg) {
      if (arg instanceof Line) {
        if (this.plane.isParallelTo(arg)) {
          if (this.plane.hasPoint(arg.pt)) {
            //this implements: https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-sphere-intersection
            let d = dist(this.cen, arg);
            if (d > this.rad) return null; //the line doesn't cross the circle
            if (d == this.rad) return this.cen.projectionOn(arg); //line is tangent to circle
            //line actually crosses the circle, we need to find the segment
            let P = this.cen.projectionOn(arg);
            let PP1 = Math.sqrt(this.rad**2 - d**2);
            let PPt = dist(arg.pt, P);
            //note that we store lines with unit vectors and so we can use the lengths as params
            return new Segment(arg.getPointAtParam(PPt-PP1), arg.getPointAtParam(PPt+PP1));
          } else return null; //line is parallel to but not lying in this plane
        } else return arg.intersect(this.plane);
      } else if (arg instanceof Plane) {
        let crossLine = this.plane.intersect(arg);
        return crossLine ? this.intersect(crossLine) : null;
      }
      else throw new ImpossibleOperationError("Bodies can only be intersected by lines and planes");
   }

  translate(by) { return new Circle(this.cen.add(by), this.rad, this.plane.translate(by)); }
  rotate(by,around) { return new Circle(this.cen.rotate(by,around), this.rad, this.plane.rotate(by));  }
  scale(by) { return new Circle(this.cen, this.rad*by, this.plane); }

  get labelPosition() {
    return this.cen;
  }

  project(projectionData, projection, mainAxisProjectionOut = null) {
    return projection.projectCircle(this, projectionData, mainAxisProjectionOut);
  }
}