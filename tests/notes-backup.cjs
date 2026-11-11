const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{boot}=require('./runtime.cjs');
(async()=>{
let checks=0;const failures=[];const check=(name,fn)=>{checks++;try{fn()}catch(e){failures.push({name,error:e.message})}};
const a=boot(),r=a.run,blobs=[];a.ctx.URL=class extends URL{static createObjectURL(blob){blobs.push(blob);return 'blob:test'}static revokeObjectURL(){}};
r("onboardingStep=null;state.profile.setupDone=true;closeModal();state.settings.soundEffects=false;state.memoryNotes['你']='My original character note';personalSaveNote('word','cw-01-01','My whole-word memory cue');state.bookmarks=['你'];state.settings.palette='black';state.settings.theme='light';exportBackup()");
const file=await blobs.at(-1).text(),exported=JSON.parse(file);
check('actual backup export includes both note scopes and rewards',()=>{assert.equal(exported.memoryNotes['你'],'My original character note');assert.equal(exported.commonWords.notes['cw-01-01'],'My whole-word memory cue');assert(exported.boost)});
r("resetProgress()");check('documented reset clears memory notes in both scopes',()=>assert(r('Object.keys(state.memoryNotes).length===0&&!cwDesk().notes')));
await a.nodes.get('backup-file').onchange({target:{files:[{size:Buffer.byteLength(file),text:async()=>file}]}});
check('actual file import restores character and word notes',()=>{assert.equal(r("state.memoryNotes['你']"),'My original character note');assert.equal(r("cwDesk().notes['cw-01-01']"),'My whole-word memory cue')});
check('note backup import retains saved themes and bookmarks',()=>assert(r('state.settings.palette==="black"&&state.settings.theme==="light"&&state.bookmarks.includes("你")')));
const restored=boot(Object.fromEntries(a.storage));check('imported notes survive another cold startup at Home',()=>assert(restored.run('currentView==="home"&&state.memoryNotes["你"]==="My original character note"&&cwDesk().notes["cw-01-01"]==="My whole-word memory cue"')));
r("state.cards={};state.read={};state.memoryNotes={};cwDesk().records={};personalSaveNote('word','cw-01-01','Only personal word notes');save();captureSafetyCopy('Before reset',true)");
check('a note-only common-word collection is eligible for a recovery copy',()=>{const safety=r('safetyCopyInfo()');assert(safety);assert(JSON.stringify(safety).includes('Only personal word notes'))});
r("state.cards['你']={seen:2,streak:1,interval:1,due:0,last:0};state.memoryNotes['你']='A familiar face';wristOpenSetup();wristDownloadPack()");
const watch=JSON.parse(await blobs.at(-1).text());check('actual Watch file export is a small valid practice copy with notes',()=>{assert.equal(watch.format,'erics-chinese-wrist');assert.equal(watch.version,1);assert(watch.cards.some(c=>c.id==='character:你'&&c.note==='A familiar face'));assert(!watch.boost);assert(!watch.settings);assert(Buffer.byteLength(JSON.stringify(watch))<100000)});
const blobCount=blobs.length;r('resetProgress();wristDownloadPack()');check('stale export after reset cannot leak an old practice pack',()=>assert.equal(blobs.length,blobCount));
r("closeModal();cwDesk().records={};cwLaunch('learn',[CW_WORDS[0]],'',true)");const key={key:'v',target:a.ctx.document.body,defaultPrevented:false,preventDefault(){this.defaultPrevented=true},stopImmediatePropagation(){}};
for(const fn of a.events.keydown||[])fn(key);
check('V opens the actual picture hint and marks recall supported',()=>{assert(key.defaultPrevented);assert(r('cwCurrent().s.usedHint'));assert(a.nodes.get('overlay').innerHTML.includes('wv-memory'))});
r("closeModal();navigate('home');openScrollQuickAccess();navigate('tools')");const pending=r('state.scrollSession.frames.find(f=>f.cold&&f.chosen===null)');
if(pending){r(`personalSaveNote('character','${pending.ch}','A cue');personalOpenNotebook()`);check('paused Scroll cold checks retain help from visible notes',()=>assert(r(`state.scrollSession.frames.filter(f=>f.ch==='${pending.ch}'&&f.cold&&f.chosen===null).every(f=>f.helped)`)))}else{check('paused Scroll exposure is carried into future cold-check assistance',()=>{r("personalSaveNote('character','木','A tree');personalOpenNotebook()");assert(r('state.feed.entries["木"].helpAt>0'))})}
check('backup and keyboard paths log no runtime errors',()=>assert.deepEqual(a.errors,[]));
const result={checks,failed:failures.length,failures,method:'Node DOM/media mocks; actual export Blob contents, file import callback, saved-state cold startup, reset and keyboard events',browserTested:false};fs.writeFileSync(path.join(__dirname,'results/notes-backup.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
