import _ from 'lodash';

import { globalScene } from '../scene/scene.js';
import { Point } from '../scene/items/point.js';
import { Segment } from '../scene/items/segment.js';
import { SyntaxError } from '../errors.js';

export class Command {
  item;
  itemIndex;

  get name() {
    return '';
  }

  requiresPattern() {
    return false;
  }

  execute(params, pattern) {
    console.log(`Executing ${this.name}`);
    if (this.requiresPattern() && !pattern) {
      throw new MissingPatternException(this);
    }
    this.createItem(params);
    this.bind(pattern);
  }

  createItem(params) {
    //construct the geometric object
  }

  bind(pattern) {
    this.itemIndex = globalScene.addItem(this.item, pattern?.name, pattern?.suppress);
    if (pattern.elements?.length > 0) {
      this.bindElements(pattern.elements);
    }
  }

  bindElements(elems) {
    //bind item's elements to storage
  }

};

export function literalConstruct(params) {
  if (params.length === 2) {
    // two points => segment
    if (params.every(param => param instanceof Point)) {
      return new Segment(params[0], params[1]);
    }
    // point and segment => line
    // two lines => plane
  } else if (params.length === 3) {
    // three coords => point
    if (params.every(param => typeof(param) === 'number')) {
      return new Point({
        x: params[0], y: params[1], z: params[2]
      });
    // three points => plane
    } else if (params.every(param => param instanceof Point)) {
      return new Plane({
        pt: params[0], n: new Vector(params[1], params[2])
      });
    }
  } else if (params.length === 4) {
    // ...
  }
  throw new SyntaxError('Wrong literal construct');
}

export function resolveIdentifier(identifier) {
  let propertyChain = identifier.split('.');
  let item = globalScene.getItem(propertyChain.shift());
  if (!item) {
    throw new SyntaxError(`Identifier not resolved: ${identifier}`);
  }
  if (propertyChain.length > 0) {
    item = _.get(item, propertyChain.join('.'));
  }
  return item;
}

export function convertAngle(angleToken) {
  const value = parseInt(angleToken.substr(2));
  if (angleToken.startsWith('d:')) {
    return value;
  } else if (angleToken.startsWith('r:')) {
    // convert radians to degrees
    return value / Math.PI * 180;
  } else {
    // convert gradians to degrees
    return value * 10 / 9;
  }
}