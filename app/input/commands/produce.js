// COMMAND SYNTAX: 

import { Command } from '../command.js';
import { WrongParamsError, SyntaxError } from '../../errors.js';
import { Item } from '../../scene/item.js';
import { globalScene } from '../../scene/scene.js';

import log from 'loglevel';

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

      //TODO: this is broken!
      let propertyChain = params[0].split('.');
      let item = globalScene.getItem(propertyChain.shift());
      if (!item) {
        throw new SyntaxError(`Identifier not resolved: ${params[0]}`);
      }
      globalScene.addBinding(item, propertyChain.join('.'), pattern.name);
    }
  }

};