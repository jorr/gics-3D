import { Point } from './items/point.js';
import { Segment } from './items/segment.js';
import { Line } from './items/line.js';
import { Plane } from './items/plane.js';
import { Point2D, Segment2D } from './item.js';
import { Vector } from './vectors.js';
import { WrongParamsError } from '../errors.js';

import log from 'loglevel';

// CALCULATIONS

export function dist2D(arg1, arg2) {
  if (arg1 instanceof Point2D && arg2 instanceof Point2D) {
    return Math.sqrt((arg2.x - arg1.x)**2 + (arg2.y - arg1.y)**2);
  }
}

export function angle2D(arg1, arg2) {
  if (arg1 instanceof Segment2D && arg2 instanceof Segment2D) {
    let norm1 = Math.sqrt((arg1.p2.x-arg1.p1.x)**2 + (arg1.p2.y-arg1.p1.y)**2);
    let norm2 = Math.sqrt((arg2.p2.x-arg2.p1.x)**2 + (arg2.p2.y-arg2.p1.y)**2);
    return Math.acos((arg1.p2.x-arg1.p1.x)/norm1*(arg2.p2.x-arg2.p1.x)/norm2 + (arg1.p2.y-arg1.p1.y)/norm1*(arg2.p2.y-arg2.p1.y)/norm2);
  }
}