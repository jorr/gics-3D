//import storage
//import scene manipulation
//import drawing for side-effects

export class Command {
  item;
  itemIndex;

  get name() {
    return '';
  }

  execute(params, pattern) {
    this.check(params, pattern);
    this.createItem(params);
    this.bind(pattern);
    this.draw(pattern);
  }

  check(params, pattern) {
    //throw if incorrect params supplied or pattern is required but not supplied
  }

  createItem(params) {
    //construct the geometric object
  }

  bind(pattern) {
    //bind command results to storage identifiers
  }

  draw(pattern) {
    //draw unless suppressed, also loop through elements for drawing
  }

};

export function chooseLiteralConstructor(params) {

}