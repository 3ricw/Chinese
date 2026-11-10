/* Discovery update: connect familiar characters, focused review, and reading. */
const RX_VERSION=1;
function rxDefaults(){return {version:RX_VERSION,saved:[],positions:{},focus:false}}
function rxValidate(raw){
 const out=rxDefaults();if(!raw||typeof raw!=='object')return out;
 const ids=new Set(READINGS.map(r=>r.id));
 out.saved=[...new Set(Array.isArray(raw.saved)?raw.saved.filter(id=>typeof id==='string'&&ids.has(id)):[])].slice(0,READINGS.length);
 if(raw.positions&&typeof raw.positions==='object')for(const [id,pos]of Object.entries(raw.positions)){
  const r=READINGS.find(r=>r.id===id);if(r&&Number.isInteger(pos)&&pos>=0)out.positions[id]=Math.min(pos,r.lines.length-1)
 }
 out.focus=raw.focus===true;return out
}
function rxDesk(){return state.readingDesk??=(rxDefaults())}
const rxValidateStateBase=validateState;
validateState=function(raw){const clean=rxValidateStateBase(raw);clean.readingDesk=rxValidate(raw?.readingDesk);return clean};
// Read the optional extension after the original state migration; older backups simply get an empty shelf.
state.readingDesk=rxValidate(window.__rxReadingDesk);delete window.__rxReadingDesk;save();

