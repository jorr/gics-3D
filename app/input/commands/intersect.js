//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand } from '../command.js';
import { Segment } from '../../scene/items/segment.js';
import { Plane } from '../../scene/items/plane.js';
import { Point } from '../../scene/items/point.js';
import { Line } from '../../scene/items/line.js';
import { WrongParamsError, NotFeasibleError } from '../../errors.js';

import log from 'loglevel';

export default class IntersectCommand extends CreationCommand {

  get name() {
    return 'intersect';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {
    if (params.length !== 2 ||
     !(params[0] instanceof Line || params[0] instanceof Segment || params[0] instanceof Plane) ||
     !params[1].intersect) {
      throw new WrongParamsError(params, this);
    } //intersect(<line|segment|plane>,<line|segment|plane|item>)
    else {
      let intersection = params[1].intersect(params[0]);
      if (!intersection)
        throw new NotFeasibleError(params,this.name);
      else this.item = intersection;
    }
  }

  bindElements(elems, commands) {
    let cname = this.item.constructor.name.toLowerCase();
    Object.getPrototypeOf(commands[cname]).bindElements.call({item:this.item},elems);
  }

};