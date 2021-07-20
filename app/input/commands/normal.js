//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand } from '../command.js';
import { Segment } from '../../scene/items/segment.js';
import { Plane } from '../../scene/items/plane.js';
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
    //normal(<plane>[,size])
    if (params.length >=1 && params[0] instanceof Plane) {
      let size = typeof params[1] === 'number' ? params[1] : 50;
      let pt = params[0].getRandomPoint();
      this.item = new Segment(pt, pt.add(params[0].n.unit().scale(size)), true);
    }
    //TODO: make it possible to give a point
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