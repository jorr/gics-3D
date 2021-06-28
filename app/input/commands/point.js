//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand } from '../command.js';
import { globalScene } from '../../scene/scene.js';
import { Point } from '../../scene/items/point.js';
import { Segment } from '../../scene/items/segment.js';
import { Line } from '../../scene/items/line.js';
import { Plane } from '../../scene/items/plane.js';
import { MissingPatternError, WrongParamsError } from '../../errors.js';

import log from 'loglevel';

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
    else if (params.length === 4 && params[0] instanceof Point
      && params.slice(1).every(p => typeof p === 'number')) {
      this.item = new Point(
        params[0].x + params[1],
        params[0].y + params[2],
        params[0].z + params[3]
      );
    }
    // point([<line|plane|segment>]) - a random point, optionally on a plane, line or segment
    else {
      let container = params[0];
      if (!container) this.item = globalScene.getRandomPointInGoodView();
      else if (container instanceof Plane) {
        this.item = container.getRandomPoint();
      } else if (container instanceof Line) this.item = container.getPointAtParam(Math.random());
      else if (container instanceof Segment) this.item = container.p1.add(Math.random()*container.p1.vectorTo(container.p2));
      else throw new WrongParamsError(params, this);
    }
  }

  //point can't decompose to elements for binding

};