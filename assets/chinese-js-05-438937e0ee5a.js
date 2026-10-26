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
 const due=dueCards(),chapterId=courseFocusId(),info=CHAPTERS.find(c=>c[0]===chapterId)||CHAPTERS[0],plan=memoryLearningPlan(chapterId);
 if(savedResume)return {eyebrow:'Ready when you are',title:'Continue your saved practice',copy:'Your unfinished practice is saved.',button:'Resume practice',action:'resumeSession()',meta:'Your saved session'};
 if(due.length)return {eyebrow:'Your next step',title:'Review the shapes you know',copy:`${due.length} ${due.length===1?'character is':'characters are'} ready for another look. Start with a small set.`,button:'Start a quick review',action:'rxStartRecovery()',meta:'Recall · '+Math.min(5,due.length)+' characters'};
 return {eyebrow:chapterId==='I'?'Foundations':lessonLabel(chapterId),title:plan.fresh.length?`Meet ${plan.fresh.length} new ${plan.fresh.length===1?'character':'characters'}.`:'Practice your current lesson',copy:plan.fresh.length?'See the shape, learn its parts, then try it from memory.':esc(info[1])+' · a little focused practice.',button:plan.fresh.length?'Start guided practice':'Continue practice',action:`startSession('learn','${chapterId}')`,meta:info[1]}
}
let rxBuddyTap=0;
function rxPetBuddy(){
 if(!cleanBuddyEnabled())return;rxBuddyTap++;
 const moods=['happy','thinking','celebrate'],mood=moods[rxBuddyTap%3];
 cleanReactionIndex++;const art=$('rx-home-buddy-art');if(art)art.innerHTML=cleanReactionArt(mood);
 const note=$('rx-buddy-note');if(note)note.textContent=state.settings.companionMessages===false?'':[
 'A few good recalls beat a long cram.','Try reading it once before you listen.','Your next little win is ready.'
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
renderHome=function(){
 document.body.classList.remove('feed-focus');
 const action=rxNextAction(),hour=new Date().getHours(),greeting=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening',buddy=cleanBuddyEnabled(),ready=bxPortGameReady(),games=bxPortHomeGames(ready);
 $('view').innerHTML=`<div class="flow-home feed-home rx-home rx-home-calm rx-home-restored">
  <div class="rx-greeting"><h1>${greeting}${state.profile.name?', '+esc(state.profile.name):''}.</h1><button class="rx-find-button" onclick="openQuickLookup()" aria-label="Find a character, passage, or activity">${icon('search')}<span>Quick find</span><kbd>Ctrl K</kbd></button></div>
  <section class="feed-home-hero rx-hero">
    <div class="feed-home-copy"><span class="eyebrow">${action.eyebrow}</span><h2>${action.title}</h2><p>${action.copy}</p><button class="btn primary" onclick="${action.action}">${action.button} ${icon('arrow')}</button><button class="textbtn rx-scroll-link" onclick="openScrollQuickAccess()">${scrollNavIcon()} Open Scroll</button></div>
    <div class="rx-companion-scene"><div class="rx-orbit" aria-hidden="true"></div>${buddy?`<button class="feed-home-companion rx-buddy" onclick="rxPetBuddy()" aria-label="Greet your companion"><span id="rx-home-buddy-art">${cleanReactionArt('happy')}</span></button><p class="rx-buddy-note" id="rx-buddy-note" aria-live="polite"></p><button class="textbtn rx-buddy-name" onclick="openJourney()">${esc(starterData().forms[state.companion.stage])} · Lv. ${companionLevel()} ${icon('chevron')}</button>`:`<span class="rx-quiet-glyph" lang="zh" aria-hidden="true">学</span>`}</div>
   </section>
  ${bxPortStatusRow()}
  <div class="rx-home-extras">
   <section class="rx-quest-area" aria-label="Daily quests">${bxQuestMarkup(true)}</section>
   <section class="rx-games" aria-labelledby="rx-games-title"><div class="rx-section-heading"><h2 id="rx-games-title">Quick games</h2><button class="textbtn" onclick="navigate('arcade')">All games ${icon('arrow')}</button></div><div class="bx-quick-row">${games.map(({t,quest})=>`<button class="bx-quick ${ready[t]?'':'is-locked'}" data-game="${t}" onclick="bxStart('${t}')"><span aria-hidden="true" lang="zh">${BX_GAMES[t].glyph}</span><strong>${esc(BX_GAMES[t].title)}</strong><small>${ready[t]?(quest?'Daily quest':esc(BX_GAMES[t].skill)):'Learn a few characters to unlock'}</small></button>`).join('')}</div></section>
  </div>
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
const RX_ACTIONS=[['Course','Chapters and guided learning',"navigate('learn')"],['Scroll','New shapes and quick checks','openScrollQuickAccess()'],['Reading','Passages and saved reading list',"navigate('read')"],['Review','Due characters and targeted practice',"navigate('review')"],['Writing','Draw, type or use paper',"navigate('write')"],['Listening','Recognize a character by sound','startListeningPractice()'],['Arcade','Tones, sentences and more',"navigate('arcade')"],['Progress','Your practice history',"navigate('stats')"],['Settings','Appearance, audio and backups',"navigate('settings')"]];
function rxSearchItems(query){const q=normalize(String(query||'').slice(0,100));return {actions:RX_ACTIONS.map((a,index)=>({a,index})).filter(x=>!q||normalize(x.a[0]+' '+x.a[1]).includes(q)).slice(0,q?4:3),readings:q?courseReadings().filter(r=>normalize(r.title+' '+r.subtitle+' '+r.lines.map(l=>l.join(' ')).join(' ')).includes(q)).slice(0,3):[]}}
const rxQuickMarkupBase=quickLookupMarkup;
quickLookupMarkup=function(query){const hits=rxSearchItems(query);return `<div class="rx-search-sections">${hits.actions.length?`<div class="rx-search-group"><span class="eyebrow">Go to</span>${hits.actions.map(({a,index})=>`<button class="rx-search-action" onclick="rxRunAction(${index})"><span><strong>${esc(a[0])}</strong><small>${esc(a[1])}</small></span>${icon('arrow')}</button>`).join('')}</div>`:''}<div><span class="eyebrow">Characters</span>${rxQuickMarkupBase(query)}</div>${hits.readings.length?`<div class="rx-search-group"><span class="eyebrow">Passages</span>${hits.readings.map(r=>`<button class="rx-search-action" onclick="rxOpenReadingFromLookup('${r.id}')"><span><strong>${esc(r.title)}</strong><small>${esc(r.subtitle)}</small></span>${icon('read')}</button>`).join('')}</div>`:''}</div>`};
function rxRunAction(index){if(!Number.isInteger(index)||!RX_ACTIONS[index])return;rxClearOverlay();const actions=[()=>navigate('learn'),()=>openScrollQuickAccess(),()=>navigate('read'),()=>navigate('review'),()=>navigate('write'),()=>startListeningPractice(),()=>navigate('arcade'),()=>navigate('stats'),()=>navigate('settings')];actions[index]()}
const rxQuickBase=openQuickLookup;
openQuickLookup=function(...args){rxQuickBase(...args);const modal=document.querySelector('.practice-detail-modal');if(!$('overlay').innerHTML.includes('flow-lookup-input'))return;const h=modal?.querySelector('h2');if(h)h.textContent='Quick find';const input=$('flow-lookup-input');input?.setAttribute('placeholder','Character, pinyin, activity, or passage');input?.setAttribute('aria-label','Find characters, activities, and passages')};
const rxToolsBase=renderTools;
renderTools=function(...args){rxToolsBase(...args);$('view').querySelector('.flow-tools')?.classList.add('rx-tools');$('view').querySelector('.heading')?.insertAdjacentHTML('afterend',`<button type="button" class="rx-tools-search" onclick="openQuickLookup()">${icon('search')}<span>Find a character, passage, or activity</span><kbd>Ctrl K</kbd></button>`)};

try{if(currentView==='home')renderHome()}catch(e){console.error(e)}

