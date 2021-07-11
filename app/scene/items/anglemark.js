import { Item, Angle2D } from '../item.js';

import log from 'loglevel';

export class Anglemark extends Item {

   anglepoints; //Point[]
   type;
   offset;

   constructor(anglepoints, type = ')', offset = 30) {
    super();

    this.anglepoints = anglepoints;
    this.type = type;
    this.offset = offset;

    this.style = { stroke: 2.0 }; //arcs are a little thinner
   }

   project(projectionData, projection) {
    return new Angle2D(this.anglepoints.map(p => projection.projectPoint(p,projectionData)), this.text, this.type, this.offset);
   }
}