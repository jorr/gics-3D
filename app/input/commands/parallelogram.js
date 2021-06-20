//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand, Angle } from '../command.js';
import { globalScene } from '../../scene/scene.js';
import { Segment } from '../../scene/items/segment.js';
import { Point } from '../../scene/items/point.js';
import { Plane } from '../../scene/items/plane.js';
import { Parallelogram } from '../../scene/items/regularquad.js';
import { midpoint } from '../../scene/util.js';
import { WrongParamsError, WrongPatternError, NotFeasibleError } from '../../errors.js';

import log from 'loglevel';

export default class ParallelogramCommand extends CreationCommand {

  get name() {
    return 'parallelogram';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {
    // parallelogram(<segment>,ang,d[,<plane>]) - a diagonal lying on the segment, the angle between the diagonals and the length of the other diagonal
    if (params.length >=3 && params[0] instanceof Segment && params[1] instanceof Angle && typeof params[2] === 'number') {
      if (params[3] instanceof Plane &&
          (params[0].isCollinearWith(params[3].n)
          || !params[3].hasPoint(params[0].p1) || !params[3].hasPoint(params[0].p2))) {
        throw new NotFeasibleError(params, this.constructor.name);
      }
      let plane = params[3] instanceof Plane ? params[3] : new Plane(params[0].p1, params[0].asVector().perpendicular());
      let midDiagonal = midpoint(params[0].p1, params[0].p2);
      let otherDiagonal = params[0].asVector().rotate(plane.n, params[1].value);
      this.item = new Parallelogram(params[0].p1, midDiagonal.add(otherDiagonal.unit().scale(params[2]/2)), params[0].p2);
    }
    // parallelogram(<segment>,d,ang[,<plane>]) - a side on the segment, the length of the other segment, and the angle between the sides
    else if (params.length >=2 && params[0] instanceof Segment && typeof params[1] === 'number' && params[2] instanceof Angle) {
      if (params[3] instanceof Plane &&
          (params[0].isCollinearWith(params[3].n)
          || !params[3].hasPoint(params[0].p1) || !params[3].hasPoint(params[0].p2))) {
        throw new NotFeasibleError(params, this.constructor.name);
      }
      let plane = params[3] instanceof Plane ? params[3] : new Plane(params[0].p1, params[0].asVector().perpendicular());
      let otherSide = params[0].asVector().rotate(plane.n, params[2].value).unit().scale(params[1]);
      this.item = new Parallelogram(params[0].p1, params[0].p2, params[0].p2.add(otherSide));
    }
    //parallelogram([<plane>]) - a random Parallelogram
    else if (params.length === 0 || params.length === 1 && params[0] instanceof Plane) {
      let plane = params[0] || Plane.Oxy;
      let sideA = 100+Math.random()*100, sideB, angle = 15 + Math.random()*70;
      do { sideB = 100+Math.random()*100; } while (sideA === sideB);
      let A = plane.getRandomPoint();
      let B = A.add(plane.getCoplanarVector().unit().scale(sideA));
      let C = B.add(A.vectorTo(B).rotate(plane.n, angle).unit().scale(sideB));
      this.item = new Parallelogram(A, B, C);
    }

    else throw new WrongParamsError(params, this);
  }

  bindElements(elems) {
    // Parallelogram should support [A, B, C, D] deconstruction
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