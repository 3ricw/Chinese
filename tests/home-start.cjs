/* First-visit and returning-user routing, honest learning, navigation animation,
   and audio lifecycle. DOM/WAAPI/Web Audio mocks, not a browser or sound audition. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{boot}=require('./runtime.cjs');
const a=boot(),r=a.run,checks=[],failures=[],views=[];
const check=(name,fn)=>{checks.push(name);try{fn()}catch(e){failures.push({name,error:e.message})}};
const flush=async()=>{for(let i=0;i<6;i++)await Promise.resolve()};
function fresh(course='chinese-1'){
 r(`state=defaults();state.commonWords=cwDefaults();state.readingDesk=rxDefaults();savedResume=null;session=null;writeSession=null;quizSession=null;labRun=null;onboardingStep=null;state.profile.setupDone=true;state.settings.soundEffects=false;switchCourse('${course}');closeModal();navigate('home')`);
}
function snapshot(){return r('JSON.stringify({cards:state.cards,words:state.commonWords,reading:state.readingDesk,writing:state.writing,notes:state.memoryNotes,pet:state.companion,xp:bx.xp,activity:state.activity})')}
(async()=>{
 for(const course of ['chinese-1','chinese-2'])for(const script of ['simplified','traditional'])for(const size of [1,3,5]){
  fresh(course);r(`state.settings.script='${script}';state.settings.newCharacters=${size};renderHome()`);
  const plan=r('rxNextAction()'),before=snapshot(),h=a.html();views.push({name:`home-start/${course}/${script}/${size}`,html:h});
  check(`${course}/${script}/${size}: one clear small-set action`,()=>{assert.equal(plan.button,`Learn ${size} characters`);assert(plan.action.includes("startSession('learn'"));assert.equal((h.match(/class="btn primary"/g)||[]).length,1);assert(h.includes('Start here'));assert(h.includes('Full chapter practice'))});
  check(`${course}/${script}/${size}: explanation, optional games and deferred calendar`,()=>{assert(h.indexOf('rx-home-guide')<h.indexOf('ax-home-metrics'));assert(h.includes('When you want a change'));assert.equal((h.match(/data-game=/g)||[]).length,3);assert(h.includes('id="bx-quests"'));assert(/<details class="rx-home-week"><summary>/.test(h));assert(!/<details class="rx-home-week"[^>]*\bopen\b/.test(h))});
  r('rxOpenHomeHelp()');views.push({name:`home-help/${course}/${script}/${size}`,html:a.nodes.get('overlay').innerHTML});r('closeModal();renderHome()');
  check(`${course}/${script}/${size}: explanatory UI adds no learning or rewards`,()=>assert.equal(snapshot(),before));
  r(plan.action);
  check(`${course}/${script}/${size}: launch uses real guided steps, not cold full-chapter recall`,()=>{assert.equal(r('currentView'),'session');assert.equal(r('session.memoryCoach.newCharacters.length'),size);assert(r('memoryIsStudy()'));assert(r('session.queue.every(c=>currentCourse().lessons.includes(c.lesson))'));assert.equal(r('session.memoryCoach.steps.filter(x=>x.phase==="study").length'),size)});
  check(`${course}/${script}/${size}: starting and revealing the introduction grant no mastery`,()=>assert.equal(r('uniqueCards().filter(familiar).length'),0));
 }
 fresh();const action=r('rxNextAction().action');r(action);
 let guard=0;
 while(!r('session.done')&&guard++<80){
  if(r('memoryIsStudy()'))r('memoryAdvanceStudy()');
  else if(r('memoryIsMatch()'))r('memoryChooseCharacter(session.memoryCoach.steps[session.pos].ch);memoryAdvanceMatch()');
  else r("reveal();rate('good')");
 }
 check('a full first guided set finishes without manufacturing spaced familiarity',()=>{assert(r('session.done'));assert.equal(r('uniqueCards().filter(familiar).length'),0);assert(r('Object.keys(state.cards).length>0'))});
 r("clearSavedSession();navigate('home')");
 check('the next small set never jumps from three introduced shapes to fifty cold prompts',()=>assert(r("rxNextAction().action.startsWith(\"startSession('learn'\")||rxNextAction().action==='rxStartRecovery()'")));
 for(const course of ['chinese-1','chinese-2']){
  fresh(course);r("var focus=courseFocusId();uniqueCards(focus).slice(0,8).forEach(c=>state.cards[c.character]={seen:3,streak:2,interval:3,memoryStage:2,last:Date.now(),due:Date.now()+86400000});state.activity[dayKey()]={cards:8,readings:0};renderHome()");
  check(course+': established learners retain full-chapter priority',()=>assert(r("rxNextAction().action.startsWith(\"startSession('all'\")")));
  r("Object.values(state.cards).forEach(v=>v.due=0);renderHome()");
  check(course+': due reviews have a bounded next action',()=>assert.equal(r('rxNextAction().action'),'rxStartRecovery()'));
  r("startSession('all',focus);reveal();checkpointCurrent();navigate('home')");
  check(course+': saved practice wins over reviews',()=>assert.equal(r('rxNextAction().action'),'resumeSession()'));
  r('rxOpenHomeHelp();closeModal();resumeSession()');
  check(course+': help preserves the actual saved session and card position',()=>assert(r('session.revealed&&session.pos===0&&session.id===focus')));
 }
 fresh('chinese-2');r("state.cards['片']={seen:6,streak:3,interval:12,memoryStage:2,last:Date.now(),due:Date.now()+86400000};renderHome()");
 check('Chinese 2 introduction omits already familiar shared characters',()=>assert(r("!memoryLearningPlan(courseFocusId()).fresh.some(c=>c.character==='片')")));
 r("state.profile.name='<img src=x onerror=alert(1)>';renderHome()");
 check('Home safely escapes the greeting',()=>assert(!a.html().includes('<img src=x')));
 // Navigation highlight: connected element geometry plus controllable native animations.
 const nav=a.nodes.get('nav'),animations=[];nav.offsetParent={};nav.getBoundingClientRect=()=>({left:10,top:50,width:220,height:500});
 let active=new a.ctx.Element();active.setAttribute('onclick',"navigate('home')");active.getBoundingClientRect=()=>({left:18,top:60,width:204,height:44});nav.querySelector=()=>active;
 a.ctx.Element.prototype.animate=function(frames,options){let resolve,reject;const finished=new Promise((a,b)=>{resolve=a;reject=b});const animation={frames,options,el:this,finished,canceled:false,resolve,cancel(){this.canceled=true;reject(Error('cancel'))}};animations.push(animation);return animation};
 r('state.settings.animations=true;var navBefore=axNavSnapshot()');active.setAttribute('onclick',"navigate('learn')");active.getBoundingClientRect=()=>({left:18,top:112,width:204,height:44});
 const beforeMotion=snapshot();r('axMoveNavHighlight(navBefore)');
 check('desktop selection moves one decorative lens in 340ms',()=>{assert.equal(animations.length,1);assert.equal(animations[0].options.duration,340);assert(animations[0].frames[0].transform.includes('-52px'));assert.equal(nav.children.length,1);assert.equal(nav.children[0].getAttribute('aria-hidden'),'true')});
 r('axStopDisplayMotion(true)');check('page entry does not cancel the navigation movement',()=>assert(!animations[0].canceled));
 nav.children[0].getBoundingClientRect=()=>({left:18,top:87,width:204,height:44});r('navBefore=axNavSnapshot()');active.setAttribute('onclick',"navigate('tools')");active.getBoundingClientRect=()=>({left:18,top:216,width:204,height:44});r('axMoveNavHighlight(navBefore)');await flush();
 check('rapid navigation starts from the visible moving lens and cancels the old one',()=>{assert(animations[0].canceled);assert.equal(nav.children.length,1);assert(animations[1].frames[0].transform.includes('-129px'));assert(nav.classList.contains('ax-nav-traveling'))});
 animations[1].resolve();await flush();check('completion restores the ordinary active-tab styling',()=>{assert.equal(nav.children.length,0);assert(!nav.classList.contains('ax-nav-traveling'))});
 const count=animations.length;r('navBefore=axNavSnapshot();axMoveNavHighlight(navBefore)');check('same-page renders do not replay navigation movement',()=>assert.equal(animations.length,count));
 r("state.settings.animations=false;axMoveNavHighlight({key:'old',x:8,y:10,width:204,height:44})");check('saved reduced motion prevents the moving lens',()=>assert.equal(animations.length,count));
 r('state.settings.animations=true');a.ctx.matchMedia=()=>({matches:true});r("axMoveNavHighlight({key:'old',x:8,y:10,width:204,height:44})");check('system reduced motion prevents the moving lens',()=>assert.equal(animations.length,count));a.ctx.matchMedia=()=>({matches:false});
 r("axMoveNavHighlight({key:'old',x:8,y:10,width:204,height:44});axStopDisplayMotion()");await flush();check('canceling display motion clears navigation too',()=>assert.equal(nav.children.length,0));
 a.ctx.Element.prototype.animate=()=>{throw Error('unsupported')};r("axMoveNavHighlight({key:'old',x:8,y:10,width:204,height:44})");check('unavailable native animation leaves a usable ordinary active tab',()=>{assert.equal(nav.children.length,0);assert(!nav.classList.contains('ax-nav-traveling'))});
 check('all motion leaves learning and rewards unchanged',()=>assert.equal(snapshot(),beforeMotion));
 // Web Audio with actual scheduling callbacks, mute/visibility/speech guards.
 const tones=[],gains=[];let now=1000,pending=[];
 const audio={state:'running',currentTime:1,destination:{},resume(){return new Promise(resolve=>pending.push(()=>{this.state='running';resolve()}))},createOscillator(){const o={frequency:{setValueAtTime(v){o.frequencyValue=v}},connect(){},disconnect(){},start(t){o.started=t;tones.push(o)},stop(){o.stopped=true}};return o},createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(v){gains.push(v)},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}}}};
 a.ctx.AudioContext=function(){return audio};a.ctx.performance.now=()=>now;r('state.settings.soundEffects=true;stopStudySounds();studyAudioContext=null');
 const button=new a.ctx.Element();button.dataset.uiSound='open';a.ctx.uiTarget={closest:()=>button};
 r("axUISound({isTrusted:true,target:uiTarget})");check('a real activation gets a quiet two-note cue',()=>{assert.equal(tones.length,2);assert(gains.every(x=>x===.02))});
 r("axUISound({isTrusted:true,target:uiTarget})");check('rapid activation cannot stack UI ticks',()=>assert.equal(tones.length,2));
 now+=200;r("axUISound({isTrusted:false,target:uiTarget})");check('synthetic activations stay silent',()=>assert.equal(tones.length,2));
 button.setAttribute('aria-current','page');r("axUISound({isTrusted:true,target:uiTarget})");check('selecting the current navigation tab stays silent',()=>assert.equal(tones.length,2));button.removeAttribute('aria-current');
 button.disabled=true;r("axUISound({isTrusted:true,target:uiTarget})");button.disabled=false;check('disabled controls stay silent',()=>assert.equal(tones.length,2));
 r("stopStudySounds();playStudySound('complete')");const successTones=tones.length;now+=200;r("axUISound({isTrusted:true,target:uiTarget})");check('a navigation tick cannot interrupt completion feedback',()=>assert.equal(tones.length,successTones));
 r('stopStudySounds();state.settings.soundEffects=false');now+=200;r("axUISound({isTrusted:true,target:uiTarget})");check('the existing mute preference suppresses UI ticks',()=>assert.equal(tones.length,successTones));
 r('state.settings.soundEffects=true');a.ctx.document.visibilityState='hidden';r("playStudySound('open')");a.ctx.document.visibilityState='visible';a.ctx.speechSynthesis.speaking=true;r("playStudySound('open')");a.ctx.speechSynthesis.speaking=false;check('hidden pages and spoken Chinese suppress UI sounds',()=>assert.equal(tones.length,successTones));
 audio.state='suspended';r("playStudySound('open');stopStudySounds()");pending.splice(0).forEach(f=>f());await flush();check('canceling while audio unlocks cannot produce a delayed stray sound',()=>assert.equal(tones.length,successTones));
 audio.state='suspended';r("playStudySound('navigate');playStudySound('open')");pending.splice(0).forEach(f=>f());await flush();check('rapid requests during audio unlock schedule only the newest cue',()=>assert.equal(tones.length,successTones+2));
 r('stopStudySounds()');audio.state='suspended';r("playStudySound('open');state=clone(state)");pending.splice(0).forEach(f=>f());await flush();check('import/reset during audio unlock invalidates the old request',()=>assert.equal(tones.length,successTones+2));
 check('Home, sound and motion checks log no runtime errors',()=>assert.deepEqual(a.errors,[]));
 const result={checks:checks.length,failed:failures.length,failures,method:'Node DOM, native-animation and Web Audio mocks; actual guided sessions and saved-session callbacks',browserTested:false,deviceTested:false};
 fs.writeFileSync(path.join(__dirname,'results/home-start.json'),JSON.stringify(result,null,2));fs.writeFileSync(path.join(__dirname,'results/home-start-views.json'),JSON.stringify(views));console.log(JSON.stringify(result));if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
