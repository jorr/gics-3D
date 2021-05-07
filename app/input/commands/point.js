//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand } from '../command.js';
import { globalScene } from '../../scene/scene.js';
import { Point } from '../../scene/items/point.js';
import { MissingPatternError } from '../../errors.js';

export default class PointCommand extends CreationCommand {

  get name() {
    return 'point';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {
    // point(x,y,z) - coordinates of the point
    if (params.length === 3 && params.every(p => typeof p === 'number')) {
      this.item = new Point(params[0], params[1], params[2]);
    }
    // point(<segment>,mult) - a point lying at mult*length along the length of the segment, starting from the left-hand endpoint
    else if (params.length === 2 && params[0] instanceof Segment && typeof params[1] === 'number') {
      this.item = new Point(
        params[0].p1.x + params[1]*params[0].len,
        params[0].p1.y + params[1]*params[0].len,
        params[0].p1.z + params[1]*params[0].len
      );
    }
    // point(<point>,dx,dy,dz) - a point distanced at the vector(dx,dy,dz) from the given point
    else if (params.length === 2 && params[0] instanceof Point 
      && params.slice(1).every(p => typeof p === 'number')) {
      this.item = new Point(
        params[0].x + params[1],
        params[0].y + params[2],
        params[0].z + params[3]
      );
    }

    else throw new WrongParamsError(params, this);
  }

  //point can't decompose to elements for binding

};