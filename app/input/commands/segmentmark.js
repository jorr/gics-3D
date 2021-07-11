//import storage
//import scene manipulation
//import drawing for side-effects

import { Command } from '../command.js';
import { Segmentmark } from '../../scene/items/segmentmark.js';
import { Segment } from '../../scene/items/segment.js';
import { WrongParamsError } from '../../errors.js';
import { globalScene } from '../../scene/scene.js';

import log from 'loglevel';

export default class SegmentmarkCommand extends Command {

  get name() {
    return 'segmentmark';
  }

  requiresPattern() {
    return false;
  }

  execute(params) {
    super.execute(params);
    //segmentmark(<segment>[,<type>])
    if (params.length >=1 && params[0] instanceof Segment) {
      globalScene.addMarking(new Segmentmark(...params));
    }
    else throw new WrongParamsError(params, this);
  }

};