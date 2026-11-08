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
- Fusion dans `main` seulement avec mon accord. **Attention** : GitHub Pages publie la racine de `main`, et l'app est à **https://ado44.github.io/ten/docs/**. La démo sur le téléphone demande donc une fusion.

## Décisions

| Décision | Options | Choix |
|---|---|---|
| Stack | vanilla dans un seul `index.html` / framework | **vanilla, un seul fichier** (inchangé) |
| Hors ligne | PWA (manifest + service worker) / fichier local | **PWA**, cache « cache-first » avec un numéro de version à incrémenter à chaque publication |
| Hébergement | GitHub Pages | **GitHub Pages**, racine de `main`, app sous `/ten/docs/` (inchangé) |
| Affichage | arabe vocalisé / translittération / les deux | **arabe vocalisé** (pas de translittération pour l'instant) |
| Exercices QCM | distracteurs écrits à la main / tirés au hasard | **tirés au hasard** parmi les 30 mots du jour, donc aucune donnée d'exercice à écrire |
| Écriture | translittération / clavier arabe / ordre des mots | **clavier arabe** ; la correction ignore les voyelles et unifie les variantes (أ/إ/آ→ا, ة→ه, ى→ي, ponctuation, espaces) |
| Police arabe | système / police embarquée (Amiri, Noto Naskh) | **système** d'abord ; on embarque une police si le tashkîl s'affiche mal sur l'A15 |
| Progression | clé `localStorage` | `arabe_fusha_v2` depuis le contenu définitif (changer la clé = remise à zéro) |

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
- [x] Démo : je l'installe sur l'A15, je passe en mode avion, l'app s'ouvre et garde ma progression

### Sprint 2 — Exercices
But : le parcours complet d'un jour (Mots → Lire → Retrouver → Écrire → Terminé).
- [x] Essai jetable : saisie au clavier arabe sur l'A15 et normalisation de la réponse (page de test sur claude.ai, validée sur le téléphone)
- [x] Exercice « Lire » (arabe → français) et exercice « Retrouver » (français → arabe), générés au hasard (une seule fonction QCM, 10 questions, 4 choix)
- [x] Exercice « Écrire » au clavier arabe (`dir="rtl"`, `lang="ar"`), avec correction tolérante et le champ `accept` pour les variantes ; bouton « Voir la réponse »
- [x] `sw.js` passé en `v2`
- [x] Démo : je termine un jour entier sur le téléphone

### Sprint 3 — Contenu fusha
But : des vrais jours de contenu.
- [x] Choisir ensemble le type de mots et de phrases, ainsi que la progression (voir « Règles de contenu » ci-dessous)
- [ ] Rédiger les premiers jours (30 mots et 5 phrases par jour, vocalisés et relus), en les soumettant jour par jour avant de les intégrer
  - [x] Jour 1 (le réveil et le programme du jour) et jour 2 (le frigo et la cuisine), validés puis intégrés ; contenu provisoire supprimé
  - [x] Vérification automatique : 30 mots et 5 phrases par jour, aucun doublon avec les mots déjà connus ni entre les jours, phrases de 4 mots au plus (semaine 1)
  - [x] Notes : texte plus lisible, passages arabes isolés (`<bdi>`) pour garder le bon sens de lecture ; `sw.js` passé en `v3`
  - [ ] Jours 3 à 7 de la semaine 1
- [ ] Démo : je fais le jour 1 en conditions réelles

#### Règles de contenu
**But** : parler une fusha naturelle avec mon entourage (des personnes qui apprennent elles aussi la fusha) : petites conversations, questions, parler de ma journée, de mon état d'esprit et de mon niveau, écouter une conversation puis y entrer pour poser une question ou demander une précision.

- **Une situation par jour**, tirée de la vie courante. Les 30 mots du jour permettent d'avoir cette conversation et de la varier.
- **Uniquement des mots qui servent vraiment** : verbes et objets du quotidien (le réveil, le frigo, les colocs, les cours), petits mots naturels (« franchement », « et toi ? »), mots pour montrer qu'on comprend, qu'on doute ou qu'on n'a pas compris, et connecteurs pour lier les idées ou gagner du temps. Pas de vocabulaire de manuel.
- **Utilisable dès le jour 1** : les phrases n'emploient que les mots du jour, ceux des jours précédents et les mots déjà connus.
- **Masculin par défaut** (la personne à qui on parle et moi qui parle), avec une note pour le féminin si besoin.
- **Pas de futur au début** : le moment se dit avec des mots de temps (الْآنَ, بَعْدَ قَلِيلٍ, لَاحِقًا…).
- **Une expression figée compte pour un mot** (ex. مَا مَعْنَى…؟).
- **Naturel à l'oral** : chaque mot doit être employé par quelqu'un de fluent quand il parle fusha, pas seulement correct à l'écrit. Ce critère a fait remplacer آهِ par حَسَنًا et بَعْدُ par لَيْسَ بَعْدُ au jour 1.

**Progression par semaine** (les 7 jours d'une semaine gardent le même niveau, seule la situation change) :

| Semaine | Grammaire | Phrases |
|---|---|---|
| 1 | « je » au présent, questions, « mon » / « ton », négation لَا | 2 à 4 mots, une seule idée |
| 2 | + « tu » et « nous » au présent | 4 à 6 mots, deux idées (ثُمَّ, لَكِنْ) |
| 3 | + « il » / « elle », puis le passé | phrases liées (لِأَنَّ, عِنْدَمَا) |
| 4 | + le futur | phrases plus longues et nuancées |

**Situations de la semaine 1** : 1. le réveil et le programme du jour · 2. le frigo et la cuisine · 3. la maison avec les colocs · 4. les cours et mon niveau · 5. mon état d'esprit · 6. sortir · 7. entrer dans une conversation.

#### Mots déjà connus
Ils viennent de la liste de l'ancien `ret.txt`, sans « Tayeb », retiré par moi. Ils ne comptent **jamais** dans les 30 mots du jour, mais ils peuvent apparaître dans les phrases. Chaque nouveau jour est vérifié contre cette liste et contre les jours précédents, pour éviter les doublons.

| Connu (égyptien) | Forme fusha utilisée | Sens |
|---|---|---|
| Ana | أَنَا | je, moi |
| Sa7 | صَحِيحٌ | vrai, exact |
| 3ala | عَلَى | sur |
| Yowm | يَوْمٌ | jour |
| Nas | نَاسٌ | gens |
| Ragel | رَجُلٌ | homme |
| Bint | بِنْتٌ | fille |
| Balad | بَلَدٌ | pays |
| Leila | لَيْلَةٌ | nuit, soirée |
| Dohr | ظُهْرٌ | midi |
| Floos | نُقُودٌ (فُلُوسٌ est compris) | argent |
| Ya3ni | يَعْنِي | c'est-à-dire, enfin |
| Shokran | شُكْرًا | merci |
| Habibi | حَبِيبِي | mon cher |
| Inshallah | إِنْ شَاءَ اللّٰهُ | si Dieu le veut |
| Aywa | نَعَمْ | oui |
| La' | لَا | non, et la négation لَا devant un verbe |
| Ma3lesh | لَا بَأْسَ | ce n'est pas grave |
| Yallah | هَيَّا | allez, on y va |
| Khalas | يَكْفِي / انْتَهَى | ça suffit / c'est fini |

À ne pas confondre : الْيَوْمَ « aujourd'hui » est un mot nouveau, même s'il vient de يَوْمٌ « jour ».

### Sprint 4 — Volet Coran (sourates 78 à 114)
But : comprendre directement le sens des mots des sourates que je connais par cœur. Je connais déjà le sens des versets, mais pas celui de chaque mot.
- Section à part dans l'app (sélecteur **Fusha | Coran**), avec sa propre progression et sa propre sauvegarde. Les sprints fusha (jours 3 à 7) sont en pause.
- **Séances de 20 lemmes**, classés par fréquence dans les sourates 78 à 114, avec des versets tirés au hasard (pas d'ordre de sourate : c'est de la compréhension, pas du par cœur).
- Toucher un mot affiche sa **décomposition** (préfixes وَ, فَ, بِ, لِ, الْ… + mot + suffixe). Les préfixes s'apprennent une seule fois, comme des mots.
- Les mots déjà vus dans les jours fusha sont signalés comme connus. Pas d'audio.

- [x] Sources vérifiées (licences) et alignées : 564 versets, 2 308 mots, mêmes lettres dans les trois sources
- [x] Essai jetable : affichage du rasm uthmani sur l'A15 → **Amiri Quran** retenue (embarquée dans `docs/fonts/`, licence OFL jointe), police du téléphone en option
- [x] `tools/build-coran.js` : aligne les trois sources, vérifie chaque mot (2 303 / 2 308 identiques signe par signe ; les 5 autres sont la hamza ـَٔ écrite autrement) et écrit `ref/coran.json`
- [ ] Sens français : 200 premiers mots + 17 préfixes + 10 pronoms faits (≈ 12 séances, 68 % des mots du texte entièrement compris) ; **638 mots restants**, en pause : je teste d'abord quelques jours. À relire par moi avec quran.com, en priorité قَدْر, أُمّ, قَتَلَ, حَقَّ, أَغْنَتْ, حُطَمَة, تَلَى.
- [x] « Nous » de majesté : ـنَا est marqué emploi par emploi (30 fois Allah, 2 fois un « nous » ordinaire en 79:10-11)
- Pour mettre à jour les sens sur le téléphone : `node tools/build-coran.js`, puis renvoyer `ref/coran.json` et « Remplacer le fichier coran.json » dans l'app (les mots appris restent appris).
- [x] Écran Coran : import du fichier, séance de 20 éléments (Mots → Sens → Versets), décomposition au toucher, mots déjà vus en fusha reconnus (comparaison avec voyelles internes + exception pour les homographes)
- [ ] Démo : je fais une séance de 20 mots sur le téléphone, hors ligne

#### Sources du Coran
| Source | Usage | Licence | Où |
|---|---|---|---|
| Tanzil (Uthmani 1.1) | texte affiché | CC BY 3.0 : texte non modifié, source citée avec un lien | `ref/quran-uthmani.txt` |
| Quranic Arabic Corpus 0.4 | lemmes, racines, préfixes | GNU : fichier non modifié, source citée avec un lien | `ref/quranic-corpus-morphology-0.4.txt` |
| quran.com (API v4) | sens des mots en anglais | usage personnel uniquement : **jamais publié** | `ref/quran-com/` (requêtes lancées par moi) |

- `ref/` est dans `.gitignore`. Les données dérivées de quran.com ne vont **jamais** dans `docs/` ni sur GitHub : elles arrivent sur le téléphone par un fichier importé dans l'app.
- Le fichier Tanzil met la basmala dans le verset 1 de chaque sourate, contrairement aux deux autres sources : on la retire avant d'aligner.
- Chiffres : 839 lemmes au total ; les 20 premiers couvrent 30 % des mots, les 100 premiers 55 %, les 300 premiers 76 %.

### Sprint 5 — Volet Lecture
But : prendre l'habitude de lire, puis lire sans voyelles. Les voyelles disparaissent au fur et à mesure que j'apprends la règle ou le mot qui permet de les deviner.
- **Une leçon = une règle de terminaison + un texte de plusieurs lignes** (écrit par Claude, avec aussi des mots pas encore vus).
- Chaque mot du texte est annoté `#n` (la règle qui fixe sa voyelle finale). Les terminaisons des règles vues disparaissent. Les mots déjà appris en fusha perdent leurs voyelles internes. La chadda reste tant que le mot n'est pas connu.
- Toucher un mot affiche sa forme complète et la règle de sa terminaison. Pas d'exercice pour l'instant.

- [x] Leçons 1 à 3 : après une préposition (-i/-in), complément du nom (-i/-in, et après مَعَ, بَعْدَ, قَبْلَ…), sujet et attribut (-u/-un)
- **Un seul texte par leçon, long (~40 lignes)**, sur un thème choisi par moi (histoire, etc.). **Une leçon par jour** : la suivante s'ouvre le lendemain du jour où j'ai terminé la précédente.
- [x] Leçon 1 : « L'histoire de Rome », 40 lignes, 298 mots (progression Lecture remise à zéro : clé `lecture_state_v2`)
- **Thèmes : les grandes villes du Moyen-Orient**, une par leçon.
- [x] Leçon 2 : « L'histoire de Jérusalem » (40 lignes, 279 mots ; récit factuel, neutre sur la période moderne)
- [x] Leçon 3 : « Damas » (40 lignes, 266 mots)
- [x] Leçon 4 : « Bagdad », règle du complément (-a/-an) (45 lignes, 326 mots ; textes rallongés quand le sujet le demande)
- [ ] Leçon 5 (le verbe au présent, -u) : prochaine ville à choisir (Le Caire, La Mecque, Médine, Istanbul, Beyrouth…)
- [ ] Leçons suivantes : le complément (-a/-an), le verbe au présent (-u) ; les textes 1 à 3 sont déjà annotés pour ces règles
- [ ] Démo : je lis les 3 textes sur le téléphone
- À retenir : si GitHub Pages ne se met pas à jour après un push (aucun « pages build and deployment » pour le commit), le relancer avec un commit vide sur `main`.

## Rétros

### Sprint 1 — 2026-11-03
**Livré** : passage à la fusha (contenu provisoire, jours 1-2), audio, dialogues et immersion supprimés, exercice « Lire » généré au hasard, PWA installée sur l'A15 et fonctionnelle en mode avion. Le tashkîl s'affiche bien avec la police système, donc pas besoin d'embarquer une police.

**Ce qui a bloqué** :
- Dans le bac à sable de Claude, Chrome headless ne peut pas utiliser CacheStorage (« Unexpected internal error »). Le test hors ligne a donc été fait à la main sur PC (DevTools → Offline), puis sur le téléphone.
- J'ai cru à une erreur 404 sur GitHub Pages parce que j'avais vérifié la mauvaise adresse : l'app est sous `/ten/docs/`.

**À retenir** :
- Incrémenter `VERSION` dans `docs/sw.js` à **chaque** publication, sinon le téléphone garde l'ancienne version.
- Tests automatisés : Chrome headless piloté en CDP (scratchpad) pour le parcours et les captures ; hors ligne testé à la main.
- Adresse de vérification après publication : `https://ado44.github.io/ten/docs/`.

### Sprint 2 — 2026-11-03
**Livré** : parcours complet d'une journée (Mots → Lire → Retrouver → Écrire → Terminé). Les deux QCM passent par une seule fonction. « Écrire » utilise le clavier arabe, avec une correction tolérante et un bouton « Voir la réponse ». Testé sur l'A15, y compris hors ligne.

**Ce qui a bloqué** : rien. L'essai jetable publié sur claude.ai a permis de valider le clavier du téléphone sans fusionner dans `main`.

**À retenir** :
- Pour tester sur le téléphone sans publier sur GitHub Pages, une page d'essai publiée sur claude.ai suffit.
- La v2 met environ 50 s à être servie par GitHub Pages après le push.
- Il n'y a toujours pas de contenu définitif : c'est l'objet du sprint 3.
