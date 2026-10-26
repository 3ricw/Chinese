/* Course services. Loaded before the app; catalog data and validators exist before migration.
 * Legacy character keys and Chinese 1 lesson/reading IDs are intentionally unchanged.
 * Only course-local navigation/session projections are swapped. Recognition stays shared.
 */
const COURSE_REGISTRY = [
  {id:'chinese-1',name:'Chinese 1',number:'1',lessons:['I','1','2','3','4','5','6','7','8','9','10'],scope:'Foundations and Lessons 1–10'},
  {id:'chinese-2',name:'Chinese 2',number:'2',lessons:['c2-11','c2-12','c2-13','c2-14','c2-15'],scope:'Lessons 11–15 · supplied workbook'}
];
let selectedCourseId = 'chinese-1';
let courseRuntimeReady = false;
// Keep an untouched pre-migration snapshot before legacy initialization can write.
try{const key='hanzi-reading-room-v2',raw=localStorage.getItem(key);if(raw&&!JSON.parse(raw)?.courses&&!localStorage.getItem(key+'-before-courses-v1'))localStorage.setItem(key+'-before-courses-v1',raw)}catch{}
function currentCourse(){return COURSE_REGISTRY.find(c=>c.id===selectedCourseId)||COURSE_REGISTRY[0]}
function courseForLesson(id){return COURSE_REGISTRY.find(c=>c.lessons.includes(id))||null}
function courseChapters(id=selectedCourseId){const c=COURSE_REGISTRY.find(c=>c.id===id)||COURSE_REGISTRY[0];return CHAPTERS.filter(ch=>c.lessons.includes(ch[0]))}
function courseReadings(id=selectedCourseId){const c=COURSE_REGISTRY.find(c=>c.id===id)||COURSE_REGISTRY[0];return READINGS.filter(r=>c.lessons.includes(r.lesson))}
function lessonNumber(id){return String(id).replace(/^c2-/, '')}
function lessonLabel(id){return id==='I'?'Foundations':'Lesson '+lessonNumber(id)}
function allUniqueCards(){return CARDS.filter((c,i,a)=>a.findIndex(x=>x.character===c.character)===i)}
function courseCard(ch,lesson){return CARDS.find(c=>c.character===ch&&(lesson?c.lesson===lesson:currentCourse().lessons.includes(c.lesson)))||cardByChar[ch]}
function courseDefaults(){return {version:1,active:'chinese-1',records:Object.fromEntries(COURSE_REGISTRY.map(c=>[c.id,{lastChapter:c.lessons[0],feed:null,scrollSession:null,resume:null}]))}}
function courseResumeEnvelope(raw,id){
  if(!raw||typeof raw!=='object'||![1,2].includes(raw.version)||!['cards','write','quiz','league'].includes(raw.kind)||!raw.data||JSON.stringify(raw).length>300000)return null;
  const owner=courseForLesson(raw.chapter)?.id;
  if(owner!==id||raw.kind==='league'&&raw.data.course!==id)return null;
  return JSON.parse(JSON.stringify(raw)); // Full queue validation happens after all app definitions load.
}
function validateCourses(raw,out){
  const clean=courseDefaults(),incoming=raw.courses;
  if(incoming?.version===1&&COURSE_REGISTRY.some(c=>c.id===incoming.active))clean.active=incoming.active;
  for(const c of COURSE_REGISTRY){
    const active=c.id===clean.active,source=incoming?.version===1?incoming.records?.[c.id]:null;
    const record=clean.records[c.id],last=active?raw.lastChapter:source?.lastChapter;
    record.lastChapter=c.lessons.includes(last)?last:c.lessons[0];
    record.feed=validateFeedData(active?raw.feed:source?.feed,c.id);
    record.scrollSession=validateScrollSession(active?raw.scrollSession:source?.scrollSession);
    if(record.scrollSession&&!c.lessons.includes(record.scrollSession.chapter))record.scrollSession=null;
    record.resume=courseResumeEnvelope(source?.resume,c.id);
  }
  out.courses=clean;const active=clean.records[clean.active];
  out.lastChapter=active.lastChapter;out.feed=active.feed;out.scrollSession=active.scrollSession;
  return clean;
}
function syncCourseState(){
  state.courses??=courseDefaults();
  selectedCourseId=state.courses.active;
  const record=state.courses.records[selectedCourseId];
  if(!record)return;
  record.lastChapter=state.lastChapter;record.feed=state.feed;record.scrollSession=state.scrollSession;
  if(courseRuntimeReady){record.resume=savedResume;journeyCourse=selectedCourseId}
}
function persistCourseResume(){
  if(!courseRuntimeReady)return;
  state.courses.records[selectedCourseId].resume=savedResume;
  save();
}
function courseSelectorMarkup(){return `<label class="course-picker"><span class="course-picker-label">Course</span><select aria-label="Choose course" onchange="switchCourse(this.value)">${COURSE_REGISTRY.map(c=>`<option value="${c.id}" ${c.id===selectedCourseId?'selected':''}>${c.name}</option>`).join('')}</select></label>`}
function updateCourseChrome(){
  const host=$('course-selector');if(host){host.innerHTML=courseSelectorMarkup();host.hidden=['session','quiz','scroll','game','commonPractice'].includes(currentView)||(currentView==='write'&&!!writeSession&&!writeSession.done)}
  const number=document.querySelector('.wordmark-one');if(number)number.textContent=currentCourse().number;
  document.querySelector('.chinese-wordmark')?.setAttribute('aria-label',currentCourse().name);
  document.body.dataset.course=selectedCourseId;
}
function adoptCourseState(){
  selectedCourseId=state.courses.active;journeyCourse=selectedCourseId;chapter=state.lastChapter;tab='cards';
  session=null;writeSession=null;quizSession=null;activeReadingQuiz=null;activeReading=null;
  undoAnswers=[];studioFeedback=null;flowWritingSetup=null;flowOpenUnit=null;flowLastFocusUnit=null;
  feedRuntimeData=null;feedClearTrail();destroyScrollObserver();stopReadingAudio();feedStopAudio();
  pageHistory=[];readingFoldersOpened=null;
  savedResume=state.courses.records[selectedCourseId].resume;
  if(savedResume)try{decodeResume(savedResume)}catch{savedResume=null}
  try{if(savedResume)localStorage.setItem(RESUME_KEY,JSON.stringify(savedResume));else localStorage.removeItem(RESUME_KEY)}catch{}
}
function switchCourse(id,destination='learn'){
  if(!COURSE_REGISTRY.some(c=>c.id===id))return false;
  if(id===selectedCourseId)return false;
  checkpointCurrent();syncCourseState();
  stopReadingAudio();feedStopAudio();destroyScrollObserver();
  if(typeof bxStopRecognition==='function')bxStopRecognition();
  if(typeof bxStopWriter==='function')bxStopWriter();
  feedClearTrail();
  session=null;writeSession=null;quizSession=null;activeReadingQuiz=null;activeReading=null;
  if(typeof bxGame!=='undefined'){bxRevokeGameRecordings(bxGame);bxGame=null;bx.scope='auto';bxCombo=0;bxSave()}
  undoAnswers=[];studioFeedback=null;flowWritingSetup=null;flowOpenUnit=null;flowLastFocusUnit=null;
  readingFoldersOpened=null;readingLibraryQuery='';readingLibraryStatus='all';
  if(typeof rxLibraryFilter!=='undefined')rxLibraryFilter='all';
  pageHistory=[];lookupCardHistory=[];closeStudioDialogs();
  selectedCourseId=id;state.courses.active=id;journeyCourse=id;
  const next=state.courses.records[id];
  state.lastChapter=next.lastChapter;chapter=next.lastChapter;tab='cards';
  state.feed=next.feed;state.scrollSession=next.scrollSession;feedRuntimeData=null;
  savedResume=next.resume;
  if(savedResume)try{decodeResume(savedResume)}catch{savedResume=null}
  try{if(savedResume)localStorage.setItem(RESUME_KEY,JSON.stringify(savedResume));else localStorage.removeItem(RESUME_KEY)}catch{}
  save();navigate(destination);return true;
}
function ensureLessonCourse(id){const owner=courseForLesson(id);if(owner&&owner.id!==selectedCourseId)switchCourse(owner.id);return !!owner}
function courseScopeMarkup(){
  if(selectedCourseId!=='chinese-2')return '';
  const reused=uniqueCards().filter(c=>state.cards[c.character]?.seen>0).length;
  return `<details class="course-scope"><summary>About these five lessons${reused?' · '+reused+' characters already studied':''}</summary><p>Based on the supplied workbook’s Lessons 11–15. Examples, readings, and practice explanations are original. Lessons 16–20 are not included in this course.</p><p>Character recognition carries across courses. Each course has its own lesson checks, readings, badges, and challenges. The 600 common words are shared.</p></details>`;
}
function courseUsageNote(id){return C2_CONTENT.patterns[id]||null}
function courseReadingNote(id){const r=READINGS.find(r=>r.id===id);return r?.usage?`<details class="clean-study-section course-reading-note"><summary>One useful pattern</summary><p>${esc(r.usage)}</p></details>`:''}
// Whole-word conversion resolves ambiguous forms before the character fallback.
const COURSE_TRAD_WORDS={'关系':'關係','联系':'聯繫','没关系':'沒關係','头发':'頭髮','头疼':'頭疼','干净':'乾淨','面条':'麵條','里面':'裡面','这里':'這裡','这儿':'這兒','那里':'那裡','哪儿':'哪兒','那里边':'那裡邊','以后':'以後','后来':'後來','皇后':'皇后','钟头':'鐘頭','分钟':'分鐘','时钟':'時鐘','只要':'只要','一只':'一隻','两只':'兩隻','一杯':'一杯'};
function courseTraditional(s){const words=COURSE_TRAD_KEYS;let out='';for(let i=0;i<s.length;){const match=words.find(w=>s.startsWith(w,i));if(match){out+=COURSE_TRAD_WORDS[match];i+=match.length}else{out+=tradMap[s[i]]||s[i];i++}}return out}
for(const e of Object.values(C2_CONTENT.examples)){if(e.traditional)COURSE_TRAD_WORDS[e.word]=e.traditional;if(e.traditionalSentence)COURSE_TRAD_WORDS[e.sentence[0]]=e.traditionalSentence}

const COURSE_TRAD_KEYS=Object.keys(COURSE_TRAD_WORDS).sort((a,b)=>b.length-a.length);
