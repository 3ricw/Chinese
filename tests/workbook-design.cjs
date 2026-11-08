/* Design-layer behavior and source-level contrast/cascade checks.
   DOM, observer, and media objects are mocks; this is not browser layout QA. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {boot}=require('./runtime.cjs');const root=path.resolve(__dirname,'..'),target=process.argv[2]?path.resolve(process.argv[2]):path.join(root,'index.html');
const app=boot({},path.dirname(target),path.basename(target)),r=app.run;let checks=0;const failures=[],designViews=[];
function check(name,fn){checks++;try{fn()}catch(e){failures.push({name,error:e.message})}}
const equal=(a,b)=>assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)));
r("onboardingStep=null;state.profile.setupDone=true;closeModal();state.settings.soundEffects=false");
check('design initializes without errors',()=>equal(app.errors,[]));
check('all saved palette IDs remain registered',()=>equal(r('Object.keys(PALETTES).sort()'),['jade','sky','blue','lavender','rose','imperial','amber','sage','black'].sort()));
for(const view of ['home','learn','read','review','tools','common','settings','lab','labdecks']){r(`navigate('${view}')`);check('course selector remains available in '+view,()=>assert(!app.nodes.get('course-selector').hidden))}
r("startSession('all','1')");check('course selector stays hidden during recall',()=>assert(app.nodes.get('course-selector').hidden));r("navigate('lab');labStart('sound','1')");check('course selector stays hidden during a chapter run',()=>assert(app.nodes.get('course-selector').hidden));r("navigate('home')");
designViews.push({name:'workbook/course-selector-1',html:r('axCourseSeg()')});
check('segmented control reports the actual selected course',()=>assert(r("axCourseSeg().includes('aria-pressed=\"true\"')&&axCourseSeg().includes('Chinese 2')")));
r("axSwitchCourse('chinese-2')");designViews.push({name:'workbook/course-selector-2',html:r('axCourseSeg()')});check('course switch keeps Home when started there',()=>assert(r("selectedCourseId==='chinese-2'&&currentView==='home'")));r("navigate('read');axSwitchCourse('chinese-1')");check('course switch returns another browsing view to its course',()=>assert(r("selectedCourseId==='chinese-1'&&currentView==='learn'")));
// Exercise the real home transformation against minimal DOM fixtures.
const view=app.nodes.get('view'),originalQuery=view.querySelector.bind(view);let inserted='',hasList=false,removed=0;
const extras={hidden:false,style:{display:''}},lab={insertAdjacentHTML(where,html){assert.equal(where,'beforebegin');inserted+=html;hasList=true},remove(){removed++}};
r("navigate('home')");const homeHTML=app.html();view.querySelector=sel=>sel==='.rx-home'?{}:sel==='.ax-list'?(hasList?{}:null):sel==='.lab-home-entry'?lab:sel==='.rx-home-extras'?extras:sel==='#bx-quests-title'?{textContent:'0 of 3 daily quests'}:originalQuery(sel);
try{r("typeof axHomeLinks==='function'?axHomeLinks():axSimplifyHome()")}catch(e){failures.push({name:'Home transformation runs',error:e.message})}
check('home transformation retains visible interactive quests and games',()=>assert(!extras.hidden&&extras.style.display!=='none'));
check('full Home still contains three quick-game actions',()=>assert.equal((homeHTML.match(/data-game=/g)||[]).length,3));
check('home grouped links retain a real chapter-practice action',()=>assert(inserted.includes("navigate('lab')")));
check('home grouped links retain a real Review action',()=>assert(inserted.includes("navigate('review')")));
designViews.push({name:'workbook/home-links',html:inserted});const insertedOnce=inserted;try{r("typeof axHomeLinks==='function'?axHomeLinks():axSimplifyHome()")}catch{}
check('home decoration is idempotent',()=>{assert.equal(inserted,insertedOnce);assert.equal(removed,1)});view.querySelector=originalQuery;
// Observer callbacks from detached page titles must not update a new page's header.
const originalAll=app.ctx.document.querySelectorAll;let currentTitle=new app.ctx.Element();currentTitle.textContent='Old page';currentTitle.offsetParent={};const observers=[];
app.ctx.IntersectionObserver=class{constructor(cb){this.cb=cb;observers.push(this)}observe(node){this.node=node}disconnect(){this.disconnected=true}};
app.ctx.document.querySelectorAll=selector=>selector==='#view h1'?(currentTitle?[currentTitle]:[]):originalAll(selector);
r('axObservedTitle=null;axSyncTitle()');const firstObserver=observers.at(-1),firstTitle=currentTitle;currentTitle=new app.ctx.Element();currentTitle.textContent='New page';currentTitle.offsetParent={};r('axSyncTitle()');
check('old title observer disconnects on a new page',()=>assert(firstObserver.disconnected));firstObserver.cb([{target:firstTitle,isIntersecting:false}]);check('stale observer cannot hide the new large title',()=>assert(!app.ctx.document.body.classList.contains('ax-title-gone')));
const currentObserver=observers.at(-1);currentObserver.cb([{target:currentTitle,isIntersecting:false}]);check('current observer hands the title to the bar',()=>assert(app.ctx.document.body.classList.contains('ax-title-gone')));currentObserver.cb([{target:currentTitle,isIntersecting:true}]);check('returning title restores the large-title state',()=>assert(!app.ctx.document.body.classList.contains('ax-title-gone')));app.ctx.document.querySelectorAll=originalAll;
// Single forms receive the workbook guide; multi-character words and existing artwork keep their structure.
const han=new app.ctx.Element(),word=new app.ctx.Element(),art=new app.ctx.Element();han.textContent='好';word.textContent='你好';art.textContent='好';art.children.push({});app.ctx.workbookFixture={querySelectorAll:s=>s.includes('palette-choice')?[]:[han,word,art]};
r('axDecorate(workbookFixture);axDecorate(workbookFixture)');check('one Chinese form receives the square',()=>assert(han.classList.contains('ax-tzg')));check('words are not squeezed into a single square',()=>assert(!word.classList.contains('ax-tzg')));check('existing companion/character artwork is preserved',()=>assert(!art.classList.contains('ax-tzg')));
// Compare fresh and rich restored profiles; UI initialization cannot migrate away their records.
r("state.cards['你']={seen:9,streak:4,interval:7,due:Date.now()+86400000,last:Date.now(),memoryStage:2};state.bookmarks=['你'];state.memoryNotes['你']='My saved visual cue';state.settings.palette='black';state.settings.theme='light';labImportDeck('Chinese,pinyin,English\\n朋友,péngyou,friend\\n学校,xuéxiào,school','Saved class');labData().stamps=11;save()");
const key='hanzi-reading-room-v2',saved=Object.fromEntries(app.storage),before=r('validateState(state)'),restored=boot(saved,path.dirname(target),path.basename(target));
for(const field of ['cards','bookmarks','memoryNotes','writing','companion','courses','learningLab','readingDesk','commonWords'])check('design startup preserves '+field,()=>equal(restored.run('state['+JSON.stringify(field)+']'),before[field]));
check('saved Black and Light preferences survive startup',()=>assert(restored.run("state.settings.palette==='black'&&state.settings.theme==='light'")));
check('UI initializes without new learning credit',()=>assert.equal(restored.run('bx.xp'),r('bx.xp')));
// Contrast checks below cover token colors and sampled hero mesh, not rendered pixels.
function rgb(h){return [1,3,5].map(i=>parseInt(h.slice(i,i+2),16))}function luminance(c){const v=c.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});return .2126*v[0]+.7152*v[1]+.0722*v[2]}function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}function over(f,b,alpha){return f.map((x,i)=>x*alpha+b[i]*(1-alpha))}
for(const [id,p]of Object.entries(r('PALETTES')))for(const mode of ['light','dark']){
 const c=p[mode];check(id+'/'+mode+' text and primary-button tokens have AA contrast',()=>{assert(contrast(rgb(c.ink),rgb(c.panel))>=4.5);assert(contrast(rgb(c.muted),rgb(c.bg))>=4.5);assert(contrast(rgb(c.muted),rgb(c.panel))>=4.5);assert(contrast(rgb(c.green),mode==='light'?[255,255,255]:rgb(c.panel))>=4.5)});
 check(id+'/'+mode+' hero text has contrast across its mesh',()=>{for(let y=0;y<=10;y++)for(let x=0;x<=10;x++){const da=Math.hypot((x/10-1)/1.2,(y/10)/1.4),db=Math.hypot((x/10)/.9,(y/10-1.15)/1.2),a=(mode==='dark'?.24:.16)*Math.max(0,1-da/.58),b=(mode==='dark'?.12:.09)*Math.max(0,1-db/.55),bg=over(rgb(c.green),over(rgb(c.accent),rgb(c.panel),b),a);assert(contrast(rgb(c.muted),bg)>=4.5);assert(contrast(rgb(c.ink),bg)>=4.5)}});
}
// Source-level cascade checks catch the exact rules that defeated existing controls/fallbacks.
const index=fs.readFileSync(target,'utf8'),ref=index.match(/<link[^>]+href="([^"]+)"[^>]+id="ax-design"/),css=ref?fs.readFileSync(path.join(path.dirname(target),ref[1]),'utf8'):index.match(/<style[^>]+id="ax-design"[^>]*>([\s\S]*?)<\/style>/)[1];
check('theme and sound controls are not removed by the stylesheet',()=>assert(!/#theme-btn[^{}]*#sound-btn\s*\{[^}]*display\s*:\s*none/.test(css)));
check('root pages retain a usable Back control',()=>assert(!/ax-root\s+\.back-btn\s*\{[^}]*display\s*:\s*none/.test(css)));
check('navigation height and padding follow the single easing controller',()=>{const nav=css.match(/html\.ax \.mobile-nav\{bottom:[^}]+\}/)?.[0]||'';assert(nav.includes('--bx-nav-progress'));const button=css.match(/html\.ax \.mobile-nav button\{border-radius:[^}]+\}/)?.[0]||'';assert(button.includes('--bx-nav-progress'))});
check('quiz feedback survives later neutral fill rules',()=>assert(css.lastIndexOf('.quiz-choice:is(.correct,.right)')>css.lastIndexOf('/* Answer choices')));
check('reduced transparency wins over all glass backgrounds',()=>assert(css.lastIndexOf('@media(prefers-reduced-transparency:reduce)')>css.lastIndexOf('background:var(--glass)')));
check('app animation setting disables the new sheet motion',()=>assert(css.includes('body.flow-reduce-motion')&&css.includes('animation:none!important')));
check('modal close control has a 44px hit area',()=>assert(/\.modal :is\(\.modal-close,[^{}]+\{width:44px!important;height:44px!important;min-width:44px!important;min-height:44px!important/.test(css)));
check('character guides have a width constraint on phones',()=>assert(/\.ax-tzg\{[^}]*max-width:100%/.test(css)));
check('design processing produces no runtime errors',()=>equal(app.errors,[]));
const result={checks,failed:failures.length,failures,method:'Node DOM/media mocks, numeric color checks, and stylesheet source checks',browserTested:false};if(!process.argv[2]){fs.mkdirSync(path.join(root,'tests/results'),{recursive:true});fs.writeFileSync(path.join(root,'tests/results/workbook-design.json'),JSON.stringify(result,null,2));fs.writeFileSync(path.join(root,'tests/results/workbook-views.json'),JSON.stringify(designViews))}
console.log(JSON.stringify(result));if(failures.length)process.exitCode=1;
