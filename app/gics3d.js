import { gicsLexer, gicsParser } from './input/grammar.js';
import { globalScene } from './scene/scene.js';
import { SvgOutput } from './output/options/svg.js';
import { inspect } from 'util';

import log from 'loglevel';
import prefix from 'loglevel-plugin-prefix';
import chalk from 'chalk';
import fs from 'fs';

/***** SETUP LOGGING ******/

log.setDefaultLevel('debug');

const colors = {
  TRACE: chalk.magenta,
  DEBUG: chalk.cyan,
  INFO: chalk.green,
  WARN: chalk.yellow,
  ERROR: chalk.red,
};

prefix.reg(log);
log.enableAll();

prefix.apply(log, {
  format(level, name, timestamp) {
    return `${colors[level.toUpperCase()](level)}`;
  },
});

/***** LAUNCH GICS ******/


//TODO: temporary, switch to API endpoint
const inputText = fs.readFileSync('app/gics.txt', 'utf-8');
const lexingResult = gicsLexer.tokenize(inputText);
gicsParser.input = lexingResult.tokens;

//TODO: add verbose option
log.info('-----PARSING-----');
gicsParser.PROGRAM();
if (gicsParser.errors.length > 0) {
  log.error(inspect(gicsParser.errors, false, null));
}

log.info('-----DRAWING SCENE-----');
const svgOutput = new SvgOutput('./test.svg');
globalScene.draw(svgOutput);
