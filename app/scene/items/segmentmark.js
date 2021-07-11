import { Segment2D, Item } from '../item.js';
import { Vector2D } from '../vectors.js';
import { midpoint2D } from '../util2d.js';

import log from 'loglevel';

export class Segmentmark extends Item {

   segment;
   type;

   constructor(segment, type = '|') {
    super();

    this.segment = segment;
    this.type = type;
   }

   project(projectionData, projection) {
      let segProjected = this.segment.project(projectionData, projection);
      let mid = midpoint2D(segProjected.p1, segProjected.p2);
      let segV = Vector2D.fromPoints(segProjected.p1, segProjected.p2).unit().scale(5);
      let segVOrt = segV.perpendicular();

      switch(this.type) {
         case '||':
            return [
               new Segment2D(mid.add(segV).add(segVOrt), mid.add(segV).add(segVOrt.scale(-1))),
               new Segment2D(mid.add(segV.scale(-1)).add(segVOrt), mid.add(segV.scale(-1)).add(segVOrt.scale(-1))),
            ];
            break;
         case '|':
         default:
            return new Segment2D(mid.add(segVOrt), mid.add(segVOrt.scale(-1)));
            break;
      }
   }
}