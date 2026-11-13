// Vérifie le contenu fusha de docs/index.html : comptes, doublons, mots déjà connus, longueur des phrases.
// Usage : node tools/check-fusha.js docs/index.html
const h = require('fs').readFileSync(process.argv[2], 'utf8');
const js = h.split('<script>')[1].split('</script>')[0];
new Function(js);
const ctx = {};
const fakeStorage = { getItem: () => null, setItem() {}, removeItem() {} };
new Function('ctx', 'localStorage', js.replace(/\nrender\(\);[\s\S]*$/, '') + ';ctx.DAYS = DAYS; ctx.KNOWN = KNOWN_WORDS; ctx.bareWord = bareWord;')(ctx, fakeStorage);

// Même comparaison que dans l'app : voyelles internes gardées (مَنْ ≠ مِنْ), terminaison et tanwîn ignorés.
const n = ctx.bareWord;
const KNOWN = ctx.KNOWN.map(n);
// Exceptions décidées ensemble : mot nouveau malgré la même forme qu'un mot connu.
const ALLOWED = ['الْيَوْمَ'];   // « aujourd'hui », distinct de يَوْمٌ « jour » (SPRINTS.md)
const MAX_WORDS = { 1: 4 };   // semaine → mots max par phrase
let pb = 0; const seen = {};
for (const d of ctx.DAYS) {
  const week = Math.ceil(d.id / 7);
  console.log(`Jour ${d.id} (semaine ${week}) : ${d.words.length} mots, ${d.phrases.length} phrases`);
  if (d.words.length !== 30 || d.phrases.length !== 5) { console.log('  ! compte incorrect'); pb++; }
  const fr = new Set(), ar = new Set();
  for (const w of d.words) {
    const k = n(w.ar);
    if (KNOWN.includes(k) && !ALLOWED.includes(w.ar)) { console.log('  ! déjà connu :', w.ar); pb++; }
    if (seen[k]) { console.log('  ! doublon avec le jour', seen[k], ':', w.ar); pb++; }
    if (ar.has(k) || fr.has(w.fr)) { console.log('  ! doublon dans le jour :', w.ar, w.fr); pb++; }
    seen[k] = seen[k] || d.id; ar.add(k); fr.add(w.fr);
  }
  for (const p of d.phrases) {
    const len = p.ar.replace(/[؟?….!،]/g, '').trim().split(/\s+/).length;
    if (MAX_WORDS[week] && len > MAX_WORDS[week]) { console.log(`  ! phrase de ${len} mots :`, p.ar); pb++; }
  }
}
console.log(pb ? pb + ' problème(s)' : 'OK : aucun doublon, comptes et longueurs respectés');
process.exit(pb ? 1 : 0);
