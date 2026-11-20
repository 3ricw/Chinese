const key = 'chinese.chi604.flashcards.v1';
const el = id => document.getElementById(id);
const select = el('decks');
let store;
try { store = JSON.parse(localStorage.getItem(key)); } catch {}
if (!store || typeof store !== 'object' || Array.isArray(store)) store = {};
if (!store.runs || typeof store.runs !== 'object' || Array.isArray(store.runs)) store.runs = {};
let group = Number.isInteger(store.group) && wordGroups[store.group] ? store.group : 0;
const SIZE = 3;
// Short phrases make the guide’s classifiers and particles readable in context.
const wordExamples = {
 '我':['我喝茶。','Wǒ hē chá.','I drink tea.'], '喝':['喝水','hē shuǐ','drink water'], '茶':['喝茶','hē chá','drink tea'],
 '口':['三口人','sān kǒu rén','three people in a family'], '位':['两位老师','liǎng wèi lǎoshī','two teachers'],
 '个':['一个苹果','yí ge píngguǒ','one apple'], '瓶':['两瓶水','liǎng píng shuǐ','two bottles of water'],
 '杯':['一杯茶','yì bēi chá','a cup of tea'], '节':['三节课','sān jié kè','three class periods'],
 '枝':['一枝花','yì zhī huā','one flower on a stem'], '张':['两张纸','liǎng zhāng zhǐ','two sheets of paper'],
 '篇':['一篇文章','yì piān wénzhāng','one article'], '封':['一封信','yì fēng xìn','one letter'],
 '得':['写得很好','xiě de hěn hǎo','write well'], '的':['我的书','wǒ de shū','my book'],
 '了':['喝了茶','hē le chá','drank tea'], '吗':['你好吗？','Nǐ hǎo ma?','How are you?'],
 '呢':['你呢？','Nǐ ne?','How about you?'], '吧':['走吧。','Zǒu ba.','Let’s go.']
};
if (!store.history || typeof store.history !== 'object' || Array.isArray(store.history)) store.history={};
// A saved run from the original flashcards can predate the per-set history.
for(const [g,run] of Object.entries(store.runs)){
 if(wordGroups[g] && run && Number.isInteger(run.start))store.history[g+'-'+run.start]=run;
}
const route=[];
const deckOrder=wordGroups.map((_,i)=>i).filter(i=>wordGroups[i][0]!=='Foundations');
const foundations=wordGroups.findIndex(([title])=>title==='Foundations');
if(foundations>=0)deckOrder.push(foundations);
for(const deck of deckOrder){
 for(let start=0;start<wordGroups[deck][1].length;start+=SIZE)route.push({deck,start,key:deck+'-'+start});
}
if(!store.misses || typeof store.misses!=='object' || Array.isArray(store.misses))store.misses={};
function nextSet(){
 // Resume unfinished work before introducing another set.
 return route.find(({key})=>['learn','read'].includes(store.history[key]?.phase))
     || route.find(({key})=>store.history[key]?.phase!=='done');
}
function finishedSets(){return route.filter(({key})=>store.history[key]?.phase==='done').length;}
function markMiss(deck,index){
 const id=deck+'-'+index;
 store.misses[id]={deck,index,after:finishedSets()+2,tomorrow:Date.now()+86400000};
}
function dueReview(){
 const count=finishedSets(),now=Date.now();
 return Object.keys(store.misses).find(id=>{
  const m=store.misses[id];
  return wordGroups[m?.deck]?.[1]?.[m.index] && (m.after<=count || m.tomorrow<=now);
 });
}
function pickNext(allowReview=true){
 const review=allowReview && dueReview();
 if(review){
  store.review=review;store.reviewShown=false;refresh();return;
 }
 const target=nextSet();
 if(!target){window.location.assign('grammar.html');return;}
 group=target.deck;
 store.runs[group]=store.history[target.key]||newSet(target.start);
 refresh();
}
function leaveReview(){
 delete store.review;delete store.reviewShown;
}
function openSet(start, repeat=false) {
 leaveReview();
 const previous=current();
 store.history[group+'-'+previous.start]=previous;
 const stored=store.history[group+'-'+start];
 store.runs[group]=repeat||!stored?newSet(start):stored;
 refresh();
}
function newSet(start) { return {start, phase:'learn', at:0, queue:[], revealed:false}; }
function current() {
 const count = wordGroups[group][1].length;
 let s = store.runs[group];
 const limit = s ? Math.min(SIZE,count-s.start) : 0;
 if (!s || !Number.isInteger(s.start) || s.start<0 || s.start>=count || s.start%SIZE ||
     !['learn','read','done'].includes(s.phase) || !Number.isInteger(s.at) || s.at<0 || s.at>=limit ||
     !Array.isArray(s.queue) || (s.phase==='read' && !s.queue.length) ||
     s.queue.some(i=>!Number.isInteger(i)||i<0||i>=limit)) {
  s=store.runs[group]=newSet(0);
 }
 return s;
}
function save() {
 store.group=group;
 const active=current();store.history[group+'-'+active.start]=active;
 try { localStorage.setItem(key,JSON.stringify(store)); }
 catch {el('message').textContent='Browser storage is unavailable. Keep this tab open to retain your place.';}
}
function refresh() {
 if ('speechSynthesis' in window) window.speechSynthesis.cancel();
 save(); render(); el('face').focus({preventScroll:true});
}
function add(parent, tag, text, className) {
 const node=document.createElement(tag); node.textContent=text;
 if(className)node.className=className;
 parent.append(node); return node;
}
function action(label, fn, primary=false, command=primary?'advance':null) {
 const b=add(el('actions'),'button',label,primary?'btn primary':'btn');
 b.type='button';b.onclick=fn;return Prep.bind(b,command);
}
function hear(word) {
 const synth=window.speechSynthesis;
 if (!synth || typeof SpeechSynthesisUtterance==='undefined') {el('message').textContent='Audio is unavailable on this device. Use the pinyin on the card.';return;}
 synth.cancel();
 const speech=new SpeechSynthesisUtterance(word.replaceAll('…','，'));
 speech.lang='zh-CN';speech.rate=.8;
 const voice=synth.getVoices().find(v=>/^zh[-_](CN|Hans)|^cmn/i.test(v.lang));
 if(voice)speech.voice=voice;
 speech.onerror=e=>{if(!['interrupted','canceled'].includes(e.error))el('message').textContent='Mandarin audio is unavailable on this device. Use the pinyin on the card.';};
 synth.speak(speech);
}
function wordTools(word, hiddenPinyin) {
 const tools=el('study-tools');
 const listen=add(tools,'button','Listen','btn');
 listen.onclick=()=>hear(word);Prep.bind(listen,'listen');
 if(!hiddenPinyin)return;
 const hint=add(tools,'button','Pinyin hint','btn');
 Prep.bind(hint,'hint');
 hint.onclick=()=>{
  add(el('face'),'p',hiddenPinyin,'hint-reading');hint.disabled=true;
  el('face').focus({preventScroll:true});
 };
}
function render() {
 const s=current(), [title,words]=wordGroups[group];
 const set=words.slice(s.start,s.start+SIZE);
 const face=el('face'),actions=el('actions'),bar=el('progress');
 el('repeat-set').hidden=true;el('study-tools').replaceChildren();
 face.replaceChildren();actions.replaceChildren();select.value=group;
 el('deck').textContent=title;
 el('position').textContent='Set '+(1+s.start/SIZE)+' of '+Math.ceil(words.length/SIZE);
 const passed=s.phase==='done'?set.length:s.phase==='read'?set.length-s.queue.length:0;
 const picker=el('sets');
 picker.replaceChildren();
 let total=0;
 for(let start=0;start<words.length;start+=SIZE){
  const count=Math.min(words.length-start,SIZE);
  const record=start===s.start?s:store.history[group+'-'+start];
  if(record?.phase==='done')total+=count;
  else if(record?.phase==='read'&&Array.isArray(record.queue))total+=Math.max(0,count-record.queue.length);
  const label='Set '+(start/SIZE+1)+' · '+words[start][2].split(';')[0];
  const opt=add(picker,'option',label+(record?.phase==='done'?' ✓':''));opt.value=start;
 }
 picker.value=s.start;picker.onchange=()=>openSet(Number(picker.value));
 el('coverage').textContent=total+' of '+words.length+' cards recalled in this deck.';
 bar.max=set.length*2;bar.value=s.phase==='learn'?s.at:set.length+passed;
 const miss=store.misses[store.review];
 el('coach-title').textContent=miss?'Quick review':s.phase==='learn'?'Meet the word':s.phase==='done'?'Set complete':'Read from memory';
 Prep.transition(face,!miss && s.phase==='done');
 if(miss && wordGroups[miss.deck]?.[1]?.[miss.index]){
  const [word,reading,meaning]=wordGroups[miss.deck][1][miss.index];
  el('deck').textContent='Quick review';
  el('position').textContent='1 word';bar.max=1;bar.value=store.reviewShown?1:0;
  el('guide-note').textContent='You marked this word for more practice. Try reading it once more.';
  el('coverage').textContent='';
  wordTools(word,store.reviewShown?null:reading);
  add(face,'h2',word,word.length>3?'long':'').lang='zh-Hans';
  if(!store.reviewShown){
   add(face,'p','Say the word and its meaning.');
   action('Reveal pronunciation & meaning',()=>{store.reviewShown=true;refresh();},true);
  }else{
   add(face,'p',reading,'reading');add(face,'p',meaning,'meaning');
   function finishReview(again){
    if(again)markMiss(miss.deck,miss.index);else delete store.misses[store.review];
    leaveReview();save();pickNext(false);
   }
   action('Study again',()=>finishReview(true),false,'1');action('I remembered',()=>finishReview(false),true,'3');
  }
  return;
 }
 el('guide-note').textContent=s.phase==='done'?'Your progress is saved.':s.phase==='read'?'Read each word from memory. Words you find difficult will come back.':group===0&&s.start===0?'Start with these three words. Your next set is picked for you.':'Pick up here. Learn these words, then try reading them on your own.';
 if(s.phase==='done'){
  add(face,'span','✓','completion-seal').setAttribute('aria-hidden','true');add(face,'h2','You read these words','result');
  const list=add(face,'ul','','recap');
  set.forEach(([w,p,m])=>add(list,'li',w+' · '+p+' · '+m));
  const target=nextSet();
  const next=dueReview()?'a word you marked for review':target?wordGroups[target.deck][0]+' · Set '+(1+target.start/SIZE):'sentence lessons';
  add(face,'p','Up next: '+next,'result-next');
  action('Continue studying →',()=>pickNext(),true);
  el('repeat-set').hidden=false;el('repeat-set').onclick=()=>openSet(s.start,true);
  return;
 }
 const learning=s.phase==='learn';
 const [word,pinyin,meaning]=set[learning?s.at:s.queue[0]];
 if(learning)add(face,'small','Word '+(s.at+1)+' of '+set.length);
 wordTools(word,learning||s.revealed?null:pinyin);
 const han=add(face,'h2',word,word.length>3?'long':'');han.lang='zh-Hans';
 if(learning||s.revealed){
  add(face,'p',pinyin,'reading');add(face,'p',meaning,'meaning');
  if(wordExamples[word] && (group<7 || ['我','喝','茶'].includes(word))){
   const [zh,py,en]=wordExamples[word];
   const detail=add(face,'details','');Prep.bind(add(detail,'summary','See it in a phrase'),'hint');
   add(detail,'p',zh).lang='zh-Hans';add(detail,'p',py);add(detail,'p',en);
  }
 } else add(face,'p','Say the word and its meaning.');
 if(learning) {
  action(s.at+1===set.length?'Try reading these words →':'Meet the next word →',()=>{
   if(s.at+1<set.length)s.at++;
   else {s.phase='read';s.queue=set.map((_,i)=>i);}
   refresh();
  },true);
 } else if(!s.revealed)action('Reveal pronunciation & meaning',()=>{s.revealed=true;refresh();},true);
 else {
  action('Study again',()=>{markMiss(group,s.start+s.queue[0]);s.queue.push(s.queue.shift());s.revealed=false;refresh();},false,'1');
  action('I remembered',()=>{s.queue.shift();s.revealed=false;if(!s.queue.length)s.phase='done';refresh();},true,'3');
 }
}
wordGroups.forEach(([name],i)=>{const opt=add(select,'option',name);opt.value=i;});
select.onchange=()=>{leaveReview();group=Number(select.value);refresh();};
if(current().phase==='done' && !store.misses[store.review] && (nextSet()||dueReview()))pickNext();
else render();
