/* A cross-course plan, using existing canonical knowledge and practice engines.
   Loaded before legacy initialization so the existing lab validator preserves it. */
function catchupLessons(){return COURSE_REGISTRY.flatMap(c=>c.lessons.filter(id=>id!=='I').map(id=>({id,course:c.id,name:lessonLabel(id),number:Number(lessonNumber(id))})))}
function catchupValidate(value){
 if(!value||value.version!==1)return null;
 const lessons=catchupLessons(),from=lessons.findIndex(l=>l.id===value.from),to=lessons.findIndex(l=>l.id===value.to),target=lessons.findIndex(l=>l.id===value.target);
 if(from<0||to<from||target<=to||!/^cu-[a-z0-9-]{1,50}$/.test(value.id||''))return null;
 return {version:1,id:value.id,from:lessons[from].id,to:lessons[to].id,target:lessons[target].id,pace:[5,8,12].includes(value.pace)?value.pace:8,active:value.active!==false,created:labNum(value.created,1e15)};
}
function catchupPlan(){return labData().catchup||null}
function catchupScope(plan=catchupPlan()){
 if(!plan)return [];const lessons=catchupLessons(),a=lessons.findIndex(l=>l.id===plan.from),b=lessons.findIndex(l=>l.id===plan.to),ids=new Set(lessons.slice(a,b+1).map(l=>l.id));
 return CARDS.filter(c=>ids.has(c.lesson)).filter((c,i,a)=>a.findIndex(x=>x.character===c.character)===i);
}
function catchupStatus(plan=catchupPlan(),now=Date.now()){
 const cards=catchupScope(plan),fresh=[],due=[],waiting=[],retained=[];
 for(const c of cards){const p=state.cards[c.character];if(!p?.seen){fresh.push(c);continue}if(p.due<=now)due.push(c);else waiting.push(c);const days=labData().stats['recognition|'+c.character]?.days||[];if(days.length>=2&&familiar(c))retained.push(c)}
 due.sort((a,b)=>(state.cards[a.character].due||0)-(state.cards[b.character].due||0));
 return {cards,fresh,due,waiting,retained,seen:cards.length-fresh.length,nextDue:waiting.length?Math.min(...waiting.map(c=>state.cards[c.character].due)):null};
}
function catchupNext(plan=catchupPlan()){
 if(!plan)return null;const status=catchupStatus(plan),review=status.due.slice(0,plan.pace),allow=review.length>=plan.pace?0:Math.min(plan.pace===5?3:5,plan.pace-review.length),fresh=status.fresh.slice(0,allow);
 return {status,review,fresh,count:review.length+fresh.length};
}
function catchupWhen(at){if(!at)return 'No pending reviews';const minutes=Math.max(1,Math.ceil((at-Date.now())/60000));return minutes<60?'in about '+minutes+' min':minutes<1440?'in about '+Math.ceil(minutes/60)+' hr':'in about '+Math.ceil(minutes/1440)+' day'+(minutes>1440?'s':'')}
function catchupHomeAction(){
 const p=catchupPlan();if(!p?.active)return null;const next=catchupNext(p),waiting=!next.count;
 return {eyebrow:'Your catch-up plan · '+lessonLabel(p.from)+'–'+lessonNumber(p.to),title:waiting?'Keep your new shapes fresh':'Close the gaps before '+lessonLabel(p.target),copy:waiting?'Your next review is '+catchupWhen(next.status.nextDue)+'. Open your plan for the next step.':next.review.length+' due reviews · '+next.fresh.length+' new shapes. A small set chosen from your gaps.',button:waiting?'Open catch-up plan':'Continue catch-up',action:'catchupOpen()',meta:'Shared recognition · both courses'};
}
function catchupOpen(){navigate('catchup')}
function catchupOptions(value){return COURSE_REGISTRY.map(course=>'<optgroup label="'+esc(course.name)+'">'+course.lessons.filter(id=>id!=='I').map(id=>'<option value="'+id+'" '+(id===value?'selected':'')+'>'+esc(lessonLabel(id))+'</option>').join('')+'</optgroup>').join('')}
function catchupSetup(p=catchupPlan()){
 return `<form class="cu-setup" onsubmit="event.preventDefault();catchupBuild(this)"><div class="cu-field"><label for="cu-from">First missed lesson</label><select id="cu-from" name="from">${catchupOptions(p?.from||'2')}</select></div><div class="cu-field"><label for="cu-to">Last missed lesson</label><select id="cu-to" name="to">${catchupOptions(p?.to||'c2-12')}</select></div><div class="cu-field"><label for="cu-target">My class is on</label><select id="cu-target" name="target">${catchupOptions(p?.target||'c2-13')}</select></div><div class="cu-field"><label for="cu-pace">Characters per set</label><select id="cu-pace" name="pace">${[5,8,12].map(n=>`<option value="${n}" ${(p?.pace||8)===n?'selected':''}>${n}${n===8?' · recommended':''}</option>`).join('')}</select></div><p id="cu-error" role="status"></p><button class="btn primary" type="submit">${p?'Update plan':'Build my catch-up plan'} ${icon('arrow')}</button></form>`;
}
function catchupBuild(form){return catchupConfigure(form.elements.from.value,form.elements.to.value,form.elements.target.value,Number(form.elements.pace.value))}
function catchupConfigure(from,to,target,pace=8){
 const next=catchupValidate({version:1,id:'cu-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),from,to,target,pace,active:true,created:Date.now()});
 if(!next){const e=$('cu-error');if(e)e.textContent='Choose a missed range that ends before your current class lesson.';return false}
 labData().catchup=next;save();renderCatchup();return true;
}
function catchupPause(){const p=catchupPlan();if(p){p.active=!p.active;save();renderCatchup()}}
function catchupResume(){const s=savedResume;if(!s?.data?.catchup)return;resumeSession()}
function renderCatchup(){
 setPracticeViewport(false);const p=catchupPlan(),s=p?catchupStatus(p):null,next=p?catchupNext(p):null,paused=!!savedResume&&!savedResume.data?.catchup;
 const heading=`<div class="heading"><div><span class="eyebrow">One plan across both courses</span><h1>Catch up on chapters</h1><p class="muted">Rebuild recognition in small sets, then use it in your coursework.</p></div></div>`;
 const body=!p?`<section class="panel cu-start"><h2>Behind in Lessons 2–12?</h2><p>Choose your gaps and your current class lesson. Familiar characters carry forward; you won’t restart a course.</p>${catchupSetup()}<p class="small muted">This plan trains character recognition. Chapter words, passages, grammar, and writing stay available in Course.</p></section>`:`<section class="panel cu-dashboard"><div class="cu-plan-label"><span>${esc(lessonLabel(p.from))}–${esc(lessonNumber(p.to))}</span><span>Class: ${esc(lessonLabel(p.target))}</span></div><h2>${next.count?'Your next small set':'Let these shapes settle'}</h2><p>${next.count?next.review.length+' due reviews + '+next.fresh.length+' new shapes. Read first, reveal, then rate honestly.':'Your next review is '+catchupWhen(s.nextDue)+'. Return then for a stronger memory check.'}</p><div class="cu-counts"><div><strong>${s.fresh.length}</strong><span>Not started</span></div><div><strong>${s.due.length}</strong><span>Due now</span></div><div><strong>${s.retained.length}</strong><span>Recalled on 2+ days</span></div></div><label class="cu-coverage">Introduced ${s.seen} / ${s.cards.length}<progress value="${s.seen}" max="${s.cards.length||1}"></progress></label><p class="small muted">Introduced is coverage, not mastery. Later recall is counted separately.</p>${paused?'<p class="cu-notice">You have a paused practice set. Resume it below, or start catch-up instead. Your previous answers stay saved.</p>':''}<div class="cu-actions">${savedResume?.data?.catchup?'<button class="btn primary" onclick="catchupResume()">Resume catch-up '+icon('arrow')+'</button>':next.count?`<button class="btn primary" onclick="catchupStart('${p.id}')">${paused?'Start catch-up instead':'Start this set'} ${icon('arrow')}</button>`:`<button class="btn primary" onclick="openChapter('${p.target}')">Open my current lesson ${icon('arrow')}</button>`}${paused?'<button class="btn" onclick="resumeSession()">Resume paused practice</button>':''}<button class="textbtn" onclick="catchupPause()">${p.active?'Pause Home reminder':'Show on Home'}</button></div></section><details class="panel cu-details"><summary>Lesson map &amp; course practice</summary><div class="cu-map">${catchupLessons().filter(l=>s.cards.some(c=>c.lesson===l.id)).map(l=>{const rows=s.cards.filter(c=>c.lesson===l.id),seen=rows.filter(c=>state.cards[c.character]?.seen).length;return `<button onclick="openChapter('${l.id}')"><span>${esc(l.name)}<small>${l.course==='chinese-1'?'Chinese 1':'Chinese 2'}</small></span><span>${seen}/${rows.length} introduced ${icon('chevron')}</span></button>`}).join('')}</div><p class="small muted">Open a lesson for its words, readings, usage explanations, full chapter practice, and writing. Catch-up sets do not pass chapter quizzes or earn course badges.</p></details><details class="panel cu-details"><summary>Change missed chapters or pace</summary>${catchupSetup(p)}</details>`;
 $('view').innerHTML=`<div class="cu-page">${heading}${body}<details class="panel cu-details"><summary>How to make a cram session stick</summary><ol><li>Meet 3–5 new shapes with their parts and your own memory notes.</li><li>Read the plain character before revealing. Again means you couldn’t read it; Almost means hesitation or help.</li><li>Misses return after other cards. Scheduled checks return later; repeat loops do not prove retention.</li><li>Come back for the next due set and again tomorrow. Then read a passage and practice the words from that lesson.</li></ol><p>There is no one-session shortcut to remembering every chapter. This plan reduces unnecessary repetition while keeping later recall checks.</p></details></div>`;
}
function catchupStart(id){
 const p=catchupPlan();if(!p||p.id!==id||!['catchup','home','session'].includes(currentView)||currentView==='session'&&session&&!session.done)return false;
 const n=catchupNext(p);if(!n.count){catchupOpen();return false}
 const chars=[...n.fresh,...n.review].map(c=>c.character);startSession('all',null,chars);if(!session)return false;
 if(n.fresh.length){const fresh=n.fresh,review=n.review,pool=catchupScope(p),matches=fresh.map(c=>({ch:c.character,phase:'choose',choices:memoryMatchChoices(c,pool),chosen:null})).filter(step=>step.choices.length>=2),steps=[...fresh.map(c=>({ch:c.character,phase:'study'})),...review.map(c=>({ch:c.character,phase:'recall'})),...matches,...fresh.map(c=>({ch:c.character,phase:'recall'}))];session.mode='learn';session.memoryCoach={version:1,newCharacters:fresh.map(c=>c.character),steps};session.queue=steps.map(step=>cardByChar[step.ch]);session.batch=chars;session.revealed=true;session.memorySketches={};session.right=0}
 session.catchup={version:1,plan:id};renderSession();checkpointCurrent();return true;
}
function catchupValidateSession(d,kind){
 const tag=d.catchup;if(!tag)return;if(kind!=='cards'||tag.version!==1||!/^cu-[a-z0-9-]{1,50}$/.test(tag.plan||'')){delete d.catchup;return}d.catchup={version:1,plan:tag.plan};
}
function catchupCompletion(s){
 if(!s?.catchup||s.catchup.version!==1)return false;setPracticeViewport(false);const p=catchupPlan(),valid=p?.id===s.catchup.plan,next=valid?catchupNext(p):null,needs=practiceRetryTargets(s).length;
 $('view').innerHTML=`<div class="session-wrap cu-page"><section class="panel completion clean-completion"><span class="eyebrow">Catch-up set finished</span><h1>${needs?'You found the shapes to revisit':'A smaller gap than before'}</h1><p>${s.right} unassisted recall answers · ${s.attempts} attempts</p><p class="muted">${next?.count?next.review.length+' due reviews and '+next.fresh.length+' new shapes are ready for the next set.':valid?'Your next review is '+catchupWhen(next.status.nextDue)+'. Come back then and again tomorrow.':'Your character progress is saved. Open your plan to continue.'}</p><div class="cu-actions">${next?.count?`<button class="btn primary" onclick="catchupStart('${p.id}')">Next small set ${icon('arrow')}</button>`:'<button class="btn primary" onclick="catchupOpen()">Back to my plan '+icon('arrow')+'</button>'}${next?.count?'<button class="btn" onclick="catchupOpen()">Done for now</button>':''}<button class="textbtn" onclick="navigate('home')">Home</button></div><p class="small muted">Today’s practice is saved. Same-session success is not proof of lasting memory.</p>${undoMarkup()}</section></div>`;return true;
}
