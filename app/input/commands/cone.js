//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand } from '../command.js';
import { MissingPatternError, NotFeasibleError, WrongParamsError } from '../../errors.js';
import { Point } from '../../scene/items/point.js';
import { Plane } from '../../scene/items/plane.js';
import { Circle } from '../../scene/items/circle.js';
import { Triangle } from '../../scene/items/triangle.js';
import { Cone } from '../../scene/items/cone.js';
import { midpoint } from '../../scene/util.js';

import log from 'loglevel';

export default class ConeCommand extends CreationCommand {

  get name() {
    return 'cone';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {

    // cone(<circle>,<point>) - base and apex
    if (params.length === 2 && params[1] instanceof Point && params[0] instanceof Circle) {
      this.item = new Cone(params[0], params[1]);
    }
    // cone(<circle>,height) - base of right cone where the apex is projected on the center
    else if (params.length == 2 && typeof params[1] === 'number' && params[0] instanceof Circle) {
      let height = params[0].plane.n.unit().scale(params[1]);
      let apex = params[0].cen.add(height);
      this.item = new Cone(params[0], apex);
    }
    // cone(<triangle>,"a | b | c") - the triangle is rotated around the midpoint of the side
    else if (params.length == 2 && params[0] instanceof Triangle && typeof params[1] === 'string') {
      let side = params[0][params[1]];
      let center = midpoint(side.p1, side.p2);
      let axis = side.asVector().perpendicular(params[0].plane);
      // let rotated = side.asVector().rotate(axis, 45);
      this.item = new Cone(
        new Circle(center, side.len/2, new Plane(center, axis)),
        params[0][params[1].toUpperCase()]
      );
    }
    else throw new WrongParamsError(params, this);
  }

  //TODO: bindElements

};