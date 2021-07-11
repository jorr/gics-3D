//import storage
//import scene manipulation
//import drawing for side-effects

import { Command } from '../command.js';
import { Anglemark } from '../../scene/items/anglemark.js';
import { Point } from '../../scene/items/point.js';
import { WrongParamsError } from '../../errors.js';
import { globalScene } from '../../scene/scene.js';

import log from 'loglevel';

export default class AnglemarkCommand extends Command {

  get name() {
    return 'anglemark';
  }

  requiresPattern() {
    return false;
  }

  execute(params) {
    super.execute(params);
    //anglemark(<pointS>,<pointM>,<pointE>[,<type>,<offset>])
    if (params.length >=3 && params.slice(0,3).every(p => p instanceof Point)) {
      let points = params.splice(0,3);
      globalScene.addMarking(new Anglemark(points,...params));
    }
    else throw new WrongParamsError(params, this);
  }

};