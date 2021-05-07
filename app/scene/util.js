import { Point } from './items/point.js';

// CALCULATIONS

export function dist(p1, p2) {
  //TODO: overload for point to plane, point to line, etc
  return Math.sqrt(
    (p2.x - p1.x)^2,
    (p2.y - p1.y)^2,
    (p2.z - p1.z)^2
  );
}

export function angle() {

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