import { gicsLexer, gicsParser } from './input/grammar.js';
import * as fs from 'fs';

const inputText = fs.readFileSync('gics.txt');
const lexingResult = gicsLexer.tokenize(inputText);
gicsParser.input = lexingResult.tokens;
gicsParser.PROGRAM();