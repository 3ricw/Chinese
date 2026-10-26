/* ==========================================================================
   Chinese 1 · Boost layer
   XP + combos, daily quests, streak freezes, achievements, an Arcade of six
   new practice games (tones, sentence building, match sprint, pinyin typing,
   speaking, stroke order), a Progress page, and new color themes.
   Kept in its own <script> and its own localStorage key, so the original
   app keeps working even if anything here fails.
   ========================================================================== */
const BX_KEY='chinese1-boost-v1';
const BX_DAY_RE=/^\d{4}-\d{2}-\d{2}$/;
function bxDefaults(){return {v:1,xp:0,days:{},freezes:1,frozen:[],ach:{},bestCombo:0,freezeMilestone:0,themeMigrated:false,lastCheck:'',scope:'auto',toneMode:'auto',matchSide:'meaning',showPinyin:true,best:{match:0},totals:{correct:0,answers:0,tone:0,sentence:0,match:0,typing:0,speak:0,strokes:0,games:0}}}
function bxValidate(raw){
 const d=bxDefaults();if(!raw||typeof raw!=='object')return d;
 const num=(v,max=1e9)=>Number.isFinite(v)&&v>=0?Math.min(v,max):0;
 d.xp=Math.round(num(raw.xp));d.freezes=Math.floor(Math.min(2,num(raw.freezes)));d.bestCombo=num(raw.bestCombo,1e5);d.freezeMilestone=num(raw.freezeMilestone,1e5);
 d.themeMigrated=raw.themeMigrated===true;d.lastCheck=typeof raw.lastCheck==='string'&&BX_DAY_RE.test(raw.lastCheck)?raw.lastCheck:'';
 d.scope=typeof raw.scope==='string'&&(raw.scope==='auto'||currentCourse().lessons.includes(raw.scope))?raw.scope:'auto';
 d.toneMode=['auto','ear','memory'].includes(raw.toneMode)?raw.toneMode:'auto';d.matchSide=raw.matchSide==='pinyin'?'pinyin':'meaning';d.showPinyin=raw.showPinyin!==false;
 d.best.match=num(raw.best?.match,1e7);
 if(Array.isArray(raw.frozen))d.frozen=[...new Set(raw.frozen.filter(k=>typeof k==='string'&&BX_DAY_RE.test(k)))].slice(-120);
 if(raw.days&&typeof raw.days==='object')for(const [k,v] of Object.entries(raw.days)){
  if(!BX_DAY_RE.test(k)||!v||typeof v!=='object')continue;
  const day={xp:Math.round(num(v.xp)),correct:Math.min(num(v.correct),num(v.answers)),answers:num(v.answers),combo:num(v.combo),games:{},quests:Array.isArray(v.quests)?[...new Set(v.quests.filter(q=>typeof q==='string'))].slice(0,6):[],questPlan:Array.isArray(v.questPlan)?[...new Set(v.questPlan.filter(q=>typeof q==='string'&&/^[a-z]{2,12}$/.test(q)))].slice(0,3):[],chest:v.chest===true,chestRewarded:v.chestRewarded===true||(v.chest===true&&v.chestRewarded===undefined)};
  if(v.games&&typeof v.games==='object')for(const [g,n] of Object.entries(v.games))if(/^[a-z]{2,12}$/.test(g))day.games[g]=num(n,1e4);
  d.days[k]=day;
 }
 if(raw.ach&&typeof raw.ach==='object')for(const [k,v] of Object.entries(raw.ach))if(/^[a-z0-9-]{2,30}$/.test(k)&&Number.isFinite(v))d.ach[k]=v;
 if(raw.totals&&typeof raw.totals==='object')for(const k of Object.keys(d.totals))d.totals[k]=num(raw.totals[k]);
 return d;
}
function bxLoad(){try{return bxValidate(JSON.parse(localStorage.getItem(BX_KEY)||'null'))}catch(e){return bxDefaults()}}
let bx=bxLoad();
function bxSave(){try{const cutoff=new Date();cutoff.setDate(cutoff.getDate()-420);const old=dayKey(cutoff);for(const k of Object.keys(bx.days))if(k<old)delete bx.days[k];localStorage.setItem(BX_KEY,JSON.stringify(bx))}catch(e){}}
function bxDay(k=dayKey()){return bx.days[k]??={xp:0,correct:0,answers:0,combo:0,games:{},quests:[],chest:false}}
function bxMotion(){return state.settings.animations!==false&&!matchMedia('(prefers-reduced-motion: reduce)').matches}

/* ---------- Icons ---------- */
Object.assign(PATHS,{
 bolt:'M13 2 4 14h7l-1 8 9-12h-7z',
 snow:'M12 2v20 M3.5 7l17 10 M3.5 17l17-10 M9 3.5l3 2 3-2 M9 20.5l3-2 3 2',
 trophy:'M8 4h8v5a4 4 0 0 1-8 0z M8 6H5a3 3 0 0 0 3 4 M16 6h3a3 3 0 0 1-3 4 M12 13v4 M9 21h6 M10 17h4v4h-4z',
 game:'M7 7h10a5 5 0 0 1 5 5v1a3 3 0 0 1-5.3 1.9L15 13H9l-1.7 1.9A3 3 0 0 1 2 13v-1a5 5 0 0 1 5-5z M7 10v4 M5 12h4 M16 11h.01 M18 13h.01',
 chart:'M4 20V11 M10 20V5 M16 20v-6 M21 20H3',
 mic:'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z M5 11a7 7 0 0 0 14 0 M12 18v3',
 target:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9 M12 11.5a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1',
 gift:'M3 9h18v4H3z M5 13h14v8H5z M12 9v12 M12 9C10.5 5.5 7 5 7 7.2 7 9 12 9 12 9 M12 9c1.5-3.5 5-4 5-1.8C17 9 12 9 12 9',
 keyboard:'M3 6h18v12H3z M7 10h.01 M11 10h.01 M15 10h.01 M17 10h.01 M7 14h10',
 brush:'M18 3l3 3-9 9-3-3z M9 12c-2 0-4 1-4 3.5 0 1.5-1 2.5-2 3 3 1 7 0 7.5-3.5',
 tiles:'M4 5h7v6H4z M13 5h7v6h-7z M4 13h7v6H4z M13 13h7v6h-7z',
 wave:'M2 12c2-6 4-6 6 0s4 6 6 0 4-6 6 0',
 replay:'M3 12a9 9 0 1 0 3-6.7 M3 4v5h5',
 lightning:'M13 2 4 14h7l-1 8 9-12h-7z',
 eye:'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6'
});

/* ---------- New themes ---------- */
// Themes are registered before the main progress validator.
(function bxRestorePalette(){
 // The saved file was validated before these palettes existed, so read the raw choice back.
 try{const raw=JSON.parse(localStorage.getItem(KEY)||'null'),p=raw?.settings?.palette;if(p&&Object.hasOwn(PALETTES,p))state.settings.palette=p}catch(e){}
 if(!bx.themeMigrated){bx.themeMigrated=true;bxSave()}
})();

/* ---------- Levels, XP, combos ---------- */
let bxCombo=0;
function bxLevelInfo(xp=bx.xp){let level=1,base=0,need=100;while(xp>=base+need){base+=need;level++;need=100+50*(level-1)}return {level,into:xp-base,need,pct:Math.min(100,Math.round((xp-base)/need*100))}}
function bxComboMult(n=bxCombo){return n>=20?3:n>=10?2:n>=5?1.5:1}
function bxCountActivity(){bxApplyFreezes();const k=dayKey();state.activity[k]??={cards:0,readings:0};state.activity[k].cards++;save()}
function bxAnswer(correct,opts={}){
 bxApplyFreezes();const day=bxDay();day.answers++;bx.totals.answers++;let gained;
 if(correct){bxCombo++;day.correct++;bx.totals.correct++;gained=Math.round((opts.base??10)*bxComboMult())}
 else{if(bxCombo>=5&&!opts.quiet)bxFloat(`Combo ended at ${bxCombo}×`,'lost');bxCombo=0;gained=opts.effort??1}
 day.combo=Math.max(day.combo,bxCombo);bx.bestCombo=Math.max(bx.bestCombo,bxCombo);
 bxGainXP(gained,{quiet:opts.quiet,combo:correct?bxCombo:0});
 bxUpdateComboChip();
}
function bxGainXP(n,opts={}){
 n=Math.round(n);if(!(n>0))return;const before=bxLevelInfo().level;bx.xp+=n;bxDay().xp+=n;bxSave();
 if(!opts.quiet)bxFloat(`+${n} XP${opts.label?' · '+opts.label:opts.combo>=3?' · '+opts.combo+'× combo':''}`,opts.combo>=10?'blaze':opts.combo>=5?'hot':'');
 bxRefreshHud();bxCheckFreezeMilestone();bxCheckQuests();bxCheckAchievements();
 const after=bxLevelInfo().level;if(after>before)bxLevelUp(after);
}
function bxFloat(textValue,cls=''){
 const host=$('bx-float-host');if(!host)return;const el=document.createElement('div');el.className='bx-float '+cls;el.textContent=textValue;host.appendChild(el);
 while(host.children.length>3)host.firstElementChild.remove();
 setTimeout(()=>el.remove(),bxMotion()?1500:1200);
}
function bxUpdateComboChip(){document.querySelectorAll('.bx-combo-chip').forEach(el=>{el.textContent=bxCombo>=2?bxCombo+'× combo':'';el.dataset.level=bxCombo>=10?'blaze':bxCombo>=5?'hot':'';el.hidden=bxCombo<2})}

/* ---------- Streak freezes ---------- */
function bxDayActive(k){const a=state.activity[k];return !!(a&&(a.cards+a.readings)>0)}
streak=function(){
 let n=0;const d=new Date();if(!bxDayActive(dayKey(d)))d.setDate(d.getDate()-1);
 for(let guard=0;guard<4000;guard++){const k=dayKey(d);if(bxDayActive(k))n++;else if(!bx.frozen.includes(k))break;d.setDate(d.getDate()-1)}
 return n
};
function bxLongestStreak(){
 const keys=[...new Set([...Object.keys(state.activity).filter(bxDayActive),...bx.frozen])].sort();let best=0,run=0,prev=null;
 for(const k of keys){const d=new Date(k+'T12:00:00');if(prev&&(d-prev)/86400000>=1.5)run=0;if(bxDayActive(k))run++;prev=d;best=Math.max(best,run)}
 return Math.max(best,streak())
}
let bxNotice='';
function bxApplyFreezes(){
 const today=dayKey();if(bx.lastCheck===today)return;bx.lastCheck=today;
 const gap=[],d=new Date();d.setDate(d.getDate()-1);
 for(let i=0;i<14;i++){const k=dayKey(d);if(bxDayActive(k)||bx.frozen.includes(k))break;gap.push(k);d.setDate(d.getDate()-1)}
 const anchor=dayKey(d),hadStreak=gap.length<14&&(bxDayActive(anchor)||bx.frozen.includes(anchor));
 if(gap.length&&hadStreak&&gap.length<=bx.freezes){bx.frozen.push(...gap);bx.freezes-=gap.length;bxNotice=`Streak saved! ${gap.length===1?'A streak freeze covered yesterday.':gap.length+' streak freezes covered the missed days.'}`}
 bxSave()
}
function bxCheckFreezeMilestone(){
 const m=Math.floor(streak()/7);if(m<bx.freezeMilestone){bx.freezeMilestone=m;bxSave();return}
 if(m>bx.freezeMilestone){bx.freezeMilestone=m;if(bx.freezes<2){bx.freezes++;toast('7-day streak! You earned a streak freeze.')}bxSave()}
}

