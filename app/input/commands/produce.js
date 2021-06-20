// COMMAND SYNTAX: 

import { Command } from '../command.js';
import { WrongParamsError } from '../../errors.js';
import { Item } from '../../scene/item.js';
import { globalScene } from '../../scene/scene.js';

export default class ProduceCommand extends Command {

  get name() {
    return 'produce';
  }

  requiresPattern() {
    return false;
  }

  execute(params, pattern) {
    super.execute(params, pattern);
    if (params.length !== 1) {
      throw new WrongParamsError(params, this);
    }

    //check if params[0] is resolved to a valid item
    if (params[0] instanceof Item) {
      params[0].suppressed = pattern?.suppress;
      //rebind it to the globalScene
      //TODO: should we try to remove it first?
      globalScene.addItem(params[0], pattern?.name);
      //no binding elements is allowed with produce
    } else if (pattern) {
      globalScene.addBinding(params[0], pattern.name);
    }
  }

};