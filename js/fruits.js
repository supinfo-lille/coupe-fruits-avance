// ===============================================================
//  LES FRUITS : lancer, physique, dessin, découpe en deux
// ===============================================================
import { CONFIG } from "./config.js";

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

// Crée un fruit (ou une bombe) qui part du bas de l'écran
export function createFruit(width, height, isBomb) {
  const radius = CONFIG.FRUIT_SIZE * height;
  const gravity = CONFIG.GRAVITY * height;

  const x = width * randomBetween(0.2, 0.8);
  const y = height + radius;

  // On choisit la hauteur où le fruit s'arrêtera de monter…
  const peakY = height * randomBetween(0.15, 0.4);
  // …et on calcule la vitesse de départ nécessaire pour l'atteindre (physique du lycée !)
  const vy = -Math.sqrt(2 * gravity * (y - peakY));

  // Le fruit dérive doucement vers le centre de l'écran
  const flightTime = (2 * -vy) / gravity;
  const targetX = width * randomBetween(0.3, 0.7);
  const vx = (targetX - x) / flightTime;

  const emoji = isBomb
    ? CONFIG.BOMB
    : CONFIG.FRUITS[Math.floor(Math.random() * CONFIG.FRUITS.length)];

  return {
    emoji,
    isBomb,
    x,
    y,
    vx,
    vy,
    radius,
    angle: 0,
    spin: randomBetween(-3, 3), // vitesse de rotation (radians par seconde)
  };
}

// Fait avancer un objet (fruit ou moitié de fruit) pendant dt secondes
export function moveObject(obj, dt, height) {
  obj.vy += CONFIG.GRAVITY * height * dt; // la gravité accélère vers le bas
  obj.x += obj.vx * dt;
  obj.y += obj.vy * dt;
  obj.angle += obj.spin * dt;
}

// Vrai quand l'objet est retombé sous le bas de l'écran
export function isOffScreen(obj, height) {
  return obj.vy > 0 && obj.y - obj.radius > height;
}

// Dessine un emoji centré, tourné d'un certain angle
export function drawEmoji(ctx, emoji, x, y, radius, angle = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.font = `${radius * 2}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, 0, 0);
  ctx.restore();
}

export function drawFruit(ctx, fruit) {
  drawEmoji(ctx, fruit.emoji, fruit.x, fruit.y, fruit.radius, fruit.angle);
}

// Coupe un fruit en deux moitiés qui s'écartent selon l'angle de la lame
export function sliceFruit(fruit, cutAngle) {
  // Direction perpendiculaire à la coupe : c'est là que les moitiés s'écartent
  const nx = -Math.sin(cutAngle);
  const ny = Math.cos(cutAngle);
  const push = fruit.radius * 3;

  return [1, -1].map((side) => ({
    emoji: fruit.emoji,
    x: fruit.x,
    y: fruit.y,
    vx: fruit.vx + nx * push * side,
    vy: fruit.vy + ny * push * side,
    radius: fruit.radius,
    angle: fruit.angle,
    spin: fruit.spin + side * 2,
    cut: cutAngle - fruit.angle, // angle de la coupe vu depuis le fruit
    side,
  }));
}

// Dessine une moitié : on dessine le fruit entier mais on n'en garde
// qu'un côté grâce à un "masque" (clip)
export function drawPiece(ctx, piece) {
  const r = piece.radius;
  ctx.save();
  ctx.translate(piece.x, piece.y);
  ctx.rotate(piece.angle);

  ctx.rotate(piece.cut);
  ctx.beginPath();
  if (piece.side > 0) ctx.rect(-r * 2, 0, r * 4, r * 2);
  else ctx.rect(-r * 2, -r * 2, r * 4, r * 2);
  ctx.clip();
  ctx.rotate(-piece.cut);

  drawEmoji(ctx, piece.emoji, 0, 0, r);
  ctx.restore();
}
