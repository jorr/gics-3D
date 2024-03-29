//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand } from '../command.js';
import { globalScene } from '../../scene/scene.js';
import { Plane } from '../../scene/items/plane.js';
import { Point } from '../../scene/items/point.js';
import { Line } from '../../scene/items/line.js';
import { Segment } from '../../scene/items/segment.js';
import { MissingPatternError, WrongParamsError, NotFeasibleError } from '../../errors.js';

export default class PlaneCommand extends CreationCommand {

  get name() {
    return 'plane';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {

    //plane(<point>,<point>,<point>) - a plane through three points
    if (params.length === 3 && params.every(p => p instanceof Point)) {
      let vA = params[0].vectorTo(params[1]), vB = params[0].vectorTo(params[2]);
      if (vA.isCollinearWith(vB))
        throw new NotFeasibleError(params, this.name);
      this.item = new Plane(params[0], vA.cross(vB).unit());
    }
    //plane(<segment>,<segment>) - a plane defined by two non-colinear vectors
    else if (params.length === 2 && params.every(p => p instanceof Segment)) {
      this.item = new Plane(params[0].p1, params[0].asVector().cross(params[1].asVector()).unit());
    }
    //plane(<point>, <segment>) - a plane through the point with the segment as normal vector
    else if (params.length === 2 && params[0] instanceof Point && params[1] instanceof Segment) {
      this.item = new Plane(params[0], params[1].asVector());
    }
    //plane(<point>,<plane>) - a plane through the point, parallel to the given plane
    else if (params.length == 2 && params[0] instanceof Point && params[1] instanceof Plane) {
      this.item = new Plane(params[0], params[1].n);
    }
    //plane(<line>,<plane>[,angle]) - a plane through the line, at angle to the given plane (defaults to parallel)
    else if (params.length >= 2 && params[0] instanceof Line && params[1] instanceof Plane) {
      let angle = params[2]?.value || 0;
      this.item = new Plane(params[0].pt, params[1].n.rotate(params[0].u, angle));
    }
    //plane(Oxy|Oxz|Oyz) - one of the axial planes
    else if (typeof params[0] === "string") {
      if (!Plane[params[0]]) throw new WrongParamsError(params, this);
      else this.item = Plane[params[0]];
    }
    else throw new WrongParamsError(params, this);
  }

  bindElements(elems) {
    // Plane does not support deconstruction, there are no meaningful elements
    // we can consider deconstructing to equation coordinates but we don't use them for anything
    throw new WrongPatternError('[no decomposition for planes]', this);
  }

};