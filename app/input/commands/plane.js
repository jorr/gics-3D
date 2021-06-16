//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand } from '../command.js';
import { globalScene } from '../../scene/scene.js';
import { Plane } from '../../scene/items/plane.js';
import { Point } from '../../scene/items/point.js';
import { Segment } from '../../scene/items/segment.js';
import { MissingPatternError, WrongParamsError } from '../../errors.js';

export default class PlaneCommand extends CreationCommand {

  get name() {
    return 'plane';
  }

  //TODO: ?
  requiresPattern() {
    return false;
  }

  createItem(params) {

    //plane(<point>, <segment>) - a plane through the point with the segment as normal vector
    if (params.length === 2 && params[0] instanceof Point && params[1] instanceof Segment) {
      this.item = new Plane(params[0], params[1].asVector());
    }
    //plane(<point>,<plane>,[angle]) - a plane through the point, at angle to the given plane (defaults to parallel)
    else if (params.length >= 2 && params[0] instanceof Point && params[1] instanceof Plane) {
      let angle = params[2] || 0;
      this.item = new Plane(params[0], params[1].n.rotate(params[1].getCoplanarVector(), angle));
    }
    //plane(Oxy|Oxz|Oyz) - one of the axial planes
    else if (typeof params[0] === "string") {
      if (!Plane[params[0]]) throw new WrongParamsError(params, this);
      else this.item = Plane[params[0]];
    }
    else throw new WrongParamsError(params, this);
  }

  // bindElements(elems) - plane does not decompose

};