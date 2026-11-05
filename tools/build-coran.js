// Construit ref/coran.json (sourates 78 à 114) à partir des fichiers de ref/ :
//   - ref/quran-uthmani.txt                   Tanzil (texte affiché, non modifié)
//   - ref/quranic-corpus-morphology-0.4.txt    Quranic Arabic Corpus (segments, lemmes, racines)
//   - ref/quran-com/<sourate>.json             quran.com (sens anglais, usage personnel)
//   - ref/sens-fr.json                         sens français des éléments, écrits à la main (facultatif)
// Le résultat reste dans ref/ (jamais publié) : il est importé sur le téléphone depuis l'app.
// Usage : node tools/build-coran.js
const fs = require('fs');
const path = require('path');

const REF = path.join(__dirname, '..', 'ref');
const FIRST = 78, LAST = 114;

// Buckwalter étendu du Quranic Arabic Corpus → arabe
const BW = {
  "'": 'ء', '>': 'أ', '&': 'ؤ', '<': 'إ', '}': 'ئ', A: 'ا', b: 'ب', p: 'ة', t: 'ت', v: 'ث', j: 'ج',
  H: 'ح', x: 'خ', d: 'د', '*': 'ذ', r: 'ر', z: 'ز', s: 'س', $: 'ش', S: 'ص', D: 'ض', T: 'ط', Z: 'ظ',
  E: 'ع', g: 'غ', _: 'ـ', f: 'ف', q: 'ق', k: 'ك', l: 'ل', m: 'م', n: 'ن', h: 'ه', w: 'و', Y: 'ى', y: 'ي',
  F: 'ً', N: 'ٌ', K: 'ٍ', a: 'َ', u: 'ُ', i: 'ِ', '~': 'ّ', o: 'ْ', '`': 'ٰ', '{': 'ٱ',
  '^': 'ٓ', '#': 'ٔ', ':': 'ۜ', '@': '۟', '"': '۠', '[': 'ۢ', ';': 'ۣ', ',': 'ۥ', '.': 'ۦ',
  '!': 'ۨ', '-': '۪', '+': '۫', '%': '۬', ']': 'ۭ',
};
function bw2ar(s) {
  return [...s].map(c => {
    if (!(c in BW)) throw new Error(`Caractère Buckwalter inconnu « ${c} » dans « ${s} »`);
    return BW[c];
  }).join('');
}
// Lettres seules, pour comparer les sources (la hamza isolée du corpus correspond à « ـٔ » chez Tanzil).
const letters = s => s.normalize('NFKC').replace(/[^آ-غف-يٱ]/g, '')
  .replace(/[ٱأإآ]/g, 'ا').replace(/ى/g, 'ي');

