// COMMAND SYNTAX: 

import { Command } from '../command.js';
import { WrongParamsError } from '../../errors.js';
import { globalScene } from '../../scene/scene.js';
import { Item } from '../../scene/item.js';

import log from 'loglevel';
import _ from 'lodash';

export default class LinestyleCommand extends Command {

  get name() {
    return 'linestyle';
  }

  requiresPattern() {
    return false;
  }

  execute(params, pattern) {
    super.execute(params, pattern);

    if (params[0] instanceof Item) {
      params[0].style = _.merge(params[0].style, {
        stroke: params[1],
        linetype: params[2],
      });
    }
    else if (params.length > 0) {
      globalScene.defaultStyle = _.merge(globalScene.defaultStyle, {
        stroke: params[0],
        linetype: params[1]
      });
    }
    else throw new WrongParamsError(params, this);
  }

};