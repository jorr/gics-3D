//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand } from '../command.js';
import { Segment } from '../../scene/items/segment.js';
import { Plane } from '../../scene/items/plane.js';
import { WrongParamsError, WrongPatternError, NotFeasibleError } from '../../errors.js';

import log from 'loglevel';

export default class NormalCommand extends CreationCommand {

  get name() {
    return 'normal';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {
    //normal(<plane>[,size])
    if (params.length >=1 && params[0] instanceof Plane) {
      let size = typeof params[1] === 'number' ? params[1] : 50;
      let pt = params[0].getRandomPoint();
      this.item = new Segment(pt, pt.add(params[0].n.unit().scale(size)), true);
    }
    else throw new WrongParamsError(params, this);
  }

};