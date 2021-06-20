// COMMAND SYNTAX: 

import { Command, Angle } from '../command.js';
import { WrongParamsError } from '../../errors.js';
import { angle } from '../../scene/util.js';

export default class AngleCommand extends Command {

  get name() {
    return 'angle';
  }

  requiresPattern() {
    return false;
  }

  //TODO: check if we use Angle instances where we should
  execute(params, pattern) {
    super.execute(params, pattern);
    if (params.length !== 2) {
      throw new WrongParamsError(params, this);
    }
    return new Angle(angle(...params));
  }

};