/* Presentation/data and ink geometry contracts. DOM and animation APIs are
   mocked; these checks do not establish browser pixels or device performance. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{performance}=require('node:perf_hooks');
const {boot}=require('./runtime.cjs');const app=boot(),r=app.run,views=[],failures=[],masks=[];let checks=0;
function check(name,fn){checks++;try{fn()}catch(e){failures.push({name,error:e.message})}}
const equal=(a,b)=>assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)));
r("onboardingStep=null;state.profile.setupDone=true;closeModal();state.settings.soundEffects=false;var spoken=[];speechSynthesis.speak=u=>spoken.push(u.text);navigate('home')");
const before=r('JSON.stringify({cards:state.cards,writing:state.writing,companion:state.companion,words:state.commonWords,reading:state.readingDesk,xp:bx.xp})');
for(const course of ['chinese-1','chinese-2']){
 r(`switchCourse('${course}');navigate('home')`);const h=app.html();views.push({name:'glass/home/'+course,html:h});
 check(course+' leads with one task and one closed More section',()=>{assert(h.indexOf('class="rx-home-start"')<h.indexOf('<details class="rx-home-more"'));for(const token of ['rx-home-guide','rx-home-extras','rx-home-week'])assert(!h.includes(token));assert(!/<details[^>]*\bopen\b/.test(h))});
 check(course+' Home restores actual stats below its primary task',()=>{assert(h.includes('class="textbtn rx-home-progress"'));assert(!h.includes('class="rx-home-streak"'));assert.equal((h.match(/class="ax-metric ax-metric-/g)||[]).length,4);assert.equal((h.match(/class="btn primary"/g)||[]).length,1);assert(h.indexOf('class="ax-hero-actions"')<h.indexOf('ax-home-metrics'))});
 check(course+' new learners get an actionable guided introduction',()=>{assert(h.includes('Meet your first 3 characters'));assert(h.includes('Learn 3 characters'));assert(h.includes("startSession('learn'"));assert(h.includes('Open Scroll'))});
 check(course+' course and chapter labels use public names',()=>{assert(h.includes(r('currentCourse().name')+' · '+r('lessonLabel(courseFocusId())')));assert(!/>[^<]*c2-\d/.test(h))});
 check(course+' minimal Home retains personality and Scroll without game panels',()=>{for(const word of ['rx-companion-scene','Open Scroll','rx-home-progress','ax-home-metrics'])assert(h.includes(word));assert(!h.includes('id="bx-quests"'));assert.equal((h.match(/data-game=/g)||[]).length,0)});
 r('renderHome();renderHome()');check(course+' repeated renders keep one stats strip without adding other panels',()=>{assert.equal((app.html().match(/class="ax-calendar-date"/g)||[]).length,0);assert.equal((app.html().match(/ax-home-metrics/g)||[]).length,1);assert.equal((app.html().match(/class="rx-home-more"/g)||[]).length,1)});
}
check('rendering the glass desk never changes knowledge, rewards or saved readings',()=>assert.equal(r('JSON.stringify({cards:state.cards,writing:state.writing,companion:state.companion,words:state.commonWords,reading:state.readingDesk,xp:bx.xp})'),before));
r("state.activity[dayKey()]={cards:7,readings:1};state.settings.goal=20;bx.xp=6503;bx.freezes=1");
const stats=r('axHomeMetrics()');views.push({name:'glass/live-metrics',html:stats});
check('goal displays actual checks and a bounded percentage',()=>assert(stats.includes('>7/20</strong>')&&stats.includes('35% of daily checks')&&stats.includes('width:35%')));
check('level and remaining XP come from the existing reward engine',()=>assert(stats.includes('>'+r('bxLevelInfo().level')+'</strong>')&&stats.includes(r('bxLevelInfo().need-bxLevelInfo().into')+' XP to level '+r('bxLevelInfo().level+1'))));
check('review card shows the actual selected-course due count',()=>assert(stats.includes('>'+r('dueCards().length')+'</strong>')));
check('streak freeze wording reflects the actual inventory',()=>assert(stats.includes('1 streak freeze available')));
r('state.activity[dayKey()].cards=80');check('completed daily goal cannot overflow its track or companion ring',()=>assert(r('axHomeMetrics().includes("width:100%")&&axGoalOrbit().includes("--ax-goal:100%")')));
r('state.companion.enabled=false;state.settings.visualMemory=false;renderHome()');
check('disabled companion and visual-memory settings remain respected',()=>{assert(!app.html().includes('id="rx-home-buddy-art"'));assert(!app.html().includes('class="vm-home-picture"'));assert(!app.html().includes('ax-calendar-date'));assert(app.html().includes('rx-quiet-glyph'))});
check('specific resume instructions are retained',()=>assert.equal(r("axHomeIntro({action:'resumeSession()',eyebrow:'Continue',copy:'Step 7 of 20'}).copy"),'Step 7 of 20'));
const find=r('axSidebarFind()');views.push({name:'glass/sidebar-find',html:find});check('sidebar search calls the established assisted Quick Find',()=>assert(find.includes('onclick="openQuickLookup()"')&&find.includes('Ctrl K')));
check('calendar uses an explicit calendar symbol with a history action',()=>{const h=r('vmHomeMarkup()');assert(h.includes('aria-label="Open your practice history"'));assert(h.includes(r('axCalendarIcon()')))});
check('the new presentation starts no audio',()=>assert.equal(r('spoken.length'),0));
// All frames share one native path structure. Empty/full endpoints must not
// leave droplets or holes visible after native snapshots have been removed.
const prepare=[];
for(const [width,height]of [[390,844],[1280,860]])for(const phase of [.7,2.4]){
 const x=width-28,y=32,radius=Math.hypot(x,height-y)*1.3,start=performance.now(),frames=r(`axInkFrames(${x},${y},${radius},${phase})`);prepare.push(performance.now()-start);
 const code=s=>(s.match(/[MCZ]/g)||[]).join(''),numeric=s=>(s.match(/-?\d+(?:\.\d+)?/g)||[]).map(Number);
 check(width+'/'+phase+' uses 29 continuously interpolable multi-contour frames',()=>{assert.equal(frames.length,29);assert(frames.every(s=>s.startsWith('path("M')&&s.endsWith('")')&&code(s)===code(frames[0])));assert.equal((frames[0].match(/M/g)||[]).length,33);assert.equal((frames[0].match(/C/g)||[]).length,1104)});
 check(width+'/'+phase+' has finite geometry in every frame',()=>assert(frames.every(s=>!/(?:NaN|Infinity|undefined)/.test(s)&&numeric(s).every(Number.isFinite))));
 check(width+'/'+phase+' starts with no exposed picture area',()=>{const n=numeric(frames[0]);assert(n.every((v,i)=>Math.abs(v-(i%2?y:x))<.01))});
 check(width+'/'+phase+' ends with one enclosing contour and collapsed details',()=>{const paths=frames.at(-1).slice(6,-2).match(/M[^M]+/g);assert.equal(paths.length,33);for(const d of paths.slice(1)){const n=numeric(d),cx=n[0],cy=n[1];assert(n.every((v,i)=>Math.abs(v-(i%2?cy:cx))<.01))}const first=numeric(paths[0]);for(let i=0;i<first.length;i+=2)assert(Math.abs(Math.hypot(first[i]-x,first[i+1]-y)-radius)<1)});
 check(width+'/'+phase+' edge includes curves, wisps and veins instead of a circular wipe',()=>{assert(frames[14].length>25000);const parts=frames[14].slice(6,-2).match(/M[^M]+/g);assert(parts.slice(1).every(s=>new Set(numeric(s)).size>5))});
 for(const index of [0,7,14,21,28])masks.push({name:width+'-'+phase+'-'+index,width,height,index,last:frames.length-1,path:frames[index].slice(6,-2)});
}
const index=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),css=fs.readFileSync(path.join(__dirname,'..',index.match(/href="([^"]+)" id="ax-design"/)[1]),'utf8');
const materialStart=css.indexOf('Glass material tokens'),darkStart=css.indexOf('html.ax[data-theme=dark]{',materialStart),lightMaterial=css.slice(materialStart,darkStart),darkMaterial=css.slice(darkStart,css.indexOf('/* Local color fields',darkStart));
function amount(block,key){const m=block.match(new RegExp('--'+key+':color-mix\\(in srgb,var\\(--[^)]+\\) ([0-9.]+)%'));assert(m,key);return +m[1]/100}
// Contrast of declared materials over conservative ambient-color bounds.
function rgb(h){return [1,3,5].map(i=>parseInt(h.slice(i,i+2),16))}function mix(f,b,t){return f.map((x,i)=>x*t+b[i]*(1-t))}function lum(c){const a=c.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});return .2126*a[0]+.7152*a[1]+.0722*a[2]}function contrast(a,b){const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
for(const [id,p]of Object.entries(r('PALETTES')))for(const mode of ['light','dark']){
 const c=p[mode],dark=mode==='dark',green=rgb(c.green),ink=rgb(c.ink),bg=rgb(c.bg),panel=rgb(c.panel),muted=rgb(c.muted),glow=dark?.25:.22;
 const ambient=mix(green,mix(rgb(c.accent),mix(green,bg,glow),.13),glow);
 check(id+'/'+mode+' frosted surfaces retain readable text across ambient extremes',()=>{for(const base of [bg,ambient]){const surface=mix([255,255,255],mix(panel,base,amount(dark?darkMaterial:lightMaterial,'surface')),dark?.075:.24);assert(contrast(ink,surface)>=4.5);assert(contrast(muted,surface)>=4.5);const study=mix([255,255,255],mix(panel,base,dark?.96:.95),dark?.075:.24);assert(contrast(ink,study)>=4.5);assert(contrast(rgb(c.accent),study)>=4.5)}});
 const material=dark?darkMaterial:lightMaterial,glass=mix([255,255,255],mix(dark?rgb(c.elevated):panel,ambient,amount(material,'glass')),dark?.075:.24),bar=mix(green,glass,.09),lens=mix(green,bar,.16),label=mix(ink,muted,amount(lightMaterial,'glass-label')),accent=mix(green,ink,amount(lightMaterial,'glass-accent'));
 check(id+'/'+mode+' translucent navigation retains AA text and visible colored icons',()=>{assert(contrast(label,bar)>=4.5);assert(contrast(ink,lens)>=4.5);assert(contrast(accent,lens)>=3)});
 check(id+'/'+mode+' hero and its inverted action have readable contrast',()=>{const top=dark?mix(green,panel,.28):green,bottom=dark?mix(green,panel,.12):mix(green,[0,0,0],.84),fg=dark?ink:[255,255,255];for(let t=0;t<=10;t++)assert(contrast(fg,mix([255,255,255],mix(top,bottom,t/10),.07))>=4.5);assert(contrast(bottom,fg)>=4.5)});
}

check('glass material is shared by outer cards, practice, tools and sheets',()=>{for(const token of ['background-color:var(--surface)!important','var(--study-surface)!important','var(--sheet)!important','--glass-side:','backdrop-filter:blur(18px)'])assert(css.includes(token),token)});
check('unsupported blur and accessibility modes use opaque tokens in both appearances',()=>{assert(css.includes('@supports not ((backdrop-filter:blur(1px))'));assert.equal((css.match(/html\.ax,html\.ax\[data-theme=dark\]\{--surface:var\(--panel\)/g)||[]).length,2);assert(css.lastIndexOf('--sheen:linear-gradient(transparent,transparent)')>css.indexOf('--sheen:linear-gradient(135deg'))});
check('floating sidebar still hides fully and opens with keyboard focus',()=>assert(css.includes('translateX(calc(-100% - 14px))')&&css.includes('.sidebar-auto .sidebar:focus-within{transform:translateX(0)}')));
check('four metrics collapse to two columns and keep flexible text columns',()=>assert(css.includes('@media(max-width:760px){html.ax .ax-home-metrics{grid-template-columns:repeat(2,minmax(0,1fr))')&&css.includes('grid-template-columns:26px minmax(0,1fr) 12px')));
check('native snapshot styles stay persistent after ink cleanup',()=>assert(css.includes('html.ax::view-transition-new(root)')&&!css.includes('[data-ax-ink-transition=active]::view-transition')));
check('glass updates add no competing observer or per-frame theme loop',()=>{const js=fs.readFileSync(path.join(__dirname,'..',index.match(/src="(assets\/workbook-design[^\"]+)"/)[1]),'utf8');assert.equal((js.match(/new MutationObserver/g)||[]).length,1);const section=js.slice(js.indexOf('function axInkContour'),js.indexOf("$('theme-btn').onclick"));assert(!section.includes('requestAnimationFrame'));assert(!section.includes('canvas'));assert(!section.includes('setTimeout'))});
check('glass navigation and metric rendering log no runtime errors',()=>equal(app.errors,[]));
const result={checks,failed:failures.length,failures,method:'Node DOM/media mocks, vector topology, numeric material contrast and source-level cascade checks',browserTested:false,inkPreparation:{samples:prepare.map(x=>+x.toFixed(2)),method:'Four Node preparations; not browser or device timing'}};
fs.mkdirSync(path.join(__dirname,'results'),{recursive:true});fs.writeFileSync(path.join(__dirname,'results/glass-ui.json'),JSON.stringify(result,null,2));fs.writeFileSync(path.join(__dirname,'results/glass-ui-views.json'),JSON.stringify(views));fs.writeFileSync(path.join(__dirname,'results/ink-masks.json'),JSON.stringify(masks));
console.log(JSON.stringify(result));if(failures.length)process.exitCode=1;
