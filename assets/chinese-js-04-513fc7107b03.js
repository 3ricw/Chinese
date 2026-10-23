/* ==========================================================================
   Engagement port (runs after the reviewed Boost layer).
   Restores the home streak/level strip, daily quests and quick games, the
   level-up and treasure-chest celebrations, and Arcade in the mobile nav.
   Everything else (pools, scoring, guards, undo, backups) stays as reviewed.
   ========================================================================== */

/* ---------- Celebrations ---------- */
// Celebrations that arrive while another dialog is open wait their turn instead of collapsing into a toast.
let bxPortModalQueue=[];
const bxPortModalBase=bxModal;
bxModal=function(markup){if($('overlay').innerHTML){if(bxPortModalQueue.length<3)bxPortModalQueue.push(markup);return}bxPortModalBase(markup)};
const bxPortCloseBase=closeModal;
closeModal=function(...args){const r=bxPortCloseBase(...args);if(!$('overlay').innerHTML&&bxPortModalQueue.length){const next=bxPortModalQueue.shift();setTimeout(()=>bxModal(next),250)}return r};
bxLevelUp=function(level){
 bxConfetti(180);playStudySound('milestone');
 setTimeout(()=>bxModal(`<div class="bx-celebrate"><div class="bx-level-badge big">${level}</div><span class="eyebrow">Level up</span><h2>You reached level ${level}!</h2><p>${esc(bxLevelTitle(level))}. Keep the combo going.</p><button class="btn primary full" onclick="closeModal()">Keep going</button></div>`),350)
};
bxShowChest=function(){
 const day=bxDay();if(!day.chest||day.chestRewarded)return;day.chestRewarded=true;
 const freeze=bx.freezes<2;if(freeze)bx.freezes++;bxSave();bxGainXP(40,{quiet:true});bxConfetti(160);
 setTimeout(()=>bxModal(`<div class="bx-celebrate"><div class="bx-celebrate-glyph" aria-hidden="true">宝</div><span class="eyebrow">All daily quests done</span><h2>Treasure chest opened!</h2><p>+40 XP${freeze?' and a streak freeze':''}. Come back tomorrow for new quests.</p><button class="btn primary full" onclick="closeModal()">Collect</button></div>`),900)
};
const bxPortQuestBase=bxCheckQuests;
bxCheckQuests=function(...args){const before=bxDay().quests.length;const r=bxPortQuestBase(...args);if(bxDay().quests.length>before&&!bxDay().chestRewarded)bxConfetti(60);return r};

/* ---------- Game pools: no lock-out right after the first character ---------- */
// With 0 studied characters the reviewed pool uses a Foundations starter set; with 1–7 it used only those few,
// which locked every game. Top up with the same starter set until the pool reaches its minimum.
const bxPortCardsBase=bxCards;
bxCards=function(min=8,...rest){
 const pool=bxPortCardsBase(min,...rest);if(bx.scope!=='auto'||pool.length>=min)return pool;
 return bxDedupe([...pool,...uniqueCards('I').slice(0,min)]).slice(0,Math.max(min,pool.length))
};

