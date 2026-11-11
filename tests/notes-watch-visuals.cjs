/* Behavioral and content checks. Node/DOM mocks, not browser or Watch UI tests. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{boot}=require('./runtime.cjs');
let checks=0;const failures=[],views=[],raster=[];
function check(name,fn){checks++;try{fn()}catch(e){failures.push({name,error:e.message})}}
function plain(x){return JSON.parse(JSON.stringify(x))}
const app=boot(),r=app.run;
r("onboardingStep=null;state.profile.setupDone=true;closeModal();state.settings.soundEffects=false;var spoken=[];speechSynthesis.speak=u=>spoken.push(u.text)");
const original=JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/chinese-js-06-7e120d7e299d.js'),'utf8').split('\n')[1].slice('const CW_WORDS='.length,-1));
check('existing 600 word IDs, scripts, examples and senses stay byte-for-byte equivalent',()=>assert.deepEqual(plain(r('CW_WORDS')),original));
check('each common word has an explicitly assigned matching cue',()=>{assert.equal(r('Object.keys(WORD_VISUAL_CUES).length'),600);assert(r('CW_WORDS.every(w=>wvCue(w)?.form===w.s)'))});
const before=r('JSON.stringify({cards:state.cards,words:cwDesk().records,xp:bx.xp,pet:state.companion,activity:state.activity})');
for(const w of original){
 check(w.id+' has an actual supported scene and a useful original caption',()=>{assert(r(`WV_SCENE_TYPES.has(wvCue(CW_BY_ID['${w.id}']).scene.split(':')[0])`));assert(/<(?:path|circle|rect|ellipse|text)\b/.test(r(`wvScene(wvCue(CW_BY_ID['${w.id}']).scene)`)));assert(r(`wvCue(CW_BY_ID['${w.id}']).note.trim().length>10`))});
 for(const script of ['simplified','traditional']){
  r(`state.settings.script='${script}'`);const h=r(`wvVisualMarkup(CW_BY_ID['${w.id}'])`);
  check(w.id+' '+script+' visual has accessible labels and valid output',()=>{assert(h.includes('data-word-visual="'+w.id+'"'));assert(h.includes(script==='traditional'?w.t:w.s));assert(!/undefined|NaN|Infinity/.test(h));assert(h.includes('<figcaption>'))});
  views.push({name:'word-visual/'+w.id+'/'+script,html:h});
 }
 raster.push({id:w.id,word:w.s,english:w.en,scene:r(`wvCue(CW_BY_ID['${w.id}']).scene`),markup:r(`wvVisualMarkup(CW_BY_ID['${w.id}'])`)});
}
check('600 picture renderings create no recognition, word knowledge, rewards or activity',()=>assert.equal(r('JSON.stringify({cards:state.cards,words:cwDesk().records,xp:bx.xp,pet:state.companion,activity:state.activity})'),before));
check('了 cue does not incorrectly label the particle as simple past tense',()=>{const h=r('wvCue(CW_WORDS.find(w=>w.s==="了")).note');assert(h.includes('not a general past-tense marker'))});
check('the two 得 readings keep separate cue identities',()=>{const words=original.filter(w=>w.s==='得');assert.equal(words.length,2);assert.notEqual(r(`wvCue(CW_BY_ID['${words[0].id}']).scene`),r(`wvCue(CW_BY_ID['${words[1].id}']).scene`))});
r("state.settings.visualMemory=false");check('saved visual-memory preference suppresses pictures',()=>assert.equal(r('wvVisualMarkup(CW_WORDS[0])'),''));r('state.settings.visualMemory=true');
function startCold(){r("closeModal();navigate('home');cwDesk().records={};cwLaunch('learn',[CW_WORDS[0]],'',true)")}
startCold();let q=r('cwCurrent()');check('cold recall shows the plain form and offers a deliberate picture hint',()=>{assert(!app.html().includes('wv-memory'));assert(app.html().includes('cwVisualHint('))});
r(`cwVisualHint('${q.w.id}',${q.s.turn+1})`);check('stale picture callback cannot assist a different turn',()=>assert(!r('cwCurrent().s.usedHint')));
r(`cwVisualHint('${q.w.id}',${q.s.turn})`);check('picture hint records assistance and daily exposure',()=>assert(r("cwCurrent().s.usedHint&&cwRecord(CW_WORDS[0].id).exposureDay===dayKey()")));
views.push({name:'word-visual/hint',html:app.nodes.get('overlay').innerHTML});
r(`closeModal();cwReveal();cwRate('good','${q.w.id}',${q.s.turn})`);check('picture-supported answer cannot advance word familiarity',()=>assert.equal(r('cwDesk().records[CW_WORDS[0].id].stage'),0));
const answerCount=r('cwDesk().session.attempts');r(`cwRate('good','${q.w.id}',${q.s.turn})`);check('duplicate answer after picture hint cannot grade twice',()=>assert.equal(r('cwDesk().session.attempts'),answerCount));
r("cwDesk().records={};cwStartUnit('cw-lesson-01')");check('teaching cards show picture and retain separate audio buttons',()=>{assert(app.html().includes('wv-memory'));assert(app.html().includes('Word audio'));assert(app.html().includes('Sentence audio'))});views.push({name:'word-visual/teach',html:app.html()});
// Personal notes: the legacy character key is unchanged, whole words stay separate.
r("closeModal();navigate('home');state.memoryNotes['你']='Legacy note';personalSaveNote('word','cw-01-01','The speaker: 我');personalSaveNote('character','你','The person on the left')");
check('character and word notes use their own existing namespaces',()=>{assert.equal(r("state.memoryNotes['你']"),'The person on the left');assert.equal(r("cwDesk().notes['cw-01-01']"),'The speaker: 我');assert.equal(r('Object.keys(state.cards).length'),0)});
check('unsafe or unknown note IDs are rejected',()=>{for(const [kind,id]of [['character','constructor'],['character','__proto__'],['word','constructor'],['word','no-word']])assert.equal(r(`personalSaveNote('${kind}','${id}','unsafe')`),false)});
r("openCleanStudy('你','usage')");check('Usage remains first and exposes the note editor',()=>{const h=app.nodes.get('overlay').innerHTML;assert(h.includes('Your memory note'));assert(h.indexOf('data-clean-tab="usage"')<h.indexOf('data-clean-tab="shape"'))});views.push({name:'notes/character-usage',html:app.nodes.get('overlay').innerHTML});
r("cwDetail('cw-01-01')");check('whole words expose the note editor and a direct focus button',()=>{const h=app.nodes.get('overlay').innerHTML;assert(h.includes('The speaker: 我'));assert(h.includes('personalFocusNote()'))});views.push({name:'notes/word',html:app.nodes.get('overlay').innerHTML});
const token=r('personalNoteSerial'),editor=new app.ctx.Element('personal-note-'+token);editor.value='\n <script>alert(1)</script> & a real cue \n';app.ctx.noteEditor=editor;r(`personalNoteInput(${token},noteEditor)`);
check('note input saves immediately and stores text',()=>assert.equal(r("cwDesk().notes['cw-01-01']"),'<script>alert(1)</script> & a real cue'));
r("cwDetail('cw-01-01')");check('note markup escapes HTML and textarea delimiters',()=>{const h=app.nodes.get('overlay').innerHTML;assert(!h.includes('<script>alert'));assert(h.includes('&lt;script&gt;alert'))});
r("personalSaveNote('word','cw-01-01','我 = the speaker');personalSaveNote('character','你','Person plus 尔');save()");
const saved=JSON.parse(app.storage.get('hanzi-reading-room-v2')),fresh=boot(Object.fromEntries(app.storage));
check('legacy initialization preserves optional word notes and old character notes',()=>{assert.equal(fresh.run("cwDesk().notes['cw-01-01']"),'我 = the speaker');assert.equal(fresh.run("state.memoryNotes['你']"),'Person plus 尔');assert.equal(fresh.run('currentView'),'home')});
const backup=r('validateState(JSON.parse(JSON.stringify(state)))');check('backup validation round-trips both note types',()=>{assert.equal(backup.memoryNotes['你'],'Person plus 尔');assert.equal(backup.commonWords.notes['cw-01-01'],'我 = the speaker')});
const dirty=plain(saved);dirty.commonWords.notes={'cw-01-01':'x'.repeat(900),'not-a-word':'bad','cw-01-02':{},'cw-01-03':'  '};app.ctx.dirtyNoteBackup=dirty;
check('backup validation bounds word notes, drops unknown IDs, and keeps absent notes additive',()=>{const clean=r('validateState(dirtyNoteBackup)');assert.equal(clean.commonWords.notes['cw-01-01'].length,600);assert.deepEqual(Object.keys(clean.commonWords.notes),['cw-01-01']);assert(!r('Object.hasOwn(cwValidate({}),"notes")'))});
r("state.settings.script='traditional';personalOpenNotebook()");check('notebook combines notes across character and word scopes',()=>{const h=app.nodes.get('overlay').innerHTML;assert(h.includes('Person plus 尔'));assert(h.includes('我 = the speaker'))});views.push({name:'notes/notebook',html:app.nodes.get('overlay').innerHTML});
r("personalNotebookSearch('speaker')");check('notebook search finds note contents and filters other entries',()=>{const h=app.nodes.get('personal-notebook-results').innerHTML;assert(h.includes('我 = the speaker'));assert(!h.includes('Person plus 尔'))});
r("closeModal();startSession('all','1',['你']);navigate('tools');personalOpenNotebook()");check('notes seen during a paused character session persist assistance',()=>assert(r('session.usedHint&&savedResume.data.usedHint')));
startCold();q=r('cwCurrent()');r("navigate('tools');personalOpenNotebook()");check('notes seen during a paused word session persist assistance',()=>assert(r('cwCurrent().s.usedHint')));
r("closeModal();var usagePair=CARDS.find(c=>c.word.length>1&&CW_WORDS.some(w=>w.s===c.word));var usageWord=CW_WORDS.find(w=>w.s===usagePair.word)");
for(const pictures of [true,false]){r(`state.settings.visualMemory=${pictures};cwDesk().records={};cwLaunch('learn',[usageWord],'',true);navigate('tools');openCleanStudy(usagePair.character,'usage')`);check('course Usage marks paused compound-word recall as help with pictures '+pictures,()=>assert(r('cwCurrent().s.usedHint')))}
r('state.settings.visualMemory=true');
const staleToken=r('personalNoteSerial');r("cwDetail('cw-01-01')");const liveToken=r('personalNoteSerial'),old=new app.ctx.Element('personal-note-'+liveToken);old.value='stale replacement';app.ctx.staleEditor=old;
r('resetProgress()');r(`personalNoteInput(${liveToken},staleEditor)`);check('a stale editor after reset cannot repopulate cleared notes',()=>assert(r('Object.keys(state.memoryNotes).length===0&&!cwDesk().notes')));
r("personalSaveNote('word','cw-01-01','Delete me');personalSaveNote('word','cw-01-01','  ')");check('clearing the final word note removes the optional extension',()=>assert(!r('Object.hasOwn(cwDesk(),"notes")')));
const quota=new Error('Quota exceeded');const prior=app.ctx.localStorage.setItem;app.ctx.localStorage.setItem=()=>{throw quota};r("cwDetail('cw-01-01')");const failedToken=r('personalNoteSerial'),failed=new app.ctx.Element('personal-note-'+failedToken);failed.value='Recover me from a backup';app.ctx.failedNoteEditor=failed;r(`personalNoteInput(${failedToken},failedNoteEditor)`);
check('failed storage never claims the note was saved',()=>{assert(!r('storageOK'));assert(app.nodes.get('personal-note-status-'+failedToken).textContent.includes('Not saved'));assert.equal(r("cwDesk().notes['cw-01-01']"),'Recover me from a backup')});app.ctx.localStorage.setItem=prior;r('save()');
// Watch sets: stable IDs, small course-aware pools, no browser mastery or reward writes.
r("closeModal();state.cards={};state.cards['你']={seen:3,streak:1,interval:1,due:10,last:1};state.cards['好']={seen:2,streak:0,interval:1,due:2,last:1};state.memoryNotes['好']='A greeting';state.settings.script='traditional'");
let pack=r("wristBuildPack('characters')");check('Watch character pack prioritizes studied due characters only',()=>{assert.equal(pack.cards.length,2);assert.equal(pack.cards[0].id,'character:好');assert.equal(pack.cards[0].note,'A greeting');assert.equal(pack.script,'traditional');assert.equal(pack.course,'chinese-1')});
r("switchCourse('chinese-2');state.cards['你']={seen:3,streak:1,interval:1,due:0,last:1}");pack=r("wristBuildPack('characters')");check('Watch character pool respects the selected course and shared recognition',()=>{if(pack){const c2=r('uniqueCards().map(c=>c.character)');for(const c of pack.cards)assert(c2.includes(c.s));assert.equal(pack.course,'chinese-2')}});
r("cwDesk().saved=CW_WORDS.filter(w=>['关系','联系'].includes(w.s)).map(w=>w.id);personalSaveNote('word',cwDesk().saved[0],'Whole word')");
pack=r("wristBuildPack('saved')");check('Watch word pack preserves whole-word traditional forms and stable word IDs',()=>{assert(pack.cards.some(w=>w.t==='關係'));assert(pack.cards.some(w=>w.t==='聯繫'));assert(pack.cards.every(w=>w.id.startsWith('word:cw-')));assert.equal(pack.cards[0].note,'Whole word')});
const activity=r('JSON.stringify({cards:state.cards,words:cwDesk().records,activity:state.activity,pet:state.companion,xp:bx.xp})');r("wristOpenSetup();wristChoosePack('saved');wristBuildPack('words')");
check('Watch setup/export selection cannot change browser progress or rewards',()=>assert.equal(r('JSON.stringify({cards:state.cards,words:cwDesk().records,activity:state.activity,pet:state.companion,xp:bx.xp})'),activity));
check('Watch setup states installation and sync limits clearly',()=>{const h=app.nodes.get('overlay').innerHTML;assert(h.includes('no App Store or TestFlight'));assert(h.includes('no automatic cloud sync'));assert(h.includes('Xcode'))});views.push({name:'watch/setup',html:app.nodes.get('overlay').innerHTML});
check('unsupported Watch pool cannot silently substitute new material',()=>assert.equal(r('wristBuildPack("anything")'),null));
r("cwDesk().saved=[];wristChoosePack('saved')");check('an empty Watch set gives a useful next action',()=>assert(app.nodes.get('wrist-pack-preview').innerHTML.includes('Choose common words')));
r("navigate('tools')");check('Tools offers Notes and Watch beside all preserved study tools',()=>{assert(app.html().includes('personalOpenNotebook()'));assert(app.html().includes('wristOpenSetup()'));assert(app.html().includes('vmOpenLibrary()'));assert(app.html().includes("navigate('common')"))});views.push({name:'notes-watch/tools',html:app.html()});
r("navigate('home');openQuickLookup();updateQuickLookup('notes')");check('Quick Find reaches notes without changing older action IDs',()=>{assert(r('rxFindRows.some(x=>x.kind==="actions"&&x.key===11)'));assert.equal(r('RX_ACTIONS[10][0]'),'Visual library')});
check('no new feature starts listening or speech automatically',()=>assert.equal(r('spoken.length'),0));check('notes, picture, and Watch flows log no runtime errors',()=>assert.deepEqual(app.errors,[]));
const result={checks,failed:failures.length,failures,commonWordCues:600,sceneTypes:r('WV_SCENE_TYPES.size'),method:'Node DOM/media mocks, real saved-state round trips, generated SVG/HTML, and connected editor fixtures',browserTested:false,watchDeviceTested:false};
fs.writeFileSync(path.join(__dirname,'results/notes-watch-visuals.json'),JSON.stringify(result,null,2));fs.writeFileSync(path.join(__dirname,'results/notes-watch-visuals-views.json'),JSON.stringify(views));fs.writeFileSync(path.join(__dirname,'results/word-scene-raster-input.json'),JSON.stringify(raster));
console.log(JSON.stringify(result));if(failures.length)process.exitCode=1;
