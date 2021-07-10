//import storage
//import scene manipulation
//import drawing for side-effects

import { Command } from '../command.js';
import { Label } from '../../scene/items/label.js';
import { Item } from '../../scene/item.js';
import { WrongParamsError } from '../../errors.js';
import { globalScene } from '../../scene/scene.js';

import log from 'loglevel';

export default class LabelCommand extends Command {

  get name() {
    return 'label';
  }

  requiresPattern() {
    return false;
  }

  execute(params) {
    super.execute(params);
    //label(<text>,<item>[,<direction>,<offset>])
    if (params.length >=2 && typeof params[0] === 'string' && params[1] instanceof Item) {
      globalScene.addLabel(new Label(params[1].labelPosition, params[0], params[2], params[3]));
    }
    else throw new WrongParamsError(params, this);
  }

};