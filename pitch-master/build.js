#!/usr/bin/env node
/* MEETENGINE master-pitch builder.
 * data/*.json + template.html -> index.html (master) или cuts/pitch-<client>/ (срез).
 * Дек НИКОГДА не редактируется руками в HTML — только через data/*.json, потом node build.js.
 *
 *  node build.js                 # пересобрать мастер-дек (index.html) из data
 *  node build.js --client="ADVANZA" --segments=event --angles=высота-ЛПР,охват --objections=1,2,6,9,14,15,17
 */
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');

function readJSON(f){ return JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')); }
function loadData(){
  return {
    meta: readJSON('meta.json'),
    cases: readJSON('cases.json'),
    brands: readJSON('brands.json'),
    niches: readJSON('niches.json'),
    prices: readJSON('prices.json'),
    objections: readJSON('objections.json'),
    founder: readJSON('founder.json'),
  };
}
function parseArgs(argv){
  const o = {};
  argv.slice(2).forEach(a => {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) o[m[1]] = m[2];
  });
  return o;
}
function list(v){ return v ? v.split(',').map(s => s.trim()).filter(Boolean) : []; }
function slug(s){ return String(s).toLowerCase().replace(/[^a-z0-9а-яё]+/gi,'-').replace(/^-|-$/g,''); }

function filterForCut(D, args){
  const segs = list(args.segments);
  const angs = list(args.angles);
  const objs = list(args.objections).map(Number);

  function caseKeep(c){
    if (!segs.length && !angs.length) return true;
    const segHit = segs.length && (c.segments||[]).some(s => segs.includes(s));
    const angHit = angs.length && angs.includes(c.angle);
    return segHit || angHit;
  }
  if (segs.length || angs.length){
    D.cases.hero = D.cases.hero.filter(caseKeep);
    D.cases.grid = D.cases.grid.filter(caseKeep);
  }
  if (segs.length){
    D.niches.segments = D.niches.segments.filter(n => (n.segments||[]).some(s => segs.includes(s)));
    if (!D.niches.segments.length) D.niches.segments = readJSON('niches.json').segments; // не оставлять пусто
  }
  if (objs.length){
    D.objections.steps = D.objections.steps.filter(s => objs.includes(s.id));
  }
  D.meta.client = args.client || null;
  return D;
}

function build(D, title, outDir){
  const tpl = fs.readFileSync(path.join(ROOT, 'template.html'), 'utf8');
  const html = tpl
    .replace('__TITLE__', title)
    .replace('__DECK_DATA__', JSON.stringify(D));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  // assets
  const srcAssets = path.join(ROOT, 'assets');
  const dstAssets = path.join(outDir, 'assets');
  if (outDir !== ROOT && fs.existsSync(srcAssets)){
    fs.mkdirSync(dstAssets, { recursive: true });
    for (const f of fs.readdirSync(srcAssets)) fs.copyFileSync(path.join(srcAssets, f), path.join(dstAssets, f));
  }
  return path.join(outDir, 'index.html');
}

const args = parseArgs(process.argv);
const D = loadData();

if (args.client){
  const S = slug(args.client);
  const cut = filterForCut(D, args);
  const out = path.join(ROOT, 'cuts', 'pitch-' + S);
  const file = build(cut, 'MEETENGINE — ' + args.client, out);
  console.log('Срез собран: ' + file);
  console.log('  сегменты: ' + (args.segments||'все') + ' · углы: ' + (args.angles||'все') + ' · возражения: ' + (args.objections||'все'));
  console.log('  кейсов: ' + cut.cases.hero.length + ' хиро + ' + cut.cases.grid.length + ' грид · ступеней: ' + cut.objections.steps.length);
} else {
  const file = build(D, 'MEETENGINE', ROOT);
  console.log('Мастер-дек пересобран: ' + file);
  console.log('  хиро-кейсов: ' + D.cases.hero.length + ' · грид: ' + D.cases.grid.length + ' · табло: ' + D.brands.tablo.length + ' · ступеней: ' + D.objections.steps.length);
}
