/* Real lesson entry/resume/feed callbacks with deterministic DOM/media mocks.
   These checks do not measure rendered layout or device gestures. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{boot}=require('./runtime.cjs');
const app=boot(),r=app.run,failures=[],views=[];let checks=0;
const check=(name,fn)=>{checks++;try{fn()}catch(e){failures.push({name,error:e.message})}};
const stable=code=>JSON.stringify(JSON.parse(r(code)));
const knowledge=()=>stable('JSON.stringify({cards:state.cards,writing:state.writing,quizzes:state.quizzes,pet:state.companion,xp:bx.xp,activity:state.activity})');
r("onboardingStep=null;state.profile.setupDone=true;closeModal();state.settings.soundEffects=false");
for(const id of r('CHAPTERS.map(c=>c[0])')){
 r(`openChapter('${id}')`);let html=app.html();views.push({name:'lesson-scroll/'+id+'/learn',html});
 check(id+': Scroll is the single primary Learn action',()=>{assert.equal((html.match(/class="btn primary"/g)||[]).length,1);assert(html.includes(`class="btn primary" onclick="openLessonScroll('${id}')"`));assert(html.includes(`class="btn" onclick="startSession('all','${id}')">Practice full chapter`));assert(!html.includes('Write to answer'))});
 const before=knowledge();r(`openLessonScroll('${id}')`);
 check(id+': entry selects only this lesson and its course',()=>{assert.equal(r('currentView'),'scroll');assert.equal(r('state.scrollSession.chapter'),id);assert(r(`currentCourse().lessons.includes('${id}')`));assert(r(`state.feed.mode==='chapter'&&state.feed.anchor==='${id}'`));assert(r(`state.scrollSession.targets.every(ch=>uniqueCards('${id}').some(c=>c.character===ch))`))});
 check(id+': entry and browsing create no learning or rewards',()=>assert.equal(knowledge(),before));
 const set=r('state.scrollSession.id');r('scrollSetIndex(1)');const position=r('state.scrollSession.index'),sets=r('state.feed.sets');
 r(`openChapter('${id}')`);html=app.html();
 check(id+': unfinished lesson advertises Resume Scroll',()=>assert(html.includes(`onclick="openLessonScroll('${id}')">Resume Scroll`)));
 r(`openLessonScroll('${id}')`);
 check(id+': reopening preserves exact set and card without another selection',()=>{assert.equal(r('state.scrollSession.id'),set);assert.equal(r('state.scrollSession.index'),position);assert.equal(r('state.feed.sets'),sets)});
 // Introductions are true exposure for the feed, never a recall grade.
 r('for(let i=0;i<state.scrollSession.frames.length;i++)if(state.scrollSession.frames[i].kind===\'meet\')scrollSetIndex(i)');
 const targets=r('state.scrollSession.targets.join()');r('anotherScrollSet(state.scrollSession.id)');
 check(id+': continuing stays in the lesson without restarting its first forms',()=>{assert.notEqual(r('state.scrollSession.targets.join()'),targets);assert(r(`state.scrollSession.targets.every(ch=>uniqueCards('${id}').some(c=>c.character===ch))`));assert.equal(r('state.feed.mode'),'chapter')});
 check(id+': progressing the feed still leaves recall knowledge and XP unchanged',()=>assert.equal(knowledge(),before));
 r(`openChapter('${id}');chapterTab('write')`);html=app.html();views.push({name:'lesson-scroll/'+id+'/write',html});
 check(id+': both free writing and checked writing stay available in Write',()=>{assert(html.includes(`onclick="startWriting('${id}')"`));assert(html.includes(`onclick="startWrittenChapter('${id}')">Write to answer`))});
}
// A global discovery set from the same visible chapter must not masquerade as
// chapter-scoped practice, and explicit course changes retain independent sets.
r("switchCourse('chinese-1');startFeedDiscovery();var discovery=state.scrollSession.id;var discoveryChapter=state.scrollSession.chapter;openLessonScroll(discoveryChapter)");
check('lesson entry replaces a discovery pool with an explicit lesson pool',()=>{assert.notEqual(r('state.scrollSession.id'),r('discovery'));assert.equal(r('state.feed.mode'),'chapter')});
r("openLessonScroll('1');scrollSetIndex(1);var c1id=state.scrollSession.id;var c1index=state.scrollSession.index;openLessonScroll('c2-13');scrollSetIndex(1);var c2id=state.scrollSession.id;var c2index=state.scrollSession.index;openLessonScroll('1')");
check('cross-course lesson entry restores the first course saved set',()=>{assert.equal(r('selectedCourseId'),'chinese-1');assert.equal(r('state.scrollSession.id'),r('c1id'));assert.equal(r('state.scrollSession.index'),r('c1index'))});
r("openLessonScroll('c2-13')");
check('returning to Chinese 2 restores its own position',()=>{assert.equal(r('selectedCourseId'),'chinese-2');assert.equal(r('state.scrollSession.id'),r('c2id'));assert.equal(r('state.scrollSession.index'),r('c2index'))});
r('save()');const reloaded=boot(Object.fromEntries(app.storage));
check('reload opens Home and keeps lesson Scroll ready to resume',()=>{assert.equal(reloaded.run('currentView'),'home');assert(reloaded.run("lessonScrollResumable('c2-13')"));reloaded.run("openLessonScroll('c2-13')");assert.equal(reloaded.run('state.scrollSession.id'),r('c2id'));assert.equal(reloaded.run('state.scrollSession.index'),r('c2index'))});
const saved=stable('JSON.stringify({course:selectedCourseId,scroll:state.scrollSession,feed:state.feed})');
check('unknown lesson IDs leave the current session alone',()=>{assert.equal(r("openLessonScroll('__proto__')"),false);assert.equal(r("openLessonScroll('Lesson 1')"),false);assert.equal(stable('JSON.stringify({course:selectedCourseId,scroll:state.scrollSession,feed:state.feed})'),saved)});
// Structurally valid global sets may span lessons. A stale chapter label must
// never reuse such a pool as lesson-scoped learning.
r("openLessonScroll('2');openChapter('1');state.scrollSession.chapter='1';state.feed.mode='chapter';state.feed.anchor='1';var stale=state.scrollSession.id");
check('a mislabeled set with another lesson target is not resumable',()=>assert.equal(r("lessonScrollResumable('1')"),false));
check('explicit entry replaces a stale cross-lesson pool',()=>{assert.equal(r("openLessonScroll('1')"),true);assert.notEqual(r('state.scrollSession.id'),r('stale'));assert(r("state.scrollSession.targets.every(ch=>uniqueCards('1').some(c=>c.character===ch))"))});
for(const mutation of ['state.scrollSession.frames=null','state.scrollSession.index=999','state.scrollSession.targets=["unknown"]']){
 r("openChapter('1');"+mutation);const before=knowledge();
 check('malformed saved set recovers safely: '+mutation,()=>{assert.equal(r("openLessonScroll('1')"),true);assert(r('!!validateScrollSession(state.scrollSession)'));assert(r("state.scrollSession.targets.every(ch=>uniqueCards('1').some(c=>c.character===ch))"));assert.equal(knowledge(),before)});
}
r("state.scrollSession.done=true;var finished=state.scrollSession.id;var finishedSets=state.feed.sets");
check('completed lesson entry starts exactly one new set',()=>{assert.equal(r("openLessonScroll('1')"),true);assert.notEqual(r('state.scrollSession.id'),r('finished'));assert.equal(r('state.feed.sets'),r('finishedSets')+1)});
r("var resumed=state.scrollSession.id;var resumedSets=state.feed.sets");
check('another activation of the unfinished entry resumes without another set',()=>{assert.equal(r("openLessonScroll('1')"),true);assert.equal(r('state.scrollSession.id'),r('resumed'));assert.equal(r('state.feed.sets'),r('resumedSets'))});
r("startSession('all','1',['你','好']);reveal();checkpointCurrent();var cardsResume=JSON.stringify(savedResume.data)");
check('entering lesson Scroll checkpoints the active full-chapter practice',()=>{assert.equal(r("openLessonScroll('1')"),true);assert.equal(r('JSON.stringify(savedResume.data)'),r('cardsResume'));assert.equal(r('currentView'),'scroll')});
check('lesson Scroll adds no runtime errors',()=>assert.deepEqual([...app.errors,...reloaded.errors],[]));
const result={checks,failed:failures.length,failures,method:'Node DOM/media mocks; actual lesson, Scroll, continuation, course switching and reload callbacks',browserTested:false,deviceTested:false};
fs.mkdirSync(path.join(__dirname,'results'),{recursive:true});fs.writeFileSync(path.join(__dirname,'results/lesson-scroll.json'),JSON.stringify(result,null,2));fs.writeFileSync(path.join(__dirname,'results/lesson-scroll-views.json'),JSON.stringify(views));console.log(JSON.stringify(result));if(failures.length)process.exitCode=1;
