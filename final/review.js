// Each objective item stores the correct choice first. Choices rotate for display.
const sections = [
 ['Lesson review & measure words',35],['Word insertion',5],['Reading comprehension',13],['English to Chinese',9],['Sentence structures',8],['Two compositions',30]
];
const measures=[
 ['我家有三＿人。','口','家里的人用「口」。'],['这＿老师姓王。','位','位 is a respectful classifier for people.'],['那＿苹果很甜。','个','Use 个 for an apple.'],['我买了一＿矿泉水。','瓶','A bottle of water takes 瓶.'],['请给我一＿热茶。','杯','A cup of tea takes 杯.'],['今天有两＿中文课。','节','Count class periods with 节.'],['她买了一＿玫瑰花。','枝','枝 counts individual stems.'],['请给我一＿纸。','张','Use 张 for flat sheets.'],['我读了两＿文章。','篇','Use 篇 for articles.'],['他写了一＿信。','封','Use 封 for letters.']
];
const bank=[[
 ...measures.map(([q,a,e],i)=>[q,a,measures[(i+3)%10][1],measures[(i+6)%10][1],e]),
 ['我＿有两个妹妹。 (also)','也','都','才','也 goes before 有 to add a similar fact.'],
 ['How do you say “Not all of them drink tea”?','他们不都喝茶。','他们都不喝茶。','他们都喝茶。','不都 means not all. 都不 means none.'],
 ['Choose the natural description.','今天很冷。','今天是很冷。','今天冷是。','An adjective can be the predicate. 很 commonly goes before it.'],
 ['Choose the alternative question.','你喝茶还是喝水？','你还是喝茶喝水吗？','你喝茶和水还是？','Place 还是 between alternatives.'],
 ['Choose the natural time order.','星期五下午三点','三点星期五下午','下午三点星期五','Go from the larger unit to the smaller one.']
],[
 ['Where does 才 go?  我 A 昨天 B 九点 C 到家 D。','C','B','D','我昨天九点才到家。才 follows the time and suggests it was late.'],
 ['Where does 在 go?  我 A 明天 B 图书馆 C 看书 D。','B','A','C','我明天在图书馆看书。Time, location, then action.'],
 ['Where does 得 go?  她 A 写字 B 写 C 很好 D。','C','B','D','她写字写得很好。Repeat 写 after its object before 得.'],
 ['Where does 正在 go?  我 A 的 B 妹妹 C 看书 D。','C','B','D','我的妹妹正在看书。正在 comes just before the ongoing action.']
],[
 ['小王平常坐车上学。今天他七点就到了学校，可是教室里一个人也没有。他看了看手机，才发现今天是星期六。 Why was the room empty?','今天是星期六。','他忘了带手机。','大家都在车上。','He checks his phone and realizes it is Saturday.'],
 ['小林本来想买两杯茶。她只带了十块钱，一杯茶六块。她买了一杯，剩下的钱留着坐车。 How much money did she keep?','四块','两块','六块','She spent six of her ten yuan on one cup.'],
 ['妹妹一到家就给哥哥打电话。哥哥正在上课，没接。下课以后，他才给妹妹打电话。 Who called after class?','哥哥','妹妹','老师','妹妹 called first. 哥哥 returned the call after class.']
],[
 ['I didn’t watch TV yesterday.','我昨天没看电视。','我昨天不看了电视。','我没昨天电视看。','Use 没 before the verb for a past action that did not happen.'],
 ['I studied Chinese for two hours.','我学中文学了两个小时。','我两个小时才学中文。','我两点学中文。','两个小时 expresses duration. 两点 is a clock time.'],
 ['She is taller than I am.','她比我高。','我比她高。','她比我很高。','The person before 比 is being compared with the person after it.'],
 ['I have been to Beijing three times.','我去过三次北京。','我去北京三个小时。','我三点去北京。','次 counts occurrences. 小时 measures duration.']
],[],[]];
bank[0].push(
 ['Ask who owns this book.','这是谁的书？','这本书的谁？','这是谁书吗？','Place 谁 where the owner would appear, followed by 的.'],
 ['Ask what time a friend goes to class.','你几点上课？','几点你吗上课？','你几点上课吗？','The question word replaces the time.'],
 ['Ask whether someone has a bike using an affirmative-negative question.','你有没有自行车？','你有不有自行车吗？','你没有有自行车？','有 pairs with 没有 in this question form.'],
 ['How do you say “two teachers” politely?','两位老师','二口老师','两张老师','Use 两 before the classifier 位.'],
 ['I use chopsticks to eat.','我用筷子吃饭。','我跟筷子吃饭。','我给筷子吃饭。','用 introduces the tool. 跟 introduces a companion. 给 can introduce a recipient.'],
 ['Choose the polite request to take a quick look.','请看一下。','请一下看。','看请一下。','Put 一下 after the verb to soften the request.'],
 ['Choose the sentence meaning “Don’t go today.”','今天别去。','今天不别去。','今天没去。','别 before a verb gives a negative instruction.'],
 ['Choose the logical warning.','快走吧，要不然会迟到。','快走吧，除了会迟到。','快走吧，还是会不会。','要不然 introduces what could happen otherwise. 吧 softens the suggestion.'],
 ['Which reply asks the same question back?','我很好，你呢？','我很好，你的？','我很好，你吗呢？','呢 after a person invites their answer to the same question.'],
 ['Give a reason and its result.','因为今天下雨，所以我没去公园。','所以今天下雨，因为我没去公园。','今天下雨和我没去公园。','因为 gives the reason and 所以 introduces the result.']
);
const patterns=[
 ['得','How well does your friend speak Chinese?','她说中文说得很好。','Repeat the verb after its object, then add 得 and a description.'],
 ['了','What did you buy yesterday?','我昨天买了一本书。','Mark the completed purchase with 了.'],
 ['才','You arrived later than expected. When?','我十点才到学校。','Put the late time before 才.'],
 ['就','You arrived early. When?','我七点就到学校了。','Put the early time before 就.'],
 ['能、会、可以','Say what you know how to do and ask permission to do it here.','我会游泳。我可以在这儿游泳吗？','会 marks a learned skill. 可以 asks permission. 能 can express ability or circumstances.'],
 ['一边…一边…','Which two things do you do at the same time?','我一边听音乐一边写字。','Give two simultaneous actions by the same person.'],
 ['正在','What is your roommate doing right now?','他正在看书。','Put 正在 before the ongoing action.'],
 ['除了…以外，还…','What do you study besides Chinese?','除了中文以外，我还学数学。','Add a second item with 还.'],
 ['有一点','How does this coat fit?','这件衣服有一点小。','Put 有一点 before the adjective.'],
 ['…是…，可是…','You like a coat but it costs too much.','好看是好看，可是太贵了。','Repeat the description around 是, then add the reservation.'],
 ['比','Compare today’s weather with yesterday’s.','今天比昨天冷。','Place the comparison standard after 比.'],
 ['多 / 少 + verb','Give someone advice about sleep and coffee.','你应该多睡觉，少喝咖啡。','Place 多 or 少 before the action.'],
 ['一…也没…','Say you bought zero books yesterday.','我昨天一本书也没买。','Use 一 plus classifier and noun before 也没.'],
 ['一…就…','What do you do as soon as you get home?','我一到家就吃饭。','Give a trigger after 一 and its immediate result after 就.'],
 ['是…的','Emphasize when you arrived in Beijing.','我是昨天到北京的。','Frame the detail of a known past event with 是…的.'],
 ['把','Ask a friend to put the book on the table.','请把书放在桌子上。','Name the object after 把 and give the resulting location.'],
 ['越来越','How has the weather been changing?','天气越来越冷了。','Place the changing quality after 越来越.'],
 ['Duration','How long did you sleep last night?','我昨天晚上睡了八个小时。','Give a length of time after the action.'],
 ['Frequency','How many times did you call yesterday?','我昨天打了三次电话。','Use a number plus 次 to count actions.']
];
bank[4]=patterns.map(([form,q,model,check])=>[q+' Use '+form+'.',model,check]);
bank[5]=[
 ['Write about a busy school day. Tell when and where you studied, what you did at the same time, how long you studied, and what happened afterward.','昨天我八点就到学校了。上午我在图书馆学了两个小时的中文。我一边听录音一边写汉字。下课以后，我跟同学去吃饭了。','Check the time and location order, 一边…一边…, a duration, and a completed action.'],
 ['Write a message to a friend planning a weekend outing. Compare two options, explain your choice, and say what you will do if the weather changes.','我们星期六去公园吧！公园比商场安静。我想跟你一边走一边聊天。要是下雨，我们就去我家看电影，好吗？','Check the comparison with 比, your reason, a conditional plan, and a closing question.']
];
const key='chinese.chi604.review.v1';
let saved={};
try {saved=JSON.parse(localStorage.getItem(key))||{};if(typeof saved!=='object'||Array.isArray(saved))saved={}}catch{}
function persist(){try{localStorage.setItem(key,JSON.stringify(saved))}catch{document.querySelector('#save-status').textContent='Browser storage is unavailable. Keep this tab open.'}}
let section=Number.isInteger(saved.section)&&bank[saved.section]?saved.section:0;
const topics=document.querySelector('#topics'), work=document.querySelector('#work');
const field=(s,i)=>s+'-'+i;
function record(i){const k=field(section,i);return saved[k]&&typeof saved[k]==='object'?saved[k]:(saved[k]={})}
function render(){
 Prep.transition(work);
 topics.replaceChildren(...sections.map(([name,weight],s)=>{
 const btn=document.createElement('button');btn.innerHTML='<small>Part '+(s<4?'I':'II')+' · '+weight+'%</small>'+name;
 btn.setAttribute('aria-pressed',String(s===section));btn.onclick=()=>{document.querySelector('#exam-sections').open=false;section=s;saved.section=s;persist();render();focusWork()};return btn}));
 const rows=bank[section], pos='position'+section;
 let i=saved[pos];if(!Number.isInteger(i)||i<0||i>rows.length)i=0;
 const done=rows.filter((_,j)=>record(j).passed===true).length;
 if(i===rows.length){
 const upcoming=bank.findIndex((questions,s)=>questions.some((_,j)=>saved[field(s,j)]?.passed!==true));
 work.innerHTML='<small>SECTION REVIEW</small><h2>'+sections[section][0]+'</h2><p>'+done+' of '+rows.length+' marked correct or self-checked.</p><div class="controls jy-dock"></div>';
 const controls=work.querySelector('.controls');
 function restartSection(){
  rows.forEach((_,j)=>{const a=record(j);delete a.passed;delete a.checked;delete a.answer});
  saved[pos]=0;persist();render();focusWork();
 }
 if(done<rows.length){
  button(controls,'Continue · revisit missed items',()=>{
   rows.forEach((_,j)=>{const a=record(j);if(!a.passed){delete a.answer;delete a.checked}});
   saved[pos]=rows.findIndex((_,j)=>!record(j).passed);persist();render();focusWork();
  },true);
 }else if(upcoming>=0){
  button(controls,'Continue · '+sections[upcoming][0],()=>topics.children[upcoming].click(),true);
  button(controls,'Practice this section again',restartSection);
 }else{
  const message=document.createElement('p');message.textContent='You’ve completed all six exam sections.';controls.append(message);
  button(controls,'Practice this section again',restartSection,true);
 }
 return}
 const row=rows[i],a=record(i),written=section>=4;
 work.innerHTML='<small>'+sections[section][0]+' · '+(i+1)+' / '+rows.length+'</small><h2>'+row[0]+'</h2><div class="answers"></div><div class="feedback" aria-live="polite"></div><div class="controls jy-dock"></div>';
 const answers=work.querySelector('.answers'),feedback=work.querySelector('.feedback'),controls=work.querySelector('.controls');
 function button(parent,label,action,primary=false,command=primary?'advance':null){
  const b=document.createElement('button');b.textContent=label;b.className=primary?'btn primary':'btn';
  b.onclick=action;parent.append(b);return Prep.bind(b,command);
 }
 function advance(){let n=i+1;while(n<rows.length&&record(n).passed)n++;saved[pos]=n;persist();render();focusWork()}
 if(written){
 answers.innerHTML='<label for="draft">Your answer in Chinese</label><textarea id="draft" lang="zh-Hans"></textarea><details><summary>Character-only word bank</summary><p>学校　同学　老师　图书馆　写字　中文　学习　上课　小时　昨天　周末　公园　天气　下雨　朋友　电影　商场　安静</p></details>';
 Prep.bind(answers.querySelector('summary'),'hint');
 const input=answers.querySelector('textarea');input.value=typeof a.draft==='string'?a.draft:'';input.oninput=()=>{a.draft=input.value;persist()};
 if(!a.checked){const check=button(controls,'Compare my answer',()=>{a.checked=true;persist();render()},true);check.disabled=!input.value.trim();input.addEventListener('input',()=>check.disabled=!input.value.trim())}
 else{feedback.innerHTML='<aside><strong>One possible answer</strong><p lang="zh-Hans">'+row[1]+'</p>'+row[2]+'</aside>';for(const [label,pass] of [['Needs practice',false],['I used the structure',true]])button(controls,label,()=>{a.passed=pass;advance()},pass,pass?'3':'1')}
 }else{
 const opts=row.slice(1,4);const shift=(i+section+1)%3;
 for(let j=0;j<3;j++){const answer=opts[(j+shift)%3];const b=button(answers,answer,()=>{a.answer=answer;a.passed=answer===row[1];persist();render();focusWork()},false,String(j+1));b.disabled=!!a.answer;
  if(a.answer && answer===row[1])b.classList.add('is-answer');
  else if(a.answer===answer)b.classList.add('is-missed');}
 if(a.answer){feedback.innerHTML='<aside><strong>'+(a.passed?'Correct':'Review this one')+'</strong><p>'+row[1]+'</p>'+row[4]+'</aside>';button(controls,i===rows.length-1?'Section results':'Continue',advance,true)}
 }
}
function focusWork(){work.focus();work.scrollIntoView({block:'start'})}
render();
