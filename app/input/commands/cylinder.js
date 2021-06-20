//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand } from '../command.js';
import { MissingPatternError, NotFeasibleError, WrongParamsError } from '../../errors.js';
import { Point } from '../../scene/items/point.js';
import { Plane } from '../../scene/items/plane.js';
import { Cylinder } from '../../scene/items/cylinder.js';
import { Circle } from '../../scene/items/circle.js';
import { Segment } from '../../scene/items/segment.js';
import { globalScene } from '../../scene/scene.js';

export default class CylinderCommand extends CreationCommand {

  get name() {
    return 'cylinder';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {
    // TODO: is this actually useful?
    // cylinder(<circle>,<circle>) - two bases
    if (params.length === 2 && params[0] instanceof Circle && params[1] instanceof Circle) {
      this.item = new Cylinder(params[0], params[1]);
    }
    // cylinder(<circle>,len[,angle])
    else if (params.length >= 2 && params[0] instanceof Circle && typeof params[1] === 'number' &&
      (params.length === 2 || typeof params[2] === 'number')) {
      //angle defaults to 90
      let angle = params[2] || 90;
      let direction = params[0].plane.n.rotate(params[0].plane.getCoplanarVector(), 90 - angle);
      let base2Cen = params[0].cen.add(direction.unit().scale(params[1]));
      this.item = new Cylinder(params[0], new Circle(
        base2Cen,
        params[0].rad,
        new Plane(base2Cen, params[0].plane.n)
      ));
    }
    // cylinder(<circle>,<segment>) - constructs a cylinder by a base and direction for the edge
    else if (params.length === 2 && params[0] instanceof Circle && params[1] instanceof Segment) {
      let base2Cen = params[0].cen.add(params[1].asVector());
      this.item = new Cylinder(params[0], new Circle(
        base2Cen,
        params[0].rad,
        new Plane(base2Cen, params[0].plane.n)
      ));
    }
    //TODO: cylinder(<parallelogram|rectangle|square>,'a | b | c |d') - constructs a cylinder by rotating a 2D
    else throw new WrongParamsError(params, this);
  }

  //TODO: bindElements

};