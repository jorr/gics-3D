// COMMAND SYNTAX: translate(<object>,tx,ty,tz) - translate any kind of object by tx,ty,tz

import { Command } from '../command.js';
import { WrongParamsError } from '../../errors.js';
import { Vector } from '../../scene/vectors.js';

export default class SegmentCommand extends Command {

  get name() {
    return 'translate';
  }

  requiresPattern() {
    return false;
  }

  execute(params, pattern) {
    if (params.length !== 4) {
      throw new WrongParamsError(params, this);
    }
    params[0].translate(new Vector(params[1], params[2], params[3]))
  }

};