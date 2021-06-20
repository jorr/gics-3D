import _ from 'lodash';
import log from 'loglevel';
import { Point } from './items/point.js';
import { Line } from './items/line.js';
import { Plane } from './items/plane.js';
import { Vector } from './vectors.js';
import { CabinetProjection, PerspectiveProjection } from './projections.js';
import { NameUndefinedError } from '../errors.js';

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
  camera = new Point(100,100,-300);
  projection = new CabinetProjection();
  // projection = new PerspectiveProjection();

  addItem(item, name, suppress) {
    if (!name) {
      name = `obj-${this.anonIndex++}`;
      log.info(`Adding an anonymous ${item.constructor.name} to scene`);
    } else {
      log.info(`Adding ${item.constructor.name} with name '${name}' to scene`);
    }

    //TODO: rebinding should be possible, check!
    //if (!!this.items[name]) throw new Error('Repeating name binding attempt');

    this.items[name] = item;
    return name;
  }

  addBinding(item, propertyChain, name) {
    log.info(`Binding ${propertyChain} on a ${item.constructor.name} with name ${name}`);
    if (propertyChain)
      this.bindings[name] = (() => _.get(item, propertyChain));
    else
      this.bindings[name] = item; //_.get would not work on expressions binding
  }

  removeItem(name) {
    delete this.items[name];
  }

  getItem(name) {
    if (!this.items[name]) {
      if (!this.bindings[name])
        throw new NameUndefinedError(name);
      else
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

  set viewpoint(viewpoint) {
    this.camera = viewpoint;
  }

  set projection(projection) {
    this.projection = projection;
  }

  set volume(volume) {
    this.volume = volume;
  }

  draw(outputOption) {

    let projectionData = { camera: this.camera, volume: this.volume };

    let projectedElements = _(this.items).pickBy(i => !i.suppressed).
    //TODO: label should be done the GICS way going forward
      mapValues((item, name) => item.project(
        projectionData,
        this.projection,
        name.startsWith('obj-') ? '' : name
      )).
      values().
      flattenDeep().
      value();
    // outputOption.render(projectedElements, this.projection.screenSize(this.camera, this.volume));

    let bindings = _(this.bindings).pickBy(i => !i.suppressed).
    //TODO: label should be done the GICS way going forward
      mapValues((item, name) => item().project(
        projectionData,
        this.projection,
        name
      )).
      values().
      flattenDeep().
      value();

    let infoItems = _([
      Point.Origin.project(projectionData, this.projection, 'O', 'green'),
      Line.Ox.project(projectionData, this.projection, '', 'green'),
      Line.Oy.project(projectionData, this.projection, '', 'green'),
      Line.Oz.project(projectionData, this.projection, '', 'green'),
    ]).
    values().
    flattenDeep().
    value();

    outputOption.render(_.concat(infoItems, projectedElements, bindings), this.projection.screenSize(this.camera, this.volume));
  }

};

export const globalScene = new Scene();