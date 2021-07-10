// COMMAND SYNTAX: 

import { Command } from '../command.js';
import { WrongParamsError } from '../../errors.js';
import { globalScene } from '../../scene/scene.js';

export default class AutolabelCommand extends Command {

  get name() {
    return 'autolabel';
  }

  requiresPattern() {
    return false;
  }

  execute(params, pattern) {
    super.execute(params, pattern);
    if (params[0] === 'on') {
      globalScene.autolabel = true;
    } else if (params[0] === 'off') {
      globalScene.autolabel = false;
    } else {
      throw new WrongParamsError(params, this);
    }
  }

};