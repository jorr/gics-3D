import { Item, Polygon2D, Angle2D } from '../item.js';
import { Segment } from './segment.js';
import { Line } from './line.js';
import { Plane } from './plane.js';
import { Point } from './point.js';
import { Polygon } from './polygon.js';
import { centroid, pointInPolygon, convexHull } from '../util.js';

import _ from 'lodash';
import log from 'loglevel';

function edgeComparator(e1, e2) {
  return (e1.p1.equals(e2.p1) && e1.p2.equals(e2.p2)) || (e1.p1.equals(e2.p2) && e1.p2.equals(e2.p1));
}

export class Polyhedron extends Item {

  get cen() {
    return centroid(this.vertices);
  }

  get edges() {
    return _(this.faces.map(f => f.edges)).flatten().uniqWith(edgeComparator).value();
  }

  checkVisibility(projectionData, projection) {
    let visibleEdges = [], hiddenEdges = [];
    for (let face of this.faces) {
      let projectionVector = projection.projectionVector(face.cen, projectionData);
      let outwardNormal = face.plane.n;
      if (face.cen.vectorTo(this.cen).dot(outwardNormal) > 0) {
        //normal is actually inward
        outwardNormal = outwardNormal.scale(-1);
      }
      if (projectionVector.dot(outwardNormal) >= 0) {
        //the face must be facing the camera
        visibleEdges.push(...face.edges);
      } else {
        hiddenEdges.push(...face.edges);
      }
    }
    //if an edge is both hidden and visible, it should be visible
    _.pullAllWith(hiddenEdges, visibleEdges, edgeComparator);
    return { visibleEdges, hiddenEdges };
  }

  intersect(arg) {
    let crossings = [];
    if (arg instanceof Line) {
      for (let f of this.faces) {
        let c = f.intersect(arg);
        if (c instanceof Segment) return c; //line lies on one of the faces or is parallel, so Segment or null
        else if (c instanceof Point && !crossings.find(cc => cc.equals(c))) crossings.push(c);
        if (crossings.length == 2) break;
      }

      if (crossings.length == 1) return crossings[0];
      else if (crossings.length >= 2) return new Segment(crossings[0], crossings[1]);
      else return null;
    }
    else if (arg instanceof Plane) {
      let crossings = [];
      for (let f of this.faces) {
        if (arg.isParallelTo(f.plane)) {
          if (f.plane.hasPoint(arg.pt)) return f; //if plane lies on one of the faces then that face is the intersection
          //otherwise, this doesn't participate in the intersection
        } else {
          let crossLine = arg.intersect(f.plane);
          let intersection = f.intersect(crossLine);
          if (intersection instanceof Point) crossings.push(intersection);
          else if (intersection instanceof Segment) crossings.push(intersection.p1, intersection.p2);
          //otherwise, do nothing
        }
      }
      crossings = _.uniqWith(crossings, (p1,p2) => p1.equals(p2));

      return new Polygon(convexHull(crossings,arg), arg);
    }
    else throw new ImpossibleOperationError("Bodies can only be intersected by lines and planes");
  }

  project(projectionData, projection) {
    let { visibleEdges, hiddenEdges } = this.checkVisibility(projectionData, projection);
    return visibleEdges.map(ve => ve.project(projectionData, projection)).concat(
            hiddenEdges.map(he => Object.assign(he.project(projectionData, projection), { style: {linetype: 'dotted'}})));
    // return hiddenEdges.map(he => Object.assign(he.project(projectionData, projection), { style: {linetype: 'dotted'}}));
  }

};