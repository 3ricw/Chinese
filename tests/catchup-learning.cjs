/* Real catch-up callbacks and storage with DOM/media mocks; no device QA. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{boot}=require('./runtime.cjs');
const checks=[],failures=[],views=[],key='hanzi-reading-room-v2';
function check(name,fn){checks.push(name);try{fn()}catch(e){failures.push({name,error:e.message})}}
function setup(){const a=boot(),r=a.run;r("onboardingStep=null;state.profile.setupDone=true;state.settings.soundEffects=false;closeModal();switchCourse('chinese-2');openChapter('c2-13');catchupOpen()");return a}
function plan(a,from='2',to='c2-12',target='c2-13',pace=8){return a.run(`catchupConfigure(${JSON.stringify(from)},${JSON.stringify(to)},${JSON.stringify(target)},${pace})`)}
function capture(a,name){views.push({name:'catchup/'+name,html:a.html()})}
function finish(a){let guard=0;while(!a.run('session.done')&&guard++<150){if(a.run('memoryIsStudy()'))a.run('memoryAdvanceStudy()');else if(a.run('memoryIsMatch()'))a.run('memoryChooseCharacter(session.memoryCoach.steps[session.pos].ch);memoryAdvanceMatch()');else a.run("reveal();rate('good')")}assert(guard<150,'Unbounded set')}
(async()=>{
 const a=setup(),r=a.run;capture(a,'setup');const before=r('JSON.stringify({cards:state.cards,words:state.commonWords,pet:state.companion,xp:bx.xp})');
 check('setup states the recognition scope without promising full-course mastery',()=>{assert(a.html().includes('character recognition'));assert(a.html().includes('Chapter words, passages, grammar, and writing'))});
 check('a cross-course missed range is accepted',()=>assert(plan(a)));
 capture(a,'plan');
 check('planning does not change shared knowledge or award XP',()=>assert.equal(r('JSON.stringify({cards:state.cards,words:state.commonWords,pet:state.companion,xp:bx.xp})'),before));
 check('active course and current class chapter stay selected',()=>assert(r("selectedCourseId==='chinese-2'&&chapter==='c2-13'&&state.lastChapter==='c2-13'")));
 check('range uses stable course-specific lesson IDs',()=>assert(r("catchupScope().every(c=>['2','3','4','5','6','7','8','9','10','c2-11','c2-12'].includes(c.lesson))")));
 check('range spans both courses and excludes target chapter',()=>assert(r("catchupScope().some(c=>c.lesson==='2')&&catchupScope().some(c=>c.lesson==='c2-12')&&!catchupScope().some(c=>c.lesson==='c2-13')")));
 check('the pool deduplicates shared canonical character forms',()=>assert(r('new Set(catchupScope().map(c=>c.character)).size===catchupScope().length')));
 const valid=r('JSON.stringify(catchupPlan())');
 for(const args of [['c2-12','2','c2-13'],['2','c2-13','c2-13'],['2','c2-12','c2-11'],['not-a-lesson','c2-12','c2-13']])check('invalid range '+args.join('/')+' is recoverable without replacing the plan',()=>{assert.equal(plan(a,...args),false);assert.equal(r('JSON.stringify(catchupPlan())'),valid);assert(a.nodes.get('cu-error').textContent.includes('Choose'))});
 check('active plans have a useful Home next action',()=>assert.equal(r('catchupHomeAction().action'),'catchupOpen()'));
 r('catchupPause()');check('pausing only removes the Home reminder',()=>{assert.equal(r('catchupHomeAction()'),null);assert(r('catchupPlan()!==null'));assert.equal(r('catchupScope().length'),381)});r('catchupPause()');
 check('resuming the Home reminder restores the same plan identity',()=>{assert.equal(r('JSON.stringify(catchupPlan())'),valid);assert(r('catchupHomeAction()!==null'))});
 const id=r('catchupPlan().id');check('launch starts a small existing guided session',()=>{assert(r(`catchupStart('${id}')`));assert.equal(r('currentView'),'session');assert.equal(r('session.id'),null);assert(r('memoryIsStudy()'));assert(r('session.memoryCoach.newCharacters.length<=5'))});capture(a,'introduction');
 const session=r('session'),batch=r('JSON.stringify(session.batch)');
 check('a repeated launch cannot replace the live practice queue',()=>{assert.equal(r(`catchupStart('${id}')`),false);assert.strictEqual(r('session'),session);assert.equal(r('JSON.stringify(session.batch)'),batch)});
 check('starting a set leaves all card and word records unchanged',()=>assert.equal(r('JSON.stringify({cards:state.cards,words:state.commonWords,pet:state.companion,xp:bx.xp})'),before));
 r('handlePracticeKeydown({key:" ",target:document.body,preventDefault(){}})');
 check('the normal Space shortcut advances a catch-up introduction once',()=>assert.equal(r('session.pos'),1));
 while(r('memoryIsStudy()'))r('memoryAdvanceStudy()');
 check('viewing every introduction grants no knowledge or training XP',()=>assert.equal(r('JSON.stringify({cards:state.cards,words:state.commonWords,pet:state.companion,xp:bx.xp})'),before));
 while(r('memoryIsMatch()'))r('memoryChooseCharacter(session.memoryCoach.steps[session.pos].ch);memoryAdvanceMatch()');
 const first=r('session.queue[session.pos].character');r("session.usedHint=true;reveal();rate('good')");
 check('a helped Got it is recorded as assisted, not cold recall',()=>{assert.equal(r(`session.lastRatings['${first}']`),'hard');assert.equal(r(`labData().stats['recognition|${first}'].days.length`),0);assert.equal(r(`state.cards['${first}'].memoryStage`),0)});
 capture(a,'recall');finish(a);capture(a,'completion');
 check('completion offers the next catch-up set and a way to stop',()=>{assert(a.html().includes('Catch-up set finished'));assert(a.html().includes('Next small set'));assert(a.html().includes('Done for now'))});
 check('catch-up completion does not mark chapters or course challenges passed',()=>assert(r('Object.keys(state.quizzes.chapters).length===0&&Object.keys(state.read).length===0')));
 check('same-session success is not labelled lasting retention',()=>{assert.equal(r('catchupStatus().retained.length'),0);assert(a.html().includes('Same-session success is not proof'))});
 const rewardBefore=r('JSON.stringify({xp:bx.xp,pet:state.companion})');r('renderPracticeCompletion(session,"cards");renderPracticeCompletion(session,"cards")');
 check('rerendering the completion cannot farm learner or companion XP',()=>assert.equal(r('JSON.stringify({xp:bx.xp,pet:state.companion})'),rewardBefore));
 const pending=r('session.batch.find(ch=>state.cards[ch]?.memoryStage===1)'),pendingDue=r(`state.cards['${pending}'].due`);
 r(`startSession('all',null,['${pending}']);reveal();rate('good')`);
 check('an immediate successful repeat cannot advance a pending delayed review',()=>{assert.equal(r(`state.cards['${pending}'].memoryStage`),1);assert.equal(r(`state.cards['${pending}'].due`),pendingDue)});
 check('another same-day answer leaves exactly one independent recall day',()=>assert.equal(r(`labData().stats['recognition|${pending}'].days.length`),1));
 const afterRepeat=r('JSON.stringify({cards:state.cards,stats:labData().stats,xp:bx.xp,pet:state.companion})');r("rate('good');rate('again')");
 check('stale grading callbacks after completion cannot duplicate credit',()=>assert.equal(r('JSON.stringify({cards:state.cards,stats:labData().stats,xp:bx.xp,pet:state.companion})'),afterRepeat));
 r("navigate('home');catchupOpen();catchupConfigure('3','c2-12','c2-13',8)");
 check('an old plan’s start button cannot launch after reconfiguration',()=>assert.equal(r(`catchupStart('${id}')`),false));
 const current=r('JSON.stringify(catchupPlan())');r('catchupValidateSession({catchup:{version:999,plan:"bad"}},"cards")');
 check('malformed session markers are discarded',()=>assert.equal(r('(()=>{const d={catchup:{version:999,plan:"bad"}};catchupValidateSession(d,"cards");return d.catchup})()'),undefined));
 check('plan callbacks do not silently switch courses',()=>assert.equal(r('selectedCourseId'),'chinese-2'));

 const b=setup(),br=b.run;plan(b);br("catchupScope().slice(0,8).forEach((c,i)=>state.cards[c.character]={seen:2,streak:0,interval:0,memoryStage:0,due:i,last:0})");
 check('due reviews take the whole set before new introductions',()=>{assert.equal(br('catchupNext().review.length'),8);assert.equal(br('catchupNext().fresh.length'),0)});
 check('due review order starts with the earliest due record',()=>assert(br('catchupNext().review.every((c,i,a)=>!i||state.cards[a[i-1].character].due<=state.cards[c.character].due)')));
 br('catchupStart(catchupPlan().id)');check('a review-only catch-up set remains ordinary recall',()=>assert(!br('session.memoryCoach')));
 const duech=br('session.queue[0].character');br("reveal();rate('again')");
 check('a miss returns after intervening cards in the existing queue',()=>assert(br(`session.queue.slice(session.pos+1).some(c=>c.character==='${duech}')`)));

 const c=setup(),cr=c.run;plan(c);cr("catchupScope().forEach(c=>state.cards[c.character]={seen:3,streak:2,interval:3,memoryStage:2,due:Date.now()+86400000,last:Date.now()})");
 check('familiar future-due cards are not forced into a new cram loop',()=>assert.equal(cr('catchupNext().count'),0));
 cr('renderCatchup()');capture(c,'waiting');check('a waiting plan gives a current-lesson next action and an honest due time',()=>{assert(c.html().includes('Open my current lesson'));assert(c.html().includes('next review'))});
 const retainedCh=cr('catchupScope()[0].character');cr(`labData().stats['recognition|${retainedCh}']={skill:'recognition',item:'${retainedCh}',course:'chinese-1',attempts:2,correct:2,assisted:0,last:Date.now(),days:[dayKey()]}`);
 check('two correct answers on one day do not become two-day retention',()=>assert.equal(cr('catchupStatus().retained.length'),0));
 cr(`labData().stats['recognition|${retainedCh}'].days=['2026-11-10','2026-11-11']`);
 check('shared unassisted recall on separate days can count across courses',()=>assert.equal(cr('catchupStatus().retained.length'),1));
 cr(`state.cards['${retainedCh}'].memoryStage=1`);check('a character still in initial learning is not counted as retained',()=>assert.equal(cr('catchupStatus().retained.length'),0));

 const d=setup(),dr=d.run;plan(d);dr("personalSaveNote('character','你','Keep my cue');personalSaveNote('word','cw-01-01','Keep my word cue');state.bookmarks=['你'];state.settings.palette='black';state.settings.theme='light';catchupStart(catchupPlan().id);memoryAdvanceStudy();checkpointCurrent();save()");
 const resumepos=dr('session.pos'),resumeplan=dr('catchupPlan().id'),cold=boot(Object.fromEntries(d.storage)),coldr=cold.run;
 check('cold reopening starts at Home with the catch-up plan intact',()=>{assert.equal(coldr('currentView'),'home');assert.equal(coldr('catchupPlan().id'),resumeplan)});
 check('paused catch-up metadata survives legacy validation',()=>{assert.equal(coldr('savedResume.data.catchup.plan'),resumeplan);assert.equal(coldr('savedResume.data.pos'),resumepos)});
 coldr('catchupResume()');check('resuming restores the exact guided position and course',()=>{assert.equal(coldr('session.pos'),resumepos);assert(coldr('memoryIsStudy()'));assert.equal(coldr('selectedCourseId'),'chinese-2')});
 check('cold startup preserves character and compound notes, bookmarks, and theme',()=>assert(coldr("state.memoryNotes['你']==='Keep my cue'&&cwDesk().notes['cw-01-01']==='Keep my word cue'&&state.bookmarks.includes('你')&&state.settings.palette==='black'&&state.settings.theme==='light'")));
 const blobs=[];d.ctx.URL=class extends URL{static createObjectURL(blob){blobs.push(blob);return 'blob:backup'}static revokeObjectURL(){}};dr('exportBackup()');const text=await blobs.at(-1).text(),backup=JSON.parse(text);
 check('actual backup export includes the validated plan and both note scopes',()=>{assert.equal(backup.learningLab.catchup.id,resumeplan);assert.equal(backup.memoryNotes['你'],'Keep my cue');assert.equal(backup.commonWords.notes['cw-01-01'],'Keep my word cue')});
 dr('resetProgress()');check('full progress reset clears the catch-up plan',()=>assert.equal(dr('catchupPlan()'),null));
 await d.nodes.get('backup-file').onchange({target:{files:[{size:Buffer.byteLength(text),text:async()=>text}]}});
 check('actual file import restores the catch-up plan, selected course, and notes',()=>{assert.equal(dr('catchupPlan().id'),resumeplan);assert.equal(dr('selectedCourseId'),'chinese-2');assert.equal(dr("state.memoryNotes['你']"),'Keep my cue');assert.equal(dr("cwDesk().notes['cw-01-01']"),'Keep my word cue')});
 dr("navigate('home');catchupOpen();toggleSettings()");check('Settings opens from the planner',()=>assert.equal(dr('currentView'),'settings'));dr('toggleSettings()');check('closing Settings returns to the planner',()=>assert.equal(dr('currentView'),'catchup'));dr('goBack()');check('Back from the planner restores Home',()=>assert.equal(dr('currentView'),'home'));
 for(const app of [a,b,c,d,cold])check('catch-up paths leave no runtime errors '+checks.length,()=>assert.deepEqual(app.errors,[]));
 const interruptedSeed=Object.fromEntries(d.storage),interrupted=boot(interruptedSeed,path.resolve(__dirname,'..'),'index.html',{skipScripts:['assets/catchup-learning-'],captureScriptErrors:true});
 check('a missing catch-up module keeps startup behind recovery',()=>assert.equal(interrupted.run('appBoot.status()'),'failed'));
 check('interrupted migration cannot replace the existing plan or learned progress',()=>assert.equal(interrupted.storage.get(key),interruptedSeed[key]));
 const result={checks:checks.length,failed:failures.length,failures,method:'Node DOM/media fixtures; actual guided/recall callbacks, scheduler, same-day/distinct-day records, cold startup, export Blob, import callback, reset, navigation and keyboard',browserTested:false,deviceTested:false};
 fs.mkdirSync(path.join(__dirname,'results'),{recursive:true});fs.writeFileSync(path.join(__dirname,'results/catchup-learning.json'),JSON.stringify(result,null,2));fs.writeFileSync(path.join(__dirname,'results/catchup-learning-views.json'),JSON.stringify(views));console.log(JSON.stringify(result));if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e.stack);process.exitCode=1});