/* ---------- Home: one next step, one status row, quests, three games ---------- */
function bxPortGameReady(){
 const ok=f=>{try{return f()}catch(e){return false}};
 return {tone:ok(()=>bxBuildTone().length>=3),sentence:ok(()=>bxBuildSentence().length>=3),match:ok(()=>!!bxBuildMatch()),typing:ok(()=>bxBuildTyping().length>=3),speak:ok(()=>bxBuildSpeak().length>=3),strokes:ok(()=>bxBuildStrokes().length>=3)}
}
// Today's quest games first, then games not played yet today, then the rest; ready games before locked ones.
function bxPortHomeGames(ready){
 const questGames=bxTodayQuests().filter(q=>!q.done&&BX_GAMES[q.id]).map(q=>q.id),played=bxDay().games;
 const order=[...new Set([...questGames,...Object.keys(BX_GAMES).filter(t=>!played[t]),...Object.keys(BX_GAMES)])];
 return [...order.filter(t=>ready[t]),...order.filter(t=>!ready[t])].slice(0,3).map(t=>({t,quest:questGames.includes(t)}))
}
// The hero picks the single most useful next step: unfinished session, then due reviews, then the feed.
function bxPortHero(home){
 const hero=home.querySelector('.feed-home-hero');if(!hero)return null;
 const copy=hero.querySelector('.feed-home-copy'),eyebrow=copy?.querySelector('.eyebrow'),title=copy?.querySelector('h2'),body=copy?.querySelector('p'),button=copy?.querySelector('.btn.primary');
 if(!copy||!eyebrow||!title||!body||!button)return hero;
 const due=dueCards().length;
 if(savedResume){const kind=savedResume.kind==='write'?'writing':savedResume.kind==='quiz'||savedResume.kind==='league'?'quiz':'practice';eyebrow.textContent='Pick up where you left off';title.textContent=`Finish your ${kind}.`;body.textContent='Your unfinished session is saved right where you stopped.';button.innerHTML=`Resume ${icon('arrow')}`;button.setAttribute('onclick','resumeSession()')}
 else if(due){eyebrow.textContent='Review time';title.textContent=`${due} ${due===1?'character is':'characters are'} ready to review.`;body.textContent='A quick review now keeps them from slipping away.';button.innerHTML=`Start review ${icon('arrow')}`;button.setAttribute('onclick',"feedSetMode('review')")}
 let alt='';
 if(savedResume||due)alt=`<button class="textbtn bx-hero-alt" onclick="openScrollQuickAccess()">Or keep discovering new characters ${icon('arrow')}</button>`;
 else{try{const id=courseFocusId(),next=courseNext(id),ch=CHAPTERS.find(c=>c[0]===id);if(next?.action&&ch)alt=`<button class="textbtn bx-hero-alt" onclick="${next.action}">Or follow the course: ${esc(next.label)} · ${esc(ch[1])} ${icon('arrow')}</button>`}catch(e){}}
 if(alt)button.insertAdjacentHTML('afterend',alt);
 return hero
}
function bxPortStatusRow(){
 const lv=bxLevelInfo(),s=streak(),today=state.activity[dayKey()]?.cards||0,goal=state.settings.goal||20,pct=Math.min(100,Math.round(today/goal*100));
 return `<button class="bx-status-row" onclick="navigate('stats')" aria-label="${s} day streak, level ${lv.level}, ${today} of ${goal} checks today. Open your progress"><span class="bx-status-item"><span class="bx-status-flame ${s?'is-lit':''}">${icon('flame')}</span><span class="bx-status-copy"><strong>${s}</strong><small>day streak${bx.freezes?` · ${bx.freezes} freeze${bx.freezes===1?'':'s'}`:''}</small></span></span><span class="bx-status-item bx-status-level"><span class="bx-level-badge">${lv.level}</span><span class="bx-status-copy"><span class="bx-bar"><span style="width:${lv.pct}%"></span></span><small>${lv.need-lv.into} XP to level ${lv.level+1}</small></span></span><span class="bx-status-item"><span class="bx-goal-ring" style="--p:${pct}"><span>${pct>=100?icon('check'):''}</span></span><span class="bx-status-copy"><strong>${today}/${goal}</strong><small>today's goal</small></span></span></button>`
}
const bxPortHomeBase=renderHome;
renderHome=function(...args){
 bxPortHomeBase(...args);const view=$('view'),home=view.querySelector('.feed-home');if(!home)return;
 // Stats, course card, daily bar and resume banner are folded into the hero, status row and Progress page.
 view.querySelectorAll('.bx-home-play,.feed-home-stats,.feed-home-course,.feed-home-today,.feed-resume').forEach(el=>el.remove());
 home.classList.add('bx-home-lean');
 const hero=bxPortHero(home),ready=bxPortGameReady();
 const games=`<section class="bx-home-arcade"><div class="bx-section-head"><h2>Quick games</h2><button class="textbtn" onclick="navigate('arcade')">All games ${icon('arrow')}</button></div><div class="bx-quick-row">${bxPortHomeGames(ready).map(({t,quest})=>`<button class="bx-quick ${ready[t]?'':'is-locked'}" data-game="${t}" onclick="bxStart('${t}')" ${ready[t]?'':`aria-label="${esc(BX_GAMES[t].title)}, unlocks after you learn a few more characters"`}><span lang="zh" aria-hidden="true">${BX_GAMES[t].glyph}</span><strong>${esc(BX_GAMES[t].title)}</strong><small>${!ready[t]?'Learn a few characters to unlock':quest?'Daily quest':esc(BX_GAMES[t].skill)}</small></button>`).join('')}</div></section>`;
 (hero||home.querySelector('.heading'))?.insertAdjacentHTML('afterend',bxPortStatusRow()+`<div class="bx-home-grid">${bxQuestMarkup(true)}${games}</div>`);
};

