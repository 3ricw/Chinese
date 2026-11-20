const storageKey = 'chinese.chi604.course.v1';
const units = document.querySelector('#units');
const lesson = document.querySelector('#lesson');
const outline = document.querySelector('#outline');
outline.open = false;
const cards = curriculum.flatMap(([title, rows], unit) => rows.map((row, position) => ({title, unit, position, row})));
let state;
try {state = JSON.parse(localStorage.getItem(storageKey))} catch {}
if (!state || typeof state !== 'object') state = {};
function valid(index) {return Number.isInteger(index) && index >= 0 && index < cards.length}
const completed = new Set((Array.isArray(state.done) ? state.done : []).filter(valid));
const flagged = new Set((Array.isArray(state.review) ? state.review : []).filter(valid));
let cursor = valid(state.cursor) ? state.cursor : 0;
let recall = false;
let reviewing = false;
let returnCard = cursor;
let reviewQueue = [];
let finished = state.finished === true && completed.size === cards.length;
function save() {
 try {localStorage.setItem(storageKey, JSON.stringify({cursor, done:[...completed], review:[...flagged], finished}))}
 catch {document.querySelector('#notice').textContent='Keep this tab open to retain your place. Browser storage is unavailable.'}
}
function go(index) {
 cursor=index; recall=false; finished=false; save(); draw(); lesson.focus();
}
function button(parent, label, action, primary=false, command=primary?'advance':null) {
 const b=document.createElement('button'); b.type='button'; b.textContent=label;
 b.className=primary?'btn primary':'btn';
 b.onclick=action; parent.append(b); return Prep.bind(b,command);
}
function next(revisit) {
 completed.add(cursor);
 if(revisit)flagged.add(cursor);else flagged.delete(cursor);
 if(reviewing) {
  reviewQueue.shift();
  if(reviewQueue.length){go(reviewQueue[0]);return}
  reviewing=false;
  if(completed.size<cards.length){go(returnCard);return}
 } else if(cursor+1<cards.length){go(cursor+1);return}
 const missing=cards.findIndex((_,i)=>!completed.has(i));
 if(missing>=0){go(missing);return}
 finished=true; recall=false; save();draw();lesson.focus();
}
function startReview() {
 returnCard=cursor; reviewQueue=[...flagged]; reviewing=true;go(reviewQueue[0]);
}
function draw() {
 Prep.transition(lesson,finished);
 const marks=document.querySelector('#bookmarks');
 marks.hidden=!flagged.size||reviewing;
 marks.textContent='Revisit saved cards ('+flagged.size+')';
 marks.onclick=startReview;
 const {unit,position,title,row}=cards[cursor];
 units.replaceChildren();
 curriculum.forEach(([name,rows],u)=>{
  const first=cards.findIndex(card=>card.unit===u);
  const item=document.createElement('li');
  const done=rows.filter((_,j)=>completed.has(first+j)).length;
  const b=button(item,name+' · '+done+'/'+rows.length,()=>{
   reviewing=false;
   const offset=rows.findIndex((_,j)=>!completed.has(first+j));
   if(!matchMedia('(min-width:721px)').matches)outline.open=false;
   go(first+Math.max(0,offset));
  });
  if(u===unit && !finished)b.setAttribute('aria-current','step');
  units.append(item);
 });
 if(finished){
  lesson.innerHTML='<small>COURSE COMPLETE</small><h2>Put it together on paper</h2><p>You’ve worked through all '+cards.length+' cards. Try a sentence-structure response and a composition, then return to the constructions you needed help with.</p><div class="move jy-dock"><a href="practice.html">Open the six exam sections →</a></div>';
  const onward=lesson.querySelector('.move a');onward.className='btn primary';Prep.bind(onward,'advance');
  if(flagged.size)button(lesson.querySelector('.move'),'Revisit saved cards ('+flagged.size+')',startReview);
  return;
 }
 const [heading,chinese,english,rule,prompt,model]=row;
 lesson.innerHTML='<small>UNIT '+(unit+1)+' · '+title+'</small><progress aria-label="Cards studied" value="'+completed.size+'" max="'+cards.length+'"></progress><p class="step">Card '+(position+1)+' of '+curriculum[unit][1].length+' in this unit</p><h2>'+heading+'</h2>';
 if(!recall){
  lesson.innerHTML+='<div class="example"><p lang="zh-Hans">'+chinese+'</p><p>'+english+'</p><details><summary>Pinyin</summary><p>'+pronunciation[chinese]+'</p></details></div><h3>How it works</h3><p>'+rule+'</p><div class="move jy-dock"></div>';
  Prep.bind(lesson.querySelector('.example summary'),'hint');
  const actions=lesson.querySelector('.move');
  if(cursor>0&&!reviewing)button(actions,'← Previous card',()=>go(cursor-1),false,'previous');
  button(actions,'Try it with help →',()=>{recall=true;draw();lesson.focus()},true);
 }else{
  lesson.innerHTML+='<h3>Your turn</h3><p>'+prompt+'</p><p>Say it aloud or write it on paper.</p><div class="move jy-dock"></div>';
  const actions=lesson.querySelector('.move');
  button(actions,'Read the explanation',()=>go(cursor),false,'previous');
  button(actions,'Show a worked answer',()=>{
   actions.remove();
   const example=document.createElement('div'); example.className='example';
   example.innerHTML='<small>ONE WAY TO SAY IT</small><p lang="zh-Hans">'+model+'</p>';lesson.append(example);
   const controls=document.createElement('div');controls.className='move jy-dock';lesson.append(controls);
   button(controls,'Save for review',()=>next(true),false,'1');
   button(controls,'Got it · Continue →',()=>next(false),true,'3');
   Prep.transition(example);lesson.focus();
  },true);
 }
}
draw();
