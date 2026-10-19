// ===============================================================
//  WEBCAM : démarrage et affichage en miroir
// ===============================================================
import { CONFIG } from "./config.js";

// Demande l'accès à la webcam et lance la vidéo
export async function startCamera(video) {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: CONFIG.VIDEO_WIDTH,
      height: CONFIG.VIDEO_HEIGHT,
      facingMode: "user",
    },
    audio: false,
  });
  video.srcObject = stream;
  await video.play();
}

// Calcule où placer la vidéo pour qu'elle remplisse tout l'écran
// sans être déformée (comme "object-fit: cover" en CSS)
export function getVideoLayout(video, width, height) {
  const scale = Math.max(width / video.videoWidth, height / video.videoHeight);
  const w = video.videoWidth * scale;
  const h = video.videoHeight * scale;
  return { x: (width - w) / 2, y: (height - h) / 2, w, h };
}

// Dessine la vidéo retournée horizontalement, comme dans un miroir
export function drawVideo(ctx, video, layout) {
  ctx.save();
  ctx.translate(layout.x + layout.w, layout.y);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, layout.w, layout.h);
  ctx.restore();
}

// MediaPipe donne des coordonnées entre 0 et 1.
// Cette fonction les transforme en pixels à l'écran (en tenant compte du miroir).
export function toScreen(point, layout) {
  return {
    x: layout.x + (1 - point.x) * layout.w,
    y: layout.y + point.y * layout.h,
  };
}
