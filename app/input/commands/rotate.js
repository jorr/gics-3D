import { CreationCommand, Angle } from '../command.js';
import { WrongParamsError } from '../../errors.js';
import { Line } from '../../scene/items/line.js';
import { Item } from '../../scene/item.js';

import log from 'loglevel';

export default class RotateCommand extends CreationCommand {

  get name() {
    return 'rotate';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {
    //rotate(<item>,angle,<line>)
    if (params.length !== 3 || !(params[0] instanceof Item) || !(params[2] instanceof Line) || !(params[1] instanceof Angle)) {
      throw new WrongParamsError(params, this);
    }
    this.item = params[0].rotate(params[1].value, params[2]);
  }

  bindElements(elems, commands) {
    let cname = this.item.constructor.name.toLowerCase();
    Object.getPrototypeOf(commands[cname]).bindElements.call({item:this.item},elems);
  }

};