function rxFit(r){
 const chars=[...new Set((r?.lines||[]).flatMap(l=>[...l[0]]).filter(ch=>/[\u3400-\u9fff]/.test(ch)))];
 const unknown=chars.filter(ch=>!cardByChar[ch]||!familiar(cardByChar[ch]));
 return {chars,unknown,known:chars.length-unknown.length,percent:chars.length?Math.round((chars.length-unknown.length)/chars.length*100):0}
}
function rxReadingPicks(limit=3){
 const order=courseChapters().map(c=>c[0]),focus=Math.max(0,order.indexOf(courseFocusId())),hasFamiliar=uniqueCards().some(familiar);
 return courseReadings().filter(r=>hasFamiliar||r.lesson===currentCourse().lessons[0]).map((r,index)=>{const fit=rxFit(r),chapter=Math.max(0,order.indexOf(r.lesson));return {r,fit,index,score:fit.percent-(state.read[r.id]?24:0)-Math.max(0,chapter-focus)*8-fit.unknown.length*.6}})
 .sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,limit)
}
function rxRecoveryCards(){
 const now=Date.now();return uniqueCards().filter(c=>state.cards[c.character]?.seen>0).sort((a,b)=>{
  const score=c=>{const p=state.cards[c.character];return (state.quizMisses[c.character]?100:0)+(p.due<=now?40:0)+(!familiar(c)?25:0)};
  return score(b)-score(a)||(state.cards[a.character].last||0)-(state.cards[b.character].last||0)
 }).slice(0,5)
}
function rxStartRecovery(){
 const cards=rxRecoveryCards();if(!cards.length){startSession('learn',currentCourse().lessons[0]);return}
 startSession('all',null,cards.map(c=>c.character));if(!session)return;
 session.mode='missed';session.reasons=Object.fromEntries(cards.map(c=>[c.character,state.quizMisses[c.character]?'Recent miss':state.cards[c.character].due<=Date.now()?'Due for review':'Keep the shape familiar']));
 session.targetedPractice=true;checkpointSession('cards',session);renderSession()
}
function rxNextAction(){
 const practice=labHomeAction();if(practice)return practice;
 const due=dueCards(),chapterId=courseFocusId(),info=CHAPTERS.find(c=>c[0]===chapterId)||CHAPTERS[0],plan=memoryLearningPlan(chapterId);
 if(savedResume)return {eyebrow:'Ready when you are',title:'Continue your saved practice',copy:'Your unfinished practice is saved.',button:'Resume practice',action:'resumeSession()',meta:'Your saved session'};
 if(due.length)return {eyebrow:'Your next step',title:'Review the shapes you know',copy:`${due.length} ${due.length===1?'character is':'characters are'} ready for another look. Start with a small set.`,button:'Start a quick review',action:'rxStartRecovery()',meta:'Recall · '+Math.min(5,due.length)+' characters'};
 return {eyebrow:chapterId==='I'?'Foundations':lessonLabel(chapterId),title:info[1],copy:`${uniqueCards(chapterId).length} characters in this chapter. Read each one before revealing, then rate what you remembered.`,button:'Full chapter practice',action:`startSession('all','${chapterId}')`,meta:info[1]}

}
let rxBuddyTap=0;
function rxPetBuddy(){
 if(!cleanBuddyEnabled())return;rxBuddyTap++;
 const moods=['happy','thinking','celebrate'],mood=moods[rxBuddyTap%3];
 cleanReactionIndex++;const art=$('rx-home-buddy-art');if(art)art.innerHTML=cleanReactionArt(mood);
 const note=$('rx-buddy-note');if(note)note.textContent=state.settings.companionMessages===false?'':[
 'Try writing the tricky one before revealing it.','Try reading it once before you listen.','Try comparing the left and right parts.'
 ][rxBuddyTap%3];
 if(typeof personalityReact==='function')personalityReact('feed_tip','home-pet-'+rxBuddyTap,{mood,visualOnly:true})
}
function rxBookCard(r,{compact=false}={}){
 const fit=rxFit(r),saved=rxDesk().saved.includes(r.id),chapterIndex=Math.max(0,courseChapters().findIndex(c=>c[0]===r.lesson));
 const glyphs=[...new Set(r.lines.flatMap(l=>[...l[0]]).filter(ch=>/[\u3400-\u9fff]/.test(ch)))].slice(0,2).map(text).join('');
 return `<article class="rx-book ${compact?'rx-book-small':''}" style="--rx-book-shift:${chapterIndex%3}"><button class="rx-book-open" type="button" onclick="openReading('${r.id}')" aria-label="Read ${esc(r.title)}"><div class="rx-book-cover" aria-hidden="true"><span class="rx-book-chapter">${r.lesson==='I'?'Foundations':lessonLabel(r.lesson)}</span><span lang="zh">${esc(glyphs)}</span><i>${icon('read')}</i></div><div class="rx-book-copy"><span class="rx-book-fit">${fit.percent}% of characters familiar</span><h3>${esc(r.title)}</h3><p>${esc(r.subtitle)}</p><span class="small muted">${r.lines.length} paragraphs · ${state.read[r.id]?'Read again':'Open passage'} ${icon('arrow')}</span></div></button><button type="button" class="iconbtn rx-book-save ${saved?'is-saved':''}" aria-label="${saved?'Remove saved reading':'Save reading'}: ${esc(r.title)}" aria-pressed="${saved}" onclick="rxToggleReading('${r.id}')">${icon('star')}</button><button type="button" class="textbtn rx-book-prep" onclick="rxPreviewReading('${r.id}')">${fit.unknown.length?'Preview '+fit.unknown.length+' unfamiliar characters':'Preview vocabulary'} ${icon('chevron')}</button></article>`
}
function rxToggleReading(id){
 if(!READINGS.some(r=>r.id===id))return;const d=rxDesk(),has=d.saved.includes(id);d.saved=has?d.saved.filter(x=>x!==id):[...d.saved,id];save();
 document.querySelectorAll('.rx-book-save,.rx-reader-save').forEach(b=>{if(b.getAttribute?.('onclick')===`rxToggleReading('${id}')`){b.setAttribute('aria-pressed',String(!has));b.classList.toggle('is-saved',!has);const r=READINGS.find(r=>r.id===id);b.setAttribute('aria-label',`${has?'Save reading':'Remove saved reading'}: ${r.title}`)}});
 if(currentView==='read'&&rxLibraryFilter==='saved')updateReadingLibrary();
 toast(has?'Removed from your reading list':'Saved to your reading list')
}
function rxPreviewReading(id){
 const r=READINGS.find(r=>r.id===id);if(!r)return;markReadingAssistance();const fit=rxFit(r),chars=(fit.unknown.length?fit.unknown:fit.chars).slice(0,12);
 studyModal(`<section class="rx-prep"><span class="eyebrow">Before you read</span><h2>${esc(r.title)}</h2><p class="small muted">${fit.unknown.length?`${fit.unknown.length} unfamiliar characters. Start with a few below; tap any one for help.`:'You have recalled all the characters in this passage. Try reading without pinyin.'}</p><div class="rx-prep-grid">${chars.map(ch=>{const c=cardByChar[ch]||extra[ch],support=r.support?.find(x=>x[0]===ch);return `<button class="rx-prep-word" onclick="openStudyCharacter('${ch}')"><strong lang="zh">${esc(text(ch))}</strong><span>${esc(c?.pinyin||support?.[1]||'Look up')}</span><small>${esc(c?.meaning||support?.[2]||'Supporting character')}</small></button>`}).join('')}</div><button class="btn primary full" onclick="rxOpenReadingFromLookup('${id}')">Read the passage ${icon('arrow')}</button></section>`)
}
function rxClearOverlay(){lookupCardHistory=[];closeModal()}
function rxOpenReadingFromLookup(id){if(!READINGS.some(r=>r.id===id))return;rxClearOverlay();openReading(id)}
function rxHomeGoalMarkup(){
 const today=state.activity[dayKey()]?.cards||0,goal=state.settings.goal||20,pct=Math.min(100,Math.round(today/goal*100));
 return `<button class="rx-home-goal" onclick="navigate('stats')" aria-label="Daily practice: ${today} of ${goal} checks. Open progress"><span><strong>${pct>=100?'Daily goal complete':'Today’s practice'}</strong><span>${today} / ${goal}</span></span><span class="rx-goal-track" aria-hidden="true"><span style="width:${pct}%"></span></span></button>`
}
function rxHomeMoreMarkup(){
 const due=dueCards().length;
 return `<details class="rx-home-more"><summary><span><strong>More ways to practice</strong><small>Stories, writing, review &amp; weekly missions</small></span>${icon('chevron')}</summary><div class="rx-home-more-body"><div class="ax-list" aria-label="More practice"><button class="ax-row" onclick="navigate('lab')"><span class="ax-tile ax-orange">${icon('write')}</span><span class="ax-row-text"><strong>Stories, shapes &amp; writing</strong><small>Practice this chapter another way</small></span>${icon('chevron')}</button><button class="ax-row" onclick="navigate('review')"><span class="ax-tile ax-indigo">${icon('review')}</span><span class="ax-row-text"><strong>Review</strong><small>${due?`${due} due now`:'Recall quizzes and similar shapes'}</small></span>${icon('chevron')}</button></div><div class="lab-inline"><button onclick="labOpenWeekly()">Weekly missions</button><button onclick="navigate('labskills')">Skill map</button></div></div></details>`
}
renderHome=function(){
 document.body.classList.remove('feed-focus');
 const action=rxNextAction(),hour=new Date().getHours(),greeting=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening',buddy=cleanBuddyEnabled(),ready=bxPortGameReady(),games=bxPortHomeGames(ready);
 $('view').innerHTML=`<div class="flow-home feed-home rx-home rx-home-calm rx-home-restored">
  <div class="rx-greeting"><h1>${greeting}${state.profile.name?', '+esc(state.profile.name):''}.</h1><button class="rx-find-button" onclick="openQuickLookup()" aria-label="Find a character, passage, or activity">${icon('search')}<span>Quick find</span><kbd>Ctrl K</kbd></button></div>
  <div class="vm-home-dashboard"><div class="rx-home-start"><section class="feed-home-hero rx-hero" aria-label="Your next step">
    <div class="feed-home-copy"><span class="eyebrow">${action.eyebrow}</span><h2>${action.title}</h2><p>${action.copy}</p><button class="btn primary" onclick="${action.action}">${action.button} ${icon('arrow')}</button><button class="textbtn rx-scroll-link" onclick="openScrollQuickAccess()">${scrollNavIcon()} Open Scroll</button></div>
    <div class="rx-companion-scene"><div class="rx-orbit" aria-hidden="true"></div>${buddy?`<button class="feed-home-companion rx-buddy" onclick="rxPetBuddy()" aria-label="Greet your companion"><span id="rx-home-buddy-art">${cleanReactionArt('happy')}</span></button><p class="rx-buddy-note" id="rx-buddy-note" aria-live="polite"></p><button class="textbtn rx-buddy-name" onclick="openJourney()">${esc(starterData().forms[state.companion.stage])} · Lv. ${companionLevel()} ${icon('chevron')}</button>`:`<span class="rx-quiet-glyph" lang="zh" aria-hidden="true">学</span>`}</div>
   </section>
  ${bxPortStatusRow()}</div>${typeof vmHomeMarkup==='function'?vmHomeMarkup():''}</div>
  <div class="rx-home-extras">
   <section class="rx-quest-area" aria-label="Daily quests">${bxQuestMarkup(true)}</section>
   <section class="rx-games" aria-labelledby="rx-games-title"><div class="rx-section-heading"><h2 id="rx-games-title">Quick games</h2><button class="textbtn" onclick="navigate('arcade')">All games ${icon('arrow')}</button></div><div class="bx-quick-row">${games.map(({t,quest})=>`<button class="bx-quick ${ready[t]?'':'is-locked'}" data-game="${t}" onclick="bxStart('${t}')"><span aria-hidden="true" lang="zh">${BX_GAMES[t].glyph}</span><strong>${esc(BX_GAMES[t].title)}</strong><small>${ready[t]?(quest?'Daily quest':esc(BX_GAMES[t].skill)):'Learn a few characters to unlock'}</small></button>`).join('')}</div></section>
  </div>
  ${rxHomeMoreMarkup()}
  <div class="flow-home-footer"><div id="flow-save-status">${flowSaveStatus()}</div><button class="textbtn" onclick="navigate('stats')">Your progress ${icon('arrow')}</button></div>
 </div>`;
 cleanSyncHeaderBuddy();if(bxNotice){toast(bxNotice);bxNotice=''}
};

