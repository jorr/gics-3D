import chevrotain from 'chevrotain';
const { createToken, tokenMatcher, Lexer, EmbeddedActionsParser } = chevrotain;
import log from 'loglevel';
import { literalConstruct, resolveIdentifier, convertAngle } from './command.js';
import { GicsError } from '../errors.js';

/****************** LEXER ******************/

export class GicsLexer extends Lexer {
  constructor(commands) {
    const NUMBER = createToken({ name: 'NUMBER', pattern: /\d+(\.\d+)?/});//(\.\d*)/});
    const IDENTIFIER = createToken({
      name: 'IDENTIFIER',
      pattern: /[a-zA-Z]+[a-zA-Z\d']*((\.[a-zA-Z]+[a-zA-Z\d]*)*)?/
    });
    const COMMAND = createToken({
      name: 'COMMAND',
      pattern: RegExp(`${Object.keys(commands).concat('cos','sin','tan','sqrt').join('|')}`,'i'),
      longer_alt: IDENTIFIER
    });
    const STRING = createToken({
      name: 'STRING',
      pattern: /"[^"]*"/
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
      /*QUOTE,*/ RBRAC, LBRAC, STRING, ANGLE, IDENTIFIER, TO, ANON, PLUS, MINUS,
      SEPARATOR, MULTOP, ADDOP
    ];

    super(tokens);
    this.tokens = tokens;
  }
}

/****************** PARSER ******************/

export class GicsParser extends EmbeddedActionsParser {
  constructor(commands, tokens) {
    super(tokens);
    const $ = this;

    for (let token of tokens)
      this[token.name] = token;

    $.RULE('PROGRAM', () => {
      $.MANY(() => {
        $.SUBRULE($.STATEMENT);
        $.OPTION(() => $.CONSUME(this.SEPARATOR));
      });
    })

    $.RULE('STATEMENT', () => {
      let command, params, pattern;

      ({ command, params } = $.SUBRULE($.COMMANDINVOCATION));

      $.OPTION(() => {
        $.CONSUME(this.TO, {
          ERR_MSG: 'Missing -> at pattern definition'
        });
        pattern = $.SUBRULE($.PATTERN);
      });

      $.ACTION(() => {
        try {
          commands[command].execute(params, pattern, commands);
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
      let command = $.CONSUME(this.COMMAND).image,
          params = [];

      $.CONSUME(this.LPAREN);
      $.MANY_SEP({
        SEP: this.COMMA,
        DEF: () => {
          let expression = $.SUBRULE($.EXPRESSION);
          $.ACTION(() => {
            params.push(expression);
          });
        }
      });
      $.CONSUME(this.RPAREN);

      return { command, params };
    });

    $.RULE('PATTERN', () => {
      let suppress = false, name, elements = [];

      $.OPTION(() => {
        suppress = !!$.CONSUME(this.MINUS);
      })
      $.OR([
        { ALT: () => {
          name = $.CONSUME(this.IDENTIFIER).image;
        }},
        { ALT: () => {
          $.CONSUME(this.ANON);
          name = null;
        }},
      ]);
      $.OPTION2(() => {
        $.CONSUME(this.LBRAC);
        $.MANY_SEP({
          SEP: this.COMMA,
          DEF: () => {
            let pattern = $.SUBRULE($.PATTERN);
            $.ACTION(() => {
              elements.push(pattern);
            });
          }
        });
        $.CONSUME(this.RBRAC);
      });

      return { name, suppress, elements };
    });

    $.RULE('EXPRESSION', () => {
      return $.OR([
        { ALT: () => {
          let params = [];
          $.CONSUME(this.LBRAC);
          $.MANY_SEP({
            SEP: this.COMMA,
            DEF: () => {
              let param = $.SUBRULE($.EXPRESSION);
              $.ACTION(() => {
                params.push(param);
              });
            }
          });
          $.CONSUME(this.RBRAC);
          return $.ACTION(() => literalConstruct(params));
        } },
        { ALT: () => convertAngle($.CONSUME(this.ANGLE).image) },
        { ALT: () => {
          let string = $.CONSUME(this.STRING).image;
          return string.slice(1,-1);
        } },
        { ALT: () => $.SUBRULE($.ARITHMEXPRESSION) },
      ]);
    });

    $.RULE('ARITHMEXPRESSION', () => {
      let value, op, rhs;
      value = $.SUBRULE($.MULTIPLICATION);
      $.MANY(() => {
        op = $.CONSUME(this.ADDOP);
        rhs = $.SUBRULE2($.MULTIPLICATION);
        if (tokenMatcher(op, this.PLUS)) {
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
        op = $.CONSUME(this.MULTOP);
        rhs = $.SUBRULE2($.ATOMIC);
        if (tokenMatcher(op, this.MULT)) {
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
          $.CONSUME(this.LPAREN);
          expression = $.SUBRULE($.ARITHMEXPRESSION);
          $.CONSUME(this.RPAREN);
          return expression;
        } },
        { ALT: () => {
          let identifier = $.CONSUME(this.IDENTIFIER).image;
          return $.ACTION(() => resolveIdentifier(identifier));
        } },
        { ALT: () => {
          let sign = 1;
          $.OPTION(() => {
            $.CONSUME(this.MINUS);
            sign = -1;
          });
          return sign * parseFloat($.CONSUME(this.NUMBER).image);
        } },
        // we need nested commands for things like dist and angle
        { ALT: () => {
          let {command, params} = $.SUBRULE($.COMMANDINVOCATION);
          return $.ACTION(() => {
            if (Math[command]) return Math[command](params);
            else return commands[command].execute(params)
          });
        } }
      ])
    });

    this.performSelfAnalysis();
  }
}

// export const gicsParser = new GicsParser();

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