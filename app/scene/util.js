import { Point } from './items/point.js';
import { Segment } from './items/segment.js';
import { Line } from './items/line.js';
import { Plane } from './items/plane.js';
import { WrongParamsError } from '../errors.js';

// CALCULATIONS

//arg2 is always the vaster object
export function dist(arg1, arg2) {
  if (arg1 instanceof Point && arg2 instanceof Point) {
    return Math.sqrt(
      (arg2.x - arg1.x)^2,
      (arg2.y - arg1.y)^2,
      (arg2.z - arg1.z)^2
    );
  } else if (arg1 instanceof Point && arg2 instanceof Plane) {
    return arg2.n.unit().dot(arg2.pt.vectorTo(arg1)).norm();
  } else if (arg1 instanceof Point && arg2 instanceof Line) {
    return arg2.pt.add(arg2.u.unit().scale(arg2.u.unit().dot(arg2.pt.vectorTo(arg1))));
  } else if (arg1 instanceof Line && arg2 instanceof Line) {
    return Math.abs(arg1.u.cross(arg2.u).unit().dot(arg1.pt.vectorTo(arg2.pt)));
  } else if (arg1 instanceof Line && arg2 instanceof Plane) {
    return dist(arg1.getPointAtParam(0), arg2);
  }
}

export function angle(arg1, arg2) {
  // turn segments to lines
  if (arg1 instanceof Segment) arg1 = arg1.lineOn(arg1);
  if (arg2 instanceof Segment) arg2 = arg2.lineOn(arg2);

  if (arg1 instanceof Line && arg2 instanceof Line)
    return Math.arccos(arg1.u.unit().dot(arg2.u.unit()));
  else if (arg1 instanceof Line && arg2 instanceof Plane)
    return Math.arcsin(arg1.u.unit().dot(arg2.n.unit()));
  else if (arg1 instanceof Plane && arg2 instanceof Plane)
    //BOYKO: angle between planes
    return 0;
}

export function midpoint(p1, p2) {
  return new Point(
    (p1.x + p2.x) / 2,
    (p1.y + p2.y) / 2,
    (p1.z + p2.z) / 2
  );
}

// CHECKS

export function pointInVolume(p, v) {
  return Math.abs(p.x) <= v.w/2 &&
    Math.abs(p.y) <= v.h/2 &&
    Math.abs(p.z) <= v.d;
}

// TRANSFORMATIONS

export function translate(p, v) {
  p.rvector = p.rvector.add(v);
}

export function rotate(p, axis, fi) {
  const u = axis.u.unit(), a = axis.pt.rvector, ap = a.vectorTo(p);
  p.rvector = a.add(u.scale((1 - Math.cos(fi))*u.dot(ap))).
                add(ap.scale(Math.cos(fi))).
                add(u.cross(ap).scale(Math.sin(fi)));
}

export function scale(p, n) {
  p.rvector = p.rvector.scale(n);
}