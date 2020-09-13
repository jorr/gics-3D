//import storage
//import scene manipulation
//import drawing for side-effects

import { Command } from '../command.js';
import { globalScene } from '../../scene/scene.js';
import { Plane } from '../../scene/items/plane.js';
import { Point } from '../../scene/items/point.js';
import { MissingPatternError, WrongParamsError } from '../../errors.js';

export default class PlaneCommand extends Command {

  get name() {
    return 'plane';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {
    let n, pt;

    //plane(<point>, <segment>) - a plane through the point with the segment as normal vector
    if (params[0] instanceof Point && params[1] instanceof Line) {
      pt = params[0];
      n = new Vector(params[1].p1, params[2].p2);
      this.item = new Plane(pt, n);
    }

    throw new WrongParamsError(params, this);
  }


};