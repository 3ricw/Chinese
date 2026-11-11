/* Original guided curriculum, storage migration, assisted recall, rewards, and
   generated views. Uses DOM/media mocks; does not measure mobile pixels/audio. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{boot}=require('./runtime.cjs');
const app=boot(),r=app.run,failures=[],views=[];let checks=0;
function check(name,fn){checks++;try{fn()}catch(e){failures.push({name,error:e.message})}}
const equal=(a,b)=>assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)));
function setup(a=app){a.run("onboardingStep=null;state.profile.setupDone=true;state.settings.soundEffects=false;closeModal();starterPreview='dragon';chooseStarter();var spoken=[];speechSynthesis.speak=u=>spoken.push(u.text)")}
function answer(good='good'){const q=r('cwCurrent()');r(`cwReveal();cwRate('${good}','${q.w.id}',${q.s.turn})`)}
function finish(){let guard=0;while(r('!!cwCurrent()')&&guard++<80){const q=r('cwCurrent()');if(q.step.kind==='teach')r(`cwReady('${q.w.id}',${q.s.turn})`);else answer()}assert(guard<80)}
(async()=>{
setup();
let now=Date.UTC(2026,10,11,12);const NativeDate=Date;
app.ctx.Date=class extends NativeDate{constructor(...a){super(...(a.length?a:[now]))}static now(){return now}};
const baseline=fs.readFileSync(path.join(__dirname,'../assets/chinese-js-06-7e120d7e299d.js'),'utf8').split('\n');
const originalWords=JSON.parse(baseline[1].slice('const CW_WORDS='.length,-1)),originalGroups=JSON.parse(baseline[0].slice('const CW_GROUPS='.length,-1));
check('all 600 original word IDs, scripts, examples and meanings are unchanged',()=>equal(r('CW_WORDS'),originalWords));
check('all 20 original categories are retained',()=>equal(r('CW_GROUPS'),originalGroups));
check('guided path has 20 five-word lessons with 100 distinct existing IDs',()=>{assert.equal(r('CW_UNITS.length'),20);assert(r('CW_UNITS.every(u=>u.words.length===5&&u.words.every(id=>CW_BY_ID[id]))'));assert.equal(r('new Set(CW_UNITS.flatMap(u=>u.words)).size'),100)});
const units=r('CW_UNITS'),by=r('CW_BY_ID');
let knownS=[],knownT=[];
function segment(line,words){const text=line.replace(/[^\u3400-\u9fff]/g,''),ends=new Set([0]);for(let i=0;i<text.length;i++)if(ends.has(i))for(const word of words)if(text.startsWith(word,i))ends.add(i+word.length);return ends.has(text.length)}
for(const u of units){
 knownS.push(...u.words.map(id=>by[id].s));knownT.push(...u.words.map(id=>by[id].t));
 check(u.id+' reading introduces no words outside its lesson and earlier lessons',()=>{for(const l of u.lines){assert(segment(l.s,knownS),l.s);assert(segment(l.t,knownT),l.t)}});
 check(u.id+' puts all five targets in connected reading',()=>{const s=u.lines.map(l=>l.s).join('');for(const id of u.words)assert(s.includes(by[id].s),id)});
 check(u.id+' has paired scripts, sentence pinyin, translations and a valid meaning check',()=>{assert(u.usage.length>30);assert(u.lines.length>=3&&u.lines.length<=4);for(const l of u.lines){assert.equal(l.s.length,l.t.length);assert(l.p&&l.en)}assert.equal(u.check.options.length,3);assert.equal(u.check.optionsT.length,3);assert(u.check.answer>=0&&u.check.answer<3)});
}
r("navigate('common')");check('default hub presents one lesson and keeps the library one control away',()=>{assert(app.html().includes('Say how you are'));assert(!app.html().includes('id="cw-list"'));assert(app.html().includes('Word library · 600'));assert(!app.html().includes('<details class="cw-unit-picker" open'))});
views.push({name:'words/guided-hub',html:app.html()});
r("cwSetHubMode('library');cwSetQuery('guanxi')");check('pinyin search still finds the whole-word traditional form 關係',()=>{assert(r('cwMatching().some(w=>w.s==="关系"&&w.t==="關係")'))});
r("cwSetQuery('聯繫')");check('traditional search still distinguishes 聯繫',()=>assert(r('cwMatching().some(w=>w.s==="联系"&&w.t==="聯繫")')));
r('cwClearFilters()');views.push({name:'words/library',html:app.html()});
r("cwPickUnit('cw-lesson-01');cwStartUnit('cw-lesson-01')");const characters=r('JSON.stringify(state.cards)');
check('an introduction creates no mastery, answers, XP or daily-goal credit',()=>{assert.equal(r('cwStats().started'),0);assert.equal(r('cwStats().familiar'),0);assert.equal(r('cwDesk().session.attempts'),0);assert(r('Object.values(cwDesk().records).every(p=>!p.seen&&!p.stage)'))});
finish();check('the first introduced five remain learning after immediate recall',()=>{assert.equal(r('cwDesk().session.right'),0);assert(r('CW_UNITS[0].words.every(id=>cwStatus(id)==="learning"&&cwDesk().records[id].stage===0)'))});
check('word learning never masters component characters',()=>assert.equal(r('JSON.stringify(state.cards)'),characters));
check('fresh lesson completion offers a dialogue and a specific next lesson',()=>{assert(app.html().includes('Read your words in a dialogue'));assert(app.html().includes('Next lesson · Say who you are'))});
views.push({name:'words/introduced-completion',html:app.html()});
r("navigate('common')");check('after finishing a lesson the hub suggests the next new lesson',()=>assert(app.html().includes('Say who you are')));
r("navigate('commonPractice')");
const xp=r('bx.xp'),goal=r('state.activity[dayKey()].cards'),pet=r('state.companion.xp');
r("cwStartUnit('cw-lesson-01',true)");finish();check('replaying a lesson cannot farm learner XP, companion XP, or the daily goal',()=>{assert.equal(r('bx.xp'),xp);assert.equal(r('state.companion.xp'),pet);assert.equal(r('state.activity[dayKey()].cards'),goal)});
check('supported review schedules a future review instead of staying overdue',()=>assert(r('CW_UNITS[0].words.every(id=>cwDesk().records[id].due>Date.now())')));
check('starting a new session cannot turn same-day exposure into independent recall',()=>assert.equal(r('cwDesk().session.right'),0));
now+=86400000;r("cwStartUnit('cw-lesson-01',true)");finish();check('unassisted recall on the next day advances once',()=>assert(r('CW_UNITS[0].words.every(id=>cwDesk().records[id].stage===1)')));
now+=86400000;r("cwStartUnit('cw-lesson-01',true)");finish();check('a second separate day of unassisted recall builds familiarity',()=>assert(r('CW_UNITS[0].words.every(id=>cwStatus(id)==="familiar")')));
r("cwStartUnit('cw-lesson-02',true)");const initial=r('cwCurrent()');answer('again');
while(r('cwCurrent()?.w.id')!==initial.w.id&&r('!!cwCurrent()'))answer();
answer();check('a correct missed-word repeat does not become an independent success',()=>{assert.equal(r(`cwDesk().records['${initial.w.id}'].stage`),0);assert.equal(r(`cwDesk().records['${initial.w.id}'].correct`),0)});
const attempts=r('cwDesk().session.attempts');r(`cwRate('good','${initial.w.id}',${initial.s.turn})`);check('a duplicate/stale answer cannot advance the current session',()=>assert.equal(r('cwDesk().session.attempts'),attempts));
r("cwStart('single','cw-02-01')");let q=r('cwCurrent()');r(`cwReady('${q.w.id}',${q.s.turn})`);answer('again');r("cwStart('missed')");answer();check('a separate missed-word session is still supported practice',()=>assert.equal(r('cwDesk().session.right'),0));
now+=86400000;r("cwStart('single','cw-04-05')");q=r('cwCurrent()');if(q.step.kind==='teach')r(`cwReady('${q.w.id}',${q.s.turn})`);answer();now+=86400000;
r("cwStart('single','cw-04-05');navigate('common');cwDetail('cw-04-05');closeModal();navigate('commonPractice')");answer();check('a lookup while practice is paused still marks the recall assisted',()=>assert.equal(r("cwDesk().records['cw-04-05'].stage"),0));
now+=86400000;r("cwStart('single','cw-04-05');navigate('common');cwListen('cw-04-05');navigate('commonPractice')");answer();check('explicit audio while practice is paused cannot count as unassisted recall',()=>assert.equal(r("cwDesk().records['cw-04-05'].stage"),0));
r("cwStartUnit('cw-lesson-03',true)");q=r('cwCurrent()');r("cwStartUnit('cw-lesson-03',true)");check('new sessions have distinct callback guards even at the same clock time',()=>assert(r('cwCurrent().s.turn')>q.s.turn));
r(`cwReady('${q.w.id}',${q.s.turn});cwRate('good','${q.w.id}',${q.s.turn})`);check('stale callbacks from replaced sessions do nothing',()=>assert.equal(r('cwDesk().session.pos'),0));
const knowledge=r('JSON.stringify({cards:state.cards,words:Object.fromEntries(Object.entries(cwDesk().records).filter(([,p])=>p.seen).map(([id,p])=>[id,[p.seen,p.stage,p.correct,p.advanceDay]])),xp:bx.xp,pet:state.companion.xp})');
const spoken=r('spoken.length');r("cwOpenContext('cw-lesson-03')");let token=r('cwContextTurn');
check('reading a dialogue starts no automatic audio',()=>assert.equal(r('spoken.length'),spoken));
r(`cwContextAnswer('cw-lesson-03',2,${token});cwContextAnswer('cw-lesson-03',2,${token})`);
check('meaning checks, browsing and duplicate submissions grant no mastery or rewards',()=>assert.equal(r('JSON.stringify({cards:state.cards,words:Object.fromEntries(Object.entries(cwDesk().records).filter(([,p])=>p.seen).map(([id,p])=>[id,[p.seen,p.stage,p.correct,p.advanceDay]])),xp:bx.xp,pet:state.companion.xp})'),knowledge));
r("cwOpenContext('cw-lesson-04')");r(`cwContextAnswer('cw-lesson-03',0,${token})`);check('a closed dialogue callback cannot affect a different dialogue',()=>assert(!r('cwContextActive.checked')));
for(const script of ['simplified','traditional'])for(const unit of units){
 r(`state.settings.script='${script}';cwOpenContext('${unit.id}')`);views.push({name:'words/'+script+'/'+unit.id+'/dialogue',html:app.nodes.get('overlay').innerHTML});
 check(script+'/'+unit.id+' pairs each sentence with a clearly labeled audio button',()=>{const h=app.nodes.get('overlay').innerHTML;assert.equal((h.match(/aria-label="Listen to sentence /g)||[]).length,unit.lines.length);assert(!h.includes('<mark>'));assert(h.includes('Pinyin &amp; meaning'));assert(h.includes('<summary>Usage</summary>'))});
 r('closeModal()');r(`cwStartUnit('${unit.id}',true)`);views.push({name:'words/'+script+'/'+unit.id+'/recall',html:app.html()});
}
r("closeModal();cwStartUnit('cw-lesson-12');save()");const unitSession=r('cwDesk().session'),sanitized=r('validateState(state).commonWords');
check('backup sanitization preserves stable lesson IDs and exposure days',()=>{assert.equal(sanitized.session.unit,'cw-lesson-12');assert(Object.values(sanitized.records).some(p=>p.exposureDay));equal(sanitized.session,unitSession)});
check('unknown lesson IDs are discarded without losing valid word records or steps',()=>{const d=r("cwValidate({...cwDesk(),session:{...cwDesk().session,unit:'bad-lesson'}})");assert(!d.session.unit);equal(d.records,r('cwDesk().records'));equal(d.session.steps,unitSession.steps)});
const restored=boot(Object.fromEntries(app.storage));check('reopening still starts at Home and keeps the saved word lesson',()=>{assert.equal(restored.run('currentView'),'home');assert.equal(restored.run('cwDesk().session.unit'),'cw-lesson-12');equal(restored.run('cwDesk().records'),r('cwDesk().records'))});
const id=r('cwCurrent().w.id'),credit=r(`cwDesk().records['${id}']?.creditDay||''`),exposure=r(`cwDesk().records['${id}'].exposureDay`);
r(`cwUnlearn('${id}')`);check('return to New keeps anti-farming and exposure guards',()=>{assert.equal(r(`cwDesk().records['${id}'].creditDay`),credit);assert.equal(r(`cwDesk().records['${id}'].exposureDay`),exposure);assert.equal(r(`cwStatus('${id}')`),'new')});
r("navigate('home');state.settings.companionMessages=true;renderHome()");const home=app.html();
check('companion ring is inside a stable art stage and the caption is outside it',()=>{const stage=home.indexOf('class="rx-buddy-stage"'),ring=home.indexOf('class="ax-goal-orbit"'),note=home.indexOf('id="rx-buddy-note"');assert(stage>=0&&ring>stage&&note>ring);assert(home.slice(ring,note).includes('</button></div><p'))});
const beforePet=r('JSON.stringify({xp:bx.xp,pet:state.companion.xp,activity:state.activity,cards:state.cards})');
for(let i=0;i<12;i++)r('rxPetBuddy()');check('companion taps keep varied notes and cannot give rewards',()=>{assert(app.nodes.get('rx-buddy-note').textContent.length>10);assert.equal(r('JSON.stringify({xp:bx.xp,pet:state.companion.xp,activity:state.activity,cards:state.cards})'),beforePet)});
r('state.settings.companionMessages=false;renderHome()');check('disabled companion messages take no caption space',()=>assert(/id="rx-buddy-note"[^>]*hidden/.test(app.html())));
const index=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),design=fs.readFileSync(path.join(__dirname,'..',index.match(/href="([^"]+)" id="ax-design"/)[1]),'utf8');
check('sidebar stays inset, fixed to the viewport, with scrollable navigation',()=>{for(const token of ['position:fixed!important;flex-direction:column','height:calc(100dvh - 24px)','width:213px','overflow-y:auto;overscroll-behavior:contain','sidebar-bottom{flex-shrink:0'])assert(design.includes(token),token)});
check('empty and filled captions use the same reserved height',()=>{assert(design.includes('.rx-home-calm .rx-buddy-note{'));assert(design.includes('min-height:4.5em;height:4.5em'));assert(design.includes('.rx-buddy-note[hidden]{display:none!important}'))});
check('guided practice and companions log no runtime errors',()=>equal(app.errors,[]));
// Exercise the actual backup UI handlers, not only their validators.
r("closeModal();cwStartUnit('cw-lesson-07');save()");
let exportedBlob;app.ctx.URL={createObjectURL:b=>{exportedBlob=b;return 'blob:word-backup'},revokeObjectURL(){}};r('exportBackup()');const exported=JSON.parse(await exportedBlob.text());
check('real backup export includes lesson, word progress and exposure guards',()=>{assert.equal(exported.commonWords.session.unit,'cw-lesson-07');assert(Object.values(exported.commonWords.records).some(p=>p.exposureDay));assert(exported.commonWords.saved)});
const imported=boot();setup(imported);const backup=JSON.stringify(exported);await imported.nodes.get('backup-file').onchange({target:{files:[{size:Buffer.byteLength(backup),text:async()=>backup}],value:'words.json'}});
check('real backup import keeps guided-session identity and all word records',()=>{equal(imported.run('cwDesk().records'),exported.commonWords.records);equal(imported.run('cwDesk().session'),exported.commonWords.session)});
check('word sessions remain shared when switching courses',()=>{const data=imported.run('JSON.stringify(cwDesk())');imported.run("switchCourse('chinese-2');switchCourse('chinese-1')");assert.equal(imported.run('JSON.stringify(cwDesk())'),data)});
function key(key,target='DIV'){const e={key,target:{tagName:target},defaultPrevented:false,preventDefault(){this.defaultPrevented=true},stopImmediatePropagation(){}};for(const f of app.events.keydown||[])f(e);return e}
r("closeModal();cwStartUnit('cw-lesson-11',true)");key('h');check('H marks a word recall assisted',()=>assert(r('cwCurrent().s.usedHint')));key(' ');check('Space reveals without advancing',()=>assert(r('cwCurrent().s.revealed&&cwDesk().session.pos===0')));key('3');check('3 grades one supported answer',()=>assert(r('cwDesk().session.pos===1&&cwDesk().session.right===0')));
const pos=r('cwDesk().session.pos');key(' ', 'INPUT');check('typing in a field does not trigger practice controls',()=>assert.equal(r('cwDesk().session.pos'),pos));
key('d');const detailSpeech=r('spoken.length');key('l');check('modal focus blocks hidden keyboard answers and audio',()=>{assert.equal(r('cwDesk().session.pos'),pos);assert.equal(r('spoken.length'),detailSpeech)});
r("closeModal();navigate('home');state.settings.palette='black';state.settings.theme='dark';save()");const seed=Object.fromEntries(app.storage),themeRestore=boot(seed);
check('a saved Ink palette stays Ink instead of being forcibly reset to Jade',()=>assert(themeRestore.run("state.settings.palette==='black'&&state.settings.theme==='dark'")));
r("cwPickUnit('cw-lesson-20');resetProgress();navigate('common')");check('reset clears word records, exposure history and saved sessions',()=>assert(r('Object.keys(cwDesk().records).length===0&&cwDesk().session===null')));
check('reset returns the guided path to its first lesson while preserving palette and companions',()=>{assert(app.html().includes('Say how you are'));assert.equal(r('state.settings.palette'),'black');assert(r('Object.keys(state.companion.roster).length>=1'))});
const result={checks,failed:failures.length,failures,lessons:units.length,guidedWords:100,readingLines:units.reduce((s,u)=>s+u.lines.length,0),method:'Node DOM/media mocks, controlled-vocabulary checks, compatible storage validation, generated HTML; no browser layout/audio testing',browserTested:false};
fs.mkdirSync(path.join(__dirname,'results'),{recursive:true});fs.writeFileSync(path.join(__dirname,'results/word-lessons.json'),JSON.stringify(result,null,2));fs.writeFileSync(path.join(__dirname,'results/word-lessons-views.json'),JSON.stringify(views));console.log(JSON.stringify(result));if(failures.length)process.exitCode=1;

})().catch(e=>{console.error(e);process.exitCode=1});
