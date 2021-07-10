//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand, Angle } from '../command.js';
import { globalScene } from '../../scene/scene.js';
import { Segment } from '../../scene/items/segment.js';
import { Point } from '../../scene/items/point.js';
import { Plane } from '../../scene/items/plane.js';
import { Rectangle } from '../../scene/items/regularquad.js';
import { midpoint } from '../../scene/util.js';
import { WrongParamsError, WrongPatternError, NotFeasibleError } from '../../errors.js';

import log from 'loglevel';

export default class RectangleCommand extends CreationCommand {

  get name() {
    return 'rectangle';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {
    // rectangle(<segment>,ang[,<plane>]) - a diagonal lying on the segment and the angle between the two diagonals.
    if (params.length >=2 && params[0] instanceof Segment && params[1] instanceof Angle) {
      if (params[2] instanceof Plane &&
          (params[0].isCollinearWith(params[2].n)
          || !params[2].hasPoint(params[0].p1) || !params[2].hasPoint(params[0].p2))) {
        throw new NotFeasibleError(params, this.constructor.name);
      }
      let plane = params[2] instanceof Plane ? params[2] : new Plane(params[0].p1, params[0].asVector().perpendicular());
      let midDiagonal = midpoint(params[0].p1, params[0].p2);
      let otherDiagonal = params[0].asVector().rotate(plane.n, params[1].value);
      //rectangles have their diagonals equal
      this.item = new Rectangle(params[0].p1, midDiagonal.add(otherDiagonal.unit().scale(params[0].len/2)), params[0].p2);
    }
    // rectangle(<segment>,d[,<plane>]) - a rectangle with a side on the segment and the length of the other side
    else if (params.length >=2 && params[0] instanceof Segment && typeof params[1] === 'number') {
      if (params[2] instanceof Plane &&
          (params[0].isCollinearWith(params[2].n)
          || !params[2].hasPoint(params[0].p1) || !params[2].hasPoint(params[0].p2))) {
        throw new NotFeasibleError(params, this.constructor.name);
      }
      let plane = params[2] instanceof Plane ? params[2] : new Plane(params[0].p1, params[0].asVector().perpendicular());
      let otherSide = params[0].asVector().perpendicular(plane).unit().scale(params[1]);
      this.item = new Rectangle(params[0].p1, params[0].p2, params[0].p2.add(otherSide));
    }
    //rectangle([<plane>]) - a random rectangle
    else if (params.length === 0 || params.length === 1 && params[0] instanceof Plane) {
      let plane = params[0] || Plane.Oxy;
      let sideA = 100+Math.random()*100, sideB;
      do { sideB = 100+Math.random()*100; } while (sideA === sideB);
      let A = plane.getRandomPoint();
      let B = A.add(plane.getCoplanarVector().unit().scale(sideA));
      let C = B.add(A.vectorTo(B).cross(plane.n).unit().scale(sideB));
      this.item = new Rectangle(A, B, C);
    }

    else throw new WrongParamsError(params, this);
  }

  bindElements(elems) {
    // Rectangle should support [A, B, C, D] deconstruction
    if (elems.length !== 4) {
      throw new WrongPatternError('[A,B,C,D]', this);
    }
    globalScene.bindElement(this.item.A, elems[0].name, elems[0].suppress);
    globalScene.bindElement(this.item.B, elems[1].name, elems[1].suppress);
    globalScene.bindElement(this.item.C, elems[2].name, elems[2].suppress);
    globalScene.bindElement(this.item.D, elems[3].name, elems[3].suppress);
  }

};