// COMMAND SYNTAX: 

import { Command } from '../command.js';
import { WrongParamsError } from '../../errors.js';
import { globalScene } from '../../scene/scene.js';

export default class LimitsCommand extends Command {

  get name() {
    return 'limits';
  }

  requiresPattern() {
    return false;
  }

  execute(params, pattern) {
    super.execute(params, pattern);
    //limits(width,height,depth)
    if (params.length !== 3 || typeof params[0] !== 'number' || typeof params[1] !== 'number' || typeof params[2] !== 'number') {
      throw new WrongParamsError(params, this);
    }

    globalScene.volume = { w: params[0], h: params[1], d: params[2] };
  }

};