// COMMAND SYNTAX: 

import { Command } from '../command.js';
import { WrongParamsError } from '../../errors.js';
import { globalScene } from '../../scene/scene.js';
import { CabinetProjection, PerspectiveProjection } from '../../scene/projections.js';

export default class ProjectonModeCommand extends Command {

  get name() {
    return 'projectionmode';
  }

  requiresPattern() {
    return false;
  }

  execute(params, pattern) {
    super.execute(params, pattern);
    if (params.length !== 1 || typeof params[0] !== 'string') {
      throw new WrongParamsError(params, this);
    }

    switch (params[0]) {
      case 'cabinet': globalScene.projection = new CabinetProjection(); break;
      case 'perspective': globalScene.projection = new PerspectiveProjection(); break;
    }
  }

};