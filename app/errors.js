import { inspect } from 'util';

export class GicsError extends Error {}

export class WrongParamsError extends GicsError {
  constructor(params, command) {
    super();
    this.message = `Command ${command.name} does not accept these parameters: ${inspect(params)}`;
  }
}

export class MissingPatternError extends GicsError {
  constructor(command) {
    super();
    this.message = `Command ${command.name} requires a pattern on the righthand side.`;
  }
}

export class NotFeasibleError extends GicsError {
  constructor(params, objectName) {
    super();
    this.message = `Construction of ${objectName} not feasible with params: ${inspect(params)}`;
  }
}

export class WrongPatternError extends GicsError {
  constructor(expectedPattern, command) {
    super();
    this.message = `Command ${command.name} expects a pattern deconstructor of the kind: ${expectedPattern}`;
  }
}

export class SyntaxError extends GicsError {
}
