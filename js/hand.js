// ===============================================================
//  DÉTECTION DE LA MAIN avec MediaPipe
// ===============================================================
import {
  FilesetResolver,
  HandLandmarker,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/vision_bundle.mjs";
import { CONFIG } from "./config.js";
import { toScreen } from "./camera.js";

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";

let landmarker = null;
let lastVideoTime = -1;
let lastHand = null;

// Charge le modèle. On essaie d'abord la carte graphique (GPU), plus rapide,
// et si ça échoue on se rabat sur le processeur (CPU).
export async function loadHandTracker() {
  const vision = await FilesetResolver.forVisionTasks(WASM_URL);

  const options = (delegate) => ({
    baseOptions: { modelAssetPath: CONFIG.MODEL_URL, delegate },
    runningMode: "VIDEO",
    numHands: 1,
  });

  try {
    landmarker = await HandLandmarker.createFromOptions(vision, options("GPU"));
    return "GPU";
  } catch (error) {
    console.warn("GPU indisponible, passage au CPU :", error);
    landmarker = await HandLandmarker.createFromOptions(vision, options("CPU"));
    return "CPU";
  }
}

// Renvoie les 21 points de la main (ou null si aucune main n'est vue).
// On n'analyse une image que si la webcam en a fourni une nouvelle.
export function detectHand(video) {
  if (!landmarker || video.readyState < 2) return null;

  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    const result = landmarker.detectForVideo(video, performance.now());
    lastHand = result.landmarks.length > 0 ? result.landmarks[0] : null;
  }
  return lastHand;
}

// Dessine le squelette de la main : les 21 points et les os qui les relient
export function drawHand(ctx, hand, layout) {
  const points = hand.map((p) => toScreen(p, layout));

  ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
  ctx.lineWidth = 3;
  for (const { start, end } of HandLandmarker.HAND_CONNECTIONS) {
    ctx.beginPath();
    ctx.moveTo(points[start].x, points[start].y);
    ctx.lineTo(points[end].x, points[end].y);
    ctx.stroke();
  }

  points.forEach((p, index) => {
    const isTip = index === CONFIG.FINGER_TIP;
    ctx.fillStyle = isTip ? CONFIG.BLADE_GLOW : "#ffffff";
    ctx.beginPath();
    ctx.arc(p.x, p.y, isTip ? 9 : 5, 0, Math.PI * 2);
    ctx.fill();
  });
}
