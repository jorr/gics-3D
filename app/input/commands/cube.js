//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand } from '../command.js';
import { MissingPatternError } from '../../errors.js';
import { Point } from '../../scene/items/point.js';
import { Cube } from '../../scene/items/cube.js';
import { globalScene } from '../../scene/scene.js';

export default class CubeCommand extends CreationCommand {

  get name() {
    return 'cube';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {
    // cube(cen,len)
    console.log('creating cube: ', params)
    if (params.length === 2 && params[0] instanceof Point && typeof params[1] === 'number') {
      this.item = Cube.fromCentreAndParallelToAxi(params[0], params[1], params[2]);
    }
    else throw new WrongParamsError(params, this);
  }

};