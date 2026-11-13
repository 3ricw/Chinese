/* A quiet Home lesson shelf supplies context without revealing paused answers.
   DOM fixtures inspect behavior and CSS contracts, not browser/device pixels. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{boot}=require('./runtime.cjs');
const a=boot(),r=a.run,checks=[],failures=[],views=[];
const check=(name,f)=>{checks.push(name);try{f()}catch(e){failures.push({name,error:e.message})}};
function fresh(course='chinese-1',script='simplified'){r(`state=defaults();state.commonWords=cwDefaults();state.readingDesk=rxDefaults();savedResume=null;session=null;writeSession=null;quizSession=null;labRun=null;onboardingStep=null;state.profile.setupDone=true;state.settings.soundEffects=false;state.settings.script='${script}';switchCourse('${course}');starterPreview='dragon';chooseStarter();closeModal();navigate('home')`)}
function snapshot(){return r('JSON.stringify({state,learnerXP:bx.xp,savedResume})')}
for(const course of ['chinese-1','chinese-2'])for(const script of ['simplified','traditional']){
 fresh(course,script);const label=course+'/'+script,before=snapshot();r('renderHome()');const h=a.html(),shelf=r('rxHomeChapterMarkup()');views.push({name:'home-chapter/'+label,html:h});
 check(label+' adds one current-lesson shelf under honest stats',()=>{assert.equal((h.match(/class="rx-home-chapter"/g)||[]).length,1);assert(h.indexOf('class="ax-home-metrics"')===-1||h.indexOf('ax-home-metrics')<h.indexOf('class="rx-home-chapter"'));assert(h.includes('0 of '+r('uniqueCards(courseFocusId()).length')+' characters practiced'));assert(shelf.includes('Inside '+r('lessonLabel(courseFocusId())')));assert(shelf.includes(r("courseChapters().find(c=>c[0]===courseFocusId())[1]")))});
 const targets=[...shelf.matchAll(/onclick="rxHomeExplore\('([^']+)'\)"/g)].map(m=>m[1]);
 check(label+' keeps three stable clickable shapes from this lesson with the selected script',()=>{assert.equal(targets.length,3);for(const ch of targets){assert(r(`uniqueCards(courseFocusId()).some(c=>c.character==='${ch}')`));assert(shelf.includes('>'+r(`text('${ch}')`)+'</strong>'))}assert.equal(r('rxHomeChapterMarkup()'),shelf);assert(shelf.includes('onclick="openChapter(\''+r('courseFocusId()')+'\')"'))});
 check(label+' Home rendering cannot change records, saved sessions, XP, notes or schedules',()=>{r('renderHome();renderHome()');assert.equal(snapshot(),before);assert.equal((a.html().match(/class="btn primary"/g)||[]).length,1)});
 r("startSession('all',courseFocusId());checkpointCurrent();navigate('home')");const pending=snapshot();r('renderHome()');views.push({name:'home-chapter/'+label+'/saved-full-chapter',html:a.html()});
 check(label+' a paused full chapter shows a learning path instead of its answers',()=>{const content=r('rxHomeChapterMarkup()');assert(content.includes('class="rx-chapter-path"'));assert(!content.includes('rxHomeExplore('));assert.equal((content.match(/<li>/g)||[]).length,3);assert(!r('savedResume.data.usedHint'));assert.equal(snapshot(),pending)});
}
fresh();r("state.lastChapter='I';var hcOne=uniqueCards(courseFocusId())[0].character;state.cards[hcOne]={seen:4,streak:2,interval:3,memoryStage:2,last:Date.now(),due:Date.now()+86400000};renderHome()");
check('shelf counts actual practiced characters without claiming mastery or lesson completion',()=>{assert(r('rxHomeChapterMarkup()').includes('1 of '+r('uniqueCards(courseFocusId()).length')+' characters practiced'));assert(!r('rxHomeChapterMarkup()').includes('mastered'));assert(!r('courseState(courseFocusId()).complete'))});
// Even a stale preview callback must mark help if a recall target has since opened.
const shown=r('rxHomeChapterMarkup()').match(/onclick="rxHomeExplore\('([^']+)'\)"/)[1];
r(`startSession('all',courseFocusId(),['${shown}']);checkpointCurrent();navigate('home')`);const xp=r('bx.xp'),pet=r('state.companion.xp');r(`rxHomeExplore('${shown}')`);
check('opening a shape marks a paused answer as assisted and earns no learning rewards',()=>{assert(r('savedResume.data.usedHint'));assert.equal(r('bx.xp'),xp);assert.equal(r('state.companion.xp'),pet);assert(a.nodes.get('overlay').innerHTML.length>100)});
r('closeModal();clearSavedSession();session=null;state.scrollSession={frames:[{ch:hcOne,chosen:null,cold:true}],index:0};renderHome()');
check('unfinished Scroll frames are protected from passive Home answer previews',()=>{assert(r('rxHomeProtectedCharacters().has(hcOne)'));assert(!r('rxHomeChapterMarkup()').includes(`rxHomeExplore('${r('hcOne')}')`))});
fresh('chinese-2','traditional');r("var hcTraditional=uniqueCards(courseFocusId()).find(c=>c.character!==text(c.character));savedResume={kind:'write',data:{queue:[text(hcTraditional.character)],pos:0,done:false,revealed:false}};renderHome()");
check('traditional queued writing answers protect their simplified preview equivalents',()=>{const ch=r('hcTraditional.character');assert(!r('rxHomeChapterMarkup()').includes("rxHomeExplore('"+ch+"')"))});
fresh();r("var hcWord=uniqueCards(courseFocusId())[0].character;state.commonWords.session={queue:[{simplified:hcWord+'可以',traditional:hcWord+'可以'}],pos:0,done:false};renderHome()");
check('paused compound-word forms cannot leak through Home shape previews',()=>{assert(r('rxHomeProtectedCharacters().has(hcWord)'));assert(!r('rxHomeChapterMarkup()').includes("rxHomeExplore('"+r('hcWord')+"')"))});
fresh('chinese-2');r("var hcShared='片';state.courses.records['chinese-1'].resume={kind:'cards',data:{queue:[hcShared],pos:0,done:false,revealed:false}};renderHome()");
check('saved recall answers in the other course remain protected',()=>{assert(r('rxHomeProtectedCharacters().has(hcShared)'));assert(!r('rxHomeChapterMarkup()').includes("rxHomeExplore('片')"))});
check('new shelf records no runtime errors',()=>assert.deepEqual(a.errors,[]));
const result={checks:checks.length,failed:failures.length,failures,method:'Node DOM fixtures; course/script, stable content, paused-answer protection, real lookup assistance, XP/state snapshots; no browser/device run',browserTested:false,deviceTested:false};
fs.mkdirSync(path.join(__dirname,'results'),{recursive:true});fs.writeFileSync(path.join(__dirname,'results/home-chapter.json'),JSON.stringify(result,null,2));fs.writeFileSync(path.join(__dirname,'results/home-chapter-views.json'),JSON.stringify(views));console.log(JSON.stringify(result));if(failures.length)process.exitCode=1;
