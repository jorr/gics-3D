//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand } from '../command.js';
import { globalScene } from '../../scene/scene.js';
import { Segment } from '../../scene/items/segment.js';
import { Point } from '../../scene/items/point.js';
import { Plane } from '../../scene/items/plane.js';
import { Square } from '../../scene/items/regularquad.js';
import { dist, midpoint } from '../../scene/util.js';
import { WrongParamsError, WrongPatternError, NotFeasibleError } from '../../errors.js';

import log from 'loglevel';

export default class SquareCommand extends CreationCommand {

  get name() {
    return 'square';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {
    //square(<point>,<point>,[<plane>]) - a square on the diagonal, optionally in a given plane
    if (params.length >=2 && params[0] instanceof Point && params[1] instanceof Point) {
      if (dist(params[0], params[1]) === 0 ||
        (params[2] instanceof Plane && params[0].vectorTo(params[1]).isCollinearWith(params[2].n))) {
        throw new NotFeasibleError(params, Square.name);
      }
      let plane = params[2] instanceof Plane ? params[2] : new Plane(params[0], params[0].vectorTo(params[1]).perpendicular());
      let midDiagonal = midpoint(params[0], params[1]);
      let otherDiagonal = params[0].vectorTo(params[1]).cross(plane.n).unit().scale(dist(params[0], params[1])/2);
      this.item = new Square(params[0], midDiagonal.add(otherDiagonal), params[1]);
    }
    // square(<segment>,[<plane>]) - a square with a side on the segment
    else if (params[0] instanceof Segment) {
      let plane = params[1] instanceof Plane ? params[1] : new Plane(params[0].p1, params[0].asVector().perpendicular());
      let otherSide = params[0].asVector().cross(plane.n).unit().scale(params[0].len);
      this.item = new Square(params[0].p1, params[0].p2, params[0].p2.add(otherSide));
    }
    //square([<plane>]) - a random square
    else if (params.length === 0 || params.length === 1 && params[0] instanceof Plane) {
      let plane = params[0] || Plane.Oxy;
      let A = plane.getRandomPoint();
      let B = A.add(plane.getCoplanarVector().unit().scale(100+Math.random()*100));
      let C = B.add(A.vectorTo(B).cross(plane.n).unit().scale(dist(A, B)));
      this.item = new Square(A, B, C);
    }

    else throw new WrongParamsError(params, this);
  }

  bindElements(elems) {
    // Square should support [A, B, C, D] deconstruction
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