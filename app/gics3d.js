import { globalScene } from './scene/scene.js';
import { SvgOutput } from './output/options/svg.js';
import { inspect } from 'util';

import log from 'loglevel';
import prefix from 'loglevel-plugin-prefix';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

import parseArgs from 'minimist';
let args = parseArgs(process.argv);

/****************** COMMANDS ******************/

let commands = {};
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const dir = `${__dirname}/input/commands`;
const files = fs.readdirSync(dir).reverse(); //reverse is needed to assure regex is in no-prefix order

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
prefix.apply(log, {
    format(level, name, timestamp) {
      return `${colors[level.toUpperCase()](level)}`;
    },
  });

log.enableAll();

/***** LAUNCH GICS ******/

export function doGics(inputText) {
  const lexingResult = gicsLexer.tokenize(inputText);
  gicsParser.input = lexingResult.tokens;

  log.info('-----PARSING-----');
  gicsParser.PROGRAM();
  if (gicsParser.errors.length > 0) {
    log.error(inspect(gicsParser.errors, false, null));
  }

  log.info('-----DRAWING SCENE-----');
  const svgOutput = new SvgOutput();
  globalScene.drawScene(svgOutput);
  return svgOutput.flushOutput();
}

if (args.console) {
  const inputText = fs.readFileSync('app/gics.txt', 'utf-8');
  let outputText = doGics(inputText);
  fs.writeFileSync('./gics.svg', outputText, 'utf-8');
}
