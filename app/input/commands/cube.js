//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand } from '../command.js';
import { MissingPatternError } from '../../errors.js';
import { Point } from '../../scene/items/point.js';
import { Cube } from '../../scene/items/cube.js';
import { Square } from '../../scene/items/regularquad.js';
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
    if (params.length === 2 && params[0] instanceof Point && typeof params[1] === 'number') {
      this.item = Cube.fromCentreAndParallelToAxi(params[0], params[1]);
    }
    // cube(len)
    else if (params.length === 0 || params.length === 1 && typeof params[0] === 'number') {
      this.item = Cube.fromCentreAndParallelToAxi(new Point(0,0,0), params[0]);
    } // cube(square,'-')
    else if (params.length >= 1 && params[0] instanceof Square) {// && params[1] instanceof Vector) {
      let sign = params[1] === '-' ? -1 : 1;
      this.item = new Cube(params[0].A, params[0].B, params[0].A.vectorTo(params[0].C), sign);
    }
    else throw new WrongParamsError(params, this);
  }

  //TODO: bindElements

};