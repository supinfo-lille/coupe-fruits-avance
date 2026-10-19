# 🍉 Coupe-Fruits — édition avancée

Un jeu où l'on tranche des fruits avec son index, devant la webcam, grâce à la détection
de la main de **MediaPipe** (21 points de repère, en temps réel, dans le navigateur).

Cette édition s'adresse aux participants qui programment déjà : les `TODO` indiquent
**où** intervenir et **quel résultat** obtenir, sans donner le code.
Une édition guidée, avec indices détaillés, existe pour les débutants.

👉 **Lis `ETAPE.md` : il indique l'étape en cours et ce qu'il faut obtenir.**

## Lancer le projet

La webcam exige une page servie en `localhost` ou en HTTPS.

- **VS Code + Live Server** : clic droit sur `index.html` → *Open with Live Server*.
- **Ou** `npx serve` (Node.js), ou `python -m http.server 8000`.

Commence par `check.html`, qui vérifie webcam, WebGL, chargement du modèle et vitesse de détection.

## Les étapes

Chaque branche contient le projet **une fois l'étape terminée**, avec les `TODO` de l'étape suivante.
`git diff etape-03-lame etape-04-fruits` montre la solution d'une étape.

| Branche | État |
|---|---|
| `main` | Point de départ |
| `etape-01-webcam` | Webcam en miroir |
| `etape-02-main` | Squelette de la main |
| `etape-03-lame` | Traînée qui suit l'index |
| `etape-04-fruits` | Fruits soumis à la gravité |
| `etape-05-decoupe` | Découpe et score |
| `etape-06-jeu-complet` | Jeu complet : menu, vies, bombes |

## Architecture

| Fichier | Rôle |
|---|---|
| `js/config.js` | Réglages du jeu |
| `js/camera.js` | Webcam, mise à l'échelle, miroir, conversion de coordonnées |
| `js/hand.js` | MediaPipe HandLandmarker (GPU avec repli CPU) |
| `js/blade.js` | Historique des positions du doigt, vitesse |
| `js/fruits.js` | Lancer, intégration du mouvement, découpe en deux moitiés |
| `js/collision.js` | Intersection segment-cercle |
| `js/game.js` | Machine à états, score, vies, bombes, difficulté |
| `js/main.js` | Boucle de jeu (`requestAnimationFrame`) |
| `check.html`, `outils/` | Diagnostic de l'ordinateur |

Les `TODO` sont numérotés par étape. Le reste du code est volontairement lisible : lis-le avant de modifier.
