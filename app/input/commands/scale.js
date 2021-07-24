import { CreationCommand, Angle } from '../command.js';
import { WrongParamsError } from '../../errors.js';
import { Item } from '../../scene/item.js';

export default class ScaleCommand extends CreationCommand {

  get name() {
    return 'scale';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {
    //scale(<item>,factor)
    if (params.length !== 2 || !(params[0] instanceof Item) || typeof params[1] != 'number') {
      throw new WrongParamsError(params, this);
    }
    this.item = params[0].scale(params[1]);
  }

  bindElements(elems, commands) {
    let cname = this.item.constructor.name.toLowerCase();
    Object.getPrototypeOf(commands[cname]).bindElements.call({item:this.item},elems);
  }

};