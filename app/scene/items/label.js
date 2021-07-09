import { Item, Text2D } from '../item.js';

import log from 'loglevel';

export class Label extends Item {

   location; //Point
   text;
   direction;

   constructor(location, text, direction = 'NE', offset = 0) {
    super();

    this.location = location;
    this.text = text;
    this.direction = direction;
    this.offset = offset;
   }

   project(projectionData, projection, label, color) {
    let projected = projection.projectPoint(this.location, projectionData);
    return new Text2D(projected, this.text, this.direction, this.offset);
   }
}