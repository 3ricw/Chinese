/* Picture-learning and presentation regressions. DOM/media objects are mocks;
   these checks do not establish browser layout or perceptual animation quality. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {boot}=require('./runtime.cjs');const app=boot(),r=app.run,views=[],failures=[];let checks=0;
function check(name,fn){checks++;try{fn()}catch(e){failures.push({name,error:e.message})}}
const equal=(a,b)=>assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)));
r("onboardingStep=null;state.profile.setupDone=true;closeModal();state.settings.soundEffects=false;var spoken=[];speechSynthesis.speak=u=>spoken.push(u.text);navigate('home')");
const knowledge=()=>r('JSON.stringify({cards:state.cards,writing:state.writing,words:state.commonWords.records,companion:state.companion,xp:bx.xp,learningLab:state.learningLab})');
const before=knowledge(),keys=r('Object.keys(VM_CUES)');
check('59 original picture cues use existing canonical character records',()=>{assert.equal(keys.length,59);assert(r('Object.keys(VM_CUES).every(ch=>vmCue(ch)&&vmCard(ch).character===ch)'))});
check('all 50 Foundations characters have a picture cue',()=>{assert.equal(r("uniqueCards('I').length"),50);assert(r("uniqueCards('I').every(c=>vmCue(c.character))"))});
check('unknown and inherited object keys have no cue',()=>{for(const ch of ['','山','<script>','__proto__','constructor'])assert.equal(r('vmCue('+JSON.stringify(ch)+')'),null)});
for(const script of ['simplified','traditional']){
 r(`state.settings.script='${script}'`);
 for(const ch of keys){const pic=r('vmPicture('+JSON.stringify(ch)+')'),glyph=r('han(vmCard('+JSON.stringify(ch)+'))');
  check(script+'/'+ch+' artwork keeps the exact written form and a usable label',()=>{assert(pic.includes('>'+glyph+'</text>'));assert(pic.includes('aria-label="'+glyph+' · '));assert(!/(?:href|src)=|<script|<foreignObject|\bid=/.test(pic))});
  views.push({name:'visual/'+script+'/'+ch,html:r('vmStudyMarkup('+JSON.stringify(ch)+')')});
 }
 for(const course of ['chinese-1','chinese-2']){r(`switchCourse('${course}');vmFilter='all';vmLimit=72`);const h=r('vmLibraryMarkup()');views.push({name:'visual/gallery/'+course+'/'+script,html:h});check(course+'/'+script+' shared gallery preserves all canonical forms',()=>assert.equal((h.match(/class="vm-library-card"/g)||[]).length,59))}
}
check('drawing and browsing markup never changes learning data or rewards',()=>assert.equal(knowledge(),before));
r("switchCourse('chinese-1');state.settings.script='simplified';vmOpenLibrary()");
check('first gallery page presents 12 cues with explicit expansion',()=>{const h=app.nodes.get('overlay').innerHTML;assert.equal((h.match(/class="vm-library-card"/g)||[]).length,12);assert(h.includes('Show 12 more pictures'));assert(h.includes('not historical origins'));assert(h.includes('does not count as recall'))});
// Model the actual replacement/focus contract rather than relying on the mock parser.
const overlay=app.nodes.get('overlay'),originalQuery=overlay.querySelector.bind(overlay),originalAll=overlay.querySelectorAll.bind(overlay),filterButtons=new Map(),newCards=Array.from({length:59},()=>new app.ctx.Element());
let replaced=0;const gallery={set outerHTML(h){replaced++;overlay.innerHTML=h}};
overlay.querySelector=s=>s==='.vm-library'?(overlay.innerHTML.includes('class="vm-library"')?gallery:null):s.startsWith('[data-vm-filter=')?filterButtons.get(s.match(/"([^\"]+)"/)[1]):originalQuery(s);
overlay.querySelectorAll=s=>s==='.vm-library-card'?newCards:originalAll(s);
for(const key of ['all','nature','people','things','numbers'])filterButtons.set(key,new app.ctx.Element());
r('vmMore()');check('Show more adds another 12 and focuses the first new cue',()=>{assert.equal((overlay.innerHTML.match(/class="vm-library-card"/g)||[]).length,24);assert.equal(app.ctx.document.activeElement,newCards[12])});
for(const category of ['nature','people','things','numbers']){
 r(`vmSetFilter('${category}')`);check(category+' filters to real category data and retains keyboard focus',()=>{const shown=[...overlay.innerHTML.matchAll(/data-vm-char="([^"]+)"/g)].map(m=>m[1]);assert(shown.length);assert(shown.length<=12);for(const ch of shown)assert.equal(r('VM_CUES['+JSON.stringify(ch)+'][0]'),category);assert.equal(app.ctx.document.activeElement,filterButtons.get(category))});
 views.push({name:'visual/filter/'+category,html:overlay.innerHTML});
}
r("vmSetFilter('all');vmMore();vmMore();vmMore();vmMore();vmMore()");
check('expansion ends with exactly 59 cues and no dead-end load button',()=>{assert.equal((overlay.innerHTML.match(/class="vm-library-card"/g)||[]).length,59);assert(!overlay.innerHTML.includes('onclick="vmMore('))});
r("vmSetFilter('nature');vmMore();vmOpenCard('木');closeModal()");check('returning from a character preserves gallery category and expansion',()=>assert(r("vmFilter==='nature'&&vmLimit===24")));
const stale=Number(overlay.innerHTML.match(/data-vm-turn="(\d+)"/)[1]);r('vmSetFilter("all")');const fresh=r('vmFilter');r(`vmSetFilter('numbers',${stale});vmMore(${stale});vmOpenCard('木',${stale})`);check('old gallery filters, pagination and card buttons cannot change replacement content',()=>assert.equal(r('vmFilter'),fresh));const filterBefore=r('vmFilter');r("navigate('home');vmSetFilter('numbers');vmMore()");check('detached gallery callbacks cannot alter a later screen',()=>assert.equal(r('vmFilter'),filterBefore));
overlay.querySelector=originalQuery;overlay.querySelectorAll=originalAll;
check('gallery navigation grants no learning credit or companion XP',()=>assert.equal(knowledge(),before));
// The existing Shape & memory panel remains in charge of parts and notes.
r("vmOpenCard('木')");check('a picture opens the existing Shape & memory tab',()=>assert(r("cleanStudyTarget==='木'&&cleanStudyTab==='shape'")));
let inserts=0,inserted='',present=false;const full=new app.ctx.Element(),content={querySelector:s=>s==='.memory-full'?full:s==='.vm-picture-block'&&present?{}:null};
full.insertAdjacentHTML=(where,h)=>{assert.equal(where,'beforebegin');inserts++;inserted=h;present=true};
app.ctx.shapeFixture={querySelector:s=>s==='#memory-study-content'?content:null,querySelectorAll:()=>[]};
r('vmDecorate(shapeFixture);vmDecorate(shapeFixture)');
check('repeated observer scans insert one picture beside the component diagram',()=>{assert.equal(inserts,1);assert(full.classList.contains('vm-component-support'));assert(inserted.includes('vmPlain('))});
check('the cue stays inside the existing coverable memory content',()=>assert(inserted.includes('Picture the shape')&&content.querySelector('.vm-picture-block')));
const plain=new app.ctx.Element('vm-test'),button=new app.ctx.Element();app.nodes.set('vm-test',plain);app.ctx.plainButton=button;
r("vmPlain('vm-test',plainButton)");check('Character alone hides the picture with a discoverable reverse action',()=>{assert(plain.classList.contains('is-plain'));assert.equal(button.getAttribute('aria-pressed'),'true');assert.equal(button.textContent,'Show picture')});
r("vmPlain('vm-test',plainButton)");check('picture toggle returns to the original study cue',()=>assert(!plain.classList.contains('is-plain')&&button.textContent==='Character alone'));
plain.isConnected=false;r("vmPlain('vm-test',plainButton)");check('a stale picture toggle cannot change detached content',()=>assert(!plain.classList.contains('is-plain')));
// Introductory images must never leak into an unanswered recall prompt.
r("closeModal();startSession('learn','I')");const intro=new app.ctx.Element();intro.textContent=r('session.queue[session.pos].character');let renders=0;Object.defineProperty(intro,'innerHTML',{get(){return this._html},set(h){this._html=String(h);renders++}});
app.ctx.introFixture={querySelector:s=>s==='.memory-study-card .memory-core>.han'?intro:null,querySelectorAll:()=>[]};
r('vmDecorate(introFixture);vmDecorate(introFixture)');
check('learning introductions receive a single picture plus a plain-form toggle',()=>{assert.equal(renders,1);assert(intro.innerHTML.includes('vm-picture-svg'));assert(intro.innerHTML.includes('vmToggleCue(this)'))});
views.push({name:'visual/introduction',html:'<div class="han vm-intro-glyph">'+intro.innerHTML+'</div>'});
const introButton=new app.ctx.Element();introButton.closest=()=>intro;app.ctx.introButton=introButton;r('vmToggleCue(introButton)');check('intro picture can switch to a plain glyph before retrieval',()=>assert(intro.classList.contains('is-plain')&&introButton.getAttribute('aria-pressed')==='true'));
r("startSession('all','I',['木']);vmDecorate(introFixture)");check('unanswered chapter recall keeps a plain character',()=>assert.equal(renders,1));
r("state.settings.visualMemory=false;startSession('learn','I');vmDecorate(introFixture)");check('disabling visual memory prevents added introduction art',()=>assert.equal(renders,1));r('state.settings.visualMemory=true');
const glyphs=Array.from({length:4},()=>new app.ctx.Element()),scrollCards=glyphs.map((g,i)=>({id:'scroll-card-'+i,querySelector:s=>s==='.scroll-glyph'?g:null}));
scrollCards.push({id:'old-scroll-card-0',querySelector(){throw Error('stale frame should be ignored')}});
app.ctx.scrollFixture={querySelector:()=>null,querySelectorAll:s=>s==='.scroll-frame-card'?scrollCards:[]};
r("currentView='scroll';state.scrollSession={index:0,frames:[{kind:'meet',ch:'木'},{kind:'read',ch:'木'},{kind:'find',ch:'木'},{kind:'part',ch:'木'}]}");const scrollBefore=r('JSON.stringify(state.scrollSession)');r('vmDecorate(scrollFixture);vmDecorate(scrollFixture)');
check('only meet frames gain art; read, find and parts retain their original prompts',()=>{assert(glyphs[0].innerHTML.includes('vm-picture-svg'));for(const g of glyphs.slice(1))assert.equal(g.innerHTML,'')});
check('decorating Scroll changes neither progression nor answer records',()=>assert.equal(r('JSON.stringify(state.scrollSession)'),scrollBefore));
views.push({name:'visual/scroll-meet',html:'<div class="scroll-glyph vm-scroll-glyph">'+glyphs[0].innerHTML+'</div>'});
r("state.scrollSession=null;navigate('home');startSession('all','I',['木']);vmOpenLibrary()");check('opening the visual library marks an unanswered recall as assisted',()=>assert(r('session.usedHint')));
r("closeModal();reveal();rate('good')");check('helped picture exposure cannot manufacture familiar recognition',()=>assert(!r("familiar(cardByChar['木'])")));
r("navigate('home');labStart('parts','1');vmOpenLibrary()");check('an unanswered chapter puzzle records picture lookup as help',()=>assert(r('labRun.usedHint')));
r("closeModal();navigate('home');startQuiz('chapter','1');vmOpenLibrary()");check('quiz picture browsing preserves assisted-answer accounting',()=>assert(r('quizSession.questions[quizSession.pos].usedHint')));
r("closeModal();navigate('home');openScrollQuickAccess();state.scrollSession.index=state.scrollSession.frames.findIndex(f=>f.kind==='read');vmOpenLibrary()");check('Scroll picture lookup marks its current recall frame as helped',()=>assert(r('state.scrollSession.frames[state.scrollSession.index].helped')));
r("closeModal();navigate('home');startWriting('1','characters','pinyin');vmOpenLibrary()");check('writing picture lookup marks an unrevealed answer as helped',()=>assert(r('writeSession.usedHint')));
// User preferences, navigation and real activity stay connected to the new Home.
r("closeModal();navigate('home');state.activity={};state.activity[dayKey()]={cards:2,readings:0};state.settings.visualMemory=true");const week=r('vmHomeMarkup()');
check('weekly strip reflects real recorded activity and identifies today',()=>{assert.equal((week.match(/class="is-active/g)||[]).length,1);assert.equal((week.match(/aria-current="date"/g)||[]).length,1);assert.equal((week.match(/aria-label="[^"]+: (?:no )?practice recorded"/g)||[]).length,7)});
r('state.settings.visualMemory=false');check('Home respects disabled visual aids',()=>assert(!r('vmHomeMarkup()').includes('vm-picture-svg')));r('state.settings.visualMemory=true');
for(const course of ['chinese-1','chinese-2']){r(`switchCourse('${course}');renderHome()`);check(course+' Home keeps one action, a larger companion, Scroll and supporting stats',()=>{const h=app.html();for(const t of ['vm-home-dashboard','rx-home-start','rx-companion-scene','openScrollQuickAccess()','rx-home-progress','ax-home-metrics'])assert(h.includes(t));assert(!h.includes('vm-home-side'));assert.equal((h.match(/class="btn primary"/g)||[]).length,1);assert.equal((h.match(/data-game=/g)||[]).length,0)});views.push({name:'visual/home/'+course,html:app.html()})}
r("navigate('tools')");check('Tools exposes the shared visual library alongside existing tools',()=>assert(app.html().includes('vmOpenLibrary()')&&app.html().includes("navigate('common')")));
r("navigate('lab')");check('chapter practice keeps full-chapter priority and offers picture cues with shape work',()=>{assert(app.html().includes('Full chapter practice'));assert(app.html().includes('Picture cues'))});
r("navigate('home');openQuickLookup();rxSetFindType('actions');updateQuickLookup('picture')");check('Quick Find reaches the visual library with picture search',()=>assert(r('rxFindRows.some(x=>x.kind===\'actions\'&&x.key===10)')));
r('rxRunAction(10)');check('the selected visual activity opens the actual gallery',()=>assert(app.nodes.get('overlay').innerHTML.includes('class="vm-library"')));
check('none of the new actions starts speech automatically',()=>assert.equal(r('spoken.length'),0));
check('picture interactions produce no logged runtime errors',()=>equal(app.errors,[]));
const result={checks,failed:failures.length,failures,cues:keys.length,foundations:50,method:'Node DOM/media mocks and targeted connected-element fixtures',browserTested:false};
fs.mkdirSync(path.join(__dirname,'results'),{recursive:true});fs.writeFileSync(path.join(__dirname,'results/visual-memory.json'),JSON.stringify(result,null,2));fs.writeFileSync(path.join(__dirname,'results/visual-memory-views.json'),JSON.stringify(views));
console.log(JSON.stringify(result));if(failures.length)process.exitCode=1;
