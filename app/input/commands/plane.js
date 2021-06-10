//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand } from '../command.js';
import { globalScene } from '../../scene/scene.js';
import { Plane } from '../../scene/items/plane.js';
import { Point } from '../../scene/items/point.js';
import { MissingPatternError, WrongParamsError } from '../../errors.js';

export default class PlaneCommand extends CreationCommand {

  get name() {
    return 'plane';
  }

  requiresPattern() {
    return false;
  }

  createItem(params) {
    let n, pt;

    //plane(<point>, <segment>) - a plane through the point with the segment as normal vector
    if (params[0] instanceof Point && params[1] instanceof Line) {
      pt = params[0];
      n = new Vector(params[1].p1, params[2].p2);
      this.item = new Plane(pt, n);
    }
    //plane(Oxy|Oxz|Oyz) - one of the axial planes
    else if (typeof params[0] === "string") {
      if (!Plane[params[0]]) throw new WrongParamsError(params, this);
      else this.item = Plane[params[0]];
    }
    else throw new WrongParamsError(params, this);
  }

  // bindElements(elems) {
  //   // plane should support [p1,p2,p3] deconstruction
  //   if (elems.length !== 3) {
  //     throw new WrongPatternError('[p1,p2,p3]', this);
  //   }
  //   if (elems[0].name) {
  //     globalScene.addItem(this.item.p1, elems[0].name);
  //   }
  //   if (elems[1].name) {
  //     globalScene.addItem(this.item.p2, elems[1].name);
  //   }
  //   if (elems[2].name) {
  //     globalScene.addItem(this.item.p3, elems[2].name);
  //   }
  // }

};