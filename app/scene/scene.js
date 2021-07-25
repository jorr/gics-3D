import { Point } from './items/point.js';
import { Line } from './items/line.js';
import { Label } from './items/label.js';
import { Plane } from './items/plane.js';
import { Vector } from './vectors.js';
import { CabinetProjection, PerspectiveProjection } from './projections.js';
import { NameUndefinedError } from '../errors.js';

import _ from 'lodash';
import log from 'loglevel';

export class Style {
  stroke = 1.0;
  linetype = 'solid';
  color = 'black';
}

export class Scene{
  items = [];
  names = {};
  draw = [];

  //the origin is assumed to be at (w/2, h/2, 0), the volume extends towards Oz+
  volume = {
    w: 1000,
    h: 1000,
    d: 1000,
  };
  //the camera is only used for perspective at this point
  camera = new Point(100,100,-1000);
  projection = new CabinetProjection(); //projection = new PerspectiveProjection();
  defaultStyle = new Style();
  autolabel = false;

  addItem(item, name, suppress) {
    this.items.push(item);
    if (name) {
      this.names[name] = item;
      log.info(`adding ${item.constructor.name} with name '${name}' to scene`);
    } else {
      log.info(`adding an anonymous ${item.constructor.name} to scene`);
    }
    if (!suppress) {
      this.draw.push(item);
      if (this.autolabel && name) {
        log.debug(`Autolabeling with name: ${name}`);
        this.addMarking(new Label(item.labelPosition, name));
      }
    } else {
      log.info(`[it will not be drawn]`);
    }
    return name;
  }

  bindResult(value, name) {
    this.names[name] = value;
  }

  bindElement(element, name, suppress) {
    log.info(`binding ${element.constructor.name}`);
    if (name) {
      this.names[name] = element;
      log.info(`[to name ${name}]`);
    }
    if (!suppress) {
      this.draw.push(element);
      if (this.autolabel && name) {
        log.debug(`Autolabeling with name: ${name}`);
        this.addMarking(new Label(element.labelPosition, name));
      }
    } else {
      log.info(`[it will not be drawn]`);
    }
  }

  //used for labels, marks, etc, that are not refered to by name and dont bind elements
  addMarking(marking) {
    this.draw.push(marking);
  }

  getItem(name) {
    let item = this.names[name];
    if (item == undefined) throw new NameUndefinedError(name);
    else return item;
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

  drawScene(outputOption) {
    let projectionData = { camera: this.camera, volume: this.volume };

    let projectedElements = _(this.draw).
      map(item => {
        let projected = item.project(projectionData, this.projection);
        if (Array.isArray(projected)) {
          return projected.map(p => Object.assign(p, {style: p.style || item.style || this.defaultStyle}));
        } else {
          return Object.assign(projected, {style: item.style || this.defaultStyle});
        }
      }).
      flattenDeep().
      value();

    let infoStyle = {stroke: 1, linetype: 'dotted', color: 'rgba(64,128,64,0.5)'};
    let infoItems = [
      Point.Origin, new Label(Point.Origin, 'O', 'SW', 25),
      Line.Ox, Line.Oy, Line.Oz
    ].map(i => Object.assign(i.project(projectionData, this.projection), {style: infoStyle}));

    outputOption.render(_.concat(infoItems, projectedElements), this.projection.screenSize(this.camera, this.volume));
  }

};

export const globalScene = new Scene();