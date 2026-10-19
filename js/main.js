// ===============================================================
//  POINT D'ENTRÉE : prépare tout, puis lance la boucle d'affichage
// ===============================================================
import { startCamera, getVideoLayout, drawVideo, toScreen } from "./camera.js";
import { CONFIG } from "./config.js";
import { loadHandTracker, detectHand, drawHand } from "./hand.js";
import { addBladePoint, updateBlade, drawBlade } from "./blade.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const video = document.getElementById("webcam");
const statusBox = document.getElementById("status");

let width = 0;
let height = 0;
let cameraReady = false;
let showSkeleton = false; // touche H

function setStatus(message) {
  statusBox.textContent = message;
}

// Adapte le canvas à la taille de la fenêtre
function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

function drawBackground(layout) {
  if (layout) {
    drawVideo(ctx, video, layout);
  } else {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#312e81");
    gradient.addColorStop(1, "#1e1b4b");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#ffffff";
    ctx.font = `${Math.min(width, height) * 0.08}px "Bungee", "Arial Black", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Coupe-Fruits", width / 2, height / 2);
  }
}

// La boucle d'affichage : appelée environ 60 fois par seconde
function loop(timestamp) {
  const time = timestamp / 1000; // le temps, en secondes
  const layout = cameraReady ? getVideoLayout(video, width, height) : null;

  const hand = cameraReady ? detectHand(video) : null;
  if (hand) {
    // TODO étape 3 : le point CONFIG.FINGER_TIP, converti en pixels écran, alimente la lame.
  }
  updateBlade(time);

  drawBackground(layout);
  if (showSkeleton && hand) drawHand(ctx, hand, layout);
  drawBlade(ctx, time);

  requestAnimationFrame(loop);
}

async function init() {
  resize();
  window.addEventListener("resize", resize);

  // La souris (ou le doigt sur un écran tactile) sert aussi de lame : pratique pour tester
  canvas.addEventListener("pointermove", (event) => {
    addBladePoint(event.clientX, event.clientY, performance.now() / 1000);
  });

  // Touche H : afficher ou cacher le squelette de la main
  window.addEventListener("keydown", (event) => {
    if (event.key === "h" || event.key === "H") showSkeleton = !showSkeleton;
  });
  await document.fonts.ready;
  requestAnimationFrame(loop);

  try {
    setStatus("Ouverture de la webcam…");
    await startCamera(video);
    cameraReady = true;
    setStatus("Chargement du modèle de détection de la main…");
    const device = await loadHandTracker();
    setStatus(`Prêt ! Détection sur ${device}. Touche H : squelette`);
    setTimeout(() => setStatus(""), 3000);
  } catch (error) {
    console.error(error);
    setStatus(error.message);
  }
}

init();
