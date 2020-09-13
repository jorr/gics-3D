import { gicsLexer, gicsParser } from './input/grammar.js';
import { globalScene } from './scene/scene.js';
import { SvgOutput } from './output/options/svg.js';
import { inspect } from 'util';

import fs from 'fs';

//TODO: temporary, switch to API endpoint
const inputText = fs.readFileSync('app/gics.txt', 'utf-8');
const lexingResult = gicsLexer.tokenize(inputText);
gicsParser.input = lexingResult.tokens;

//TODO: Change everything to proper logging, add verbose option
console.log('-----PARSING-------');
gicsParser.PROGRAM();
if (gicsParser.errors.length > 0) {
  console.log(inspect(gicsParser.errors, false, null));
}

console.log('-----DRAWING SCENE--------');
let svgOutput = new SvgOutput('./test.svg');
globalScene.draw(svgOutput);
