//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand } from '../command.js';
import { globalScene } from '../../scene/scene.js';
import { Segment } from '../../scene/items/segment.js';
import { Point } from '../../scene/items/point.js';
import { dist } from '../../scene/util.js';
import { WrongParamsError, WrongPatternError, NotFeasibleError } from '../../errors.js';

export default class SegmentCommand extends CreationCommand {

  get name() {
    return 'segment';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {
    //segment(<point>,<point>) - a segment defined by two endpoints
    if (params[0] instanceof Point && params[1] instanceof Point) {
      if (dist(params[0], params[1]) === 0) {
        throw new NotFeasibleError(params, Segment.name);
      }
      this.item = new Segment(...params);
    }
    // segment(<point>,r,ang[,<plane>]) - a segment starting from the given endpoint and having the second one on distance r, at angle ang from plane (defaults at 0xy)
    // else if (params.length >= 3 && params[0] instanceof Point && typeof params[1] == 'number' && typeof params[2] == 'number') {
    //   //not unique
    // }

    else throw new WrongParamsError(params, this);
  }

  bindElements(elems) {
    // Segment should support [p1,p2] deconstruction
    if (elems.length !== 2) {
      throw new WrongPatternError('[p1,p2]', this);
    }
    if (elems[0].name) {
      globalScene.addItem(this.item.p1, elems[0].name);
    }
    if (elems[1].name) {
      globalScene.addItem(this.item.p2, elems[1].name);
    }
  }

};