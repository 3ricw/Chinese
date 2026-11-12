/* Tests the photographed Home regression and presentation lifecycles.
   DOM/media/animation APIs are mocked. No browser layout or iPhone FPS claim. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {boot}=require('./runtime.cjs');const app=boot(),r=app.run,checks=[],failures=[],views=[];
function check(name,f){checks.push(name);try{f()}catch(e){failures.push({name,error:e.message})}}
const equal=(a,b)=>assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)));
const flush=async()=>{for(let i=0;i<4;i++)await Promise.resolve()};
const index=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),styles=[...index.matchAll(/href="(assets\/[^\"]+\.css)"/g)].map(m=>({file:m[1],css:fs.readFileSync(path.join(__dirname,'..',m[1]),'utf8')}));
const design=styles.find(x=>x.file.startsWith('assets/workbook-design')).css;
(async()=>{
 r("onboardingStep=null;state.profile.setupDone=true;closeModal();state.settings.soundEffects=false;state.profile.name='Eric';starterPreview='dragon';chooseStarter();var utterances=[];speechSynthesis.speak=u=>utterances.push(u.text);navigate('home')");
 const knowledge=r('JSON.stringify({cards:state.cards,words:state.commonWords,reading:state.readingDesk,writing:state.writing,activity:state.activity,pet:state.companion,xp:bx.xp})');
 for(const course of ['chinese-1','chinese-2'])for(const scenario of ['fresh','due','resume']){
  r(`switchCourse('${course}');state.cards={};state.courses.records[selectedCourseId].resume=null`);
  if(scenario==='due')r("uniqueCards(courseFocusId()).slice(0,8).forEach(c=>state.cards[c.character]={seen:3,due:0,interval:1,streak:1,last:Date.now()-86400000})");
  if(scenario==='resume')r("startSession('all',courseFocusId());checkpointCurrent()");
  r("navigate('home')");const h=app.html();views.push({name:'mobile/home/'+course+'/'+scenario,html:h});
  check(course+'/'+scenario+' keeps the primary and Scroll together outside the text container',()=>{const intro=h.indexOf('class="feed-home-copy"'),desc=h.indexOf('class="rx-hero-description"'),actions=h.indexOf('class="ax-hero-actions"');assert(intro>=0&&desc>intro&&actions>desc);assert(h.slice(intro,desc).includes('</h2></div>'));assert(h.slice(actions).includes('Open Scroll'));assert.equal((h.match(/class="btn primary"/g)||[]).length,1)});
  check(course+'/'+scenario+' keeps the caption after the actions, away from the art stage',()=>assert(h.indexOf('id="rx-buddy-note"')>h.indexOf('class="ax-hero-actions"')));
  check(course+'/'+scenario+' retains four metrics, calendar, three games and quests',()=>{assert.equal((h.match(/class="ax-metric ax-metric-/g)||[]).length,4);assert.equal((h.match(/data-game=/g)||[]).length,3);assert(h.includes('class="vm-home-side"'));assert(h.includes('id="bx-quests"'))});
 }
 check('the photographed display:contents rule is removed from every active stylesheet',()=>assert(!styles.some(s=>/\.feed-home-copy\s*\{[^}]*display\s*:\s*contents/.test(s.css))));
 check('the old mobile row placements no longer compete with the current Home grid',()=>{const old=styles.find(s=>s.file.startsWith('assets/course-consistency')).css;assert(!/\.rx-home \.rx-hero \.feed-home-copy[^{}]*\{[^}]*grid-(?:column|row)/.test(old));assert(!/\.rx-home \.rx-companion-scene\{grid-column/.test(old))});
 check('mobile Home uses full-width description/actions, with a smaller-screen action-first fallback',()=>{assert(design.includes('"copy buddy" "description description" "actions actions"'));assert(design.includes('"copy buddy" "actions actions" "description description"'));assert(design.includes('.feed-home-copy{display:block;grid-area:copy'));assert(design.includes('grid-area:description'));assert(design.includes('grid-area:actions'))});
 check('mobile places the learning explanation before progress; the optional calendar moves below exploration',()=>assert(design.includes('grid-template-areas:"hero" "guide" "metrics"')));
 check('mobile bar still uses the existing width/height progress and a steady bottom edge',()=>{assert(design.includes('bottom:calc(8px + env(safe-area-inset-bottom))'));assert(design.includes('--bx-nav-progress'));assert(design.includes('min-height:calc(54px - 10px * var(--bx-nav-progress,0))'));assert(!design.includes('bottom:calc(8px -'))});
 check('the selected lens is decorative and five destinations stay available',()=>{const h=r('mainNavigationMarkup(true)');for(const label of ['Home','Course','Scroll','Arcade','Tools'])assert(h.includes('>'+label+'<'));assert.equal((h.match(/<button\b/g)||[]).length,5);assert(design.includes('.mobile-nav:after{content:'));assert(design.includes('.mobile-nav:has(>button:nth-child(5).active)'))});
 check('tap decoration cannot change the positioning of close and floating icon buttons',()=>assert(!/:is\(\.btn,\.iconbtn[^{}]*\)\{position:relative/.test(design)));
 check('atmosphere sits behind the shell and cannot receive input',()=>{assert(index.includes('id="ax-atmosphere" aria-hidden="true"'));assert(design.includes('.shell{position:relative;z-index:1}'));assert(design.includes('#ax-atmosphere{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;contain:strict}'))});
 for(const view of ['arcade','tools','common','learn','review','settings']){
  r(`navigate('${view}')`);views.push({name:'mobile/'+view,html:app.html()});
  check(view+' keeps its existing learning route and renders without undefined text',()=>{assert(app.html().length>300);assert(!/>\s*(?:undefined|NaN)\s*</.test(app.html()))});
 }
 r("state.companion.enabled=false;renderHome()");check('disabled companion mode retains a bounded character cue on narrow screens',()=>{assert(!app.html().includes('id=\"rx-home-buddy-art\"'));assert(app.html().includes('rx-quiet-glyph'));assert(design.includes('font-size:clamp(48px,12vw,112px)'));assert(design.includes('.rx-buddy-stage>.rx-quiet-glyph{'))});r("state.companion.enabled=true");
 r("navigate('arcade')");
 check('Arcade keeps all six games and real level progress',()=>{assert.equal((app.html().match(/class="bx-game-tile"/g)||[]).length,6);assert(app.html().includes(r('bx.xp.toLocaleString()')+' XP'));assert(app.html().includes('<details class="bx-tone-options">'))});
 check('Tone modes and honest game/speech explanations remain discoverable without the wall of text',()=>{const h=app.html();for(const s of ['Automatic','Listen (audio)','Read (no audio)','bxSetToneMode(this.value)','How game progress works','unassisted recall on separate days','does not reliably grade pronunciation'])assert(h.includes(s));assert(!h.includes('Short rounds that train'))});
 // Real connected-element fixtures exercise cancellation and stale observers.
 r("navigate('home');state.settings.animations=true");const animations=[],observers=[];
 app.ctx.Element.prototype.animate=function(frames,options){let done,fail;const finished=new Promise((a,b)=>{done=a;fail=b});const a={el:this,frames,options,finished,canceled:0,resolve:done,cancel(){this.canceled++;fail(Error('canceled'))}};animations.push(a);return a};
 function element(top=100,tag='DIV'){
  const e=new app.ctx.Element();e.tagName=tag;e.isConnected=true;e.parentElement={closest:()=>null};e.getBoundingClientRect=()=>({top,bottom:top+120,left:10,right:210,width:200,height:120});
  return e;
 }
 app.ctx.IntersectionObserver=class{constructor(cb,options){this.cb=cb;this.options=options;this.observed=new Set();this.disconnected=false;observers.push(this)}observe(e){this.observed.add(e)}unobserve(e){this.observed.delete(e)}disconnect(){this.disconnected=true;this.observed.clear()}};
 const first=element(),visible=element(100),below=element(1300),progress=element();first.querySelectorAll=s=>s.includes('.rx-home-start')?[visible,below]:s.includes('.ax-metric-track')?[progress]:[];app.nodes.get('view').children=[first];
 const stateBeforeMotion=r('JSON.stringify({cards:state.cards,words:state.commonWords,activity:state.activity,pet:state.companion,xp:bx.xp})');
 r('axMotionPass()');check('one entrance starts immediately and observes cards below the fold',()=>{assert.equal(animations.length,3);assert.equal(observers.length,1);assert(observers[0].observed.has(below));assert.equal(animations[0].options.duration,220)});
 r('axMotionPass();axMotionPass()');check('decorating the same page again cannot replay its entrance',()=>assert.equal(animations.length,3));
 observers[0].cb([{target:below,isIntersecting:true},{target:below,isIntersecting:true}]);check('duplicate visibility entries animate a card once',()=>assert.equal(animations.filter(a=>a.el===below).length,1));
 const second=element();second.querySelectorAll=()=>[];app.nodes.get('view').children=[second];r('axMotionPass()');const afterReplace=animations.length;
 check('new pages cancel old animations and detach their observer',()=>{assert(observers[0].disconnected);assert(animations.slice(0,4).every(a=>a.canceled))});
 observers[0].cb([{target:below,isIntersecting:true}]);check('a stale observer cannot animate a replaced page',()=>assert.equal(animations.length,afterReplace));
 const button=element(100,'BUTTON');button.id='normal-button';button.getBoundingClientRect=()=>({top:20,bottom:64,left:10,right:210,width:200,height:44});button.innerHTML='Learn';
 app.ctx.pressFixture=button;app.ctx.pressTarget={closest:()=>button};
 r("axPressEvent({type:'pointerdown',detail:0,button:0,isPrimary:true,target:pressTarget,clientX:50,clientY:35})");let ripple=button.children.at(-1);
 check('touch feedback follows the touch and is hidden from assistive technology',()=>{assert(ripple);assert.equal(ripple.style.left,'-140px');assert.equal(ripple.getAttribute('aria-hidden'),'true');assert.equal(button.innerHTML,'Learn')});
 const count=button.children.length;r("axPressEvent({type:'click',detail:1,target:pressTarget,clientX:50,clientY:35})");check('the subsequent pointer click does not create another ripple',()=>assert.equal(button.children.length,count));
 r("axPressEvent({type:'click',detail:0,target:pressTarget})");check('keyboard activation receives centered feedback',()=>assert.equal(button.children.at(-1).style.left,'-80px'));
 const rippleAnimations=animations.filter(a=>a.el.className==='ax-press-ripple');r('axStopDisplayMotion()');await flush();check('canceled feedback removes decorative nodes',()=>assert(rippleAnimations.every(a=>!a.el.isConnected)));
 const rejected=animations.length;button.disabled=true;r("axPressEvent({type:'pointerdown',button:0,target:pressTarget})");button.disabled=false;button.id='theme-btn';r("axPressEvent({type:'pointerdown',button:0,target:pressTarget})");check('disabled controls and the ink button do not acquire conflicting feedback',()=>assert.equal(animations.length,rejected));button.id='normal-button';
 const art=element(),stage=element();art.closest=()=>stage;app.nodes.set('rx-home-buddy-art',art);r('axReactBuddy()');check('companion reactions use fixed-stage transforms and three temporary sparks',()=>{assert(animations.some(a=>a.el===art));assert.equal(stage.children.filter(e=>e.className==='ax-buddy-spark').length,3)});
 r('axReactBuddy();axReactBuddy()');await flush();check('rapid companion taps replace the previous reaction instead of stacking sparks',()=>assert.equal(stage.children.filter(e=>e.className==='ax-buddy-spark').length,3));
 r('axStopDisplayMotion()');await flush();check('canceled companion reactions remove their sparks',()=>assert.equal(stage.children.length,0));
 const beforeDisabled=animations.length;r('state.settings.animations=false;axReactBuddy();axPressEvent({type:"click",detail:0,target:pressTarget})');check('the saved app motion setting prevents all new effects',()=>assert.equal(animations.length,beforeDisabled));
 r('state.settings.animations=true');app.ctx.document.visibilityState='hidden';r('axReactBuddy()');check('hidden pages do no new animation work',()=>assert.equal(animations.length,beforeDisabled));app.ctx.document.visibilityState='visible';
 app.ctx.matchMedia=()=>({matches:true});r('axReactBuddy()');check('system reduced motion prevents effects too',()=>assert.equal(animations.length,beforeDisabled));app.ctx.matchMedia=()=>({matches:false});
 check('all presentation effects preserve learning data, rewards and companion XP',()=>assert.equal(r('JSON.stringify({cards:state.cards,words:state.commonWords,activity:state.activity,pet:state.companion,xp:bx.xp})'),stateBeforeMotion));
 check('no layout, motion or browsing started automatic audio',()=>assert.equal(r('utterances.length'),0));
 check('solid fallbacks remove ambient layers and blur while retaining the selected tab',()=>{assert(design.includes('html.ax #ax-atmosphere{display:none}'));assert(design.includes('.mobile-nav:after{background:var(--soft)!important'));assert(design.includes('--study-surface:var(--panel)'))});
 check('motion uses the existing render observer and no additional frame loop',()=>{const f=index.match(/src="(assets\/workbook-design[^\"]*\.js)"/)[1],js=fs.readFileSync(path.join(__dirname,'..',f),'utf8');assert.equal((js.match(/new MutationObserver/g)||[]).length,1);const section=js.slice(js.indexOf('const AX_MOTION_CARDS'),js.indexOf('let axFrame=0'));assert(!section.includes('requestAnimationFrame'));assert(!section.includes('setInterval'));assert(!section.includes('setTimeout'));assert(js.includes('axSyncTitle();axMotionPass()'))});
 await flush();check('presentation tests log no runtime errors',()=>equal(app.errors,[]));
 const result={checks:checks.length,failed:failures.length,failures,method:'Node DOM/media/native-animation mocks, connected-element fixtures, and source-level regressions for photographed mobile layout; no browser/device rendering',browserTested:false,deviceTested:false};
 fs.mkdirSync(path.join(__dirname,'results'),{recursive:true});fs.writeFileSync(path.join(__dirname,'results/mobile-motion.json'),JSON.stringify(result,null,2));fs.writeFileSync(path.join(__dirname,'results/mobile-motion-views.json'),JSON.stringify(views));console.log(JSON.stringify(result));if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