/* Reading shelf: recommendations and saved passages reuse the original chapter folders. */
let rxLibraryFilter='all';
readingStoryCards=function(readings){return `<div class="story-grid rx-library-books">${readings.map(r=>rxBookCard(r)).join('')}</div>`};
const rxReadingMatchBase=libraryReadingMatches;
libraryReadingMatches=function(r){return rxReadingMatchBase(r)&&(rxLibraryFilter!=='saved'||rxDesk().saved.includes(r.id))&&(rxLibraryFilter!=='comfortable'||rxFit(r).percent>=80)};
const rxReadBase=renderRead;
renderRead=function(...args){
 rxReadBase(...args);const shelf=`<section class="rx-reading-discover"><div class="rx-section-heading"><div><span class="eyebrow">Chosen from your progress</span><h2>Start with these</h2></div></div><div class="rx-book-grid rx-book-grid-three">${rxReadingPicks(3).map(x=>rxBookCard(x.r,{compact:true})).join('')}</div></section><div class="rx-library-filters" role="group" aria-label="Reading collections">${[['all','All passages'],['saved','Saved'],['comfortable','80%+ familiar']].map(([value,label])=>`<button class="btn ${rxLibraryFilter===value?'primary':''}" aria-pressed="${rxLibraryFilter===value}" onclick="rxSetReadingFilter('${value}')">${label}</button>`).join('')}<span>Familiarity counts characters, not vocabulary comprehension.</span></div>`;
 $('view').querySelector('.reading-library-controls')?.insertAdjacentHTML('beforebegin',shelf);updateReadingLibrary()
};
function rxSetReadingFilter(value){if(!['all','saved','comfortable'].includes(value))return;rxLibraryFilter=value;renderRead()}
const rxFolderBase=readingFolderMarkup;
readingFolderMarkup=function(){if(rxLibraryFilter==='all')return rxFolderBase();const folders=courseChapters().map(([id,title])=>{const matches=READINGS.filter(r=>r.lesson===id&&libraryReadingMatches(r));return matches.length?`<details class="reading-folder" open><summary><span class="reading-folder-icon">${icon('folder')}</span><span class="reading-folder-label"><strong>${id==='I'?'Foundations':`${lessonLabel(id)} · ${esc(title)}`}</strong><span class="small muted">${matches.length} ${matches.length===1?'passage':'passages'}</span></span>${icon('chevron')}</summary><div class="reading-folder-body">${readingStoryCards(matches)}</div></details>`:''}).join('');return folders||`<section class="panel rx-empty"><h2>${rxLibraryFilter==='saved'?'Your reading list is empty':'No passages match yet'}</h2><p class="muted">${rxLibraryFilter==='saved'?'Tap the star on a passage to save it here.':'Keep learning, or browse all passages with vocabulary help.'}</p><button class="btn" onclick="rxSetReadingFilter('all')">Browse all passages</button></section>`};

