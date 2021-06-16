//import storage
//import scene manipulation
//import drawing for side-effects

import { CreationCommand } from '../command.js';
import { globalScene } from '../../scene/scene.js';
import { Circle } from '../../scene/items/circle.js';
import { Point } from '../../scene/items/point.js';
import { Segment } from '../../scene/items/segment.js';
import { Plane } from '../../scene/items/plane.js';
import { Vector } from '../../scene/vectors.js';
import { midpoint, dist, intersect } from '../../scene/util.js';
import { WrongParamsError, WrongPatternError, NotFeasibleError } from '../../errors.js';

import log from 'loglevel';

export default class CircleCommand extends CreationCommand {

  get name() {
    return 'circle';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {
    //circle(<point>,rad,[plane]) - a circle with a centre at the point and the given radius
    if (params.length >= 2 && params[0] instanceof Point && typeof params[1] === 'number') {
      // let cen = params[0], rad = params[1];
      let plane = params[2] || Plane.Oxy; //new Plane(cen, Vector.random());
      // let cenp1 = plane.getCoplanarVector(), cenp2 = intersect(plane, new Plane(cen, cenp1)).u;

      this.item = new Circle(params[0], params[1], plane); //cen.add(cenp1.scale(rad)), cen.add(cenp2.scale(rad)));
    }
    // circle(<point>,<point>,[plane]) - a circle with a centre at the first point and a radius on the segment formed by the two points
    else if (params.length >= 2 && params[0] instanceof Point && params[1] instanceof Point) {
      let cen = params[0], p1 = params[1], cenp1 = cen.vectorTo(p1);
      let plane = params[2] || new Plane(cen, cenp1.perpendicular());
      //let cenp2 = intersect(plane, new Plane(cen, cenp1)).u;

      this.item = new Circle(cen, cenp1.norm, plane); //p1, cen.add(cenp2.scale(dist(cen,p1))));
    }
    // circle(<segment>,[plane]) - a circle with a diameter on the segment
    else if (params.length >=1 && params[0] instanceof Segment) {
      let cen = midpoint(params[0].p1, params[0].p2);
      let p1 = params[0].p1, cenp1 = cen.vectorTo(p1);
      let plane = params[1] instanceof Plane ? params[1] : new Plane(cen, cenp1.perpendicular());
      //let cenp2 = intersect(plane, new Plane(cen, cenp1)).u;

      this.item = new Circle(cen, cenp1.norm, plane); // p1, cen.add(cenp2.scale(dist(cen,p1))));
    }
    // circle([plane]) - a random circle, plane defaults to Oxy
    else if (params.length === 0 || params.length === 1 && params[0] instanceof Plane) {
      let plane = params[0] instanceof Plane ? params[0] : Plane.Oxy;
      let cen = plane.getRandomPoint(), p1;
      do { p1 = plane.getRandomPoint(); } while (cen.equals(p1));
      let cenp1 = cen.vectorTo(p1);
      //let cenp2 = intersect(plane, new Plane(cen, cenp1));
      //let p2 = cen.add(cenp2.u.unit().scale(cenp1.norm));

      this.item = new Circle(cen, cenp1.norm, plane); //p1, p2);
    }
    else throw new WrongParamsError(params, this);
  }

  bindElements(elems) {
    // Circle should support [cen,rad,plane] deconstruction
    if (elems.length !== 3) {
      throw new WrongPatternError('[cen,rad,plane]', this);
    }
    if (elems[0].name) {
      globalScene.addBinding(this.item, 'cen', elems[0].name);
    }
    if (elems[1].name) {
      globalScene.addBinding(this.item, 'rad', elems[1].name);
    }
    if (elems[2].name) {
      globalScene.addBinding(this.item, 'plane', elems[2].name);
    }
  }

};