// Préfixes et pronoms suffixes : appris une fois, comme des mots. Sens écrits ici.
const PREFIXES = {
  'Al+': { ar: 'ٱلْ', fr: 'le, la, les' },
  'w:CONJ+': { ar: 'وَ', fr: 'et' },
  'w:REM+': { ar: 'وَ', fr: 'et (reprise)' },
  'w:CIRC+': { ar: 'وَ', fr: 'alors que' },
  'w:P+': { ar: 'وَ', fr: 'par… ! (serment)' },
  'f:CONJ+': { ar: 'فَ', fr: 'puis, alors' },
  'f:REM+': { ar: 'فَ', fr: 'puis, alors' },
  'f:RSLT+': { ar: 'فَ', fr: 'donc (conséquence)' },
  'f:CAUS+': { ar: 'فَ', fr: 'car' },
  'f:SUP+': { ar: 'فَ', fr: 'alors (renforcement)' },
  'bi+': { ar: 'بِ', fr: 'par, avec, en' },
  'ka+': { ar: 'كَ', fr: 'comme' },
  'l:P+': { ar: 'لِ', fr: 'pour, à' },
  'l:PRP+': { ar: 'لِ', fr: 'pour que' },
  'l:EMPH+': { ar: 'لَ', fr: 'certes, vraiment' },
  'l:IMPV+': { ar: 'لِ', fr: 'qu\'il… ! (ordre)' },
  'A:INTG+': { ar: 'أَ', fr: 'est-ce que ?' },
  'sa+': { ar: 'سَ', fr: 'va… (futur proche)' },
  'ya+': { ar: 'يَا', fr: 'ô !' },
};
// Les préfixes de même forme et de sens voisin sont regroupés en un seul élément à apprendre.
const PREFIX_GROUP = { 'w:REM+': 'w:CONJ+', 'f:REM+': 'f:CONJ+' };
const PRONOUNS = {
// Le corpus range sous le même pronom le complément (رَبُّهُمْ « leur Seigneur ») et le sujet d'un verbe
// (يَتَسَاءَلُونَ « ils s'interrogent ») : le sens donné couvre les deux.
  '1S': { ar: 'ـِي / ـنِي', fr: 'je, moi, mon' }, '1P': { ar: 'ـنَا', fr: 'nous, notre' },
  '2MS': { ar: 'ـكَ', fr: 'tu, toi, ton' }, '2FS': { ar: 'ـكِ', fr: 'tu, toi, ton (fém.)' },
  '2MP': { ar: 'ـكُمْ', fr: 'vous, votre' }, '2D': { ar: 'ـكُمَا', fr: 'vous deux' },
  '3MS': { ar: 'ـهُ', fr: 'il, lui, son' }, '3FS': { ar: 'ـهَا', fr: 'elle, sa' },
  '3MP': { ar: 'ـهُمْ', fr: 'ils, eux, leur' }, '3FP': { ar: 'ـهُنَّ', fr: 'elles, leur' },
  '3D': { ar: 'ـهُمَا', fr: 'eux deux' },
};

