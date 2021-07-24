// COMMAND SYNTAX: translate(<object>,tx,ty,tz) - translate any kind of object by tx,ty,tz and constructs the new object

import { CreationCommand } from '../command.js';
import { WrongParamsError } from '../../errors.js';
import { Vector } from '../../scene/vectors.js';
import { Item } from '../../scene/item.js';

export default class TranslateCommand extends CreationCommand {

  get name() {
    return 'translate';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {
    //translate(<item>,tx,ty,tz)
    if (params.length !== 4 && !(params[0] instanceof Item)) {
      throw new WrongParamsError(params, this);
    }
    this.item = params[0].translate(new Vector(params[1], params[2], params[3]));
  }

  bindElements(elems, commands) {
    let cname = this.item.constructor.name.toLowerCase();
    Object.getPrototypeOf(commands[cname]).bindElements.call({item:this.item},elems);
  }

};