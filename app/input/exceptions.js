export class WrongParamsException {
  message = '';
}

export class MissingPatternException {
  constructor(command/*, line? */) {
    this.message = `Command ${command.name} requires a pattern on the righthand side.`
  }
}
