// ===============================================================
//  LE JEU (version étape 4) : des fruits sont lancés en continu
// ===============================================================
import { CONFIG } from "./config.js";
import { createFruit, moveObject, isOffScreen, drawFruit } from "./fruits.js";

// Tout l'état du jeu est rangé dans cet objet
export const game = {
  state: "playing",
  fruits: [], // fruits en vol
  spawnTimer: 0,
  startFruit: null,
};

// Pas encore de menu : la partie démarre tout de suite
export function showMenu() {
  game.state = "playing";
}

export function updateGame(dt, width, height) {
  // Lancer un nouveau fruit à intervalle régulier
  game.spawnTimer -= dt;
  if (game.spawnTimer <= 0) {
    game.fruits.push(createFruit(width, height, false));
    game.spawnTimer = CONFIG.SPAWN_INTERVAL_START;
  }
  // Sécurité : tant que l'étape 4 n'est pas finie, les fruits ne partent jamais.
  // On en garde 20 au maximum pour ne pas ralentir l'ordinateur.
  if (game.fruits.length > 20) game.fruits.shift();

  // Déplacer chaque fruit…
  for (const fruit of game.fruits) moveObject(fruit, dt, height);
  // …et oublier ceux qui sont retombés hors de l'écran
  game.fruits = game.fruits.filter((fruit) => !isOffScreen(fruit, height));
}

export function drawGame(ctx) {
  for (const fruit of game.fruits) drawFruit(ctx, fruit);
}
