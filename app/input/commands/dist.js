// COMMAND SYNTAX: 

import { Command } from '../command.js';
import { WrongParamsError } from '../../errors.js';
import { dist } from '../../scene/util.js';

export default class SegmentCommand extends Command {

  get name() {
    return 'dist';
  }

  requiresPattern() {
    return false;
  }

  execute(params, pattern) {
    super.execute(params, pattern);
    if (params.length !== 2) {
      throw new WrongParamsError(params, this);
    }
    return dist(...params);
  }

};