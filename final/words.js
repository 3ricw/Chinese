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
function openSet(start, repeat=false) {
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
function action(label, fn, primary=false) {
 const b=add(el('actions'),'button',label,primary?'primary':'');
 b.type='button';b.onclick=fn;return b;
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
function render() {
 const s=current(), [title,words]=wordGroups[group];
 const set=words.slice(s.start,s.start+SIZE);
 const face=el('face'),actions=el('actions'),bar=el('progress');
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
 if(s.phase==='done'){
  add(face,'small','SET COMPLETE');add(face,'h2','You read these words','result');
  const list=add(face,'ul','','recap');
  set.forEach(([w,p,m])=>add(list,'li',w+' · '+p+' · '+m));
  action('Repeat this set',()=>openSet(s.start,true));
  if(s.start+SIZE<words.length)action('Next set →',()=>openSet(s.start+SIZE),true);
  else if(group+1<wordGroups.length)action('Next deck →',()=>{group++;refresh();},true);
  else {const link=add(actions,'a','Continue to sentence lessons →');link.href='grammar.html';}
  return;
 }
 const learning=s.phase==='learn';
 const [word,pinyin,meaning]=set[learning?s.at:s.queue[0]];
 add(face,'small',learning?'MEET THE WORD · '+(s.at+1)+' / '+set.length:'READ FROM MEMORY');
 const han=add(face,'h2',word,word.length>3?'long':'');han.lang='zh-Hans';
 if(learning||s.revealed){
  add(face,'p',pinyin,'reading');add(face,'p',meaning,'meaning');
  if(wordExamples[word] && (group<7 || ['我','喝','茶'].includes(word))){
   const [zh,py,en]=wordExamples[word];
   const detail=add(face,'details','');add(detail,'summary','See it in a phrase');
   add(detail,'p',zh).lang='zh-Hans';add(detail,'p',py);add(detail,'p',en);
  }
  action('Listen',()=>hear(word));
 } else add(face,'p','Say the word and its meaning.');
 if(learning) {
  action(s.at+1===set.length?'Try reading these words →':'Meet the next word →',()=>{
   if(s.at+1<set.length)s.at++;
   else {s.phase='read';s.queue=set.map((_,i)=>i);}
   refresh();
  },true);
 } else if(!s.revealed)action('Reveal pronunciation & meaning',()=>{s.revealed=true;refresh();},true);
 else {
  action('Study again',()=>{s.queue.push(s.queue.shift());s.revealed=false;refresh();});
  action('I remembered',()=>{s.queue.shift();s.revealed=false;if(!s.queue.length)s.phase='done';refresh();},true);
 }
}
wordGroups.forEach(([name],i)=>{const opt=add(select,'option',name);opt.value=i;});
select.onchange=()=>{group=Number(select.value);refresh();};
render();
