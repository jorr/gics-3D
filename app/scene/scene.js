import _ from 'lodash';
import { Item, Vector } from './item.js';

export class Scene{

  // switch to smarter storage
  items = {};
  anonIndex = 0;
  limts = {
    w: 1000,
    h: 1000,
  };
  camera = new Vector(0,0,-100);

  addItem(item, name) {
    //TODO: check if suppressing drawing makes sense in 3D


    console.log(`Adding ${item.constructor.name}`);
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

  setLimits(w,h) {
    this.limits = { w, h };
  }

  setViewPoint(z) {
    this.camera.z = z;
  }

};

export const globalScene = new Scene();