// ── Lecture des sources ─────────────────────────────────────────────────────
const tanzil = {};
let tanzilHeader = '';
for (const line of fs.readFileSync(path.join(REF, 'quran-uthmani.txt'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^(\d+)\|(\d+)\|(.*)$/);
  if (!m) { if (line.startsWith('#')) tanzilHeader += line + '\n'; continue; }
  const s = +m[1];
  if (s < FIRST || s > LAST) continue;
  let words = m[3].trim().split(/\s+/);
  if (m[2] === '1') words = words.slice(4); // basmala incluse par Tanzil au verset 1
  tanzil[`${s}:${m[2]}`] = words;
}

const qcom = {};
for (let s = FIRST; s <= LAST; s++) {
  const j = JSON.parse(fs.readFileSync(path.join(REF, 'quran-com', `${s}.json`), 'utf8'));
  for (const v of j.verses) qcom[v.verse_key] = v.words.filter(w => w.char_type_name === 'word');
}

const segs = {}; // "s:a:w" → [{ form, tag, features[] }]
for (const line of fs.readFileSync(path.join(REF, 'quranic-corpus-morphology-0.4.txt'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\((\d+):(\d+):(\d+):(\d+)\)\t([^\t]*)\t([^\t]*)\t(.*)$/);
  if (!m || +m[1] < FIRST || +m[1] > LAST) continue;
  const key = `${m[1]}:${m[2]}:${m[3]}`;
  (segs[key] = segs[key] || []).push({ form: m[5], tag: m[6], features: m[7].split('|') });
}

const sensFr = fs.existsSync(path.join(REF, 'sens-fr.json'))
  ? JSON.parse(fs.readFileSync(path.join(REF, 'sens-fr.json'), 'utf8')) : {};

// ── Construction ────────────────────────────────────────────────────────────
const items = new Map(); // id → { id, kind, ar, root?, pos[], freq, en: Map, fr }
function item(id, base) {
  if (!items.has(id)) items.set(id, { id, ...base, pos: new Set(), freq: 0, en: new Map() });
  return items.get(id);
}
const verses = [];
const problems = [];

for (const vkey of Object.keys(qcom)) {
  const tz = tanzil[vkey] || [], qc = qcom[vkey];
  if (tz.length !== qc.length) problems.push(`${vkey} : ${tz.length} mots Tanzil / ${qc.length} quran.com`);
  const words = qc.map((w, i) => {
    const parts = segs[`${vkey}:${i + 1}`] || [];
    if (!parts.length) problems.push(`${vkey}:${i + 1} sans segment dans le corpus`);
    const out = { t: tz[i], en: w.translation.text, segs: [] };
    if (letters(parts.map(p => bw2ar(p.form)).join('')) !== letters(tz[i] || ''))
      problems.push(`${vkey}:${i + 1} segments ≠ texte Tanzil (${tz[i]})`);
    for (const p of parts) {
      const kind = p.features[0];
      const seg = { ar: bw2ar(p.form), kind };
      let id = null;
      if (kind === 'PREFIX') {
        const tag = p.features[1];
        const group = PREFIX_GROUP[tag] || tag;
        if (PREFIXES[group]) { id = 'P:' + group; item(id, { kind: 'prefixe', ar: PREFIXES[group].ar, fr: PREFIXES[group].fr }); }
      } else if (kind === 'SUFFIX') {
        const pron = p.features.find(f => f.startsWith('PRON:'));
        const k = pron && pron.slice(5);
        if (k && PRONOUNS[k]) { id = 'S:' + k; item(id, { kind: 'suffixe', ar: PRONOUNS[k].ar, fr: PRONOUNS[k].fr }); }
      } else {
        const lem = p.features.find(f => f.startsWith('LEM:'));
        const root = p.features.find(f => f.startsWith('ROOT:'));
        if (lem) {
          const lemAr = bw2ar(lem.slice(4).replace(/\d+$/, ''));
          id = 'L:' + lemAr;
          const it = item(id, { kind: 'mot', ar: lemAr, root: root ? bw2ar(root.slice(5)) : null, fr: '' });
          it.pos.add(p.tag);
          it.en.set(w.translation.text, (it.en.get(w.translation.text) || 0) + 1);
        }
      }
      if (id) { seg.id = id; items.get(id).freq++; }
      out.segs.push(seg);
    }
    return out;
  });
  verses.push({ key: vkey, words });
}

// Sens français : sens-fr.json prime sur les sens écrits dans ce script.
for (const it of items.values()) if (sensFr[it.id]) it.fr = sensFr[it.id];

const list = [...items.values()].sort((a, b) => b.freq - a.freq || a.id.localeCompare(b.id))
  .map((it, rank) => ({
    id: it.id, rank: rank + 1, kind: it.kind, ar: it.ar, root: it.root || undefined,
    pos: [...it.pos], freq: it.freq, fr: it.fr,
    en: [...it.en].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([t]) => t),
  }));

const data = {
  format: 'coran-v1',
  built: new Date().toISOString().slice(0, 10),
  surahs: [FIRST, LAST],
  sources: [
    { name: 'Tanzil Quran Text (Uthmani 1.1)', url: 'https://tanzil.net', license: 'CC BY 3.0, texte non modifié', notice: tanzilHeader.trim() },
    { name: 'Quranic Arabic Corpus 0.4', url: 'http://corpus.quran.com', license: 'GNU GPL, données non modifiées' },
    { name: 'quran.com (sens anglais)', url: 'https://quran.com', license: 'usage personnel et non commercial' },
  ],
  items: list,
  verses,
};
fs.writeFileSync(path.join(REF, 'coran.json'), JSON.stringify(data));

// ── Rapport ─────────────────────────────────────────────────────────────────
const byKind = k => list.filter(i => i.kind === k).length;
const missing = list.filter(i => !i.fr).length;
console.log(`Versets : ${verses.length} · mots : ${verses.reduce((n, v) => n + v.words.length, 0)}`);
console.log(`Éléments : ${list.length} (mots ${byKind('mot')}, préfixes ${byKind('prefixe')}, suffixes ${byKind('suffixe')}) · sans sens français : ${missing}`);
console.log(`Fichier : ref/coran.json (${Math.round(fs.statSync(path.join(REF, 'coran.json')).size / 1024)} Ko)`);
if (problems.length) { console.log(`${problems.length} problème(s) :`); problems.slice(0, 20).forEach(p => console.log('  ' + p)); process.exit(1); }
console.log('Aucun problème d\'alignement.');
