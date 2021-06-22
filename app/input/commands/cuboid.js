//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand } from '../command.js';
import { NotFeasibleError, WrongParamsError, MissingPatternError } from '../../errors.js';
import { Cuboid } from '../../scene/items/cuboid.js';
import { Square, Rectangle } from '../../scene/items/regularquad.js';

import log from 'loglevel';

export default class CuboidCommand extends CreationCommand {

  get name() {
    return 'cuboid';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {
    // cuboid(<square|rect>,<square|rect>) - two bases
    if (params.length === 2 && (
      params[0] instanceof Rectangle && params[1] instanceof Rectangle ||
      params[0] instanceof Square && params[1] instanceof Square)) {
      let direction = params[0].cen.vectorTo(params[1].cen);
      //check if the bases are actually parallel
      if (!params[0].plane.isParallelTo(params[1].plane) || !direction.isCollinearWith(params[0].plane.n))
        throw new NotFeasibleError(params, this.name);
      this.item = new Cuboid(params[0], direction);
    }
    // cuboid(<square|rect>,depth,'-')
    else if (params.length >= 2 && (params[0] instanceof Square || params[0] instanceof Rectangle) &&
      typeof params[1] === 'number') {
      let sign = params[2] === '-' ? -1 : 1;
      this.item = new Cuboid(params[0],params[0].plane.n.unit().scale(sign*params[1]));
    }
    else throw new WrongParamsError(params, this);
  }

  //TODO: bindElements

};