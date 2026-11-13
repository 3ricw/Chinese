/* Boot gate and constrained-browser dictionary regressions. These are VM/DOM
   mocks and static HTML checks, not watchOS/iPhone/desktop browser testing. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{boot}=require('./runtime.cjs');
const root=path.resolve(__dirname,'..'),checks=[],failures=[],views=[];
function check(name,fn){checks.push(name);try{fn()}catch(e){failures.push({name,error:e.message})}}
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
function startup(options={}){
 const attrs={},properties={},nodes={};for(const id of ['app-startup-message','app-startup-retry'])nodes[id]={textContent:'',hidden:true};
 const events={},timers=[],writes=[],redirects=[];const html={setAttribute:(k,v)=>attrs[k]=v,removeAttribute:k=>delete attrs[k],style:{setProperty:(k,v)=>properties[k]=v,removeProperty:k=>delete properties[k]}};
 const c={document:{documentElement:html,getElementById:id=>nodes[id],querySelector:()=>null,querySelectorAll:()=>[],addEventListener:(k,f)=>events[k]=f},location:new URL(options.url||'https://3ricw.github.io/Chinese/'),innerWidth:options.width||390,innerHeight:options.height||844,navigator:{userAgent:options.ua||'Desktop browser'},matchMedia:q=>({matches:q.includes('coarse')?!!options.coarse:!!options.dark}),localStorage:{getItem:()=>{if(options.blocked)throw Error('blocked');return JSON.stringify({settings:options.settings||{}})},setItem:(...x)=>writes.push(x)},URL,URLSearchParams,setTimeout:f=>{timers.push(f);return timers.length},clearTimeout(){},Date};
 c.window=c;c.location.replace=url=>redirects.push(url);c.addEventListener=(k,f)=>events[k]=f;vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(root,'scripts/startup.js'),'utf8'),c);
 return {c,attrs,properties,nodes,events,timers,writes,redirects};
}
const f=startup();
check('the gate is installed before every external stylesheet and app module',()=>{assert(index.indexOf('id="app-startup-script"')<index.indexOf('rel="stylesheet"'));assert.equal(f.attrs['data-app-boot'],'pending')});
check('the old file-viewer warning is confined to no-JavaScript content',()=>{assert(!index.replace(/<noscript>[\s\S]*?<\/noscript>/g,'').includes('This viewer is not running the app'));assert(index.includes('<noscript><section id="file-preview">'))});
check('all 23 dependent app modules defer in their original order',()=>{const refs=[...index.matchAll(/<script\b([^>]*src="assets\/[^>]+)>/g)];assert.equal(refs.length,23);assert(refs.every(m=>/\bdefer\b/.test(m[1])));assert(refs.at(-1)[1].includes('workbook-design'));assert(refs[0][1].includes('chinese-js-00'));assert(!index.includes('fonts.googleapis.com'))});
check('legacy app-ready cannot reveal an intermediate Home',()=>{const css=fs.readFileSync(path.join(root,'scripts/startup.css'),'utf8');assert(css.includes('html[data-app-boot] :is(.shell,.mobile-nav,#overlay,#toast,#ax-atmosphere)'));assert(css.includes('visibility:hidden!important'));assert(!css.includes('.app-ready'))});
f.timers[0]();check('slow loading offers retry while still waiting for the final UI',()=>{assert.equal(f.c.appBoot.status(),'pending');assert(f.nodes['app-startup-message'].textContent.includes('Still loading'));assert.equal(f.nodes['app-startup-retry'].hidden,false)});
check('only final completion releases the gate',()=>{assert(f.c.appBoot.ready());assert(!('data-app-boot' in f.attrs));assert.equal(f.c.appBoot.status(),'ready')});
for(const tag of ['SCRIPT','LINK']){
 const t=startup();t.events.error({target:{tagName:tag,src:'https://3ricw.github.io/Chinese/assets/code.js',href:'https://3ricw.github.io/Chinese/assets/style.css'}});
 check(tag+' failure keeps partial UI hidden and exposes recovery',()=>{assert.equal(t.attrs['data-app-boot'],'failed');assert(!t.c.appBoot.ready());assert(t.nodes['app-startup-message'].textContent.includes('couldn’t finish'));assert(!t.nodes['app-startup-retry'].hidden)});
}
const runtime=startup();runtime.events.error({message:'ReferenceError',filename:'https://3ricw.github.io/Chinese/assets/app.js'});check('an initialization exception cannot leave a half-loaded app',()=>assert.equal(runtime.c.appBoot.status(),'failed'));
f.events.error({message:'later optional error',filename:'assets/not-startup.js'});check('errors after successful startup do not blank the app',()=>assert.equal(f.c.appBoot.status(),'ready'));
const fonts=startup();fonts.events.error({target:{tagName:'LINK',href:'https://fonts.example/font.css'}});check('an unrelated resource error does not block the app',()=>assert.equal(fonts.c.appBoot.status(),'pending'));
const light=startup({settings:{palette:'black',theme:'light',animations:false}});check('startup respects saved appearance and motion',()=>{assert.equal(light.properties['--boot-bg'],'#F4F4F4');assert.equal(light.attrs['data-boot-motion'],'off');assert.equal(light.writes.length,0)});
const blocked=startup({blocked:true});check('blocked storage does not prevent recovery or loading',()=>{assert.equal(blocked.c.appBoot.status(),'pending');assert(blocked.c.appBoot.ready())});
const badCommit=startup();badCommit.c.save=()=>{throw Error('unexpected commit failure')};check('an unexpected final-save exception keeps the recovery screen visible',()=>{assert(!badCommit.c.appBoot.ready());assert.equal(badCommit.attrs['data-app-boot'],'failed')});
const retry=startup({url:'https://3ricw.github.io/Chinese/?full=1'});retry.c.appBoot.retry();check('retry refreshes the document without changing origin or clearing data',()=>{const url=new URL(retry.redirects[0]);assert.equal(url.origin,'https://3ricw.github.io');assert.equal(url.pathname,'/Chinese/');assert.equal(url.searchParams.get('full'),'1');assert(url.searchParams.get('reload'));assert.equal(retry.writes.length,0)});
for(const [label,opts,redirect]of [['desktop',{},false],['phone',{width:390,height:844,coarse:true},false],['small watch',{width:198,height:242,coarse:true},true],['watch UA',{ua:'Apple Watch web view'},true],['explicit',{url:'https://3ricw.github.io/Chinese/?watch=1&q=你好'},true],['full app',{ua:'Watch',url:'https://3ricw.github.io/Chinese/?full=1'},false],['local preview',{url:'file:///tmp/preview.html?watch=1'},false]]){
 const t=startup(opts);check(label+' selects the appropriate browser surface',()=>{assert.equal(t.redirects.length,redirect?1:0);if(redirect)assert.equal(new URL(t.redirects[0]).pathname,'/Chinese/watch/')});
}
check('the explicit Watch link keeps a supplied word query',()=>assert.equal(new URL(startup({url:'https://3ricw.github.io/Chinese/?watch=1&q=你好'}).redirects[0]).searchParams.get('q'),'你好'));
const app=boot(),ar=app.run;check('the complete app cold-boots with its final UI and released gate',()=>{assert.equal(ar('appBoot.status()'),'ready');assert.equal(ar('currentView'),'home');assert(app.html().includes('rx-home-minimal'));assert.deepEqual(app.errors,[])});
ar("onboardingStep=null;state.profile.setupDone=false;showNameSetup()");app.ctx.document.getElementById('profile-name').value='New learner';ar("saveProfileName(true);starterPreview='dragon';chooseStarter();navigate('home')");
check('the fresh-name and companion flow reaches usable Home',()=>{assert.equal(ar('onboardingStep'),null);assert.equal(ar('state.profile.name'),'New learner');assert.equal(ar('state.companion.starter'),'dragon');assert(!app.nodes.get('overlay').innerHTML.includes('companion-modal'))});
ar('eval(rxNextAction().action)');check('the fresh learner can start real guided practice',()=>assert(ar('currentView==="session"&&memoryIsStudy()')));

const key='hanzi-reading-room-v2',seed=app.storage.get(key),watch=boot({[key]:seed},root,'watch/index.html'),r=watch.run;
const writes=[],originalSet=watch.ctx.localStorage.setItem;watch.ctx.localStorage.setItem=(k,v)=>{writes.push(k);originalSet(k,v)};
check('the browser dictionary loads without the full application or rewards engine',()=>{assert.equal(r('WATCH_CATALOG.entries.length'),1127);assert.equal(r('typeof state'),'undefined');assert.equal(r('typeof bx'),'undefined');assert.deepEqual(watch.errors,[])});
const source=ar('CW_WORDS'),catalog=r('WATCH_CATALOG.entries');
for(const w of source){const copy=catalog.find(x=>x.id===w.id);check(w.id+' keeps its original word form, pinyin, and meaning',()=>{assert(copy);for(const field of ['s','t','p','en'])assert.equal(copy[field],w[field])})}
check('all dictionary IDs remain unique',()=>assert.equal(new Set(catalog.map(w=>w.id)).size,catalog.length));
for(const query of ['你好','ni3 hao3','nǐ hǎo','hello'])check('word search finds 你好 from '+query,()=>assert.equal(r(`WatchWords.search(${JSON.stringify(query)},'all','',false)[0].s`),'你好'));
for(const [q,t]of [['关系','關係'],['關係','關係'],['联系','聯繫'],['聯繫','聯繫']])check('whole-word traditional lookup '+q,()=>assert.equal(r(`WatchWords.search('${q}','all','',false)[0].t`),t));
check('marked ü, v, and u: match while plain u stays distinct',()=>assert(r("WatchWords.normalize('lǜ')===WatchWords.normalize('lv4')&&WatchWords.normalize('lu:4')===WatchWords.normalize('lǜ')&&WatchWords.normalize('lu4')!==WatchWords.normalize('lv4')")));
for(const scope of ['common','chinese-1','chinese-2','characters'])check(scope+' filters the shared dictionary correctly',()=>assert(r(`WatchWords.search('','${scope}','',false).length>0&&WatchWords.search('','${scope}','',false).every(w=>w.scopes.includes('${scope}'))`)));
const out=watch.nodes.get('watch-results');views.push({name:'watch/initial',html:out.innerHTML});check('initial results are a manageable six words with a next-page action',()=>{assert.equal((out.innerHTML.match(/class="word-result"/g)||[]).length,6);assert(out.innerHTML.includes('Show 6 more'))});
r("WatchWords.query('<img src=x>',true)");views.push({name:'watch/no-match',html:out.innerHTML});check('unknown input has a recoverable empty state and no injected markup',()=>{assert(out.innerHTML.includes('No matching words'));assert(!out.innerHTML.includes('<img'))});
r("WatchWords.query('hello',true);WatchWords.open(WatchWords.search('你好','all','',false)[0].id)");views.push({name:'watch/detail',html:out.innerHTML});
check('word details keep separate word and sentence audio plus a clear Back action',()=>{for(const t of ['data-back','Word audio','Sentence audio','Save word','Example'])assert(out.innerHTML.includes(t))});
const word=r('WatchWords.search("你好","all","",false)[0].id');r(`WatchWords.save('${word}')`);check('saving a word persists a small Watch list without rewriting main progress',()=>{assert(r(`WatchWords.state.saved.includes('${word}')`));assert.equal(watch.storage.get(key),seed);assert(writes.every(k=>k.startsWith('erics-chinese-watch-')))});
r("WatchWords.open('cw-01-01')");r(`WatchWords.save('${word}')`);check('a stale Save callback cannot alter the newly opened word',()=>assert(r(`WatchWords.state.saved.includes('${word}')`)));
r('WatchWords.back()');check('Back restores the previous query and result list',()=>{assert.equal(r('WatchWords.state.q'),'hello');assert(out.innerHTML.includes('word-result'))});
r("WatchWords.go('saved')");views.push({name:'watch/saved',html:out.innerHTML});check('Saved words have direct readable navigation',()=>assert(out.innerHTML.includes('你好')));
r("WatchWords.go('browse')");views.push({name:'watch/topics',html:out.innerHTML});check('topic navigation includes every category and both courses',()=>{assert.equal((out.innerHTML.match(/class="topic-button"/g)||[]).length,36);assert(out.innerHTML.includes('Chinese 1'));assert(out.innerHTML.includes('Chinese 2'))});
const saved=watch.storage.get('erics-chinese-watch-browser-v1'),again=boot({[key]:seed,'erics-chinese-watch-browser-v1':saved},root,'watch/index.html');check('Watch saved words survive a cold restart',()=>assert(again.run(`WatchWords.state.saved.includes('${word}')`)));
const malformed=boot({'erics-chinese-watch-browser-v1':'{"version":1,"saved":["unknown","cw-01-01","cw-01-01"],"script":"bogus"}'},root,'watch/index.html');check('malformed Watch records sanitize without touching full-app progress',()=>{assert.equal(malformed.run('WatchWords.state.saved.length'),1);assert.equal(malformed.run('WatchWords.state.script'),'simplified')});
const noStore=boot({},root,'watch/index.html');noStore.ctx.localStorage.setItem=()=>{throw Error('quota')};noStore.run("WatchWords.open('cw-01-01');WatchWords.save('cw-01-01')");check('failed Watch saving produces an honest status without breaking search',()=>assert(noStore.nodes.get('watch-message').textContent.includes('Could not save')));
const ledger=watch.storage.get('erics-chinese-watch-lookups-v1');check('dictionary exposure stays bounded and carries no mastery or rewards',()=>{const v=JSON.parse(ledger);assert.equal(v.version,1);assert(v.texts.length<=120);assert(v.texts.every(t=>typeof t==='string'&&t.length<=180));assert(!ledger.includes('mastery'));assert(!ledger.includes('xp'))});
ar("clearSavedSession();onboardingStep=null;state.profile.setupDone=true;switchCourse('chinese-1');startSession('all','1',['你']);checkpointCurrent();navigate('home');localStorage.setItem('erics-chinese-watch-lookups-v1',JSON.stringify({version:1,texts:['你好']}));var beforeLookupXP=bx.xp;wristApplyBrowserLookups()");
check('same-browser Watch lookup marks paused recall as helped without XP',()=>{assert(ar('savedResume.data.usedHint'));assert.equal(ar('bx.xp'),ar('beforeLookupXP'));assert.equal(app.storage.get('erics-chinese-watch-lookups-v1'),undefined)});
ar("resumeSession();reveal();rate('good')");check('looked-up answers cannot become unassisted recall on resume',()=>assert(ar('!familiar(cardByChar["你"])')));
const fallback=fs.readFileSync(path.join(root,'watch/browse.html'),'utf8'),ids=[...fallback.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
check('no-JavaScript topic browsing uses unique anchors and native disclosures',()=>{assert.equal(new Set(ids).size,ids.length);assert(fallback.includes('class="topic"'));assert(fallback.includes('你好'));assert(fallback.includes('關係'));assert(!fallback.includes('<script'));assert(!fallback.includes('onclick='))});
const css=fs.readFileSync(path.join(root,'watch/watch-ui.css'),'utf8');check('the compact layout uses large targets, flexible input and no fixed-width desktop shell',()=>{assert(css.includes('min-height:44px'));assert(css.includes('minmax(0,1fr) 44px'));assert(css.includes('@media(max-width:220px)'));assert(!css.includes('min-width:300px'))});
check('all browser dictionary actions leave original main storage byte-identical',()=>assert.equal(watch.storage.get(key),seed));
check('dictionary interactions start no speech automatically',()=>{let count=0;watch.ctx.speechSynthesis.speak=()=>count++;r("WatchWords.go('search');WatchWords.query('hello',true);WatchWords.open('cw-01-01');WatchWords.back()");assert.equal(count,0)});
ar("state.commonWords.notes={'cw-01-01':'My own cue'};state.commonWords.saved=['cw-01-01'];state.commonWords.records['cw-01-01']={seen:4,correct:2,stage:2,lapses:0,due:Date.now()+86400000,last:Date.now(),advanceDay:'2026-11-10',creditDay:'2026-11-10'};state.readingDesk.saved=[READINGS[0].id];state.memoryNotes['八']='Two branches';save()");
const complete=app.storage.get(key);
for(const prefix of ['assets/chinese-js-06-','assets/workbook-design-','assets/chinese-js-03-']){
 const failed=boot({[key]:complete},root,'index.html',{skipScripts:[prefix],captureScriptErrors:true});
 check(prefix+' failure preserves the exact original progress and extensions',()=>{assert.equal(failed.storage.get(key),complete);assert.equal(failed.run('appBoot.status()'),'failed')});
 const recovered=boot({[key]:failed.storage.get(key)});
 check(prefix+' retry restores common words, notes and reading data',()=>{assert.equal(recovered.run('appBoot.status()'),'ready');assert.equal(recovered.run('state.commonWords.records["cw-01-01"].stage'),2);assert.equal(recovered.run('state.commonWords.notes["cw-01-01"]'),'My own cue');assert.equal(recovered.run('state.memoryNotes["八"]'),'Two branches');assert.equal(recovered.run('state.readingDesk.saved.length'),1)});
}
// Exercise the browser Back path as well as the in-page Back button.
watch.ctx.location=new URL('https://3ricw.github.io/Chinese/watch/');
watch.ctx.history={replaceState(_s,_title,url){watch.ctx.location.href=url},pushState(_s,_title,url){watch.ctx.location.href=url}};
r("WatchWords.go('browse')");check('topic navigation has a reloadable URL',()=>assert.equal(new URL(watch.ctx.location.href).searchParams.get('browse'),'1'));
const group=r('WATCH_CATALOG.groups.find(g=>g.scope==="chinese-2").id');
for(const fn of watch.events.click)fn({target:{closest:()=>({dataset:{group}})},preventDefault(){}});
check('choosing a chapter retains its filter in the URL',()=>assert.equal(new URL(watch.ctx.location.href).searchParams.get('group'),group));
const groupURL=watch.ctx.location.href;r("WatchWords.open('cw-01-01')");
watch.ctx.location.href=groupURL;for(const fn of watch.events.popstate)fn({});
check('native browser Back restores the selected chapter',()=>{assert.equal(r('WatchWords.state.group'),group);assert.equal(r('WatchWords.state.view'),'search')});
watch.ctx.location.href='https://3ricw.github.io/Chinese/watch/?scope=invalid';for(const fn of watch.events.popstate)fn({});
check('invalid history filters recover to all words',()=>assert.equal(r('WatchWords.state.scope'),'all'));
r("WatchWords.open('cw-01-01');var beforeStaleQuery=WatchWords.state.q;WatchWords.query('stale',true)");
check('a delayed search callback cannot replace word details',()=>{assert.equal(r('WatchWords.state.q'),r('beforeStaleQuery'));assert.equal(r('WatchWords.state.view'),'detail')});
const result={checks:checks.length,failed:failures.length,failures,method:'Node DOM/VM, boot failure/resource event simulation, dictionary and storage callbacks; no actual browser or Watch device test',browserTested:false,watchDeviceTested:false};
fs.writeFileSync(path.join(__dirname,'results/startup-watch-browser.json'),JSON.stringify(result,null,2));fs.writeFileSync(path.join(__dirname,'results/startup-watch-browser-views.json'),JSON.stringify(views));console.log(JSON.stringify(result));if(failures.length)process.exitCode=1;
