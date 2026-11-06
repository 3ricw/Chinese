/* UI flow and new recall regressions. Node/DOM/media mocks; no browser layout claims. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {boot}=require('./runtime.cjs');let checks=0;const views=[];
const check=(name,f)=>{try{f();checks++}catch(e){console.error('FAIL',name);throw e}};
const app=boot(),r=app.run,KEY='hanzi-reading-room-v2',equal=(a,b)=>assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)));
function capture(name){views.push({name,html:app.html()})}
function field(id,value){const node=app.nodes.get(id)||app.ctx.document.getElementById(id);assert(node,id);node.value=value}
function editWord(deck='',word='',changes={}){r(`labEditWord(${JSON.stringify(deck)},${JSON.stringify(word)})`);for(const [key,value]of Object.entries(changes))field('lab-edit-'+key,value);return r(`labSaveWord(${JSON.stringify(deck)},${JSON.stringify(word)})`)}
(async()=>{
r("onboardingStep=null;state.profile.setupDone=true;closeModal();state.settings.soundEffects=false;var utterances=[];speechSynthesis.speak=u=>utterances.push(u.text);navigate('home')");
check('Home retains all required destinations and content',()=>{const h=app.html();for(const token of ['rx-greeting','feed-home-copy','rx-companion-scene','Open Scroll','bx-status-row','rx-quest-area','rx-games','All games'])assert(h.includes(token),token);assert.equal((h.match(/data-game=/g)||[]).length,3)});
check('Home suggests full chapter, without requiring new preference state',()=>assert(app.html().includes('Full chapter practice')));
check('Course directs new material to full chapter',()=>assert(r("courseNext('1').action===\"startSession('all','1')\"")));
r("navigate('lab')");capture('practice/new-hierarchy');
check('Practice has one full chapter primary and collapsed advanced tools',()=>{assert(app.html().includes('class="btn primary" onclick="startSession(\'all\''));assert(!app.html().includes('One chapter, several ways'));assert(app.html().includes('<summary>More activities &amp; study tools</summary>'))});
r("navigate('tools')");capture('tools');
check('Tools retain direct Review and chapter practice',()=>{for(const token of ['Chapter practice','Review','My study decks','Commonly used words'])assert(app.html().includes(token),token)});
check('Tools has one Review destination',()=>assert.equal((app.html().match(/<strong>Review(?:<| )/g)||[]).length,1));
check('no render starts audio',()=>assert.equal(r('utterances.length'),0));
// Story explanations cite actual source text rather than just repeating the translation.
check('48 feedback records link to the correct original scene',()=>assert(r("Object.keys(ADVENTURE_FEEDBACK).length===48&&ADVENTURE_EPISODES.every(e=>e.scenes.every((s,i)=>{const f=ADVENTURE_FEEDBACK[e.id+'#'+i];return f&&s.zh.includes(f.evidence)&&f.explanation&&f.replyExplanation}))")));
for(const mode of ['story','dialogue']){r(`labStart('${mode}','1');labAnswer(labCurrent().correct)`);capture(mode+'/evidence');check('evidence and reason visible '+mode,()=>{const q=r('labCurrent()');assert(app.html().includes(q.explanation.replace(/&/g,'&amp;')));assert(app.html().includes('<blockquote lang="zh">'))})}
// Spatial construction, partial correction, and preview assistance.
r("state.settings.script='simplified';labStart('parts','I');var shape=labShapePool('parts','I').find(x=>x.layout==='enclosure');labStart('parts','I',{items:[shape.id]});labPart(0)");capture('parts/enclosure-partial');
check('partial selection can be undone without grading',()=>{r('labUndoPart(labRun.id,labRun.pos)');assert.equal(r('labRun.partChoices.length'),0);assert(!r('labRun.feedback'))});
r("labPart(0);labUndoPart('old-run',labRun.pos)");check('stale part undo is ignored',()=>assert.equal(r('labRun.partChoices.length'),1));r('labUndoPart(labRun.id,labRun.pos,true)');
check('component hint names an actual position and part',()=>assert(r("labHintText(labCurrent()).includes(labCurrent().parts[0])&&labHintText(labCurrent()).includes('outside')")));
r('labCurrent().parts.forEach(p=>labPart(labCurrent().choices.findIndex((x,i)=>x===p&&!labRun.partChoices.includes(i))))');capture('parts/assembled');
check('finished construction displays full target',()=>assert(app.html().includes('lab-assembled')));
r("labStart('transform','I');labAnswer(labCurrent().correct)");capture('transform/result');check('transform result replaces question mark',()=>assert(app.html().includes('lab-transformed')));
r("labStart('parts','I',{items:[shape.id],assisted:true});labCurrent().parts.forEach(p=>labPart(labCurrent().choices.findIndex((x,i)=>x===p&&!labRun.partChoices.includes(i))))");check('model-preview puzzle cannot count as independent',()=>assert(r('labRun.feedback.helped&&labRun.feedback.xp===0')));
// Direct retries retain the descriptor and cannot turn immediate repetition into independent credit.
r("labStart('sound','1');labAnswer((labCurrent().correct+1)%labCurrent().choices.length);labRun.pos=labRun.queue.length;labRun.done=true;labFinish(labRun);renderLabComplete()");capture('completion/retry');
check('completion offers a direct missed-item retry',()=>assert(app.html().includes('Retry 1 missed item')));
const xp=r('bx.xp');r('labRetryMisses();labAnswer(labCurrent().correct)');check('retry is helped and cannot farm rewards',()=>assert(r('labRun.feedback.correct&&labRun.feedback.helped&&labRun.feedback.xp===0')));check('retry XP stays unchanged',()=>assert.equal(r('bx.xp'),xp));
// Existing w0/w1 IDs survive validation; remove/edit never reindex the rest.
r("state.learningLab=labDefaults();labImportDeck('chinese,pinyin,english,traditional,context\\n朋友,péngyou,friend,朋友,他是我的朋友。\\n学校,xuéxiào,school,學校,我去学校。\\n绿色,lǜsè,green,綠色,','Class deck');var deckId=labData().decks[0].id");const deck=r('deckId');
check('legacy IDs survive validation in order',()=>equal(r('labValidateDeck(labData().decks[0]).entries.map(w=>w.id)'),['w0','w1','w2']));
r('labDeleteWord(deckId,\'w0\')');check('deletion preserves remaining word IDs',()=>equal(r('labData().decks[0].entries.map(w=>w.id)'),['w1','w2']));
check('validation never reindexes deleted positions',()=>equal(r('labValidateDeck(labData().decks[0]).entries.map(w=>w.id)'),['w1','w2']));
// The test clock advances without making claims about real device timers.
r("var reviewNow=Date.now();var NativeDate=Date;Date=class extends NativeDate{constructor(...a){super(...(a.length?a:[reviewNow]))}static now(){return reviewNow}};labData().wordSeen={};labData().deckWords={};labStart('deck','1',{deck:deckId,recall:true,items:[deckId+'#w1']});var firstWord=labCurrent().item;var firstReading=labCurrent().pinyin");
capture('deck/read-type');
check('read/type keeps answer hidden before checking',()=>{assert(app.html().includes('lab-recall-input'));assert(!app.html().includes('lab-answer-grid'));assert(app.html().indexOf('Check reading')>app.html().indexOf('<footer class="lab-run-actions">'));assert(!app.html().includes(r('firstReading')))});
const characterBefore=r('JSON.stringify(state.cards)');r('labResolve(true)');check('recall correctness requires actual input proof',()=>assert(!r('labRun.feedback')));
r("labSubmitRecall('not-the-reading')");check('wrong reading stays Learning and repeats as typed recall',()=>{assert(r("!labRun.feedback.correct&&labData().deckWords[firstWord].stage===1"));assert.equal(r('labRun.queue.filter(d=>d.item===firstWord).at(-1).variant'),2)});
r("reviewNow+=16*60000;labStart('deck','1',{deck:deckId,recall:true,items:[firstWord]});labSubmitRecall(labCurrent().pinyin)");
check('first independent day becomes Learning',()=>assert(r('labData().deckWords[firstWord].stage===1&&labData().deckWords[firstWord].days.length===1')));
capture('deck/feedback-and-usage');check('word and sentence audio are separate in feedback',()=>assert(app.html().includes('Word audio')&&app.html().includes('Sentence audio')));const audioBefore=r('utterances.length');r('labHear();labHearSentence()');check('feedback audio only plays on request and uses separate text',()=>{assert.equal(r('utterances.length'),audioBefore+2);assert.notEqual(r('utterances.at(-1)'),r('utterances.at(-2)'))});check('audio after feedback does not change the recorded answer',()=>assert(!r('labRun.feedback.helped')));
check('personal word recall never changes component-character knowledge',()=>assert.equal(r('JSON.stringify(state.cards)'),characterBefore));
const firstDue=r('labData().deckWords[firstWord].due'),firstXP=r('bx.xp');
r("labStart('deck','1',{deck:deckId,recall:true,items:[firstWord]});labSubmitRecall(labCurrent().pinyin)");
check('immediate correct repeat is helped and cannot advance familiarity',()=>assert(r('labRun.feedback.helped&&labData().deckWords[firstWord].stage===1&&labData().deckWords[firstWord].days.length===1')));
check('same-day repeat grants no extra learner XP',()=>assert.equal(r('bx.xp'),firstXP));
check('assisted repeats do not push a due review further away',()=>assert(r('labData().deckWords[firstWord].due<= '+firstDue)));
r("reviewNow+=86400000+60000;labStart('deck','1',{deck:deckId,recall:true,items:[firstWord]});labSubmitRecall(labCurrent().pinyin)");
check('separate unassisted day makes the word Familiar',()=>assert(r('labData().deckWords[firstWord].stage===2&&labData().deckWords[firstWord].days.length===2')));
check('familiar word is scheduled into the future',()=>assert(r('labData().deckWords[firstWord].due>Date.now()+86400000')));
// Accented ü, v, and u: are equivalent while u remains a distinct syllable.
check('pinyin accepts ü with any tone mark without collapsing to u',()=>{for(const py of ['lǜ sè','lü4 se4','lv se','lu:4 se4'])assert.equal(r('labPinyinKey('+JSON.stringify(py)+')'),'lvse');assert.notEqual(r("labPinyinKey('lu se')"),'lvse')});
check('pinyin accepts explicit alternative readings',()=>equal(r("labPinyinOptions('hé / hè')"),['he']));
check('invalid punctuation does not create a usable recall target',()=>assert(!r("labCanRecall('???')")));
// Browse, lookups, and input events preserve assistance and stale-action guards.
r("reviewNow+=86400000;labPreviewDeck(deckId);labStart('deck','1',{deck:deckId,recall:true,items:[firstWord]});labSubmitRecall(labCurrent().pinyin)");
check('browsing before recall counts as help',()=>assert(r('labRun.feedback.helped')));
r("reviewNow+=86400000;labStart('deck','1',{deck:deckId,recall:true,items:[firstWord]});labHelp();labSubmitRecall(labCurrent().pinyin)");check('revealed reading cannot count as independent',()=>assert(r('labRun.feedback.helped')));
r("reviewNow+=86400000;labStart('deck','1',{deck:deckId,recall:true,items:[firstWord]})");const id=r('labRun.id');
r(`labSubmitRecall(labCurrent().pinyin,'stale',0)`);check('stale submit cannot answer a new run',()=>assert(!r('labRun.feedback')));
r("var compositionEvent={key:'Enter',isComposing:true,target:{value:labCurrent().pinyin},preventDefault(){},stopPropagation(){}};labRecallKey(compositionEvent,labRun.id,labRun.pos)");check('IME Enter does not submit while composing',()=>assert(!r('labRun.feedback')));
r("labSubmitRecall(labCurrent().pinyin)");const answers=r('labData().deckWords[firstWord].attempts');r('labSubmitRecall(labCurrent().pinyin)');check('double submission records once',()=>assert.equal(r('labData().deckWords[firstWord].attempts'),answers));
// Editable fields preserve identity and reset only changed knowledge.
r("closeModal();var editedId=firstWord.split('#')[1];var otherId=labData().decks[0].entries.find(w=>w.id!==editedId).id;labData().deckWords[deckId+'#'+otherId]={word:labData().decks[0].entries.find(w=>w.id===otherId).zh,attempts:2,last:Date.now(),due:Date.now()+86400000,stage:2,step:2,days:['2026-10-01','2026-10-02']};var otherProgress=JSON.stringify(labData().deckWords[deckId+'#'+otherId]);labEditWord(deckId,editedId)");
const edited=r('editedId'),existing=r('labData().decks[0].entries.find(w=>w.id===editedId)');
for(const [key,value]of Object.entries({zh:existing.zh,trad:existing.traditional,py:existing.py,en:existing.en+' (updated)',context:existing.context}))field('lab-edit-'+key,value);
r('labSaveWord(deckId,editedId)');
check('editing meaning preserves word ID and clears only that word knowledge',()=>assert(r('labData().decks[0].entries.some(w=>w.id===editedId)&&!labData().deckWords[firstWord]')));
check('other words keep their progress through edits',()=>assert.equal(r("JSON.stringify(labData().deckWords[deckId+'#'+otherId])"),r('otherProgress')));
editWord(deck,'',{zh:'可以',trad:'可以',py:'kěyǐ',en:'can; may',context:''});check('added word gets a distinct stable ID',()=>{const ids=r('labData().decks[0].entries.map(w=>w.id)');assert.equal(new Set(ids).size,ids.length);assert(ids.at(-1).startsWith('word-'))});
const deckCount=r('labData().decks.length');r('labSaveWord()');check('duplicate editor submit cannot create another deck',()=>assert.equal(r('labData().decks.length'),deckCount));
r('labEditWord(deckId);var previousEditToken=labDeckEditToken;labEditWord(deckId)');check('stale editor cannot mutate a new form',()=>assert.equal(r("labSaveWord(deckId,'',previousEditToken)"),false));r('closeModal()');
const clean=r('validateState(state)');check('new progress validation is idempotent',()=>equal(r('validateState(validateState(state))'),clean));
r('save()');const restored=boot(Object.fromEntries(app.storage));check('reload preserves deck word progress and all IDs',()=>{equal(restored.run('labData().deckWords'),clean.learningLab.deckWords);equal(restored.run('labData().decks'),clean.learningLab.decks)});
check('reopening still starts Home',()=>assert.equal(restored.run('currentView'),'home'));
const imported=boot();imported.run('onboardingStep=null;closeModal()');const backup=JSON.stringify({...clean,boost:r('bx')});await imported.nodes.get('backup-file').onchange({target:{files:[{size:Buffer.byteLength(backup),text:async()=>backup}],value:'backup.json'}});check('actual backup import preserves typed word progress',()=>equal(imported.run('labData().deckWords'),clean.learningLab.deckWords));check('actual backup import preserves stable deck IDs',()=>equal(imported.run('labData().decks'),clean.learningLab.decks));
let exportedBlob;imported.ctx.URL={createObjectURL:b=>{exportedBlob=b;return 'blob:export'},revokeObjectURL(){}};imported.run('exportBackup()');const exported=JSON.parse(await exportedBlob.text());check('actual backup export includes word reviews and existing extensions',()=>{equal(exported.learningLab.deckWords,clean.learningLab.deckWords);assert(exported.courses&&exported.commonWords&&exported.readingDesk)});
r('resetProgress()');check('reset clears word recall and exposure while retaining content',()=>assert(r('Object.keys(labData().deckWords).length===0&&Object.keys(labData().wordSeen).length===0&&labData().decks[0].entries.length===3')));
// Render a sample of every changed page in each course, script, and palette.
for(const course of ['chinese-1','chinese-2'])for(const script of ['simplified','traditional'])for(const palette of ['jade','black']){
 r(`switchCourse('${course}');state.settings.script='${script}';state.settings.palette='${palette}';labSelectedLesson=courseFocusId();closeModal()`);
 for(const page of ['home','learn','tools','write','read','lab','labskills','labalbum','labdecks','labcamp']){r(`navigate('${page}')`);capture(course+'/'+script+'/'+palette+'/'+page)}
}
check('no runtime errors in changed flows',()=>equal(app.errors,[]));
// Static handlers get a syntax check; this is not a layout measurement.
const handlers=new Set();for(const view of views)for(const match of view.html.matchAll(/\son\w+="([^"]+)"/g))handlers.add(match[1].replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&#39;/g,"'"));
for(const code of handlers)new vm.Script('(function(event){'+code+'})');
fs.mkdirSync(path.join(__dirname,'results'),{recursive:true});fs.writeFileSync(path.join(__dirname,'results','ui-views.json'),JSON.stringify(views));
console.log(JSON.stringify({checks,views:views.length,handlers:handlers.size,failed:0}));

})().catch(error=>{console.error(error);process.exitCode=1});