/* Focus view keeps the same passage, quizzes, audio and clickable characters. */
function rxReadingIndex(id){const r=READINGS.find(r=>r.id===id);return r?Math.min(r.lines.length-1,Math.max(0,rxDesk().positions[id]||0)):0}
function rxFocusToolbar(id){const r=READINGS.find(r=>r.id===id),d=rxDesk(),i=rxReadingIndex(id);if(!r)return '';return `<div class="rx-focus-toolbar"><div class="rx-mode-pair" role="group" aria-label="Reading layout"><button class="${!d.focus?'active':''}" aria-pressed="${!d.focus}" onclick="rxSetReaderFocus('${id}',false)">${icon('read')} Passage</button><button class="${d.focus?'active':''}" aria-pressed="${d.focus}" onclick="rxSetReaderFocus('${id}',true)">${icon('target')} Focus</button></div><span>${d.focus?'One paragraph at a time':'Read the full passage'}</span><button class="textbtn" onclick="rxPreviewReading('${id}')">Preview vocabulary</button><button type="button" class="iconbtn rx-reader-save ${d.saved.includes(id)?'is-saved':''}" aria-label="${d.saved.includes(id)?'Remove saved reading':'Save reading'}: ${esc(r.title)}" aria-pressed="${d.saved.includes(id)}" onclick="rxToggleReading('${id}')">${icon('star')}</button></div>${d.focus?`<div class="rx-focus-steps" aria-label="Passage paragraphs">${r.lines.map((_,n)=>`<button type="button" class="${n===i?'active':''}" aria-label="Paragraph ${n+1} of ${r.lines.length}" ${n===i?'aria-current="step"':''} onclick="rxMoveReading('${id}',${n})"><span>${n+1}</span></button>`).join('')}</div>`:''}`}
const rxReaderBase=renderReader;
renderReader=function(id){
 rxReaderBase(id);$('view').querySelector('.reader-controls')?.insertAdjacentHTML('afterend',courseReadingNote(id));const r=READINGS.find(r=>r.id===id);if(!r)return;const focus=rxDesk().focus,i=rxReadingIndex(id),reader=$('view').querySelector('.reader');reader?.classList.toggle('rx-focus-reader',focus);
 $('view').querySelector('.reader-controls')?.insertAdjacentHTML('beforebegin',rxFocusToolbar(id));
 if(focus){$('view').querySelectorAll('.reader-line').forEach((el,index)=>{el.hidden=index!==i;el.setAttribute('aria-hidden',String(index!==i))});
  $('reading-quiz')?.insertAdjacentHTML('beforebegin',`<div class="rx-focus-footer"><button class="btn" ${i===0?'disabled':''} onclick="rxMoveReading('${id}',${i-1})">${icon('back')} Previous</button><span role="status">Paragraph ${i+1} / ${r.lines.length}</span><button class="btn primary" onclick="${i<r.lines.length-1?`rxMoveReading('${id}',${i+1})`:`startReadingQuiz('${id}')`}">${i<r.lines.length-1?'Next paragraph':'Take the quiz'} ${icon('arrow')}</button></div>`);
  const play=$('read-along-play');if(play){play.innerHTML=icon('sound')+' Listen to paragraph';play.setAttribute('onclick',`rxListenParagraph('${id}')`)}
  $('read-along-pause')?.remove();const status=$('read-along-status');if(status)status.textContent='Paragraph '+(i+1);
 }
};
function rxSetReaderFocus(id,value){if(currentView!=='reader'||activeReading!==id||!READINGS.some(r=>r.id===id)||typeof value!=='boolean')return;stopReadingAudio();window.speechSynthesis?.cancel();rxDesk().focus=value;save();renderReader(id)}
function rxMoveReading(id,index){const r=READINGS.find(r=>r.id===id);if(currentView!=='reader'||activeReading!==id||!r||!Number.isInteger(index)||index<0||index>=r.lines.length)return;stopReadingAudio();window.speechSynthesis?.cancel();rxDesk().positions[id]=index;save();renderReader(id);$('view').querySelector('.reader-line:not([hidden])')?.scrollIntoView?.({block:'nearest',behavior:'auto'})}
function rxListenParagraph(id){const r=READINGS.find(r=>r.id===id);if(currentView!=='reader'||activeReading!==id||!r)return;stopReadingAudio();markReadingAssistance();speak(r.lines[rxReadingIndex(id)][0])}

