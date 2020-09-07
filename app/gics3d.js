import { gicsLexer, gicsParser } from './input/grammar.js';
import * as fs from 'fs';

const inputText = fs.readFileSync('app/gics.txt', 'utf-8');
const lexingResult = gicsLexer.tokenize(inputText);
gicsParser.input = lexingResult.tokens;

console.log('------------');
gicsParser.PROGRAM();