/* ---------- Arcade in the mobile nav ---------- */
const bxPortActiveBase=mainNavActive;
mainNavActive=function(){if(currentView==='arcade'||currentView==='game')return 'arcade';if(currentView==='stats')return 'stats';return bxPortActiveBase()};
const bxPortNavBase=mainNavigationMarkup;
// Phone bar: five tabs with Scroll in the middle. Review lives in Tools (and in the home card when cards are due).
const BX_MOBILE_TABS=[['home','Home','home',"navigate('home')"],['learn','Course','learn',"navigate('learn')"],['scroll','Scroll','scroll','openScrollQuickAccess()'],['arcade','Arcade','game',"navigate('arcade')"],['tools','Tools','tools',"navigate('tools')"]];
mainNavigationMarkup=function(mobile=false,...rest){
 if(!mobile)return bxPortNavBase(mobile,...rest);
 let active=mainNavActive();if(active==='review'||currentView==='review')active='tools';
 return BX_MOBILE_TABS.map(([id,label,glyph,action])=>`<button type="button" aria-label="${label}" class="${active===id?'active':''} bx-nav-${id} ${id==='scroll'?'scroll-nav-tab':''}" ${active===id?'aria-current="page"':''} onclick="${action}">${id==='scroll'?scrollNavIcon():icon(glyph)}<span>${label}</span></button>`).join('')
};

/* ---------- Review card in Tools ---------- */
const bxPortToolsBase=renderTools;
renderTools=function(...args){
 const r=bxPortToolsBase(...args),grid=$('view').querySelector('.flow-tool-grid');
 if(grid&&!grid.querySelector('.bx-tool-review')){const due=dueCards().length;grid.insertAdjacentHTML('afterbegin',`<button class="flow-tool bx-tool-review" type="button" onclick="navigate('review')"><span>${icon('review')}</span><strong>Review${due?` <em class="bx-due-badge">${due} due</em>`:''}</strong><small>${due?'Characters ready for review, plus targeted practice and recall quizzes.':'Targeted practice, recall quizzes, and similar shapes.'}</small>${icon('arrow')}</button>`)}
 return r
};

