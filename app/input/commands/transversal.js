//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand } from '../command.js';
import { Segment } from '../../scene/items/segment.js';
import { Line } from '../../scene/items/line.js';
import { WrongParamsError, NotFeasibleError } from '../../errors.js';

import log from 'loglevel';

export default class TransversalCommand extends CreationCommand {

  get name() {
    return 'transversal';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {
    //transversal(<line>,<line>)
    if (params.length == 2 && params[0] instanceof Line && params[1] instanceof Line) {
      let cross = params[0].u.cross(params[1].u), AB = params[0].pt.vectorTo(params[1].pt);
      if (params[0].u.triple(params[1].u, AB) === 0)
        throw new NotFeasibleError(params, this.name);
      this.item = new Segment(
        params[0].getPointAtParam(params[1].u.triple(cross, AB) / cross.dot(cross)),
        params[1].getPointAtParam(params[0].u.triple(cross, AB) / cross.dot(cross)),
      );
    }
    else throw new WrongParamsError(params, this);
  }

  bindElements(elems) {
    // Transversals should support [p1,p2] deconstruction
    if (elems.length !== 2) {
      throw new WrongPatternError('[p1,p2]', this);
    }
    globalScene.bindElement(this.item.p1, elems[0].name, elems[0].suppress);
    globalScene.bindElement(this.item.p2, elems[1].name, elems[1].suppress);
  }

};