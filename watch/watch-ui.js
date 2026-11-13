/* Small-screen dictionary. It never writes the main app's progress or rewards. */
var WatchWords=(function(){
 'use strict';
 var data=WATCH_CATALOG,items=data.entries,byId=Object.create(null),storeKey='erics-chinese-watch-browser-v1',exposureKey='erics-chinese-watch-lookups-v1';
 var s={view:'search',q:'',scope:'all',group:'',limit:6,script:'simplified',saved:[]},returnTo=null,timer=0,turn=0,saving=true,main={},activeWord=null,activeNote='',queries={search:'',saved:''};
 function el(id){return document.getElementById(id)}
 function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
 function norm(value){var text=String(value||'').toLowerCase().replace(/u:/g,'v');if(text.normalize)text=text.normalize('NFD');return text.replace(/u\u0308/g,'v').replace(/[\u0300-\u036f]/g,'').replace(/([a-zv])[1-5]/g,'$1').replace(/[\s'’]/g,'')}
 items.forEach(function(w){byId[w.id]=w;w._p=norm(w.p);w._en=norm(w.en);w._key=norm(w.s+' '+w.t+' '+w.p+' '+w.en)});
 try{main=JSON.parse(localStorage.getItem('hanzi-reading-room-v2')||'{}')||{}}catch(_){main={}}
 try{var raw=JSON.parse(localStorage.getItem(storeKey)||'null');
  if(main.settings&&main.settings.script==='traditional')s.script='traditional';
  if(raw&&raw.version===1){s.saved=Array.isArray(raw.saved)?raw.saved.filter(function(id,i,a){return byId[id]&&a.indexOf(id)===i}).slice(0,200):[];s.script=raw.script==='traditional'?'traditional':'simplified'}
  else{s.saved=(main.commonWords&&Array.isArray(main.commonWords.saved)?main.commonWords.saved:[]).filter(function(id,i,a){return byId[id]&&a.indexOf(id)===i}).slice(0,200)}
 }catch(_){saving=false}
 function form(w){return s.script==='traditional'?w.t:w.s}
 function persist(saved){try{localStorage.setItem(storeKey,JSON.stringify({version:1,script:s.script,saved:saved||s.saved}));saving=true;return true}catch(_){saving=false;return false}}
 function help(rows){try{var old=JSON.parse(localStorage.getItem(exposureKey)||'null'),texts=old&&old.version===1&&Array.isArray(old.texts)?old.texts.filter(function(t){return typeof t==='string'}):[];
  rows.forEach(function(w){[w.s,w.t].forEach(function(t){if(t&&texts.indexOf(t)<0)texts.push(t.slice(0,180))})});
  localStorage.setItem(exposureKey,JSON.stringify({version:1,texts:texts.slice(-120)}));
 }catch(_){}}
 function search(q,scope,group,saved){var needle=norm(String(q||'').slice(0,80));return items.filter(function(w){return (!saved||s.saved.indexOf(w.id)>=0)&&(scope==='all'||w.scopes.indexOf(scope)>=0)&&(!group||w.groups.indexOf(group)>=0)&&(!needle||w._key.indexOf(needle)>=0)}).map(function(w,i){return {w:w,i:i,rank:!needle?0:w.s===q||w.t===q?0:w._p===needle?1:w._en===needle?2:w._p.indexOf(needle)===0?3:4}}).sort(function(a,b){return a.rank-b.rank||a.i-b.i}).map(function(x){return x.w})}
 function message(text){el('watch-message').textContent=text}
 function link(w){return '<a class="word-result" href="browse.html#'+encodeURIComponent(w.id)+'" data-word="'+esc(w.id)+'"><span><strong lang="zh">'+esc(form(w))+'</strong><small>'+esc(w.p)+'</small><span class="result-meaning">'+esc(w.en)+'</span></span><span class="result-arrow" aria-hidden="true">›</span></a>'}
 function isList(){return s.view==='search'||s.view==='saved'}
 function rememberQuery(){if(isList())queries[s.view]=s.q}
 function draw(){if(!isList()||!window.DrawLookup)return;var host=el('watch-draw-host');DrawLookup.attach(host,{base:'../assets/',close:function(){host.hidden=true;el('watch-draw-button').focus()},expose:function(chars){help([{s:chars,t:chars}])},search:function(term){DrawLookup.close();s.view='search';s.scope='all';s.group='';query(term,true);el('watch-query').focus()}});host.hidden=false;try{host.scrollIntoView({block:'start'})}catch(_){}}
 function syncControls(){
  var view=s.view==='detail'&&returnTo?returnTo.view:s.view,saved=view==='saved';
  el('watch-search').hidden=!isList();el('watch-draw-button').hidden=!isList();if(!isList()){el('watch-draw-host').hidden=true;if(window.DrawLookup)DrawLookup.close();}el('watch-query').value=s.q;el('watch-query').placeholder=saved?'Find a saved word':'你好 · ni3 hao3 · hello';
  el('watch-query-label').textContent=saved?'Search your saved words':'Chinese, pinyin, or English';
  el('watch-scope-controls').hidden=saved;el('watch-scope').value=s.scope;el('watch-script').value=s.script;
  document.querySelectorAll('[data-view]').forEach(function(a){if(a.dataset.view===view)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
 }
 function updateURL(word,push){try{var route=s.view==='detail'&&returnTo?returnTo:s,url=new URL(location.href);url.search='';if(route.q)url.searchParams.set('q',route.q);if(route.scope!=='all')url.searchParams.set('scope',route.scope);if(route.view==='saved')url.searchParams.set('saved','1');if(route.view==='browse')url.searchParams.set('browse','1');if(route.group)url.searchParams.set('group',route.group);if(word)url.searchParams.set('word',word);history[push?'pushState':'replaceState']({},'',url.href)}catch(_){}}
 function stop(){turn++;clearTimeout(timer);try{if(window.speechSynthesis)speechSynthesis.cancel()}catch(_){}}
 function render(){
  syncControls();
  var host=el('watch-results');
  if(s.view==='browse'){message('Choose a topic or chapter.');host.innerHTML=data.groups.map(function(g){return '<button class="topic-button" data-group="'+esc(g.id)+'">'+esc(g.name)+'</button>'}).join('');return}
  var found=search(s.q,s.view==='saved'?'all':s.scope,s.group,s.view==='saved'),shown=found.slice(0,s.limit);
  message((s.group?data.groups.filter(function(g){return g.id===s.group})[0].name+' · ':'')+found.length+' '+(found.length===1?'word':'words')+(s.view==='saved'?' saved here':'')+(!saving?' · Saving unavailable':''));
  host.innerHTML=found.length?'<div class="word-list">'+shown.map(link).join('')+'</div>'+(found.length>s.limit?'<button class="full" data-more="1">Show 6 more</button>':''):'<p class="empty">'+(s.view==='saved'?(s.q?'No saved words match. Try a shorter search.':'Save words with the button in word details.'):'No matching words. Try a shorter word, pinyin, or English.')+'</p>'+(s.q||s.view==='search'?'<button class="full" data-clear="1">Clear search</button>':'');
  help(shown);
 }
 function go(view){rememberQuery();stop();activeWord=null;s.view=view;s.q=queries[view]||'';s.group='';s.limit=6;returnTo=null;updateURL();render();try{window.scrollTo(0,0)}catch(_){}}
 function detail(id,push,context){var w=byId[id];if(!w)return;
  rememberQuery();
  if(context)returnTo=context;
  else if(s.view!=='detail')returnTo={view:s.view,q:s.q,scope:s.scope,group:s.group,limit:s.limit,y:window.scrollY||0};
  stop();activeWord=id;s.view='detail';syncControls();message('Word details');
  var note=(w.commonId&&main.commonWords&&main.commonWords.notes&&main.commonWords.notes[w.commonId])||(w.character&&main.memoryNotes&&main.memoryNotes[w.character])||'';
  activeNote=typeof note==='string'?note.slice(0,600):'';
  var audio=!!(window.speechSynthesis&&window.SpeechSynthesisUtterance);
  el('watch-results').innerHTML='<button class="watch-back" data-back="1">← Back to words</button><article class="word-detail"><h2 lang="zh">'+esc(form(w))+'</h2>'+(w.s!==w.t?'<p class="other-form" lang="zh">'+esc(s.script==='traditional'?w.s:w.t)+'</p>':'')+'<p class="word-pinyin">'+esc(w.p)+'</p><p>'+esc(w.en)+'</p>'+(audio?'<div class="sound-row"><button data-speak="word" data-id="'+esc(id)+'">▶ Word audio</button></div>':'')+'<button class="full" data-save="'+esc(id)+'" aria-pressed="'+(s.saved.indexOf(id)>=0)+'">'+(s.saved.indexOf(id)>=0?'Saved ✓':'Save word')+'</button>'+(w.x?'<details data-help="example"><summary>Example</summary><p lang="zh">'+esc(s.script==='traditional'?w.xt:w.x)+'</p>'+(w.xp?'<p>'+esc(w.xp)+'</p>':'')+'<p>'+esc(w.xe)+'</p>'+(audio?'<button class="full" data-speak="example" data-id="'+esc(id)+'">▶ Sentence audio</button>':'')+'</details>':'')+(w.n?'<details data-help="usage"><summary>Usage &amp; memory</summary><p>'+esc(w.n)+'</p></details>':'')+(typeof note==='string'&&note?'<details data-help="note"><summary>Your note</summary><p>'+esc(note.slice(0,600))+'</p></details>':'')+'</article>';
  help([w]);if(push!==false)updateURL(id,true);try{window.scrollTo(0,0)}catch(_){}
 }
 function back(){stop();activeWord=null;var previous=returnTo||{view:'search',q:s.q,scope:s.scope,group:'',limit:6,y:0};Object.keys(previous).forEach(function(k){if(k!=='y')s[k]=previous[k]});returnTo=null;rememberQuery();updateURL();render();try{window.scrollTo(0,previous.y||0)}catch(_){}}
 function saveWord(id){if(s.view!=='detail'||activeWord!==id||!byId[id])return;var at=s.saved.indexOf(id),next=s.saved.slice();if(at>=0)next.splice(at,1);else{if(next.length>=200){message('200 words saved. Remove one before adding another.');return}next.push(id)}if(!persist(next)){message('Could not save in this browser. Try again.');return}s.saved=next;var b=el('watch-results').querySelector('[data-save]');if(b){b.setAttribute('aria-pressed',String(s.saved.indexOf(id)>=0));b.textContent=s.saved.indexOf(id)>=0?'Saved ✓':'Save word'}message(at>=0?'Removed from saved words.':'Saved in this browser.');}
 function speak(id,kind){var w=byId[id];if(s.view!=='detail'||activeWord!==id||!w||!window.speechSynthesis||!window.SpeechSynthesisUtterance)return;try{speechSynthesis.cancel();var utterance=new SpeechSynthesisUtterance(kind==='example'?w.x:w.s);utterance.lang='zh-CN';utterance.rate=.8;speechSynthesis.speak(utterance)}catch(_){message('Audio is unavailable here. Use the pinyin above.')}}
 function query(value,immediate){if(!isList())return;s.q=String(value||'').slice(0,80);s.group='';s.limit=6;rememberQuery();clearTimeout(timer);var stamp=++turn;var apply=function(){if(stamp!==turn||!isList())return;updateURL();render()};if(immediate)apply();else timer=setTimeout(apply,120)}
 function routeFromURL(){
  var p=new URLSearchParams(location.search||''),scope=p.get('scope'),context={view:p.get('saved')==='1'?'saved':p.get('browse')==='1'?'browse':'search',q:String(p.get('q')||'').slice(0,80),scope:['all','common','chinese-1','chinese-2','characters'].indexOf(scope)>=0?scope:'all',group:data.groups.some(function(g){return g.id===p.get('group')})?p.get('group'):'',limit:6,y:0};
  if(context.view==='saved')context.group='';
  if(returnTo&&['view','q','scope','group'].every(function(k){return returnTo[k]===context[k]})){context.limit=returnTo.limit;context.y=returnTo.y}
  stop();activeWord=null;Object.keys(context).forEach(function(k){if(k!=='y')s[k]=context[k]});returnTo=null;rememberQuery();
  if(byId[p.get('word')])detail(p.get('word'),false,context);
  else{render();try{window.scrollTo(0,context.y)}catch(_){}}
 }
 function boot(){
  var prefs=main.settings&&typeof main.settings==='object'?main.settings:{},dark=prefs.theme!=='light',theme=Object.prototype.hasOwnProperty.call(data.themes,prefs.palette)?data.themes[prefs.palette]:data.themes.jade;
  if(prefs.theme==='system'&&window.matchMedia)dark=matchMedia('(prefers-color-scheme: dark)').matches;
  Object.keys(theme[dark?'dark':'light']).forEach(function(k){document.documentElement.style.setProperty('--'+k,theme[dark?'dark':'light'][k])});document.documentElement.style.colorScheme=dark?'dark':'light';
  el('watch-search').addEventListener('submit',function(e){e.preventDefault();query(el('watch-query').value,true)});
  el('watch-query').addEventListener('input',function(e){if(!e.isComposing)query(e.target.value)});el('watch-query').addEventListener('compositionend',function(e){query(e.target.value)});
  el('watch-query').addEventListener('change',function(e){query(e.target.value,true)});
  el('watch-scope').addEventListener('change',function(e){if(s.view!=='search')return;s.scope=e.target.value;query(s.q,true)});
  el('watch-script').addEventListener('change',function(e){s.script=e.target.value==='traditional'?'traditional':'simplified';persist();if(s.view==='detail'){var b=el('watch-results').querySelector('[data-save]');if(b)detail(b.dataset.save,false)}else render()});
  document.addEventListener('click',function(e){var b=e.target.closest('a,button');if(!b)return;
   if(b.dataset.view){e.preventDefault();go(b.dataset.view)}else if(b.dataset.word){e.preventDefault();detail(b.dataset.word)}else if(b.dataset.back)back();else if(b.dataset.save)saveWord(b.dataset.save);else if(b.dataset.more){s.limit+=6;render()}else if(b.dataset.group){stop();s.view='search';s.q='';s.scope='all';s.group=b.dataset.group;s.limit=6;updateURL();render();try{window.scrollTo(0,0)}catch(_){}}else if(b.dataset.clear){s.q='';query('',true);el('watch-query').focus()}else if(b.dataset.speak)speak(b.dataset.id,b.dataset.speak);
  });
  document.addEventListener('toggle',function(e){if(s.view!=='detail'||!activeWord||!e.target.open)return;var kind=e.target.dataset.help,w=byId[activeWord];if(kind)help([{s:kind==='example'?(w.x+' '+w.xt):kind==='usage'?w.n:activeNote,t:''}])},true);
  window.addEventListener('popstate',routeFromURL);
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')stop();else if(isList())query(el('watch-query').value,true)});
  routeFromURL();
 }
 boot();return {search:search,normalize:norm,open:detail,back:back,query:query,go:go,state:s,save:saveWord,draw:draw};
})();
