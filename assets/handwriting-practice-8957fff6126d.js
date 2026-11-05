/* Drawing and checked writing services. Existing practice renderers call these directly.
 * Stroke checks use the same pinned Hanzi Writer/data as Arcade. No OCR or server upload.
 * Only a live completion can unlock a checked answer; saved drawings never grant credit.
 */
let inkWriter=null,inkGeneration=0;
const inkProofs=new WeakMap();
function inkStop(){inkGeneration++;try{inkWriter?.cancelQuiz();inkWriter?.pauseAnimation?.()}catch{}inkWriter=null}
function inkContext(){
 if(currentView==='labplay'&&labRun&&!labRun.feedback){const q=labCurrent();if(q?.kind==='writing')return {s:labRun,target:q.target,pinyin:q.pinyin,meaning:q.meaning,cards:false,lab:true}}
 if(currentView==='session'&&session?.writeToAnswer&&!session.done){const c=session.queue[session.pos];if(c)return {s:session,target:han(c),pinyin:c.pinyin,meaning:c.meaning,cards:true}}
 if(currentView==='write'&&writeSession?.tool==='draw'&&writeSession.checkedWriting&&!writeSession.done){const w=writeSession.queue[writeSession.pos];if(w)return {s:writeSession,target:text(w.target),pinyin:writeSession.prompt==='pinyin'?w.pinyin:'',meaning:w.meaning,cards:false}}
 return null;
}
function inkState(ctx){const {s,target}=ctx;if(!s.ink||s.ink.pos!==s.pos||s.ink.target!==target||s.ink.part>=[...target].length&&!inkPassed(s))s.ink={pos:s.pos,target,part:0,copies:0,model:false,status:'idle'};return s.ink}
function inkPassed(s){const ctx=inkContext(),p=inkProofs.get(s);return !!(ctx&&ctx.s===s&&p&&p.pos===s.pos&&p.target===ctx.target)}
function startWrittenChapter(id){if(!courseForLesson(id))return;ensureLessonCourse(id);startSession('all',id);session.writeToAnswer=true;session.revealed=false;session.memoryPadOpen=false;renderSession();checkpointCurrent()}
function inkRequireCurrent(){if(!session||session.done||memoryIsStudy()||memoryIsMatch())return;session.writeToAnswer=true;session.usedHint=true;session.revealed=false;session.memoryPadOpen=false;renderSession();checkpointCurrent()}
function startConfiguredWriting(){captureWritingSetup();const setup={...flowWritingSetup};startWriting(setup.id,setup.kind,setup.prompt);if(setup.scope!=='set'){writeSession.queue=shuffle(setup.kind==='words'?(WORDS[setup.id]||[]).map(w=>({target:w[0],pinyin:w[1],meaning:w[2]})):uniqueCards(setup.id).map(c=>({target:c.character,pinyin:c.pinyin,meaning:c.meaning})))}writeSession.checkedWriting=setup.checked!==false;renderWritingSession();checkpointCurrent()}
function inkSetChecked(value){if(!writeSession||writeSession.done)return;if(writeSession.revealed)writeSession.usedHint=true;inkStop();writeSession.revealed=false;writeSession.checkedWriting=value===true;writeSession.ink=null;inkProofs.delete(writeSession);renderWritingSession();checkpointCurrent()}
function inkCopies(value){const ctx=inkContext();if(!ctx||ctx.cards||ctx.lab||![1,3,5].includes(Number(value)))return;ctx.s.inkCopies=Number(value);inkRestart();}
function inkRestart(){const ctx=inkContext();if(!ctx)return;const a=inkState(ctx);if(a.status==='passed'||a.copies||a.part)ctx.s.usedHint=true;inkProofs.delete(ctx.s);a.part=0;a.copies=0;a.status='idle';ctx.s.revealed=false;inkRender();checkpointCurrent()}
function inkModel(){const ctx=inkContext();if(!ctx)return;const a=inkState(ctx);a.model=!a.model;if(a.model)ctx.s.usedHint=true;inkRender();checkpointCurrent()}
function inkSkip(){const ctx=inkContext();if(!ctx)return;inkStop();ctx.s.revealed=true;if(ctx.lab)labResolve(false);else if(ctx.cards)rate('again');else rateWriting(false)}
function inkRender(){const ctx=inkContext();if(ctx?.lab)return renderLabRun();if(ctx?.cards)renderSession();else if(ctx)renderWritingSession()}
function inkStatus(message){const el=$('ink-status');if(el)el.textContent=message}
function inkMarkup(ctx){const a=inkState(ctx),passed=inkPassed(ctx.s),letters=[...ctx.target],count=ctx.cards||ctx.lab?1:(ctx.s.inkCopies||1);return `<div class="ink-practice">
 <div class="ink-progress"><span>${letters.length>1?'Character '+(Math.min(a.part,letters.length-1)+1)+' / '+letters.length:'Write from memory'}</span>${!ctx.cards&&!ctx.lab?`<label>Copies <select aria-label="Copies per answer" onchange="inkCopies(this.value)">${[1,3,5].map(n=>`<option ${count===n?'selected':''}>${n}</option>`).join('')}</select></label>`:''}</div>
 ${a.model?`<div class="ink-model" lang="zh">${esc(ctx.target)}</div>`:''}
 ${passed?`<div class="ink-checked" role="status">${icon('check')} ${esc(ctx.target)}<small>${count} ${count===1?'copy':'copies'} checked${studioHelped(ctx.s)?' · with help':''}</small></div>`:'<div id="ink-writer" class="ink-writer" aria-label="Write the prompted character, in stroke order"></div>'}
 <p id="ink-status" class="small muted" role="status" aria-live="polite">${passed?'Ready to continue.':a.status==='error'?'Stroke checker unavailable. Retry online, or skip this answer.':'Write each stroke in order. Incorrect strokes fade; try that stroke again.'}</p>
 <div class="ink-controls"><button class="btn" onclick="inkRestart()">${passed?'Write again':'Restart'} <kbd>Backspace</kbd></button><button class="btn" aria-pressed="${a.model}" onclick="inkModel()">${a.model?'Hide':'Show'} model</button></div>
 <details class="ink-explanation"><summary>How the check works</summary><p>Checks stroke shape, direction, and order for this character. This is not freehand recognition. A rejected stroke or a model lookup counts as help. ${count>1?'Extra copies are repetition practice and count as helped. ':''}Stroke data needs an internet connection the first time. No handwriting is uploaded.</p></details></div>`}
