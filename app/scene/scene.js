import _ from 'lodash';
import { Vector } from './item.js';
import { CabinetProjection } from './projections.js';

export class Scene{
  // switch to smarter storage
  items = {};
  anonIndex = 0;
  screen = {
    w: 1000,
    h: 1000,
  };
  volume = {
    w: 2000,
    h: 2000,
    d: 2000,
  };
  camera = new Vector(0,0,-1000);
  projection = new CabinetProjection();

  addItem(item, name) {
    //TODO: check if suppressing drawing makes sense in 3D, implement as a flag

    console.log(`Adding ${item.constructor.name} to scene`);
    if (!name) {
      name = `${anonIndex++}-obj`;
    }
    //TODO: rebinding should be possible, check!
    if (!!this.items.name) throw new Error('Repeating name binding attempt');

    this.items[name] = item;
    return name;
  }

  removeItem(name) {
    delete this.items[name];
  }

  getItem(name) {
    return this.items[name];
  }

  set screen({w,h}) {
    this.screen = { w, h };
  }

  set viewPoint(z) {
    this.camera.z = z;
  }

  set projection(projection) {
    this.projection = projection;
  }

  draw(outputOption) {
    let projectedElements = _(this.items).
      mapValues((item, name) => item.project(this.camera, this.screen, this.volume, this.projection, name)).
      values().
      flatten().
      value();
    outputOption.render(projectedElements, this.screen);
  }

};

export const globalScene = new Scene();