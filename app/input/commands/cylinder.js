//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand } from '../command.js';
import { MissingPatternError, NotFeasibleError, WrongParamsError } from '../../errors.js';
import { Point } from '../../scene/items/point.js';
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
    // cylinder(<circle>,<circle>) - two bases
    if (params.length === 2 && params[0] instanceof Circle && params[1] instanceof Circle) {
      this.item = new Cylinder(params[0], params[1]);
    }
    // cylinder(circle,len[,angle])
    else if (params.length >= 2 && params[0] instanceof Circle && typeof params[1] === 'number' &&
      (params.length === 2 || typeof params[2] === 'number')) {
      //angle defaults to 90
      angle = angle || 90;
      if (angle === 90) {
        //costruct two circles
      }
      //BOYKO: как да намерим вектор на даден ъгъл от равнина
    }
    // cylinder(<circle>,<segment>) - constructs a cylinder by a base and direction for the edge
    else if (params.length === 2 && params[0] instanceof Circle && params[1] instanceof Segment) {
      //TODO: fix this when changing circle
      this.item = new Cylinder(params[0], new Circle(
        params[0].cen.add(params[1].asVector()),
        params[0].p1.add(params[1].asVector()),
        params[0].p2.add(params[1].asVector())
      ));
    }
    else throw new WrongParamsError(params, this);
  }

};