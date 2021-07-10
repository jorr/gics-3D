//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand } from '../command.js';
import { MissingPatternError } from '../../errors.js';
import { Point } from '../../scene/items/point.js';
import { Cube } from '../../scene/items/cube.js';
import { Vector } from '../../scene/vectors.js';
import { Square } from '../../scene/items/regularquad.js';
import { globalScene } from '../../scene/scene.js';

export default class CubeCommand extends CreationCommand {

  get name() {
    return 'cube';
  }

  requiresPattern() {
    return true;
  }

  fromCentreAndParallelToAxi(cen, len) {
    //if the cube is parallel to the axi then the vector from A to CEN is radius times the unit vector
    len = len ?? Cube.DEFAULT_SIDE;
    let A = cen.add(new Vector(-len/2,-len/2,-len/2));
    let B = cen.add(new Vector(len/2,-len/2,-len/2));
    let C = cen.add(new Vector(len/2,-len/2,len/2));
    return new Cube(new Square(A,B,C), A.vectorTo(B).cross(B.vectorTo(C)).unit().scale(len));
  }

  createItem(params) {
    // cube(cen,len)
    if (params.length === 2 && params[0] instanceof Point && typeof params[1] === 'number') {
      this.item = this.fromCentreAndParallelToAxi(params[0], params[1]);
    }
    // cube(len)
    else if (params.length === 0 || params.length === 1 && typeof params[0] === 'number') {
      this.item = this.fromCentreAndParallelToAxi(new Point(0,0,0), params[0]);
    } // cube(square,'-')
    else if (params.length >= 1 && params[0] instanceof Square) {// && params[1] instanceof Vector) {
      let sign = params[1] === '-' ? -1 : 1;
      let direction = params[0].plane.n.unit().scale(sign*params[0].side);
      this.item = new Cube(params[0], direction);
    }
    else throw new WrongParamsError(params, this);
  }

  bindElements(elems) {
    // Cube should support [base,segment] deconstruction
    if (elems.length !== 2) {
      throw new WrongPatternError('[base,segment]', this);
    }
    globalScene.addBinding(this.item.base, elems[0].name, elems[0].suppress);
    globalScene.addBinding(this.item.direction, elems[1].name, elems[1].suppress);
  }

};