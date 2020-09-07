//import storage
//import scene manipulation
//import drawing for side-effects

import { Command } from '../command.js';
import { globalScene } from '../../scene/scene.js';
import { Plane } from '../../scene/items/plane.js';
import { MissingPatternException } from '../exceptions.js';

export default class LineCommand extends Command {

  get name() {
    return 'line';
  }

  check(params, pattern) {
    //throw if incorrect params supplied or pattern is required but not supplied
    if (!pattern) {
      throw new MissingPatternException(this);
    }
  }

  createItem(params) {
    this.item = new Plane(params);
  }

  bind(pattern) {
    //bind command results to storage identifiers
  }

  draw() {
    //draw unless suppressed
  }

};