/* ---------- Daily quests ---------- */
const BX_QUESTS={
 xp:{icon:'bolt',label:n=>`Earn ${n} XP`,targets:[40,60,90],metric:d=>d.xp},
 correct:{icon:'check',label:n=>`Get ${n} answers right`,targets:[10,15,25],metric:d=>d.correct},
 combo:{icon:'flame',label:n=>`Reach a ${n}× combo`,targets:[5,8,12],metric:d=>d.combo},
 tone:{icon:'wave',label:()=>'Finish a Tone Trainer round',targets:[1],metric:d=>d.games.tone||0,go:"bxStart('tone')"},
 sentence:{icon:'tiles',label:()=>'Finish a Sentence Builder round',targets:[1],metric:d=>d.games.sentence||0,go:"bxStart('sentence')"},
 match:{icon:'lightning',label:()=>'Clear a Match Sprint',targets:[1],metric:d=>d.games.match||0,go:"bxStart('match')"},
 typing:{icon:'keyboard',label:()=>'Finish a Pinyin Typing round',targets:[1],metric:d=>d.games.typing||0,go:"bxStart('typing')"},
 strokes:{icon:'brush',label:()=>'Trace characters in Stroke Order',targets:[1],metric:d=>d.games.strokes||0,go:"bxStart('strokes')"},
 reading:{icon:'read',label:()=>'Finish a reading passage',targets:[1],metric:()=>state.activity[dayKey()]?.readings||0,go:"openExploreSection('read')"},
 goal:{icon:'target',label:()=>'Hit your daily check goal',targets:[1],metric:()=>(state.activity[dayKey()]?.cards||0)>=state.settings.goal?1:0,go:"openScrollQuickAccess()"}
};
function bxHash(s){let h=2166136261;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function bxTodayQuests(k=dayKey()){
 const h=bxHash(k),day=bxDay(k),eligible={tone:()=>bxBuildTone().length>=3,sentence:()=>bxBuildSentence().length>=3,match:()=>!!bxBuildMatch(),typing:()=>bxBuildTyping().length>=3};const rest=['correct','combo','tone','sentence','match','typing','reading','goal'].filter(q=>!eligible[q]||eligible[q]());
 const picks=day.questPlan?.length===3&&day.questPlan.every(id=>BX_QUESTS[id])?[...day.questPlan]:['xp'];let seed=h;while(picks.length<3){seed=Math.imul(seed^(seed>>>15),2246822519)>>>0;const q=rest[seed%rest.length];if(!picks.includes(q))picks.push(q)}
 if(!day.questPlan?.length){day.questPlan=[...picks];bxSave()}return picks.map((id,i)=>{const q=BX_QUESTS[id],target=q.targets[(h>>>(i*3))%q.targets.length],value=Math.min(target,q.metric(bxDay(k)));return {id,icon:q.icon,label:q.label(target),target,value,done:value>=target,claimed:bxDay(k).quests.includes(id),go:q.go}})
}
let bxQuestBusy=false;
function bxCheckQuests(){
 if(bxQuestBusy)return;bxQuestBusy=true;
 try{const day=bxDay();for(const q of bxTodayQuests())if(q.done&&!day.quests.includes(q.id)){day.quests.push(q.id);bxSave();toast(`Quest complete: ${q.label} · +15 XP`);bxGainXP(15,{quiet:true})}
 const all=bxTodayQuests();if(all.every(q=>q.done)&&!day.chest){day.chest=true;bxSave();bxShowChest()}}
 finally{bxQuestBusy=false}
 if(currentView==='home'||currentView==='arcade')bxRefreshQuestPanels();
}
function bxShowChest(){
 const day=bxDay();if(!day.chest||day.chestRewarded)return;day.chestRewarded=true;
 const freeze=bx.freezes<2;if(freeze)bx.freezes++;bxSave();bxGainXP(40,{quiet:true});
 toast(`Daily quests complete · +40 XP${freeze?' and a streak freeze':''}.`);
}
function bxQuestMarkup(compact=false){
 const qs=bxTodayQuests(),done=qs.filter(q=>q.done).length,day=bxDay();
 const now=new Date(),mid=new Date(now);mid.setHours(24,0,0,0);const hrs=Math.max(1,Math.round((mid-now)/3600000));
 return `<section class="bx-quests ${compact?'is-compact':''}" id="bx-quests" aria-labelledby="bx-quests-title"><div class="bx-quests-head"><div><span class="eyebrow">Daily quests</span><h2 id="bx-quests-title">${done===3?'All done today':done+' of 3 complete'}</h2></div><span class="bx-quests-timer" title="New quests at midnight">${icon('clock')} ${hrs}h left</span></div><ol class="bx-quest-list">${qs.map(q=>`<li class="bx-quest ${q.done?'is-done':''}"><span class="bx-quest-icon">${icon(q.done?'check':q.icon)}</span><div class="bx-quest-body"><strong>${esc(q.label)}</strong><div class="bx-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${q.target}" aria-valuenow="${q.value}"><span style="width:${Math.round(q.value/q.target*100)}%"></span></div></div><span class="bx-quest-count">${q.done?'+15':q.value+' / '+q.target}</span>${!q.done&&q.go?`<button class="textbtn bx-quest-go" onclick="${q.go}" aria-label="Start: ${esc(q.label)}">Go ${icon('arrow')}</button>`:''}</li>`).join('')}</ol><div class="bx-chest ${day.chest?'is-open':''}" aria-hidden="true"><span>${icon('gift')}</span><small>${day.chest?'Chest opened today':'Finish all 3 for a treasure chest'}</small></div></section>`
}
function bxRefreshQuestPanels(){const el=$('bx-quests');if(el)el.outerHTML=bxQuestMarkup(el.classList.contains('is-compact'))}

/* ---------- Achievements ---------- */
const BX_ACH=[
 ['first','始','First steps','Answer your first question',()=>bx.totals.answers>=1],
 ['xp500','星','Rising star','Earn 500 XP',()=>bx.xp>=500],
 ['xp2500','学','Scholar','Earn 2,500 XP',()=>bx.xp>=2500],
 ['xp10k','圣','Sage','Earn 10,000 XP',()=>bx.xp>=10000],
 ['combo10','火','On fire','Reach a 10× combo',()=>bx.bestCombo>=10],
 ['combo25','龙','Dragon combo','Reach a 25× combo',()=>bx.bestCombo>=25],
 ['streak3','习','Habit forming','Keep a 3-day streak',()=>streak()>=3],
 ['streak7','周','One week strong','Keep a 7-day streak',()=>streak()>=7],
 ['streak30','铁','Iron discipline','Keep a 30-day streak',()=>streak()>=30],
 ['tone50','耳','Golden ear','Get 50 tones right',()=>bx.totals.tone>=50],
 ['sent25','句','Sentence smith','Build 25 sentences',()=>bx.totals.sentence>=25],
 ['match10','快','Quick matcher','Clear 10 Match Sprints',()=>bx.totals.match>=10],
 ['type50','拼','Pinyin pro','Type 50 correct answers',()=>bx.totals.typing>=50],
 ['speak25','说','Speaking practice','Complete 25 spoken self-checks',()=>bx.totals.speak>=25],
 ['strokes20','笔','Steady brush','Trace 20 characters',()=>bx.totals.strokes>=20],
 ['chars100','百','100 characters','Practice 100 characters',()=>Object.values(state.cards).filter(c=>c.seen>0).length>=100],
 ['read5','书','Bookworm','Finish 5 readings',()=>Object.keys(state.read).length>=5],
 ['quests','宝','Treasure hunter','Open a quest chest',()=>Object.values(bx.days).some(d=>d.chest)]
];
function bxCheckAchievements(){
 let fresh=null;for(const [id,glyph,title,,test] of BX_ACH){if(bx.ach[id])continue;let ok=false;try{ok=test()}catch(e){}if(ok){bx.ach[id]=Date.now();fresh=[glyph,title]}}
 if(fresh){bxSave();toast(`Achievement unlocked: ${fresh[1]}`)}
}

/* ---------- Celebrations ---------- */
function bxConfetti(count=120){
 if(!bxMotion())return;let c=$('bx-confetti');if(!c){c=document.createElement('canvas');c.id='bx-confetti';c.setAttribute('aria-hidden','true');document.body.appendChild(c)}
 const ctx=c.getContext('2d'),dpr=Math.min(2,window.devicePixelRatio||1);c.width=innerWidth*dpr;c.height=innerHeight*dpr;ctx.scale(dpr,dpr);
 const css=getComputedStyle(document.documentElement),colors=[css.getPropertyValue('--green'),css.getPropertyValue('--accent'),'#ef4f5f','#ffd23f','#4cc9f0','#b47cff'].map(s=>s.trim()||'#3ddc97');
 const parts=Array.from({length:count},()=>({x:innerWidth/2+(Math.random()-.5)*innerWidth*.4,y:innerHeight*.35,vx:(Math.random()-.5)*14,vy:-Math.random()*13-4,s:Math.random()*7+4,r:Math.random()*6,vr:(Math.random()-.5)*.35,color:colors[Math.floor(Math.random()*colors.length)],shape:Math.random()<.5}));
 const start=performance.now();cancelAnimationFrame(bxConfetti.raf);
 (function frame(t){const life=(t-start)/1800;ctx.clearRect(0,0,innerWidth,innerHeight);for(const p of parts){p.vy+=.38;p.vx*=.985;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;ctx.save();ctx.globalAlpha=Math.max(0,1-life);ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.fillStyle=p.color;if(p.shape)ctx.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);else{ctx.beginPath();ctx.arc(0,0,p.s/3,0,7);ctx.fill()}ctx.restore()}if(life<1)bxConfetti.raf=requestAnimationFrame(frame);else ctx.clearRect(0,0,innerWidth,innerHeight)})(start)
}
function bxModal(markup){
 if($('overlay').innerHTML){toast(markup.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,90));return}
 lookupCardHistory=[];lookupFocus=document.activeElement;
 $('overlay').innerHTML=`<div class="modal-bg" onclick="if(event.target===this)closeModal()"><section class="modal bx-modal" role="dialog" aria-modal="true" aria-label="Celebration">${markup}</section></div>`;
 document.querySelector('.bx-modal button')?.focus()
}
function bxLevelUp(level){
 playStudySound('milestone');toast(`Level ${level} · ${bxLevelTitle(level)}`)
}
function bxLevelTitle(l){return l>=30?'Grand master':l>=20?'Master scholar':l>=14?'Scholar':l>=9?'Apprentice':l>=5?'Explorer':'Beginner'}

/* ---------- Hooks into existing practice ---------- */
const bxRateBase=rate;
rate=function(r){const s=session,c=s?.queue?.[s.pos],before=state.activity[dayKey()]?.cards||0,valid=s&&!s.done&&s.revealed&&['good','hard','again'].includes(r);bxRateBase(r);if(valid&&(state.activity[dayKey()]?.cards||0)>before){bxAnswer(r!=='again',{base:r==='good'?10:5})}};
const bxWritingBase=rateWriting;
rateWriting=function(got){const s=writeSession,before=state.activity[dayKey()]?.cards||0,valid=s&&!s.done&&s.revealed;bxWritingBase(got);if(valid&&(state.activity[dayKey()]?.cards||0)>before)bxAnswer(!!got,{base:12})};
const bxQuizBase=quizChoose;
quizChoose=function(ch){const s=quizSession,q=s?.questions?.[s.pos],valid=s&&!s.done&&s.kind!=='league'&&q?.choice===null&&q.choices?.some(c=>c.character===ch);bxQuizBase(ch);if(valid&&q.choice!==null)bxAnswer(ch===q.card.character)};
const bxLeagueBase=leagueChoose;
leagueChoose=function(value){const s=quizSession,q=s?.questions?.[s.pos],valid=s?.kind==='league'&&!s.done&&q?.chosen===null&&q.choices?.includes(value);bxLeagueBase(value);if(valid&&q.chosen!==null)bxAnswer(value===q.correct,{base:12})};
const bxReadingAnswerBase=answerReadingQuiz;
answerReadingQuiz=function(id,index){const s=activeReadingQuiz,q=s?.questions?.[s.pos],valid=s&&s.id===id&&!s.done&&q?.chosen===null;bxReadingAnswerBase(id,index);if(valid&&q.chosen!==null)bxAnswer(q.chosen===q.answer,{base:12})};
const bxScrollAnswerBase=answerScrollCheck;
answerScrollCheck=function(index,ch){const f=state.scrollSession?.frames?.[index],valid=currentView==='scroll'&&f&&f.chosen===null;bxScrollAnswerBase(index,ch);if(valid&&f.chosen!==null)bxAnswer(!!f.correct)};
const bxMatchChooseBase=memoryChooseCharacter;
memoryChooseCharacter=function(ch){const step=session?.memoryCoach?.steps?.[session.pos],valid=step&&step.chosen===null;bxMatchChooseBase(ch);if(valid&&step.chosen!==null)bxAnswer(ch===step.ch,{base:4,quiet:true})};
const bxActivityBase=activity;
activity=function(kind){bxActivityBase(kind);if(kind==='readings')bxGainXP(25,{label:'reading complete'})};
const bxCompletionBase=renderPracticeCompletion;
renderPracticeCompletion=function(s,...rest){const r=bxCompletionBase(s,...rest);if(s&&!s.bxCelebrated&&(s.attempts>0||s.right>0)){s.bxCelebrated=true;bxGainXP(15,{label:'session complete'});bxConfetti(110)}return r};

