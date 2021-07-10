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
    return true;
  }

  execute(params, pattern, commands) {
    super.execute(params, pattern);
    if (params.length !== 1) {
      throw new WrongParamsError(params, this);
    }
    //check if params[0] is resolved to a valid item
    if (params[0] instanceof Item) {
      globalScene.bindElement(params[0], pattern.name, pattern.suppress);
      if (pattern.elements?.length) {
        //we must also bind the elements if we have a true pattern. so, a little JS hackery...
        let cname = params[0].constructor.name.toLowerCase();
        // if (!c.hasOwnProperty('bindElements')) throw new WrongPatternError()
        Object.getPrototypeOf(commands[cname]).bindElements.call({item:params[0]},pattern.elements);
      }
    } else {
      globalScene.bindResult(params[0],pattern.name);
    }
  }

};