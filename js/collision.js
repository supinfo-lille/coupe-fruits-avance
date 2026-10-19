// ===============================================================
//  COLLISION : est-ce que la lame traverse un fruit ?
// ===============================================================

// Un fruit est un cercle (centre + rayon), la lame est un segment [a, b].
// On cherche le point du segment le plus proche du centre du fruit :
// si ce point est à moins d'un rayon du centre, le fruit est touché.
export function segmentHitsCircle(a, b, center, radius) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;

  // t indique où se trouve le point le plus proche sur le segment (0 = en a, 1 = en b)
  let t = 0;
  if (lengthSquared > 0) {
    t = ((center.x - a.x) * dx + (center.y - a.y) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));
  }

  const closestX = a.x + t * dx;
  const closestY = a.y + t * dy;
  return Math.hypot(center.x - closestX, center.y - closestY) <= radius;
}
