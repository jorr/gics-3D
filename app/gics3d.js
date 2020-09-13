import { gicsLexer, gicsParser } from './input/grammar.js';
import { globalScene } from './scene/scene.js';
import * as fs from 'fs';
import { inspect } from 'util';

const inputText = fs.readFileSync('app/gics.txt', 'utf-8');
const lexingResult = gicsLexer.tokenize(inputText);
gicsParser.input = lexingResult.tokens;

console.log('-----PARSING gics.txt-------');
gicsParser.PROGRAM();
if (gicsParser.errors.length > 0) {
  console.log(inspect(gicsParser.errors, false, null));
}