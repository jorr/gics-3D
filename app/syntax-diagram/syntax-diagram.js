"use strict"

/**
 * A template for generating syntax diagrams html file.
 * See: https://github.com/chevrotain/chevrotain/tree/master/diagrams for more details
 *
 * usage:
 * - npm install in the parent directory (parser) to install dependencies
 * - Run this in file in node.js (node gen_diagrams.js)
 * - open the "generated_diagrams.html" that will be created in this folder using
 *   your favorite browser.
 */
import path from 'path';
import fs from 'fs';
import chevrotain from 'chevrotain';
import { gicsParser } from '../input/grammar.js';

// extract the serialized grammar.
const serializedGrammar = gicsParser.getSerializedGastProductions();

// create the HTML Text
const htmlText = chevrotain.createSyntaxDiagramsCode(serializedGrammar);

// Write the HTML file to disk
fs.writeFileSync('./syntax-diagram.html', htmlText);