/* ---------- Pinyin helpers ---------- */
const BX_MARK={};'āáǎà|ēéěè|īíǐì|ōóǒò|ūúǔù|ǖǘǚǜ'.split('|').forEach((g,i)=>[...g].forEach((ch,t)=>BX_MARK[ch]=['aeiouü'[i],t+1]));
const BX_VOWELS=/[aeiouüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+/g;
function bxClean(py){return String(py).normalize('NFC').toLowerCase()}
function bxTones(py){return [...bxClean(py)].filter(ch=>BX_MARK[ch]).map(ch=>BX_MARK[ch][1])}
function bxPinyinWords(py,keepCase){return (keepCase?String(py).normalize('NFC'):bxClean(py)).replace(/[^a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ'’\s-]/gi,' ').split(/\s+/).filter(Boolean)}
function bxSyllableCount(word){return word.split(/['’-]+/).filter(Boolean).reduce((n,w)=>n+(w.match(BX_VOWELS)||[]).length+(/[aeiouüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜn]r$/.test(w)&&!/^[eēéěè]r$/.test(w)?1:0),0)}
function bxStripTones(py){return [...String(py).normalize('NFC')].map(ch=>{const m=BX_MARK[ch.toLowerCase()];if(!m)return ch;return ch===ch.toLowerCase()?m[0]:m[0].toUpperCase()}).join('')}
const BX_SYLLABLES=new Set(('a ai an ang ao ba bai ban bang bao bei ben beng bi bian biao bie bin bing bo bu ca cai can cang cao ce cen ceng cha chai chan chang chao che chen cheng chi chong chou chu chua chuai chuan chuang chui chun chuo ci cong cou cu cuan cui cun cuo da dai dan dang dao de dei den deng di dia dian diao die ding diu dong dou du duan dui dun duo e ei en eng er fa fan fang fei fen feng fo fou fu ga gai gan gang gao ge gei gen geng gong gou gu gua guai guan guang gui gun guo ha hai han hang hao he hei hen heng hong hou hu hua huai huan huang hui hun huo ji jia jian jiang jiao jie jin jing jiong jiu ju juan jue jun ka kai kan kang kao ke kei ken keng kong kou ku kua kuai kuan kuang kui kun kuo la lai lan lang lao le lei leng li lia lian liang liao lie lin ling liu lo long lou lu luan lun luo lü lüe ma mai man mang mao me mei men meng mi mian miao mie min ming miu mo mou mu na nai nan nang nao ne nei nen neng ni nian niang niao nie nin ning niu nong nou nu nuan nuo nü nüe o ou pa pai pan pang pao pei pen peng pi pian piao pie pin ping po pou pu qi qia qian qiang qiao qie qin qing qiong qiu qu quan que qun ran rang rao re ren reng ri rong rou ru ruan rui run ruo sa sai san sang sao se sen seng sha shai shan shang shao she shei shen sheng shi shou shu shua shuai shuan shuang shui shun shuo si song sou su suan sui sun suo ta tai tan tang tao te teng ti tian tiao tie ting tong tou tu tuan tui tun tuo wa wai wan wang wei wen weng wo wu xi xia xian xiang xiao xie xin xing xiong xiu xu xuan xue xun ya yan yang yao ye yi yin ying yo yong you yu yuan yue yun za zai zan zang zao ze zei zen zeng zha zhai zhan zhang zhao zhe zhei zhen zheng zhi zhong zhou zhu zhua zhuai zhuan zhuang zhui zhun zhuo zi zong zou zu zuan zui zun zuo m n ng').split(' '));
function bxParsePinyin(value){
 const s=bxClean(value).replace(/u:|v/g,'ü').replace(/’/g,"'");let syllables=[],valid=!/[^a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ0-5\s'-]/.test(s),toneInfo=/[0-5]/.test(s)||bxTones(s).length>0;
 function segment(chunk,number){const memo=new Map();function split(at){if(at===chunk.length)return [];if(memo.has(at))return memo.get(at);let best=null;for(let end=Math.min(chunk.length,at+6);end>at;end--){const part=chunk.slice(at,end),plain=bxStripTones(part),marks=bxTones(part);if(!BX_SYLLABLES.has(plain)||marks.length>1)continue;const tail=split(end);if(tail===null)continue;const candidate=[{letters:plain,tone:marks[0]||5},...tail];if(!best||candidate.length<best.length)best=candidate;}memo.set(at,best);return best}const out=split(0);if(!out)return null;if(number!==undefined){const last=out.at(-1),n=number===0?5:number;if(last.tone!==5&&last.tone!==n)return null;last.tone=n;}return out}
 for(const token of s.split(/[\s'-]+/).filter(Boolean)){let at=0;const re=/([a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+)([0-5])?/g;let m;while((m=re.exec(token))){if(m.index!==at)valid=false;at=re.lastIndex;const parts=segment(m[1],m[2]===undefined?undefined:Number(m[2]));if(parts)syllables.push(...parts);else valid=false;}if(at!==token.length)valid=false;}
 if(!syllables.length)valid=false;
 return {letters:syllables.map(x=>x.letters).join(''),tones:syllables.map(x=>x.tone),toneInfo,valid,syllables};
}

function bxToneColored(py){
 // Color each syllable by tone (Pleco-style): finds marked vowels per pinyin word chunk.
 return esc(py).split(/(\s+)/).map(part=>{if(!part.trim())return part;const t=bxTones(part);return `<span class="bx-t${t.length===1?t[0]:t.length?'m':5}">${part}</span>`}).join('')
}
const BX_CONTOUR={1:'M5 7H35',2:'M5 19 35 5',3:'M5 9Q15 23 23 20Q30 17 35 6',4:'M5 4 35 20',5:'M18 12h4'};
function bxContour(t,cls=''){return `<svg class="bx-contour ${cls} bx-t${t}" viewBox="0 0 40 24" aria-hidden="true"><path d="${BX_CONTOUR[t]||BX_CONTOUR[5]}"/></svg>`}
const BX_TONE_NAME={1:'1st · high',2:'2nd · rising',3:'3rd · dip',4:'4th · falling'};
const BX_HAN=/\p{Script=Han}/u;
function bxHanChars(s){return [...s].filter(ch=>BX_HAN.test(ch))}

/* ---------- Pools ---------- */
function bxDedupe(list,key=c=>c.character){const seen=new Set();return list.filter(x=>{const k=key(x);if(seen.has(k))return false;seen.add(k);return true})}
function bxCards(min=8){
 if(bx.scope!=='auto'&&currentCourse().lessons.includes(bx.scope))return uniqueCards(bx.scope);
 const introduced=feedEnsureState().entries;
 const studied=uniqueCards().filter(c=>state.cards[c.character]?.seen>0||(introduced[c.character]?.visits||0)>0);
 return studied.length?studied:uniqueCards(currentCourse().lessons[0]).slice(0,min);
}
function bxKnownSet(cards=bxCards()){
 if(bx.scope==='auto')return new Set([...cards.map(c=>c.character),...allUniqueCards().filter(c=>state.cards[c.character]?.seen>0).map(c=>c.character)]);
 const end=courseChapters().findIndex(c=>c[0]===bx.scope);
 return new Set([...courseChapters().slice(0,end+1).flatMap(([id])=>uniqueCards(id).map(c=>c.character)),...allUniqueCards().filter(c=>state.cards[c.character]?.seen>0).map(c=>c.character)]);
}
function bxInScope(s,set=bxKnownSet()){const chars=bxHanChars(s);return chars.length>0&&chars.every(ch=>set.has(ch))}

function bxScopeLabel(){if(bx.scope==='auto'){const n=uniqueCards().filter(c=>state.cards[c.character]?.seen>0).length;return n?`Characters you've studied (${n})`:currentCourse().name+' starter practice'}const ch=CHAPTERS.find(c=>c[0]===bx.scope);return ch?ch[1]:currentCourse().name}
let bxDictCache=null;
function bxDict(){if(bxDictCache)return bxDictCache;const m=new Map();const add=(w,py,meaning)=>{if(w&&bxHanChars(w).length===[...w].length&&!m.has(w))m.set(w,{word:w,pinyin:py,meaning})};Object.values(EXAMPLE_CONTEXT).forEach(e=>add(e.word,e.pinyin,e.meaning));Object.values(WORDS).flat().forEach(w=>add(w[0],w[1],w[2]));CARDS.forEach(c=>{const e=EXAMPLE_CONTEXT[c.word];if(e)add(c.word,e.pinyin,e.meaning)});bxDictCache=m;return m}
function bxWords(cards){const set=bxKnownSet(cards),targets=new Set(cards.map(c=>c.character));return [...bxDict().values()].filter(w=>[...w.word].some(ch=>targets.has(ch))&&[...w.word].length>=2&&bxInScope(w.word,set)&&!/[\/;()]/.test(w.pinyin)&&bxParsePinyin(w.pinyin).valid)}

function bxSegment(zh,py){
 const dict=bxDict(),lex=w=>{const e=dict.get(w);return !!e&&!/\s/.test(e.pinyin)};
 const chars=bxHanChars(zh),words=bxPinyinWords(py,true),counts=words.map(w=>bxSyllableCount(bxClean(w)));let tiles=[];
 if(counts.reduce((a,b)=>a+b,0)===chars.length&&counts.every(n=>n>0)){let i=0;words.forEach((w,j)=>{tiles.push({zh:chars.slice(i,i+counts[j]).join(''),py:w});i+=counts[j]})}
 else{let i=0;while(i<chars.length){let len=Math.min(4,chars.length-i);while(len>1&&!lex(chars.slice(i,i+len).join('')))len--;tiles.push({zh:chars.slice(i,i+len).join(''),py:''});i+=len}}
 // Merge neighbors that form a known word, e.g. 工 + 作 -> 工作.
for(let k=0;k<tiles.length-1;k++){const joined=tiles[k].zh+tiles[k+1].zh;if([...joined].length<=4&&lex(joined)){tiles.splice(k,2,{zh:joined,py:[tiles[k].py,tiles[k+1].py].filter(Boolean).join('')});k--}}
 return tiles
}

/* ---------- Arcade definitions ---------- */
const BX_GAMES={
 tone:{title:'Tone Trainer',glyph:'声',icon:'wave',desc:'Hear a word and pick its tones. Singles first, then pairs.',skill:'Listening · tones'},
 sentence:{title:'Sentence Builder',glyph:'句',icon:'tiles',desc:'Put the word tiles in order to match the English.',skill:'Grammar · word order'},
 match:{title:'Match Sprint',glyph:'配',icon:'lightning',desc:'Pair characters with meanings against the clock.',skill:'Speed recall'},
 typing:{title:'Pinyin Typing',glyph:'拼',icon:'keyboard',desc:'See the character and type its sound, like ni3 hao3.',skill:'Active recall'},
 speak:{title:'Speak & Shadow',glyph:'说',icon:'mic',desc:'Listen and repeat. Check the transcript or rate yourself.',skill:'Speaking'},
 strokes:{title:'Stroke Order',glyph:'笔',icon:'brush',desc:'Watch the stroke order, then trace each stroke yourself.',skill:'Writing'}
};
const BX_SR=window.SpeechRecognition||window.webkitSpeechRecognition;
function bxHasVoice(){try{return typeof mandarinVoices==='function'?mandarinVoices().length>0:speechSynthesis.getVoices().some(v=>/^zh/i.test(v.lang))}catch(e){return false}}
let bxGame=null;
function bxSay(t){if(bxHasVoice())speak(t)}
function bxPick(a,n){return shuffle(a).slice(0,n)}
function bxStart(type){
 const build={tone:bxBuildTone,sentence:bxBuildSentence,match:bxBuildMatch,typing:bxBuildTyping,speak:bxBuildSpeak,strokes:bxBuildStrokes}[type];if(!build)return;
 const items=build();if(!items||items.length<(type==='match'?1:3)){toast('Learn a few more characters to unlock this game, or choose a chapter in Arcade.');return}
 bxStopRecognition();bxStopWriter();bxCombo=0;bxGame={type,items,pos:0,right:0,wrong:0,missed:[],xpStart:bx.xp,startedAt:Date.now(),done:false,feedback:null,bestCombo:0};
 if(currentView==='game'){chrome();bxRenderGame();bxAfterRender();window.scrollTo({top:0,behavior:'instant'})}else navigate('game')
}
function bxBuildTone(){
 const cards=bxCards(10),ear=bxToneEar();
 const singles=cards.filter(c=>bxSyllableCount(bxPinyinWords(c.pinyin)[0]||'')===1&&bxPinyinWords(c.pinyin).length===1).map(c=>({kind:'single',zh:han(c),key:c.character,py:c.pinyin,meaning:c.meaning,tones:bxTones(c.pinyin)})).filter(x=>x.tones.length===1);
 const pairs=bxWords(cards).map(w=>({kind:'pair',zh:text(w.word),key:w.word,py:w.pinyin,meaning:w.meaning,tones:bxTones(w.pinyin)})).filter(x=>x.tones.length===2&&!/[一不]/.test(x.key)&&x.tones.join()!=='3,3'&&bxPinyinWords(x.py).reduce((n,w)=>n+bxSyllableCount(w),0)===2&&[...x.key].length===2);
 const items=[...bxPick(singles,6),...bxPick(pairs,6)];
 for(const it of items){it.ear=ear;if(it.kind==='single')it.choices=[1,2,3,4].map(t=>[t]);else{const key=it.tones.join('');const all=[];for(let a=1;a<=4;a++)for(let b=1;b<=4;b++)if(a+''+b!==key)all.push([a,b]);const near=all.filter(p=>p[0]===it.tones[0]||p[1]===it.tones[1]);it.choices=shuffle([it.tones,...bxPick(near,2),...bxPick(all.filter(p=>!near.includes(p)),1)])}}
 return items
}
function bxToneEar(){return bxHasVoice()&&bx.toneMode!=='memory'}
function bxBuildSentence(){
 const cards=bxCards(10),set=bxKnownSet(cards);
 const entries=bxDedupe(Object.values(selectedCourseId==='chinese-2'?C2_CONTENT.examples:EXAMPLE_CONTEXT).filter(e=>Array.isArray(e.sentence)&&e.sentence[0]&&cards.some(c=>e.sentence[0].includes(c.character))&&bxInScope(e.sentence[0],set)),e=>e.sentence[0]);
 const usable=entries.map(e=>({zh:e.sentence[0],py:e.sentence[1],en:e.sentence[2],tiles:bxSegment(e.sentence[0],e.sentence[1])})).filter(x=>x.tiles.length>=3&&x.tiles.length<=8&&x.en);
 const chosen=bxPick(usable,6);
 for(const it of chosen){const own=new Set(it.tiles.map(t=>t.zh));const extra=bxPick(usable.filter(u=>u!==it).flatMap(u=>u.tiles).filter(t=>!own.has(t.zh)),2);it.bank=shuffle([...it.tiles,...bxDedupe(extra,t=>t.zh)]).map((t,i)=>({...t,id:i}));it.answer=[]}
 return chosen
}
function bxShortMeaning(m){return String(m).split(/[;,(]/)[0].trim().slice(0,26)}
function bxBuildMatch(){
 const side=bx.matchSide,cards=bxDedupe(bxCards(12),c=>side==='pinyin'?c.pinyin:bxShortMeaning(c.meaning)).filter(c=>side==='pinyin'?c.pinyin:bxShortMeaning(c.meaning));
 const unique=bxDedupe(cards,c=>c.character);if(unique.length<6)return null;
 const picked=bxPick(unique,Math.min(12,unique.length-unique.length%6));const boards=[];for(let i=0;i<picked.length;i+=6)boards.push(picked.slice(i,i+6));
 return boards.map(b=>({cards:b,left:shuffle(b.map(c=>c.character)),right:shuffle(b.map(c=>c.character)),cleared:[],sel:null}))
}
function bxBuildTyping(){
 const cards=bxCards(10);const singles=cards.filter(c=>/^[a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+$/i.test(c.pinyin.normalize('NFC'))).map(c=>({zh:han(c),key:c.character,py:c.pinyin,meaning:c.meaning}));
 const words=bxWords(cards).map(w=>({zh:text(w.word),key:w.word,py:w.pinyin,meaning:w.meaning}));
 return shuffle([...bxPick(singles,5),...bxPick(words,5)]).slice(0,10).map(x=>({...x,input:'',tries:0}))
}
function bxBuildSpeak(){
 const cards=bxCards(10);const words=bxWords(cards).map(w=>({zh:text(w.word),key:w.word,py:w.pinyin,meaning:w.meaning}));
 const singles=cards.map(c=>({zh:han(c),key:c.character,py:c.pinyin,meaning:c.meaning}));
 return [...bxPick(words,4),...bxPick(singles,6-Math.min(4,words.length))].map(x=>({...x,heard:'',status:''}))
}
function bxBuildStrokes(){
 const cards=bxCards(8),traced=new Set(Object.keys(state.writing||{}));const fresh=cards.filter(c=>!traced.has(c.character));
 return bxPick(fresh.length>=5?fresh:cards,5).map(c=>({zh:han(c),key:c.character,py:c.pinyin,meaning:c.meaning,mistakes:0,status:''}))
}

/* ---------- Game flow ---------- */
function bxRecordMiss(key){if(cardByChar[key]&&['match','typing'].includes(bxGame?.type))state.quizMisses[key]=Date.now();if(bxGame&&!bxGame.missed.includes(key))bxGame.missed.push(key)}
function bxResult(correct,key,opts={}){
 const g=bxGame,it=g?.items[g.pos];if(!g||g.done||currentView!=='game'||!it||it.resolved||typeof correct!=='boolean')return false;
 it.resolved=true;if(correct)g.right++;else{g.wrong++;bxRecordMiss(key)}
 bxCountActivity();bxAnswer(correct,opts);g.bestCombo=Math.max(g.bestCombo,bxCombo);
 if(correct){const t={tone:'tone',sentence:'sentence',typing:'typing',speak:'speak',strokes:'strokes'}[g.type];if(t)bx.totals[t]++;bxSave();bxCheckAchievements()}
 if(opts.sound!==false)playStudySound(correct?'correct':'retry');
 if(typeof personalityReact==='function')personalityReact(correct?'recall':'retry','arcade-'+g.startedAt+'-'+g.type+'-'+g.pos);
 bxTrainCompanion(key,correct);chrome();return true
}
function bxNext(){
 const g=bxGame;if(!g||g.done||currentView!=='game'||!g.feedback||!g.items[g.pos]?.resolved)return;bxStopRecognition();bxStopWriter();g.feedback=null;g.pos++;
 if(g.pos>=g.items.length)return bxFinish();
 bxRenderGame();bxAfterRender()
}
function bxFinish(){
 const g=bxGame;if(!g||g.done||!g.items.every(it=>g.type==='match'?it.cleared.length===it.cards.length:it.resolved))return;bxStopRecognition();bxStopWriter();g.done=true;const total=g.right+g.wrong,acc=total?Math.round(g.right/total*100):100;
 const day=bxDay();day.games[g.type]=(day.games[g.type]||0)+1;bx.totals.games++;if(g.type==='match')bx.totals.match++;bxSave();
 bxGainXP(10+(acc>=90?15:acc>=70?5:0),{label:'round complete'});
 g.earned=bx.xp-g.xpStart;g.acc=acc;g.seconds=Math.round((Date.now()-g.startedAt)/1000);
 if(g.type==='match'&&g.wrong<=2&&(!bx.best.match||g.seconds<bx.best.match)){g.record=!!bx.best.match;bx.best.match=g.seconds;bxSave()}
 playStudySound('complete');if(acc>=70)bxConfetti(acc>=90?170:90);
 bxRenderGame()
}
function bxQuitGame(){if(bxGame&&!bxGame.done&&(bxGame.pos>0||bxGame.right+bxGame.wrong>0)&&!confirm('Leave this round? Your XP so far is kept.'))return;bxStopRecognition();bxStopWriter();bxGame=null;navigate('arcade')}
function bxMissedCards(g=bxGame){return [...new Set((g?.missed||[]).flatMap(k=>cardByChar[k]?[k]:[...k].length<=4?[...k].filter(ch=>cardByChar[ch]):[]))]}
function bxPracticeMissed(){const chars=bxMissedCards();const list=[...new Set(chars)];if(!list.length)return toast('No missed characters to practice.');startSession('all',null,list);session.mode='missed';checkpointSession?.('cards',session);renderSession()}

function bxGameShell(inner,opts={}){
 const g=bxGame,meta=BX_GAMES[g.type],count=g.type==='match'?g.items.reduce((n,b)=>n+b.cards.length,0):g.items.length,done=g.type==='match'?g.items.slice(0,g.pos).reduce((n,b)=>n+b.cards.length,0)+(g.items[g.pos]?.cleared.length||0):g.pos+(g.feedback?1:0);
 const fb=g.feedback;
 return `<div class="bx-game bx-game-${g.type}"><header class="bx-game-top"><button class="iconbtn" onclick="bxQuitGame()" aria-label="Leave round" title="Leave · Esc">${icon('close')}</button><div class="bx-game-progress" role="progressbar" aria-label="${esc(meta.title)} progress" aria-valuemin="0" aria-valuemax="${count}" aria-valuenow="${done}"><span style="width:${Math.round(done/count*100)}%"></span></div><span class="bx-combo-chip" ${bxCombo<2?'hidden':''} data-level="${bxCombo>=10?'blaze':bxCombo>=5?'hot':''}">${bxCombo>=2?bxCombo+'× combo':''}</span></header><section class="bx-game-card" aria-live="polite">${inner}</section>${fb?`<footer class="bx-feedback ${fb.ok?'is-right':'is-wrong'}" role="status"><div class="bx-feedback-copy"><span class="bx-feedback-icon">${icon(fb.ok?'check':'close')}</span><div><strong>${esc(fb.title)}</strong>${fb.detail?`<p>${fb.detail}</p>`:''}</div></div><button class="btn ${fb.ok?'primary':'danger'} bx-continue" onclick="bxNext()">Continue <kbd>Enter</kbd></button></footer>`:opts.footer?`<footer class="bx-feedback is-idle">${opts.footer}</footer>`:''}</div>`
}
function bxRenderGame(){
 const g=bxGame;if(!g){return bxRenderArcade()}
 if(g.done)return bxRenderSummary();
 const r={tone:bxRenderTone,sentence:bxRenderSentence,match:bxRenderMatch,typing:bxRenderTyping,speak:bxRenderSpeak,strokes:bxRenderStrokes}[g.type];
 $('view').innerHTML=r();bxUpdateComboChip()
}
function bxAfterRender(){
 const g=bxGame;if(!g||g.done||currentView!=='game')return;const it=g.items[g.pos];
 // Audio plays only after an explicit Listen action.
 if(g.type==='typing'&&!g.feedback)setTimeout(()=>{const el=$('bx-type-input');if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length)}},30);
 if(g.type==='strokes'&&!g.feedback)bxMountWriter(it);
 if(g.feedback)setTimeout(()=>document.querySelector('.bx-continue')?.focus({preventScroll:true}),30);
}

/* Tone Trainer */
function bxRenderTone(){
 const g=bxGame,it=g.items[g.pos],answered=!!g.feedback,toneless=bxStripTones(it.py);
 const prompt=it.ear&&!answered?`<button class="bx-listen-big" onclick="speak('${it.key}')" aria-label="Listen to the word">${icon('sound')}<span>Listen <kbd>Space</kbd></span></button><p class="bx-hint">${it.kind==='pair'?'Two syllables. Which tone pair do you hear?':'Which tone do you hear?'}</p>`:`<div class="bx-han" lang="zh">${esc(it.zh)}</div><div class="bx-py">${answered?bxToneColored(it.py):esc(toneless)}</div><p class="bx-meaning">${esc(it.meaning)}</p>${answered||!it.ear?`<button class="btn" onclick="speak('${it.key}')">${icon('sound')} Listen</button>`:''}`;
 const choices=it.choices.map((c,i)=>{const key=c.join('-'),right=key===it.tones.join('-'),chosen=key===it.chosen;return `<button class="bx-tone-choice ${answered?(right?'is-right':chosen?'is-wrong':'is-dim'):''}" ${answered?'disabled':''} onclick="bxToneChoose(${i})"><span class="bx-contours">${c.map(t=>bxContour(t)).join('')}</span><span class="bx-tone-label">${c.length===1?BX_TONE_NAME[c[0]]:c.join(' + ')}</span><kbd>${i+1}</kbd></button>`}).join('');
 return bxGameShell(`<span class="bx-kicker">${it.ear?'Listen':'Recall the tone'} · ${it.kind==='pair'?'Tone pair':'Single tone'}</span>${prompt}<div class="bx-tone-grid ${it.kind}">${choices}</div>`,{footer:it.ear?`<button class="textbtn" onclick="bxSetToneMode('memory')">Can't hear audio? Switch to reading mode</button>`:''})
}
function bxToneChoose(i){
 const g=bxGame,it=g?.items[g.pos];if(!it||g.feedback)return;const c=it.choices[i];if(!c)return;it.chosen=c.join('-');const ok=it.chosen===it.tones.join('-');
 g.feedback={ok,title:ok?['Nice ear!','Exactly right!','Perfect tone!'][g.right%3]:'Not quite',detail:`<span lang="zh">${esc(it.zh)}</span> ${bxToneColored(it.py)} · ${esc(it.meaning)}${ok?'':` — tone${it.tones.length>1?'s':''} ${it.tones.join(' + ')}`}`};
 bxResult(ok,it.key,{sound:!it.ear});bxRenderGame();bxAfterRender()
}
function bxSetToneMode(mode){bx.toneMode=mode;bxSave();if(bxGame?.type==='tone'){for(const it of bxGame.items)it.ear=bxToneEar();bxRenderGame()}if(currentView==='arcade')bxRenderArcade()}

/* Sentence Builder */
function bxRenderSentence(){
 const g=bxGame,it=g.items[g.pos],answered=!!g.feedback,used=new Set(it.answer);
 const tile=(t,where)=>`<button class="bx-tile ${where}" ${answered?'disabled':''} onclick="bxTileTap(${t.id},'${where}')"><span lang="zh">${esc(text(t.zh))}</span>${bx.showPinyin&&t.py?`<small>${esc(t.py)}</small>`:''}</button>`;
 const answerTiles=it.answer.map(id=>it.bank.find(t=>t.id===id));
 return bxGameShell(`<span class="bx-kicker">Build the sentence</span><h2 class="bx-prompt">${esc(it.en)}</h2><div class="bx-sentence-tools"><button class="textbtn" onclick="speak(bxGame.items[bxGame.pos].zh)">${icon('sound')} Hint: hear it</button><button class="textbtn" aria-pressed="${bx.showPinyin}" onclick="bx.showPinyin=!bx.showPinyin;bxSave();bxRenderGame()">${bx.showPinyin?'Hide':'Show'} pinyin</button></div><div class="bx-answer-line ${answered?(g.feedback.ok?'is-right':'is-wrong'):''}" aria-label="Your sentence">${answerTiles.length?answerTiles.map(t=>tile(t,'placed')).join(''):'<span class="bx-placeholder">Tap the words below in order</span>'}</div><div class="bx-bank" aria-label="Word bank">${it.bank.map(t=>used.has(t.id)?`<span class="bx-tile ghost" aria-hidden="true"><span lang="zh">${esc(text(t.zh))}</span>${bx.showPinyin&&t.py?`<small>${esc(t.py)}</small>`:''}</span>`:tile(t,'bank')).join('')}</div>`,{footer:answered?'':`<button class="textbtn" onclick="bxSentenceClear()" ${it.answer.length?'':'disabled'}>Clear</button><button class="btn primary" onclick="bxSentenceCheck()" ${it.answer.length?'':'disabled'}>Check <kbd>Enter</kbd></button>`})
}
function bxTileTap(id,where){const it=bxGame?.items[bxGame.pos];if(!it||bxGame.done||currentView!=='game'||bxGame.feedback||!it.bank.some(t=>t.id===id)||!['bank','placed'].includes(where))return;if(where==='bank'){if(!it.answer.includes(id))it.answer.push(id)}else it.answer=it.answer.filter(x=>x!==id);bxRenderGame()}
function bxSentenceClear(){const it=bxGame?.items[bxGame.pos];if(!it||bxGame.feedback)return;it.answer=[];bxRenderGame()}
function bxSentenceCheck(){
 const g=bxGame,it=g?.items[g.pos];if(!it||g.feedback||!it.answer.length)return;const built=it.answer.map(id=>it.bank.find(t=>t.id===id).zh).join(''),target=bxHanChars(it.zh).join(''),ok=built===target;
 g.feedback={ok,title:ok?'Great sentence!':'Correct answer:',detail:`<span lang="zh">${esc(text(it.zh))}</span><br><small>${esc(it.py)}</small>`};
 bxResult(ok,it.zh,{base:15});bxRenderGame();bxAfterRender()
}

/* Match Sprint */
function bxRenderMatch(){
 const g=bxGame,b=g.items[g.pos],side=bx.matchSide,secs=Math.round((Date.now()-g.startedAt)/1000);
 const label=ch=>{const c=cardByChar[ch];return side==='pinyin'?esc(c.pinyin):esc(bxShortMeaning(c.meaning))};
 const col=(list,which)=>list.map(ch=>{const cleared=b.cleared.includes(ch),sel=b.sel&&b.sel.side===which&&b.sel.ch===ch;return `<button class="bx-match-tile ${which} ${cleared?'is-cleared':''} ${sel?'is-selected':''}" data-ch="${ch}" data-side="${which}" ${cleared?'disabled':''} onclick="bxMatchTap('${which}','${ch}')">${which==='left'?`<span lang="zh">${esc(text(ch))}</span>`:`<span>${label(ch)}</span>`}</button>`}).join('');
 return bxGameShell(`<div class="bx-match-head"><span class="bx-kicker">Board ${g.pos+1} of ${g.items.length} · tap matching pairs</span><span class="bx-timer" id="bx-timer">${icon('clock')} <span>${secs}s</span></span></div><div class="bx-match-grid"><div class="bx-match-col">${col(b.left,'left')}</div><div class="bx-match-col">${col(b.right,'right')}</div></div><div class="bx-match-foot"><button class="textbtn" onclick="bx.matchSide=bx.matchSide==='pinyin'?'meaning':'pinyin';bxSave();bxStart('match')">Match with ${side==='pinyin'?'meanings':'pinyin'} instead</button>${bx.best.match?`<span class="small muted">Best: ${bx.best.match}s</span>`:''}</div>`)
}
function bxMatchTap(sideName,ch){
 const g=bxGame,b=g?.items[g.pos];if(!b||g.done||currentView!=='game'||b.advancing||!['left','right'].includes(sideName)||!b[sideName].includes(ch)||b.cleared.includes(ch))return;
 if(!b.sel||b.sel.side===sideName){b.sel={side:sideName,ch};bxRenderMatchBoard();return}
 const other=b.sel;b.sel=null;
 if(other.ch===ch){b.cleared.push(ch);g.right++;bxCountActivity();bxAnswer(true,{base:5,quiet:true});g.bestCombo=Math.max(g.bestCombo,bxCombo);bxTrainCompanion(ch,true);playStudySound('correct');
  if(b.cleared.length===b.cards.length){b.advancing=true;bxFloat(`Board cleared!`,'hot');setTimeout(()=>{if(bxGame!==g||g.done||currentView!=='game'||g.items[g.pos]!==b)return;g.pos++;if(g.pos>=g.items.length){bxFinish();return}bxRenderGame()},380)}
  bxRenderMatchBoard()}
 else{g.wrong++;bxRecordMiss(other.side==='left'?other.ch:ch);bxCountActivity();bxAnswer(false,{quiet:true});playStudySound('retry');bxRenderMatchBoard();
  document.querySelectorAll(`.bx-match-tile[data-ch="${other.ch}"][data-side="${other.side}"],.bx-match-tile[data-ch="${ch}"][data-side="${sideName}"]`).forEach(el=>{el.classList.add('is-wrong');setTimeout(()=>el.classList.remove('is-wrong'),450)})}
}
function bxRenderMatchBoard(){if(currentView!=='game'||bxGame?.type!=='match'||bxGame.done)return;const scrollY=window.scrollY;bxRenderGame();window.scrollTo({top:scrollY,behavior:'instant'})}
setInterval(()=>{const t=$('bx-timer');if(t&&bxGame?.type==='match'&&!bxGame.done)t.querySelector('span').textContent=Math.round((Date.now()-bxGame.startedAt)/1000)+'s'},1000);

/* Pinyin Typing */
function bxRenderTyping(){
 const g=bxGame,it=g.items[g.pos],answered=!!g.feedback;
 return bxGameShell(`<span class="bx-kicker">Type the pinyin</span><div class="bx-han" lang="zh">${esc(it.zh)}</div><p class="bx-meaning">${esc(it.meaning)}</p><form class="bx-type-form" onsubmit="event.preventDefault();bxTypeCheck()"><input id="bx-type-input" class="input" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Pinyin with tone numbers" placeholder="e.g. ni3 hao3" value="${esc(it.input)}" ${answered?'disabled':''} oninput="bxGame.items[bxGame.pos].input=this.value"><button class="btn primary" ${answered?'disabled':''}>Check</button></form><p class="bx-hint">Use tone numbers 1–4 after each syllable (5 or nothing for neutral). Type <kbd>v</kbd> for ü.</p>${it.warn?`<p class="bx-warn" role="alert">${esc(it.warn)}</p>`:''}`,{footer:answered?'':`<button class="textbtn" onclick="bxTypeSkip()">I don't know</button>`})
}
function bxTypeCheck(){
 const g=bxGame,it=g?.items[g.pos];if(!it||g.feedback)return;const val=($('bx-type-input')?.value||it.input).trim();it.input=val;if(!val){it.warn='Type an answer first.';return bxRenderGame(),bxAfterRender()}
 const a=bxParsePinyin(val),t=bxParsePinyin(it.py);
 if(a.letters===t.letters&&!a.toneInfo&&t.tones.some(n=>n!==5)){it.warn='Almost! Add tone numbers, like ni3 hao3.';bxRenderGame();bxAfterRender();return}
 const ok=a.valid&&t.valid&&a.letters===t.letters&&a.tones.join()===t.tones.join(),toneOnly=a.letters===t.letters&&!ok;it.warn='';
 g.feedback={ok,title:ok?'Correct!':toneOnly?'Right sound, wrong tone':'Not quite',detail:`<span lang="zh">${esc(it.zh)}</span> ${bxToneColored(it.py)}${ok?'':` · you typed “${esc(val)}”`}`};
 bxResult(ok,it.key,{base:12,effort:toneOnly?4:1});bxRenderGame();bxAfterRender()
}
function bxTypeSkip(){const g=bxGame,it=g?.items[g.pos];if(!it||g.feedback)return;g.feedback={ok:false,title:'Here it is:',detail:`<span lang="zh">${esc(it.zh)}</span> ${bxToneColored(it.py)} · ${esc(it.meaning)}`};bxResult(false,it.key);bxRenderGame();bxAfterRender()}

/* Speak & Shadow */
let bxRec=null;
function bxStopRecognition(){const rec=bxRec;bxRec=null;if(rec){rec.onresult=rec.onerror=rec.onend=null;try{rec.abort()}catch(e){}}}
function bxRenderSpeak(){
 const g=bxGame,it=g.items[g.pos],answered=!!g.feedback,listening=it.status==='listening';
 const mic=BX_SR&&!bxGame.noMic;
 return bxGameShell(`<span class="bx-kicker">${mic?'Say it out loud':'Shadowing · listen, then repeat aloud'}</span><div class="bx-han" lang="zh">${esc(it.zh)}</div><div class="bx-py">${bxToneColored(it.py)}</div><p class="bx-meaning">${esc(it.meaning)}</p><p class="bx-hint">Transcript checks do not grade tones. Your browser may process microphone audio online.</p><div class="bx-speak-actions"><button class="btn" onclick="speak('${it.key}')">${icon('sound')} Listen</button>${mic?`<button class="btn primary bx-mic ${listening?'is-live':''}" ${answered?'disabled':''} onclick="bxListen()">${icon('mic')} ${listening?'Listening…':it.heard?'Try again':'Tap and speak'}</button>`:''}</div>${it.heard?`<p class="bx-heard">Heard: <span lang="zh">${esc(it.heard)}</span></p>`:''}${it.warn?`<p class="bx-warn">${esc(it.warn)}</p>`:''}`,{footer:answered?'':`${mic?'<button class="textbtn" onclick="bxStopRecognition();bxGame.noMic=true;bxRenderGame()">Use self-check instead</button>':''}<button class="btn" onclick="bxSpeakSelf(false)">Needs work</button><button class="btn primary" onclick="bxSpeakSelf(true)">I said it well</button>`})
}
function bxListen(){
 const g=bxGame,it=g?.items[g.pos];if(!it||g.done||currentView!=='game'||g.feedback||!BX_SR)return;bxStopRecognition();window.speechSynthesis?.cancel();
 let rec;try{rec=new BX_SR()}catch(e){g.noMic=true;return bxRenderGame()}
 bxRec=rec;rec.lang='zh-CN';rec.interimResults=false;rec.maxAlternatives=5;it.status='listening';it.warn='';bxRenderGame();
 rec.onresult=e=>{if(bxGame!==g||g.done||currentView!=='game'||g.items[g.pos]!==it||bxRec!==rec||g.feedback)return;const alts=[...e.results[0]].map(a=>a.transcript.replace(/[\s，。！？、,.!?]/g,''));it.heard=alts[0]||'';const target=bxHanChars(it.key).join(''),simpleHeard=alts.map(a=>a);
  const ok=simpleHeard.some(a=>a===target||a===bxHanChars(it.zh).join(''));it.status='';
  if(ok){g.feedback={ok:true,title:'Word recognized',detail:`<span lang="zh">${esc(it.zh)}</span> ${bxToneColored(it.py)}`};bxResult(true,it.key,{base:15})}
  else{it.tries=(it.tries||0)+1;if(it.tries>=3){g.feedback={ok:false,title:'Keep practicing this one',detail:`Listen again and copy the tones: ${bxToneColored(it.py)}`};bxResult(false,it.key)}else it.warn='Not quite. Listen once more and try again.'}
  bxRenderGame();bxAfterRender()};
 rec.onerror=e=>{if(bxGame!==g||g.done||currentView!=='game'||g.items[g.pos]!==it||bxRec!==rec||g.feedback)return;it.status='';if(['not-allowed','service-not-allowed','network','audio-capture'].includes(e.error)){g.noMic=true;it.warn=e.error==='network'?'Speech recognition needs an internet connection. Use self-check instead.':'Microphone is unavailable. Use self-check instead.'}else if(e.error==='no-speech')it.warn='No speech heard. Tap and speak again.';bxRenderGame()};
 rec.onend=()=>{if(bxRec===rec&&g.items[g.pos]===it&&it.status==='listening'){it.status='';if(bxGame===g&&currentView==='game')bxRenderGame()}};
 try{rec.start()}catch(e){it.status='';g.noMic=true;bxRenderGame()}
}
function bxOverlap(a,b){const A=[...a],B=[...b];let hit=0;for(const ch of B)if(A.includes(ch))hit++;return hit/B.length}
function bxSpeakSelf(ok){const g=bxGame,it=g?.items[g.pos];if(!it||g.feedback)return;bxStopRecognition();g.feedback={ok,title:ok?'Nice shadowing!':'Marked for more practice',detail:`<span lang="zh">${esc(it.zh)}</span> ${bxToneColored(it.py)}`};bxResult(ok,it.key,{base:6});bxRenderGame();bxAfterRender()}

/* Stroke Order (Hanzi Writer, loaded on demand) */
let bxHWPromise=null,bxWriter=null;
function bxLoadHanziWriter(){if(window.HanziWriter)return Promise.resolve();return bxHWPromise||=new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/hanzi-writer@3.5.0/dist/hanzi-writer.min.js';s.crossOrigin='anonymous';s.onload=()=>res();s.onerror=()=>{bxHWPromise=null;s.remove();rej(new Error('offline'))};document.head.appendChild(s)})}
function bxCharLoader(ch,onLoad,onError){fetch('https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/'+encodeURIComponent(ch)+'.json').then(r=>{if(!r.ok)throw Error('missing');return r.json()}).then(onLoad).catch(onError)}
function bxStopWriter(){try{bxWriter?.cancelQuiz?.()}catch(e){}bxWriter=null}
function bxWriterColors(){const css=getComputedStyle(document.documentElement),v=n=>css.getPropertyValue(n).trim();return {strokeColor:v('--ink')||'#222',radicalColor:v('--green')||'#0d8a5c',outlineColor:v('--line')||'#ddd',drawingColor:v('--green')||'#0d8a5c',highlightColor:v('--accent')||'#d98b16'}}
function bxCreateWriter(el,ch,extra={}){const size=Math.min(280,Math.max(200,el.clientWidth||260));return HanziWriter.create(el,ch,{width:size,height:size,padding:12,showOutline:true,showCharacter:false,strokeAnimationSpeed:1.1,delayBetweenStrokes:220,charDataLoader:bxCharLoader,onLoadCharDataError:()=>{el.innerHTML='<p class="bx-warn">Stroke data for this character isn\'t available.</p>'},...bxWriterColors(),...extra})}
function bxRenderStrokes(){
 const g=bxGame,it=g.items[g.pos],answered=!!g.feedback;
 return bxGameShell(`<span class="bx-kicker">Watch, then trace · ${g.pos+1} of ${g.items.length}</span><div class="bx-py big">${bxToneColored(it.py)}</div><p class="bx-meaning">${esc(it.meaning)}</p><div class="bx-writer-wrap"><div class="bx-writer" id="bx-writer" aria-label="Stroke tracing area for ${esc(it.zh)}"><div class="bx-writer-loading">Loading strokes…</div></div></div><div class="bx-speak-actions"><button class="btn" onclick="bxWriterAnimate()" ${answered?'':''}>${icon('eye')} Watch strokes</button><button class="btn" onclick="speak('${it.key}')">${icon('sound')} Listen</button></div><p class="bx-hint" id="bx-stroke-note">${answered?'':'Trace each stroke in order with your mouse or finger. Three misses shows a hint.'}</p>`,{footer:answered?'':`<button class="textbtn" onclick="bxStrokeSkip()">Skip this character</button>`})
}
function bxMountWriter(it){
 const g=bxGame;bxLoadHanziWriter().then(()=>{if(bxGame!==g||g.items[g.pos]!==it||currentView!=='game')return;const el=$('bx-writer');if(!el)return;el.innerHTML='';bxStopWriter();
  bxWriter=bxCreateWriter(el,it.zh);const w=bxWriter;
  w.animateCharacter({onComplete:()=>{if(bxWriter!==w||g.feedback)return;w.hideCharacter();w.quiz({showHintAfterMisses:3,onMistake:()=>{it.mistakes++},onComplete:summary=>{if(bxGame!==g||g.feedback)return;const m=summary.totalMistakes;const ok=m<=3;g.feedback={ok,title:ok?(m===0?'Flawless strokes!':'Nicely traced!'):'Traced with help',detail:`<span lang="zh">${esc(it.zh)}</span> ${bxToneColored(it.py)} · ${m} miss${m===1?'':'es'}`};if(ok)state.writing[it.key]=(state.writing[it.key]||0)+1;bxResult(ok,it.key,{base:15});bxRenderGame();bxAfterRender();setTimeout(()=>{const el2=$('bx-writer');if(el2&&window.HanziWriter){el2.innerHTML='';const show=bxCreateWriter(el2,it.zh,{showCharacter:true});show.showCharacter()}},40)}})}});
 }).catch(()=>{const el=$('bx-writer');if(el)el.innerHTML='<p class="bx-warn">Stroke animations need an internet connection. Try again online, or practice in Writing.</p>'})
}
function bxWriterAnimate(){const g=bxGame,it=g?.items[g.pos];if(!it)return;if(g.feedback){const el=$('bx-writer');if(el&&window.HanziWriter){el.innerHTML='';const w=bxCreateWriter(el,it.zh,{showCharacter:false});w.animateCharacter()}return}bxMountWriter(it)}
function bxStrokeSkip(){const g=bxGame,it=g?.items[g.pos];if(!it||g.feedback)return;bxStopWriter();g.feedback={ok:false,title:'Skipped for now',detail:`<span lang="zh">${esc(it.zh)}</span> ${bxToneColored(it.py)}`};bxResult(false,it.key);bxRenderGame();bxAfterRender();setTimeout(()=>{const el=$('bx-writer');if(el&&window.HanziWriter){el.innerHTML='';bxCreateWriter(el,it.zh,{showCharacter:false}).animateCharacter()}},60)}

/* Round summary */
function bxRenderSummary(){
 const g=bxGame,meta=BX_GAMES[g.type],missed=g.missed.slice(0,12),missedCards=bxMissedCards(g);
 const grade=g.acc>=90?'Outstanding!':g.acc>=70?'Solid round!':'Good practice!';
 $('view').innerHTML=`<div class="bx-summary"><div class="bx-summary-hero"><div class="bx-summary-glyph" lang="zh" aria-hidden="true">${meta.glyph}</div><span class="eyebrow">${esc(meta.title)} complete</span><h1>${grade}</h1>${g.record?'<p class="bx-record">New personal best!</p>':''}</div><div class="bx-summary-stats"><div class="bx-stat-tile xp"><span>${icon('bolt')}</span><strong>+${g.earned}</strong><small>XP earned</small></div><div class="bx-stat-tile acc"><span>${icon('target')}</span><strong>${g.acc}%</strong><small>Accuracy</small></div><div class="bx-stat-tile combo"><span>${icon('flame')}</span><strong>${g.bestCombo}×</strong><small>Best combo</small></div><div class="bx-stat-tile time"><span>${icon('clock')}</span><strong>${g.seconds>=60?Math.floor(g.seconds/60)+'m '+g.seconds%60+'s':g.seconds+'s'}</strong><small>Time</small></div></div>${missed.length?`<section class="bx-missed"><h2>Worth another look</h2><div class="bx-missed-list">${missed.map((k,i)=>`<button class="bx-missed-chip" onclick="${cardByChar[k]?`openCleanStudy('${k}')`:`speak(bxGame.missed[${i}])`}" lang="zh">${esc(text(k))}</button>`).join('')}</div></section>`:''}<div class="bx-summary-actions"><button class="btn primary" onclick="bxStart('${g.type}')">${icon('replay')} Play again</button>${missedCards.length?`<button class="btn" onclick="bxPracticeMissed()">Practice ${missedCards.length} missed in flashcards</button>`:''}<button class="btn" onclick="bxGame=null;navigate('arcade')">Back to Arcade</button></div>${bxQuestMarkup(true)}</div>`
}

/* ---------- Arcade hub ---------- */
function bxGameCard(type){
 const m=BX_GAMES[type],played=bxDay().games[type]||0,note=type==='speak'&&!BX_SR?'Shadowing mode on this browser':type==='strokes'?'Requires internet for stroke data':type==='tone'?(bxToneEar()?'Listening mode':(bxHasVoice()?'Reading mode':'Reading mode · no Chinese voice found')):'';
 return `<button class="bx-game-tile" data-game="${type}" onclick="bxStart('${type}')"><span class="bx-game-glyph" lang="zh" aria-hidden="true">${m.glyph}</span><span class="bx-game-copy"><span class="bx-game-skill">${icon(m.icon)} ${esc(m.skill)}</span><strong>${esc(m.title)}</strong><small>${esc(m.desc)}</small>${note?`<em>${esc(note)}</em>`:''}</span><span class="bx-game-play">${played?`<span class="bx-played">${icon('check')} ${played}× today</span>`:''}<span class="bx-play-btn">Play ${icon('arrow')}</span></span></button>`
}
function bxRenderArcade(){
 const lv=bxLevelInfo();
 $('view').innerHTML=`<div class="bx-arcade"><div class="heading"><div><span class="eyebrow">Practice games</span><h1>Arcade</h1><p class="muted">Short rounds that train tones, word order, speaking, and writing. Game checks earn practice XP. Character mastery still comes from spaced recall.</p></div><button class="bx-level-chip" onclick="navigate('stats')"><span class="bx-level-badge">${lv.level}</span><span><strong>${bx.xp.toLocaleString()} XP</strong><small>${lv.need-lv.into} to level ${lv.level+1}</small></span></button></div><div class="bx-arcade-controls"><label>Practice from<select class="input" onchange="bx.scope=this.value;bxSave();bxRenderArcade()"><option value="auto" ${bx.scope==='auto'?'selected':''}>${esc(bx.scope==='auto'?bxScopeLabel():'Characters I\'ve studied')}</option>${courseChapters().map(([id,title])=>`<option value="${id}" ${bx.scope===id?'selected':''}>${id==='I'?'Foundations':lessonLabel(id)+' · '+esc(title)}</option>`).join('')}</select></label><label>Tone Trainer<select class="input" onchange="bxSetToneMode(this.value)"><option value="auto" ${bx.toneMode==='auto'?'selected':''}>Automatic</option><option value="ear" ${bx.toneMode==='ear'?'selected':''}>Listen (audio)</option><option value="memory" ${bx.toneMode==='memory'?'selected':''}>Read (no audio)</option></select></label></div><div class="bx-arcade-layout"><div class="bx-game-grid">${Object.keys(BX_GAMES).map(bxGameCard).join('')}</div>${bxQuestMarkup(true)}</div></div>`;
}

/* ---------- Progress page ---------- */
function bxHeatmap(weeks=18){
 const end=new Date();end.setHours(12,0,0,0);const start=new Date(end);start.setDate(start.getDate()-(weeks*7-1)-start.getDay());
 const cells=[];for(const d=new Date(start);d<=end;d.setDate(d.getDate()+1)){const k=dayKey(d),a=state.activity[k],n=a?a.cards+a.readings*5:0,xp=bx.days[k]?.xp||0,frozen=bx.frozen.includes(k);const lvl=n===0?0:n<10?1:n<25?2:n<50?3:4;cells.push(`<span class="bx-heat l${lvl} ${frozen?'is-frozen':''} ${k===dayKey()?'is-today':''}" title="${d.toLocaleDateString(undefined,{month:'short',day:'numeric'})}: ${n?n+' checks':frozen?'streak freeze':'no practice'}${xp?' · '+xp+' XP':''}"></span>`)}
 return `<div class="bx-heatmap" role="img" aria-label="Practice calendar for the last ${weeks} weeks">${cells.join('')}</div><div class="bx-heat-legend"><span>Less</span><span class="bx-heat l0"></span><span class="bx-heat l1"></span><span class="bx-heat l2"></span><span class="bx-heat l3"></span><span class="bx-heat l4"></span><span>More</span><span class="bx-heat is-frozen"></span><span>Freeze</span></div>`
}
function bxWeekBars(){
 const days=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);const k=dayKey(d);return {label:d.toLocaleDateString(undefined,{weekday:'short'}),xp:bx.days[k]?.xp||0,today:i===6}});const max=Math.max(50,...days.map(d=>d.xp));
 return `<div class="bx-bars">${days.map(d=>`<div class="bx-bar-col ${d.today?'is-today':''}"><span class="bx-bar-value">${d.xp||''}</span><span class="bx-bar-fill" style="height:${Math.max(3,Math.round(d.xp/max*100))}%"></span><small>${d.label}</small></div>`).join('')}</div>`
}
function bxRenderStats(){
 const lv=bxLevelInfo(),s=streak(),best=bxLongestStreak(),week=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-i);return bx.days[dayKey(d)]?.xp||0}).reduce((a,b)=>a+b,0);
 const acc=bx.totals.answers?Math.round(bx.totals.correct/bx.totals.answers*100):0,studied=uniqueCards().filter(c=>state.cards[c.character]?.seen>0).length,familiarCount=uniqueCards().filter(c=>familiar(c)).length;
 const unlocked=BX_ACH.filter(a=>bx.ach[a[0]]).length;
 $('view').innerHTML=`<div class="bx-stats"><div class="heading"><div><span class="eyebrow">Your progress</span><h1>Keep the streak alive</h1></div><button class="btn primary" onclick="navigate('arcade')">${icon('game')} Play a game</button></div>
 <div class="bx-stats-top"><section class="bx-card bx-level-card"><div class="bx-level-ring" style="--p:${lv.pct}"><span class="bx-level-badge big">${lv.level}</span></div><div><span class="eyebrow">${esc(bxLevelTitle(lv.level))}</span><h2>Study level ${lv.level}</h2><div class="bx-bar big"><span style="width:${lv.pct}%"></span></div><p class="small muted">${lv.into} / ${lv.need} XP · ${bx.xp.toLocaleString()} total</p></div></section>
 <section class="bx-card bx-streak-card"><div class="bx-flame ${s?'is-lit':''}">${icon('flame')}<strong>${s}</strong></div><div><span class="eyebrow">Day streak</span><h2>${s?s+(s===1?' day':' days'):'Start today'}</h2><p class="small muted">Best: ${best} ${best===1?'day':'days'}</p><div class="bx-freezes" title="Streak freezes protect your streak if you miss a day">${[0,1].map(i=>`<span class="bx-freeze ${i<bx.freezes?'is-on':''}">${icon('snow')}</span>`).join('')}<small>${bx.freezes} of 2 streak freezes · earn one every 7-day streak</small></div></div></section></div>
 <div class="bx-stat-row"><div class="bx-stat-tile xp"><span>${icon('bolt')}</span><strong>${week}</strong><small>XP this week</small></div><div class="bx-stat-tile acc"><span>${icon('target')}</span><strong>${acc}%</strong><small>Accuracy</small></div><div class="bx-stat-tile combo"><span>${icon('flame')}</span><strong>${bx.bestCombo}×</strong><small>Best combo</small></div><div class="bx-stat-tile chars"><span>${icon('learn')}</span><strong>${studied}<small>/${uniqueCards().length}</small></strong><small>Characters met · ${familiarCount} familiar</small></div></div>
 <div class="bx-stats-grid"><section class="bx-card"><div class="bx-card-head"><h2>Practice calendar</h2><span class="small muted">Last 18 weeks</span></div>${bxHeatmap()}</section><section class="bx-card"><div class="bx-card-head"><h2>XP this week</h2><span class="small muted">${bxDay().xp} today</span></div>${bxWeekBars()}</section></div>
 <section class="bx-card"><div class="bx-card-head"><h2>Chapter mastery</h2><span class="small muted">Familiar characters per chapter</span></div><div class="bx-mastery">${courseChapters().map(([id,title,,glyph])=>{const cs=uniqueCards(id),f=cs.filter(c=>familiar(c)).length,seen=cs.filter(c=>state.cards[c.character]?.seen>0).length;return `<button class="bx-mastery-row" onclick="openChapter('${id}')"><span class="bx-mastery-glyph" lang="zh">${esc(text(glyph))}</span><span class="bx-mastery-name">${id==='I'?'Foundations':id+'. '+esc(title)}</span><span class="bx-mastery-bar"><span class="seen" style="width:${Math.round(seen/cs.length*100)}%"></span><span class="fam" style="width:${Math.round(f/cs.length*100)}%"></span></span><span class="bx-mastery-num">${f}/${cs.length}</span></button>`}).join('')}</div></section>
 <section class="bx-card"><div class="bx-card-head"><h2>Achievements</h2><span class="small muted">${unlocked} of ${BX_ACH.length} unlocked</span></div><div class="bx-ach-grid">${BX_ACH.map(([id,glyph,title,desc])=>`<div class="bx-ach ${bx.ach[id]?'is-on':''}" title="${esc(desc)}"><span class="bx-ach-glyph" lang="zh">${glyph}</span><strong>${esc(title)}</strong><small>${esc(desc)}</small></div>`).join('')}</div></section>
 ${bxQuestMarkup(true)}</div>`
}

/* ---------- Navigation integration ---------- */
const BX_VIEWS={arcade:()=>bxRenderArcade(),game:()=>{bxRenderGame();bxAfterRender()},stats:()=>bxRenderStats()};
const bxNavigateBase=navigate;
navigate=function(view,...rest){
 if(!BX_VIEWS[view]){if(currentView==='game'){bxStopRecognition();bxStopWriter()}return bxNavigateBase(view,...rest)}
 if(view==='game'&&!bxGame)view='arcade';
 if(view!==currentView){try{stopReadingAudio()}catch(e){}try{feedStopAudio()}catch(e){}}
 if(currentView==='game'&&view!=='game'){bxStopRecognition();bxStopWriter()}
 try{checkpointCurrent?.()}catch(e){}
 rememberPage(view);currentView=view;$('overlay').innerHTML='';lookupCardHistory=[];document.body.classList.remove('feed-focus');
 chrome();BX_VIEWS[view]();window.scrollTo({top:0,behavior:'instant'});try{flowEnterPage()}catch(e){}
};
const bxRestoreBase=restorePage;
restorePage=function(p){
 if(!BX_VIEWS[p?.view]){bxStopRecognition();bxStopWriter();return bxRestoreBase(p)}
 restoringPage=true;try{currentView=p.view==='game'&&!bxGame?'arcade':p.view;$('overlay').innerHTML='';lookupCardHistory=[];chrome();BX_VIEWS[currentView]();window.scrollTo({top:p.scroll||0,behavior:'instant'})}finally{restoringPage=false}
};
const bxNavActiveBase=mainNavActive;
mainNavActive=function(){return currentView==='game'||currentView==='arcade'?'arcade':currentView==='stats'?'stats':bxNavActiveBase()};
const bxNavMarkupBase=mainNavigationMarkup;
mainNavigationMarkup=function(mobile=false){
 const html=bxNavMarkupBase(mobile);if(mobile)return html;
 const active=mainNavActive(),btn=(id,label,glyph)=>`<button type="button" class="${active===id?'active':''} bx-nav-${id}" ${active===id?'aria-current="page"':''} onclick="navigate('${id}')">${icon(glyph)}<span>${label}</span></button>`;
 const marker='<span>Tools</span></button>',i=html.indexOf(marker),extra=btn('arcade','Arcade','game')+btn('stats','Progress','chart');
 return i>=0?html.slice(0,i+marker.length)+extra+html.slice(i+marker.length):html+extra
};
function bxSyncMobileFlag(){document.body.classList.toggle('bx-mobile',matchMedia('(max-width:900px)').matches)}
const bxChromeBase=chrome;
chrome=function(...args){
 bxSyncMobileFlag();bxChromeBase(...args);
 // The mobile bar uses the same markup builder; on phones, drop Progress there (it lives in the XP pill).
 const mob=$('mobile-nav');if(mob)mob.querySelectorAll('.bx-nav-stats').forEach(el=>el.remove());
 if(BX_VIEWS[currentView]){const crumb=$('crumb');if(crumb)crumb.textContent=currentView==='stats'?'Your progress':currentView==='game'&&bxGame?BX_GAMES[bxGame.type].title:'Arcade';document.body.classList.remove('feed-focus','flow-tools-page');document.body.classList.toggle('bx-game-page',currentView==='game')}else document.body.classList.remove('bx-game-page');
 bxRefreshHud()
};
function bxRefreshHud(){
 const actions=document.querySelector('.top-actions');if(!actions)return;let pill=$('bx-xp-pill');
 if(!pill){pill=document.createElement('button');pill.id='bx-xp-pill';pill.type='button';pill.className='pill bx-xp-pill';pill.onclick=()=>navigate('stats');actions.insertBefore(pill,$('theme-btn'))}
 const lv=bxLevelInfo(),today=state.activity[dayKey()]?.cards||0,goal=state.settings.goal||20,pct=Math.min(100,Math.round(today/goal*100));
 pill.innerHTML=`<span class="bx-goal-ring" style="--p:${pct}" title="Daily goal: ${today}/${goal} checks"><span class="bx-level-badge">${lv.level}</span></span><span class="bx-xp-text">${icon('bolt')}${bx.xp.toLocaleString()}</span>`;
 pill.setAttribute('aria-label',`Study level ${lv.level}, ${bx.xp} practice XP, daily goal ${today} of ${goal}. Open progress`);pill.title='Your progress';
 const sp=$('streak-pill');if(sp){const n=streak();if(!sp.querySelector('.bx-streak-num'))sp.innerHTML=`${icon('flame')}<span class="bx-streak-num">${n}</span><span class="bx-streak-word">&nbsp;${n===1?'day':'days'}</span>`;sp.classList.add('bx-streak-pill');sp.classList.toggle('is-lit',streak()>0);sp.setAttribute('role','button');sp.tabIndex=0;sp.title=`${bx.freezes} streak freeze${bx.freezes===1?'':'s'} ready`;sp.onclick=()=>navigate('stats');sp.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();navigate('stats')}};if(bx.freezes&&!sp.querySelector('.bx-pill-freeze'))sp.insertAdjacentHTML('beforeend',`<span class="bx-pill-freeze" aria-label="${bx.freezes} streak freezes">${icon('snow')}${bx.freezes}</span>`)}
 if(!$('bx-float-host')){const h=document.createElement('div');h.id='bx-float-host';h.setAttribute('aria-live','polite');document.body.appendChild(h)}
}

/* ---------- Home additions ---------- */
const bxHomeBase=renderHome;
renderHome=function(...args){
 bxHomeBase(...args);const view=$('view');if(!view.querySelector('.feed-home'))return;
 view.insertAdjacentHTML('beforeend',`<section class="bx-home-play"><div><h2>Arcade</h2><p class="small muted">Short games with the characters you’re learning.</p></div><button class="btn" onclick="navigate('arcade')">Play a game ${icon('arrow')}</button></section>`);
 if(bxNotice){toast(bxNotice);bxNotice=''}
};
const bxToolsBase=renderTools;
renderTools=function(...args){bxToolsBase(...args);$('view').insertAdjacentHTML('beforeend',`<section class="bx-home-play"><div><h2>Arcade</h2><p class="small muted">Tones, sentences, matching, pinyin, speaking, and strokes.</p></div><button class="btn primary" onclick="navigate('arcade')">Open Arcade ${icon('arrow')}</button><button class="btn" onclick="navigate('stats')">Your progress</button></section>`)};


/* ---------- Strokes tab in study details ---------- */
if(Array.isArray(CLEAN_STUDY_TABS)&&!CLEAN_STUDY_TABS.some(t=>t[0]==='strokes'))CLEAN_STUDY_TABS.push(['strokes','Strokes']);
const bxPaneBase=cleanStudyPane;
cleanStudyPane=function(c,tab){if(tab==='strokes')return `<div class="bx-study-strokes"><div class="bx-writer" id="bx-study-writer" data-ch="${esc(han(c))}"><div class="bx-writer-loading">Loading stroke order…</div></div><div class="row"><button class="btn" onclick="bxStudyAnimate()">${icon('replay')} Replay</button><button class="btn" onclick="bxStudyQuiz()">${icon('brush')} Trace it</button></div><p class="small muted" id="bx-study-note">Strokes play in order. Then try tracing them yourself.</p></div>`;return bxPaneBase(c,tab)};
let bxStudyWriter=null;
function bxMountStudyWriter(){const el=$('bx-study-writer');if(!el||el.dataset.mounted)return;el.dataset.mounted='1';bxLoadHanziWriter().then(()=>{if(!el.isConnected)return;el.innerHTML='';bxStudyWriter=bxCreateWriter(el,el.dataset.ch,{showCharacter:true});bxStudyWriter.animateCharacter()}).catch(()=>{el.innerHTML='<p class="bx-warn">Stroke order needs an internet connection.</p>'})}
function bxStudyAnimate(){try{bxStudyWriter?.cancelQuiz();bxStudyWriter?.animateCharacter()}catch(e){}}
function bxStudyQuiz(){const w=bxStudyWriter;if(!w)return;w.hideCharacter();w.quiz({onComplete:s=>{const n=$('bx-study-note');if(n)n.textContent=s.totalMistakes===0?'Perfect! Every stroke in order.':`Done with ${s.totalMistakes} miss${s.totalMistakes===1?'':'es'}. Replay to compare.`;bx.totals.strokes++;bxSave()}})}
const bxSelectTabBase=selectCleanStudyTab;
selectCleanStudyTab=function(tab,...rest){const r=bxSelectTabBase(tab,...rest);if(tab==='strokes')bxMountStudyWriter();return r};
const bxOpenStudyBase=openCleanStudy;
openCleanStudy=function(...args){const r=bxOpenStudyBase(...args);if(args[1]==='strokes')bxMountStudyWriter();return r};

/* ---------- Keyboard for games ---------- */
window.addEventListener('keydown',e=>{
 if(currentView!=='game'||!bxGame||$('overlay').innerHTML||e.ctrlKey||e.metaKey||e.altKey||e.isComposing)return;
 const g=bxGame,tag=e.target?.tagName,typing=['INPUT','TEXTAREA','SELECT'].includes(tag);let handled=false;
 if(e.key==='Escape'){bxQuitGame();handled=true}
 else if(g.done){if(e.key==='Enter'&&tag!=='BUTTON'){bxStart(g.type);handled=true}}
 else if(g.feedback){if(e.key==='Enter'||(e.key===' '&&!typing&&tag!=='BUTTON')){bxNext();handled=true}}
 else if(!typing){const it=g.items[g.pos];
  if(g.type==='tone'&&/^[1-4]$/.test(e.key)){bxToneChoose(+e.key-1);handled=true}
  else if(g.type==='tone'&&e.key===' '&&tag!=='BUTTON'){speak(it.key);handled=true}
  else if(g.type==='sentence'&&e.key==='Enter'&&tag!=='BUTTON'){bxSentenceCheck();handled=true}
  else if(g.type==='sentence'&&e.key==='Backspace'&&it.answer.length){it.answer.pop();bxRenderGame();handled=true}
 }
 if(handled){e.preventDefault();e.stopImmediatePropagation()}
},true);

/* ---------- Backup, import and reset include Boost data ---------- */
exportBackup=function(){syncCourseState();const blob=new Blob([JSON.stringify({...state,boost:bx},null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='Erics_Chinese_Progress_'+dayKey()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);toast('Progress backup exported')};
(function(){const input=$('backup-file');if(!input)return;const base=input.onchange;input.onchange=async e=>{const f=e.target.files?.[0];let boost=null;try{if(f&&f.size<=2000000)boost=JSON.parse(await f.text()).boost||null}catch(err){}const before=state;await base?.(e);if(state!==before){bxStopRecognition();bxStopWriter();bxGame=null;bxCombo=0;bx=boost?bxValidate(boost):bxDefaults();bx.themeMigrated=true;bxSave();chrome();renderSettings()}}})();
const bxResetBase=resetProgress;
resetProgress=function(...args){const before=state;const r=bxResetBase(...args);if(state!==before){bxStopRecognition();bxStopWriter();bxGame=null;bxCombo=0;const keepTheme=bx.themeMigrated;bx=bxDefaults();bx.themeMigrated=keepTheme;bxSave();chrome()}return r};

// Reviewed integration: only the current, visible exercise may resolve a writer callback.
let bxWriterToken=0,bxStudyToken=0;
const bxStopWriterOriginal=bxStopWriter;
bxStopWriter=function(){bxWriterToken++;try{bxWriter?.pauseAnimation?.()}catch{}bxStopWriterOriginal()};
function bxStopStudyWriter(){bxStudyToken++;try{bxStudyWriter?.cancelQuiz?.();bxStudyWriter?.pauseAnimation?.()}catch{}bxStudyWriter=null}
const bxStrokeCache=new Map();
bxCharLoader=function(ch,onLoad,onError){
 if(bxStrokeCache.has(ch)){onLoad(bxStrokeCache.get(ch));return}
 const controller=typeof AbortController==='function'?new AbortController():null;
 const timer=setTimeout(()=>controller?.abort(),12000);
 fetch('https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/'+encodeURIComponent(ch)+'.json',controller?{signal:controller.signal}:{}).then(r=>{if(!r.ok)throw Error('missing');return r.json()}).then(data=>{clearTimeout(timer);bxStrokeCache.set(ch,data);onLoad(data)},e=>{clearTimeout(timer);onError(e)})
};
bxLoadHanziWriter=function(){
 if(window.HanziWriter)return Promise.resolve();if(bxHWPromise)return bxHWPromise;
 bxHWPromise=new Promise((resolve,reject)=>{const s=document.createElement('script');let settled=false,timer;
 const finish=error=>{if(settled)return;settled=true;clearTimeout(timer);s.onload=s.onerror=null;if(error){s.remove();bxHWPromise=null;reject(error)}else resolve()};
 s.src='https://cdn.jsdelivr.net/npm/hanzi-writer@3.5.0/dist/hanzi-writer.min.js';s.crossOrigin='anonymous';s.onload=()=>finish(window.HanziWriter?null:Error('unavailable'));s.onerror=()=>finish(Error('offline'));timer=setTimeout(()=>finish(Error('timeout')),15000);document.head.appendChild(s)
 });return bxHWPromise;
};
bxCreateWriter=function(el,ch,extra={}){const size=Math.min(280,Math.max(160,el.clientWidth||260));return window.HanziWriter.create(el,ch,{width:size,height:size,padding:12,showOutline:true,showCharacter:false,strokeAnimationSpeed:1.1,delayBetweenStrokes:220,charDataLoader:bxCharLoader,onLoadCharDataError:()=>{if(el.isConnected)el.innerHTML='<p class="bx-warn">Stroke data is unavailable. Try again online or skip this character.</p>'},...bxWriterColors(),...extra})};
bxMountWriter=function(it){
 const g=bxGame;bxStopWriter();const token=bxWriterToken;
 const active=()=>token===bxWriterToken&&bxGame===g&&!g.done&&g.items[g.pos]===it&&currentView==='game'&&!g.feedback;
 bxLoadHanziWriter().then(()=>{if(!active())return;const el=$('bx-writer');if(!el||!el.isConnected)return;el.innerHTML='';
 const w=bxCreateWriter(el,it.zh);bxWriter=w;
 w.animateCharacter({onComplete:()=>{if(!active()||bxWriter!==w)return;w.hideCharacter();w.quiz({showHintAfterMisses:3,onMistake:()=>{if(active())it.mistakes++},onComplete:summary=>{
  if(!active()||bxWriter!==w)return;const m=Number.isFinite(summary.totalMistakes)?summary.totalMistakes:0,ok=m<=3;
  g.feedback={ok,title:ok?(m===0?'Flawless strokes!':'Nicely traced!'):'Traced with help',detail:`<span lang="zh">${esc(it.zh)}</span> ${bxToneColored(it.py)} · ${m} miss${m===1?'':'es'}`};
  if(ok)state.writing[it.key]=(state.writing[it.key]||0)+1;
  bxResult(ok,it.key,{base:15});bxStopWriter();bxRenderGame();bxShowStrokeModel(g,it);
 }})}})
 }).catch(()=>{if(!active())return;const el=$('bx-writer');if(el)el.innerHTML='<p class="bx-warn">Couldn’t load strokes. Connect to the internet, then press Watch strokes to retry. You can also skip.</p>'})
};
function bxShowStrokeModel(g,it,animate=false){
 if(bxGame!==g||g.items[g.pos]!==it||currentView!=='game'||!window.HanziWriter)return;
 const el=$('bx-writer');if(!el||!el.isConnected)return;el.innerHTML='';const w=bxCreateWriter(el,it.zh,{showCharacter:!animate});bxWriter=w;if(animate)w.animateCharacter();
}
bxWriterAnimate=function(){const g=bxGame,it=g?.items[g.pos];if(!it||g.done||currentView!=='game')return;if(g.feedback){bxStopWriter();bxShowStrokeModel(g,it,true)}else bxMountWriter(it)};
bxStrokeSkip=function(){const g=bxGame,it=g?.items[g.pos];if(!it||g.done||currentView!=='game'||g.feedback)return;bxStopWriter();g.feedback={ok:false,title:'Skipped for now',detail:`<span lang="zh">${esc(it.zh)}</span> ${bxToneColored(it.py)}`};bxResult(false,it.key);bxRenderGame();bxShowStrokeModel(g,it)};
bxMountStudyWriter=function(){const el=$('bx-study-writer');if(!el||el.dataset.mounted)return;bxStopStudyWriter();const token=bxStudyToken;el.dataset.mounted='1';bxLoadHanziWriter().then(()=>{if(token!==bxStudyToken||!el.isConnected||cleanStudyTab!=='strokes'||!$('overlay').innerHTML)return;el.innerHTML='';bxStudyWriter=bxCreateWriter(el,el.dataset.ch,{showCharacter:true});bxStudyWriter.animateCharacter()}).catch(()=>{if(token!==bxStudyToken||!el.isConnected)return;el.dataset.mounted='';el.innerHTML='<p class="bx-warn">Couldn’t load strokes. Connect to the internet and reopen this tab to retry.</p>'})};
const bxStudyCompletions=new Set();
bxStudyQuiz=function(){const w=bxStudyWriter;if(!w)return;const token=bxStudyToken,key=dayKey()+':'+cleanStudyTarget;w.hideCharacter();w.quiz({onComplete:summary=>{if(token!==bxStudyToken||w!==bxStudyWriter||cleanStudyTab!=='strokes'||!$('overlay').innerHTML)return;const n=$('bx-study-note');if(n)n.textContent=summary.totalMistakes===0?'Every stroke in order.':`Done with ${summary.totalMistakes} misses. Replay to compare.`;if(!bxStudyCompletions.has(key)){bxStudyCompletions.add(key);bx.totals.strokes++;bxSave();bxCheckAchievements()}}})};
const bxCleanCloseBase=closeModal;
closeModal=function(...args){bxStopStudyWriter();return bxCleanCloseBase(...args)};
const bxCleanSelectBase=selectCleanStudyTab;
selectCleanStudyTab=function(tab,...args){bxStopStudyWriter();return bxCleanSelectBase(tab,...args)};
const bxCleanOpenBase=openCleanStudy;
openCleanStudy=function(...args){bxStopStudyWriter();return bxCleanOpenBase(...args)};
const bxSafeNavigateBase=navigate;
navigate=function(view,...args){if(view!==currentView){bxStopRecognition();bxStopWriter();bxStopStudyWriter()}return bxSafeNavigateBase(view,...args)};
const bxSafeRestoreBase=restorePage;
restorePage=function(p){bxStopRecognition();bxStopWriter();bxStopStudyWriter();if(p?.view==='game'&&p.bxGame)bxGame=p.bxGame;return bxSafeRestoreBase(p)};
const bxPageSnapshotBase=pageSnapshot;
pageSnapshot=function(){return {...bxPageSnapshotBase(),...(currentView==='game'?{bxGame}:{})}};
const bxValidatedStateBase=validateState;
validateState=function(raw){const clean=bxValidatedStateBase(raw);if(Object.hasOwn(PALETTES,raw?.settings?.palette))clean.settings.palette=raw.settings.palette;return clean};
// Undo rolls back learner XP, combo and quests alongside the original card answer.
const bxRememberBase=rememberAnswer;
rememberAnswer=function(...args){bxRememberBase(...args);const u=undoAnswers.at(-1);if(u){u.boost=JSON.parse(JSON.stringify(bx));u.boostCombo=bxCombo}};
const bxUndoBase=undoLastAnswer;
undoLastAnswer=function(){if(!undoAvailable())return;const u=undoAnswers.at(-1),old=undoAnswers.length;bxUndoBase();if(undoAnswers.length<old&&u.boost){bx=bxValidate(u.boost);bxCombo=u.boostCombo||0;bxSave();chrome();bxUpdateComboChip()}};
// An older backup replaces reward totals too; safety copies retain the same reward snapshot.
const bxCaptureSafetyBase=captureSafetyCopy;
captureSafetyCopy=function(...args){const changed=bxCaptureSafetyBase(...args);if(changed)try{const raw=JSON.parse(localStorage.getItem(SAFETY_KEY));raw.boost=JSON.parse(localStorage.getItem(BX_KEY)||'null');localStorage.setItem(SAFETY_KEY,JSON.stringify(raw))}catch{}return changed};
const bxRestoreSafetyBase=restoreSafetyCopy;
restoreSafetyCopy=function(){let raw;try{raw=JSON.parse(localStorage.getItem(SAFETY_KEY)||'null')}catch{}const before=state;bxRestoreSafetyBase();if(state!==before){bxStopRecognition();bxStopWriter();bxGame=null;bxCombo=0;bx=bxValidate(raw?.boost);bx.themeMigrated=true;bxSave();chrome();renderHome()}};
// Preserve keyboard focus in game pages and keep all five primary mobile tabs.
const bxActiveNavBase=mainNavActive;
mainNavActive=function(){if(matchMedia('(max-width:900px)').matches&&['arcade','game','stats'].includes(currentView))return 'tools';return bxActiveNavBase()};
const bxHudOriginal=bxRefreshHud;
bxRefreshHud=function(){bxHudOriginal();const pill=$('bx-xp-pill');if(pill){const stale=pill.querySelector('.bx-mobile-streak');stale?.remove();pill.insertAdjacentHTML('beforeend',`<span class="bx-mobile-streak">${icon('flame')}${streak()}</span>`)}const sp=$('streak-pill');if(sp){const n=sp.querySelector('.bx-streak-num');if(n)n.textContent=streak();const f=sp.querySelector('.bx-pill-freeze');f?.remove();if(bx.freezes)sp.insertAdjacentHTML('beforeend',`<span class="bx-pill-freeze" aria-label="${bx.freezes} streak freezes">${icon('snow')}${bx.freezes}</span>`)}};
const bxResumeRenderBase=bxRenderGame;
bxRenderGame=function(){const g=bxGame;if(g?.type==='match'&&!g.done&&g.items[g.pos]?.cleared.length===g.items[g.pos]?.cards.length){g.pos++;if(g.pos>=g.items.length)return bxFinish()}return bxResumeRenderBase()};
const bxRecognitionStopBase=bxStopRecognition;
bxStopRecognition=function(){const it=bxGame?.items[bxGame.pos];if(it?.status==='listening')it.status='';return bxRecognitionStopBase()};
// Save the completed speaking/tracing totals before rendering achievement counters.
const bxSummaryBase=bxRenderSummary;
bxRenderSummary=function(){bxCheckAchievements();return bxSummaryBase()};
function bxTrainCompanion(key,correct){if(!cleanBuddyEnabled())return;awardXP('arcade:'+bxGame.type+':'+key,correct?2:1);save()}
function bxArcadeBuddy(mood='idle'){if(!cleanBuddyEnabled())return '';return `<button class="bx-arcade-buddy" type="button" aria-label="Game tip from your companion" onclick="bxGameTip()">${cleanBuddyMarkup(mood,false)}</button>`}
function bxGameTip(){if(!bxGame)return;const tips={tone:'Listen once. Try humming the tone before choosing its shape.',sentence:'Find the subject, then the action. Tap a placed tile to move it back.',match:'Compare the whole shape before matching. Speed can wait.',typing:'Say the syllables, then add a tone number to each one. Use v for ü.',speak:'Listen, repeat, then compare. The transcript cannot judge your tones.',strokes:'Watch the shape first, then trace. You can replay the strokes.'};studyModal(`<h2>${esc(BX_GAMES[bxGame.type].title)}</h2><p>${esc(tips[bxGame.type])}</p><button class="btn primary" onclick="closeModal()">Back to practice</button>`)}
const bxBuddyShellBase=bxGameShell;
bxGameShell=function(...args){const h=bxBuddyShellBase(...args),mood=bxGame?.feedback?(bxGame.feedback.ok?'happy':'encourage'):'thinking';return h.replace('</header>',bxArcadeBuddy(mood)+'</header>')};
// Quest selection is persisted, so answering never rebuilds game pools or moves the goalposts.
bxTodayQuests=function(k=dayKey()){
 const h=bxHash(k),day=bxDay(k);let picks=day.questPlan;
 if(!Array.isArray(picks)||picks.length!==3||!picks.every(id=>BX_QUESTS[id])){
  const eligible={tone:()=>bxBuildTone().length>=3,sentence:()=>bxBuildSentence().length>=3,match:()=>!!bxBuildMatch(),typing:()=>bxBuildTyping().length>=3};
  const rest=['correct','combo','tone','sentence','match','typing','reading','goal'].filter(q=>!eligible[q]||eligible[q]());picks=['xp'];let seed=h;
  while(picks.length<3){seed=Math.imul(seed^(seed>>>15),2246822519)>>>0;const q=rest[seed%rest.length];if(!picks.includes(q))picks.push(q)}day.questPlan=[...picks];bxSave();
 }
 return picks.map((id,i)=>{const q=BX_QUESTS[id],target=q.targets[(h>>>(i*3))%q.targets.length],value=Math.min(target,q.metric(day));return {id,icon:q.icon,label:q.label(target),target,value,done:value>=target,claimed:day.quests.includes(id),go:q.go}})
};
const bxSettingsCreditsBase=renderSettings;
renderSettings=function(...args){bxSettingsCreditsBase(...args);$('view').insertAdjacentHTML('beforeend',`<details class="quiet-details bx-credits"><summary>Stroke guide credits</summary><p class="small muted"><a href="https://hanziwriter.org" target="_blank" rel="noopener">Hanzi Writer</a> · <a href="https://github.com/chanind/hanzi-writer/blob/v3.5.0/LICENSE" target="_blank" rel="noopener">MIT license</a>. Stroke data from Make Me a Hanzi / Arphic, via <a href="https://github.com/chanind/hanzi-writer-data" target="_blank" rel="noopener">Hanzi Writer Data</a> · <a href="https://github.com/chanind/hanzi-writer-data/blob/master/ARPHICPL.TXT" target="_blank" rel="noopener">Arphic Public License</a>.</p></details>`)};

/* ---------- Start ---------- */
bxApplyFreezes();bxCheckFreezeMilestone();
try{theme();chrome();if(currentView==='home')renderHome()}catch(e){console.error(e)}
if('speechSynthesis'in window)speechSynthesis.addEventListener?.('voiceschanged',()=>{if(currentView==='arcade')bxRenderArcade()});
matchMedia('(max-width:900px)').addEventListener?.('change',()=>chrome());

