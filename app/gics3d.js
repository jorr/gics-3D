import { globalScene } from './scene/scene.js';
import { SvgOutput } from './output/options/svg.js';
import { inspect } from 'util';

import log from 'loglevel';
import prefix from 'loglevel-plugin-prefix';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

/****************** COMMANDS ******************/

let commands = {};
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const dir = `${__dirname}/input/commands`;
const files = fs.readdirSync(dir);

for (let file of files) {
  const { default: command } = await import(`./input/commands/${file}`);
  const c = new command;
  commands[c.name] = c;
}

const { GicsLexer, GicsParser } = await import('./input/grammar.js');
const gicsLexer = new GicsLexer(commands), gicsParser = new GicsParser(commands, gicsLexer.tokens);

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
globalScene.drawScene(svgOutput);
