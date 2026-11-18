/* A guided first lesson and finite daily trail. Loaded before legacy validation.
   Practice and rewards use the existing shared character scheduler and lab ledger. */
const TRAIL_VERSION=1;
const TRAIL_INTENTS=[['spoken','I know the sounds','Help me recognize the written shapes.','sound'],['beginner','I’m starting fresh','Build the shape, sound, and meaning together.','learn'],['class','I’m taking a class','Start from the lesson I need.','layers']];
let trailDraft=null,trailOwner=null,trailViewToken=0;
function trailDefaults(){return {version:TRAIL_VERSION,enrolled:false,intent:'beginner',pace:3,setupStep:0,lesson:null,runs:{},days:{},lane:laneDefaults()}}
function trailValidate(raw){
 const out=trailDefaults();if(!raw||raw.version!==TRAIL_VERSION)return out;
 out.lane=laneValidate(raw.lane);out.enrolled=raw.enrolled===true;out.intent=TRAIL_INTENTS.some(x=>x[0]===raw.intent)?raw.intent:'beginner';out.pace=[3,5,8].includes(raw.pace)?raw.pace:3;out.setupStep=Number.isInteger(raw.setupStep)?Math.max(0,Math.min(2,raw.setupStep)):0;
 out.lesson=CHAPTERS.some(x=>x[0]===raw.lesson)?raw.lesson:null;
 for(const course of COURSE_REGISTRY){const r=trailValidateRun(raw.runs?.[course.id],course);if(r)out.runs[course.id]=r}
 for(const [day,value] of Object.entries(raw.days&&typeof raw.days==='object'?raw.days:{}).filter(([d])=>labDate(d)).sort().slice(-90)){
  if(!value||typeof value!=='object')continue;const keys=[...new Set((Array.isArray(value.keys)?value.keys:[]).filter(ch=>CARDS.some(c=>c.character===ch)))].slice(0,150);
  out.days[day]={keys,sessions:labNum(value.sessions,100),checked:labNum(value.checked,1000),unassisted:Math.min(labNum(value.checked,1000),labNum(value.unassisted,1000))};
 }
 return out;
}
function trailValidateRun(raw,course){
 if(!raw||raw.course!==course.id||!course.lessons.includes(raw.lesson)||!/^trail-[a-z0-9-]{1,70}$/.test(raw.id||'')||!Array.isArray(raw.steps)||!raw.steps.length||raw.steps.length>40||!Number.isInteger(raw.pos)||raw.pos<0||raw.pos>raw.steps.length)return null;
 const chars=new Set(CARDS.filter(c=>course.lessons.includes(c.lesson)).map(c=>c.character)),steps=[];
 for(const v of raw.steps){
  if(!v||!chars.has(v.ch)||!['meet','choose','recall'].includes(v.kind))return null;
  const step={ch:v.ch,kind:v.kind,retry:v.retry===true};
  if(v.kind==='choose'){if(!Array.isArray(v.choices)||v.choices.length<2||v.choices.length>3||v.choices.some(ch=>!chars.has(ch))||new Set(v.choices).size!==v.choices.length||!v.choices.includes(v.ch))return null;step.choices=[...v.choices];step.chosen=v.chosen===null||v.chosen===undefined?null:v.choices.includes(v.chosen)?v.chosen:null}
  if(['good','hard','again'].includes(v.rating))step.rating=v.rating;
  step.helped=v.helped===true;step.xp=labNum(v.xp,8);if(['phoenix','dragon','turtle'].includes(v.partner?.id))step.partner={id:v.partner.id,xp:labNum(v.partner.xp,3)};steps.push(step);
 }
 if(steps.slice(0,raw.pos).some(s=>s.kind==='recall'&&!s.rating||s.kind==='choose'&&s.chosen===null))return null;
 const active=steps[raw.pos],feedback=!!active&&(active.kind==='choose'?active.chosen!==null:active.kind==='recall'?!!active.rating:false);
 return {id:raw.id,course:course.id,lesson:raw.lesson,steps,pos:raw.pos,done:raw.pos===steps.length,started:labNum(raw.started,1e15),completed:labNum(raw.completed,1e15),revealed:raw.revealed===true||feedback,helped:raw.helped===true,feedback,celebrated:raw.celebrated===true};
}
function trailData(){return labData().trail??=(trailDefaults())}
function trailRun(){return trailData().runs[selectedCourseId]||null}
function trailStep(){const r=trailRun();return r&&!r.done?r.steps[r.pos]:null}
function trailCard(ch,lesson=trailRun()?.lesson){return courseCard(ch,lesson)||cardByChar[ch]}
function trailBuddy(mood='happy',large=false){return cleanBuddyEnabled()?`<div class="jy-buddy ${large?'is-large':''}">${cleanReactionArt(mood)}</div>`:''}
function trailSetup(first=false){
 checkpointCurrent();trailOwner=state;const d=trailData();trailDraft={first,step:first?d.setupStep:0,intent:d.intent,pace:d.pace,lesson:d.lesson&&courseForLesson(d.lesson)?d.lesson:courseFocusId(),name:state.profile.name,starter:state.companion.starter||'dragon',companion:state.companion.enabled!==false};onboardingStep='trail';trailRenderSetup();
}
function trailRenderSetup(){
 if(!trailDraft||trailOwner!==state)return;const d=trailDraft,token=++trailViewToken,step=d.step,info=TRAIL_INTENTS.find(x=>x[0]===d.intent),course=courseForLesson(d.lesson);
 const art=d.companion?`<div class="jy-setup-art">${companionArt(d.starter||'dragon')}</div>`:'<div class="jy-setup-glyph" lang="zh">学</div>';
 const beginner=d.intent==='beginner';
 const headline=['What brings you here?',beginner?'Your first stop is Chinese 1.':'Where should we start?','Meet your study partner.'][step];
 const body=step===0?`<p class="jy-lead">Recognize the shapes. Read with less effort.</p><div class="jy-options">${TRAIL_INTENTS.map(([id,title,copy,glyph])=>`<button type="button" class="jy-option ${id===d.intent?'is-selected':''}" aria-pressed="${id===d.intent}" onclick="trailSetupPick('intent','${id}',${token})"><span class="jy-option-icon">${icon(glyph)}</span><span><strong>${title}</strong><small>${copy}</small></span><span class="jy-radio" aria-hidden="true"></span></button>`).join('')}</div>`:step===1&&beginner?`<p class="jy-lead">At the market gate, you’ll learn to greet Lin and introduce yourself.</p><ol class="ln-setup-path"><li><b>Meet the characters</b><span>Start with 你 (you), 好 (good), and 我 (I).</span></li><li><b>Read short words</b><span>Put the first two characters together to say hello.</span></li><li><b>Practice the exchange</b><span>Hear both sides before taking your own turn.</span></li></ol>`:step===1?`<p class="jy-lead">${d.intent==='spoken'?'We’ll focus on what Chinese looks like.':d.intent==='class'?'Use your actual class lesson. Nothing gets marked complete.':'We’ll introduce a few shapes, then help you recall them.'}</p><div class="jy-setup-fields"><label for="jy-course">Course<select id="jy-course" class="input" onchange="trailSetupPick('course',this.value,${token})">${COURSE_REGISTRY.map(c=>`<option value="${c.id}" ${course.id===c.id?'selected':''}>${c.name}</option>`).join('')}</select></label><label for="jy-lesson">Starting lesson<select id="jy-lesson" class="input" onchange="trailSetupPick('lesson',this.value,${token})">${CHAPTERS.filter(c=>course.lessons.includes(c[0])).map(c=>`<option value="${c[0]}" ${c[0]===d.lesson?'selected':''}>${esc(lessonLabel(c[0])+' · '+c[1])}</option>`).join('')}</select></label></div><p class="jy-field-title">How much feels easy to start?</p><div class="jy-paces">${[[3,'A small win','3 shapes'],[5,'A little more','5 shapes'],[8,'Time to focus','8 shapes']].map(([n,title,copy])=>`<button type="button" class="jy-option ${n===d.pace?'is-selected':''}" aria-pressed="${n===d.pace}" onclick="trailSetupPick('pace',${n},${token})"><strong>${title}</strong><small>${copy}</small></button>`).join('')}</div><p class="jy-footnote">At most 3 new characters at once. Familiar shapes carry across courses.</p>`:`<p class="jy-lead">${state.companion.starter?'Your collected companions and their XP stay with you.':'Choose a companion to grow alongside you. You can study without one.'}</p><div class="jy-starters">${STARTERS.filter(s=>!state.companion.starter||companionOwned(s.id)).map(s=>`<button type="button" class="jy-starter ${d.companion&&d.starter===s.id?'is-selected':''}" aria-label="${esc(s.name)}" aria-pressed="${d.companion&&d.starter===s.id}" onclick="trailSetupPick('starter','${s.id}',${token})">${companionArt(s.id)}<strong>${esc(s.name)}</strong></button>`).join('')}</div><button type="button" class="textbtn" onclick="trailSetupPick('companion',${!d.companion},${token})">${d.companion?'Study without a companion':'Bring my companion'}</button><label class="jy-name" for="jy-name">What should we call you? <span>Optional</span><input id="jy-name" class="input" maxlength="48" autocomplete="given-name" placeholder="Name or nickname" value="${esc(d.name)}" oninput="trailSetupName(this.value,${token})"></label><p class="jy-footnote">Saved on this device. No account needed.</p>`;
 showCompanionModal(`<div class="jy-onboarding"><div class="jy-onboard-top"><button type="button" class="iconbtn" ${step?'':'disabled'} onclick="trailSetupBack(${token})" aria-label="Previous step">${icon('back')}</button><div class="jy-track" role="progressbar" aria-label="Setup" aria-valuemin="0" aria-valuemax="3" aria-valuenow="${step+1}"><span style="width:${(step+1)/3*100}%"></span></div><span>${step+1}/3</span></div><span class="jy-wordmark">Eric’s Chinese</span>${art}<h1>${headline}</h1>${body}<p id="jy-setup-error" role="alert"></p><div class="jy-setup-actions"><button type="button" class="btn primary full" onclick="trailSetupNext(${token})">${step===2?(d.intent==='beginner'?'Start with characters':'Start my character lesson'):'Continue'} ${icon('arrow')}</button><button type="button" class="textbtn" onclick="trailSetupSkip(${token})">${d.first?'Explore the app first':'Cancel'}</button></div></div>`,true,'Your first lesson');
 laneFocus('.jy-onboarding h1');
}
function trailSetupName(value,token){if(trailDraft&&trailOwner===state&&token===trailViewToken)trailDraft.name=String(value).slice(0,48)}
function trailSetupPick(key,value,token){
 if(!trailDraft||trailOwner!==state||token!==trailViewToken)return false;const d=trailDraft;
 if(key==='intent'&&TRAIL_INTENTS.some(x=>x[0]===value)){d.intent=value;if(value==='beginner')d.lesson='1'}
 else if(key==='pace'&&[3,5,8].includes(Number(value)))d.pace=Number(value);
 else if(key==='course'&&d.intent!=='beginner'&&COURSE_REGISTRY.some(c=>c.id===value))d.lesson=COURSE_REGISTRY.find(c=>c.id===value).lessons.find(l=>l!=='I');
 else if(key==='lesson'&&d.intent!=='beginner'&&courseForLesson(value))d.lesson=value;
 else if(key==='starter'&&STARTERS.some(s=>s.id===value)&&(!state.companion.starter||companionOwned(value))){d.starter=value;d.companion=true}
 else if(key==='companion'&&typeof value==='boolean')d.companion=value;else return false;
 if(d.first){const j=trailData();j.intent=d.intent;j.pace=d.pace;j.lesson=d.lesson;save()}trailRenderSetup();return true;
}
function trailSetupBack(token){if(trailDraft&&trailOwner===state&&token===trailViewToken&&trailDraft.step){trailDraft.step--;if(trailDraft.first){trailData().setupStep=trailDraft.step;save()}trailRenderSetup()}}
function trailSetupNext(token){
 if(!trailDraft||trailOwner!==state||token!==trailViewToken)return false;const d=trailDraft;
 if(d.intent==='beginner')d.lesson='1';
 if(d.step<2){d.step++;if(d.first){trailData().setupStep=d.step;save()}trailRenderSetup();return true}
 const name=d.name?.trim()?safeDisplayName(d.name):{ok:true,name:''};if(!name.ok){$('jy-setup-error').textContent=name.error;return false}
 const j=trailData();j.enrolled=true;j.intent=d.intent;j.pace=d.pace;j.lesson=d.lesson;j.setupStep=0;state.profile={name:name.name,setupDone:true};
 if(d.companion){if(!state.companion.starter){starterPreview=d.starter;chooseStarter('trail')}else if(companionOwned(d.starter)&&state.companion.starter!==d.starter)activateCompanion(d.starter);state.companion.enabled=true}else state.companion.enabled=false;
 const lesson=d.lesson,continueConversation=d.intent==='beginner';trailDraft=null;onboardingStep=null;closeModal();save();ensureLessonCourse(lesson);state.lastChapter=lesson;save();if(continueConversation)return laneStart('gate');return trailBegin(lesson);
}
function trailSetupSkip(token){if(!trailDraft||trailOwner!==state||token!==trailViewToken)return;const first=trailDraft.first;trailDraft=null;onboardingStep=null;if(first){state.profile.setupDone=true;trailData().setupStep=0;save()}closeModal();navigate('home')}
function trailPlan(lesson=courseFocusId()){
 const scope=uniqueCards(lesson),now=Date.now(),size=trailData().pace,studied=scope.filter(c=>state.cards[c.character]?.seen),due=studied.filter(c=>state.cards[c.character].due<=now).sort((a,b)=>state.cards[a.character].due-state.cards[b.character].due),fresh=scope.filter(c=>!state.cards[c.character]?.seen);
 const anchors=lesson==='I'?['人','口','木']:lesson==='1'?['你','好','我']:[];
 fresh.sort((a,b)=>{const rank=c=>anchors.includes(c.character)?anchors.indexOf(c.character):anchors.length;return rank(a)-rank(b)});
 const selected=due.slice(0,size),n=Math.min(3,size-selected.length);selected.push(...fresh.slice(0,n));
 if(!selected.length)selected.push(...studied.sort((a,b)=>state.cards[a.character].last-state.cards[b.character].last).slice(0,size));
 return {cards:selected,fresh:selected.filter(c=>!state.cards[c.character]?.seen),due:selected.filter(c=>state.cards[c.character]?.seen&&state.cards[c.character].due<=now)};
}
function trailBegin(lesson=courseFocusId()){
 if(!courseForLesson(lesson))return false;checkpointCurrent();ensureLessonCourse(lesson);const j=trailData(),existing=trailRun();
 if(existing&&!existing.done){navigate('trail');return true}
 const p=trailPlan(lesson);if(!p.cards.length)return false;j.enrolled=true;j.lesson=lesson;state.lastChapter=lesson;
 const steps=p.fresh.map(c=>({kind:'meet',ch:c.character,retry:false}));
 for(const c of p.fresh){const choices=memoryMatchChoices(c,uniqueCards(lesson)).slice(0,3);if(!choices.includes(c.character))choices[choices.length-1]=c.character;if(choices.length>=2)steps.push({kind:'choose',ch:c.character,choices,chosen:null,retry:false})}
 for(const c of p.cards)steps.push({kind:'recall',ch:c.character,retry:false});
 j.runs[selectedCourseId]={id:'trail-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9),course:selectedCourseId,lesson,steps,pos:0,done:false,started:Date.now(),completed:0,revealed:false,helped:false,feedback:false,celebrated:false};save();navigate('trail');return true;
}
function trailLive(id,pos,token){const r=trailRun();return currentView==='trail'&&trailOwner===state&&token===trailViewToken&&r&&!r.done&&r.id===id&&r.pos===pos?r:null}
function trailArgs(r){return `'${r.id}',${r.pos},${trailViewToken}`}
function trailMarkAssistance(visible){
 const value=String(visible||'');if(!value)return false;let changed=false;
 for(const r of Object.values(state.learningLab?.trail?.runs||{})){const s=r.steps[r.pos];if(!r.done&&s?.kind==='recall'&&!r.feedback&&!r.revealed&&(value.includes(s.ch)||value.includes(text(s.ch)))&&!r.helped){r.helped=true;changed=true}}
 if(changed)save();return changed;
}
function trailListen(id,pos,token){const r=trailLive(id,pos,token);if(!r||r.feedback)return;const s=r.steps[r.pos];if(s.kind==='recall'){r.helped=true;save()}speak(s.ch)}
function trailHint(id,pos,token){const r=trailLive(id,pos,token);if(!r||r.feedback||r.steps[pos].kind!=='recall')return;r.helped=true;r.hintOpen=!r.hintOpen;save();renderTrail()}
function trailReveal(id,pos,token){const r=trailLive(id,pos,token);if(!r||r.feedback||r.steps[pos].kind!=='recall'||r.revealed)return;r.revealed=true;save();renderTrail()}
function trailChoose(ch,id,pos,token){
 const r=trailLive(id,pos,token),s=r?.steps[pos];if(!r||r.feedback||s?.kind!=='choose'||s.chosen!==null||!s.choices.includes(ch))return false;
 s.chosen=ch;s.helped=true;r.feedback=true;r.revealed=true;save();playStudySound(ch===s.ch?'correct':'retry');renderTrail();return true;
}
function trailRate(rating,id,pos,token){
 const r=trailLive(id,pos,token),s=r?.steps[pos];if(!r||!r.revealed||r.feedback||s?.kind!=='recall'||!['again','hard','good'].includes(rating))return false;
 const helped=r.helped||s.retry||rating==='hard';if(rating==='good'&&helped)rating='hard';s.rating=rating;s.helped=helped;r.feedback=true;
 const old=state.cards[s.ch],next=schedule(old||{seen:0,streak:0,interval:0,due:0,last:0,memoryStage:0},rating);
 // A due check within the same day is useful practice, not lasting familiarity.
 if(rating==='good'&&old?.memoryStage===1&&dayKey(new Date(old.last))===dayKey()){next.memoryStage=1;next.interval=10/1440;next.due=Date.now()+600000}
 state.cards[s.ch]=next;
 if(rating!=='good')state.quizMisses[s.ch]=Date.now();else delete state.quizMisses[s.ch];
 const partner=state.companion.starter,beforePet=state.companion.xp;
 s.xp=labRecord('recognition',s.ch,rating==='good',helped,{reward:true,character:s.ch});
 if(partner&&state.companion.starter===partner&&state.companion.xp>beforePet)s.partner={id:partner,xp:state.companion.xp-beforePet};
 const j=trailData(),day=dayKey(),d=j.days[day]??={sessions:0,checked:0,unassisted:0,keys:[]};d.checked++;if(rating==='good'&&!helped){d.unassisted++;if(!d.keys.includes(s.ch))d.keys.push(s.ch)}
 for(const k of Object.keys(j.days).sort().slice(0,-90))delete j.days[k];
 if(rating!=='good'&&!s.retry&&r.steps.length<39)r.steps.push({kind:'recall',ch:s.ch,retry:true});
 activity('cards');const boostDay=bxDay();boostDay.answers++;bx.totals.answers++;if(rating==='good'&&!helped){boostDay.correct++;bx.totals.correct++}bxSave();bxCheckQuests();bxCheckAchievements();
 playStudySound(rating==='good'?(trailCombo(r)===3?'milestone':'correct'):rating==='hard'?'almost':'retry');save();renderTrail();return true;
}
function trailNext(id,pos,token){
 const r=trailLive(id,pos,token),s=r?.steps[pos];if(!r||s.kind!=='meet'&&!r.feedback)return false;
 r.pos++;r.feedback=false;r.revealed=false;r.helped=false;r.hintOpen=false;
 if(r.pos===r.steps.length){r.done=true;r.completed=Date.now();const d=trailData().days[dayKey()];if(d&&r.steps.some(s=>s.rating))d.sessions++;}
 save();renderTrail();return true;
}
function trailCombo(r){let n=0;for(const s of r.steps.slice(0,r.pos+1))if(s.kind==='recall'&&s.rating)n=s.rating==='good'&&!s.helped?n+1:0;return n}
function trailSummary(r){const recalls=r.steps.filter(s=>s.kind==='recall'&&s.rating),first=recalls.filter(s=>!s.retry),right=first.filter(s=>s.rating==='good'&&!s.helped),xp=recalls.reduce((n,s)=>n+(s.xp||0),0);const partners={};for(const step of recalls)if(step.partner)partners[step.partner.id]=(partners[step.partner.id]||0)+step.partner.xp;return {recalls,first,right,xp,partners,misses:[...new Set(first.filter(s=>s.rating!=='good').map(s=>s.ch))],chars:[...new Set(first.map(s=>s.ch))]}}
function trailWeekMarkup(){
 const today=new Date(),offset=(today.getDay()+6)%7,start=new Date(today);start.setDate(today.getDate()-offset);let n=0;
 const cells=Array.from({length:7},(_,i)=>{const date=new Date(start);date.setDate(start.getDate()+i);const day=dayKey(date),a=state.activity[day],done=!!a&&(a.cards+a.readings)>0;if(done)n++;return `<span class="jy-week-day ${done?'is-done':''} ${day===dayKey()?'is-today':''}" aria-label="${esc(date.toLocaleDateString(undefined,{weekday:'long'}))}: ${done?'practiced':day>dayKey()?'upcoming':'no practice recorded'}"><small>${esc(date.toLocaleDateString(undefined,{weekday:'narrow'}))}</small><b>${done?icon('check'):date.getDate()}</b></span>`}).join('');
 return `<div class="jy-week-heading"><strong>${n} practice day${n===1?'':'s'} this week</strong><span>${n>=3?'Three-day target reached':'Aim for 3 days'}</span></div><div class="jy-week">${cells}</div>`;
}
function trailHomeAction(){const j=trailData(),r=trailRun();if(!j.enrolled)return null;if(r&&!r.done)return {eyebrow:'Your small lesson',title:'Finish the shapes you started',copy:`${r.pos} of ${r.steps.length} steps complete. Your place is saved.`,button:'Resume small lesson',action:"navigate('trail')",meta:'Saved learning trail'};return null}
function trailHomeMarkup(){
 const j=trailData(),r=trailRun(),today=dayKey(),done=!!r?.done&&dayKey(new Date(r.completed))===today,p=trailPlan(),active=!!r&&!r.done;
 return `<section class="jy-home" aria-labelledby="jy-home-title"><div class="jy-home-heading"><div><span class="eyebrow">${esc(currentCourse().name+' · '+lessonLabel(courseFocusId()))}</span><h2 id="jy-home-title">${done?'A small lesson, finished.':'Your next small win'}</h2><p>${active?`${r.pos} of ${r.steps.length} steps saved`:done?'Your practice is saved. Return for the next due check.':`${p.fresh.length?p.fresh.length+' new shapes'+(p.due.length?' + '+p.due.length+' due reviews':''):p.cards.length+' familiar shapes'}. A clear finish line.`}</p></div><button type="button" class="textbtn" onclick="trailSetup(false)" aria-label="Personalize my learning trail">${icon('settings')} My route</button></div><div class="jy-path" aria-label="Learning steps"><button type="button" class="jy-node is-current" onclick="trailBegin('${courseFocusId()}')"><span class="jy-node-orb">${icon(done?'check':active?'clock':'learn')}</span><strong>${active?'Resume lesson':done?'Try another set':'Meet · recall'}</strong><small>${active?'Continue here':done?'Optional extra practice':p.cards.length+' shapes'}</small></button><span class="jy-path-link" aria-hidden="true"></span><button type="button" class="jy-node" onclick="openLessonScroll('${courseFocusId()}')"><span class="jy-node-orb">${scrollNavIcon()}</span><strong>Keep exploring</strong><small>Open lesson Scroll</small></button><span class="jy-path-link" aria-hidden="true"></span><button type="button" class="jy-node" onclick="navigate('review')"><span class="jy-node-orb">${icon('review')}</span><strong>Make it stick</strong><small>Spaced reviews</small></button></div><div class="jy-home-week">${trailWeekMarkup()}</div><button type="button" class="textbtn jy-full-chapter" onclick="openChapter('${courseFocusId()}')">Prefer a full chapter? ${icon('arrow')}</button></section>`;
}
function trailFinishMarkup(r){
 const s=trailSummary(r),waiting=s.chars.map(ch=>state.cards[ch]?.due).filter(t=>t>Date.now()),next=waiting.length?Math.min(...waiting):null;
 return `<section class="jy-finish"><div class="jy-finish-art ${cleanBuddyEnabled()?'':'is-quiet'}">${trailBuddy('celebrate',true)}<span class="jy-finish-seal">${icon('check')}</span><i aria-hidden="true"></i><i aria-hidden="true"></i><i aria-hidden="true"></i></div><span class="eyebrow">Small lesson complete</span><h1>${s.right.length===s.first.length?'You read the shapes.':'You found what to revisit.'}</h1>${cleanBuddyEnabled()?`<p class="jy-finish-partner">${esc(starterData().forms[state.companion.stage])} · Level ${companionLevel()}${s.partners[state.companion.starter]?' · +'+s.partners[state.companion.starter]+' training XP':''}</p>`:''}<p>${s.chars.length} characters practiced. ${s.right.length} recalled without help on their first recall check.</p><div class="jy-result-grid"><div><strong>${s.chars.length}</strong><span>Shapes practiced</span></div><div><strong>${s.xp?'+'+s.xp:'Saved'}</strong><span>${s.xp?'Practice XP':'Daily reward limit respected'}</span></div></div><div class="jy-finish-week">${trailWeekMarkup()}</div><p class="jy-next-review">${next?'Next review '+catchupWhen(next)+'. Try again then and on another day.':'Come back on another day for a stronger memory check.'}</p><div class="jy-end-actions"><button type="button" class="btn primary full" onclick="navigate('home')">Save &amp; finish ${icon('check')}</button><button type="button" class="btn full" onclick="openLessonScroll('${r.lesson}')">Continue with lesson Scroll ${icon('arrow')}</button></div><details class="jy-recap"><summary>See these characters again</summary><div>${s.chars.map(ch=>`<button type="button" class="btn" onclick="rxHomeExplore('${ch}')">${esc(text(ch))}</button>`).join('')}</div><p>Same-session practice is a start. Familiarity comes from recall on separate days.</p></details></section>`;
}
function renderTrail(){
 const r=trailRun();trailOwner=state;++trailViewToken;setPracticeViewport(false);
 if(!r){$('view').innerHTML='<section class="jy-empty panel"><h1>Your next small lesson</h1><p>Meet a few shapes, try them from memory, and finish with a clear next step.</p><button type="button" class="btn primary" onclick="trailBegin()">Start a small lesson '+icon('arrow')+'</button></section>';return}
 if(r.done){$('view').innerHTML='<div class="jy-page '+(state.settings.animations&&!r.celebrated?'jy-animate':'')+'">'+trailFinishMarkup(r)+'</div>';if(!r.celebrated){r.celebrated=true;save();playStudySound('complete')}return}
 const s=r.steps[r.pos],c=trailCard(s.ch,r.lesson),args=trailArgs(r),summary=trailSummary(r),revealed=r.revealed||s.kind==='meet',correct=s.kind==='choose'?s.chosen===s.ch:s.rating==='good',label=s.kind==='meet'?'Meet the shape':s.kind==='choose'?'Find the shape':s.retry?'One more look':'Read from memory';
 const buddy=cleanBuddyEnabled(),instruction=s.kind==='meet'?'Notice the shape and its parts.':s.kind==='choose'?`Find “${c.meaning}”.`:'Try reading it before you reveal.';
 const answer=`<div class="jy-answer"><strong>${esc(c.pinyin)}</strong><p>${esc(c.meaning)}</p></div>`;
 const stage=s.kind==='choose'?`<div class="jy-question"><h1>${esc(c.pinyin)}</h1><p>${esc(c.meaning)}</p></div><div class="jy-choice-grid">${s.choices.map((ch,i)=>`<button type="button" class="jy-choice ${r.feedback&&ch===s.ch?'is-correct':r.feedback&&ch===s.chosen?'is-wrong':''}" ${r.feedback?'disabled':''} onclick="trailChoose('${ch}',${args})" aria-label="Choose ${esc(text(ch))}"><span lang="zh">${esc(text(ch))}</span><kbd>${i+1}</kbd></button>`).join('')}</div>`:`<div class="jy-character" lang="zh">${esc(han(c))}</div>${revealed?answer:'<p class="jy-recall-prompt">Can you read this character?</p>'}${s.kind==='meet'?`<div class="jy-memory">${state.settings.visualMemory&&typeof vmPicture==='function'&&vmCue(c.character)?vmPicture(c.character,{compact:true}):memoryIntro(c)}</div><p class="jy-shape-note">${esc(memoryCue(c,true))}</p>`:''}${r.hintOpen&&!r.feedback?`<div class="jy-hint-box">${memoryIntro(c)}<p>${esc(c.pinyin+' · '+c.meaning)}</p><small>This recall check will count as helped.</small></div>`:''}`;
 const feedback=r.feedback?`<div class="jy-feedback ${correct?'is-correct':'is-retry'}" role="status"><span class="jy-feedback-icon">${icon(correct?'check':'review')}</span><div><strong>${s.kind==='choose'?(correct?'That’s the shape.':'Compare the shape.'):(correct?'Recalled without help.':s.retry?'Revisit saved.':'Added a revisit.')}</strong><p>${s.kind==='choose'?esc(han(c)+' · '+c.pinyin+' · '+c.meaning):s.helped?'This was helped practice; it is not independent recall.':s.rating==='again'?'You can try this shape again. Your progress stays saved.':'Return later to strengthen the memory.'}</p>${s.xp?`<span class="jy-xp">+${s.xp} practice XP</span>`:''}${s.kind==='recall'&&correct&&trailCombo(r)>=2?`<span class="jy-combo">${icon('flame')} ${trailCombo(r)} in a row</span>`:''}</div></div>`:'';
 let controls=r.feedback?`<button type="button" class="btn primary full" onclick="trailNext(${args})">${r.pos+1===r.steps.length?'Finish small lesson':'Continue'} ${icon('arrow')}</button>`:s.kind==='meet'?`<button type="button" class="btn primary full" onclick="trailNext(${args})">I’ve seen the shape ${icon('arrow')}</button>`:s.kind==='choose'?'<p class="jy-control-instruction">Choose a character above.</p>':!r.revealed?`<button type="button" class="btn primary full" onclick="trailReveal(${args})">Reveal answer <kbd>Space</kbd></button>`:`<div class="jy-ratings"><button type="button" class="btn danger" onclick="trailRate('again',${args})">Again <kbd>1</kbd></button><button type="button" class="btn" onclick="trailRate('hard',${args})">Almost <kbd>2</kbd></button><button type="button" class="btn primary" onclick="trailRate('good',${args})">Got it <kbd>3</kbd></button></div><p class="jy-rating-help">Got it means you read it before revealing.</p>`;
 $('view').innerHTML=`<div class="jy-page jy-session ${state.settings.animations?'jy-animate':''}"><div class="jy-session-top"><button type="button" class="iconbtn" onclick="navigate('home')" aria-label="Pause and save lesson">${icon('close')}</button><div class="jy-track" role="progressbar" aria-label="Small lesson progress" aria-valuemin="0" aria-valuemax="${r.steps.length}" aria-valuenow="${r.pos}"><span style="width:${r.pos/r.steps.length*100}%"></span></div><span>${r.pos+1}/${r.steps.length}</span></div><div class="jy-stage"><div class="jy-coach">${trailBuddy(r.feedback?(correct?'happy':'encourage'):s.kind==='meet'?'thinking':'idle')}<div><span class="eyebrow">${label}</span><p>${esc(instruction)}</p></div></div><section class="jy-question-card" aria-label="${label}">${stage}</section><div class="jy-study-tools">${s.kind!=='choose'&&!r.feedback?`<button type="button" class="btn" onclick="trailListen(${args})">${icon('sound')} Listen</button>`:''}${s.kind==='recall'&&!r.feedback&&!r.revealed?`<button type="button" class="textbtn" onclick="trailHint(${args})">${r.hintOpen?'Hide hint':'Hint'} <kbd>H</kbd></button>`:''}<span class="jy-step-note">${s.kind==='meet'?'Introduction · no recall credit':s.kind==='choose'?'Shape check · no mastery credit':s.retry?'Helped revisit':summary.right.length?'✓ '+summary.right.length+' recalled without help':''}</span></div></div><footer class="jy-dock">${feedback}${controls}</footer></div>`;
}
function trailKeys(e){
 if(currentView!=='trail')return false;if(e.defaultPrevented||e.repeat||e.isComposing||e.ctrlKey||e.metaKey||e.altKey||['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName)||e.target?.isContentEditable||$('overlay').innerHTML)return true;
 if(e.target?.tagName==='BUTTON'&&[' ','Enter'].includes(e.key))return true;
 const r=trailRun(),s=trailStep();if(!r||!s)return true;const args=[r.id,r.pos,trailViewToken],key=e.key.toLowerCase();let handled=true;
 if(key==='escape')navigate('home');else if([' ','enter','arrowright'].includes(key)){if(r.feedback||s.kind==='meet')trailNext(...args);else if(s.kind==='recall'&&!r.revealed)trailReveal(...args)}else if(['1','2','3'].includes(key)){if(s.kind==='choose'&&!r.feedback){const ch=s.choices[Number(key)-1];if(ch)trailChoose(ch,...args)}else if(s.kind==='recall'&&r.revealed&&!r.feedback)trailRate(['again','hard','good'][Number(key)-1],...args)}else if(key==='h')trailHint(...args);else if(key==='l')trailListen(...args);else handled=false;
 if(handled)e.preventDefault();return true;
}
