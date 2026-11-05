const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');const {boot}=require('./runtime.cjs');const app=boot(),r=app.run,views=[];let checks=0;
r("onboardingStep=null;state.profile.setupDone=true;closeModal();state.settings.soundEffects=false;window.HanziWriter={create(){return {cancelQuiz(){},pauseAnimation(){},quiz(){return Promise.resolve()}}}};for(const c of allUniqueCards())state.cards[c.character]={seen:2,streak:2,interval:3,due:Date.now()+86400000,last:Date.now()-86400000,memoryStage:2}");
for(const course of ['chinese-1','chinese-2'])for(const script of ['simplified','traditional']){
 r(`switchCourse('${course}');state.settings.script='${script}'`);
 for(const lesson of r('currentCourse().lessons'))for(const mode of r("Object.keys(LAB_MODES).filter(m=>m!=='deck')")){
  if(!r(`labStart('${mode}','${lesson}')`))continue;
  for(const correct of [true,false]){r(`labRun.feedback={correct:${correct},helped:false,chosen:0,xp:0};renderLabRun()`);assert(app.html().includes('lab-answer-feedback'));checks++;views.push({name:course+'/'+script+'/'+lesson+'/'+mode+'/feedback-'+correct,html:app.html()})}
  r('labRun.pos=labRun.queue.length;labRun.done=true;renderLabRun()');assert(app.html().includes('Run complete'));checks++;views.push({name:course+'/'+script+'/'+lesson+'/'+mode+'/complete',html:app.html()});
 }
}
r("switchCourse('chinese-1');state.settings.script='simplified';labData().stamps=100;starterPreview='dragon';chooseStarter();for(const a of LAB_ABILITIES)labData().abilities.dragon=LAB_ABILITIES.map(x=>x.id);for(const h of ['grove','pond','lanterns']){labData().unlocked.push(h);labData().habitat=h;renderLabCamp()}");
for(const h of ['grove','pond','lanterns']){r(`labData().habitat='${h}';labData().decor=['bamboo','lantern','stones'];renderLabCamp()`);views.push({name:'camp/'+h,html:app.html()})}
for(const ch of ['你','朋','谢']){r(`labOpenPaper('${ch}');labPaper.strokes=[[[.2,.2],[.8,.8]],[[.8,.2],[.2,.8]]];labPaper.model=true;renderLabPaper();labArchiveDrawing()`);views.push({name:'paper/'+ch,html:app.html()})}
r("labData().images['你']='data:image/png;base64,aGVsbG8=';renderLabAlbum()");views.push({name:'album/populated',html:app.html()});r("labImportDeck('chinese,pinyin,english,traditional,context\\n朋友,péngyou,friend,朋友,他是我的朋友。\\n学校,xuéxiào,school,學校,我去学校。','Personal deck');labPreviewDeck(labData().decks[0].id)");views.push({name:'deck/browse',html:app.nodes.get('overlay').innerHTML});r("closeModal();labStart('deck','1',{deck:labData().decks[0].id})");views.push({name:'deck/recall',html:app.html()});
assert.deepEqual(app.errors,[]);fs.writeFileSync(path.join(__dirname,'results','practice-feedback-views.json'),JSON.stringify(views));console.log(JSON.stringify({checks,views:views.length,failed:0}));
