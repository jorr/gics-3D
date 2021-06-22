//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand, Angle } from '../command.js';
import { Segment } from '../../scene/items/segment.js';
import { Point } from '../../scene/items/point.js';
import { Plane } from '../../scene/items/plane.js';
import { RegularPolygon } from '../../scene/items/regularpolygon.js';
import { midpoint } from '../../scene/util.js';
import { WrongParamsError, WrongPatternError, NotFeasibleError } from '../../errors.js';

import log from 'loglevel';

export default class RegularPolygonCommand extends CreationCommand {

  get name() {
    return 'polygon';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {
    // polygon(<point>,n,radius[,<plane>]) - a regular polygon with center on point, n sides and "radius"
    if (params.length >=3 && params[0] instanceof Point && typeof params[1] === 'number' && typeof params[2] === 'number') {
      if (params[1] < 3 || params[2] <= 0) {
        throw new NotFeasibleError(params, this.constructor.name);
      }
      let plane = params[3] instanceof Plane ? params[3] : new Plane(params[0], Plane.Oxy.parallelThrough(params[0]));
      let vertices = [], radius;
      vertices[0] = plane.getRandomPoint();
      radius = params[0].vectorTo(vertices[0]);
      for (let i = 1; i < n; i++)
        vertices[i] = params[0].add(radius.rotate(plane.n, 360/n));
      if (n===3)
        this.item = new Triangle(...vertices);
      else if (n===4)
        this.item = new Square(...vertices);
      else
        this.item = new RegularPolygon(...vertices);
    }
    // polygon(<segment>,n[,<plane>]) - a side on the segment and sid
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
    //polygon(n,[<plane>]) - a random polygon with n sides
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