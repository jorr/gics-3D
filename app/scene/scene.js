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

  anonIndex = 0;
  //the origin is assumed to be at (w/2, h/2, 0), the volume extends towards Oz+
  volume = {
    w: 1000,
    h: 1000,
    d: 1000,
  };
  //the camera is only used for perspective at this point
  camera = new Point(100,100,-300);
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
      this.draw.push(Object.assign(item, {style: this.defaultStyle}));
      if (this.autolabel) {
        log.debug(`Autolabeling with name: ${name}`);
        this.addLabel(new Label(item.labelPosition, name));
      }
    } else {
      log.info(`[it will not be drawn]`);
    }
    return name;
  }

  // addItem(item, name, suppress) {
  //   if (!name) {
  //     name = `obj-${this.anonIndex++}`;
  //     log.info(`Adding an anonymous ${item.constructor.name} to scene`);
  //   } else {
  //     log.info(`Adding ${item.constructor.name} with name '${name}' to scene`);
  //   }

  //   item.style = this.defaultStyle;
  //   this.items[name] = item;
  //   return name;
  // }

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
      if (this.autolabel) {
        log.debug(`Autolabeling with name: ${name}`);
        this.addLabel(new Label(element.labelPosition, name));
      }
    } else {
      log.info(`[it will not be drawn]`);
    }
  }

  addLabel(label) {
    this.draw.push(label);
  }

  // addBinding(name, item, propertyChain, suppress) {
  //   if (propertyChain) {
  //     log.info(`binding ${propertyChain} on a ${item.constructor.name} with name ${name}`);
  //     this.bindings[name] = (() => _.get(item, propertyChain));
  //     if (!suppress) item.styledElements[propertyChain] = defaultStyle;
  //     else item.suppressedElements.push(_.get(item, propertyChain));
  //   }
  //   else {
  //     log.info(`Binding expression result ${item} with name ${name}`);
  //     this.bindings[name] = item; //_.get would not work on expressions binding
  //   }
  // }

  setStyle(style) {
    this.defaultStyle = style;
  }

  getItem(name) {
    let item = this.names[name];
    if (item == undefined) throw new NameUndefinedError(name);
    else return item;
  }

  // getItem(name) {
  //   if (!this.items[name]) {
  //     if (!this.bindings[name])
  //       throw new NameUndefinedError(name);
  //     else
  //       return this.bindings[name]();
  //   }
  //   return this.items[name];
  // }

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
      map(item => item.project(projectionData, this.projection)).
      flattenDeep().
      value();

    let infoItems = [
      Point.Origin.project(projectionData, this.projection, 'green'),
      new Label(Point.Origin, "O"),
      Line.Ox.project(projectionData, this.projection, '', 'green'),
      Line.Oy.project(projectionData, this.projection, '', 'green'),
      Line.Oz.project(projectionData, this.projection, '', 'green'),
    ];

    outputOption.render(_.concat(infoItems, projectedElements), this.projection.screenSize(this.camera, this.volume));
  }

};

export const globalScene = new Scene();