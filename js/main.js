// ===============================================================
//  POINT D'ENTRÉE : prépare tout, puis lance la boucle de jeu
// ===============================================================
import { CONFIG } from "./config.js";
import { startCamera, getVideoLayout, drawVideo, toScreen } from "./camera.js";
import { loadHandTracker, detectHand, drawHand } from "./hand.js";
import { addBladePoint, updateBlade, getBladeSegment, drawBlade } from "./blade.js";
import { game, showMenu, updateGame, drawGame } from "./game.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const video = document.getElementById("webcam");
const statusBox = document.getElementById("status");

let width = 0;
let height = 0;
let cameraReady = false;
let showSkeleton = false; // touche H
let showFps = false; // touche F
let lastTime = 0;
let fps = 0;

function setStatus(message, hideAfterMs = 0) {
  statusBox.textContent = message;
  if (hideAfterMs > 0) {
    setTimeout(() => {
      if (statusBox.textContent === message) statusBox.textContent = "";
    }, hideAfterMs);
  }
}

// Adapte le canvas à la taille de la fenêtre
function resize() {
  const ratio = Math.min(window.devicePixelRatio || 1, CONFIG.MAX_PIXEL_RATIO);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawBackground(layout) {
  if (layout) {
    drawVideo(ctx, video, layout);
    // Voile sombre pour que les fruits ressortent bien
    ctx.fillStyle = "rgba(30, 27, 75, 0.45)";
    ctx.fillRect(0, 0, width, height);
  } else {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#312e81");
    gradient.addColorStop(1, "#1e1b4b");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
}

// La boucle de jeu : appelée environ 60 fois par seconde
function loop(timestamp) {
  const time = timestamp / 1000;
  const dt = Math.min(time - lastTime, 0.05); // on limite dt si l'onglet a été en pause
  lastTime = time;
  fps = fps * 0.9 + (dt > 0 ? 1 / dt : 0) * 0.1;

  const layout = cameraReady ? getVideoLayout(video, width, height) : null;

  // 1. Où est la main ?
  const hand = cameraReady ? detectHand(video) : null;
  if (hand) {
    const tip = toScreen(hand[CONFIG.FINGER_TIP], layout);
    addBladePoint(tip.x, tip.y, time);
  }

  // 2. Mise à jour de la lame et du jeu
  updateBlade(time);
  updateGame(dt, width, height, getBladeSegment(time));

  // 3. Dessin, de l'arrière-plan vers le premier plan
  drawBackground(layout);
  drawGame(ctx, width, height);
  if (showSkeleton && hand) drawHand(ctx, hand, layout);
  drawBlade(ctx, time);

  if (showFps) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "16px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${Math.round(fps)} images/s`, 16, height - 16);
  }

  requestAnimationFrame(loop);
}

async function init() {
  resize();
  window.addEventListener("resize", () => {
    resize();
    if (game.startFruit) showMenu(width, height);
  });

  // Jouer à la souris (ou au doigt sur écran tactile) : pratique pour tester sans webcam
  canvas.addEventListener("pointermove", (event) => {
    addBladePoint(event.clientX, event.clientY, performance.now() / 1000);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "h" || event.key === "H") showSkeleton = !showSkeleton;
    if (event.key === "f" || event.key === "F") showFps = !showFps;
  });

  await document.fonts.ready;
  showMenu(width, height);
  requestAnimationFrame(loop);

  try {
    setStatus("Ouverture de la webcam…");
    await startCamera(video);
    cameraReady = true; // la vidéo s'affiche déjà, même avant le modèle
    setStatus("Chargement du modèle de détection de la main…");
    const device = await loadHandTracker();
    setStatus(`Prêt ! Détection sur ${device}. Touche H : squelette, F : images/s`, 4000);
  } catch (error) {
    console.error(error);
    setStatus(`Webcam ou modèle indisponible (${error.name}) : tu peux jouer à la souris.`);
  }
}

init();
