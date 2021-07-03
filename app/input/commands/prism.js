//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand } from '../command.js';
import { NotFeasibleError, WrongParamsError } from '../../errors.js';
import { Polygon } from '../../scene/items/polygon.js';
import { Prism } from '../../scene/items/prism.js';
import { Segment } from '../../scene/items/segment.js';

import _ from 'lodash';
import log from 'loglevel';

export default class PrismCommand extends CreationCommand {

  get name() {
    return 'prism';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {
    // TODO: is this actually useful?
    // prism(<quad|triangle>,<quad|triangle>) - constructs a prism by two bases
    if (params.length === 2 && params[0] instanceof Polygon && params[1] instanceof Polygon
        && params[0].constructor.name === params[1].constructor.name) {

      if (!params[0].plane.isParallelTo(params[1].plane))
        throw new NotFeasibleError(params, this.name);

      let i, direction, vcount = params[1].vertices.length;
      for (i = 0; i < vcount; i++) {
        direction = params[0].vertices[0].vectorTo(params[1].vertices[i]);
        if (_.every(params[1].vertices.map((v,j) => v.vectorTo(params[0].vertices[(j+i)%vcount])), d => d.isCollinearWith(direction))) break;
      }
      if (i === params[1].vertices.length) {
        // no parallel edges were found so the bases are parallel but not matching
        throw new NotFeasibleError(params, this.name);
      }

      this.item = new Prism(params[0], direction.norm, direction.unit());
    }
    // prism(<quad|triangle>,<segment>) - construct a prism by a base and an edge
    else if (params.length === 2 && params[0] instanceof Polygon && params[1] instanceof Segment) {
      this.item = new Prism(params[0], params[1].len, params[1].asVector());
    }
    // prism(<quad|triangle>,<depth>[,'-']) - constructs a right prism by a base and offset, similar to cuboid
    else if (params.length >=2 && params[0] instanceof Polygon && typeof params[1] == 'number') {
      let sign = 1;
      if (params.length === 3) {
        if (params[2] !== '-') throw new WrongParamsError(params, this);
        else sign = -1;
      }

      let direction = params[0].plane.n.unit().scale(-sign);
      this.item = new Prism(params[0], params[1], direction);
    }
    else throw new WrongParamsError(params, this);
  }

};