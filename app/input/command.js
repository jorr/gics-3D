import _ from 'lodash';
import log from 'loglevel';
import { globalScene } from '../scene/scene.js';
import { Point } from '../scene/items/point.js';
import { Segment } from '../scene/items/segment.js';
import { SyntaxError, MethodNotImplemented, WrongPatternError, MissingPatternError } from '../errors.js';

export class Command {
  item;
  itemIndex;

  get name() {
    throw new MethodNotImplemented('name', this);
  }

  requiresPattern() {
    return false;
  }

  execute(params, pattern) {
    log.info(`Executing command: ${this.name}`);
    if (this.requiresPattern() && !pattern) {
      throw new MissingPatternError(this);
    }
  }
}

export class CreationCommand extends Command {

  execute(params, pattern) {
    super.execute(params, pattern);
    this.createItem(params);
    if (pattern) this.bind(pattern);
    return this.item;
  }

  createItem(params) {
    //construct the geometric object
    throw new MethodNotImplemented('createItem', this);
  }

  bind(pattern) {
    this.itemIndex = globalScene.addItem(this.item, pattern?.name, pattern?.suppress);
    if (pattern?.elements?.length > 0) {
      this.bindElements(pattern.elements);
    }
  }

  bindElements(elems) {
    //bind item's elements to storage
    throw new WrongPatternError(this, 'no pattern expected');
  }
}

//TODO: can we delegate these to the command classes?
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
      return new Point(params[0], params[1], params[2]);
    }
    // three points => plane
    // [cen, rad, plane] => circle
  } else if (params.length === 4) {
    // ...
  }
  throw new SyntaxError('Wrong literal construct');
}

export function resolveIdentifier(identifier) {
  log.debug('Resolving identifier: ', identifier)
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

export class Angle {
  value;

  constructor(value) { this.value = value; }
}

export function convertAngle(angleToken) {
  const value = parseInt(angleToken.substr(2));
  if (angleToken.startsWith('d:')) {
    return new Angle(value);
  } else if (angleToken.startsWith('r:')) {
    // convert radians to degrees
    return new Angle(value / Math.PI * 180);
  } else {
    // convert gradians to degrees
    return new Angle(value * 10 / 9);
  }
}