/* User-facing Watch search/save/navigation and final stylesheet readiness.
   Deterministic DOM/Storage/visibility/history mocks, not actual device QA. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{boot}=require('./runtime.cjs');
const root=path.resolve(__dirname,'..'),key='erics-chinese-watch-browser-v1',mainKey='hanzi-reading-room-v2',checks=[],failures=[],views=[];
function check(name,fn){checks.push(name);try{fn()}catch(e){failures.push({name,error:e.message})}}
const sample=boot({},root,'watch/index.html'),hello=sample.run("WATCH_CATALOG.entries.find(w=>w.s==='你好').id"),relation=sample.run("WATCH_CATALOG.entries.find(w=>w.s==='关系').id");
const full=boot(),main=full.storage.get(mainKey);
function watch(ids=[],extra={}){return boot({[mainKey]:main,[key]:JSON.stringify({version:1,saved:ids,script:'simplified'}),...extra},root,'watch/index.html')}
function liveTimers(app){const pending=new Map();let next=0;app.ctx.setTimeout=f=>{pending.set(++next,f);return next};app.ctx.clearTimeout=id=>pending.delete(id);return {pending,flush(){for(const [id,fn]of [...pending]){pending.delete(id);fn()}}}}
function event(app,kind,extra={}){for(const fn of app.events[kind]||[])fn(extra)}
function field(app,id,kind){const node=app.ctx.document.getElementById(id);for(const fn of node.listeners[kind]||[])fn({target:node,preventDefault(){}})}
function browserHistory(app){app.ctx.location=new URL('https://3ricw.github.io/Chinese/watch/');app.ctx.history={pushState(_s,_title,url){app.ctx.location.href=url},replaceState(_s,_title,url){app.ctx.location.href=url}};return url=>{app.ctx.location.href=url;event(app,'popstate')}}

const failed=watch(),fr=failed.run;fr(`WatchWords.open('${hello}')`);
const button=new failed.ctx.Element();button.setAttribute('aria-pressed','false');button.textContent='Save word';failed.nodes.get('watch-results').querySelector=()=>button;
const disk=failed.storage.get(key),write=failed.ctx.localStorage.setItem;failed.ctx.localStorage.setItem=(k,v)=>{if(k===key)throw Error('quota');write(k,v)};
fr(`WatchWords.save('${hello}')`);
check('a failed save cannot manufacture an in-memory favorite',()=>assert(!fr(`WatchWords.state.saved.includes('${hello}')`)));
check('a failed save cannot show a Saved checkmark',()=>{assert.equal(button.getAttribute('aria-pressed'),'false');assert.equal(button.textContent,'Save word')});
check('a failed save keeps the existing stored list byte-identical',()=>assert.equal(failed.storage.get(key),disk));
check('a failed save gives a useful retry message',()=>assert(failed.nodes.get('watch-message').textContent.includes('Try again')));
failed.ctx.localStorage.setItem=write;fr(`WatchWords.save('${hello}')`);
check('retrying once after a failed save actually saves the word',()=>{assert(fr(`WatchWords.state.saved.includes('${hello}')`));assert(JSON.parse(failed.storage.get(key)).saved.includes(hello));assert.equal(button.textContent,'Saved ✓')});
const removal=watch([hello,relation]),rr=removal.run,beforeRemoval=removal.storage.get(key);rr(`WatchWords.open('${hello}')`);const removeWrite=removal.ctx.localStorage.setItem;removal.ctx.localStorage.setItem=(k,v)=>{if(k===key)throw Error('quota');removeWrite(k,v)};rr(`WatchWords.save('${hello}')`);
check('failed removal leaves both original favorites available',()=>{assert.equal(rr('WatchWords.state.saved.length'),2);assert.equal(removal.storage.get(key),beforeRemoval)});
removal.ctx.localStorage.setItem=removeWrite;rr(`WatchWords.save('${hello}')`);check('removal can be retried without losing the other favorite',()=>{assert(!rr(`WatchWords.state.saved.includes('${hello}')`));assert(rr(`WatchWords.state.saved.includes('${relation}')`))});
const corrupt=watch([hello],{[mainKey]:'{broken main state'});
check('an unreadable main record cannot hide a healthy Watch saved list',()=>assert(corrupt.run(`WatchWords.state.saved.includes('${hello}')`)));
check('the dictionary never replaces the unreadable main record',()=>assert.equal(corrupt.storage.get(mainKey),'{broken main state'));
const badPalette=watch([hello],{[mainKey]:JSON.stringify({settings:{palette:'constructor',theme:'dark'}})});
check('an invalid inherited palette name falls back without breaking Watch lookup',()=>{assert.deepEqual(badPalette.errors,[]);assert(badPalette.nodes.get('watch-results').innerHTML.includes('word-result'))});

for(const view of ['search','saved']){
 const a=watch([hello,relation]),r=a.run,timers=liveTimers(a);r(`WatchWords.go('${view}')`);a.nodes.get('watch-query').value='hello';field(a,'watch-query','input');
 check(view+' keeps typing in its own search form',()=>{assert.equal(r('WatchWords.state.view'),view);assert(!a.nodes.get('watch-search').hidden)});
 a.ctx.document.visibilityState='hidden';event(a,'visibilitychange');check(view+' cancels pending background work',()=>assert.equal(timers.pending.size,0));
 a.ctx.document.visibilityState='visible';event(a,'visibilitychange');timers.flush();
 check(view+' finishes the pending query when the page returns',()=>{assert.equal(r('WatchWords.state.q'),'hello');assert(a.nodes.get('watch-results').innerHTML.includes('你好'));assert(!a.nodes.get('watch-results').innerHTML.includes('关系'))});
 views.push({name:'watch-followup/'+view+'-return',html:a.nodes.get('watch-results').innerHTML});
 let spoken=0;a.ctx.speechSynthesis.speak=()=>spoken++;a.ctx.document.visibilityState='hidden';event(a,'visibilitychange');a.ctx.document.visibilityState='visible';event(a,'visibilitychange');
 check(view+' resumes search without automatic speech',()=>assert.equal(spoken,0));
}
const saved=watch([hello,relation]),sr=saved.run;sr("WatchWords.query('你好',true);WatchWords.go('saved')");
check('opening Saved starts with its own query and both favorites',()=>{assert.equal(sr('WatchWords.state.q'),'');assert(saved.nodes.get('watch-results').innerHTML.includes('你好'));assert(saved.nodes.get('watch-results').innerHTML.includes('关系'))});
check('Saved identifies its search and hides the unrelated course filter',()=>{assert.equal(saved.nodes.get('watch-query-label').textContent,'Search your saved words');assert(saved.nodes.get('watch-scope-controls').hidden)});
saved.nodes.get('watch-query').value='hello';field(saved,'watch-search','submit');
check('pressing Enter searches saved words without switching to all words',()=>{assert.equal(sr('WatchWords.state.view'),'saved');assert(saved.nodes.get('watch-results').innerHTML.includes('你好'));assert(!saved.nodes.get('watch-results').innerHTML.includes('关系'))});
sr(`WatchWords.open('${hello}');WatchWords.back()`);
check('the word Back button restores the Saved query',()=>{assert.equal(sr('WatchWords.state.view'),'saved');assert.equal(sr('WatchWords.state.q'),'hello');assert.equal(saved.nodes.get('watch-query').value,'hello')});
sr("WatchWords.go('search')");check('the Search tab restores its independent query',()=>{assert.equal(sr('WatchWords.state.q'),'你好');assert(!saved.nodes.get('watch-scope-controls').hidden)});
sr("WatchWords.go('saved');WatchWords.query('no-saved-result',true)");
check('an unmatched Saved query offers Clear search',()=>{assert(saved.nodes.get('watch-results').innerHTML.includes('No saved words match'));assert(saved.nodes.get('watch-results').innerHTML.includes('data-clear'))});
event(saved,'click',{target:{closest:()=>({dataset:{clear:'1'}})},preventDefault(){}});
check('clearing a Saved query stays in Saved and recovers the favorites',()=>{assert.equal(sr('WatchWords.state.view'),'saved');assert.equal(sr('WatchWords.state.q'),'');assert(saved.nodes.get('watch-results').innerHTML.includes('关系'))});
saved.nodes.get('watch-query').value='hello';field(saved,'watch-query','change');
check('a committed text-change event also searches saved words',()=>{assert.equal(sr('WatchWords.state.q'),'hello');assert(saved.nodes.get('watch-results').innerHTML.includes('你好'))});

const history=watch([hello,relation]),hr=history.run,pop=browserHistory(history);hr("WatchWords.go('saved');WatchWords.query('hello',true)");hr(`WatchWords.open('${hello}')`);const wordURL=history.ctx.location.href;
check('a word opened from Saved retains that context in its link',()=>{const url=new URL(wordURL);assert.equal(url.searchParams.get('saved'),'1');assert.equal(url.searchParams.get('q'),'hello')});
hr("WatchWords.go('search');WatchWords.query('关系',true)");hr(`WatchWords.open('${relation}')`);pop(wordURL);
check('history navigation restores the word’s query instead of keeping a newer query',()=>{assert.equal(hr('WatchWords.state.q'),'hello');assert.equal(hr('WatchWords.state.view'),'detail')});
hr('WatchWords.back()');check('Back after a history jump returns to the correct Saved results',()=>{assert.equal(hr('WatchWords.state.view'),'saved');assert.equal(hr('WatchWords.state.q'),'hello');assert(history.nodes.get('watch-results').innerHTML.includes('你好'));assert(!history.nodes.get('watch-results').innerHTML.includes('关系'))});
pop('https://3ricw.github.io/Chinese/watch/?q=hello&scope=common&word='+encodeURIComponent(hello));hr('WatchWords.back()');
check('word history also restores the original course/search filter',()=>{assert.equal(hr('WatchWords.state.view'),'search');assert.equal(hr('WatchWords.state.scope'),'common');assert.equal(hr('WatchWords.state.q'),'hello')});
pop('https://3ricw.github.io/Chinese/watch/?q='+('a'.repeat(500))+'&scope=invalid');check('history cannot bypass query-length and filter validation',()=>{assert.equal(hr('WatchWords.state.q.length'),80);assert.equal(hr('WatchWords.state.scope'),'all')});

function startupWith(sheets){
 const attrs={},nodes={'app-startup-message':{textContent:''},'app-startup-retry':{hidden:true}},writes=[];
 const c={document:{documentElement:{style:{setProperty(){},removeProperty(){}},setAttribute:(k,v)=>attrs[k]=v,removeAttribute:k=>delete attrs[k]},getElementById:id=>nodes[id],querySelector:()=>null,querySelectorAll:()=>sheets,addEventListener(){}},location:new URL('https://3ricw.github.io/Chinese/'),navigator:{userAgent:'Desktop'},innerWidth:1000,innerHeight:800,matchMedia:()=>({matches:false}),localStorage:{getItem:()=>null},URL,URLSearchParams,setTimeout:()=>1,clearTimeout(){},Date};c.window=c;c.addEventListener=()=>{};c.save=()=>writes.push('main save');vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(root,'scripts/startup.js'),'utf8'),c);return {c,attrs,nodes,writes};
}
const missing=startupWith([{disabled:false,sheet:null}]);
check('a missing stylesheet blocks final commit even before its error event arrives',()=>{assert.equal(missing.c.appBoot.ready(),false);assert.equal(missing.c.appBoot.status(),'failed');assert.equal(missing.writes.length,0)});
check('missing styles keep the recovery screen and Retry available',()=>{assert.equal(missing.attrs['data-app-boot'],'failed');assert(!missing.nodes['app-startup-retry'].hidden);assert(missing.nodes['app-startup-message'].textContent.includes('couldn’t finish'))});
const complete=startupWith([{disabled:false,sheet:{}},{disabled:false,sheet:{}}]);check('fully loaded styles allow exactly one final commit',()=>{assert(complete.c.appBoot.ready());assert.equal(complete.writes.length,1);assert(!complete.c.appBoot.ready());assert.equal(complete.writes.length,1)});
const standalone=startupWith([]);check('the self-contained preview still starts with inline styles',()=>assert(standalone.c.appBoot.ready()));
for(const a of [failed,removal,saved,history])check('Watch actions preserve the main record ('+checks.length+')',()=>{assert.equal(a.storage.get(mainKey),main);assert.deepEqual(a.errors,[])});
const result={checks:checks.length,failed:failures.length,failures,method:'Node DOM/storage failures, input, visibility, history, and stylesheet readiness fixtures; no real browser or Watch run',browserTested:false,deviceTested:false};
fs.writeFileSync(path.join(__dirname,'results/watch-followup.json'),JSON.stringify(result,null,2));fs.writeFileSync(path.join(__dirname,'results/watch-followup-views.json'),JSON.stringify(views));console.log(JSON.stringify(result));if(failures.length)process.exitCode=1;
