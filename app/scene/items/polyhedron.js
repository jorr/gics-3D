import { Item, Polygon2D, Angle2D } from '../item.js';
import { Segment } from './segment.js';
import { centroid } from '../util.js';

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
      log.info('PROJ VECTOR', projectionVector)
      let outwardNormal = face.plane.n;
      if (face.cen.vectorTo(this.cen).dot(outwardNormal) > 0) {
        //normal is actually inward
        outwardNormal = outwardNormal.scale(-1);
      }
      log.info('NORMAL', outwardNormal)
      if (projectionVector.dot(outwardNormal) >= 0) {

        //the face must be facing the camera
        visibleEdges.push(...face.edges);
      } else {
        log.info('pushing to hidden: ',face)
        hiddenEdges.push(...face.edges);
      }
    }
    //if an edge is both hidden and visible, it should be visible
    _.pullAllWith(hiddenEdges, visibleEdges, edgeComparator);
    return { visibleEdges, hiddenEdges };
  }

  project(projectionData, projection) {
    let { visibleEdges, hiddenEdges } = this.checkVisibility(projectionData, projection);
    return visibleEdges.map(ve => ve.project(projectionData, projection)).concat(
            hiddenEdges.map(he => Object.assign(he.project(projectionData, projection), { style: {linetype: 'dotted'}})));
    // return hiddenEdges.map(he => Object.assign(he.project(projectionData, projection), { style: {linetype: 'dotted'}}));
  }

};