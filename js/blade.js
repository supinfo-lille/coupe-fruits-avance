// ===============================================================
//  LA LAME : la traînée qui suit le doigt
// ===============================================================
import { CONFIG } from "./config.js";

// Historique des dernières positions du doigt : { x, y, time }
const points = [];

// Ajoute une position (on ignore les déplacements de moins d'un pixel)
export function addBladePoint(x, y, time) {
  const last = points[points.length - 1];
  if (last && Math.hypot(x - last.x, y - last.y) < 1) return;
  points.push({ x, y, time });
}

// Supprime les positions trop anciennes : c'est ce qui fait disparaître la traînée
export function updateBlade(time) {
  while (points.length > 0 && time - points[0].time > CONFIG.BLADE_DURATION) {
    points.shift();
  }
}

// Renvoie le dernier morceau de trajectoire et sa vitesse en pixels par seconde.
// C'est ce segment qu'on utilise pour savoir si un fruit est coupé.
export function getBladeSegment(time) {
  if (points.length < 2) return null;
  const a = points[points.length - 2];
  const b = points[points.length - 1];
  // Si le doigt ne bouge plus depuis un moment, la lame ne coupe plus
  if (time - b.time > 0.1) return null;
  const duration = b.time - a.time;
  if (duration <= 0) return null;
  const speed = Math.hypot(b.x - a.x, b.y - a.y) / duration;
  return { a, b, speed };
}

// Dessine la traînée : plus un point est récent, plus le trait est épais et opaque
export function drawBlade(ctx, time) {
  if (points.length < 2) return;

  ctx.save();
  ctx.lineCap = "round";
  ctx.shadowColor = CONFIG.BLADE_GLOW;
  ctx.shadowBlur = 20;

  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const life = 1 - (time - p1.time) / CONFIG.BLADE_DURATION; // de 1 (neuf) à 0 (vieux)
    if (life <= 0) continue;

    ctx.globalAlpha = life;
    ctx.strokeStyle = CONFIG.BLADE_COLOR;
    ctx.lineWidth = 2 + 12 * life * (i / points.length);
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  }
  ctx.restore();
}