function renderWrittenCard(){const ctx=inkContext();if(!ctx?.cards)return;const s=ctx.s,passed=inkPassed(s);setPracticeViewport(true);$('view').innerHTML=`<div class="session-wrap focus-session ink-session"><div class="focus-top"><span class="small muted">Write to answer · ${s.pos+1} / ${s.queue.length}</span>${studioSessionTools()}</div><div class="progress"><span style="width:${s.pos/s.queue.length*100}%"></span></div><section class="focus-card ink-card"><div class="writing-prompt"><h1>${esc(ctx.pinyin)}</h1><p>${esc(ctx.meaning)}</p></div>${inkMarkup(ctx)}</section><div class="focus-actions ink-actions">${passed?`<div class="rate-row"><button class="btn danger" onclick="rate('again')">Again <kbd>1</kbd></button><button class="btn" onclick="rate('hard')">Almost <kbd>2</kbd></button><button class="btn primary" onclick="rate('good')">${studioHelped(s)?'With help':'Correct'} <kbd>3</kbd></button></div>`:`<button class="btn" onclick="inkSkip()">Skip · Again <kbd>1</kbd></button><p class="small muted">Complete the writing to unlock Correct.</p>`}</div></div>`;if(!passed)inkMount();checkpointSession('cards',s);cleanSyncHeaderBuddy()}
function renderCheckedWriting(){const ctx=inkContext();if(!ctx||ctx.cards)return;const s=ctx.s,passed=inkPassed(s);setPracticeViewport(true);$('view').innerHTML=`<div class="session-wrap focus-session focus-writing ink-session"><div class="focus-top"><span class="small muted">Checked writing · ${s.pos+1} / ${s.queue.length}</span>${studioSessionTools()}</div><div class="progress"><span style="width:${s.pos/s.queue.length*100}%"></span></div><section class="focus-card ink-card"><div class="writing-prompt">${ctx.pinyin?`<h1>${esc(ctx.pinyin)}</h1>`:''}<p>${esc(ctx.meaning)}</p></div><details class="ink-method-options"><summary>Writing method</summary><div class="ink-controls">${['draw','type','paper'].map(tool=>`<button class="btn" aria-pressed="${tool===s.tool}" onclick="writingTool('${tool}')">${tool[0].toUpperCase()+tool.slice(1)}</button>`).join('')}<button class="btn" onclick="inkSetChecked(false)">Use self-check</button></div></details>${inkMarkup(ctx)}</section><div class="focus-actions ink-actions">${passed?`<div class="rate-row ink-two"><button class="btn danger" onclick="rateWriting(false)">Try again <kbd>1</kbd></button><button class="btn primary" onclick="rateWriting(true)">${studioHelped(s)?'With help':'Correct'} <kbd>3</kbd></button></div>`:'<button class="btn" onclick="inkSkip()">Skip · Try again <kbd>1</kbd></button>'}</div></div>`;if(!passed)inkMount();checkpointSession('write',s)}
function inkMount(){
 const ctx=inkContext(),el=$('ink-writer');if(!ctx||!el||inkPassed(ctx.s))return;inkStop();const token=inkGeneration,{s,target}=ctx,pos=s.pos,a=inkState(ctx),part=a.part,ch=[...target][part];
 const active=()=>{const now=inkContext();return token===inkGeneration&&now?.s===s&&s.pos===pos&&now.target===target&&a===s.ink&&a.part===part&&!inkPassed(s)&&$('ink-writer')===el&&el.isConnected};
 const fail=()=>{if(!active())return;a.status='error';el.innerHTML='<button class="btn" onclick="inkRender()">Retry stroke checker</button>';inkStatus('Could not load strokes. Retry online, or skip. No answer has been credited.')};
 a.status='loading';el.innerHTML='<p class="small muted">Loading stroke checker…</p>';
 bxLoadHanziWriter().then(()=>{if(!active())return;el.innerHTML='';const size=Math.min(280,Math.max(160,el.clientWidth||260));
  const writer=window.HanziWriter.create(el,ch,{width:size,height:size,padding:14,showCharacter:false,showOutline:a.model,highlightOnComplete:false,strokeFadeDuration:120,charDataLoader:bxCharLoader,onLoadCharDataError:fail,...bxWriterColors()});inkWriter=writer;
  const task=writer.quiz({showHintAfterMisses:false,highlightOnComplete:false,acceptBackwardsStrokes:false,leniency:1,
   onMistake:()=>{if(!active())return;s.usedHint=true;a.status='writing';inkStatus('That stroke did not match. Try its shape, direction, or order again. This answer will count as helped.');checkpointCurrent()},
   onCorrectStroke:()=>{if(active()){a.status='writing';inkStatus('Stroke accepted. Keep writing.')}},
   onComplete:summary=>{if(!active())return;if(summary?.totalMistakes>0)s.usedHint=true;inkStop();a.part++;if(a.part<[...target].length){inkRender();checkpointCurrent();return}a.copies++;const count=ctx.cards||ctx.lab?1:(s.inkCopies||1);if(a.copies<count){s.usedHint=true;a.part=0;inkRender();checkpointCurrent();return}a.status='passed';inkProofs.set(s,{pos,target});s.revealed=true;inkRender();checkpointCurrent()}
  });if(task?.catch)task.catch(fail);
 }).catch(fail);
}
function inkValidateSession(d,kind){
 d.writeToAnswer=kind==='cards'&&d.writeToAnswer===true&&!d.memoryCoach;
 d.checkedWriting=kind==='write'&&d.checkedWriting===true;
 d.inkCopies=[1,3,5].includes(d.inkCopies)?d.inkCopies:1;
 // Interrupted checked answers must be written again; persisted success flags are not proof.
 delete d.ink;
 if(d.writeToAnswer||d.checkedWriting&&d.tool==='draw')d.revealed=false;
 const free=d.freeCopies;if(!free||free.pos!==d.pos||typeof free.key!=='string')delete d.freeCopies;
 else d.freeCopies={pos:d.pos,key:free.key,count:Math.min(999,Math.max(0,Math.floor(free.count)||0)),items:(Array.isArray(free.items)?free.items:[]).slice(-3).map(inkSafeStrokes)};
}
function inkScheduleWriting(old,rating){const record=schedule(old,rating),stage=old?.memoryStage||0,now=Date.now();if(old?.memoryStage===undefined&&old?.streak>0&&rating==='good')return record;if(rating==='good'){record.memoryStage=stage===0?1:stage===1&&old.due<=now?2:stage;if(record.memoryStage===1){record.interval=stage===1?old.interval:10/1440;record.due=stage===1?old.due:now+10*60000}else if(stage===1){record.interval=1;record.due=now+86400000}}else{record.memoryStage=0;record.interval=(rating==='again'?10:30)/1440;record.due=now+(rating==='again'?10:30)*60000}return record}
function inkSafeStrokes(strokes){return (Array.isArray(strokes)?strokes:[]).slice(0,100).map(stroke=>(Array.isArray(stroke)?stroke:[]).filter(p=>Array.isArray(p)&&p.length===2&&p.every(n=>Number.isFinite(n)&&n>=0&&n<=1)).filter((_,i,all)=>i%Math.max(1,Math.ceil(all.length/64))===0).slice(0,64).map(p=>p.map(n=>Math.round(n*1000)/1000))).filter(stroke=>stroke.length)}
function inkFreeContext(){if(currentView==='labwrite'&&labPaper)return {s:labPaper,key:labPaper.character,strokes:labPaper.strokes,memory:false,lab:true};if(currentView==='session'&&session?.memoryPadOpen&&!session.done)return {s:session,key:session.queue[session.pos].character,strokes:memoryPadStrokes(),memory:true};if(currentView==='write'&&writeSession?.tool==='draw'&&!writeSession.checkedWriting&&!writeSession.done)return {s:writeSession,key:writeSession.queue[writeSession.pos]?.target,strokes:writeSession.strokes,memory:false};return null}
function inkFreeCopies(ctx){const s=ctx.s;if(!s.freeCopies||s.freeCopies.pos!==s.pos||s.freeCopies.key!==ctx.key)s.freeCopies={pos:s.pos,key:ctx.key,count:0,items:[]};return s.freeCopies}
function inkNextCopy(){const ctx=inkFreeContext();if(!ctx)return;const points=inkSafeStrokes(ctx.strokes);if(!points.length)return;if(ctx.lab)labArchiveDrawing();const a=inkFreeCopies(ctx);a.count=Math.min(999,a.count+1);a.items.push(points);a.items=a.items.slice(-3);ctx.strokes.length=0;if(ctx.lab)renderLabPaper();else if(ctx.memory)renderSession();else renderWritingSession();checkpointCurrent()}
function inkClear(){if(inkContext())return inkRestart();const ctx=inkFreeContext();if(!ctx)return;ctx.strokes.length=0;if(ctx.lab)labPaint();else if(ctx.memory)paintMemoryCanvas();else paintCanvas();checkpointCurrent()}
function inkUndo(){const ctx=inkFreeContext();if(!ctx)return;ctx.strokes.pop();if(ctx.lab)labPaint();else if(ctx.memory)paintMemoryCanvas();else paintCanvas();checkpointCurrent()}
function inkFreeControls(){const ctx=inkFreeContext();if(!ctx)return '';const a=inkFreeCopies(ctx);return `<div class="ink-free-controls"><div class="ink-controls"><button class="btn" onclick="inkNextCopy()">Next copy <kbd>E</kbd></button><button class="textbtn" onclick="inkUndo()">Undo stroke <kbd>Z</kbd></button><button class="textbtn" onclick="inkClear()">Clear <kbd>Backspace</kbd></button></div>${a.count?`<div class="ink-copies" aria-label="Recent copies; self-checked">${a.items.map(strokes=>`<svg viewBox="0 0 100 100" aria-hidden="true">${strokes.map(p=>`<polyline points="${p.map(([x,y])=>(x*100).toFixed(1)+','+(y*100).toFixed(1)).join(' ')}"/>`).join('')}</svg>`).join('')}<span>${a.count} ${a.count===1?'copy':'copies'} · self-checked</span></div>`:''}</div>`}
function inkKeys(e){if(currentView==='labplay')return false;const key=e.key.toLowerCase();if(inkContext()){
 if(key==='backspace'||key==='r'){e.preventDefault();inkRestart();return true}
 if(inkPassed(inkContext().s)&&[' ','enter'].includes(key)&&e.target?.tagName!=='BUTTON'){e.preventDefault();if(inkContext().cards)rate('good');else rateWriting(true);return true}
 if(key==='1'&&!inkPassed(inkContext().s)){e.preventDefault();inkSkip();return true}
 if([' ','enter','3','2','w','r'].includes(key)&&!inkPassed(inkContext().s)){if(e.target?.tagName==='BUTTON'&&[' ','enter'].includes(key))return false;e.preventDefault();inkStatus('Write the character to unlock Correct, or choose Skip.');return true}
 }
 if(inkFreeContext()&&['e','z','backspace'].includes(key)){e.preventDefault();if(key==='e')inkNextCopy();else if(key==='z')inkUndo();else inkClear();return true}return false;
}
function inkBindCanvas(canvas,memory=false){
 const ctx=inkFreeContext();if(!canvas||!ctx||ctx.memory!==memory)return;const {s}=ctx,pos=s.pos,strokes=ctx.strokes,ratio=window.devicePixelRatio||1;
 const bounds=canvas.getBoundingClientRect();canvas.width=Math.max(1,Math.round(bounds.width*ratio));canvas.height=Math.max(1,Math.round(bounds.height*ratio));
 const paint=()=>ctx.lab?labPaint():memory?paintMemoryCanvas():paintCanvas();paint();let pointer=null;
 const live=()=>s.pos===pos&&inkFreeContext()?.s===s&&canvas.isConnected&&$(memory?'memory-canvas':'write-canvas')===canvas;
 const point=e=>{const b=canvas.getBoundingClientRect();return [Math.max(0,Math.min(1,(e.clientX-b.left)/(b.width||1))),Math.max(0,Math.min(1,(e.clientY-b.top)/(b.height||1)))]};
 canvas.onpointerdown=e=>{if(!live()||pointer!==null||e.isPrimary===false||e.button!==undefined&&e.button!==0||strokes.length>=100)return;e.preventDefault();if(ctx.lab)labReplayToken++;pointer=e.pointerId;canvas.setPointerCapture?.(pointer);strokes.push([point(e)]);if(s.revealed)s.usedHint=true;paint()};
 canvas.onpointermove=e=>{if(!live()||e.pointerId!==pointer||pointer===null)return;e.preventDefault();const stroke=strokes.at(-1);for(const p of e.getCoalescedEvents?.()||[e])if(stroke.length<256)stroke.push(point(p));paint()};
 const finish=e=>{if(e.pointerId!==pointer)return;pointer=null;if(live())checkpointCurrent()};canvas.onpointerup=canvas.onpointercancel=canvas.onlostpointercapture=finish;
}
