// ===============================================================
//  DIAGNOSTIC : vérifie que l'ordinateur peut faire tourner le jeu.
//  Ce fichier est autonome : il ne dépend pas du code de l'atelier.
// ===============================================================
import {
  FilesetResolver,
  HandLandmarker,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/vision_bundle.mjs";

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

const list = document.getElementById("checks");
const verdict = document.getElementById("verdict");
const video = document.getElementById("webcam");
const canvas = document.getElementById("preview");
const ctx = canvas.getContext("2d");

let landmarker = null;
let lastVideoTime = -1;
let lastHand = null;
let detections = 0;

function addCheck(label) {
  const li = document.createElement("li");
  li.className = "wait";
  li.textContent = label;
  list.appendChild(li);
  return (ok, detail = "") => {
    li.className = ok ? "ok" : "ko";
    li.textContent = detail ? `${label} : ${detail}` : label;
  };
}

function detect() {
  if (!landmarker || video.currentTime === lastVideoTime) return lastHand;
  lastVideoTime = video.currentTime;
  const result = landmarker.detectForVideo(video, performance.now());
  lastHand = result.landmarks[0] || null;
  detections++;
  return lastHand;
}

// Affiche la webcam en miroir, et les points de la main quand le modèle est prêt
function preview() {
  if (video.videoWidth > 0) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    const hand = detect();
    if (hand) {
      ctx.fillStyle = "#ff7a59";
      for (const p of hand) {
        ctx.beginPath();
        ctx.arc((1 - p.x) * canvas.width, p.y * canvas.height, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  requestAnimationFrame(preview);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  const secure = addCheck("Page ouverte en local ou en HTTPS");
  secure(
    window.isSecureContext,
    window.isSecureContext ? "" : "ouvre la page via Live Server ou npx serve, pas en double-cliquant le fichier"
  );

  const gl = addCheck("Accélération graphique (WebGL2)");
  gl(!!document.createElement("canvas").getContext("webgl2"));

  const cam = addCheck("Webcam");
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: "user" },
      audio: false,
    });
    video.srcObject = stream;
    await video.play();
    cam(true, `${video.videoWidth}×${video.videoHeight}`);
    requestAnimationFrame(preview);
  } catch (error) {
    const reasons = {
      NotAllowedError: "accès refusé : clique sur l'icône caméra dans la barre d'adresse pour l'autoriser",
      NotFoundError: "aucune webcam trouvée",
      NotReadableError: "webcam déjà utilisée par une autre application (Teams, Zoom…)",
    };
    cam(false, reasons[error.name] || error.name);
    verdict.textContent = "Sans webcam, on peut quand même jouer à la souris.";
    return;
  }

  const model = addCheck("Modèle de détection de la main (peut prendre 10 à 30 s)");
  let device = "GPU";
  try {
    const vision = await FilesetResolver.forVisionTasks(WASM_URL);
    const options = (delegate) => ({
      baseOptions: { modelAssetPath: MODEL_URL, delegate },
      runningMode: "VIDEO",
      numHands: 1,
    });
    try {
      landmarker = await HandLandmarker.createFromOptions(vision, options("GPU"));
    } catch {
      device = "CPU";
      landmarker = await HandLandmarker.createFromOptions(vision, options("CPU"));
    }
    model(true, `chargé, calcul sur ${device}`);
  } catch (error) {
    console.error(error);
    model(false, "impossible de le télécharger (réseau ou pare-feu ?)");
    return;
  }

  const speed = addCheck("Vitesse de détection (montre ta main 5 s)");
  const startCount = detections;
  const start = performance.now();
  await wait(5000);
  const perSecond = (detections - startCount) / ((performance.now() - start) / 1000);
  speed(perSecond >= 15, `${perSecond.toFixed(1)} analyses par seconde`);

  if (perSecond >= 20) verdict.textContent = "👍 Cet ordinateur fera tourner le jeu confortablement.";
  else if (perSecond >= 15) verdict.textContent = "🙂 Jouable. Baisse VIDEO_WIDTH et VIDEO_HEIGHT dans js/config.js si besoin.";
  else verdict.textContent = "🐢 Trop lent : baisse la résolution dans js/config.js (320×240) ou joue à la souris.";
}

run().catch((error) => {
  console.error(error);
  verdict.textContent = `Erreur inattendue : ${error.message}`;
});
