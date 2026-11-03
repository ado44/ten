# Arabe fusha — suivi des sprints

## Périmètre

**Pour qui** : moi seul, sur mon téléphone (Samsung Galaxy A15) et sur PC.
**But** : apprendre l'arabe fusha jour après jour, à raison de 30 mots et 5 phrases par jour, avec des exercices courts.

### Features
1. **Jours ouverts** : pas de fin fixe, on ajoute des jours au fil de l'eau. Le jour N se débloque quand le jour N‑1 est terminé.
2. **Mots du jour** : 30 mots, en arabe vocalisé (tashkîl) avec leur sens en français.
3. **Phrases du jour** : 5 phrases, en arabe vocalisé avec leur traduction.
4. **Exercices**, dans l'ordre :
   - **Lire** : on voit le mot arabe et on choisit le sens français (QCM) ;
   - **Retrouver** : on voit le mot français et on choisit le bon mot arabe parmi 4 (QCM) ;
   - **Écrire** : on traduit une phrase du jour au clavier arabe.
5. **Hors ligne** : l'app est installée sur l'écran d'accueil et fonctionne en mode avion (PWA).

### Non-features (refusé)
- Pas d'audio, de dialogues, de mode immersion ni de bloc prononciation.
- Pas de compte, de serveur ni de synchronisation entre appareils : la progression reste dans le navigateur.
- Pas de dialecte égyptien : l'ancien contenu est supprimé (il reste consultable dans l'historique Git).

## Organisation
- Sprints courts, une branche par sprint (`sprint-1`, `sprint-2`…). Démo, rétro et commit en fin de sprint.
- Fusion dans `main` seulement avec mon accord. **Attention** : GitHub Pages sert `main/docs`, donc la démo hors ligne sur le téléphone demande une fusion.

## Décisions

| Décision | Options | Choix |
|---|---|---|
| Stack | vanilla dans un seul `index.html` / framework | **vanilla, un seul fichier** (inchangé) |
| Hors ligne | PWA (manifest + service worker) / fichier local | **PWA**, cache « cache-first » avec un numéro de version à incrémenter à chaque publication |
| Hébergement | GitHub Pages (`main/docs`) | **GitHub Pages** (inchangé) |
| Affichage | arabe vocalisé / translittération / les deux | **arabe vocalisé** (pas de translittération pour l'instant) |
| Exercices QCM | distracteurs écrits à la main / tirés au hasard | **tirés au hasard** parmi les 30 mots du jour, donc aucune donnée d'exercice à écrire |
| Écriture | translittération / clavier arabe / ordre des mots | **clavier arabe** ; la correction ignore les voyelles et unifie les variantes (أ/إ/آ→ا, ة→ه, ى→ي, ponctuation, espaces) |
| Police arabe | système / police embarquée (Amiri, Noto Naskh) | **système** d'abord ; on embarque une police si le tashkîl s'affiche mal sur l'A15 |
| Progression | clé `localStorage` | nouvelle clé `arabe_fusha_v1` (on repart de zéro) |

## Risques
- **Tashkîl illisible ou mal placé** avec la police système d'Android → plan B : embarquer une police arabe (woff2) dans `docs/`, qui sera mise en cache par le service worker.
- **Correction de l'écriture trop stricte** (hamza, ordre des mots) → plan B : accepter plusieurs réponses par phrase et garder « Passer » / « Voir la réponse ».
- **Ancienne version qui reste en cache** après une publication → numéro de version dans `sw.js` et nettoyage des anciens caches à l'activation.

## Sprints

### Sprint 1 — Nettoyage et hors ligne
But : une app allégée, sans audio, installable et utilisable en mode avion.
- [x] Supprimer `docs/words/`, `docs/phrases/`, `docs/dialogues/` et `docs/ret.txt`
- [x] Retirer de `index.html` l'audio, l'immersion, les dialogues et le bloc prononciation
- [x] Nouveau modèle de données : `words: [{ ar, fr, note? }]` et `phrases: [{ ar, fr, accept? }]` ; jours sans limite fixe
- [x] Quelques jours de contenu provisoire, pour tester (jour 1 : 30 mots ; jour 2 : 10 mots)
- [x] L'exercice d'écoute devient « Lire » (arabe → français, 10 questions et 4 choix tirés au hasard), avancé du sprint 2 parce qu'il dépendait de l'audio. « Écrire » est retiré jusqu'au sprint 2.
- [x] `manifest.json`, icônes 192/512 et `sw.js`, enregistrés depuis `index.html`
- [ ] Démo : je l'installe sur l'A15, je passe en mode avion, l'app s'ouvre et garde ma progression

### Sprint 2 — Exercices
But : le parcours complet d'un jour (Mots → Lire → Retrouver → Écrire → Terminé).
- [ ] Essai jetable : saisie au clavier arabe sur l'A15 et normalisation de la réponse
- [ ] Exercice « Lire » (arabe → français) et exercice « Retrouver » (français → arabe), générés au hasard
- [ ] Exercice « Écrire » au clavier arabe (`dir="rtl"`, `lang="ar"`), avec correction tolérante
- [ ] Démo : je termine un jour entier sur le téléphone

### Sprint 3 — Contenu fusha
But : des vrais jours de contenu.
- [ ] Choisir ensemble le type de mots et de phrases, ainsi que la progression
- [ ] Rédiger les premiers jours (30 mots et 5 phrases par jour, vocalisés et relus)
- [ ] Démo : je fais le jour 1 en conditions réelles

## Rétros
_(à remplir en fin de sprint)_
