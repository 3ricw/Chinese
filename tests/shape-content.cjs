// Content invariants: every visual puzzle is grounded in the existing character catalog.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {boot}=require('./runtime.cjs');const app=boot();const root=path.join(__dirname,'..');const shapeRef=fs.readFileSync(path.join(root,'index.html'),'utf8').match(/src="(assets\/shape-challenges(?:-[a-f0-9]{12})?\.js)"/)?.[1]||'assets/shape-challenges.js';const source=fs.readFileSync(path.join(root,shapeRef),'utf8');const ctx=vm.createContext({});vm.runInContext(source,ctx);const transforms=vm.runInContext('SHAPE_TRANSFORMS',ctx),puzzles=vm.runInContext('COMPONENT_CHALLENGES',ctx);let checks=0;
const cards=app.run('CARDS.map(c=>({character:c.character,lesson:c.lesson,p:memoryParts(c)}))'),catalog=new Map(cards.map(c=>[c.character,c]));
const ids=new Set();for(const item of [...transforms,...puzzles]){assert(!ids.has(item.id));ids.add(item.id);checks++}
for(const t of transforms){assert(catalog.has(t.from));assert(catalog.has(t.to));assert.equal(catalog.get(t.to).lesson,t.lesson);assert(t.prompt.length>10&&t.explanation.length>15);checks++}
const layout={'⿰':'left-right','⿱':'top-bottom','⿴':'enclosure','⿵':'enclosure'};
for(const p of puzzles){const c=catalog.get(p.target);assert(c?.p);assert.equal(p.lesson,c.lesson);assert.equal(p.layout,layout[c.p.tree.op]);assert.equal(JSON.stringify(p.parts),JSON.stringify(c.p.tree.children.map(n=>n.glyph)));assert(p.parts.every(x=>x!=='？'&&[...x].length===1));assert(p.clue&&p.explanation);checks++}
for(const id of app.run('CHAPTERS.map(c=>c[0])')){assert(puzzles.some(p=>p.lesson===id));checks++}
console.log(JSON.stringify({checks,transforms:transforms.length,puzzles:puzzles.length,lessons:new Set(puzzles.map(p=>p.lesson)).size,failed:0}));
