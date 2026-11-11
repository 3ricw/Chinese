/* Personal notes keep the established character keys. Word notes are an
   optional commonWords extension. Neither notes nor wrist packs award XP. */
let personalNoteSerial=0,personalNoteEditors=new Map(),personalNotebookTurn=0,personalNotebookQuery='',personalNotebookLimit=30,personalNotebookState=null;
function personalNoteTarget(kind,id){return kind==='character'&&Object.hasOwn(cardByChar,id)?cardByChar[id]:kind==='word'&&Object.hasOwn(CW_BY_ID,id)?CW_BY_ID[id]:null}
function personalNoteValue(kind,id){return personalNoteTarget(kind,id)?(kind==='character'?state.memoryNotes[id]:cwDesk().notes?.[id])||'':''}
function personalNoteMarkup(kind,id){
 if(!personalNoteTarget(kind,id))return '';
 const token=++personalNoteSerial,note=personalNoteValue(kind,id),max=kind==='character'?300:600;
 personalNoteEditors.set(token,{kind,id,state});if(personalNoteEditors.size>24)personalNoteEditors.delete(personalNoteEditors.keys().next().value);
 personalMarkAssistance((kind==='character'?text(id):cwText(CW_BY_ID[id]))+' '+note);
 return `<section class="personal-note" data-note-token="${token}"><div class="personal-note-heading"><label for="personal-note-${token}">${icon('note')} Your memory note</label><button type="button" class="textbtn" onclick="personalOpenNotebook()">All notes</button></div><textarea id="personal-note-${token}" rows="3" maxlength="${max}" placeholder="A shape, sound, or connection that helps you remember…" oninput="personalNoteInput(${token},this)" aria-describedby="personal-note-status-${token}">${esc(note)}</textarea><p class="small muted" id="personal-note-status-${token}" role="status">${note?'Saved on this device.':'Write your own memory cue.'} Included in progress backups.</p></section>`;
}
function personalSaveNote(kind,id,value){
 if(!personalNoteTarget(kind,id)||typeof value!=='string')return false;
 const note=value.slice(0,kind==='character'?300:600).trim(),notes=kind==='character'?state.memoryNotes:(cwDesk().notes??={});
 if(note)notes[id]=note;else delete notes[id];
 if(kind==='word'&&!Object.keys(notes).length)delete cwDesk().notes;
 save();return storageOK;
}
function personalNoteInput(token,editor){
 const context=personalNoteEditors.get(token);
 if(!context||context.state!==state||!editor?.isConnected||editor.id!=='personal-note-'+token)return;
 const ok=personalSaveNote(context.kind,context.id,editor.value),status=$('personal-note-status-'+token);
 if(status)status.textContent=ok?'Saved on this device · included in progress backups.':'Not saved to this browser. Export a backup before leaving.';
}
function personalMarkAssistance(visible){
 // Notes can be opened while a card is paused in Tools. Preserve that help in
 // both runtime and persisted sessions, including the other course's resume.
 if(typeof vmMarkHelp==='function')vmMarkHelp();
 const value=String(visible||'');if(!value)return;
 cwExposeText(value);
 const covered=target=>{const ch=typeof target==='string'?target:target?.character||target?.target;return !!ch&&(value.includes(ch)||value.includes(text(ch)))};
 const mark=(kind,data)=>{if(!data||data.done||data.revealed)return false;
  if(kind==='cards'&&covered(data.queue?.[data.pos])){data.usedHint=true;return true}
  if(kind==='write'&&covered(data.queue?.[data.pos])){data.usedHint=true;return true}
  if(kind==='quiz'||kind==='league'){const q=data.questions?.[data.pos];if(q&&(q.chosen===null||q.choice===null)&&covered(q.card)){q.usedHint=true;return true}}
  return false;
 };
 mark('cards',session);mark('write',writeSession);mark('quiz',quizSession);
 for(const record of Object.values(state.courses.records)){
  const resume=record.resume;if(resume)mark(resume.kind,resume.data);
  for(const f of record.scrollSession?.frames||[])if(f.cold&&f.chosen===null&&covered(f.ch))f.helped=true;
  if(record.feed)for(const ch of Object.keys(cardByChar))if(covered(ch))feedEntry(record.feed,ch).helpAt=Date.now();
 }
 for(const f of state.scrollSession?.frames||[])if(f.cold&&f.chosen===null&&covered(f.ch))f.helped=true;
 if(state.feed)for(const ch of Object.keys(cardByChar))if(covered(ch))feedEntry(state.feed,ch).helpAt=Date.now();
 if(savedResume){mark(savedResume.kind,savedResume.data);try{localStorage.setItem(RESUME_KEY,JSON.stringify(savedResume))}catch{resumeSavingFailed=true}}
 save();
}
function personalNoteEntries(){
 const entries=[];
 for(const [id,note]of Object.entries(state.memoryNotes||{})){const c=personalNoteTarget('character',id);if(c&&note)entries.push({kind:'character',id,note,form:han(c),p:c.pinyin,en:c.meaning})}
 for(const [id,note]of Object.entries(cwDesk().notes||{})){const w=personalNoteTarget('word',id);if(w&&note)entries.push({kind:'word',id,note,form:cwText(w),p:w.p,en:w.en})}
 return entries;
}
function personalNotebookMarkup(){
 const query=cwNorm(personalNotebookQuery),entries=personalNoteEntries().filter(e=>!query||cwNorm(e.id+' '+e.form+' '+e.p+' '+e.en+' '+e.note).includes(query)),shown=entries.slice(0,personalNotebookLimit),turn=++personalNotebookTurn;
 personalMarkAssistance(shown.map(e=>e.form+' '+e.note).join('\n'));
 return `<div class="personal-note-results" data-notebook-turn="${turn}"><p class="small muted" role="status">${entries.length} ${entries.length===1?'note':'notes'} · shared across courses</p>${shown.length?`<div class="personal-notebook-list">${shown.map(e=>`<button type="button" class="personal-notebook-entry" onclick="personalOpenEntry('${e.kind}','${e.id}',${turn})"><span class="personal-notebook-form" lang="zh">${esc(e.form)}</span><span><strong>${esc(e.p)} · ${esc(e.en)}</strong><span>${esc(e.note)}</span><small>${e.kind==='word'?'Word':'Character'} note</small></span>${icon('chevron')}</button>`).join('')}</div>${shown.length<entries.length?`<button type="button" class="btn full" onclick="personalNotebookMore(${turn})">Show 30 more notes</button>`:''}`:`<div class="cw-empty"><h3>${query?'No matching notes':'Make a word stick'}</h3><p>${query?'Try a character, pinyin, meaning, or a phrase from your note.':'Open any character or common word and write under “Your memory note.”'}</p><button type="button" class="btn" onclick="closeModal();navigate('common')">Open common words ${icon('arrow')}</button></div>`}</div>`;
}
function personalNotebookOpen(){return personalNotebookState===state&&$('overlay').innerHTML.includes('id="personal-notebook"')}
function personalOpenNotebook(){personalNotebookState=state;personalNotebookQuery='';personalNotebookLimit=30;studyModal(`<section id="personal-notebook"><span class="eyebrow">Your connections</span><h2>Memory notes</h2><label class="personal-note-search" for="personal-note-search">Find a note<input class="input full" id="personal-note-search" type="search" autocomplete="off" placeholder="Character, pinyin, meaning, or note" oninput="personalNotebookSearch(this.value)"></label><div id="personal-notebook-results">${personalNotebookMarkup()}</div><p class="small muted">Notes stay on this device. Reading a note before answering counts as help.</p></section>`)}
function personalNotebookSearch(value){if(!personalNotebookOpen())return;personalNotebookQuery=String(value).slice(0,100);personalNotebookLimit=30;$('personal-notebook-results').innerHTML=personalNotebookMarkup()}
function personalNotebookMore(turn){if(!personalNotebookOpen()||turn!==personalNotebookTurn)return;personalNotebookLimit+=30;$('personal-notebook-results').innerHTML=personalNotebookMarkup()}
function personalOpenEntry(kind,id,turn){if(!personalNotebookOpen()||turn!==personalNotebookTurn||!personalNoteTarget(kind,id))return;kind==='word'?cwDetail(id):openCleanStudy(id,'usage');const editor=document.querySelector('.personal-note textarea');editor?.focus({preventScroll:true})}

