// ===============================================================
//  LE JEU : états, score, vies, lancers, découpes
// ===============================================================
import { CONFIG } from "./config.js";
import {
  createFruit,
  moveObject,
  isOffScreen,
  drawFruit,
  drawEmoji,
  sliceFruit,
  drawPiece,
} from "./fruits.js";
import { segmentHitsCircle } from "./collision.js";

// Tout l'état du jeu est rangé dans cet objet
export const game = {
  state: "menu", // "menu" → "playing" → "gameover" → "playing"…
  score: 0,
  lives: CONFIG.LIVES,
  fruits: [], // fruits et bombes en vol
  pieces: [], // moitiés de fruits coupés
  spawnTimer: 0,
  spawnInterval: CONFIG.SPAWN_INTERVAL_START,
  startFruit: null, // la pastèque à trancher pour lancer une partie
  flash: 0, // flash rouge quand une bombe explose
  time: 0,
};

// Affiche la pastèque de départ au centre de l'écran
function placeStartFruit(width, height) {
  game.startFruit = {
    emoji: "🍉",
    x: width / 2,
    y: height * 0.62,
    vx: 0,
    vy: 0,
    radius: CONFIG.FRUIT_SIZE * height * 1.5,
    angle: 0,
    spin: 0.5,
  };
}

export function showMenu(width, height) {
  game.state = "menu";
  placeStartFruit(width, height);
}

function startGame() {
  game.state = "playing";
  game.score = 0;
  game.lives = CONFIG.LIVES;
  game.fruits = [];
  game.spawnTimer = 0.5;
  game.spawnInterval = CONFIG.SPAWN_INTERVAL_START;
  game.startFruit = null;
}

function endGame(width, height) {
  game.state = "gameover";
  placeStartFruit(width, height);
}

// Lance un ou deux objets
function spawn(width, height) {
  const count = Math.random() < 0.25 ? 2 : 1;
  for (let i = 0; i < count; i++) {
    const isBomb = Math.random() < CONFIG.BOMB_CHANCE;
    game.fruits.push(createFruit(width, height, isBomb));
  }
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

// Met à jour le jeu pendant dt secondes.
// "blade" est le dernier segment de la lame (ou null).
export function updateGame(dt, width, height, blade) {
  game.time += dt;
  game.flash = Math.max(0, game.flash - dt);

  // --- Menu ou fin de partie : on attend que la pastèque soit tranchée ---
  if (game.startFruit) {
    game.startFruit.angle += game.startFruit.spin * dt;
    if (isCut(game.startFruit, blade, height)) {
      game.pieces.push(...sliceFruit(game.startFruit, bladeAngle(blade)));
      startGame();
    }
  }

  // --- Lancer de nouveaux fruits ---
  if (game.state === "playing") {
    game.spawnTimer -= dt;
    if (game.spawnTimer <= 0) {
      spawn(width, height);
      game.spawnTimer = game.spawnInterval;
    }
    // Le jeu accélère petit à petit
    game.spawnInterval = Math.max(
      CONFIG.SPAWN_INTERVAL_MIN,
      game.spawnInterval - CONFIG.SPAWN_ACCELERATION * dt
    );
  }

  // --- Déplacer les fruits, vérifier les coupes et les fruits ratés ---
  for (const fruit of [...game.fruits]) {
    moveObject(fruit, dt, height);

    if (game.state === "playing" && isCut(fruit, blade, height)) {
      game.fruits.splice(game.fruits.indexOf(fruit), 1);
      if (fruit.isBomb) {
        game.flash = 0.5;
        endGame(width, height);
      } else {
        game.score += 1;
        game.pieces.push(...sliceFruit(fruit, bladeAngle(blade)));
      }
      continue;
    }

    if (isOffScreen(fruit, height)) {
      game.fruits.splice(game.fruits.indexOf(fruit), 1);
      if (game.state === "playing" && !fruit.isBomb) {
        game.lives -= 1;
        if (game.lives <= 0) endGame(width, height);
      }
    }
  }

  // --- Les moitiés tombent, puis disparaissent ---
  for (const piece of game.pieces) moveObject(piece, dt, height);
  game.pieces = game.pieces.filter((piece) => !isOffScreen(piece, height));
}

// --------------------------- Affichage ---------------------------

function drawText(ctx, text, x, y, size, align = "center") {
  ctx.save();
  ctx.font = `${size}px "Bungee", "Arial Black", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.lineWidth = size / 6;
  ctx.strokeStyle = "#1e1b4b";
  ctx.strokeText(text, x, y);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function drawGame(ctx, width, height) {
  for (const piece of game.pieces) drawPiece(ctx, piece);
  for (const fruit of game.fruits) drawFruit(ctx, fruit);

  const big = Math.min(width, height) * 0.1;
  const small = Math.min(width, height) * 0.04;

  if (game.startFruit) {
    // La pastèque flotte doucement
    const f = game.startFruit;
    const bob = Math.sin(game.time * 2) * height * 0.01;
    drawEmoji(ctx, f.emoji, f.x, f.y + bob, f.radius, f.angle);

    if (game.state === "menu") {
      drawText(ctx, "Coupe-Fruits", width / 2, height * 0.24, big);
      drawText(ctx, "Tranche la pastèque avec ton index pour jouer", width / 2, height * 0.38, small);
    } else {
      drawText(ctx, "Partie terminée", width / 2, height * 0.2, big * 0.8);
      drawText(ctx, `Score : ${game.score}`, width / 2, height * 0.33, big * 0.6);
      drawText(ctx, "Tranche la pastèque pour rejouer", width / 2, height * 0.43, small);
    }
  }

  if (game.state === "playing") {
    drawText(ctx, String(game.score), 32, 48, big * 0.7, "left");
    const hearts = "❤️".repeat(game.lives) + "🤍".repeat(CONFIG.LIVES - game.lives);
    ctx.save();
    ctx.font = `${small * 1.2}px sans-serif`;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(hearts, width - 24, 48);
    ctx.restore();
  }

  // Flash rouge de l'explosion
  if (game.flash > 0) {
    ctx.fillStyle = `rgba(255, 122, 89, ${game.flash})`;
    ctx.fillRect(0, 0, width, height);
  }
}
