//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand } from '../command.js';
import { Segment } from '../../scene/items/segment.js';
import { Point } from '../../scene/items/point.js';
import { Line } from '../../scene/items/line.js';
import { Polygon } from '../../scene/items/polygon.js';
import { globalScene } from '../../scene/scene.js';
import { angle } from '../../scene/util.js';
import { WrongParamsError, WrongPatternError, NotFeasibleError } from '../../errors.js';

import log from 'loglevel';
import _ from 'lodash';

export default class BisectorCommand extends CreationCommand {

  get name() {
    return 'bisector';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {
    //bisector(<line|segment>, <line|segment>[, <"a"|"o">])
    if (params.length >= 2 && (params[0] instanceof Line || params[0] instanceof Segment)
      && (params[1] instanceof Line || params[1] instanceof Segment)) {
      if (params.length > 2 && typeof params[2] !== 'string') throw new WrongParamsError(params, this);
      let acute = params.length === 2 || params[2] === 'a'; // acute is default
      let v1 = params[0] instanceof Line ? params[0].u : params[0].asVector(),
          v2 = params[1] instanceof Line ? params[1].u : params[1].asVector();
      let ang = angle(v1,v2), axis = v1.cross(v2);
      if (Math.abs(ang) <= Math.PI/2 && acute || Math.abs(ang) > Math.PI/2 && !acute)
        this.item = new Line(params[0].intersect(params[1]), v1.rotate(axis, ang/2));
       else
        this.item = new Line(params[0].intersect(params[1]), v1.scale(-1).rotate(axis, (Math.PI-ang)/2));
    }
    //bisector(<triangle|quad|polygon>,<vertex>)
    else if (params.length == 2 && params[0] instanceof Polygon && (typeof params[1] === 'string' || params[1] instanceof Point)) {
      let vertex = params[1];
      if (typeof params[1] === 'string') {
        vertex = params[0][params[1]]; //if the vertex is qualified as a string, get the real point
      }

      let vertexIndex = _.findIndex(params[0].vertices, vertex);
      let v1 = vertex.vectorTo(params[0].vertices[(vertexIndex-1+params[0].vertices.length)%params[0].vertices.length]),
          v2 = vertex.vectorTo(params[0].vertices[(vertexIndex+1)%params[0].vertices.length]);

      let ang = angle(v1,v2), axis = v1.cross(v2),
          bisector = new Line(vertex, v1.rotate(axis, ang/2));

      this.item = new Segment(vertex, _.find(params[0].edges.map(e => e.intersect(bisector)),v => v && !v.equals(vertex))); //get the only inersection with an edge
    }
    //TODO: bisector(<linear angle>)
    //TODO: bisector(<plane>,<plane>)
    else throw new WrongParamsError(params, this);
  }

  bindElements(elems) {
    // Bisector should support [point] deconstruction
    if (elems.length !== 1) {
      throw new WrongPatternError('[point]', this);
    }
    if (this.item instanceof Segment)
      globalScene.bindElement(this.item.p2, elems[0].name, elems[0].suppress);
    else
      globalScene.bindElement(this.item.pt, elems[0].name, elems[0].suppress);
  }
};