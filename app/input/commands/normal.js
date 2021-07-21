//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand } from '../command.js';
import { Segment } from '../../scene/items/segment.js';
import { Plane } from '../../scene/items/plane.js';
import { Point } from '../../scene/items/point.js';
import { Item } from '../../scene/item.js';
import { WrongParamsError, WrongPatternError, NotFeasibleError } from '../../errors.js';

import log from 'loglevel';

export default class NormalCommand extends CreationCommand {

  get name() {
    return 'normal';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {
    //normal(<plane>[,<point>,size])
    if (params.length >=1 && params[0] instanceof Item) {
      let size = typeof params[2] === 'number' ? params[2] : 50;
      let plane;
      if (params[0] instanceof Plane) plane = params[0];
      else plane = params[0].plane;
      if (!plane) throw new WrongParamsError(params, this);
      let pt = params[1] && params[1] instanceof Point ? params[1] : plane.getRandomPoint();
      if (!plane.hasPoint(pt)) throw new NotFeasibleError(params, this);
      this.item = new Segment(pt, pt.add(plane.n.unit().scale(size)), true);
    }
    else throw new WrongParamsError(params, this);
  }

  bindElements(elems) {
    // Normal should support [point,point] deconstruction
    if (elems.length !== 2) {
      throw new WrongPatternError('[p1,p2]', this);
    }
    globalScene.addBinding(this.item.p1, elems[0].name, elems[0].suppress);
    globalScene.addBinding(this.item.p2, elems[1].name, elems[1].suppress);
  }

};