import chevrotain from 'chevrotain';
const { createToken, Lexer, EmbeddedActionsParser } = chevrotain;

import * as fs from 'fs';
import * as path from 'path';

/****************** COMMANDS ******************/

let commands = {};
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const dir = `${__dirname}/commands/`;
const files = fs.readdirSync(dir);

for (let file of files) {
  const { default: command } = await import(`./commands/${file}`);
  const c = new command;
  commands[c.name] = c;
}

/****************** LEXER ******************/

const COMMAND = createToken({
  name: 'COMMAND',
  pattern: RegExp(`${Object.keys(commands).join('|')}`,'i'),
  longer_alt: 'IDENTIFIER'
});
const IDENTIFIER = createToken({
  name: 'IDENTIFIER',
  pattern: /[a-zA-z0-9]+(\.[a-zA-z0-9]+)?/
});
const LPAREN = createToken({ name: 'LPAREN', pattern: /\(/ });
const RPAREN = createToken({ name: 'RPAREN', pattern: /\)/ });
const COMMA = createToken({ name: 'COMMA', pattern: /,/ });
const LBRAC = createToken({ name: 'LBRAC', pattern: /\[/ });
const RBRAC = createToken({ name: 'RBRAC', pattern: /\]/ });
const TO = createToken({ name: 'TO', pattern: /->/ });
const SUPPRESS = createToken({ name: 'SUPPRESS', pattern: /-/ });
const ANON = createToken({ name: 'ANON', pattern: /\./ });
const ANGLE = createToken({ name: 'ANGLE', pattern: /(r:|d:|g:)([0-9]+)/ });
const SEPARATOR = createToken({ name: 'SEPARATOR', pattern: /;|\n/ });
const WHITESPACE = createToken({ name: 'WHITESPACE', pattern: /\s+/, group: Lexer.SKIPPED });

const tokens = [
  WHITESPACE, COMMAND, LPAREN, RPAREN, COMMA,
  RBRAC, LBRAC, IDENTIFIER, TO, ANON,
  SUPPRESS, ANGLE, SEPARATOR
];

export const gicsLexer = new Lexer(tokens);

/****************** PARSER ******************/

export class GicsParser extends EmbeddedActionsParser {
  constructor(tokens) {
    super(tokens);
    const $ = this;

    $.RULE('PROGRAM', () => {
      $.MANY(() => {
        $.SUBRULE($.STATEMENT);
        $.CONSUME(SEPARATOR);
      });
    })

    $.RULE('STATEMENT', () => {
      let command, params, pattern;

      ({ command, params } = $.SUBRULE($.COMMAND));
      $.CONSUME(TO);
      $.OPTION(() => {
        pattern = $.SUBRULE($.PATTERN);
      });

      //TODO: try/catch?
      commands[command].execute(params, pattern);
    });

    $.RULE('COMMAND', () => {
      let command, params = [];

      command = $.CONSUME(COMMAND).image;
      $.CONSUME(LPAREN);
      $.MANY_SEP({
        SEP: COMMA,
        DEF: () => {
          params.push($.SUBRULE($.EXPRESSION))
        }
      });
      $.CONSUME(RPAREN);

      return { command, params };
    });

    $.RULE('PATTERN', () => {
      let suppress, name, elements = [];

      $.OPTION(() => {
        suppress = $.CONSUME(SUPPRESS);
      })
      $.OR([
        { ALT: () => {
          name = $.CONSUME(IDENTIFIER);
        }},
        { ALT: () => {
          $.CONSUME(ANON);
          name = null;
        }},
      ]);
      $.OPTION(() => {
        $.CONSUME(LBRAC);
        $.MANY_SEP({
          SEP: COMMA,
          DEF: () => {
            elements.push($.SUBRULE($.PATTERN))
          }
        });
        $.CONSUME(RBRAC);
      });

      return { name, suppress, elements };
    });

    $.RULE('EXPRESSION', () => {
      $.OR([
        { ALT: () => {
          let params = [];
          $.CONSUME(LBRAC);
          $.MANY_SEP({
            SEP: COMMA,
            DEF: () => {
              params.push($.SUBRULE($.EXPRESSION))
            }
          });
          $.CONSUME(RBRAC);

          return chooseLiteralConstructor(params);
        } },
        { ALT: () => $.CONSUME(IDENTIFIER) },
        { ALT: () => $.SUBRULE($.COMMAND) },
        { ALT: () => $.SUBRULE($.EXPRESSION) },
      ]);
    });

    this.performSelfAnalysis();
  }
}

export const gicsParser = new GicsParser(tokens);

/*

GICS commands are generally of the following syntax:

COMMAND -> PATTERN

although some commands do not require patterns on the right-hand side.

Patterns can be either names or decomposition objects following the ad-hoc constructors of the different geometric objects. Decomposition can name/bind elements of the object, e.g. points of a segment.

Most commands are some sort of constructors and they draw the object as a side effect, unless this is suppressed by a '-' sign. This can sit also on the elements of the subpattern, e.g. -p[-A,B] will bind a segment to the name "p" and its two ends to "A" and "B" but will only draw the "B" endpoint.

When a name is required to fulfill the (sub)pattern but not necessary, it can be replaced by a dummy character "."

Note that each named object has its element accessible for use in expressions by the use of a dot, e.g. p1.x or k1.cen. Interfaces are listed below.

=====

<sth> - <sth> is a constructed or a named object, of the type sth
{sth} - {sth} is a named object only, of the type sth
expr - anything not in <> or {} is an expression reducible to a number; those are named for ease of reading
"literal" - a string, has to be quoted
'character' - a character or a combo of characters, not quoted
sth0|sth1 - alternatives
[sth] - may or may not occur

NOTE: expressions expected to be angles can use the d:expr|r:expr|g:expr syntax, resp. degrees, radians, grades; the default (no prefix) is degree

NOTE: the [] characters are also used for literal values verbatim

*/