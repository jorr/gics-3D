//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand, Angle } from '../command.js';
import { globalScene } from '../../scene/scene.js';
import { Segment } from '../../scene/items/segment.js';
import { Line } from '../../scene/items/line.js';
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
    //segment(<point>,d,<line|segment>[,<angle>])
    else if (params.length >= 3 && params[0] instanceof Point && typeof params[1] === 'number'
      && (params[2] instanceof Line || params[2] instanceof Segment)) {
      let angle = params[3] && params[3] instanceof Angle ? params[3].value : 0;
      if (params[2] instanceof Segment)
        params[2] = params[2].lineOn();
      let directon = params[2].u.rotate(params[2].u.perpendicular(),angle);
      this.item = new Segment(params[0], params[0].add(direction.unit().scale(params[1])));
    }
    else throw new WrongParamsError(params, this);
  }

  bindElements(elems) {
    // Segment should support [p1,p2] deconstruction
    if (elems.length !== 2) {
      throw new WrongPatternError('[p1,p2]', this);
    }
    globalScene.bindElement(this.item.p1, elems[0].name, elems[0].suppress);
    globalScene.bindElement(this.item.p2, elems[1].name, elems[1].suppress);
  }

};