// Final prep uses the same appearance preferences and key conventions as guided cards.
const Prep = (() => {
 const root = document.documentElement;
 const system = matchMedia('(prefers-color-scheme: dark)');
 function appearance() {
  let saved = {};
  try {saved = JSON.parse(localStorage.getItem('hanzi-reading-room-v2')) || {};} catch {}
  const settings=saved.settings||{};
  const buddy=document.getElementById('prep-buddy');
  if(buddy){
   const pet=saved.companion;
   const show=pet?.enabled && ['dragon','turtle','phoenix'].includes(pet.starter);
   buddy.toggleAttribute('hidden',!show);
   if(show)buddy.querySelector('use').setAttribute('href','companions.svg#'+pet.starter+'-'+([0,1,2].includes(pet.stage)?pet.stage:0));
  }
  const palettes = ['jade','sky','blue','lavender','rose','imperial','amber','sage','black'];
  root.dataset.palette = palettes.includes(settings.palette) ? settings.palette : 'jade';
  root.dataset.theme = settings.theme === 'system' ? (system.matches ? 'dark' : 'light') : settings.theme === 'light' ? 'light' : 'dark';
  root.classList.toggle('quiet-study',settings.animations === false);
  document.body?.classList.toggle('flow-reduce-motion',settings.animations === false);
 }
 appearance();
 system.addEventListener('change',appearance);
 window.addEventListener('pageshow',appearance);
 window.addEventListener('storage',event=>{if(event.key==='hanzi-reading-room-v2'||event.key===null)appearance();});
 const keyNames = {advance:'Space',previous:'←',hint:'H',listen:'L'};
 const ariaKeys = {advance:'Space Enter ArrowRight',previous:'ArrowLeft',hint:'H',listen:'L'};
 function bind(node, command) {
  if (!command) return node;
  node.dataset.studyKey = command;
  node.setAttribute('aria-keyshortcuts',ariaKeys[command] || command);
  const badge=document.createElement('kbd');
  badge.textContent=keyNames[command] || command;
  badge.setAttribute('aria-hidden','true');
  node.append(badge);
  return node;
 }
 function transition(node,finished=false) {
  if(root.classList.contains('quiet-study') || matchMedia('(prefers-reduced-motion: reduce)').matches || !node.animate)return;
  node.animate([{opacity:0.38,transform:finished?'translateY(8px) scale(.98)':'translateY(5px)'},{opacity:1,transform:'none'}],
    {duration:finished?300:170,easing:'cubic-bezier(.2,.8,.2,1)'});
 }
 document.addEventListener('DOMContentLoaded',()=>{
  appearance();
  document.getElementById('keys-help').onclick=()=>document.getElementById('key-dialog').showModal();
 });
 document.addEventListener('keydown',event=>{
  const {target,key}=event;
  if(event.defaultPrevented || event.isComposing || event.keyCode===229 || event.metaKey || event.ctrlKey || event.altKey ||
     target.isContentEditable || target.closest('input,textarea,select,[role="textbox"]'))return;
  const dialog=document.getElementById('key-dialog');
  if(dialog.open)return;
  const focused=target.closest('button,a,summary');
  if(focused && (key===' '||key==='Enter')){
   if(event.repeat)event.preventDefault();
   return;
  }
  let control;
  if(key==='Escape'){
   const disclosure=target.closest('details[open]');
   if(disclosure){disclosure.open=false;disclosure.querySelector('summary')?.focus();event.preventDefault();return;}
   control=document.getElementById('study-back');
  }else if(key==='?')control=document.getElementById('keys-help');
  else {
   const command=({' ':'advance',Enter:'advance',ArrowRight:'advance',ArrowLeft:'previous',h:'hint',l:'listen','1':'1','2':'2','3':'3'})[key.length===1?key.toLowerCase():key];
   if(!command)return;
   control=[...document.querySelectorAll('[data-study-key="'+command+'"]')].find(el=>!el.disabled && el.getClientRects().length);
  }
  if(control){event.preventDefault();if(!event.repeat)control.click();}
 });
 return {bind,transition};
})();
