import _ from 'lodash';
import log from 'loglevel';
import { globalScene } from '../scene/scene.js';
import { Point } from '../scene/items/point.js';
import { Plane } from '../scene/items/plane.js';
import { Line } from '../scene/items/line.js';
import { Segment } from '../scene/items/segment.js';
import { Triangle } from '../scene/items/triangle.js';
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

  execute(params, pattern, commands) {
    log.info(`Executing command: ${this.name}`);
    if (this.requiresPattern() && !pattern) {
      throw new MissingPatternError(this);
    }
  }
}

export class CreationCommand extends Command {

  execute(params, pattern, commands) {
    super.execute(params, pattern, commands);
    this.createItem(params);
    if (pattern) this.bind(pattern, commands);
    return this.item;
  }

  createItem(params) {
    //construct the geometric object
    throw new MethodNotImplemented('createItem', this);
  }

  bind(pattern, commands) {
    this.item.suppressed = pattern?.suppress;
    this.itemIndex = globalScene.addItem(this.item, pattern?.name, pattern?.suppress);
    if (pattern?.elements?.length > 0) {
      this.bindElements(pattern.elements, commands);
    }
  }

  bindElements(elems) {
    //bind item's elements to storage
    throw new WrongPatternError('no pattern expected', this);
  }
}

export function literalConstruct(params) {
  if (params.length === 1 && typeof params[0] === 'string') {
    return Plane[params[0]] || Line[params[0]] || Point[params[0]];
  }
  else if (params.length === 2) {
    // two points => segment
    if (params.every(param => param instanceof Point)) {
      return new Segment(...params);
    }
    // point and number => sphere
    else if (params[0] instanceof Point && typeof params[1] === 'number') {
      return new Sphere(...params);
    }
    // point and segment => line
    else if (params[0] instanceof Point && params[1] instanceof Segment) {
      return new Line(params[0], params[1].asVector());
    }
    // two lines or two segments => plane
    else if (params[0] instanceof Line && params[1] instanceof Line || params[0] instanceof Segment && params[1] instanceof Segment) {
      if (params[0].isParallelTo(params[1]))
        throw new WrongParamsError('Lines or segments must not be parallel in a plane constructor');
      //NOTE: we don't care if the lines or segments actually cross, since we only use their direction vectors
      return new Plane(params[0].pt, params[0].asVector().cross(params[1].asVector()));
    } //TODO
    // square and segment => cube
    // rectangle and segment => cuboid
    // polygon and segment => prism
    // polygon and point => pyramid
    // circle and point => cone
    // circle and segment => cylinder
  } else if (params.length === 3) {
    // three coords => point
    if (params.every(param => typeof(param) === 'number')) {
      return new Point(...params);
    }
    // three points => triangle
    else if (params.every(param => param instanceof Point)) {
      return new Triangle(...params);
    }
    // [cen, rad, plane] => circle
    else if (params[0] instanceof Point && params[2] instanceof Plane && typeof params[1] === 'number') {
      return new Circle(...params);
    }
  } else if (params.length === 4) {
    // four points => quad
    if (params.every(param => param instanceof Point)) {
      return new Quad(...params); //Would be nice to construct square, rectangle, etc here but...
    }
    // point, n, radius, plane => regular polygon
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

  //all functions in /scene use radians
  constructor(value) { this.value = value * Math.PI / 180; }
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