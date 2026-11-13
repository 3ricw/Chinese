/* Original geometric recognizer against handwritten and transformed fixtures.
   This is not an accuracy benchmark or a real Watch drawing test. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),context={atob:s=>Buffer.from(s,'base64').toString('binary'),setTimeout},checks=[],failures=[],timings=[];
vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'assets/draw-model.js'),'utf8'),context);vm.runInContext(fs.readFileSync(path.join(root,'assets/draw-recognizer.js'),'utf8'),context);
function check(name,fn){checks.push(name);try{fn()}catch(e){failures.push({name,error:e.message})}}
function match(strokes,limit=8){const start=performance.now(),r=context.DrawRecognizer.match(strokes,limit);timings.push(performance.now()-start);return r}
const fixtures={
 一:[[[.1,.5],[.9,.5]]],
 十:[[[.15,.42],[.85,.42]],[[.5,.1],[.5,.9]]],
 口:[[[.2,.2],[.2,.8]],[[.2,.2],[.8,.2],[.8,.8]],[[.2,.8],[.8,.8]]],
 木:[[[.2,.35],[.8,.35]],[[.5,.1],[.5,.9]],[[.5,.35],[.36,.6],[.1,.8]],[[.5,.35],[.67,.61],[.9,.8]]],
 人:[[[.55,.1],[.42,.5],[.1,.9]],[[.48,.4],[.66,.7],[.9,.9]]],
 大:[[[.15,.4],[.85,.4]],[[.5,.1],[.46,.5],[.15,.9]],[[.48,.5],[.7,.8],[.9,.9]]],
 土:[[[.25,.4],[.75,.4]],[[.5,.15],[.5,.8]],[[.1,.8],[.9,.8]]],
 日:[[[.3,.15],[.3,.85]],[[.3,.15],[.7,.15],[.7,.85]],[[.3,.5],[.7,.5]],[[.3,.85],[.7,.85]]],
 田:[[[.2,.2],[.2,.8]],[[.2,.2],[.8,.2],[.8,.8]],[[.2,.5],[.8,.5]],[[.5,.2],[.5,.8]],[[.2,.8],[.8,.8]]]
};
check('the independently distributed model covers 9,507 character entries',()=>assert.equal(context.DRAW_MODEL.chars.length,9507));
check('descriptor offsets are bounded three-byte feature ranges',()=>{const bytes=Buffer.from(context.DRAW_MODEL.substrokes,'base64').length;assert(context.DRAW_MODEL.chars.every(r=>r[2]>0&&r[3]>=0&&r[3]+r[2]*3<=bytes))});
const ranks={};
for(const [ch,strokes]of Object.entries(fixtures)){
 const before=JSON.stringify(strokes),rows=match(strokes);ranks[ch]=rows.map(x=>x.character);
 check(ch+' is offered among the first three for the handwritten fixture',()=>assert(rows.slice(0,3).some(x=>x.character===ch)));
 check(ch+' suggestions have unique characters and finite ascending geometric scores',()=>{assert.equal(rows.length,8);assert.equal(new Set(rows.map(x=>x.character)).size,rows.length);assert(rows.every((r,i)=>Number.isFinite(r.score)&&r.score>=0&&(!i||r.score>=rows[i-1].score)))});
 check(ch+' matching leaves the captured strokes unchanged',()=>assert.equal(JSON.stringify(strokes),before));
 const shifted=strokes.map(s=>s.map(p=>[p[0]*.55+.3,p[1]*.55+.1])),small=match(shifted);
 check(ch+' remains offered after translation and uniform resizing',()=>assert(small.slice(0,3).some(x=>x.character===ch)));
 const dense=strokes.map(s=>{const out=[];for(let i=1;i<s.length;i++)for(let k=0;k<12;k++)out.push([s[i-1][0]+(s[i][0]-s[i-1][0])*k/12,s[i-1][1]+(s[i][1]-s[i-1][1])*k/12]);out.push(s.at(-1));return out}),sampled=match(dense);
 check(ch+' remains offered with densely sampled pointer coordinates',()=>assert(sampled.slice(0,3).some(x=>x.character===ch)));
}
for(const [name,value]of [
 ['empty',[]],['missing',null],['wrong container',{}],['one point',[[[.5,.5]]]],['repeated points',[[[.5,.5],[.5,.5],[.5,.5]]]],
 ['negative coordinate',[[[-.1,.5],[.8,.5]]]],['outside canvas',[[[.1,.5],[1.1,.5]]]],['non-finite',[[[.1,.5],[Infinity,.5]]]],['wrong point width',[[[.1,.5,1],[.8,.5]]]],
 ['too many strokes',Array.from({length:65},()=>[[.1,.5],[.9,.5]])],['too many stroke points',[Array.from({length:513},(_,i)=>[i/512,.5])]],['too many total points',Array.from({length:17},()=>Array.from({length:512},(_,i)=>[i/511,.5]))]
])check(name+' is rejected without fabricated candidates',()=>assert.equal(match(value).length,0));
check('requested candidate count is honored',()=>assert.equal(match(fixtures.木,3).length,3));
check('unbounded candidate requests are capped',()=>assert.equal(match(fixtures.木,10000).length,16));
check('same input returns deterministic candidate ordering',()=>assert.equal(match(fixtures.木).map(x=>x.character).join(''),ranks.木.join('')));
const realModel=context.DRAW_MODEL;
context.DRAW_MODEL=undefined;check('a missing model returns no candidates',()=>assert.equal(match(fixtures.一).length,0));
context.DRAW_MODEL={chars:[],substrokes:'broken!'};check('an unreadable or empty model remains recoverable',()=>assert.equal(match(fixtures.一).length,0));
context.DRAW_MODEL={chars:[['一',1,1,1e9],['口',-1,1,0],['many',1,1,0]],substrokes:'AAAA'};check('invalid model rows cannot read outside descriptor data',()=>assert.equal(match(fixtures.一).length,0));
context.DRAW_MODEL=realModel;check('loading a valid model after a failed attempt recovers recognition',()=>assert.equal(match(fixtures.一,1)[0].character,'一'));
check('the recognizer has no storage, learning, rewards, fetch, or speech API',()=>{const source=fs.readFileSync(path.join(root,'assets/draw-recognizer.js'),'utf8');assert(!/\b(?:localStorage|sessionStorage|fetch|XMLHttpRequest|speechSynthesis|awardXP|state\.cards)\b/.test(source))});
(async()=>{
let yielded=0;context.setTimeout=fn=>setTimeout(()=>{yielded++;fn()},0);
const asynchronous=await context.DrawRecognizer.matchAsync(fixtures.木,8);
check('chunked matching has exactly the same scores and ordering',()=>assert.equal(JSON.stringify(asynchronous),JSON.stringify(match(fixtures.木,8))));
check('chunked matching yields between bounded scoring batches',()=>assert(yielded>1));
let cancelChecks=0;const cancelled=await context.DrawRecognizer.matchAsync(fixtures.田,8,()=>++cancelChecks>2);
check('cancelling an in-progress lookup returns no stale candidates',()=>assert.equal(cancelled.length,0));
let called=0;const preCancelled=await context.DrawRecognizer.matchAsync(fixtures.木,8,()=>{called++;return true});
check('a pre-cancelled lookup does not start recognition',()=>{assert.equal(preCancelled.length,0);assert.equal(called,1)});
const result={checks:checks.length,failed:failures.length,failures,fixtureRanks:ranks,modelCharacters:realModel.chars.length,timing:{coldAndWarmMaxMs:Math.round(Math.max(...timings)),method:'Single Node process; model decode included in first call, not browser/Watch latency'},method:'Actual independent engine against nine manually drawn geometries, resizing, dense sampling, input/model bounds, and recovery; no device accuracy benchmark',browserTested:false,watchDeviceTested:false};
fs.mkdirSync(path.join(__dirname,'results'),{recursive:true});fs.writeFileSync(path.join(__dirname,'results/draw-recognizer.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(failures.length)process.exitCode=1;

})().catch(error=>{console.error(error.stack);process.exitCode=1});