/* ---------- Floating phone bar that shrinks while scrolling down ---------- */
// Scroll sets a destination; one animation loop gently catches up to it.
let bxNavLastY=Math.max(0,Number(window.scrollY)||0),bxNavFrame=0,bxNavProgress=0;
let bxNavTarget=0,bxNavAnimation=0,bxNavLastTime=0;
function bxNavReduced(){return document.body.classList.contains('flow-reduce-motion')||window.matchMedia('(prefers-reduced-motion: reduce)').matches}
function bxNavKeyboardFocus(){return !!document.querySelector('.mobile-nav :focus-visible')}
function bxNavPaint(value){
 bxNavProgress=Math.max(0,Math.min(1,Number(value)||0));
 document.body.style.setProperty('--bx-nav-progress',bxNavProgress.toFixed(4));
 document.body.classList.toggle('bx-nav-compact',bxNavProgress>.98);
}
function bxNavSetProgress(value){
 if(bxNavAnimation)cancelAnimationFrame(bxNavAnimation);
 bxNavAnimation=0;bxNavLastTime=0;bxNavTarget=Math.max(0,Math.min(1,Number(value)||0));bxNavPaint(bxNavTarget);
}
function bxNavSetCompact(on){bxNavSetProgress(on?1:0)}
function bxNavAnimate(time){
 bxNavAnimation=0;
 if(bxNavReduced()||bxNavKeyboardFocus()){bxNavSetProgress(0);return}
 const dt=bxNavLastTime?Math.min(48,Math.max(0,time-bxNavLastTime)):16;
 bxNavLastTime=time;
 const next=bxNavProgress+(bxNavTarget-bxNavProgress)*(1-Math.exp(-dt/95));
 if(Math.abs(bxNavTarget-next)<.001){bxNavPaint(bxNavTarget);bxNavLastTime=0;return}
 bxNavPaint(next);bxNavAnimation=requestAnimationFrame(bxNavAnimate);
}
function bxNavAim(value){
 bxNavTarget=Math.max(0,Math.min(1,Number(value)||0));
 if(!bxNavAnimation&&Math.abs(bxNavTarget-bxNavProgress)>.0001)bxNavAnimation=requestAnimationFrame(bxNavAnimate);
}
function bxNavScrollTo(rawY){
 const y=Math.max(0,Number(rawY)||0),before=bxNavLastY;bxNavLastY=y;
 if(bxNavReduced()||bxNavKeyboardFocus()||!window.matchMedia('(max-width:900px)').matches){bxNavSetProgress(0);return}
 if(y<=32){bxNavAim(0);return}
 const delta=y-Math.max(32,before);
 if(Math.abs(delta)<1)return;
 bxNavAim(bxNavTarget+delta/(delta<0?210:320));
}
window.addEventListener('scroll',()=>{
 if(bxNavFrame)return;bxNavFrame=requestAnimationFrame(()=>{bxNavFrame=0;bxNavScrollTo(window.scrollY)})
},{passive:true});
document.addEventListener('focusin',e=>{
 if(e.target?.closest?.('.mobile-nav')&&bxNavKeyboardFocus())bxNavSetProgress(0)
});
window.addEventListener('resize',()=>{
 if(!window.matchMedia('(max-width:900px)').matches)bxNavSetProgress(0);
 bxNavLastY=Math.max(0,Number(window.scrollY)||0)
},{passive:true});
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change',e=>{if(e.matches)bxNavSetProgress(0)});
const bxPortNavChromeBase=chrome;
let bxNavView='';
chrome=function(...args){const r=bxPortNavChromeBase(...args);if(bxNavView!==currentView){bxNavSetProgress(0);bxNavView=currentView;bxNavLastY=Math.max(0,Number(window.scrollY)||0)}return r};

