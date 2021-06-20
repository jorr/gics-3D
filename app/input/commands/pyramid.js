//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand } from '../command.js';
import { MissingPatternError, NotFeasibleError, WrongParamsError } from '../../errors.js';
import { Point } from '../../scene/items/point.js';
import { Plane } from '../../scene/items/plane.js';
import { Pyramid } from '../../scene/items/pyramid.js';
import { Polygon } from '../../scene/item.js';
import { Triangle } from '../../scene/items/triangle.js';
import { Square } from '../../scene/items/regularquad.js';
import { centroid } from '../../scene/util.js';
import { globalScene } from '../../scene/scene.js';

import log from 'loglevel';

export default class PyramidCommand extends CreationCommand {

  get name() {
    return 'pyramid';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {

    // pyramid(<tri|quad|square|...>,<point>) - base and apex
    if (params.length === 2 && params[1] instanceof Point && params[0] instanceof Polygon) {
      this.item = new Pyramid(params[0], params[1]);
    }
    // pyramid(<base>,height) - base of right pyramid where the apex is projected on the center
    else if (params.length == 2 && typeof params[1] === 'number' && params[0] instanceof Polygon) {
      let centre = centroid(params[0].vertices);
      let height = params[0].plane.n.unit().scale(params[1]);
      let apex = centre.add(height);
      this.item = new Pyramid(params[0], apex);
    }
    // pyramid(<point>,height,numvertices[,<plane>]) - constructs a regular right pyramid with the base being n-polygon (n=3,4), centered around the point
    else if (params.length >= 3 && typeof params[1] === 'number' && typeof params[2] === 'number' &&
      params[0] instanceof Point) {

      let plane = params[3] instanceof Plane ? params[3] : Plane.Oxz; // usually we want Oxz
      let pToV1 = params[0].vectorTo(plane.getRandomPoint());
      let vertices = [...Array(params[2]).keys()].map(index => params[0].add(pToV1.rotate(plane.n, index*360/params[2])));
      let apex = params[0].add(plane.n.scale(params[1]));

      if (params[2] == 3) {
        this.item = new Pyramid(new Triangle(...vertices), apex);
      } else if (params[2] == 4) {
        this.item = new Pyramid(new Square(...vertices), apex);
      } //TODO: finish the others.
      else throw new WrongParamsError(params, this);
    }
    else throw new WrongParamsError(params, this);
  }

};