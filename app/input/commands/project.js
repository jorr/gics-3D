//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand } from '../command.js';
import { Segment } from '../../scene/items/segment.js';
import { Plane } from '../../scene/items/plane.js';
import { Point } from '../../scene/items/point.js';
import { Line } from '../../scene/items/line.js';
import PointCommand from './point.js';
import SegmentCommand from './segment.js';
import { WrongParamsError } from '../../errors.js';

import log from 'loglevel';

export default class ProjectCommand extends CreationCommand {

  get name() {
    return 'project';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {
    //project(<point>,<plane|line|segment>)
    if (params.length === 2 && params[0] instanceof Point && (params[1] instanceof Line || params[1] instanceof Segment || params[1] instanceof Plane)) {
      this.item = params[0].projectionOn(params[1]);
    }
    //project(segment,line)
    else if (params.length === 2 && params[0] instanceof Segment && params[1] instanceof Line) {
      this.item = params[0].projectionOn(params[1]);
    }
    //project(<line|segment>,<plane>)
    else if (params.length === 2 && (params[0] instanceof Segment || params[0] instanceof Line) && params[1] instanceof Plane) {
      this.item = params[0].projectionOn(params[1]);
    }
    else throw new WrongParamsError(params, this);
  }

  bindElements(elems) {
    if (this.item instanceof Point) {
      PointCommand.prototype.bindElements.call(this, elems);
    } else if (this.item instanceof Segment) {
      SegmentCommand.prototype.bindElements.call(this, elems);
    }
  }

};