const {boot}=require('./runtime.cjs');const fs=require('node:fs'),path=require('node:path');const app=boot(),r=app.run;const views=[],errors=[];
function capture(name,code,overlay=false){try{r(code);const html=overlay?app.nodes.get('overlay').innerHTML:app.html();if(!html)throw Error('Empty view');views.push({name,html})}catch(e){errors.push({name,error:e.stack})}}
r("state.profile.setupDone=true;onboardingStep=null;closeModal();starterPreview='dragon';chooseStarter();state.settings.soundEffects=false;");
for(const script of ['simplified','traditional'])for(const course of ['chinese-1','chinese-2']){
 r(`switchCourse('${course}');state.settings.script='${script}';closeModal()`);
 for(const page of ['home','learn','tools','review','search','settings','arcade','stats','read','write','common'])capture(script+'/'+course+'/'+page,`writeSession=null;navigate('${page}')`);
 for(const id of r('courseChapters().map(c=>c[0])'))for(const tab of ['cards','quiz','read','write'])capture(script+'/'+id+'/'+tab,`openChapter('${id}');chapterTab('${tab}')`);
 for(const id of r('courseReadings().map(r=>r.id)'))for(const focus of [false,true])capture(script+'/'+id+'/focus-'+focus,`rxDesk().focus=${focus};openReading('${id}')`);
 const cards=course==='chinese-2'?r('uniqueCards().map(c=>c.character)'):['八','人','你','得','还','行','片','想','国','长'];
 for(const ch of cards)for(const tab of ['usage','shape','sound'])capture(script+'/'+course+'/'+ch+'/'+tab,`currentView='home';openCleanStudy('${ch}','${tab}')`,true);
 r("closeModal();currentView='home'");
 for(const tab of ['overview','badges','finals'])capture(script+'/'+course+'/companion-'+tab,`openJourney('${tab}')`);
}
fs.mkdirSync(path.join(__dirname,'results'),{recursive:true});fs.writeFileSync(path.join(__dirname,'results','views.json'),JSON.stringify(views));fs.writeFileSync(path.join(__dirname,'results','view-errors.json'),JSON.stringify({count:views.length,errors:[...errors,...app.errors]},null,2));
console.log(JSON.stringify({views:views.length,errors:errors.length+app.errors.length}));if(errors.length||app.errors.length)process.exitCode=1;
