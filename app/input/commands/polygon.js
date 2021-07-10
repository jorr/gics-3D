//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand, Angle } from '../command.js';
import { Segment } from '../../scene/items/segment.js';
import { Point } from '../../scene/items/point.js';
import { Plane } from '../../scene/items/plane.js';
import { RegularPolygon } from '../../scene/items/regularpolygon.js';
import { Square } from '../../scene/items/regularquad.js';
import { Triangle } from '../../scene/items/triangle.js';
import { sortVertices, angle } from '../../scene/util.js';
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
      let plane = params[3] instanceof Plane ? params[3] : new Plane(params[0], Plane.Oxy.parallelThrough(params[0]).n);
      let vertices = [], radius, n = params[1];
      vertices[0] = plane.getRandomPoint();
      radius = params[0].vectorTo(vertices[0]);
      for (let i = 1; i < n; i++) {
        radius = radius.rotate(plane.n, 2*Math.PI/n);
        vertices[i] = params[0].add(radius);
      }
      vertices = sortVertices(vertices, plane);
      if (n===3)
        this.item = new Triangle(...vertices);
      else if (n===4)
        this.item = new Square(...vertices);
      else
        this.item = new RegularPolygon(vertices);
    }
    // polygon(<segment>,n[,<plane>]) - a side on the segment and n sides
    else if (params.length >=2 && params[0] instanceof Segment && typeof params[1] === 'number') {
      if (params[2] instanceof Plane &&
          (params[0].asVector().isCollinearWith(params[2].n)
          || !params[2].hasPoint(params[0].p1) || !params[2].hasPoint(params[0].p2))) {
        throw new NotFeasibleError(params, this.constructor.name);
      }
      let plane = params[2] instanceof Plane ? params[2] : new Plane(params[0].p1, params[0].asVector().perpendicular());
      let vertices = [params[0].p1, params[0].p2], side = params[0].asVector(), n = params[1];
      for (let i = 2; i < n; i++) {
        side = side.rotate(plane.n, 2*Math.PI/n);
        vertices.push(vertices[vertices.length-1].add(side));
      }
      vertices = sortVertices(vertices, plane);
      if (n===3)
        this.item = new Triangle(...vertices);
      else if (n===4)
        this.item = new Square(...vertices);
      else
        this.item = new RegularPolygon(vertices);
    }
    //polygon(n,[<plane>]) - a random polygon with n sides
    else if (params.length === 1 || params.length === 2 && params[1] instanceof Plane) {
      let plane = params[1] || Plane.Oxy, n = params[0];
      let side = plane.getCoplanarVector().unit().scale(100+Math.random()*100);
      let vertices = [plane.getRandomPoint()];
      for (let i = 1; i < n; i++) {
        vertices.push(vertices[vertices.length-1].add(side));
        // let test = side.rotate(plane.n, 2*Math.PI/n);
        // log.debug(angle(side, test) / Math.PI * 180);
        side = side.rotate(plane.n, 2*Math.PI/n);
      }
      vertices = sortVertices(vertices, plane);
      if (n===3)
        this.item = new Triangle(...vertices);
      else if (n===4)
        this.item = new Square(...vertices);
      else
        this.item = new RegularPolygon(vertices);
    }

    else throw new WrongParamsError(params, this);
  }

  bindElements(elems) {
    // Polygon should support [A, B, C,...] deconstruction
    if (elems.length !== this.item.vertices.length) {
      throw new WrongPatternError('[<number of vertices>]', this);
    }
    for (let i = 0, letter = 'A'.charCodeAt(0); i < elems.length; i++) {
      globalScene.bindElement(this.item[String.fromCharCode(letter)], elems[i].name, elems[i].suppress);
      letter++;
    }
  }

};