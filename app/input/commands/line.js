//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand } from '../command.js';
import { globalScene } from '../../scene/scene.js';
import { Line } from '../../scene/items/line.js';
import { Segment } from '../../scene/items/segment.js';
import { MissingPatternError, WrongParamsError } from '../../errors.js';

export default class LineCommand extends CreationCommand {

  get name() {
    return 'line';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {
    // line(dst,slp[,plane]) - distance to the origin, slope of the line with respect to plane or 0xy
    // line(<segment>) - a line coinciding with the segment
    if (params.length === 1 && params[0] instanceof Segment) {
      this.item = new Line(params[0].p1, params[0].p1.vectorTo(params[0].p2));
    }

    else {
      throw new WrongParamsError(params, this);
    }

    // line(<point>,<line|segment|plane>,off) - a line through the point, offset at angle off in regard to the second argument (use 0 for parallel, 90 for perpendicular)
    // line(<plane>,<plane>) - a line that is the intersection of two planes
  }

};