/* Deterministic interaction regressions. This does not render browser pixels,
   validate native View Transition implementation, or measure device latency. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{performance}=require('node:perf_hooks');
const {boot}=require('./runtime.cjs');let checks=0;const failures=[],views=[];
function check(name,fn){checks++;try{fn()}catch(e){failures.push({name,error:e.message})}}
const equal=(a,b)=>assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)));
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function deferred(){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}}
function motionApp(){
 const app=boot(),r=app.run;r("onboardingStep=null;state.profile.setupDone=true;closeModal();state.settings.animations=true;state.settings.palette='jade';state.settings.theme='dark';theme()");
 const transitions=[],animations=[];app.ctx.KeyframeEffect=class{};app.ctx.KeyframeEffect.prototype.pseudoElement=null;
 app.ctx.document.startViewTransition=update=>{
  const ready=deferred(),done=deferred(),finished=deferred(),t={ready:ready.promise,updateCallbackDone:done.promise,finished:finished.promise,skipped:0,skipTransition(){this.skipped++},apply(){update();done.resolve();ready.resolve()},fail(){ready.reject(Error('snapshot failed'))},finish(){finished.resolve()}};
  transitions.push(t);return t;
 };
 app.ctx.document.documentElement.animate=(frames,options)=>{const done=deferred(),a={frames,options,finished:done.promise,canceled:0,cancel(){this.canceled++},finish(){done.resolve()}};animations.push(a);return a};
 return {app,r,transitions,animations};
}
(async()=>{
const app=boot(),r=app.run;r("onboardingStep=null;state.profile.setupDone=true;closeModal();state.settings.soundEffects=false;var spoken=[];speechSynthesis.speak=u=>spoken.push(u.text);navigate('home');state.bookmarks=['你']");
r('openQuickLookup()');const input=app.nodes.get('flow-lookup-input');
check('search opens as an editable combobox',()=>assert.equal(input.getAttribute('role'),'combobox'));
check('search exposes list and keyboard selection',()=>assert.equal(input.getAttribute('aria-controls'),'rx-find-list'));
check('first result has an accessible selected identity',()=>assert.equal(input.getAttribute('aria-activedescendant'),r("'rx-find-'+rxFindTurn+'-0'")));
check('empty search suggests three useful learning destinations',()=>equal(r("rxFindRows.filter(x=>x.kind==='actions').map(x=>x.title)"),['Chapter practice','Scroll','Review']));
check('saved characters remain available',()=>assert(r("rxFindRows.some(x=>x.kind==='characters'&&x.key==='你')")));
const knowledge=r('JSON.stringify({cards:state.cards,words:state.commonWords.records,xp:bx.xp})');
r("updateQuickLookup('关系');rxSetFindType('words')");
views.push({name:'study-flow/word-search',html:app.nodes.get('flow-lookup-results').innerHTML});
check('word filtering removes other result kinds',()=>assert(r("rxFindRows.length>0&&rxFindRows.every(x=>x.kind==='words')")));
check('the exact word appears before substring matches',()=>assert.equal(r('rxFindRows[0].title'),'关系'));
r("state.settings.script='traditional';updateQuickLookup('关系')");
check('traditional word rendering uses whole-word conversion',()=>assert.equal(r('rxFindRows[0].title'),'關係'));
r("updateQuickLookup('聯繫')");check('traditional-only input finds its word',()=>assert(r("rxFindRows.some(x=>x.title==='聯繫')")));
check('pinyin search treats marked ü, v and u: consistently',()=>{for(const value of ['lǜ sè','lü4 se4','lv se','lu:4 se4'])assert.equal(r('cwNorm('+JSON.stringify(value)+')'),'lvse');assert.notEqual(r("cwNorm('lu se')"),'lvse')});
check('pinyin variants reach the same real vocabulary',()=>{const a=r("rxFindData('lǜ').words.map(x=>x.key)"),b=r("rxFindData('lv').words.map(x=>x.key)");assert(a.length);equal(a,b)});
r("updateQuickLookup('12345')");check('tone digits alone do not return all common words',()=>assert.equal(r('rxFindRows.length'),0));
r("updateQuickLookup('<img src=x onerror=alert(1)>')");
check('empty search offers recovery without inserting raw input',()=>{const h=app.nodes.get('flow-lookup-results').innerHTML;assert(h.includes('rxResetFind()'));assert(!h.includes('<img'))});
r('rxResetFind()');check('reset clears both query and scope',()=>assert(r("flowLookupQuery===''&&rxFindType==='all'")));
const oldTurn=r('rxFindTurn');r("updateQuickLookup('Writing')");const overlayBefore=app.nodes.get('overlay').innerHTML;r(`rxChooseFind(${oldTurn},0)`);
check('a stale result cannot open after the query changes',()=>assert.equal(app.nodes.get('overlay').innerHTML,overlayBefore));
r("rxFindType='actions';updateQuickLookup('');var findPrevented=false;rxFindKey({key:'Enter',isComposing:true,preventDefault(){findPrevented=true}})");
check('IME confirmation does not navigate',()=>assert(r("!findPrevented&&currentView==='home'")));
r("rxFindKey({key:'End',preventDefault(){findPrevented=true}})");check('native caret editing keeps Home and End',()=>assert(!r('findPrevented')));
r("rxFindKey({key:'ArrowDown',preventDefault(){},stopPropagation(){}})");check('ArrowDown moves the actual selection',()=>assert.equal(r('rxFindActive'),1));
check('combobox points to the new selected option',()=>assert.equal(input.getAttribute('aria-activedescendant'),r("'rx-find-'+rxFindTurn+'-1'")));
const choiceTurn=r('rxFindTurn');r("rxFindKey({key:'Enter',preventDefault(){},stopPropagation(){}})");
check('Enter opens the selected activity rather than a character',()=>assert.equal(r('currentView'),'scroll'));
const scroll=r('JSON.stringify(state.scrollSession)');r(`rxChooseFind(${choiceTurn},1)`);check('duplicate activity clicks are ignored',()=>assert.equal(r('JSON.stringify(state.scrollSession)'),scroll));
r("navigate('home');switchCourse('chinese-2');openQuickLookup();rxSetFindType('readings')");
check('reading recommendations belong to the selected course',()=>assert(r("rxFindRows.length>0&&rxFindRows.every(x=>x.kind==='readings'&&x.key.startsWith('c2-'))")));
views.push({name:'study-flow/course-reading-search',html:app.nodes.get('flow-lookup-results').innerHTML});
r("updateQuickLookup('比');rxSetFindType('characters')");check('Chinese 2 character lookup retains stable shared keys',()=>assert(r("rxFindRows.some(x=>x.key==='比')")));
r("rxSetFindType('words');updateQuickLookup('因为')");check('shared common words stay available in Chinese 2',()=>assert(r('rxFindRows.length>0')));
check('searching and browsing create no recall knowledge or reward',()=>assert.equal(r('JSON.stringify({cards:state.cards,words:state.commonWords.records,xp:bx.xp})'),knowledge));
r("closeModal();switchCourse('chinese-1');state.settings.script='simplified';startSession('all','1',['你']);openQuickLookup()");
check('Quick Find still marks an unanswered card as assisted',()=>assert(r('session.usedHint')));
r("closeModal();navigate('home');labStart('sound','1');openQuickLookup()");check('Quick Find still marks an unanswered chapter activity as assisted',()=>assert(r('labRun.usedHint')));
r("closeModal();navigate('home')");const time=[];
for(let i=0;i<80;i++){const start=performance.now();r('quickLookupMarkup('+JSON.stringify(['你','ni','关系','閱讀','writing','lv','school','because'][i%8])+')');time.push(performance.now()-start)}
time.sort((a,b)=>a-b);const timing={medianMs:+time[40].toFixed(2),p95Ms:+time[76].toFixed(2),maxMs:+time[79].toFixed(2),method:'80 Node DOM-mock searches; no device/browser latency claim'};
// Actual run completion keeps the reward/memory engine in charge.
r("labStart('sound','1');for(let n=0;!labRun.done&&n<80;n++){if(!labRun.feedback)labAnswer(labCurrent().correct);labNext()}");
check('completed run offers a clear stopping action',()=>assert(app.html().includes('Done for now')));
check('completion shows actual finished steps',()=>assert(app.html().includes(r('labRun.queue.length')+' steps completed')));
check('completion has one primary action',()=>assert.equal((app.html().match(/class="btn primary"/g)||[]).length,1));
check('next activity explanation remains collapsed',()=>assert(app.html().includes('<details class="lab-more lab-next-suggestion"><summary>Suggested next practice</summary>')));
views.push({name:'study-flow/complete-clean-run',html:app.html()});const credited=r('JSON.stringify({cards:state.cards,xp:bx.xp,history:labData().history})');r('renderLabComplete();renderLabComplete()');
check('rendering completion never creates a second credit',()=>assert.equal(r('JSON.stringify({cards:state.cards,xp:bx.xp,history:labData().history})'),credited));
r("labStart('sound','1');labAnswer((labCurrent().correct+1)%labCurrent().choices.length);labNext();for(let n=0;!labRun.done&&n<80;n++){if(!labRun.feedback)labAnswer(labCurrent().correct);labNext()}");
check('missed run prioritizes the existing retry',()=>assert(app.html().includes('class="btn primary" onclick="labRetryMisses(')));
views.push({name:'study-flow/complete-missed-run',html:app.html()});r('labRetryMisses();labAnswer(labCurrent().correct)');
check('direct retry retains helped status and zero new XP',()=>assert(r('labRun.feedback.helped&&labRun.feedback.xp===0')));
check('new flows never start speech automatically',()=>assert.equal(r('spoken.length'),0));
// Optional setup progress is a decoration; original validation remains effective.
r("navigate('home');showNameSetup()");const label=new app.ctx.Element(),skip=new app.ctx.Element();let progress='',present=false;
const modal={querySelector:s=>s==='.ax-setup-progress'?(present?{}:null):s==='.eyebrow'?label:s.startsWith('button[onclick')?skip:null,insertAdjacentHTML(where,html){assert.equal(where,'afterbegin');progress+=html;present=true}};
app.ctx.setupFixture={querySelector:()=>modal};r('axOnboarding(setupFixture);axOnboarding(setupFixture)');
check('setup progress is inserted once and reports the first step',()=>{assert.equal((progress.match(/class="ax-setup-progress"/g)||[]).length,1);assert(progress.includes('1 of 2'))});
check('setup uses the established app name and clear skip label',()=>{assert.equal(label.textContent,'Welcome to Eric’s Chinese');assert.equal(skip.textContent,'Skip name')});
app.ctx.document.getElementById('profile-name').value='<invalid>';r('saveProfileName(true)');check('invalid names stay editable on the same step',()=>assert.equal(r('onboardingStep'),'name'));
app.ctx.document.getElementById('profile-name').value='Eric';r('saveProfileName(true)');check('valid name moves to the optional companion step',()=>assert.equal(r('onboardingStep'),'starter'));
progress='';present=false;r('axOnboarding(setupFixture)');check('second setup step shows completed first step',()=>assert(progress.includes('2 of 2')&&progress.includes('class="is-complete"')));
r('skipCompanionSetup()');check('companion setup can still be skipped',()=>assert(r("onboardingStep===null&&currentView==='home'&&!state.companion.enabled")));
// Animation success, failures, unsupported APIs, preferences, and races.
let m=motionApp();m.r('axToggleTheme()');check('native snapshot captures the old appearance first',()=>assert.equal(m.r('state.settings.theme'),'dark'));m.transitions[0].apply();await flush();
check('theme callback saves the requested appearance',()=>assert.equal(m.r('state.settings.theme'),'light'));
check('the wipe targets the new snapshot',()=>assert.equal(m.animations[0].options.pseudoElement,'::view-transition-new(root)'));
check('liquid ink reveal uses a 1000ms timing',()=>assert.equal(m.animations[0].options.duration,1000));
check('ink paths have matching commands for continuous interpolation',()=>{const frames=m.animations[0].frames.clipPath;assert.equal(frames.length,13);const signature=s=>(s.match(/[MCZ]/g)||[]).join('');assert(frames.every(s=>signature(s)===signature(frames[0])));assert.equal((frames[0].match(/M/g)||[]).length,33);assert.equal((frames[0].match(/C/g)||[]).length,864)});
m.animations[0].finish();await flush();check('completed reveal stays filled until native snapshots are removed',()=>assert(m.app.ctx.document.documentElement.dataset.axInkTransition==='active'&&m.animations[0].canceled===0));m.transitions[0].finish();await flush();check('finished effects remove their animation and transient flag',()=>assert(m.animations[0].canceled>0&&!m.app.ctx.document.documentElement.dataset.axInkTransition));
m=motionApp();m.r('axToggleTheme();axToggleTheme()');m.transitions[1].apply();await flush();m.transitions[0].apply();m.transitions[0].finish();await flush();
check('rapid clicks preserve the latest requested appearance',()=>assert.equal(m.r('state.settings.theme'),'dark'));
check('old transition is skipped and cannot start a stale animation',()=>{assert(m.transitions[0].skipped);assert.equal(m.animations.length,1)});m.animations[0].finish();m.transitions[1].finish();await flush();
m=motionApp();m.r('axToggleTheme()');m.transitions[0].fail();await flush();check('snapshot failure applies the preference through the fallback',()=>assert.equal(m.r('state.settings.theme'),'light'));m.transitions[0].apply();m.transitions[0].finish();await flush();check('late failed-transition callbacks do not change it again',()=>assert.equal(m.r('state.settings.theme'),'light'));
m=motionApp();m.r("axToggleTheme();state.settings.theme='system';theme()");m.transitions[0].apply();await flush();check('an explicit later preference survives an old callback',()=>assert.equal(m.r('state.settings.theme'),'system'));check('superseded preference does not animate',()=>assert.equal(m.animations.length,0));m.transitions[0].finish();await flush();
m=motionApp();m.r('state.settings.animations=false;axToggleTheme()');check('app reduced-motion preference changes the theme immediately',()=>assert(m.r("state.settings.theme==='light'")&&m.transitions.length===0));
m=motionApp();m.app.ctx.matchMedia=()=>({matches:true});m.r('axToggleTheme()');check('system reduced motion changes the theme immediately',()=>assert(m.r("state.settings.theme==='light'")&&m.transitions.length===0));
m=motionApp();delete m.app.ctx.document.startViewTransition;m.r('axToggleTheme()');check('older browsers retain a working theme button',()=>assert.equal(m.r('state.settings.theme'),'light'));
m=motionApp();delete m.app.ctx.KeyframeEffect;m.r('axToggleTheme()');check('missing pseudo-element animation support gets an immediate fallback',()=>assert(m.r("state.settings.theme==='light'")&&m.transitions.length===0));
m=motionApp();m.r('axToggleTheme()');m.transitions[0].apply();await flush();m.r('state.settings.animations=false;chrome()');
check('turning off motion during a reveal cancels the effect and keeps the preference',()=>assert(m.animations[0].canceled>0&&m.transitions[0].skipped>0&&m.r("state.settings.theme==='light'")));m.transitions[0].finish();await flush();
m=motionApp();m.app.ctx.document.documentElement.animate=()=>{throw Error('animation unsupported')};m.r('axToggleTheme()');m.transitions[0].apply();await flush();
check('native animation failure leaves the applied theme usable',()=>assert(m.r("state.settings.theme==='light'")&&m.transitions[0].skipped>0));m.transitions[0].finish();await flush();check('failed animation cleans up only after the native transition finishes',()=>assert(!m.app.ctx.document.documentElement.dataset.axInkTransition));
m=motionApp();m.app.ctx.CSS={supports:()=>false};m.r('axToggleTheme()');check('unsupported path clipping falls back without a broken theme',()=>assert(m.r("state.settings.theme==='light'")&&m.transitions.length===0));
check('new interactions have no logged runtime errors',()=>equal(app.errors,[]));
const result={checks,failed:failures.length,failures,searchTiming:timing,method:'Node DOM/media mocks and deferred native-animation mocks',browserTested:false};
fs.mkdirSync(path.join(__dirname,'results'),{recursive:true});fs.writeFileSync(path.join(__dirname,'results/study-flow.json'),JSON.stringify(result,null,2));fs.writeFileSync(path.join(__dirname,'results/study-flow-views.json'),JSON.stringify(views));
console.log(JSON.stringify(result));if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
