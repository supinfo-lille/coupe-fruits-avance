// ===============================================================
//  RÉGLAGES DU JEU
//  Tout ce qui change la sensation de jeu est rassemblé ici.
//  Modifie une valeur, enregistre, et recharge la page pour tester !
// ===============================================================

export const CONFIG = {
  // --- Détection de la main ---
  // Adresse du modèle d'IA qui reconnaît les mains (fourni par Google)
  MODEL_URL:
    "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
  // Résolution demandée à la webcam : plus petit = plus rapide sur un vieil ordinateur
  VIDEO_WIDTH: 640,
  VIDEO_HEIGHT: 480,
  // Numéro du point qui sert de lame (8 = bout de l'index, 4 = bout du pouce…)
  FINGER_TIP: 8,

  // --- La lame ---
  // Durée de vie de la traînée, en secondes
  BLADE_DURATION: 0.15,
  // Vitesse minimale du doigt pour couper (en hauteurs d'écran par seconde)
  BLADE_MIN_SPEED: 1.5,
  // Couleurs de la lame
  BLADE_COLOR: "#ffffff",
  BLADE_GLOW: "#ff7a59",

  // --- Les fruits ---
  FRUITS: ["🍉", "🍎", "🍊", "🍋", "🍌", "🍇", "🍓", "🍍", "🥝", "🍑"],
  BOMB: "💣",
  // Probabilité qu'un objet lancé soit une bombe (0.15 = 15 %)
  BOMB_CHANCE: 0.15,
  // Taille d'un fruit (rayon, en fraction de la hauteur de l'écran)
  FRUIT_SIZE: 0.07,
  // Gravité (en hauteurs d'écran par seconde²)
  GRAVITY: 1.2,

  // --- Difficulté ---
  // Temps entre deux lancers au début de la partie (secondes)
  SPAWN_INTERVAL_START: 1.2,
  // Temps minimal entre deux lancers, quand le jeu est au plus dur
  SPAWN_INTERVAL_MIN: 0.45,
  // De combien le temps entre deux lancers diminue à chaque seconde de jeu
  SPAWN_ACCELERATION: 0.01,
  // Nombre de vies au départ
  LIVES: 3,

  // --- Performance ---
  // Limite la finesse d'affichage sur les écrans haute définition (1 = le plus rapide)
  MAX_PIXEL_RATIO: 1.5,
};
