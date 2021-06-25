//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand, Angle } from '../command.js';
import { Point } from '../../scene/items/point.js';
import { Plane } from '../../scene/items/plane.js';
import { Quad } from '../../scene/items/quad.js';
import { sortVertices } from '../../scene/util.js';
import { WrongParamsError, WrongPatternError, NotFeasibleError } from '../../errors.js';

import log from 'loglevel';
import _ from 'lodash';

export default class QuadCommand extends CreationCommand {

  get name() {
    return 'quad';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {
    // quad(<point>,<point>,<point>,<point>) - the vertices of the quad
    if (params.length === 4 && params.every(p => p instanceof Point)) {
      let vA = params[0].vectorTo(params[1]);
      let vB = params[0].vectorTo(params[2]);
      if (vA.isCollinearWith(vB)) {
        vB = params[0].vectorTo(params[3]);
        if (vB.isCollinearWith(vA)) throw new NotFeasibleError(params, this.constructor.name);
      }
      let plane = new Plane(params[0], vA.cross(vB).unit());
      if (!plane.hasPoint(params[1]) || !plane.hasPoint(params[2]) || !plane.hasPoint(params[3]))
        throw new NotFeasibleError(params, this.constructor.name);
      params = sortVertices(params, plane);
      this.item = new Quad(...params);
    }
    // quad([<plane>]) - a random quad lying in Oxy or the given plane
    else if (params.length <= 1) {
      let plane = params[0] && params[0] instanceof Plane ? params[0] : Plane.Oxy;
      let points = [];
      while (points.length < 4) {
        let p = plane.getRandomPoint();
        if (!_.find(points, pp => p.equals(pp))) points.push(p);
      }
      this.item = new Quad(...sortVertices(points, plane));
    }
    else throw new WrongParamsError(params, this);
  }

  bindElements(elems) {
    // Quad should support [A, B, C, D] deconstruction
    if (elems.length !== 4) {
      throw new WrongPatternError('[A,B,C,D]', this);
    }
    if (elems[0].name) {
      globalScene.addBinding(this.item, 'A', elems[0].name);
    }
    if (elems[1].name) {
      globalScene.addBinding(this.item, 'B', elems[1].name);
    }
    if (elems[2].name) {
      globalScene.addBinding(this.item, 'C', elems[2].name);
    }
    if (elems[3].name) {
      globalScene.addBinding(this.item, 'D', elems[3].name);
    }
  }

};