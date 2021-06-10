import _ from 'lodash';
import log from 'loglevel';
import { Point } from './items/point.js';
import { Plane } from './items/plane.js';
import { Vector } from './vectors.js';
import { CabinetProjection, PerspectiveProjection } from './projections.js';

export class Scene{
  //TODO: maybe switch to smarter storage
  items = {};
  bindings = {};
  anonIndex = 0;
  //the origin is assumed to be at (w/2, h/2, 0), the volume extends towards Oz+
  volume = {
    w: 1000,
    h: 1000,
    d: 1000,
  };
  camera = new Point(0,100,-300);
  // projection = new CabinetProjection();
  projection = new PerspectiveProjection();

  addItem(item, name) {
    //TODO: check if suppressing drawing makes sense in 3D, implement as a flag

    if (!name) {
      name = `obj-${this.anonIndex++}`;
      log.info(`Adding an anonymous ${item.constructor.name} to scene`);
    } else {
      log.info(`Adding ${item.constructor.name} with name '${name}' to scene`);
    }

    //TODO: rebinding should be possible, check!
    if (!!this.items[name]) throw new Error('Repeating name binding attempt');

    this.items[name] = item;
    return name;
  }

  addBinding(item, propertyChain, name) {
    log.info(`Binding ${propertyChain} on a ${item.constructor.name} with name ${name}`);
    this.bindings[name] = (() => _.get(item, propertyChain));
  }

  removeItem(name) {
    delete this.items[name];
  }

  getItem(name) {
    if (!this.items[name]) {
      return this.bindings[name]();
    }
    return this.items[name];
  }

  getRandomPointInGoodView() {
    return new Point(
      Math.random() * this.volume.w/2 - this.volume.w/4,
      Math.random() * this.volume.h/2 - this.volume.h/4,
      Math.random() * this.volume.d/4
    );
  }

  set viewPoint(z) {
    this.camera.z = z;
  }

  set projection(projection) {
    this.projection = projection;
  }

  draw(outputOption) {

    //TODO: for debugging purposes
    this.items['origin'] = new Point(0,0,0);

    let projectedElements = _(this.items).
    //TODO: label should be done the GICS way going forward
      mapValues((item, name) => item.project(
        { camera: this.camera, volume: this.volume },
      this.projection, name.startsWith('obj-') ? '' : name)).
      values().
      flatten().
      value();
    // outputOption.render(projectedElements, this.projection.screenSize(this.camera, this.volume));

    let bindings = _(this.bindings).
    //TODO: label should be done the GICS way going forward
      mapValues((item, name) => item().project(
        { camera: this.camera, volume: this.volume },
      this.projection, name)).
      values().
      flatten().
      value();

    outputOption.render(_.concat(projectedElements, bindings), this.projection.screenSize(this.camera, this.volume));
  }

};

export const globalScene = new Scene();