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
// Home renders the hierarchy directly; essential actions need no observer pass.
for(const course of ['chinese-1','chinese-2']){
 r(`switchCourse('${course}');navigate('home')`);const home=app.html(),more=r('rxHomeMoreMarkup()');
 designViews.push({name:'workbook/home-'+course,html:home});
 check(course+' Home has one primary next step',()=>assert.equal((home.match(/class="btn primary"/g)||[]).length,1));
 check(course+' primary action matches its current course',()=>assert(home.includes('onclick="'+r('rxNextAction().action')+'"')));
 check(course+' greeting, companion and Scroll remain visible',()=>{for(const token of ['rx-greeting','rx-companion-scene','openScrollQuickAccess()'])assert(home.includes(token));assert(home.indexOf('rx-companion-scene')<home.indexOf('<details class="rx-home-more"'))});
 check(course+' four supporting stats follow the current task without duplicate streak',()=>{assert(home.includes('class="textbtn rx-home-progress"'));assert(!home.includes('class="rx-home-streak"'));assert.equal((home.match(/class="ax-metric ax-metric-/g)||[]).length,4);assert(home.indexOf('class="ax-hero-actions"')<home.indexOf('ax-home-metrics'));assert(home.indexOf('ax-home-metrics')<home.indexOf('class="rx-home-more"'))});
 check(course+' optional games and quests no longer compete on Home',()=>{assert.equal((home.match(/data-game=/g)||[]).length,0);assert(!home.includes('id="bx-quests"'));assert(!home.includes('Quick games'))});
 check(course+' more practice uses closed native details',()=>{assert(more.startsWith('<details class="rx-home-more"><summary>'));assert(!/<details[^>]*\bopen\b/.test(more));assert(!/<summary[^>]*onclick/.test(more))});
 check(course+' secondary learning paths remain available',()=>{for(const action of ["navigate('review')","catchupOpen()","rxOpenHomeHelp()"])assert(more.includes('onclick="'+action+'"'))});
 r('renderHome();renderHome()');check(course+' repeated Home renders do not duplicate links',()=>{assert.equal((app.html().match(/class="rx-home-more"/g)||[]).length,1);assert.equal((app.html().match(/class="ax-row"/g)||[]).length,3)});
}
// Related component forms use one color without changing labels, actions, or knowledge.
const familyNodes=[];function component(glyph,klass='memory-piece'){
 const e=new app.ctx.Element(),span=new app.ctx.Element();span.textContent=glyph;e.classList.add(klass);e.querySelector=s=>s==='[lang=zh]'?span:null;
 e.setAttribute('onclick',`openComponentCard('${glyph}')`);e.setAttribute('aria-label','Explore '+glyph);e.title='Existing explanation';e.glyph=span;familyNodes.push(e);return e;
}
const water=component('氵'),water2=component('水','memory-part-chip'),speech=component('讠'),traditional=component('訁','memory-inline-part'),unknown=component('月'),ambiguous=component('阝'),compound=component('木 + 木');
const partsBefore=r('JSON.stringify({cards:state.cards,learningLab:state.learningLab,xp:bx.xp})');
app.ctx.familyFixture={querySelectorAll:selector=>selector.includes('.memory-piece')?familyNodes:[]};r('axFamily(familyFixture);axFamily(familyFixture)');
check('water form and its side form share a visual cue',()=>assert(water.dataset.family==='water'&&water2.dataset.family==='water'));
check('traditional and simplified speech components share a cue',()=>assert(speech.dataset.family==='speech'&&traditional.dataset.family==='speech'));
check('ambiguous and composite components stay neutral',()=>{for(const e of [unknown,ambiguous,compound])assert(!e.dataset.family)});
check('color preserves names, accessible labels and real lookups',()=>{assert.equal(water.getAttribute('onclick'),"openComponentCard('氵')");assert.equal(water.getAttribute('aria-label'),'Explore 氵');assert.equal(water.title,'Existing explanation')});
check('decorating creates no character knowledge or rewards',()=>assert.equal(r('JSON.stringify({cards:state.cards,learningLab:state.learningLab,xp:bx.xp})'),partsBefore));
water.glyph.textContent='木';r('axFamily(familyFixture)');check('a reused component updates its cue',()=>assert.equal(water.dataset.family,'wood'));
water.glyph.textContent='月';r('axFamily(familyFixture)');check('an unknown replacement clears a stale cue',()=>assert(!water.dataset.family));
let notes=0;const legend={dataset:{},querySelector:s=>s==='[data-family]'?water2:null,insertAdjacentHTML(where,html){assert.equal(where,'afterend');assert(html.includes('roles vary'));notes++}};
app.ctx.familyLegendFixture={querySelectorAll:s=>s==='.memory-part-legend'?[legend]:[]};r('axFamily(familyLegendFixture);axFamily(familyLegendFixture)');check('component explanation is added only once',()=>assert.equal(notes,1));
check('family colors are based on explicit forms, without guessing a word meaning',()=>{for(const [id,forms]of Object.entries(r('AX_FAMILIES')))for(const form of forms)assert.equal(r('AX_FAMILY_OF['+JSON.stringify(form)+']'),id);assert.equal(r("AX_FAMILY_OF['__proto__']"),undefined)});
// Observer callbacks from detached page titles must not update a new page's header.
const originalAll=app.ctx.document.querySelectorAll;let currentTitle=new app.ctx.Element();currentTitle.textContent='Old page';currentTitle.offsetParent={};const observers=[];
app.ctx.IntersectionObserver=class{constructor(cb){this.cb=cb;observers.push(this)}observe(node){this.node=node}disconnect(){this.disconnected=true}};
app.ctx.document.querySelectorAll=selector=>selector==='#view h1'?(currentTitle?[currentTitle]:[]):originalAll(selector);
r('axObservedTitle=null;axSyncTitle()');const firstObserver=observers.at(-1),firstTitle=currentTitle;currentTitle=new app.ctx.Element();currentTitle.textContent='New page';currentTitle.offsetParent={};r('axSyncTitle()');
check('old title observer disconnects on a new page',()=>assert(firstObserver.disconnected));firstObserver.cb([{target:firstTitle,isIntersecting:false}]);check('stale observer cannot hide the new large title',()=>assert(!app.ctx.document.body.classList.contains('ax-title-gone')));
const currentObserver=observers.at(-1);currentObserver.cb([{target:currentTitle,isIntersecting:false}]);check('current observer hands the title to the bar',()=>assert(app.ctx.document.body.classList.contains('ax-title-gone')));currentObserver.cb([{target:currentTitle,isIntersecting:true}]);check('returning title restores the large-title state',()=>assert(!app.ctx.document.body.classList.contains('ax-title-gone')));app.ctx.document.querySelectorAll=originalAll;
// Single forms receive the workbook guide; multi-character words and existing artwork keep their structure.
const han=new app.ctx.Element(),word=new app.ctx.Element(),art=new app.ctx.Element();han.textContent='好';word.textContent='你好';art.textContent='好';art.children.push({});app.ctx.workbookFixture={querySelectorAll:s=>s===r('AX_HERO')?[han,word,art]:[]};
r('axDecorate(workbookFixture);axDecorate(workbookFixture)');check('one Chinese form receives the square',()=>assert(han.classList.contains('ax-tzg')));check('words are not squeezed into a single square',()=>assert(!word.classList.contains('ax-tzg')));check('existing companion/character artwork is preserved',()=>assert(!art.classList.contains('ax-tzg')));
// Compare rich restored profiles, including real Scroll progression. Empty/null
// Scroll state is lazily initialized by the legacy startup; saved sets must persist.
r("state.cards['你']={seen:9,streak:4,interval:7,due:Date.now()+86400000,last:Date.now(),memoryStage:2};state.bookmarks=['你'];state.memoryNotes['你']='My saved visual cue';state.settings.palette='black';state.settings.theme='light';labImportDeck('Chinese,pinyin,English\\n朋友,péngyou,friend\\n学校,xuéxiào,school','Saved class');labData().stamps=11;feedEnsureState().sets=7;save()");
const key='hanzi-reading-room-v2',saved=Object.fromEntries(app.storage),before=r('validateState(state)'),restored=boot(saved,path.dirname(target),path.basename(target));
for(const field of ['cards','bookmarks','memoryNotes','writing','companion','courses','learningLab','readingDesk','commonWords'])check('design startup preserves '+field,()=>equal(restored.run('state['+JSON.stringify(field)+']'),before[field]));
check('saved Black and Light preferences survive startup',()=>assert(restored.run("state.settings.palette==='black'&&state.settings.theme==='light'")));
check('UI initializes without new learning credit',()=>assert.equal(restored.run('bx.xp'),r('bx.xp')));
// Contrast checks below cover palette tokens, not rendered pixels.
function rgb(h){return [1,3,5].map(i=>parseInt(h.slice(i,i+2),16))}function luminance(c){const v=c.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});return .2126*v[0]+.7152*v[1]+.0722*v[2]}function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}function over(f,b,alpha){return f.map((x,i)=>x*alpha+b[i]*(1-alpha))}
for(const [id,p]of Object.entries(r('PALETTES')))for(const mode of ['light','dark']){
 const c=p[mode];check(id+'/'+mode+' text and primary-button tokens have AA contrast',()=>{assert(contrast(rgb(c.ink),rgb(c.panel))>=4.5);assert(contrast(rgb(c.muted),rgb(c.bg))>=4.5);assert(contrast(rgb(c.muted),rgb(c.panel))>=4.5);assert(contrast(rgb(c.green),mode==='light'?[255,255,255]:rgb(c.panel))>=4.5)});
 check(id+'/'+mode+' featured action and its inverted button use AA contrast',()=>assert(contrast(rgb(c.panel),rgb(c.green))>=4.5));
}
// Source-level cascade checks catch the exact rules that defeated existing controls/fallbacks.
const index=fs.readFileSync(target,'utf8'),ref=index.match(/<link[^>]+href="([^"]+)"[^>]+id="ax-design"/),css=ref?fs.readFileSync(path.join(path.dirname(target),ref[1]),'utf8'):index.match(/<style[^>]+id="ax-design"[^>]*>([\s\S]*?)<\/style>/)[1];
const familyTokens=[...css.matchAll(/html\.ax(?:\[data-theme=dark\])?\{--fam-water:[^}]+\}/g)].map(m=>Object.fromEntries([...m[0].matchAll(/--fam-([a-z]+):(#[a-fA-F0-9]{6})/g)].map(x=>[x[1],x[2]])));
check('family themes provide every used color in both appearances',()=>{assert.equal(familyTokens.length,2);for(const row of familyTokens)for(const id of Object.keys(r('AX_FAMILIES')))assert(row[id],id)});
for(const [id,p]of Object.entries(r('PALETTES')))for(const [i,mode] of ['light','dark'].entries()){
 check(id+'/'+mode+' pronunciation text remains legible',()=>{for(const surface of ['bg','panel','elevated'])assert(contrast(rgb(p[mode].accent),rgb(p[mode][surface]))>=4.5)});
 check(id+'/'+mode+' component glyphs remain legible on tinted surfaces',()=>{for(const [family,c]of Object.entries(familyTokens[i]||{}))for(const surface of ['panel','elevated'])assert(contrast(rgb(c),over(rgb(c),rgb(p[mode][surface]),.08))>=4.5,family+'/'+surface)});
}
check('modal blur has reduced-transparency and high-contrast fallbacks',()=>assert(css.lastIndexOf('html.ax .modal-bg{background:rgba(0,0,0,.6)')>css.indexOf('backdrop-filter:blur(6px)')));
check('family cues preserve a noncolor path through original glyphs and labels',()=>assert(css.includes('.memory-piece:not([data-family])')&&css.includes('.memory-part-chip,.memory-inline-part')));
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
