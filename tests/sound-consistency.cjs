/* Activation coverage and sound priority via DOM/Web Audio fixtures.
   These checks do not audition sound on real speakers or browsers. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{boot}=require('./runtime.cjs');
const app=boot(),r=app.run,checks=[],failures=[];
function check(name,fn){checks.push(name);try{fn()}catch(e){failures.push({name,error:e.message})}}
const tones=[],gains=[];let now=1000;
const audio={state:'running',currentTime:1,destination:{},createOscillator(){const o={frequency:{setValueAtTime(v){o.hz=v}},connect(){},disconnect(){},start(){tones.push(o)},stop(){}};return o},createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(v){gains.push(v)},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}}}};
app.ctx.AudioContext=function(){return audio};app.ctx.performance.now=()=>now;r('state.settings.soundEffects=true;studyAudioContext=null;stopStudySounds()');
const before=r('JSON.stringify({cards:state.cards,notes:state.memoryNotes,words:state.commonWords,companion:state.companion,rewards:bx})');
function control(tag='BUTTON',action="navigate('home')",extra={}){
 const b=new app.ctx.Element();b.tagName=tag;b.setAttribute(tag==='SELECT'||tag==='INPUT'?'onchange':'onclick',action);Object.assign(b,extra);
 b.closest=selector=>selector==='[inert]'?(b.inertParent?{}:null):b;
 return b;
}
function fire(b,type='click',extra={}){
 const target={closest(selector){
  if(type==='change')return b.tagName==='SELECT'||b.tagName==='INPUT'&&['checkbox','radio'].includes(b.type)?b:null;
  return ['BUTTON','SUMMARY','A'].includes(b.tagName)||b.dataset.uiSound||b.getAttribute('role')==='button'?b:null;
 }};
 app.ctx.sfxEvent={type,isTrusted:true,target,...extra};now+=200;const count=tones.length;r('axUISound(sfxEvent)');return tones.length-count;
}
for(const [label,tag,action]of [
 ['ordinary tool button','BUTTON',"openQuickLookup()"],
 ['card reveal','BUTTON','reveal()'],
 ['memory note button','BUTTON','personalOpenNotebook()'],
 ['game launch','BUTTON',"bxStart('tone')"],
 ['common-word save','BUTTON',"cwToggleSaved('cw-01-01')"],
 ['modal close','BUTTON','closeModal()'],
 ['native disclosure','SUMMARY',''],
 ['topic link','A',''],
 ['theme button','BUTTON','toggleTheme()'],
 ['Back button','BUTTON','goBack()']
])check(label+' has one quiet activation cue',()=>assert.equal(fire(control(tag,action)),2));
const role=control('SPAN');role.setAttribute('role','button');check('accessible custom buttons receive the same cue',()=>assert.equal(fire(role),2));
check('native keyboard clicks have a cue without pointer events',()=>assert.equal(fire(control(),'click',{detail:0}),2));
const open=control();open.dataset.uiSound='open';check('explicit open cue remains available',()=>{const previous=gains.length;assert.equal(fire(open),2);assert(gains.slice(previous).every(x=>x===.02))});
check('generic UI cues stay quieter than learning feedback',()=>assert(gains.every(x=>x<=.02)));
for(const [label,b]of [['select',control('SELECT',"cwSetFilter(this.value)")],['checkbox',control('INPUT',"setSetting('animations',this.checked)",{type:'checkbox'})],['radio',control('INPUT',"setSetting('script',this.value)",{type:'radio'})]]){
 check(label+' clicks do not duplicate change feedback',()=>assert.equal(fire(b),0));
 check(label+' committed changes get one cue',()=>assert.equal(fire(b,'change'),2));
}
for(const [label,b]of [
 ['disabled',control('BUTTON','',{disabled:true})],
 ['detached stale',control('BUTTON','',{isConnected:false})],
 ['inert ancestor',control('BUTTON','',{inertParent:true})],
 ['current page',control()],['current step',control()],['active tab',control()],['ARIA disabled',control()],['invalid control',control()],['explicit opt-out',control()]
]){
 if(label==='current page')b.setAttribute('aria-current','page');if(label==='current step')b.setAttribute('aria-current','step');if(label==='active tab')b.classList.add('active');if(label==='ARIA disabled')b.setAttribute('aria-disabled','true');if(label==='invalid control')b.setAttribute('aria-invalid','true');if(label==='explicit opt-out')b.dataset.uiSound='none';
 check(label+' stays silent',()=>assert.equal(fire(b),0));
}
for(const action of ["rate('good')",'rateWriting(true)',"quizChoose('你')","leagueChoose('你好')","answerReadingQuiz('r',1)","answerScrollCheck(2,'你')",'quizNext()','leagueNext()',"nextReadingQuiz('r')","adoptCompanion('dragon')","memoryChooseCharacter('你')",'memoryAdvanceMatch()',"cwRate('good','cw-01-01',1)","cwContextAnswer('unit',1,1)",'inkSkip()','labAnswer(1)','labSubmitRecall(this.value)','labPart(1)','bxToneChoose(2)','bxSentenceCheck()',"bxMatchTap('left','你')",'bxTypeCheck()','bxTypeSkip()','bxSpeakSelf(true)','bxNext()','bxShowChest()'])check('owned outcome '+action+' has no extra UI cue',()=>assert.equal(fire(control('BUTTON',action)),0));
for(const action of ["speak('你好')","cwListen('cw-01-01')","cwContextAudio('u',0,1)",'hearListeningQuestion()','labHearSentence()','labDeckAudio(this.dataset.word)','readAlongReading(1)','stopReadingAudio()','bxListen()','bxPlayMine()','bxSpeakModel()','labVoiceSearch()','playStudySound("correct")','toggleSoundEffects()','feedToggleSound()'])check('audio action '+action+' has no competing UI cue',()=>assert.equal(fire(control('BUTTON',action)),0));
const invalidForm={checkValidity:()=>false};
check('an invalid parent form keeps an implicit submit silent',()=>assert.equal(fire(control('BUTTON','',{form:invalidForm})),0));
check('an invalid parent form keeps an explicit submit silent',()=>assert.equal(fire(control('BUTTON','',{type:'submit',form:invalidForm})),0));
check('valid form submission retains its normal cue',()=>assert.equal(fire(control('BUTTON','',{type:'submit',form:{checkValidity:()=>true}})),2));
check('an ordinary button inside an invalid form can still activate',()=>assert.equal(fire(control('BUTTON','',{type:'button',form:invalidForm})),2));
check('form-level validation bypass is respected',()=>assert.equal(fire(control('BUTTON','',{form:{...invalidForm,noValidate:true}})),2));
check('submit-button validation bypass is respected',()=>assert.equal(fire(control('BUTTON','',{form:invalidForm,formNoValidate:true})),2));
check('mute button remains silent even before muting',()=>assert.equal(fire(control('BUTTON','',{id:'sound-btn'})),0));
check('the sound-effects setting keeps its own confirmation only',()=>assert.equal(fire(control('INPUT',"setSetting('soundEffects',this.checked)",{type:'checkbox'}),'change'),0));
check('typing stays silent',()=>assert.equal(fire(control('INPUT','',{type:'text'}),'change'),0));
check('programmatic clicks stay silent',()=>assert.equal(fire(control(),'click',{isTrusted:false}),0));
check('canceled activation stays silent',()=>assert.equal(fire(control(),'click',{defaultPrevented:true}),0));
const rapid=control();fire(rapid);now-=200;check('rapid repeat activations cannot stack cues',()=>assert.equal(fire(rapid),0));
r('state.settings.soundEffects=false');check('saved mute suppresses generic controls',()=>assert.equal(fire(control()),0));r('state.settings.soundEffects=true');
app.ctx.document.visibilityState='hidden';check('hidden pages cannot play UI feedback',()=>assert.equal(fire(control()),0));app.ctx.document.visibilityState='visible';
app.ctx.speechSynthesis.speaking=true;check('spoken Mandarin has priority over control cues',()=>assert.equal(fire(control()),0));app.ctx.speechSynthesis.speaking=false;
r("stopStudySounds();playStudySound('complete')");check('completion sound cannot be interrupted by a UI cue',()=>assert.equal(fire(control()),0));
r('stopStudySounds()');check('activation cues cannot manufacture learning, notes or rewards',()=>assert.equal(r('JSON.stringify({cards:state.cards,notes:state.memoryNotes,words:state.commonWords,companion:state.companion,rewards:bx})'),before));
check('one existing click listener and one change listener own activation sound',()=>{assert.equal(app.events.click.filter(fn=>fn.name==='axUISound').length,1);assert.equal(app.events.change.filter(fn=>fn.name==='axUISound').length,1)});
check('sound coverage introduces no runtime errors',()=>assert.deepEqual(app.errors,[]));
// The actual common-word grading path owns feedback, including keyboard use.
const words=boot(),wr=words.run;wr("onboardingStep=null;state.profile.setupDone=true;closeModal();var gradingSounds=[];playStudySound=kind=>gradingSounds.push(kind);state.settings.soundEffects=true");
function wordRound(){wr("stopStudySounds();state.commonWords=cwDefaults();for(const id of ['cw-01-01','cw-01-02'])cwDesk().records[id]={seen:1,stage:0,exposureDay:'2000-01-01',creditDay:dayKey()};cwLaunch('review',['cw-01-01','cw-01-02'].map(id=>CW_BY_ID[id]),'',true);gradingSounds=[]");return wr('cwCurrent()')}
function wordGrade(rating){const q=wr('cwCurrent()');wr(`cwReveal();cwRate('${rating}','${q.w.id}',${q.s.turn})`);return q}
wordRound();let q=wr('cwCurrent()');wr(`cwRate('good','${q.w.id}',${q.s.turn})`);check('unrevealed word grading stays silent',()=>assert.equal(wr('gradingSounds.length'),0));
wordGrade('good');check('unassisted word recall has correct feedback',()=>assert.equal(wr('gradingSounds.at(-1)'),'correct'));
wr('gradingSounds=[]');wr(`cwRate('good','${q.w.id}',${q.s.turn})`);check('stale word callbacks cannot replay sound',()=>assert.equal(wr('gradingSounds.length'),0));
wordRound();wordGrade('hard');check('hesitant word recall has almost feedback',()=>assert.equal(wr('gradingSounds.at(-1)'),'almost'));
wordRound();wordGrade('again');check('missed word recall has retry feedback',()=>assert.equal(wr('gradingSounds.at(-1)'),'retry'));
wordRound();wr('cwCurrent().s.usedHint=true');wordGrade('good');check('helped word recall uses almost instead of unassisted success',()=>assert.equal(wr('gradingSounds.at(-1)'),'almost'));
wordRound();wordGrade('good');wordGrade('good');check('finishing word recall has one completion sound',()=>{assert.equal(wr('gradingSounds.at(-1)'),'complete');assert.equal(wr('gradingSounds.length'),2)});
wordRound();wr('cwReveal()');const key={key:'3',target:words.ctx.document.body,defaultPrevented:false,preventDefault(){this.defaultPrevented=true},stopImmediatePropagation(){}};
for(const fn of words.events.keydown)fn(key);
check('keyboard word grading reaches the same success sound',()=>{assert(key.defaultPrevented);assert.equal(wr('gradingSounds.at(-1)'),'correct');assert.equal(wr('cwDesk().session.attempts'),1)});
wordRound();wr("cwDesk().records[cwCurrent().w.id].creditDay='';bxAnswer=function(){studySoundRequest++;gradingSounds.push('milestone')}");wordGrade('good');check('a word level-up keeps its own sound without a queued lower-priority replacement',()=>assert.deepEqual(JSON.parse(wr('JSON.stringify(gradingSounds)')),['milestone']));
check('common-word grading sound adds no component-character mastery',()=>assert.equal(wr('Object.keys(state.cards).length'),0));
const result={checks:checks.length,failed:failures.length,failures,method:'DOM activation and Web Audio scheduling/priority mocks',browserTested:false,deviceAudioTested:false};
fs.mkdirSync(path.join(__dirname,'results'),{recursive:true});fs.writeFileSync(path.join(__dirname,'results/sound-consistency.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(failures.length)process.exitCode=1;
