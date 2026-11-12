/* Home hierarchy, native disclosures and route integrity. DOM fixtures do not
   establish actual device layout, glass appearance, or rendered contrast. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{boot}=require('./runtime.cjs');
const app=boot(),r=app.run,checks=[],failures=[],views=[];
const check=(name,fn)=>{checks.push(name);try{fn()}catch(e){failures.push({name,error:e.message})}};
function fresh(course,script='simplified'){
 r(`state=defaults();state.commonWords=cwDefaults();state.readingDesk=rxDefaults();savedResume=null;session=null;writeSession=null;quizSession=null;labRun=null;onboardingStep=null;state.profile.setupDone=true;state.settings.soundEffects=false;state.settings.script='${script}';switchCourse('${course}');closeModal();navigate('home')`);
}
function snapshot(){return r('JSON.stringify({cards:state.cards,words:state.commonWords,reading:state.readingDesk,writing:state.writing,notes:state.memoryNotes,pet:state.companion,xp:bx.xp,activity:state.activity})')}
for(const course of ['chinese-1','chinese-2'])for(const script of ['simplified','traditional'])for(const mode of ['first','review','resume']){
 fresh(course,script);
 if(mode!=='first')r('uniqueCards(courseFocusId()).slice(0,8).forEach(c=>state.cards[c.character]={seen:3,streak:2,interval:3,memoryStage:2,last:Date.now(),due:0})');
 if(mode==='resume')r("startSession('all',courseFocusId());reveal();checkpointCurrent();navigate('home')");
 const before=snapshot();r('renderHome()');const home=app.html(),label=course+'/'+script+'/'+mode;
 views.push({name:'home-polish/'+label,html:home});
 check(label+' retains one primary action matched to its real next task',()=>{assert.equal((home.match(/class="btn primary"/g)||[]).length,1);assert(home.includes('onclick="'+r('rxNextAction().action')+'"'));assert(home.indexOf('class="ax-hero-actions"')<home.indexOf('class="rx-catchup-entry"'))});
 check(label+' offers a direct secondary catch-up route without hiding Scroll',()=>{const tag=home.match(/<button[^>]*class="rx-catchup-entry"[^>]*>/)?.[0];assert(tag?.includes('type="button"'));assert(tag.includes('onclick="catchupOpen()"'));assert(home.includes('Find your gaps.'));assert(home.includes('onclick="openScrollQuickAccess()"'));assert.equal((home.match(/class="rx-catchup-entry"/g)||[]).length,1)});
 check(label+' keeps learning help collapsed with a keyboard-native summary',()=>{const guide=r('rxHomeGuideMarkup()');assert(guide.includes('<details class="rx-guide-disclosure"><summary>'));assert(!/<details[^>]*\bopen\b/.test(guide));assert(!/<summary[^>]*onclick/.test(guide));assert.equal((guide.match(/Show me around/g)||[]).length,1);for(const step of ['Meet it','Read it without help','Come back to it'])assert(guide.includes(step))});
 check(label+' preserves fuller Home in a clear order',()=>{for(const token of ['rx-greeting','rx-companion-scene','ax-home-metrics','id="bx-quests"','All games','<details class="rx-home-more"><summary>','<details class="rx-home-week"><summary>'])assert(home.includes(token));assert.equal((home.match(/data-game=/g)||[]).length,3);assert(home.indexOf('ax-home-metrics')<home.indexOf('rx-home-extras'));assert(home.indexOf('rx-home-extras')<home.indexOf('<details class="rx-home-more"'))});
 r('renderHome();renderHome()');
 check(label+' rendering adds no rewards or knowledge and no duplicate controls',()=>{assert.equal(snapshot(),before);assert.equal((app.html().match(/class="rx-guide-disclosure"/g)||[]).length,1);assert.equal((app.html().match(/class="rx-catchup-entry"/g)||[]).length,1)});
}
fresh('chinese-1');let calls=0;const original=app.ctx.catchupOpen;app.ctx.catchupOpen=()=>calls++;
const action=app.html().match(/class="rx-catchup-entry" onclick="([^"]+)"/)[1];r(action);
check('the secondary entry calls the actual catch-up interface once',()=>assert.equal(calls,1));
if(original)app.ctx.catchupOpen=original;else delete app.ctx.catchupOpen;
r("var hpCatchupOriginal=typeof catchupHomeAction==='function'?catchupHomeAction:null;catchupHomeAction=()=>({eyebrow:'Catch up',title:'Your gap plan',copy:'Continue your plan',button:'Continue catch-up',action:'catchupOpen()',meta:'Active plan'});uniqueCards(courseFocusId()).slice(0,3).forEach(c=>state.cards[c.character]={seen:3,last:Date.now(),due:0,interval:3,memoryStage:2});renderHome()");
check('an intentionally selected catch-up plan takes priority over the ordinary due suggestion',()=>assert.equal(r('rxNextAction().button'),'Continue catch-up'));
r("startSession('all',courseFocusId());reveal();checkpointCurrent();navigate('home')");
check('unfinished practice still takes priority over a catch-up recommendation',()=>assert.equal(r('rxNextAction().action'),'resumeSession()'));
r('if(hpCatchupOriginal)catchupHomeAction=hpCatchupOriginal;else catchupHomeAction=()=>null');
const index=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),css=fs.readFileSync(path.join(__dirname,'..',index.match(/href="([^"]+)" id="ax-design"/)[1]),'utf8');
check('Home uses one full-width lead task and a connected metric strip',()=>{assert(css.includes('grid-template-areas:"hero" "guide" "metrics"'));const metrics=css.match(/html\.ax \.ax-home-metrics\{([^}]+)\}/)[1];assert(metrics.includes('gap:0'));assert(metrics.includes('border:1px solid var(--glass-edge)'));assert(metrics.includes('background:var(--sheen),var(--surface)'));assert(css.includes('.ax-metric:not(:last-child):after'))});
check('both narrow and wide layouts keep flexible columns and large secondary targets',()=>{assert(css.includes('grid-template-columns:40px minmax(0,1fr) 18px'));assert(css.includes('min-height:76px'));assert(css.includes('grid-template-columns:repeat(2,minmax(0,1fr));gap:0'));assert(css.includes('.rx-guide-disclosure>summary{display:flex'));assert(css.includes('min-height:44px;padding:4px 8px'))});
check('new glass and disclosure affordances retain accessibility fallbacks',()=>{const fallback=css.slice(css.lastIndexOf('@media(prefers-reduced-transparency:reduce),(prefers-contrast:more){'));assert(fallback.includes('.ax-home-metrics'));assert(fallback.includes('.rx-catchup-entry'));const reduced=css.slice(css.indexOf('/* Apply these after every glass/motion rule'));assert(reduced.includes('.rx-guide-disclosure>summary>svg'));assert(reduced.includes('.rx-catchup-entry'));assert(css.includes('backdrop-filter:none!important'))});
check('the update uses existing palette tokens without naming a fixed Home palette',()=>{const homeStyles=css.slice(css.indexOf('/* Home is a study desk'),css.indexOf('/* Desktop navigation echoes'));assert(homeStyles.includes('var(--green)'));assert(homeStyles.includes('var(--muted)'));assert(!homeStyles.includes('data-palette='))});
check('Home polish logs no runtime errors',()=>assert.deepEqual(app.errors,[]));
const result={checks:checks.length,failed:failures.length,failures,method:'Node DOM fixtures, actual next-task and saved-session routing, shared-state snapshots, and stylesheet contracts',browserTested:false,deviceTested:false};
fs.mkdirSync(path.join(__dirname,'results'),{recursive:true});fs.writeFileSync(path.join(__dirname,'results/home-polish.json'),JSON.stringify(result,null,2));fs.writeFileSync(path.join(__dirname,'results/home-polish-views.json'),JSON.stringify(views));console.log(JSON.stringify(result));if(failures.length)process.exitCode=1;
