// COMMAND SYNTAX: 

import { Command } from '../command.js';
import { WrongParamsError } from '../../errors.js';
import { globalScene } from '../../scene/scene.js';
import { Point } from '../../scene/items/point.js';

export default class ViewPointCommand extends Command {

  get name() {
    return 'viewpoint';
  }

  requiresPattern() {
    return false;
  }

  execute(params, pattern) {
    super.execute(params, pattern);
    if (params.length !== 1 || !(params[0] instanceof Point)) {
      throw new WrongParamsError(params, this);
    }

    globalScene.viewpoint = params[0];
  }

};