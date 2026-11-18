// Exercise the shipped modules, storage validation, route selection and reward ledger.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {boot} = require('./runtime.cjs');
const checks = [], views = [];
function test(label, run) { run(); checks.push(label); }
function shot(a, name) { views.push({name:'lantern/'+name,html:a.html()}); }
const app=boot(), run=app.run, overlay=()=>app.nodes.get('overlay').innerHTML;
test('fresh start is a playable greeting with a skip action',()=>{assert.equal(run('onboardingStep'),'lane-welcome');assert(overlay().includes('Say hello to Lin.'));assert(overlay().includes('Explore the app'));});
run("var initialXP=bx.xp;var firstToken=laneToken;laneWelcomePick(1,laneToken);laneWelcomePick(0,firstToken);laneWelcomeCheck(laneToken)");
test('wrong opening reply shows a specific correction',()=>{assert.equal(run('laneWelcomeDraft.feedback'),false);assert(overlay().includes('thank you'));assert.equal(run('bx.xp'),run('initialXP'));});
run('laneWelcomeRetry(laneToken);laneWelcomePick(0,laneToken);laneWelcomeCheck(laneToken);laneWelcomeNext(laneToken)');
test('the first win leads to route choice without writing a mastery record',()=>{assert.equal(run('onboardingStep'),'trail');assert.equal(run('Object.keys(state.cards).length'),0);});
run("trailSetupNext(trailViewToken);trailSetupPick('course','chinese-2',trailViewToken);trailSetupNext(trailViewToken);trailSetupName('Eric',trailViewToken);trailSetupPick('starter','turtle',trailViewToken);trailSetupNext(trailViewToken)");
test('course, name and companion choices reach the matching route',()=>assert(run("selectedCourseId==='chinese-2'&&laneSceneId==='meeting'&&currentView==='lane'&&state.profile.name==='Eric'&&state.companion.starter==='turtle'")));
run("laneHelp(laneToken);var m=laneScene('meeting');lanePick('choice',m.greet.answer,laneToken);var duplicate=laneToken;laneCheck(duplicate);laneCheck(duplicate);");
test('helped answer is saved once and earns no XP',()=>assert(run("laneData().runs.meeting.first[0]==='help'&&laneData().runs.meeting.xp===0&&state.activity[dayKey()].cards===1")));
const saved=Object.fromEntries(app.storage);
const reload=boot(saved), rr=reload.run;
test('a saved learner reaches Home and can resume feedback',()=>{assert.equal(rr('onboardingStep'),null);rr("laneStart('meeting')");assert.equal(rr('laneData().runs.meeting.feedback'),true);assert(reload.html().includes('Show translation')===false);});
rr("laneNext(laneToken);lanePick('add',0,laneToken);lanePick('add',1,laneToken);lanePick('remove',0,laneToken);navigate('home')");
test('tile reordering and pause survive a reload',()=>{const resumed=boot(Object.fromEntries(reload.storage));resumed.run("laneStart('meeting')");assert.equal(resumed.run("laneData().runs.meeting.tiles.join(',')"),'1');});
rr("switchCourse('chinese-1','home');laneStart('gate')");
test('a coached greeting continues at the next actual exercise',()=>assert(rr("laneData().runs.gate.pos===1&&laneData().runs.gate.first[0]==='help'")));
rr("navigate('home');laneWelcome(true);laneWelcomeSkip(laneToken)");
test('replaying or skipping welcome preserves the profile and active runs',()=>assert(rr("state.profile.name==='Eric'&&state.companion.starter==='turtle'&&laneData().runs.meeting.pos===1")));
for (const script of ['simplified','traditional']) {
  const a=boot(), r=a.run;
  r("laneWelcomeSkip(laneToken);state.settings.script='"+script+"'");
  for(const course of ['chinese-1','chinese-2']){
    r("switchCourse('"+course+"','home')");
    const ids=Array.from(r('laneStops().map(s=>s.id)'));
    for(const id of ids){
      r("laneStart('"+id+"')");shot(a,script+'/'+id+'/start');
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
c("laneWelcomePick(0,laneToken);laneWelcomeCheck(laneToken);laneWelcomeNext(laneToken);trailSetupPick('intent','class',trailViewToken);trailSetupNext(trailViewToken);trailSetupPick('course','chinese-2',trailViewToken);trailSetupPick('lesson','c2-13',trailViewToken);trailSetupNext(trailViewToken);trailSetupNext(trailViewToken)");
test('class learners start their actual chapter and can pause a character trail',()=>assert(c("currentView==='trail'&&trailRun().lesson==='c2-13'&&selectedCourseId==='chinese-2'")));
c("while(!trailRun().done){const r=trailRun(),s=trailStep(),args=[r.id,r.pos,trailViewToken];if(s.kind==='choose'&&!r.feedback)trailChoose(s.ch,...args);else if(s.kind==='recall'&&!r.revealed)trailReveal(...args);else if(s.kind==='recall'&&!r.feedback)trailRate('good',...args);else trailNext(...args)}");
test('a full character trail finishes with scheduled character reviews',()=>assert(c('trailRun().done&&Object.values(state.cards).some(s=>s.due>Date.now())')));
const cross=boot(), cx=cross.run;
cx("laneWelcomeSkip(laneToken);startSession('all','1',['你']);checkpointCurrent();navigate('home')");
test('a paused chapter precedes the conversation in reading and tab order',()=>assert(cross.html().indexOf('class="rx-home-start"')<cross.html().indexOf('class="ln-home"')));
cx("laneStart('gate');laneHelp(laneToken)");
test('revealing an overlapping translation marks the paused chapter as assisted',()=>assert(cx("savedResume.data.usedHint===true")));
cx("navigate('home');laneStart('tea');navigate('tools');personalMarkAssistance('茶 · tea');laneStart('tea')");
test('using a matching lookup during a paused conversation is recorded as help',()=>assert(cx("laneData().runs.tea.helped")));
const corrupt=boot().run;
test('malformed queues and foreign scene keys are discarded on import',()=>assert.equal(corrupt("Object.keys(laneValidate({runs:{fake:laneNewRun(1),gate:{...laneNewRun(1),queue:['0',1,2,3]}}}).runs).length"),0));
test('traditional food and meeting characters have independent spellings',()=>{corrupt("state.settings.script='traditional'");assert.equal(corrupt("laneZh('一碗面，见面，面条')"),'一碗麵，見面，麵條');});
const folder=path.join(__dirname,'results');fs.mkdirSync(folder,{recursive:true});
fs.writeFileSync(path.join(folder,'lantern-lane-views.json'),JSON.stringify(views));
fs.writeFileSync(path.join(folder,'lantern-lane.json'),JSON.stringify({checks:checks.length,failed:0}));
console.log(JSON.stringify({checks:checks.length,failed:0,views:views.length}));
