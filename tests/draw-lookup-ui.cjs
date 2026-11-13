/* Handwriting lookup controller with explicit DOM, input and loader fixtures.
   This does not test real stylus/touch hardware or recognition accuracy. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../assets/draw-lookup.js'),'utf8'),checks=[],failures=[];
function check(name,fn){checks.push(name);try{fn()}catch(e){failures.push({name,error:e.message})}}
const clean=x=>JSON.parse(JSON.stringify(x));
function fixture(options={}){
 let next=0;const timers=new Map(),scripts=[],matches=[],exposures=[],searches=[],closed=[],captures=[],paints=[],writes=[],audio=[];
 class Node{
  constructor(tag='DIV'){this.tagName=tag;this.listeners={};this.dataset={};this.disabled=false;this.hidden=false;this.isConnected=true;this.textContent='';this._html='';this.removed=false;this.parentElement=null}
  get innerHTML(){return this._html}set innerHTML(value){this._html=String(value)}
  addEventListener(kind,fn,opts){(this.listeners[kind]??=[]).push({fn,opts})}
  removeEventListener(kind,fn){this.listeners[kind]=(this.listeners[kind]||[]).filter(x=>x.fn!==fn)}
  fire(kind,values={}){const e={target:this,type:kind,button:0,pointerId:1,clientX:30,clientY:40,prevented:false,preventDefault(){this.prevented=true},...values};for(const {fn}of [...this.listeners[kind]||[]])fn(e);return e}
  closest(selector){return selector==='button'&&this.tagName==='BUTTON'?this:null}
  remove(){this.removed=true;this.isConnected=false}
 }
 class Host extends Node{
  get innerHTML(){return this._html}set innerHTML(value){this._html=String(value);this.nodes={};if(!this._html.includes('draw-lookup'))return;this.nodes['.draw-lookup']=new Node('SECTION');
   this.canvas=new Node('CANVAS');this.canvas.getBoundingClientRect=()=>this.rect||{left:10,top:20,width:160,height:160};this.canvas.getContext=()=>options.unsupported?null:new Proxy({},{get:(_o,k)=>typeof k==='string'&&['clearRect','beginPath','moveTo','lineTo','stroke'].includes(k)?(...v)=>paints.push([k,...v]):undefined});
   this.canvas.setPointerCapture=id=>{if(options.captureThrows)throw Error('unsupported capture');captures.push(['set',id])};this.canvas.releasePointerCapture=id=>captures.push(['release',id]);
   this.nodes.canvas=this.canvas;for(const selector of ['.draw-status','.draw-candidates','.draw-query-text'])this.nodes[selector]=new Node();
   for(const action of ['close','undo','clear','find','erase','search']){const b=new Node('BUTTON');b.dataset.drawAction=action;this.nodes['[data-draw-action="'+action+'"]']=b}
  }
  querySelector(selector){return this.nodes?.[selector]||null}
  action(name){return this.querySelector('[data-draw-action="'+name+'"]')}
  click(actionOrChar,char=false){const b=char?new Node('BUTTON'):this.action(actionOrChar);if(char)b.dataset.drawChar=actionOrChar;return this.fire('click',{target:b})}
 }
 const win=new Node('WINDOW'),head=new Node('HEAD');head.appendChild=node=>{scripts.push(node);return node};
 const context={document:{head,createElement:tag=>new Node(tag.toUpperCase())},getComputedStyle:()=>({color:'#007749'}),setTimeout:(fn,ms)=>{timers.set(++next,{fn,ms});return next},clearTimeout:id=>timers.delete(id),Promise,Math,Array,Object,String,Error,localStorage:{getItem:()=>null,setItem:(...v)=>writes.push(v)},speechSynthesis:{speak:(...v)=>audio.push(v)}};
 context.window=context;context.addEventListener=(...v)=>win.addEventListener(...v);context.removeEventListener=(...v)=>win.removeEventListener(...v);if(options.pointer!==false)context.PointerEvent=function(){};
 function engine(){context.DrawRecognizer={match(strokes,limit){matches.push({strokes:clean(strokes),limit});return options.matches||[{character:'你',score:.9},{character:'好',score:.8}]}}}
 if(options.loaded!==false){engine();context.DRAW_MODEL={version:1}}
 vm.createContext(context);vm.runInContext(source,context,{filename:'draw-lookup.js'});
 const host=new Host(),opts={base:'../assets/',search:x=>searches.push(x),expose:x=>exposures.push(x),close:()=>closed.push('close')};
 function attach(target=host,overrides={}){return context.DrawLookup.attach(target,{...opts,...overrides})}
 function stroke(target=host,coords=[[30,40],[90,100],[170,180]],id=1){const canvas=target.canvas;canvas.fire('pointerdown',{clientX:coords[0][0],clientY:coords[0][1],pointerId:id});for(const [x,y]of coords.slice(1,-1))canvas.fire('pointermove',{clientX:x,clientY:y,pointerId:id});const last=coords.at(-1);canvas.fire('pointerup',{clientX:last[0],clientY:last[1],pointerId:id})}
 async function drain(promise){let done=false,result,error;promise.then(v=>{done=true;result=v},e=>{done=true;error=e});for(let i=0;i<30&&!done;i++){await Promise.resolve();for(const [id,t]of [...timers])if(t.ms===0){timers.delete(id);t.fn()}}if(!done)throw Error('Promise needs an explicit script load event');if(error)throw error;return result}
 async function micro(){for(let i=0;i<8;i++)await Promise.resolve()}
 return {context,api:context.DrawLookup,host,Host,Node,win,attach,stroke,drain,micro,scripts,timers,matches,exposures,searches,closed,captures,paints,writes,audio,engine};
}
(async()=>{
const a=fixture();a.attach();
check('markup explains suggestions rather than writing grades',()=>{const s=a.api.markup();assert(s.includes('they do not grade your writing'));assert(s.includes('One character at a time'));assert(s.includes('Chinese, pinyin, or English text search'))});
check('new pad has no query and cannot submit an empty word',()=>{assert.equal(a.api.state().query,'');assert(a.host.action('search').disabled);assert(a.host.action('erase').disabled);a.host.click('search');assert.deepEqual(a.searches,[])});
check('opening the pad loads no recognition scripts or automatic audio',()=>{assert.equal(a.scripts.length,0);assert.equal(a.matches.length,0);assert.equal(a.audio.length,0)});
await a.drain(a.api.find());check('empty lookup asks for a drawing without loading the engine',()=>{assert(a.host.querySelector('.draw-status').textContent.includes('Draw a character first'));assert.equal(a.matches.length,0)});
a.stroke();
check('pointer coordinates normalize into 0–1 canvas coordinates',()=>assert.deepEqual(clean(a.api.state().strokes),[[[.125,.125],[.5,.5],[1,1]]]));
check('the active pointer is captured and released',()=>assert.deepEqual(a.captures,[['set',1],['release',1]]));
const found=await a.drain(a.api.find());
check('recognition receives an independent normalized stroke snapshot',()=>{assert.equal(a.matches.length,1);assert.equal(a.matches[0].limit,8);assert.deepEqual(a.matches[0].strokes,[[[.125,.125],[.5,.5],[1,1]]]);assert.equal(found.length,2)});
check('visible suggestions are exposed as lookup assistance',()=>assert.deepEqual(a.exposures,['你好']));
check('candidates are clickable suggestion buttons without correctness badges',()=>{const html=a.host.querySelector('.draw-candidates').innerHTML;assert(html.includes('data-draw-char="你"'));assert(html.includes('data-draw-char="好"'));assert(!/correct|mastered|XP|grade=/i.test(html));assert(a.host.querySelector('.draw-status').textContent.includes('Suggestions'))});
a.host.click('你',true);
check('choosing a character builds the word and clears only the drawing',()=>{assert.equal(a.api.state().query,'你');assert.equal(a.api.state().strokes.length,0);assert.equal(a.host.querySelector('.draw-query-text').textContent,'你');assert(!a.host.action('search').disabled);assert.equal(a.host.querySelector('.draw-candidates').innerHTML,'');assert.deepEqual(a.exposures,['你好','你'])});
a.host.click('好',true);a.host.click('search');
check('multiple selected characters search one complete word',()=>assert.deepEqual(a.searches,['你好']));
a.host.click('erase');check('erase removes only the final selected character',()=>assert.equal(a.api.state().query,'你'));
a.host.click('clear');check('Clear does not erase the assembled word',()=>assert.equal(a.api.state().query,'你'));
a.host.click('erase');check('emptying the word disables erase and search again',()=>{assert(a.host.action('search').disabled);assert(a.host.action('erase').disabled)});
for(let i=0;i<13;i++)a.host.click('你',true);check('the assembled query is bounded',()=>{assert.equal(a.api.state().query.length,12);assert(a.host.querySelector('.draw-status').textContent.includes('Search this word'))});
a.attach();a.host.click('𠀀',true);a.host.click('erase');check('erase handles a supplementary-plane character as one character',()=>assert.equal(a.api.state().query,''));
a.stroke(a.host,[[0,0],[300,300],[400,-50]]);
check('points outside the pad are clipped to its bounds',()=>assert(a.api.state().strokes.flat().every(p=>p.every(x=>x>=0&&x<=1))));
a.stroke();const prior=a.api.state().strokes.length;a.host.click('undo');check('Undo removes one complete stroke',()=>assert.equal(a.api.state().strokes.length,prior-1));a.host.click('clear');check('Clear removes all strokes and prior suggestions',()=>{assert.equal(a.api.state().strokes.length,0);assert.equal(a.host.querySelector('.draw-candidates').innerHTML,'')});
a.host.canvas.fire('pointerdown');a.host.canvas.fire('pointermove',{clientX:100,clientY:100});a.host.canvas.fire('pointercancel');
check('pointer cancellation discards the unfinished stroke',()=>{assert.equal(a.api.state().strokes.length,0);assert.equal(a.api.state().stroke,null)});
a.host.canvas.fire('pointerdown');a.host.canvas.fire('lostpointercapture');check('losing capture discards an unfinished stroke',()=>assert.equal(a.api.state().stroke,null));
a.host.canvas.fire('pointerdown',{pointerId:7});a.host.canvas.fire('pointermove',{pointerId:8,clientX:140});a.host.canvas.fire('pointerup',{pointerId:8,clientX:140});
check('a different pointer cannot extend or finish the current stroke',()=>{assert.equal(a.api.state().stroke.length,1);assert.equal(a.api.state().strokes.length,0)});a.host.canvas.fire('pointercancel',{pointerId:7});
a.host.canvas.fire('pointerdown',{button:2});check('secondary mouse buttons do not draw',()=>assert.equal(a.api.state().stroke,null));
a.host.rect={left:0,top:0,width:0,height:0};a.host.canvas.fire('pointerdown');check('an unmeasurable canvas ignores input safely',()=>assert.equal(a.api.state().stroke,null));a.host.rect=null;
a.host.canvas.fire('pointerdown');await a.drain(a.api.find());check('Find never reads a partially drawn stroke',()=>assert.equal(a.matches.length,1));a.host.canvas.fire('pointercancel');
for(let i=0;i<50;i++)a.stroke();check('the number of completed strokes stays bounded at 48',()=>assert.equal(a.api.state().strokes.length,48));
a.host.click('clear');a.host.canvas.fire('pointerdown');for(let i=0;i<500;i++)a.host.canvas.fire('pointermove',{clientX:i%2?150:30,clientY:i%2?140:40});a.host.canvas.fire('pointerup',{clientX:100,clientY:100});check('a stroke stores at most 256 points',()=>assert(a.api.state().strokes[0].length<=256));
const noCapture=fixture({captureThrows:true});noCapture.attach();noCapture.stroke();check('a missing pointer-capture implementation still permits a drawing',()=>assert.equal(noCapture.api.state().strokes.length,1));
for(const action of ['clear','undo','close']){const capture=fixture();capture.attach();capture.host.canvas.fire('pointerdown',{pointerId:9});if(action==='close')capture.api.close();else capture.host.click(action);check(action+' releases an active pointer capture',()=>assert.deepEqual(capture.captures,[['set',9],['release',9]]))}
const tap=fixture();tap.attach();tap.host.canvas.fire('pointerdown');tap.host.canvas.fire('pointerup');check('an incidental tap is not recorded as a meaningful stroke',()=>assert.equal(tap.api.state().strokes.length,0));

const lazy=fixture({loaded:false});lazy.attach();lazy.stroke();const first=lazy.api.find(),second=lazy.api.find();
check('engine loads lazily from the supplied base with one shared request',()=>{assert.equal(lazy.scripts.length,1);assert.match(lazy.scripts[0].src,/^\.\.\/assets\/draw-recognizer(?:-[a-f0-9]{12})?\.js$/)});
lazy.engine();lazy.scripts[0].onload();await lazy.micro();
check('the model loads only after the engine succeeds',()=>{assert.equal(lazy.scripts.length,2);assert.match(lazy.scripts[1].src,/^\.\.\/assets\/draw-model(?:-[a-f0-9]{12})?\.js$/)});
lazy.context.DRAW_MODEL={version:1};lazy.scripts[1].onload();const old=await lazy.drain(first),latest=await lazy.drain(second);
check('only the most recent overlapping request can render candidates',()=>{assert.equal(old.length,0);assert.equal(latest.length,2);assert.equal(lazy.matches.length,1);assert.deepEqual(lazy.exposures,['你好'])});
const failed=fixture({loaded:false});failed.attach();failed.stroke();let pending=failed.api.find();failed.engine();failed.scripts[0].onload();await failed.micro();failed.scripts[1].onerror();await failed.drain(pending);
check('a model failure offers retry and text search without suggestions',()=>{assert(failed.host.querySelector('.draw-status').textContent.includes('Try Find characters again'));assert(failed.host.querySelector('.draw-status').textContent.includes('text search'));assert.equal(failed.matches.length,0);assert.deepEqual(failed.exposures,[])});
pending=failed.api.find();await failed.micro();check('retry requests the failed model again without redownloading the engine',()=>{assert.equal(failed.scripts.length,3);assert.match(failed.scripts[2].src,/^\.\.\/assets\/draw-model(?:-[a-f0-9]{12})?\.js$/)});failed.context.DRAW_MODEL={version:1};failed.scripts[2].onload();await failed.drain(pending);check('model retry recovers useful suggestions',()=>assert.equal(failed.matches.length,1));
const timeout=fixture({loaded:false});timeout.attach();timeout.stroke();pending=timeout.api.find();for(const [id,t]of [...timeout.timers])if(t.ms===15000){timeout.timers.delete(id);t.fn()}await timeout.drain(pending);check('a stalled script has a bounded timeout with recoverable status',()=>{assert(timeout.scripts[0].removed);assert(timeout.host.querySelector('.draw-status').textContent.includes('Couldn’t load'))});
const engineFailure=fixture({loaded:false});engineFailure.attach();engineFailure.stroke();pending=engineFailure.api.find();engineFailure.scripts[0].onerror();await engineFailure.drain(pending);pending=engineFailure.api.find();check('an engine load failure can request a fresh engine on retry',()=>{assert.equal(engineFailure.scripts.length,2);assert.equal(engineFailure.scripts[1].src,engineFailure.scripts[0].src)});engineFailure.engine();engineFailure.scripts[1].onload();await engineFailure.micro();engineFailure.context.DRAW_MODEL={version:1};engineFailure.scripts[2].onload();await engineFailure.drain(pending);check('engine retry reaches successful recognition',()=>assert.equal(engineFailure.matches.length,1));
const empty=fixture({matches:[]});empty.attach();empty.stroke();await empty.drain(empty.api.find());check('no-match results offer retry or pinyin without claiming correctness',()=>{assert(empty.host.querySelector('.draw-status').textContent.includes('No useful suggestions'));assert(empty.host.querySelector('.draw-status').textContent.includes('type pinyin'));assert.deepEqual(empty.exposures,[])});

for(const action of ['clear','undo','close','reopen','redraw']){
 const stale=fixture();stale.attach();stale.stroke();const p=stale.api.find();
 if(action==='close')stale.api.close();else if(action==='reopen')stale.attach(new stale.Host());else if(action==='redraw')stale.host.canvas.fire('pointerdown');else stale.host.click(action);
 const result=await stale.drain(p);check(action+' invalidates an older pending lookup',()=>{assert.equal(result.length,0);assert.equal(stale.matches.length,0);assert.equal(stale.exposures.length,0);assert.equal(stale.host.querySelector('.draw-candidates').innerHTML,'')});
}
const snapshot=fixture({loaded:false});snapshot.attach();snapshot.stroke();pending=snapshot.api.find();snapshot.api.state().strokes[0][0][0]=.99;snapshot.engine();snapshot.scripts[0].onload();await snapshot.micro();snapshot.context.DRAW_MODEL={version:1};snapshot.scripts[1].onload();await snapshot.drain(pending);check('queued recognition owns a copy rather than a mutable live stroke list',()=>assert.equal(snapshot.matches[0].strokes[0][0][0],.125));
const disconnected=fixture();disconnected.attach();disconnected.stroke();pending=disconnected.api.find();disconnected.host.isConnected=false;await disconnected.drain(pending);check('a removed host cannot receive stale candidates or exposure',()=>{assert.equal(disconnected.matches.length,0);assert.equal(disconnected.exposures.length,0)});
for(const action of ['clear','close','reopen']){
 const async=fixture();async.attach();async.stroke();let finish,shouldCancel,asyncCalls=0;async.context.DrawRecognizer.matchAsync=(strokes,limit,cancel)=>{asyncCalls++;shouldCancel=cancel;assert.equal(limit,8);return new Promise(resolve=>finish=resolve)};
 const p=async.api.find();await async.micro();for(const [id,t]of [...async.timers])if(t.ms===0){async.timers.delete(id);t.fn()}await async.micro();
 check('asynchronous recognition is preferred ('+action+')',()=>{assert.equal(asyncCalls,1);assert.equal(async.matches.length,0);assert.equal(shouldCancel(),false)});
 if(action==='clear')async.host.click('clear');else if(action==='close')async.api.close();else async.attach(new async.Host());
 check(action+' tells a running asynchronous engine to cancel',()=>assert.equal(shouldCancel(),true));finish([{character:'你'}]);await async.drain(p);
 check(action+' prevents asynchronous results from rendering or exposing candidates',()=>{assert.equal(async.host.querySelector('.draw-candidates').innerHTML,'');assert.deepEqual(async.exposures,[])});
}

const touch=fixture({pointer:false});touch.attach();const tc=touch.host.canvas;
tc.fire('touchstart',{changedTouches:[{identifier:4,clientX:30,clientY:40}]});tc.fire('touchmove',{changedTouches:[{identifier:4,clientX:90,clientY:100}]});tc.fire('touchend',{changedTouches:[{identifier:4,clientX:170,clientY:180}]});
check('touch fallback records the same normalized stroke as pointer input',()=>assert.deepEqual(clean(touch.api.state().strokes),[[[.125,.125],[.5,.5],[1,1]]]));
check('touch listeners explicitly allow scroll cancellation on the drawing pad',()=>{for(const name of ['touchstart','touchmove','touchend','touchcancel'])assert.equal(tc.listeners[name][0].opts.passive,false)});
tc.fire('touchstart',{changedTouches:[{identifier:4,clientX:30,clientY:40}]});tc.fire('touchcancel',{changedTouches:[{identifier:4,clientX:90,clientY:100}]});check('touch cancellation cannot save an incomplete stroke',()=>assert.equal(touch.api.state().strokes.length,1));
tc.fire('touchstart',{changedTouches:[{identifier:4,clientX:30,clientY:40}]});tc.fire('touchmove',{changedTouches:[{identifier:99,clientX:0,clientY:0},{identifier:4,clientX:90,clientY:100}]});tc.fire('touchend',{changedTouches:[{identifier:99,clientX:0,clientY:0},{identifier:4,clientX:170,clientY:180}]});check('touch fallback finds its active identifier anywhere in changedTouches',()=>{assert.equal(touch.api.state().strokes.length,2);assert.deepEqual(clean(touch.api.state().strokes[1]),[[.125,.125],[.5,.5],[1,1]])});
tc.fire('mousedown',{clientX:30,clientY:40});tc.fire('mousemove',{clientX:90,clientY:100});touch.win.fire('mouseup',{clientX:170,clientY:180});check('mouse fallback can finish outside the canvas using window mouseup',()=>assert.equal(touch.api.state().strokes.length,3));
touch.api.close();check('closing removes fallback window listeners',()=>assert.equal(touch.win.listeners.mouseup.length,0));
const unsupported=fixture({unsupported:true});unsupported.attach();
check('canvas failure offers an explicit text/handwriting-keyboard fallback',()=>{assert(unsupported.host.canvas.hidden);assert(unsupported.host.action('find').disabled);assert(unsupported.host.querySelector('.draw-status').textContent.includes('Use text search'));assert.equal(unsupported.scripts.length,0)});
const esc=fixture();esc.attach();const key=esc.host.fire('keydown',{key:'Escape'});check('Escape closes the pad and invokes the caller once',()=>{assert(key.prevented);assert.equal(esc.api.state(),null);assert.deepEqual(esc.closed,['close'])});esc.api.close();check('closing twice cannot replay the close callback',()=>assert.equal(esc.closed.length,1));
const closed=fixture();closed.attach();const oldCanvas=closed.host.canvas;closed.api.close();oldCanvas.fire('pointerdown');closed.host.click('你',true);check('old pad listeners cannot change a closed session',()=>{assert.equal(closed.api.state(),null);assert.equal(closed.exposures.length,0)});
const malicious=fixture({matches:[{character:'<img src=x onerror=alert(1)>',score:1}]});malicious.attach();malicious.stroke();await malicious.drain(malicious.api.find());check('candidate text and data attributes are escaped',()=>{const html=malicious.host.querySelector('.draw-candidates').innerHTML;assert(!html.includes('<img'));assert(html.includes('&lt;img'))});
for(const f of [a,lazy,failed,timeout,touch,unsupported,esc,closed])check('drawing/search gives no audio or progress writes ('+checks.length+')',()=>{assert.equal(f.audio.length,0);assert.equal(f.writes.length,0)});
const result={checks:checks.length,failed:failures.length,failures,method:'Deterministic DOM/canvas/pointer/touch/mouse, lazy-script, timer and Promise fixtures',browserTested:false,deviceTested:false,recognitionAccuracyTested:false};
fs.mkdirSync(path.join(__dirname,'results'),{recursive:true});fs.writeFileSync(path.join(__dirname,'results/draw-lookup-ui.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(failures.length)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1});
