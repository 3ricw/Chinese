// Exercise the shipped modules, storage validation, route selection and reward ledger.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {boot} = require('./runtime.cjs');
const checks = [], views = [];
function test(label, run) { run(); checks.push(label); }
function shot(a, name) { views.push({name:'lantern/'+name,html:a.html()}); }
const app=boot(), run=app.run, overlay=()=>app.nodes.get('overlay').innerHTML;
function finishPrep(run) {
  run(`for(let n=0; n<50 && lanePrepLive(laneToken); n++){
    const {step,lesson}=lanePrepLive(laneToken);
    if(step.kind==='check' && !lesson.choice) laneLessonChoose(step.words.indexOf(step.word),laneToken);
    laneLessonNext(laneToken);
  }`);
  assert.equal(run('lanePrepLive(laneToken)'),null);
}
test('both individual characters appear with readings, meanings and separate audio before the greeting',()=>{
  assert.equal(run('onboardingStep'),'lane-welcome');
  assert(overlay().includes('Learn to read Chinese')&&overlay().includes('Explore the app'));
  for(const value of ['nǐ','hǎo','>you<','>good<','Hear 你"','Hear 好"'])assert(overlay().includes(value),value);
  assert(!overlay().includes('Hear 你好"'));
  run("var greetSpoken=[];var originalSpeaker=speak;speak=word=>greetSpoken.push(word);laneWelcomeSound(0,laneToken);laneWelcomeSound(1,laneToken)");
  assert.equal(run("greetSpoken.join('/')"),'你/好');
  assert(!overlay().includes('Check my reply'));
});
run("var initialXP=bx.xp;var firstToken=laneToken;laneWelcomeNext(laneToken);laneWelcomeNext(firstToken)");
test('the second screen models the combined word without crediting mastery',()=>{
  assert(overlay().includes('Meet Lin')&&overlay().includes('nǐ hǎo')&&overlay().includes('>hello<'));
  assert.equal((overlay().match(/class="ln-word-card"/g)||[]).length,1);
  run("laneWelcomeSound(1,firstToken);laneWelcomeSound(0,laneToken);speak=originalSpeaker");
  assert.equal(run("greetSpoken.join('/')"),'你/好/你好');
  assert.equal(run('bx.xp'),run('initialXP'));assert.equal(run('Object.keys(state.cards).length'),0);
});
test('greeting Lin produces a reply once and respects pinyin and audio settings',()=>{
  run("var beforeHello=laneToken;laneWelcomeGreet(beforeHello);laneWelcomeGreet(beforeHello);laneSetPinyin('none',laneToken)");
  assert(run('laneWelcomeDraft.replied'));assert(overlay().includes('Hello! I’m Xiao Lin.')&&!overlay().includes('<rt'));
  run("speak=word=>greetSpoken.push(word);laneWelcomeHearLin(laneToken);speak=originalSpeaker;laneSetPinyin('new',laneToken)");
  assert.equal(run("greetSpoken.at(-1)"),'你好！我叫小林。');assert.equal(run('bx.xp'),run('initialXP'));
});
const direct=boot(), dr=direct.run;
test('direct lesson entry bypasses the demo and profile setup and resumes after reload',()=>{
  dr("laneWelcomeSetup(laneToken);trailSetupNext(trailViewToken);trailSetupStart(trailViewToken)");
  assert(dr("currentView==='lane'&&laneSceneId==='gate'&&selectedCourseId==='chinese-1'&&state.profile.setupDone&&!state.companion.starter&&laneData().lessons.gate.at===0"));
  assert.equal(boot(Object.fromEntries(direct.storage)).run('onboardingStep'),null);
});
run("laneWelcomeNext(laneToken);trailSetupNext(trailViewToken)");
test('starting fresh shows only the Chinese 1 route',()=>{
  assert(overlay().includes('Chinese 1: the beginner course')&&!overlay().includes('Chinese 2'));
  assert.equal(run("trailSetupPick('course','chinese-2',trailViewToken)"),false);
  assert.equal(run("trailSetupPick('lesson','c2-13',trailViewToken)"),false);
});
run("trailSetupNext(trailViewToken);trailSetupName('Eric',trailViewToken);trailSetupPick('starter','turtle',trailViewToken);trailSetupNext(trailViewToken)");
test('fresh learner opens the first character lesson and keeps their profile choices',()=>assert(run("selectedCourseId==='chinese-1'&&laneSceneId==='gate'&&lanePrepLive(laneToken).step.kind==='learn'&&state.profile.name==='Eric'&&state.companion.starter==='turtle'")));
run("lanePick('choice',0,laneToken);laneCheck(laneToken);laneLessonNext(laneToken);laneLessonNext(laneToken);laneLessonChoose(1,laneToken);laneSetPinyin('none',laneToken)");
test('a first incorrect meaning gets feedback and switching pinyin preserves it',()=>{
  assert(run("laneData().lessons.gate.at===1&&laneData().lessons.gate.choice==='好'&&laneData().runs.gate.choice===null"));
  assert(app.html().includes('Try again')&&!app.html().includes('<rt'));
});
const paused=boot(Object.fromEntries(app.storage));paused.run("laneStart('gate')");
test('saved reading feedback resumes with pinyin preference, a retry cannot credit first-try recognition',()=>{
  assert(paused.html().includes('Try again')&&!paused.html().includes('<rt'));
  paused.run("laneLessonNext(laneToken);laneLessonChoose(0,laneToken);laneLessonNext(laneToken);laneLessonChoose(1,laneToken);laneSetPinyin('new',laneToken)");
  assert(paused.run("!laneData().recognized.includes('你')&&laneData().recognized.includes('好')&&lanePinyin('好').indexOf('<rt')===-1&&lanePinyin('你').includes('nǐ')"));
});
run("switchCourse('chinese-2','home');laneStart('meeting')");finishPrep(run);
run("laneHelp(laneToken);var m=laneScene('meeting');lanePick('choice',m.greet.answer,laneToken);var duplicate=laneToken;laneCheck(duplicate);laneCheck(duplicate);");
test('helped answer is saved once and earns no XP',()=>assert(run("laneData().runs.meeting.first[0]==='help'&&laneData().runs.meeting.xp===0&&state.activity[dayKey()].cards===1")));
const saved=Object.fromEntries(app.storage);
const reload=boot(saved), rr=reload.run;
test('a saved learner reaches Home and can resume feedback',()=>{assert.equal(rr('onboardingStep'),null);rr("laneStart('meeting')");assert.equal(rr('laneData().runs.meeting.feedback'),true);assert(reload.html().includes('Show translation')===false);});
rr("laneNext(laneToken);lanePick('add',0,laneToken);lanePick('add',1,laneToken);lanePick('remove',0,laneToken);navigate('home')");
test('tile reordering and pause survive a reload',()=>{const resumed=boot(Object.fromEntries(reload.storage));resumed.run("laneStart('meeting')");assert.equal(resumed.run("laneData().runs.meeting.tiles.join(',')"),'1');});
rr("switchCourse('chinese-1','home');laneStart('gate')");
test('returning to the beginner route resumes the reading checkpoint',()=>assert(rr("laneData().lessons.gate.at===1&&laneData().runs.gate.pos===0&&laneData().runs.gate.first[0]===null")));
rr("navigate('home');laneWelcome(true);laneWelcomeSkip(laneToken)");
test('replaying or skipping welcome preserves the profile and active runs',()=>assert(rr("state.profile.name==='Eric'&&state.companion.starter==='turtle'&&laneData().runs.meeting.pos===1")));
for (const script of ['simplified','traditional']) {
  const a=boot(), r=a.run;
  r("laneWelcomeSkip(laneToken);state.settings.script='"+script+"'");
  for(const course of ['chinese-1','chinese-2']){
    r("switchCourse('"+course+"','home')");
    const ids=Array.from(r('laneStops().map(s=>s.id)'));
    for(const id of ids){
      r("laneStart('"+id+"')");shot(a,script+'/'+id+'/characters');finishPrep(r);shot(a,script+'/'+id+'/start');
      test(script+'/'+id+' starts with four different tasks',()=>assert.equal(r('laneData().runs[laneSceneId].queue.join()'),'0,1,2,3'));
      r("var scene=laneScene(laneSceneId),current=laneData().runs[laneSceneId];lanePick('choice',(scene.greet.answer+1)%3,laneToken);laneCheck(laneToken)");
      test(id+' mistake is queued for a later revisit',()=>assert.equal(r('current.queue.join()'),'0,1,2,3,0'));
      r("laneNext(laneToken);scene.build.words.forEach((_,i)=>lanePick('add',i,laneToken));laneCheck(laneToken)");
      test(id+' sentence assembly is graded against the whole ordered sentence',()=>assert.equal(r('current.feedback'),true));
      r("laneNext(laneToken);lanePick('left',0,laneToken);lanePick('right',1,laneToken);for(let i=0;i<3;i++){lanePick('left',i,laneToken);lanePick('right',i,laneToken)}");
      test(id+' a corrected mismatched pair earns no first-try credit',()=>assert(r("current.first[2]==='miss'&&current.queue.join()==='0,1,2,3,0,2'")));
      r("laneNext(laneToken);lanePick('choice',scene.end.answer,laneToken);laneCheck(laneToken);laneNext(laneToken);lanePick('choice',scene.greet.answer,laneToken);laneCheck(laneToken);laneNext(laneToken);for(let i=0;i<3;i++){lanePick('left',i,laneToken);lanePick('right',i,laneToken)};var beforeXP=bx.xp;var oldToken=laneToken;laneNext(oldToken);laneNext(oldToken);laneRender()");
      test(id+' only one stamp is granted and re-rendering is credit-neutral',()=>assert(r('current.pos===current.queue.length&&laneData().stamps[laneSceneId].days===1&&bx.xp===beforeXP')));
      test(id+' conversation practice leaves individual character mastery alone',()=>assert.equal(r('Object.keys(state.cards).length'),0));
      shot(a,script+'/'+id+'/finish');
      const copy=boot(Object.fromEntries(a.storage));
      test(id+' earned stamp and XP survive profile validation',()=>assert(copy.run("laneData().stamps['"+id+"'].last===dayKey()&&laneData().runs['"+id+"'].xp>=0")));
    }
  }
  test(script+' all eight finished scenes stay accessible in both courses',()=>assert.equal(r("Object.keys(laneData().stamps).length"),8));
  r("laneData().stamps.cinema.next='2020-01-01'");
  test('a completed scene becomes eligible for spaced retrieval',()=>assert(r("laneDue().some(s=>s.id==='cinema')")));
  test('elapsed local-day practice and same-day replay use the capped ledger',()=>{
    r("const total=bx.xp;laneStart('cinema');const sc=laneScene('cinema');lanePick('choice',sc.greet.answer,laneToken);laneCheck(laneToken);");
    assert(r('labToday().xp<=120'));
    const before=r('bx.xp');r('laneCheck(laneToken)');assert.equal(r('bx.xp'),before);
  });
  test(script+' browser runtime mock logged no errors',()=>assert.deepEqual(a.errors,[]));
}
const classApp=boot(), c=classApp.run;
c("laneWelcomeNext(laneToken);laneWelcomeNext(laneToken);trailSetupPick('intent','class',trailViewToken);trailSetupNext(trailViewToken);trailSetupPick('course','chinese-2',trailViewToken);trailSetupPick('lesson','c2-13',trailViewToken);trailSetupNext(trailViewToken);trailSetupNext(trailViewToken)");
test('class learners start their actual chapter and can pause a character trail',()=>assert(c("currentView==='trail'&&trailRun().lesson==='c2-13'&&selectedCourseId==='chinese-2'")));
c("while(!trailRun().done){const r=trailRun(),s=trailStep(),args=[r.id,r.pos,trailViewToken];if(s.kind==='choose'&&!r.feedback)trailChoose(s.ch,...args);else if(s.kind==='recall'&&!r.revealed)trailReveal(...args);else if(s.kind==='recall'&&!r.feedback)trailRate('good',...args);else trailNext(...args)}");
test('a full character trail finishes with scheduled character reviews',()=>assert(c('trailRun().done&&Object.values(state.cards).some(s=>s.due>Date.now())')));
const cross=boot(), cx=cross.run;
cx("laneWelcomeSkip(laneToken);startSession('all','1',['你']);checkpointCurrent();navigate('home')");
test('a paused chapter precedes the conversation in reading and tab order',()=>assert(cross.html().indexOf('class="rx-home-start"')<cross.html().indexOf('class="ln-home"')));
cx("laneStart('gate')");finishPrep(cx);cx("laneHelp(laneToken)");
test('revealing an overlapping translation marks the paused chapter as assisted',()=>assert(cx("savedResume.data.usedHint===true")));
cx("navigate('home');laneStart('tea')");finishPrep(cx);cx("navigate('tools');personalMarkAssistance('茶 · tea');laneStart('tea')");
test('using a matching lookup during a paused conversation is recorded as help',()=>assert(cx("laneData().runs.tea.helped")));
const corrupt=boot().run;
test('malformed queues and foreign scene keys are discarded on import',()=>assert.equal(corrupt("Object.keys(laneValidate({runs:{fake:laneNewRun(1),gate:{...laneNewRun(1),queue:['0',1,2,3]}}}).runs).length"),0));
test('traditional food and meeting characters have independent spellings',()=>{corrupt("state.settings.script='traditional'");assert.equal(corrupt("laneZh('一碗面，见面，面条')"),'一碗麵，見面，麵條');});
test('pre-update in-flight conversations and completed stamps migrate independently',()=>{
  const legacy={runs:{gate:{...JSON.parse(corrupt('JSON.stringify(laneNewRun(17))')),pos:1,tiles:[1]}},stamps:{tea:{last:'2026-11-12',next:'2026-11-13',days:1}}};
  assert(corrupt(`(()=>{const d=laneValidate(${JSON.stringify(legacy)});return d.runs.gate.pos===1&&d.runs.gate.tiles[0]===1&&d.lessons.gate.at===laneLessonSteps('gate').length&&d.lessons.tea.at===laneLessonSteps('tea').length&&d.pinyin==='new'})()`));
});
test('all prompts, options, feedback and rehearsal have readings for every Chinese token',()=>{
  assert(corrupt(`LANE_SCENES.every(s=>[s.greet.line,s.end.line,...s.greet.choices,...s.end.choices,s.greet.why,s.end.why,s.build.why,...s.build.words,...s.build.extras,...s.pairs.map(p=>p[0]),...LANE_CHAPTERS[s.id].flat()].every(line=>laneTokens(line).every(w=>!/[一-鿿]/.test(w)||LANE_WORDS.has(w))))`));
});
test('pinyin modes use lexical boundaries, familiar cards and traditional script',()=>{
  corrupt("laneData().recognized=['苹果'];state.cards['我']={memoryStage:2};laneData().pinyin='new'");
  assert(corrupt("lanePinyin('我买苹果').includes('mǎi')&&!lanePinyin('我买苹果').includes('píngguǒ')&&!lanePinyin('我买苹果').includes('wǒ')&&lanePinyin('我买苹果').includes('蘋果')"));
  corrupt("laneData().pinyin='all'");assert(corrupt("lanePinyin('我买苹果').includes('píngguǒ')&&lanePinyin('我买苹果').includes('wǒ')"));
  corrupt("laneData().pinyin='none'");assert.equal(corrupt("lanePinyin('我买苹果。')"),'我買蘋果。');
});
test('an existing learner can review prerequisites and return to the same conversation turn',()=>{
  rr("switchCourse('chinese-2','home');laneStart('meeting');laneReviewLesson(laneToken);laneLessonNext(laneToken);navigate('home');laneStart('meeting')");
  assert(rr("laneData().lessons.meeting.at===1&&laneData().runs.meeting.tiles[0]===1"));finishPrep(rr);
  assert(rr("laneLive(laneToken).q===1&&laneLive(laneToken).r.tiles[0]===1"));
});
const folder=path.join(__dirname,'results');fs.mkdirSync(folder,{recursive:true});
fs.writeFileSync(path.join(folder,'lantern-lane-views.json'),JSON.stringify(views));
fs.writeFileSync(path.join(folder,'lantern-lane.json'),JSON.stringify({checks:checks.length,failed:0}));
console.log(JSON.stringify({checks:checks.length,failed:0,views:views.length}));
