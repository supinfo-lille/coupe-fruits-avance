// ===============================================================
//  WEBCAM : démarrage et affichage en miroir
// ===============================================================
import { CONFIG } from "./config.js";

// Demande l'accès à la webcam et lance la vidéo
export async function startCamera(video) {
  // TODO étape 1 : obtenir le flux de la caméra frontale, sans audio, à la résolution
  // définie dans CONFIG, l'attacher à l'élément <video> et attendre le début de la lecture.
  // Supprime ensuite le throw.
  throw new Error("Étape 1 à faire : complète startCamera() dans js/camera.js");
}

// Calcule où placer la vidéo pour qu'elle remplisse tout l'écran
// sans être déformée (comme "object-fit: cover" en CSS)
export function getVideoLayout(video, width, height) {
  const scale = Math.max(width / video.videoWidth, height / video.videoHeight);
  const w = video.videoWidth * scale;
  const h = video.videoHeight * scale;
  return { x: (width - w) / 2, y: (height - h) / 2, w, h };
}

// Dessine la vidéo dans le canvas
export function drawVideo(ctx, video, layout) {
  ctx.save();
  // TODO étape 1 : afficher l'image en miroir horizontal (transformations du contexte 2D),
  // sans changer la zone occupée à l'écran (layout).
  ctx.drawImage(video, layout.x, layout.y, layout.w, layout.h);
  ctx.restore();
}