/* A character now leads back into the passages where it appears. */
const rxPaneBase=cleanStudyPane;
cleanStudyPane=function(c,tab){const base=rxPaneBase(c,tab);if(tab!=='usage')return base;const mentions=courseReadings().filter(r=>r.lines.some(l=>l[0].includes(c.character))).sort((a,b)=>rxFit(b).percent-rxFit(a).percent).slice(0,3);return base+(mentions.length?`<details class="clean-study-section rx-in-context"><summary>Read ${esc(han(c))} in a passage</summary><div>${mentions.map(r=>`<button class="rx-context-link" onclick="rxOpenReadingFromLookup('${r.id}')"><span><strong>${esc(r.title)}</strong><small>${rxFit(r).percent}% of characters familiar</small></span>${icon('arrow')}</button>`).join('')}</div></details>`:'')};

/* Extend the existing lookup so its hint / assistance accounting stays intact. */
const RX_ACTIONS=[['Course','Chapters and guided learning',"navigate('learn')"],['Scroll','New shapes and quick checks','openScrollQuickAccess()'],['Reading','Passages and saved reading list',"navigate('read')"],['Review','Due characters and targeted practice',"navigate('review')"],['Writing','Draw, type or use paper',"navigate('write')"],['Listening','Recognize a character by sound','startListeningPractice()'],['Arcade','Tones, sentences and more',"navigate('arcade')"],['Progress','Your practice history',"navigate('stats')"],['Settings','Appearance, audio and backups',"navigate('settings')"],['Chapter practice','Stories, puzzles, writing, decks and skills',"navigate('lab')"],['Visual library','Picture cues, plain characters and components','vmOpenLibrary()']];
function rxSearchItems(query){const q=normalize(String(query||'').slice(0,100));return {actions:RX_ACTIONS.map((a,index)=>({a,index})).filter(x=>!q||normalize(x.a[0]+' '+x.a[1]).includes(q)).slice(0,q?4:3),readings:q?courseReadings().filter(r=>normalize(r.title+' '+r.subtitle+' '+r.lines.map(l=>l.join(' ')).join(' ')).includes(q)).slice(0,3):[]}}
const RX_FIND_TYPES=[['all','All'],['characters','Characters'],['words','Words'],['readings','Readings'],['actions','Activities']];
let rxFindType='all',rxFindTurn=0,rxFindRows=[],rxFindActive=0;
const rxFindWordIndex=new Map(),rxFindReadingIndex=new Map();
function rxFindOpen(){return $('overlay').innerHTML.includes('id="flow-lookup-input"')}
function rxFindData(query){
 const raw=String(query||'').slice(0,100).trim(),q=normalize(raw),wordKey=typeof cwNorm==='function'?cwNorm(raw):q;
 const cards=quickLookupCards(raw),actions=raw?rxSearchItems(raw).actions:[9,1,3].map(index=>({index,a:RX_ACTIONS[index]}));
 const readings=raw?courseReadings().filter(r=>{if(!rxFindReadingIndex.has(r.id))rxFindReadingIndex.set(r.id,normalize(r.title+' '+r.subtitle+' '+r.lines.map(l=>l.join(' ')).join(' ')));return rxFindReadingIndex.get(r.id).includes(q)}):rxReadingPicks(3).map(x=>x.r);
 const words=typeof CW_WORDS==='undefined'?[]:raw?wordKey?CW_WORDS.filter(w=>{if(!rxFindWordIndex.has(w.id))rxFindWordIndex.set(w.id,cwNorm(w.s+' '+w.t+' '+w.p+' '+w.en));return rxFindWordIndex.get(w.id).includes(wordKey)}).sort((a,b)=>Number(b.s===raw||b.t===raw)-Number(a.s===raw||a.t===raw)):[]:cwDesk().saved.map(id=>CW_BY_ID[id]).filter(Boolean);
 return {
  actions:actions.map(({a,index})=>({kind:'actions',key:index,title:a[0],detail:a[1]})),
  characters:cards.map(c=>({kind:'characters',key:c.character,title:han(c),reading:c.pinyin,detail:c.meaning})),
  words:words.map(w=>({kind:'words',key:w.id,title:cwText(w),reading:w.p,detail:w.en})),
  readings:readings.map(r=>({kind:'readings',key:r.id,title:r.title,detail:r.subtitle}))
 };
}
quickLookupMarkup=function(query){
 const data=rxFindData(query),raw=String(query||'').slice(0,100).trim(),turn=++rxFindTurn;
 if(!RX_FIND_TYPES.some(([id])=>id===rxFindType))rxFindType='all';
 const keys=rxFindType==='all'?(raw?['characters','words','readings','actions']:['actions','characters','words']):[rxFindType];
 rxFindRows=[];rxFindActive=0;
 const filters=`<div class="rx-find-filters" role="group" aria-label="Search types">${RX_FIND_TYPES.map(([id,label])=>`<button type="button" aria-pressed="${id===rxFindType}" onclick="rxSetFindType('${id}')">${label}</button>`).join('')}</div>`;
 const groups=keys.map(kind=>{
  const rows=data[kind].slice(0,rxFindType==='all'?kind==='readings'?3:4:12);if(!rows.length)return '';
  const label=RX_FIND_TYPES.find(([id])=>id===kind)[1];
  return `<div class="rx-find-group" role="group" aria-label="${label}"><div class="rx-find-group-heading"><span class="eyebrow">${label}</span><span>${rows.length}${data[kind].length>rows.length?' shown':''}</span></div>${rows.map(row=>{
   const index=rxFindRows.push(row)-1,zh=['characters','words'].includes(kind);
   return `<button type="button" class="rx-find-result" role="option" id="rx-find-${turn}-${index}" aria-selected="${index===0}" tabindex="-1" data-rx-find="${index}" onclick="rxChooseFind(${turn},${index})"><span class="rx-find-copy"><strong ${zh?'lang="zh"':''}>${esc(row.title)}</strong>${row.reading?`<span class="rx-find-reading">${esc(row.reading)}</span>`:''}<small>${esc(row.detail||'')}</small></span>${icon(zh?'chevron':kind==='readings'?'read':'arrow')}</button>`;
  }).join('')}${data[kind].length>rows.length&&rxFindType==='all'?(()=>{const index=rxFindRows.push({kind:'filter',key:kind})-1;return `<button type="button" class="rx-find-more" role="option" id="rx-find-${turn}-${index}" aria-selected="false" tabindex="-1" data-rx-find="${index}" onclick="rxChooseFind(${turn},${index})">More ${label.toLowerCase()} ${icon('arrow')}</button>`})():''}</div>`;
 }).join('');
 const input=$('flow-lookup-input');if(rxFindRows.length)input?.setAttribute('aria-activedescendant',`rx-find-${turn}-0`);else input?.removeAttribute('aria-activedescendant');
 const count=rxFindRows.filter(row=>row.kind!=='filter').length;
 return `${filters}<div class="rx-find-status-row"><p class="rx-find-status" id="rx-find-status" role="status">${count?`${count} results shown${rxFindType==='all'?'':' · '+RX_FIND_TYPES.find(([id])=>id===rxFindType)[1]}`:'No matching results'}</p>${raw||rxFindType!=='all'?'<button class="textbtn" aria-label="Clear search and filters" onclick="rxResetFind()">Reset</button>':''}</div><div class="rx-find-list" id="rx-find-list" role="listbox" aria-label="Search results">${groups}</div>${groups?'':`<div class="rx-find-empty"><strong>${raw?'Try a shorter search':'Nothing saved here yet'}</strong><p>${raw?'Search either Chinese script, English, or pinyin.':'Find something first, then save it for later.'}</p><button class="btn" onclick="rxResetFind()">${raw?'Clear search & filters':'Show suggested activities'}</button></div>`}<p class="rx-find-keyboard"><kbd>↑</kbd><kbd>↓</kbd> Move <kbd>Enter</kbd> Open <kbd>Esc</kbd> Close</p>`;
};
function rxSetFindType(type){
 if(!rxFindOpen()||!RX_FIND_TYPES.some(([id])=>id===type))return;
 rxFindType=type;updateQuickLookup(flowLookupQuery);$('flow-lookup-input')?.focus({preventScroll:true});
}
function rxResetFind(){if(!rxFindOpen())return;rxFindType='all';$('flow-lookup-input').value='';updateQuickLookup('');$('flow-lookup-input').focus({preventScroll:true})}
function rxSetFindActive(index){
 if(!rxFindOpen()||!rxFindRows.length||!Number.isInteger(index))return;
 rxFindActive=(index+rxFindRows.length)%rxFindRows.length;
 $('flow-lookup-results')?.querySelectorAll('[data-rx-find]').forEach(el=>el.setAttribute('aria-selected',String(Number(el.dataset.rxFind)===rxFindActive)));
 const id=`rx-find-${rxFindTurn}-${rxFindActive}`;$('flow-lookup-input')?.setAttribute('aria-activedescendant',id);$(id)?.scrollIntoView?.({block:'nearest'});
}
function rxFindKey(event){
 if(!rxFindOpen()||event.isComposing||event.repeat&&event.key==='Enter'||event.ctrlKey||event.metaKey||event.altKey)return;
 if(!['ArrowDown','ArrowUp','Enter'].includes(event.key))return;
 event.preventDefault();event.stopPropagation?.();
 if(event.key==='Enter'){rxChooseFind(rxFindTurn,rxFindActive);return}
 rxSetFindActive(rxFindActive+(event.key==='ArrowDown'?1:-1));
}
function rxChooseFind(turn,index){
 if(!rxFindOpen()||turn!==rxFindTurn||!Number.isInteger(index)||!rxFindRows[index])return;
 const row=rxFindRows[index];
 if(row.kind==='characters')openStudyCharacter(row.key);
 else if(row.kind==='words')cwDetail(row.key);
 else if(row.kind==='readings')rxOpenReadingFromLookup(row.key);
 else if(row.kind==='actions')rxRunAction(row.key);
 else if(row.kind==='filter')rxSetFindType(row.key);
}
function rxRunAction(index){if(!Number.isInteger(index)||!RX_ACTIONS[index])return;rxClearOverlay();const actions=[()=>navigate('learn'),()=>openScrollQuickAccess(),()=>navigate('read'),()=>navigate('review'),()=>navigate('write'),()=>startListeningPractice(),()=>navigate('arcade'),()=>navigate('stats'),()=>navigate('settings'),()=>navigate('lab'),()=>vmOpenLibrary()];actions[index]()}
const rxQuickBase=openQuickLookup;
openQuickLookup=function(...args){
 if(!rxFindOpen())rxFindType='all';rxQuickBase(...args);if(!rxFindOpen())return;
 const modal=document.querySelector('.practice-detail-modal'),h=modal?.querySelector('h2');if(h)h.textContent='Quick find';
 const input=$('flow-lookup-input');
 for(const [key,value]of Object.entries({placeholder:'Character, word, pinyin, activity, or passage','aria-label':'Find characters, words, readings, and activities',role:'combobox','aria-autocomplete':'list','aria-controls':'rx-find-list','aria-expanded':'true',onkeydown:'rxFindKey(event)'}))input?.setAttribute(key,value);
 if(rxFindRows.length)input?.setAttribute('aria-activedescendant',`rx-find-${rxFindTurn}-${rxFindActive}`);else input?.removeAttribute('aria-activedescendant');
};
const rxToolsBase=renderTools;
renderTools=function(...args){rxToolsBase(...args);$('view').querySelector('.flow-tools')?.classList.add('rx-tools');$('view').querySelector('.heading')?.insertAdjacentHTML('afterend',`<button type="button" class="rx-tools-search" onclick="openQuickLookup()">${icon('search')}<span>Find a character, passage, or activity</span><kbd>Ctrl K</kbd></button>`);if(typeof vmToolMarkup==='function')$('view').querySelector('.flow-tool-grid')?.insertAdjacentHTML('beforeend',vmToolMarkup())};

try{if(currentView==='home')renderHome()}catch(e){console.error(e)}

