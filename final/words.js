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

const el=id=>document.getElementById(id);
const key='chinese.chi604.guide-characters.v1';
const forms=characters.map(row=>row[0]);
const fresh=()=>({seen:0,pending:[],recalled:[],revealed:false});
let state;
try{state=JSON.parse(localStorage.getItem(key))}catch{}
function valid(s){
 if(!s||!Number.isInteger(s.seen)||s.seen<0||s.seen>forms.length||!Array.isArray(s.pending)||!Array.isArray(s.recalled))return false;
 const all=new Set([...s.pending,...s.recalled]);
 return s.pending.length+s.recalled.length===s.seen && all.size===s.seen && forms.slice(0,s.seen).every(c=>all.has(c));
}
if(!valid(state))state=fresh();
function update(){
 try{localStorage.setItem(key,JSON.stringify(state))}catch{el('message').textContent='Progress can be saved only while this tab stays open.'}
 render();el('face').focus({preventScroll:true});
}
function add(parent,tag,text,cls){
 const node=document.createElement(tag);node.textContent=text;if(cls)node.className=cls;parent.append(node);return node;
}
function button(parent,label,command,fn,primary=false){
 const node=add(parent,'button',label,primary?'btn primary':'btn');node.type='button';node.onclick=fn;Prep.bind(node,command);
}
function render(){
 const face=el('face'),tools=el('study-tools'),actions=el('actions');
 face.replaceChildren();tools.replaceChildren();actions.replaceChildren();
 const done=state.recalled.length;
 el('deck').textContent='Final review characters';el('position').textContent=done+' / '+forms.length;
 el('progress').max=forms.length;el('progress').value=done;
 el('coverage').textContent=done+' recalled · '+(state.seen-done)+' in practice · '+(forms.length-state.seen)+' new';
 Prep.transition(face,done===forms.length);
 if(done===forms.length){
  el('coach-title').textContent='Deck complete';el('guide-note').textContent='You recalled every character in your list.';
  add(face,'h2',done+' characters recalled','result');
  button(actions,'Practice again','advance',()=>{state=fresh();update()},true);return;
 }
 const learn=state.seen<forms.length&&state.pending.length<3;
 const i=learn?state.seen:forms.indexOf(state.pending[0]);
 const [han,traditional,reading,meaning]=characters[i];
 el('coach-title').textContent=learn?'Meet the character':'Read from memory';
 el('guide-note').textContent=learn?'Look at its shape, then say the reading and meaning.':'Say its reading and meaning before you reveal.';
 add(face,'h2',han).lang='zh-Hans';
 if(learn||state.revealed){
  add(face,'p',reading,'reading');add(face,'p',meaning,'meaning');
  if(traditional!==han)add(face,'small','Traditional · '+traditional).lang='zh-Hant';
  const terms=guideTerms.filter(([word])=>word!==han&&word.includes(han));
  if(terms.length){
   const details=add(face,'details','');add(details,'summary','In your guide');
   for(const [word,py,en] of terms)add(details,'p',word+' · '+py+' · '+en);
  }
 }
 // Context disambiguates polyphonic characters for the device's Mandarin voice.
 const context={得:'写得很好',为:'为什么',还:'还是',了:'看了',觉:'觉得',着:'看着'};
 button(tools,context[han]?'Listen in a phrase':'Listen','listen',()=>hear(context[han]||han));
 if(learn){
  button(actions,'Continue','advance',()=>{state.pending.push(han);state.seen++;state.revealed=false;update()},true);
 }else if(!state.revealed){
  button(tools,'Pinyin hint','hint',()=>{if(!face.querySelector('.hint-reading'))add(face,'p',reading,'hint-reading')});
  button(actions,'Reveal answer','advance',()=>{state.revealed=true;update()},true);
 }else{
  const rate=remembered=>{
   state.pending.shift();if(remembered)state.recalled.push(han);else state.pending.push(han);
   state.revealed=false;update();
  };
  button(actions,'Study again','1',()=>rate(false));button(actions,'I remembered','3',()=>rate(true),true);
 }
}
render();
