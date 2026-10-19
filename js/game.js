// ===============================================================
//  LE JEU (version étape 5) : on peut couper les fruits
// ===============================================================
import { CONFIG } from "./config.js";
import {
  createFruit,
  moveObject,
  isOffScreen,
  drawFruit,
  sliceFruit,
  drawPiece,
} from "./fruits.js";
import { segmentHitsCircle } from "./collision.js";

// Tout l'état du jeu est rangé dans cet objet
export const game = {
  state: "playing",
  score: 0,
  fruits: [], // fruits en vol
  pieces: [], // moitiés de fruits coupés
  spawnTimer: 0,
  startFruit: null,
};

// Pas encore de menu : la partie démarre tout de suite
export function showMenu() {
  game.state = "playing";
}

// Vrai si la lame va assez vite et traverse l'objet
function isCut(obj, blade, height) {
  if (!blade) return false;
  if (blade.speed < CONFIG.BLADE_MIN_SPEED * height) return false;
  return segmentHitsCircle(blade.a, blade.b, obj, obj.radius);
}

function bladeAngle(blade) {
  return Math.atan2(blade.b.y - blade.a.y, blade.b.x - blade.a.x);
}

// "blade" est le dernier segment de la lame (ou null)
export function updateGame(dt, width, height, blade) {
  game.spawnTimer -= dt;
  if (game.spawnTimer <= 0) {
    game.fruits.push(createFruit(width, height, false));
    game.spawnTimer = CONFIG.SPAWN_INTERVAL_START;
  }

  for (const fruit of [...game.fruits]) {
    moveObject(fruit, dt, height);

    if (isCut(fruit, blade, height)) {
      game.fruits.splice(game.fruits.indexOf(fruit), 1);
      game.score += 1;
      game.pieces.push(...sliceFruit(fruit, bladeAngle(blade)));
    } else if (isOffScreen(fruit, height)) {
      game.fruits.splice(game.fruits.indexOf(fruit), 1);
    }
  }

  for (const piece of game.pieces) moveObject(piece, dt, height);
  game.pieces = game.pieces.filter((piece) => !isOffScreen(piece, height));
}

export function drawGame(ctx, width, height) {
  for (const piece of game.pieces) drawPiece(ctx, piece);
  for (const fruit of game.fruits) drawFruit(ctx, fruit);

  const size = Math.min(width, height) * 0.07;
  ctx.save();
  ctx.font = `${size}px "Bungee", "Arial Black", sans-serif`;
  ctx.textBaseline = "middle";
  ctx.lineWidth = size / 6;
  ctx.strokeStyle = "#1e1b4b";
  ctx.strokeText(String(game.score), 32, 48);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(String(game.score), 32, 48);
  ctx.restore();
}
