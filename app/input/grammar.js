import chevrotain from 'chevrotain';
const { createToken, tokenMatcher, Lexer, EmbeddedActionsParser } = chevrotain;

import fs from 'fs';
import path from 'path';
import log from 'loglevel';
import { literalConstruct, resolveIdentifier, convertAngle } from './command.js';
import { GicsError } from '../errors.js';

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

const NUMBER = createToken({ name: 'NUMBER', pattern: /\d+/});//(\.\d*)/});
const IDENTIFIER = createToken({
  name: 'IDENTIFIER',
  pattern: /[a-zA-Z]+[a-zA-Z\d]*(\.[a-zA-Z]+[a-zA-Z\d]*)?/
});
const COMMAND = createToken({
  name: 'COMMAND',
  pattern: RegExp(`${Object.keys(commands).join('|')}`,'i'),
  longer_alt: IDENTIFIER
});
const STRING = createToken({
  name: 'COMMAND',
  pattern: RegExp(`"[a-zA-Z-]+"`,'i'),
});
const LPAREN = createToken({ name: 'LPAREN', pattern: /\(/ });
const RPAREN = createToken({ name: 'RPAREN', pattern: /\)/ });
const COMMA = createToken({ name: 'COMMA', pattern: /,/ });
// const QUOTE = createToken({ name: 'QUOTE', pattern: /"/ });
const LBRAC = createToken({ name: 'LBRAC', pattern: /\[/ });
const RBRAC = createToken({ name: 'RBRAC', pattern: /\]/ });
const TO = createToken({ name: 'TO', pattern: /->/ });
const ANON = createToken({ name: 'ANON', pattern: /\./ });
const ANGLE = createToken({ name: 'ANGLE', pattern: /(r:|d:|g:)([0-9]+)/ });
const SEPARATOR = createToken({ name: 'SEPARATOR', pattern: /;/ });
const WHITESPACE = createToken({ name: 'WHITESPACE', pattern: /\s+/, group: Lexer.SKIPPED });
const COMMENT = createToken({ name: "COMMENT", pattern: /#.+/, group: Lexer.SKIPPED });
const ADDOP = createToken({ name: 'ADDOP', pattern: Lexer.NA });
const PLUS = createToken({ name: 'PLUS', pattern: /\+/, categories: ADDOP });
const MINUS = createToken({ name: 'MINUS', pattern: /-/, categories: ADDOP });
const MULTOP = createToken({ name: 'MULTOP', pattern: Lexer.NA });
const MULT = createToken({ name: 'MULT', pattern: /\*/, categories: MULTOP });
const DIV = createToken({ name: 'DIV', pattern: /\//, categories: MULTOP });

const tokens = [
  WHITESPACE, COMMENT, MULT, DIV, NUMBER, COMMAND, LPAREN, RPAREN, COMMA,
  /*QUOTE,*/ RBRAC, LBRAC, STRING, IDENTIFIER, TO, ANON, PLUS, MINUS,
  ANGLE, SEPARATOR, MULTOP, ADDOP
];

export const gicsLexer = new Lexer(tokens);

/****************** PARSER ******************/

export class GicsParser extends EmbeddedActionsParser {
  constructor() {
    super(tokens);
    const $ = this;

    $.RULE('PROGRAM', () => {
      $.MANY(() => {
        $.SUBRULE($.STATEMENT);
        $.OPTION(() => $.CONSUME(SEPARATOR));
      });
    })

    $.RULE('STATEMENT', () => {
      let command, params, pattern;

      ({ command, params } = $.SUBRULE($.COMMANDINVOCATION));

      $.OPTION(() => {
        $.CONSUME(TO, {
          ERR_MSG: 'Missing -> at pattern definition'
        });
        pattern = $.SUBRULE($.PATTERN);
      });

      $.ACTION(() => {
        try {
          commands[command].execute(params, pattern);
          //TODO: must take care of commands that return a result (or treat them as expressions)
        }
        catch (e) {
          if (e instanceof GicsError) {
            log.error(`PARSING ERROR: ${e.message}`);
          } else {
            throw e;
          }
          //TODO: Global error handling
        }
      });
    });

    $.RULE('COMMANDINVOCATION', () => {
      let command = $.CONSUME(COMMAND).image,
          params = [];

      $.CONSUME(LPAREN);
      $.MANY_SEP({
        SEP: COMMA,
        DEF: () => {
          let expression = $.SUBRULE($.EXPRESSION);
          $.ACTION(() => {
            params.push(expression);
          });
        }
      });
      $.CONSUME(RPAREN);

      return { command, params };
    });

    $.RULE('PATTERN', () => {
      let suppress = false, name, elements = [];

      $.OPTION(() => {
        suppress = !!$.CONSUME(MINUS);
      })
      $.OR([
        { ALT: () => {
          name = $.CONSUME(IDENTIFIER).image;
        }},
        { ALT: () => {
          $.CONSUME(ANON);
          name = null;
        }},
      ]);
      $.OPTION2(() => {
        $.CONSUME(LBRAC);
        $.MANY_SEP({
          SEP: COMMA,
          DEF: () => {
            let pattern = $.SUBRULE($.PATTERN);
            $.ACTION(() => {
              elements.push(pattern);
            });
          }
        });
        $.CONSUME(RBRAC);
      });

      return { name, suppress, elements };
    });

    $.RULE('EXPRESSION', () => {
      return $.OR([
        { ALT: () => {
          let params = [];
          $.CONSUME(LBRAC);
          $.MANY_SEP({
            SEP: COMMA,
            DEF: () => {
              let param = $.SUBRULE($.EXPRESSION);
              $.ACTION(() => {
                params.push(param);
              });
            }
          });
          $.CONSUME(RBRAC);

          return $.ACTION(() => literalConstruct(params));
        } },
        // { ALT: () => {
        //   let identifier = $.CONSUME(IDENTIFIER).image;
        //   return $.ACTION(() => resolveIdentifier(identifier));
        // } },
        // { ALT: () => {
        //   let number = $.CONSUME(NUMBER).image;
        //   return $.ACTION(() => parseFloat(number));
        // } },
        { ALT: () => convertAngle($.CONSUME(ANGLE).image) },
        { ALT: () => {
          let string = $.CONSUME(STRING).image;
          return string.slice(1,-1);
        } },
        { ALT: () => $.SUBRULE($.ARITHMEXPRESSION) },
        { ALT: () => {
          let {command, params} = $.SUBRULE($.COMMANDINVOCATION);
          return $.ACTION(() => commands[command].execute(params));
        } }
      ]);
    });

    $.RULE('ARITHMEXPRESSION', () => {
      let value, op, rhs;
      value = $.SUBRULE($.MULTIPLICATION);
      $.MANY(() => {
        op = $.CONSUME(ADDOP);
        rhs = $.SUBRULE2($.MULTIPLICATION);
        if (tokenMatcher(op, PLUS)) {
          value += rhs;
        } else {
          value -= rhs;
        }
      });
      return value;
    });

    $.RULE('MULTIPLICATION', () => {
      let value, op, rhs;
      value = $.SUBRULE($.ATOMIC);
      $.MANY(() => {
        op = $.CONSUME(MULTOP);
        rhs = $.SUBRULE2($.ATOMIC);
        if (tokenMatcher(op, MULT)) {
          value *= rhs;
        } else {
          value /= rhs;
        }
      });
      return value;
    });

    $.RULE('ATOMIC', () => {
      return $.OR([
        { ALT: () => {
          let expression;
          $.CONSUME(LPAREN);
          expression = $.SUBRULE($.ARITHMEXPRESSION);
          $.CONSUME(RPAREN);
          return expression;
        } },
        { ALT: () => {
          let identifier = $.CONSUME(IDENTIFIER).image;
          return $.ACTION(() => resolveIdentifier(identifier));
        } },
        { ALT: () => {
          let sign = 1;
          $.OPTION(() => {
            $.CONSUME(MINUS);
            sign = -1;
          });
          return sign * parseFloat($.CONSUME(NUMBER).image);
        } }
      ])
    });

    this.performSelfAnalysis();
  }
}

export const gicsParser = new GicsParser();

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