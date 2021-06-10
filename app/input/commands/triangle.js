//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand, Angle } from '../command.js';
import { globalScene } from '../../scene/scene.js';
import { Segment } from '../../scene/items/segment.js';
import { Point } from '../../scene/items/point.js';
import { Plane } from '../../scene/items/plane.js';
import { Triangle } from '../../scene/items/triangle.js';
import { dist, midpoint } from '../../scene/util.js';
import { WrongParamsError, WrongPatternError, NotFeasibleError } from '../../errors.js';

import log from 'loglevel';

export default class TriangleCommand extends CreationCommand {

  get name() {
    return 'triangle';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {

    // triangle(<point>,<point>,<point>) - the vertices of the triangle
    if (params.length === 3 && params[0] instanceof Point && params[1] instanceof Point && params[2] instanceof Point) {
      this.item = new Triangle(...params);
    }
    // triangle([<plane>]) - a random triangle lying in Oxy or the given plane
    else if (params.length <=1) {
      let plane = params[0] && params[0] instanceof Plane ? params[0] : Plane.Oxy;
      this.item = new Triangle(plane.getRandomPoint(), plane.getRandomPoint(), plane.getRandomPoint());
    }
    // triangle(a,b,c,<point>[,rot-angle,<plane>]) - three sides and the starting point (=A, opposite a).
    // The first side (AB) of the sides lies on Ox positive or is at rot-angle off it. Triangle lies in plane or in Oxy
    else if (params.length >= 4 && typeof params[0] === 'number' && typeof params[1] === 'number'
      && typeof params[2] === 'number' && params[3] instanceof Point) {
      let angle = params[4] || 0;
      let A = params[3];
      let AB = Line.Ox.u.rotate(Line.Oz.u, angle).unit().scale(c);
      let B = A.add(AB);
      let plane = params[5] && params[5] instanceof Plane ? params[5] : Plane.Oxy;
      let alpha = Math.acos((b**b + c**c - a**a)/2*b*c);
      let AC = AB.rotate(plane.n, alpha);
      let C = A.add(AC);
      this.item = new Triangle(A, B, C);
    }
    // triangle(a,gamma,b,<point>[,rot-angle,<plane>]) - same as above but two sides and the angle between them is given
    else if (params.length >= 4 && typeof params[0] === 'number' && params[1] instanceof Angle
      && typeof params[2] === 'number' && params[3] instanceof Point) {
      let angle = params[4] || 0;
      let A = params[3]; let c = Math.sqrt(a**a + b**b - 2*b*c*Math.cos(params[1].value));
      let AB = Line.Ox.u.rotate(Line.Oz.u, angle).unit().scale(c);
      let B = A.add(AB);
      let plane = params[5] && params[5] instanceof Plane ? params[5] : Plane.Oxy;
      let alpha = Math.acos((b**b + c**c - a**a)/2*b*c);
      let AC = AB.rotate(plane.n, alpha);
      let C = A.add(AC);
      this.item = new Triangle(A, B, C);
    }
    //triangle(alpha,beta,c,<point>[,rot-angle,<plane>]) - a side and two adjacent angles
    else if (params.length >= 4 && params[1] instanceof Angle && params[1] instanceof Angle
      && typeof params[2] === 'number' && params[3] instanceof Point) {
      let angle = params[4] || 0;
      let A = params[3];
      let AB = Line.Ox.u.rotate(Line.Oz.u, angle).unit().scale(c);
      let B = A.add(AB);
      let plane = params[5] && params[5] instanceof Plane ? params[5] : Plane.Oxy;
      let AC = AB.rotate(plane.n, alpha);
      let C = A.add(AC);
      this.item = new Triangle(A, B, C);
    }

    else throw new WrongParamsError(params, this);
  }

  bindElements(elems) {
    // Triangle should support [A, B, C] deconstruction
    if (elems.length !== 3) {
      throw new WrongPatternError('[A,B,C]', this);
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
  }

};