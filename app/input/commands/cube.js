//import storage
//import scene manipulation
//import drawing for side-effects

import { Command } from '../command.js';
import { globalScene } from '../../scene/scene.js';
import { Cube } from '../../scene/items/cube.js';
import { MissingPatternError } from '../../errors.js';

export default class CubeCommand extends Command {

  get name() {
    return 'cube';
  }

  requiresPattern() {
    return true;
  }

  createItem(params) {
    //TODO: this.item = new Cube(params);
  }

};