/* ---------- Speak & Shadow that works on phones ---------- */
// Phones need: start() called directly from the tap, interim results (iOS Safari often never marks a result
// final), a timeout, visible error reasons, and a record-and-compare path when recognition isn't available.
const BX_NUMS={'0':'零','1':'一','2':'二','3':'三','4':'四','5':'五','6':'六','7':'七','8':'八','9':'九','10':'十'};
const BX_TRAD_TO_SIMP=Object.fromEntries(Object.entries(tradMap).filter(([s,t])=>s!==t).map(([s,t])=>[t,s]));
const BX_CHAR_PY=(()=>{const m={};for(const c of CARDS)(m[c.character]??=new Set()).add(bxClean(c.pinyin));return m})();
function bxPortIsIOS(){return /iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}
function bxPortInAppOrNonSafariIOS(){return bxPortIsIOS()&&/CriOS|FxiOS|EdgiOS|OPiOS|GSA\/|FBAN|FBAV|Instagram|Line\//.test(navigator.userAgent)}
function bxPortNormalizeHeard(s){
 s=String(s||'').normalize('NFC').replace(/[\s，。！？、,.!?：:；;“”"'‘’…·]/g,'');
 if(BX_NUMS[s])return BX_NUMS[s];
 return [...s.replace(/\d/g,d=>BX_NUMS[d])].map(ch=>BX_TRAD_TO_SIMP[ch]||ch).join('')
}
// Transcript matching does not grade pronunciation; a same-tone homophone (e.g. 是/事) counts; numerals count as characters.
function bxPortHeardMatches(heard,target){
 if(!heard||!target)return false;if(heard===target)return true;
 const H=[...heard],T=[...target];
 const same=(a,b)=>a===b||(BX_CHAR_PY[a]&&BX_CHAR_PY[b]&&[...BX_CHAR_PY[a]].some(p=>BX_CHAR_PY[b].has(p)));
 if(H.length===T.length&&T.every((ch,i)=>same(H[i],ch)))return true;
 return T.length>=2&&H.length<=T.length+2&&heard.includes(target)
}
function bxPortMicError(code){
 const ios=bxPortIsIOS();
 return ({
  'not-allowed':ios?'Microphone or speech recognition is blocked. Allow microphone access in Safari’s website settings. Check that Siri and Dictation are enabled, then retry.':'Microphone is blocked for this page. Allow it in your browser’s site settings, then try again.',
  'service-not-allowed':ios?'Speech recognition isn’t allowed here. Open the file in Safari itself (not an in-app browser) with Siri & Dictation turned on.':'This browser won’t run speech recognition on this page. Try Chrome, or use Record yourself below.',
  'network':'Speech checking needs an internet connection. Use Record yourself below, or try again online.',
  'audio-capture':'No microphone was found, or another app is using it.',
  'language-not-supported':ios?'Mandarin speech recognition isn’t available here. Try Chinese keyboard dictation below, or record and compare.':'This browser can’t recognize Mandarin. Use Record yourself below.',
  'no-speech':'Didn’t hear anything. Tap the mic, then speak right away.'
 })[code]||`Speech checking stopped (${code}). Try again, or use Record yourself below.`
}
// Browsers only allow the microphone on secure pages (https:// or a local file); plain http:// is blocked outright.
function bxPortSecure(){return window.isSecureContext!==false}
const BX_INSECURE_MSG='The microphone is blocked on this http:// page. Open https://3ricw.github.io/Chinese/ in your browser and allow microphone access.';
function bxPortNoRecognitionMessage(){return bxPortInAppOrNonSafariIOS()?'Speech checking is unavailable in this browser. Try the published app in Safari, or use keyboard dictation below.':'This browser can’t check speech here. Try keyboard dictation, or record yourself and compare with the model.'}
// Update transcript text without rebuilding the buttons under the user's finger.
function bxSpeechLive(it,message){
 const node=$('bx-speech-live');if(!node)return;
 node.textContent=message||(it.heard?`Hearing: ${it.heard}`:'Listening… say the word');
 node.classList.toggle('is-pending',!it.heard);
}
function bxDictationCompare(){
 const g=bxGame,it=g?.items[g.pos];if(!it||g.type!=='speak'||g.done||currentView!=='game')return;
 const heard=bxPortNormalizeHeard($('bx-dictation-input')?.value||'');
 const out=$('bx-dictation-result');if(!out)return;
 out.textContent=!heard?'Use your keyboard microphone or enter the words you heard.':bxPortHeardMatches(heard,bxPortNormalizeHeard(it.key))?'The words match. Listen back to check your tones, then rate yourself.':`Your text: ${heard}. Compare it with ${it.zh}, or try dictating again.`;
 // Keyboard text is a self-check: it never silently grants speech XP or mastery.
}
bxListen=function(){
 const g=bxGame,it=g?.items[g.pos];if(!it||g.type!=='speak'||g.done||currentView!=='game'||g.feedback)return;
 if(bxRec&&['starting','listening','processing'].includes(it.status)){bxRec._finishListening?.();return}
 if(!bxPortSecure()){it.warn=BX_INSECURE_MSG;bxRenderGame();return}
 if(!BX_SR){it.warn=bxPortNoRecognitionMessage();bxRenderGame();return}
 bxStopRecognition();try{window.speechSynthesis?.cancel()}catch(e){}
 let rec;try{rec=new BX_SR()}catch(e){it.warn=bxPortNoRecognitionMessage();it.diag='create';bxRenderGame();return}
 rec.lang='zh-CN';rec.interimResults=true;rec.continuous=false;rec.maxAlternatives=5;
 let heard=[],finished=false,timer=0,endTimer=0,stopping=false;
 const micSerial=++bxRecordSerial,target=bxPortNormalizeHeard(bxHanChars(it.key).join(''));
 const current=()=>micSerial===bxRecordSerial&&bxGame===g&&!g.done&&currentView==='game'&&g.items[g.pos]===it&&!g.feedback;
 const cleanup=()=>{clearTimeout(timer);clearTimeout(endTimer);if(bxRec===rec)bxRec=null;rec.onstart=rec.onaudiostart=rec.onspeechstart=rec.onresult=rec.onerror=rec.onend=null;try{rec.abort()}catch(e){}};
 const evaluate=()=>{
  if(finished)return;finished=true;cleanup();if(!current())return;it.status='';
  if(!heard.length){it.warn='No words came through. Try again in a quiet spot, or use keyboard dictation below.';bxRenderGame();return}
  const matched=heard.find(h=>bxPortHeardMatches(h,target));it.heard=matched||heard[0];it.warn='';
  if(matched){g.feedback={ok:true,title:'Word recognized',detail:`<span lang="zh">${esc(it.zh)}</span> ${bxToneColored(it.py)} · compare your recording with the model for tones`};bxResult(true,it.key,{base:15})}
  else{it.tries=(it.tries||0)+1;if(it.tries>=3){g.feedback={ok:false,title:'Keep practicing this one',detail:`Listen again and copy the tones: ${bxToneColored(it.py)}`};bxResult(false,it.key)}else it.warn='I heard a different word. Listen to the model and try again, or use the self-check.'}
  bxRenderGame();bxAfterRender()
 };
 const stop=()=>{
  if(!current()||finished||stopping)return;stopping=true;it.status='processing';clearTimeout(timer);bxRenderGame();bxSpeechLive(it,it.heard?`Checking: ${it.heard}`:'Checking what you said…');
  try{rec.stop()}catch(e){evaluate();return}
  // Some phone engines omit onend. Keep the latest interim result, then release the mic.
  if(!finished)endTimer=setTimeout(evaluate,1600);
 };
 rec._finishListening=stop;
 rec.onstart=()=>{if(!current()||finished||stopping)return;it.status='listening';clearTimeout(timer);timer=setTimeout(stop,12000);bxRenderGame();bxSpeechLive(it)};
 rec.onaudiostart=()=>{if(current()&&!finished)bxSpeechLive(it,'Microphone ready · say the word')};
 rec.onspeechstart=()=>{if(current()&&!finished)bxSpeechLive(it,'Hearing your voice…')};
 rec.onresult=e=>{
  if(!current()||finished||bxRec!==rec)return;
  const all=Array.from(e.results||[]),last=all[all.length-1];if(!last)return;
  // Use full phrase alternatives, not a partial final segment that could pass by itself.
  const prefix=all.slice(0,-1).map(r=>r[0]?.transcript||'').join('');
  heard=[...new Set(Array.from(last,a=>bxPortNormalizeHeard(prefix+(a.transcript||''))).filter(Boolean))];
  it.heard=heard[0]||'';bxSpeechLive(it);
  if(last.isFinal)evaluate();
 };
 rec.onerror=e=>{
  if(finished||!current())return;
  if((e.error==='no-speech'||e.error==='aborted')&&heard.length){evaluate();return}
  finished=true;cleanup();it.status='';it.diag=e.error;
  it.warn=e.error==='aborted'?'Speech check stopped. Tap Check speech to try again.':bxPortMicError(e.error);
  if(['not-allowed','service-not-allowed','language-not-supported'].includes(e.error))g.micBlocked=true;
  bxRenderGame();
 };
 rec.onend=evaluate;
 bxRec=rec;it.status='starting';it.warn='';it.heard='';bxRenderGame();
 // start remains synchronous with the tap, as required by mobile permission handling.
 try{rec.start()}catch(e){if(!current())return;finished=true;cleanup();it.status='';it.warn=bxPortMicError(e.name==='NotAllowedError'?'not-allowed':'start-'+(e.name||'error'));bxRenderGame();return}
 if(!finished&&it.status==='starting')timer=setTimeout(stop,10000);
};
// Record yourself: plain audio recording, played back next to the model voice.
let bxMedia=null,bxRecordSerial=0,bxRecordPending=false,bxMineAudio=null;
function bxCanRecord(){return !!(navigator.mediaDevices?.getUserMedia&&window.MediaRecorder)||!bxPortSecure()}
function bxStopRecording(){
 bxRecordSerial++;bxRecordPending=false;const it=bxGame?.items[bxGame.pos];if(it&&['recording','requesting'].includes(it.status))it.status='';
 const m=bxMedia;bxMedia=null;if(!m)return;clearTimeout(m.timer);m.rec.onstop=m.rec.onerror=m.rec.ondataavailable=null;
 try{if(m.rec.state!=='inactive')m.rec.stop()}catch(e){}m.stream.getTracks().forEach(t=>t.stop())
}
function bxStopMineAudio(){const a=bxMineAudio;bxMineAudio=null;try{a?.pause()}catch(e){}}

async function bxRecordToggle(){
 const g=bxGame,it=g?.items[g.pos];if(!it||g.done||currentView!=='game'||g.type!=='speak')return;
 if(bxRecordPending)return;
 if(bxMedia){try{bxMedia.rec.stop()}catch(e){bxStopRecording()}return}
 if(!bxPortSecure()){it.warn=BX_INSECURE_MSG;bxRenderGame();return}
 if(!bxCanRecord()){it.warn='Recording isn’t supported in this browser.';bxRenderGame();return}
 bxStopRecognition();bxStopMineAudio();try{window.speechSynthesis?.cancel()}catch(e){}
 const serial=++bxRecordSerial,current=()=>serial===bxRecordSerial&&bxGame===g&&!g.done&&g.items[g.pos]===it&&currentView==='game';
 bxRecordPending=true;it.status='requesting';it.warn='';bxRenderGame();
 let stream;try{stream=await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){if(!current())return;bxRecordPending=false;it.status='';it.warn=e.name==='NotAllowedError'?'Microphone access is blocked. Allow it in your browser’s site settings, then try again.':`The microphone couldn’t start (${e.name||'error'}).`;bxRenderGame();return}
 if(!current()){stream.getTracks().forEach(t=>t.stop());return}
 bxRecordPending=false;
 let mr;try{mr=new MediaRecorder(stream)}catch(e){stream.getTracks().forEach(t=>t.stop());it.status='';it.warn='Recording isn’t supported in this browser.';bxRenderGame();return}
 const chunks=[],media={rec:mr,stream,timer:0};bxMedia=media;
 const release=()=>{clearTimeout(media.timer);media.stream.getTracks().forEach(t=>t.stop());if(bxMedia===media)bxMedia=null};
 mr.ondataavailable=e=>{if(current()&&bxMedia===media&&e.data?.size)chunks.push(e.data)};
 mr.onerror=()=>{if(bxMedia!==media)return;bxStopRecording();if(bxGame===g&&currentView==='game'&&g.items[g.pos]===it){it.warn='Recording stopped. Try again.';bxRenderGame()}};
 mr.onstop=()=>{if(!current()||bxMedia!==media){release();return}release();if(it.recUrl)URL.revokeObjectURL(it.recUrl);it.recUrl=chunks.length?URL.createObjectURL(new Blob(chunks,{type:mr.mimeType||'audio/mp4'})):'';it.status='';if(!it.recUrl)it.warn='Nothing was recorded. Try again.';bxRenderGame()};
 try{mr.start()}catch(e){bxStopRecording();it.status='';it.warn='The recording could not start. Try again.';bxRenderGame();return}
 media.timer=setTimeout(()=>{if(bxMedia===media)try{mr.stop()}catch(e){bxStopRecording()}},4000);
 it.status='recording';it.warn='';bxRenderGame()
}

function bxPlayMine(){const it=bxGame?.items[bxGame.pos];if(!it?.recUrl||currentView!=='game')return;bxStopRecognition();try{window.speechSynthesis?.cancel()}catch(e){}const audio=new Audio(it.recUrl);bxMineAudio=audio;audio.play().catch(()=>{if(bxMineAudio!==audio||currentView!=='game'||bxGame?.items[bxGame.pos]!==it)return;it.warn='Couldn’t play the recording. Tap Play mine again.';bxRenderGame()})}
function bxSpeakModel(){const it=bxGame?.items[bxGame.pos];if(it&&currentView==='game'){bxStopRecognition();speak(it.key)}}

const bxPortStopRecBase=bxStopRecognition;
bxStopRecognition=function(...args){bxStopRecording();bxStopMineAudio();const it=bxGame?.items[bxGame.pos];if(it&&['starting','listening','processing'].includes(it.status))it.status='';if(bxRec)bxRec.onstart=bxRec.onaudiostart=bxRec.onspeechstart=null;return bxPortStopRecBase(...args)};
bxRenderSpeak=function(){
 const g=bxGame,it=g.items[g.pos],answered=!!g.feedback,listening=['starting','listening','processing'].includes(it.status),recording=it.status==='recording';
 const check=!!BX_SR&&!g.micBlocked,record=bxCanRecord();
 const micBtn=check?`<button class="btn primary bx-mic ${listening?'is-live':''}" ${answered||recording||bxRecordPending||it.status==='processing'?'disabled':''} onclick="bxListen()">${icon('mic')} ${listening?(it.status==='processing'?'Checking…':it.status==='starting'?'Starting… tap to stop':'Done speaking'):it.heard?'Try speech again':'Check speech'}</button>`:'';
 const recBtn=record?`<button class="btn bx-record ${recording?'is-live':''}" ${listening||bxRecordPending?'disabled':''} onclick="bxRecordToggle()">${bxRecordPending?'Requesting microphone…':recording?'■ Stop':`<span class="bx-rec-dot" aria-hidden="true"></span> ${it.recUrl?'Record again':'Record & compare'}`}</button>`:'';
 const mine=it.recUrl?`<button class="btn" onclick="bxPlayMine()">${icon('replay')} Play mine</button>`:'';
 const hint=check?'Check speech confirms words, not your tones. Record & compare lets you hear yourself next to the model.':record?'Listen to the model, record yourself, then play both and compare.':'Listen, repeat out loud, then rate how close you were.';
 return bxGameShell(`<span class="bx-kicker">${check?'Say it out loud':'Shadowing · listen, repeat, compare'}</span><div class="bx-han" lang="zh">${esc(it.zh)}</div><div class="bx-py">${bxToneColored(it.py)}</div><p class="bx-meaning">${esc(it.meaning)}</p><div class="bx-speak-actions"><button class="btn" onclick="bxSpeakModel()">${icon('sound')} Model</button>${mine}${recBtn}${micBtn}</div><p class="bx-hint">${hint}</p><details class="quiet-details bx-speech-privacy"><summary>Microphone privacy</summary><p class="small muted">Your browser may process microphone audio online for speech checks. Recordings stay in this page and are not included in progress backups.</p></details><p id="bx-speech-live" class="bx-speech-live ${!it.heard?'is-pending':''}" role="status" aria-live="polite" aria-atomic="true">${listening?esc(it.heard?`Hearing: ${it.heard}`:it.status==='starting'?'Starting microphone…':'Listening… say the word'):it.heard?`Heard: ${esc(it.heard)}`:''}</p>${it.warn?`<p class="bx-warn" role="alert">${esc(it.warn)}</p>`:''}${g.micBlocked&&BX_SR?`<button class="textbtn" onclick="bxGame.micBlocked=false;bxListen()">Retry speech check</button>`:''}<details class="bx-dictation"><summary>Try keyboard dictation</summary><p>Choose Chinese on your phone keyboard, tap its microphone and say the word. You can also type it. This is a self-check.</p><label class="small" for="bx-dictation-input">Words from your keyboard</label><input id="bx-dictation-input" lang="zh-CN" type="text" placeholder="说一句话" autocomplete="off" autocapitalize="off" spellcheck="false"><button type="button" class="btn" onclick="bxDictationCompare()">Compare text</button><p id="bx-dictation-result" role="status" aria-live="polite"></p></details>`,{footer:answered?'':`<button class="btn" onclick="bxSpeakSelf(false)">Needs work</button><button class="btn primary" onclick="bxSpeakSelf(true)">I said it well</button>`})
};

function bxRevokeGameRecordings(game){for(const it of game?.items||[])if(it.recUrl){URL.revokeObjectURL(it.recUrl);delete it.recUrl}}
const bxRecordingStartBase=bxStart;
bxStart=function(...args){const old=bxGame;const result=bxRecordingStartBase(...args);if(bxGame!==old)bxRevokeGameRecordings(old);return result};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){bxStopRecognition();if(currentView==='game'&&bxGame?.type==='speak'&&!bxGame.done)bxRenderGame()}});
// Auto pools may include a small Foundations warm-up before enough characters are studied.
const bxPoolLabelBase=bxScopeLabel;
bxScopeLabel=function(){const pool=bxCards();if(bx.scope==='auto'&&pool.some(c=>!state.cards[c.character]?.seen&&!(feedEnsureState().entries[c.character]?.visits>0)))return 'Your characters + Foundations warm-up';return bxPoolLabelBase()};

/* ---------- Dark mode by default ---------- */
// One-time switch: learners still on the "System" default move to Dark. Choosing System or Light later sticks.
(function bxPortDarkDefault(){
 const FLAG='chinese1-dark-default-v1';let done=false;try{done=localStorage.getItem(FLAG)==='1';if(!done)localStorage.setItem(FLAG,'1')}catch(e){}
 if(!done&&state.settings.theme==='system'){state.settings.theme='dark';save()}
})();

/* ---------- Start ---------- */
try{theme();chrome();if(currentView==='home')renderHome()}catch(e){console.error(e)}
