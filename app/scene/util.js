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
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
    z: (p1.z + p2.z) / 2
  };
}

export function pointInVolume(p, v) {
  return Math.abs(p.x) <= v.w/2 &&
    Math.abs(p.y) <= v.h/2 &&
    Math.abs(p.z) <= v.d/2;
}