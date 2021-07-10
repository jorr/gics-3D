//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand, Angle } from '../command.js';
import { globalScene } from '../../scene/scene.js';
import { Line } from '../../scene/items/line.js';
import { Segment } from '../../scene/items/segment.js';
import { Point } from '../../scene/items/point.js';
import { Plane } from '../../scene/items/plane.js';
import { MissingPatternError, WrongParamsError, NotFeasibleError } from '../../errors.js';

import log from 'loglevel';

export default class LineCommand extends CreationCommand {

  get name() {
    return 'line';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {
    // line(<segment>) - a line coinciding with the segment (or a line through two points)
    if (params.length === 1 && params[0] instanceof Segment) {
      this.item = new Line(params[0].p1, params[0].p1.vectorTo(params[0].p2));
    }
    // line(<point>,<line>[,<angle>]) - a line through the point, at angle (default: parallel) off the given line
    else if (params.length >= 2 && params[0] instanceof Point && (params[1] instanceof Line || params[1] instanceof Segment)) {
      if (params[1] instanceof Segment) params[1] = params[1].lineOn();
      let angle = params[2] instanceof Angle ? params[2].value : 0;
      let line = new Line(params[0], params[1].u.rotate(params[1].u.perpendicular(),angle));
      this.item = line;
    }
    // line(<point>,<plane>[,<angle>]) - a line through the point, at angle (default: parallel) off the given plane
    else if (params.length >= 2 && params[0] instanceof Point && params[1] instanceof Plane) {
      let coplanar = params[1].getCoplanarVector();
      let angle = params[2] instanceof Angle ? params[2].value : 0;
      //rotate around an axis that's perpendicular to coplanar but in the plane
      let line = new Line(params[0], coplanar.rotate(coplanar.perpendicular(params[1]), params[2].value));
      this.item = line;
    }
    // line(<plane>,<plane>) - a line that is the intersection of two planes
    else if (params.length === 2 && params[0] instanceof Plane && params[1] instanceof Plane) {
      if (params[0].isParallelTo(params[1]))
        throw new NotFeasibleError(params, this.name);
      this.item = params[0].intersect(params[1]);
    }
    //line(Ox|Oz|Oy) - one of the axes
    else if (typeof params[0] === "string") {
      if (!Line[params[0]]) throw new WrongParamsError(params, this);
      else this.item = Line[params[0]];
    }
    else {
      throw new WrongParamsError(params, this);
    }
  }

  bindElements(elems) {
    // Line does not support deconstruction, there are no meaningful elements
    // we can consider deconstructing to equation coordinates but we don't use them for anything
    throw new WrongPatternError('[no decomposition for lines]', this);
  }

};