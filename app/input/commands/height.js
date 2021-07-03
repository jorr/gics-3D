//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand } from '../command.js';
import { Segment } from '../../scene/items/segment.js';
import { Point } from '../../scene/items/point.js';
import { Quad } from '../../scene/items/quad.js';
import { Triangle } from '../../scene/items/triangle.js';
import { Pyramid } from '../../scene/items/pyramid.js';
import { Prism } from '../../scene/items/prism.js';
import { Cone } from '../../scene/items/cone.js';
import { globalScene } from '../../scene/scene.js';
import { WrongParamsError, WrongPatternError, NotFeasibleError } from '../../errors.js';

import log from 'loglevel';

export default class HeightCommand extends CreationCommand {

  get name() {
    return 'height';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {
    //height(<pyramid>|<cone>)
    if (params.length == 1 && (params[0] instanceof Pyramid || params[0] instanceof Cone)) {
      this.item = new Segment(params[0].apex, params[0].apex.projectionOn(params[0].base.plane));
    }
    //height(<prism>,<vertex>)
    else if (params.length == 2 && params[0] instanceof Prism && (typeof params[1] === 'string' || params[1] instanceof Point)) {
      let vertex = params[1];
      if (typeof params[1] === 'string') {
        //TODO: this will probable fail, it should be from the base
        vertex = params[0][params[1]]; //if the vertex is qualified as a string, get the real point
      }
      if (params[0].base1.plane.hasPoint(vertex)) {
        this.item = new Segment(vertex, vertex.projectionOn(params[0].base2.plane));
      } else {
        this.item = new Segment(vertex, vertex.projectionOn(params[0].base1.plane));
      }
    }
    //height(<triangle>,<vertex>)
    else if (params.length == 2 && params[0] instanceof Triangle && (typeof params[1] === 'string' || params[1] instanceof Point)) {
      let vertex = params[1];
      if (typeof params[1] === 'string') {
        vertex = params[0][params[1]]; //if the vertex is qualified as a string, get the real point
      }
      let side = new Segment(...params[0].vertices.filter(p => !p.equals(vertex)));
      this.item = new Segment(vertex, vertex.projectionOn(side));
    }
    //height(<quad>,<vertex>,<side>)
    else if (params.length === 3 && params[0] instanceof Quad &&
      (typeof params[1] === 'string' || params[1] instanceof Point) &&
      (typeof params[2] === 'string' || params[2] instanceof Segment)) {
      let vertex = params[1];
      if (typeof params[1] === 'string') {
        vertex = params[0][params[1]]; //if the vertex is qualified as a string, get the real point
      }
      let side = params[2];
      if (typeof params[2] === 'string') {
        side = params[0][params[2]]; //if the side is qualified as a string, get the real segment
      }

      this.item = new Segment(vertex, vertex.projectionOn(side));
    }
    else throw new WrongParamsError(params, this);
  }

  bindElements(elems) {
    // Height should support [point] deconstruction
    if (elems.length !== 1) {
      throw new WrongPatternError('[point]', this);
    }
    if (elems[0].name) {
      globalScene.addBinding(this.item, 'p2', elems[0].name);
    }
  }

};