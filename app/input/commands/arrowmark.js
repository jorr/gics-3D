// COMMAND SYNTAX: 

import { Command } from '../command.js';
import { WrongParamsError } from '../../errors.js';
import { Segment } from '../../scene/items/segment.js';

import log from 'loglevel';

export default class ArrowmarkCommand extends Command {

  get name() {
    return 'arrowmark';
  }

  requiresPattern() {
    return false;
  }

  execute(params, pattern) {
    super.execute(params, pattern);

    //TODO: support arrow modes
    //arrowmark(<segment>)
    if (params[0] instanceof Segment) {
      params[0].drawAsArrow = true;
    }
    else throw new WrongParamsError(params, this);
  }

};