//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand } from '../command.js';
import { globalScene } from '../../scene/scene.js';
import { Line } from '../../scene/items/line.js';
import { Segment } from '../../scene/items/segment.js';
import { Point } from '../../scene/items/point.js';
import { Plane } from '../../scene/items/plane.js';
import { MissingPatternError, WrongParamsError, NotFeasibleError } from '../../errors.js';

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
    else if (params.legnth >= 2 && params[0] instanceof Point && (params[1] instanceof Line || params[1] instanceof Segment)) {
      if (params[1] instanceof Segment) params[1] = params[1].lineOn();
      let line = new Line(params[0], params[1].u);
      if (params[2] instanceof Angle) {
        line = line.rotate(params[1].u.perpendicular(), params[2].value);
      }
      this.item = line;
    }
    // line(<point>,<plane>[,<angle>]) - a line through the point, at angle (default: parallel) off the given plane
    else if (params.legnth >= 2 && params[0] instanceof Point && params[1] instanceof Plane) {
      let coplanar = params[1].getCoplanarVector();
      let line = new Line(params[0], coplanar);
      if (params[2] instanceof Angle) {
        //rotate around an axis that's perpendicular to coplanar but in the plane
        line = line.rotate(coplanar.perpendicular(params[1]), params[2].value);
      }
      this.item = line;
    }
    // line(<plane>,<plane>) - a line that is the intersection of two planes
    else if (params.length === 2 && params[0] instanceof Plane && params[1] instanceof Plane) {
      if (params[0].isParallelTo(params[1]))
        throw new NotFeasibleError(params, this.name);
      this.item = params[0].intersect(params[1]);
    }
    else {
      throw new WrongParamsError(params, this);
    }
  }

};