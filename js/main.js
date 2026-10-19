// ===============================================================
//  POINT D'ENTRÉE : prépare tout, puis lance la boucle d'affichage
// ===============================================================
import { startCamera, getVideoLayout, drawVideo } from "./camera.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const video = document.getElementById("webcam");
const statusBox = document.getElementById("status");

let width = 0;
let height = 0;
let cameraReady = false;

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

function drawBackground() {
  if (cameraReady) {
    drawVideo(ctx, video, getVideoLayout(video, width, height));
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
function loop() {
  drawBackground();
  requestAnimationFrame(loop);
}

async function init() {
  resize();
  window.addEventListener("resize", resize);
  await document.fonts.ready;
  requestAnimationFrame(loop);

  try {
    setStatus("Ouverture de la webcam…");
    await startCamera(video);
    cameraReady = true;
    setStatus("");
  } catch (error) {
    console.error(error);
    setStatus(error.message);
  }
}

init();
