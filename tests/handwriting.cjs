// Tests orchestration and progress safety using a controlled Hanzi Writer callback mock.
// Does not claim to test the library's geometry recognition, a real pointer, or browser layout.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {boot}=require('./runtime.cjs');let passed=0;
function check(name,fn){try{fn();passed++}catch(e){console.error(name);throw e}}
const app=boot(),r=app.run,views=[];
r(`onboardingStep=null;state.profile.setupDone=true;closeModal();state.settings.soundEffects=false;var testWriters=[];window.HanziWriter={create:(el,ch,options)=>{const w={el,ch,options,cancelQuiz(){this.cancelled=true},pauseAnimation(){},quiz(q){this.q=q;return Promise.resolve()}};testWriters.push(w);return w}};`);
const flush=async()=>{for(let i=0;i<5;i++)await Promise.resolve()};
function capture(name){views.push({name,html:app.html()})}
function key(key,extra={}){const e={key,target:{tagName:'DIV'},preventDefault(){this.defaultPrevented=true},...extra};app.ctx.handlePracticeKeydown(e);return e}
async function complete(){r('testWriters.at(-1).q.onComplete({totalMistakes:0})');await flush()}
(async()=>{
 r("openChapter('1')");capture('chapter/full');check('full chapter primary and checked option visible',()=>assert(app.html().includes('Practice full chapter')&&app.html().includes('Write to answer')));
 r("startWrittenChapter('1')");await flush();capture('required/blank');
 check('full chapter includes all cards',()=>assert.equal(r('session.queue.length'),r("uniqueCards('1').length")));
 check('target hidden before writing',()=>assert(!app.html().includes('class="han"')));
 check('checker has no visible outline',()=>assert.equal(r('testWriters.at(-1).options.showOutline'),false));
 check('hints disabled and directional check on',()=>assert.equal(r('testWriters.at(-1).q.showHintAfterMisses'),false));
 check('cannot mark blank answer correct',()=>{r("rate('good')");assert.equal(r('session.pos'),0);assert.equal(r('session.attempts'),0)});
 check('keyboard cannot bypass blank check',()=>{key('3');key('Enter');assert.equal(r('session.pos'),0)});
 const stale=r('testWriters.at(-1)');
 await complete();capture('required/checked');check('live completion unlocks answer',()=>assert(r('inkPassed(session)&&session.revealed')));
 check('correct detection alone does not grant reward',()=>assert.equal(r('session.attempts'),0));
 const first=r('session.queue[0].character');r("rate('good')");await flush();
 check('correct advances exactly one card',()=>assert.equal(r('session.pos'),1));
 check('first written recall is not mastery',()=>assert.equal(r(`state.cards[${JSON.stringify(first)}].memoryStage`),1));
 stale.q.onComplete({totalMistakes:0});check('old callback cannot finish next card',()=>assert(!r('inkPassed(session)')));
 check('rapid double Correct cannot answer next card',()=>{r("rate('good')");assert.equal(r('session.pos'),1)});
 r('testWriters.at(-1).q.onMistake({})');check('rejected stroke counts as assistance',()=>assert(r('session.usedHint')));
 await complete();r("rate('good')");await flush();check('assisted answer is Almost',()=>assert.equal(r('session.lastRatings[session.queue[1].character]'),'hard'));
 r('inkModel()');await flush();capture('required/model');check('model marks help',()=>assert(r('session.usedHint')));
 key('Backspace');await flush();check('restart keeps assistance flag',()=>assert(r('session.usedHint')));
 const pos=r('session.pos');key('1');await flush();check('skip advances as Again',()=>assert.equal(r('session.pos'),pos+1));
 const pending=r('testWriters.at(-1)');r("navigate('home')");pending.q.onComplete({totalMistakes:0});check('navigation invalidates callback',()=>assert(!r('inkPassed(session)')));
 r("startWrittenChapter('1')");await flush();await complete();r('checkpointCurrent();save()');
 check('restored success flag does not unlock Correct',()=>assert(!r('decodeResume(savedResume).data.revealed')));
 const seed=Object.fromEntries(app.storage),restored=boot(seed);restored.run('onboardingStep=null;closeModal();resumeSession()');check('resume keeps required writing',()=>assert(restored.run('session.writeToAnswer')));check('resume requires current card again',()=>assert(!restored.run('inkPassed(session)')));
 const pendingCourse=r('testWriters.at(-1)');r("switchCourse('chinese-2');startWrittenChapter('c2-11')");await flush();pendingCourse.q.onComplete({totalMistakes:0});check('course switch invalidates callbacks',()=>assert(!r('inkPassed(session)')));check('Chinese 2 full pool',()=>assert.equal(r('session.queue.length'),23));
 r("state.settings.script='traditional';startWrittenChapter('c2-11')");await flush();capture('required/traditional');check('checker follows chosen script',()=>assert.equal(r('testWriters.at(-1).ch'),r('han(session.queue[session.pos])')));
 r("state.settings.script='simplified';startWriting('c2-11','words');writeSession.queue=[{target:'天气',pinyin:'tiān qì',meaning:'weather'}];writeSession.checkedWriting=true;renderWritingSession()");await flush();capture('word/first-character');
 check('word starts at first character',()=>assert.equal(r('testWriters.at(-1).ch'),'天'));
 await complete();capture('word/second-character');check('first character alone cannot pass word',()=>assert(!r('inkPassed(writeSession)')));check('word advances to second character',()=>assert.equal(r('testWriters.at(-1).ch'),'气'));
 await complete();capture('word/checked');check('whole word unlocks Correct',()=>assert(r('inkPassed(writeSession)')));
 const cards=r('JSON.stringify(state.cards)');r('rateWriting(true)');check('word writing does not manufacture character knowledge',()=>assert.equal(r('JSON.stringify(state.cards)'),cards));
 r("startWriting('c2-11');writeSession.checkedWriting=true;writeSession.inkCopies=3;renderWritingSession()");await flush();
 await complete();capture('checked/auto-repeat');check('three-copy mode opens next copy automatically',()=>assert.equal(r('writeSession.ink.copies'),1));check('extra copies are helped repetition',()=>assert(r('writeSession.usedHint')));
 await complete();await complete();check('three copies finish one answer',()=>assert(r('inkPassed(writeSession)')));check('copies do not create three rewards',()=>assert.equal(r('writeSession.attempts'),0));
 r('rateWriting(true)');await flush();check('repetition receives no independent correct credit',()=>assert.equal(r('writeSession.right'),0));
 // Clear, preview and pointer behavior share one implementation across Sketch and Draw.
 r("startSession('all','c2-11');openPracticeSketch();memoryPadStrokes().push([[.1,.1],[.5,.5]]);var copyRewards=JSON.stringify(state.companion);var copyCards=JSON.stringify(state.cards)");key('e');capture('sketch/recent-copy');
 check('E saves a copy and clears',()=>assert.equal(r('memoryPadStrokes().length'),0));check('copy preview retained',()=>assert.equal(r('session.freeCopies.items.length'),1));
 for(let i=0;i<5;i++)r('memoryPadStrokes().push([[.2,.2],[.8,.8]]);inkNextCopy()');check('only three recent copies retained',()=>assert.equal(r('session.freeCopies.items.length'),3));
 check('repetition changes no character knowledge',()=>assert.equal(r('JSON.stringify(state.cards)'),r('copyCards')));check('repetition changes no companion rewards',()=>assert.equal(r('JSON.stringify(state.companion)'),r('copyRewards')));
 r('memoryPadStrokes().push([[.2,.2]]);memoryPadStrokes().push([[.7,.7]])');key('z');check('Z undoes one stroke',()=>assert.equal(r('memoryPadStrokes().length'),1));key('Backspace');check('Backspace clears current pad',()=>assert.equal(r('memoryPadStrokes().length'),0));
 r('memoryPadStrokes().push([[.2,.2]])');key('e',{target:{tagName:'INPUT'}});check('shortcut pauses while typing',()=>assert.equal(r('memoryPadStrokes().length'),1));key('e',{ctrlKey:true});check('shortcut preserves browser modifiers',()=>assert.equal(r('memoryPadStrokes().length'),1));
 r("startWriting('c2-11');writeSession.checkedWriting=false;renderWritingSession();writeSession.strokes=[[[.1,.1],[.2,.2]]]");key('e');capture('draw/recent-copy');check('E works in Draw too',()=>assert.equal(r('writeSession.strokes.length'),0));
 check('copy data survives sanitized resume',()=>assert.equal(r('decodeResume(savedResume).data.freeCopies.items.length'),1));
 r("var pad=$('write-canvas');pad.onpointerdown({pointerId:1,isPrimary:true,button:0,clientX:10,clientY:10,preventDefault(){}});pad.onpointerdown({pointerId:2,isPrimary:false,button:0,clientX:80,clientY:10,preventDefault(){}})");check('secondary touch cannot add a palm stroke',()=>assert.equal(r('writeSession.strokes.length'),1));
 r("pad.onpointermove({pointerId:1,clientX:100,clientY:100,preventDefault(){},getCoalescedEvents:()=>[{clientX:30,clientY:30},{clientX:60,clientY:60}]});pad.onpointerup({pointerId:1})");check('coalesced points retained',()=>assert.equal(r('writeSession.strokes[0].length'),3));
 r("navigate('home');var previousStrokes=writeSession.strokes.length;pad.onpointerdown({pointerId:3,button:0,clientX:5,clientY:5,preventDefault(){}})");check('old canvas cannot change paused session',()=>assert.equal(r('writeSession.strokes.length'),r('previousStrokes')));
 r("startWriting('c2-11');writeSession.checkedWriting=true;renderWritingSession()");await flush();r("testWriters.at(-1).options.onLoadCharDataError()");capture('checked/offline');check('load error offers retry and skip',()=>assert(app.html().includes('Skip')&&app.nodes.get('ink-status').textContent.includes('No answer')));check('load failure grants nothing',()=>assert(!r('inkPassed(writeSession)')));
 check('old sessions default to original self-check',()=>{r("startWriting('c2-11');checkpointCurrent()");assert(!r('decodeResume(savedResume).data.checkedWriting'))});
 r("writeSession=null;flowWritingSetup={id:'c2-11',kind:'characters',prompt:'pinyin',scope:'full',checked:true};currentView='home';startConfiguredWriting()");await flush();check('configured writing uses full chapter',()=>assert.equal(r('writeSession.queue.length'),23));
 check('new writing schedule waits before mastery',()=>{assert.equal(r("inkScheduleWriting(null,'good').memoryStage"),1);assert.equal(r("inkScheduleWriting({seen:1,streak:1,interval:10/1440,due:Date.now()+60000,last:Date.now(),memoryStage:1},'good').memoryStage"),1)});
 await complete();r("rateWriting(true);undoLastAnswer()");await flush();check('undo requires a fresh handwriting check',()=>assert(!r('inkPassed(writeSession)')));
 check('fresh app preserves Draw default',()=>assert.equal(boot().run('state.settings.writingMethod'),'draw'));
 await flush();check('no runtime logged errors',()=>assert.deepEqual(app.errors,[]));
 fs.writeFileSync(path.join(__dirname,'results','handwriting-views.json'),JSON.stringify(views));
 console.log(JSON.stringify({passed,views:views.length,failed:0}));
})().catch(e=>{console.error(e);process.exitCode=1});