/* Explicit file transfer bridges Safari's local-only data to the native iPhone
   companion. This is a practice copy, never a backup or a mastery import. */
let wristPack=null,wristPackState=null,wristPackSerial=0;
function wristBuildPack(kind='characters'){
 if(!['characters','words','saved'].includes(kind))return null;
 let cards=[];
 if(kind==='characters')cards=uniqueCards().filter(c=>state.cards[c.character]?.seen>0).sort((a,b)=>(state.cards[a.character].due||0)-(state.cards[b.character].due||0)).slice(0,5).map(c=>({id:'character:'+c.character,s:c.character,t:c.traditional||courseTraditional(c.character),pinyin:c.pinyin,meaning:c.meaning,note:state.memoryNotes[c.character]||''}));
 else{const d=cwDesk(),pool=kind==='saved'?d.saved.map(id=>CW_BY_ID[id]).filter(Boolean):CW_WORDS.filter(w=>d.records[w.id]?.seen>0).sort((a,b)=>(d.records[a.id].due||0)-(d.records[b.id].due||0));cards=pool.slice(0,5).map(w=>({id:'word:'+w.id,s:w.s,t:w.t,pinyin:w.p,meaning:w.en,note:d.notes?.[w.id]||''}))}
 if(!cards.length)return null;
 return {format:'erics-chinese-wrist',version:1,id:'wrist-'+Date.now().toString(36)+'-'+(++wristPackSerial),createdAt:Date.now(),course:selectedCourseId,courseName:currentCourse().name,script:state.settings.script,title:kind==='characters'?currentCourse().name+' · familiar characters':kind==='saved'?'Saved common words':'Common-word review',cards};
}
function wristChoosePack(kind){wristPack=wristBuildPack(kind);wristPackState=state;const host=$('wrist-pack-preview');if(host)host.innerHTML=wristPackMarkup()}
function wristPackMarkup(){return wristPack?`<div class="wrist-pack-cards" aria-label="Five-card practice set">${wristPack.cards.map(c=>`<span lang="zh">${esc(wristPack.script==='traditional'?c.t:c.s)}</span>`).join('')}</div><p class="small muted">${wristPack.cards.length} cards · ${esc(wristPack.title)}. Personal notes are included.</p><button type="button" class="btn primary full" onclick="wristDownloadPack()">${icon('download')} Export Watch practice set</button>`:`<p class="small muted">No words in this set yet. Study characters, practice common words, or save words to make a Watch set.</p><button type="button" class="btn full" onclick="closeModal();navigate('common')">Choose common words ${icon('arrow')}</button>`}
function wristOpenSetup(){
 wristPack=wristBuildPack('characters');wristPackState=state;
 studyModal(`<section class="wrist-setup"><span class="eyebrow">Five cards, on your wrist</span><h2>Apple Watch</h2><p>Short, offline reading practice with large characters, a reveal button, and Again / Almost / Got it.</p><div class="wrist-availability">Native app source is ready for Xcode testing. There is no App Store or TestFlight install yet.</div><label for="wrist-pack-kind">Choose a practice set</label><select class="input full" id="wrist-pack-kind" onchange="wristChoosePack(this.value)"><option value="characters">Characters studied · ${esc(currentCourse().name)}</option><option value="words">Common words studied</option><option value="saved">Saved common words</option></select><div id="wrist-pack-preview">${wristPackMarkup()}</div><details class="clean-study-section"><summary>How to use it</summary><ol><li>Install the iPhone companion and Watch app from the project using Xcode on a Mac.</li><li>Export a set here. Open the iPhone companion, import the file, and tap Send to Watch.</li><li>Practice offline on your Watch. The companion shows your recent round when reconnected.</li></ol><p>Watch rounds stay separate from website mastery, XP, and streaks. Browser progress stays on this device; there is no automatic cloud sync.</p><a class="btn" href="https://github.com/3ricw/Chinese/tree/main/apple-watch" target="_blank" rel="noopener">Get the app source ${icon('arrow')}</a></details></section>`);
}
function wristDownloadPack(){
 if(wristPackState!==state||!wristPack||!$('overlay').innerHTML.includes('class="wrist-setup"'))return;
 const blob=new Blob([JSON.stringify(wristPack,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Erics_Chinese_Watch_Set.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Watch practice set exported');
}

function personalFocusNote(){const editor=document.querySelector('.personal-note textarea');if(!editor?.isConnected)return;editor.scrollIntoView({block:'center',behavior:state.settings.animations===false||matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});editor.focus({preventScroll:true})}
