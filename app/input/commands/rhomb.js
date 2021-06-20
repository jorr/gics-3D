//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand, Angle } from '../command.js';
import { globalScene } from '../../scene/scene.js';
import { Segment } from '../../scene/items/segment.js';
import { Point } from '../../scene/items/point.js';
import { Plane } from '../../scene/items/plane.js';
import { Rhomb } from '../../scene/items/regularquad.js';
import { midpoint } from '../../scene/util.js';
import { WrongParamsError, WrongPatternError, NotFeasibleError } from '../../errors.js';

import log from 'loglevel';

export default class RhombCommand extends CreationCommand {

  get name() {
    return 'rhomb';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {
    // rhomb(<segment>,d[,<plane>]) - a diagonal lying on the segment and the length of the other diagonal
    if (params.length >=2 && params[0] instanceof Segment && typeof params[1] === 'number') {
      if (params[2] instanceof Plane &&
          (params[0].isCollinearWith(params[2].n)
          || !params[2].hasPoint(params[0].p1) || !params[2].hasPoint(params[0].p2))) {
        throw new NotFeasibleError(params, this.constructor.name);
      }
      let plane = params[2] instanceof Plane ? params[2] : new Plane(params[0].p1, params[0].asVector().perpendicular());
      let midDiagonal = midpoint(params[0].p1, params[0].p2);
      let otherDiagonal = params[0].asVector().rotate(plane.n, 90);
      this.item = new Rhomb(params[0].p1, midDiagonal.add(otherDiagonal.unit().scale(params[1]/2)), params[0].p2);
    }
    // rhomb(<segment>,ang[,<plane>]) - a side on the segment and the angle between the sides
    else if (params.length >=2 && params[0] instanceof Segment && params[1] instanceof Angle) {
      if (params[2] instanceof Plane &&
          (params[0].isCollinearWith(params[2].n)
          || !params[2].hasPoint(params[0].p1) || !params[2].hasPoint(params[0].p2))) {
        throw new NotFeasibleError(params, this.constructor.name);
      }
      let plane = params[2] instanceof Plane ? params[2] : new Plane(params[0].p1, params[0].asVector().perpendicular());
      let otherSide = params[0].asVector().rotate(plane.n, params[1].value).unit().scale(params[0].len);
      this.item = new Rhomb(params[0].p1, params[0].p2, params[0].p2.add(otherSide));
    }
    //rhomb([<plane>]) - a random rhomb
    else if (params.length === 0 || params.length === 1 && params[0] instanceof Plane) {
      let plane = params[0] || Plane.Oxy;
      let side = 100+Math.random()*100, angle = 15 + Math.random()*70;
      let A = plane.getRandomPoint();
      let B = A.add(plane.getCoplanarVector().unit().scale(side));
      let C = B.add(A.vectorTo(B).rotate(plane.n, angle).unit().scale(side));
      this.item = new Rhomb(A, B, C);
    }

    else throw new WrongParamsError(params, this);
  }

  bindElements(elems) {
    // Rhomb should support [A, B, C, D] deconstruction
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