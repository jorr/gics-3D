//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand } from '../command.js';
import { MissingPatternError, NotFeasibleError, WrongParamsError } from '../../errors.js';
import { Point } from '../../scene/items/point.js';
import { Circle } from '../../scene/items/circle.js';
import { Sphere } from '../../scene/items/sphere.js';
import { dist } from '../../scene/util.js';

import log from 'loglevel';

export default class SphereCommand extends CreationCommand {

  get name() {
    return 'sphere';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {
    // sphere(<point>,<point>) - centre and a point on the sphere
    if (params.length === 2 && params[1] instanceof Point && params[0] instanceof Point) {
      this.item = new Sphere(params[0], dist(params[0],params[1]));
    }
    // sphere(<point>,radius) - centre and radius
    else if (params.length == 2 && typeof params[1] === 'number' && params[0] instanceof Point) {
      this.item = new Sphere(params[0], params[1]);
    }
    // sphere(<circle>) - a sphere obtained by rotating the circle around any of its diameters
    else if (params.length == 1 && params[0] instanceof Circle) {
      this.item = new Sphere(params[0].cen, params[0].rad);
    }
    else throw new WrongParamsError(params, this);
  }

  //TODO: bindElements

};