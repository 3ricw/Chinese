/* Original picture cues. These are modern memory aids, not etymology claims.
   Art appears only while studying or looking up; recall keeps the plain form.
   This module stores no learning records and grants no rewards. */
const VM_CUES={
 '八':['numbers','eight',8,'Two strokes open out. Count eight lights, then remember just those two strokes.'],
 '贝':['things','shell','shell','Picture a little shell. Notice the box above and the two legs below.'],
 '寸':['things','inch','ruler','Picture a small measure. Keep the long line, hook, and separate dot in mind.'],
 '大':['people','big','big','The arms reach out wide. Notice how the two lower strokes spread apart.'],
 '刀':['things','knife','knife','Imagine a small blade. Follow the bent outer edge and the shorter stroke inside.'],
 '耳':['people','ear','ear','Picture an ear beside a face. Notice the two long sides and the lines between them.'],
 '二':['numbers','two',2,'Two level strokes: the lower one stretches a little farther.'],
 '戈':['things','dagger-axe','axe','Use a long-handled tool as the cue. Notice the crossing stroke and the separate dot.'],
 '工':['things','work','work','Picture a sturdy workbench. Two level surfaces connect through one upright.'],
 '弓':['things','bow','bow','Picture a bow. Track the stepped bends before looking at the whole outline.'],
 '火':['nature','fire','fire','Picture a small flame. Find the central strokes and the two sparks at the sides.'],
 '金':['things','metal','metal','Picture a few metal pieces. Notice the cap, the middle lines, and the dots below.'],
 '九':['numbers','nine',9,'Count nine lights. Then notice the slant and the long bent stroke in 九.'],
 '口':['people','mouth','mouth','Picture a mouth opening. Remember one compact, closed outline.'],
 '力':['people','power','power','Picture lifting a weight. Notice the bent stroke and the slant passing through.'],
 '六':['numbers','six',6,'Six lights surround the form. Notice the dot, the level stroke, and the two lower marks.'],
 '马':['nature','horse','horse','Picture a horse beside the written form. Switch off the picture to compare the actual strokes.'],
 '门':['things','door','door','Picture an open doorway. Compare the outer frame with the space inside.'],
 '糸':['things','fine silk','silk','Picture a loop of fine thread. Track the upper turns and the small marks below.'],
 '木':['nature','tree','tree','Picture a tree: a tall middle, branches spreading out, and roots below.'],
 '目':['people','eye','eye','Picture a watchful eye. Notice the two small spaces inside the tall outline.'],
 '女':['people','woman','person','Use a person as the cue. Notice the crossing strokes and the broad final line.'],
 '七':['numbers','seven',7,'Count seven lights. Then notice the long crossing stroke and the lower turn.'],
 '人':['people','person','person','Picture someone standing. Two strokes lean apart from one meeting point.'],
 '日':['nature','sun','sun','Picture daylight. Find the single dividing line inside the outer shape.'],
 '三':['numbers','three',3,'Three level strokes. Compare their lengths instead of treating them as identical lines.'],
 '食':['things','food','food','Picture a bowl ready to eat. Notice the roof-like top and the stacked shape below.'],
 '十':['numbers','ten',10,'Ten lights make a small group. The written form needs only one crossing.'],
 '示':['things','show','sign','Picture a small display sign. Notice the level lines above the spreading lower marks.'],
 '手':['people','hand','hand','Picture a hand reaching forward. Notice the crossing lines and the long central hook.'],
 '水':['nature','water','water','Picture water spreading from the middle. Follow the central line and the side strokes.'],
 '四':['numbers','four',4,'Count four lights. Then look at the outer frame and the small shape inside.'],
 '田':['nature','field','field','Picture four plots in a field. One crossing divides the outer square.'],
 '土':['nature','earth','earth','Picture layers of earth. The lower line is longer than the one above.'],
 '囗':['things','enclosure','enclosure','Picture a boundary around an empty space. Compare this larger enclosure with 口.'],
 '五':['numbers','five',5,'Count five lights, then follow the corners and level strokes of the written form.'],
 '夕':['nature','sunset','sunset','Picture the evening sky. Notice the sloping outline and the dot inside it.'],
 '小':['people','small','small','Picture three small stones. Remember the narrow middle and the two separate side marks.'],
 '心':['people','heart','heart','Picture a heartbeat. Notice the low curved stroke and the separate dots.'],
 '言':['people','speech','speech','Picture a short conversation. A small mouth shape sits under several level lines.'],
 '幺':['things','tiny','silk','Picture a tiny knot of thread. Notice the compact turns in the written form.'],
 '衣':['things','clothing','clothing','Picture a coat on a hanger. Notice the dot at the top and the spreading lower strokes.'],
 '一':['numbers','one',1,'One light, one level stroke. Keep the written line simple.'],
 '又':['people','again; hand component','hand','Use a reaching hand as a cue. Watch where the two main strokes cross.'],
 '雨':['nature','rain','rain','Picture rain below a cloud. Notice the drops held inside the written frame.'],
 '月':['nature','moon','moon','Picture a moonlit night. Notice the tall sides and the two shorter lines inside.'],
 '隹':['nature','short-tailed bird','bird','Picture a small bird. Notice the narrow left side and the stacked lines on the right.'],
 '子':['people','child','child','Picture a child reaching out. Notice the top turn, long hook, and crossing line.'],
 '走':['people','walk','walk','Picture a winding walk. Notice the upper crossing and the long lower sweep.'],
 '足':['people','foot','foot','Picture a footprint. Remember the small upper box and the larger lower shape.'],
 '车':['things','vehicle','vehicle','Picture a little streetcar. Compare the whole written form after hiding the scene.'],
 '鱼':['nature','fish','fish','Picture a fish moving through water. Notice the stacked sections of the written form.'],
 '明':['nature','bright','bright','日 and 月 sit side by side. Use a sunny day and a moonlit night as the cue.'],
 '休':['people','rest','rest','亻 sits beside 木. Picture someone pausing in the shade of a tree.'],
 '本':['nature','root','root','Picture the base of a tree. Notice the short mark low on the written form.'],
 '末':['nature','end','tip','Picture the tip of a tree. Compare the long upper mark with the lower mark in 本.'],
 '雪':['nature','snow','snow','Picture flakes falling from a cloud. Notice the broad top and the smaller shape below.'],
 '好':['people','good','greeting','女 and 子 sit side by side. Use a friendly greeting as a memory cue.'],
 '男':['people','male','harvest','田 is above 力. Picture someone lifting a basket beside a field.']
};
const VM_COLORS={nature:['#D8EACF','#428069','#B3D6C9'],people:['#F4DCCB','#AC624E','#ECC29C'],things:['#DCE3F5','#6B70AC','#BDC7E9'],numbers:['#F2E7C8','#9E783A','#DCC18A']};
let vmSerial=0,vmFilter='all',vmLimit=12;
function vmCard(ch){return courseCard(ch)||cardByChar[ch]||extra[ch]}
function vmCue(ch){return Object.prototype.hasOwnProperty.call(VM_CUES,ch)&&vmCard(ch)?VM_CUES[ch]:null}
function vmScene(kind,color,soft){
 const paths={
  tree:`<path d="M80 180V99m-34 50 34-27 34 27"/><path d="M220 188V91m-32 51 32-28 31 28"/><circle cx="80" cy="102" r="48" fill="${color}" stroke="none"/><circle cx="220" cy="92" r="55" fill="${soft}" stroke="none"/>`,
  water:`<ellipse cx="160" cy="178" rx="116" ry="31" fill="${soft}" stroke="none"/><path d="M51 160q35 24 70 0t70 0t70 0M64 191q39 18 78 0t78 0"/><path d="M74 69q-23 30 0 34q23-4 0-34M251 52q-21 29 0 33q21-4 0-33" fill="${color}" stroke="none"/>`,
  fire:`<path d="M151 29q20 45 51 64q-5-29 15-43q5 50 26 76q22 59-25 89H107q-51-39-20-87q3 28 16 32q-4-64 48-131" fill="${color}" stroke="none"/><path d="M160 115q15 33 32 46q15 37-18 50h-28q-28-24 14-96" fill="${soft}" stroke="none"/>`,
  sun:`<circle cx="160" cy="120" r="89" fill="${soft}" stroke="none"/><path d="M160 14V1m0 238v-13M54 120H35m250 0h-19M83 43 70 30m180 180-13-13M83 197l-13 13M250 30l-13 13"/>`,
  moon:`<circle cx="159" cy="117" r="93" fill="${color}" stroke="none"/><circle cx="199" cy="87" r="88" fill="var(--vm-paper)" stroke="none"/><path d="m76 51 3 8 8 3-8 3-3 8-3-8-8-3 8-3Zm177 123 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="${soft}" stroke="none"/>`,
  rain:`<path d="M63 88q-6-35 27-36q27-36 54-8q33-34 58-1q45-9 52 45Z" fill="${soft}" stroke="none"/><path d="m64 116-8 20m34 48-8 20m17-95-8 20m136-13-8 20m34 42-8 20m-34-27-8 20"/>`,
  snow:`<path d="M58 75q-4-30 24-31q30-35 56-8q36-27 59 0q40-3 55 39Z" fill="${soft}" stroke="none"/><path d="M64 125v32m-14-24 28 16m-28 0 28-16m166 19v32m-14-24 28 16m-28 0 28-16M97 193v24m-11-18 22 12m-22 0 22-12"/>`,
  field:`<path d="M53 60h214v145H53Z" fill="${soft}"/><path d="M53 132h214M160 60v145m-83-37h28m104-74h32m-163 4h23m104 74h33"/>`,
  earth:`<path d="M35 178q55-18 112 0t138-1v40H35Z" fill="${soft}" stroke="none"/><path d="M35 193q55-18 112 0t138-1M58 55q24-6 34 14q-25 5-34-14m34 14v43"/>`,
  mouth:`<path d="M59 79q101-72 202 0v72q-101 72-202 0Z" fill="${soft}" stroke="none"/><path d="M78 114q82 39 164 0"/>`,
  eye:`<path d="M27 123q133-147 266 0q-133 147-266 0Z" fill="${soft}" stroke="none"/><ellipse cx="160" cy="123" rx="51" ry="72" fill="${color}" stroke="none"/>`,
  ear:`<path d="M103 202q-57-23-45-102q6-58 53-56q47-1 54 46q5 44-37 57q-16 6-14 25"/><path d="M89 126q-15-53 19-51q37 5 14 39m114-35q28 35 0 70m21-87q42 51 0 104"/>`,
  hand:`<path d="M84 202 58 137q-7-25 10-24l26 26V56q0-23 17-15l9 74V34q11-22 25-4l3 82 10-72q11-20 23-2l-2 85 16-52q16-17 23 4l-7 97q-7 44-39 46Z" fill="${soft}" stroke="none"/>`,
  heart:`<path d="M160 210 58 116q-49-78 21-91q47-9 81 36q34-45 81-36q70 13 21 91Z" fill="${soft}" stroke="none"/><path d="M41 179h27l12-23 18 44 13-21h22m80 0h25l12-23 18 44 13-21h15"/>`,
  shell:`<path d="M61 182Q8 42 158 42q151 0 100 140Z" fill="${soft}" stroke="none"/><path d="M160 45v137M101 56l34 125m86-125-35 125M60 91l54 89m142-89-51 89m-95 7h104"/>`,
  ruler:`<rect x="35" y="59" width="250" height="129" rx="19" fill="${soft}" stroke="none"/><path d="M53 61v25m26-25v16m26-16v25m26-25v16m26-16v25m26-25v16m26-16v25m26-25v16m26-16v25"/>`,
  knife:`<path d="m67 179 109-122q50-18 89-7q-12 51-46 73L97 199Z" fill="${soft}" stroke="none"/><path d="m67 179-25 25 30 23 25-28"/>`,
  axe:`<path d="m85 216 116-175m-29 40 77 23q20-30 6-61l-53-12"/><path d="m174 81 73 19q16-27 6-52l-50-12Z" fill="${soft}" stroke="none"/>`,
  bow:`<path d="M90 32q146 87 0 178L90 32m0 89h166m-19-14 19 14-19 14"/>`,
  work:`<path d="M49 88h222v37H49Z" fill="${soft}" stroke="none"/><path d="M75 125v81m169-81v81M82 59h54m65 110h50"/>`,
  metal:`<path d="m55 177 22-57h71l23 57Zm94-65 20-53h70l25 53Z" fill="${soft}" stroke="none"/><path d="m66 177 23-32h49l22 32m12-65 15-29h44l20 29"/>`,
  power:`<path d="M45 122h230M49 91v62m21-82v102m181-82v62m-21-82v102"/><circle cx="160" cy="122" r="43" fill="${soft}" stroke="none"/>`,
  door:`<path d="M66 211V46h188v165"/><path d="m99 205 111-16V61L99 49Z" fill="${soft}" stroke="none"/><circle cx="185" cy="131" r="5" fill="${color}" stroke="none"/>`,
  silk:`<path d="M75 59h170v126H75Z" fill="${soft}" stroke="none"/><path d="M66 56h188M66 190h188m-143-9q54-74 92-18q25 43 58 43M96 71l125 96M96 102l125 65M96 139l68 41"/>`,
  clothing:`<path d="m113 50-66 28 22 62 37-12-8 83h124l-8-83 37 12 22-62-66-28q-47 35-94 0Z" fill="${soft}" stroke="none"/><path d="m130 46 30-22 31 22"/>`,
  food:`<path d="M63 130q15 88 97 88t97-88Z" fill="${soft}" stroke="none"/><path d="M44 131h232M71 54l175 31M78 34l173 32M126 77q-15 18 0 35m54-38q-15 18 0 35"/>`,
  sign:`<rect x="52" y="45" width="217" height="128" rx="14" fill="${soft}" stroke="none"/><path d="M160 173v43M122 216h76m-3-160h28m-14-14 14 14-14 14"/>`,
  enclosure:`<rect x="54" y="40" width="212" height="173" rx="12" fill="${soft}" stroke-dasharray="10 9"/>`,
  sunset:`<path d="M42 175h236"/><path d="M80 175a80 80 0 0 1 160 0" fill="${soft}" stroke="none"/><path d="M160 41V24M80 73 68 61m173 12 12-12m-208 66H26m269 0h-18"/>`,
  speech:`<path d="M57 56h207v113H119l-45 39v-39H57Z" fill="${soft}" stroke="none"/><path d="M91 88h43m64 49h35M88 112h23"/>`,
  person:`<circle cx="69" cy="58" r="24" fill="${soft}" stroke="none"/><path d="M70 96v62m-29-36 29-14 35 12m-35 38-31 48m31-48 32 48m138-124v76m-27-35 27-22 32 23m-32 34-24 48m24-48 26 48"/><circle cx="240" cy="55" r="23" fill="${soft}" stroke="none"/>`,
  child:`<circle cx="85" cy="73" r="29" fill="${soft}" stroke="none"/><path d="M85 112v50m-31-26 31-13 30 13m-30 26-27 38m27-38 27 38m123-45q18 13 28 0"/>`,
  walk:`<path d="M38 202q105 19 128-38t115-92" stroke-dasharray="5 13"/><ellipse cx="72" cy="68" rx="16" ry="31" fill="${soft}" stroke="none"/><ellipse cx="245" cy="171" rx="16" ry="31" fill="${soft}" stroke="none"/>`,
  foot:`<path d="M99 189q-32-47-11-94q17-29 41 5q12 32-4 82Z" fill="${soft}" stroke="none"/><circle cx="90" cy="69" r="14" fill="${color}" stroke="none"/><circle cx="116" cy="66" r="12" fill="${color}" stroke="none"/>`,
  bird:`<ellipse cx="161" cy="140" rx="89" ry="65" fill="${soft}" stroke="none"/><circle cx="217" cy="75" r="39" fill="${color}" stroke="none"/><path d="m252 75 27 10-28 10M73 132l-35-29 10 49M147 202v22m37-22v22"/>`,
  fish:`<path d="M50 124q102-121 201-7l38-42v94l-38-42Q153 236 50 124Z" fill="${soft}" stroke="none"/><circle cx="86" cy="114" r="7" fill="${color}" stroke="none"/><path d="M209 88q-23 36 0 71M57 70h2m-21 85h2"/>`,
  horse:`<path d="M71 188V108l37-51 47-24 35 38 49 11-14 36-48-5-20 58H85m19 0v46m55-46v46m-56-94-40 29m43-95-5-24" fill="${soft}"/>`,
  vehicle:`<rect x="52" y="64" width="215" height="123" rx="25" fill="${soft}" stroke="none"/><path d="M74 92h170M51 158h216"/><circle cx="99" cy="194" r="21" fill="${color}" stroke="none"/><circle cx="222" cy="194" r="21" fill="${color}" stroke="none"/>`,
  big:`<path d="M51 45h39v38M269 45h-39v38M51 205h39v-38m179 38h-39v-38"/><circle cx="160" cy="121" r="83" fill="${soft}" stroke="none"/>`,
  small:`<ellipse cx="75" cy="177" rx="21" ry="13" fill="${color}" stroke="none"/><ellipse cx="156" cy="195" rx="28" ry="17" fill="${soft}" stroke="none"/><ellipse cx="244" cy="171" rx="15" ry="10" fill="${color}" stroke="none"/>`
 };
 if(typeof kind==='number')return Array.from({length:kind},(_,i)=>`<circle cx="${59+(i%5)*50}" cy="${i<5?48:210}" r="9" fill="${i%2?color:soft}" stroke="none"/>`).join('');
 if(kind==='bright')return `<circle cx="75" cy="86" r="49" fill="${soft}" stroke="none"/><path d="M249 44q-63 7-45 66q-65-14-32-68q34-31 77 2" fill="${color}" stroke="none"/>`;
 if(['rest','root','tip'].includes(kind))return paths.tree+(kind==='rest'?paths.person:`<path d="M124 ${kind==='root'?195:51}h75" stroke="${color}" stroke-width="12"/>`);
 if(kind==='greeting')return paths.person;
 if(kind==='harvest')return paths.field+`<path d="M35 190q16-43 37 0m-31 0h25v27H41Z" fill="${color}"/>`;
 return paths[kind]||paths.tree;
}
function vmPicture(ch,{compact=false}={}){
 const cue=vmCue(ch),c=vmCard(ch);if(!cue||!c)return '';
 const [paper,color,soft]=VM_COLORS[cue[0]],glyph=han(c);
 return `<svg class="vm-picture-svg ${compact?'is-compact':''}" viewBox="0 0 320 260" role="img" aria-label="${esc(glyph+' · '+cue[1]+'. Picture cue.')}" style="--vm-paper:${paper};--vm-color:${color}"><rect width="320" height="260" rx="32" fill="${paper}"/><g class="vm-scene" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true">${vmScene(cue[2],color,soft)}</g><text class="vm-glyph" x="160" y="179" text-anchor="middle" font-size="124" fill="#182D28" aria-hidden="true">${esc(glyph)}</text></svg>`;
}
function vmStudyMarkup(ch){
 const cue=vmCue(ch);if(!cue)return '';const id='vm-picture-'+(++vmSerial);
 return `<section class="vm-picture-block" id="${id}"><div class="vm-picture-heading"><span>Picture the shape</span><button class="textbtn" aria-pressed="false" onclick="vmPlain('${id}',this)">Character alone</button></div>${vmPicture(ch)}<p>${esc(cue[3])}</p><small>A visual memory cue. Check the plain character before practicing recall.</small></section>`;
}
function vmPlain(id,button){const el=$(id);if(!el?.isConnected||!button?.isConnected)return;const plain=el.classList.toggle('is-plain');button.setAttribute('aria-pressed',String(plain));button.textContent=plain?'Show picture':'Character alone'}
function vmIntroMarkup(ch){return vmPicture(ch)+'<button type="button" class="vm-plain-control" aria-pressed="false" onclick="vmToggleCue(this)">Character alone</button>'}
function vmToggleCue(button){const el=button?.closest?.('.vm-intro-glyph,.vm-scroll-glyph');if(!el?.isConnected||!button.isConnected)return;const plain=el.classList.toggle('is-plain');button.setAttribute('aria-pressed',String(plain));button.textContent=plain?'Show picture':'Character alone'}
function vmMarkHelp(){
 if(typeof memoryMarkHelp==='function')memoryMarkHelp();
 if(currentView==='session'&&session&&!session.done&&!session.revealed){session.usedHint=true;checkpointCurrent()}
 if(currentView==='quiz'&&quizSession&&!quizSession.done){const q=quizSession.questions[quizSession.pos];if(q&&(quizSession.kind==='league'?q.chosen:q.choice)===null){q.usedHint=true;checkpointCurrent()}}
 if(currentView==='write'&&writeSession&&!writeSession.done&&!writeSession.revealed){writeSession.usedHint=true;checkpointCurrent()}
 if(currentView==='scroll'){const f=state.scrollSession?.frames[state.scrollSession.index];if(f&&['read','find'].includes(f.kind)&&f.chosen===null){f.helped=true;save()}}
}
function vmGalleryOpen(turn){const match=$('overlay').innerHTML.match(/<section class="vm-library" data-vm-turn="(\d+)"/);return !!match&&(turn===undefined||Number(match[1])===turn)}
function vmOpenCard(ch,turn){if(!vmCue(ch)||(turn!==undefined&&!vmGalleryOpen(turn)))return;vmMarkHelp();openCleanStudy(ch,'shape')}
function vmLibraryMarkup(){
 const turn=++vmSerial,labels={all:'All pictures',nature:'Nature',people:'People',things:'Things',numbers:'Numbers'},chars=Object.keys(VM_CUES).filter(ch=>vmCue(ch)&&(vmFilter==='all'||VM_CUES[ch][0]===vmFilter)),shown=chars.slice(0,vmLimit);
 return `<section class="vm-library" data-vm-turn="${turn}"><span class="eyebrow">Shared across your courses</span><h2>Visual library</h2><p>Choose a picture cue, then switch to the plain character. Its components and your own memory notes are one tap away.</p><div class="vm-library-filters" role="group" aria-label="Picture categories">${Object.entries(labels).map(([key,label])=>`<button data-vm-filter="${key}" aria-pressed="${vmFilter===key}" onclick="vmSetFilter('${key}',${turn})">${label}</button>`).join('')}</div><div class="vm-library-grid">${shown.map(ch=>{const c=vmCard(ch);return `<button class="vm-library-card" data-vm-char="${ch}" onclick="vmOpenCard('${ch}',${turn})">${vmPicture(ch,{compact:true})}<span><strong lang="zh">${esc(han(c))}</strong><span>${esc(c.pinyin)}</span><small>${esc(VM_CUES[ch][1])}</small></span></button>`}).join('')}</div>${shown.length<chars.length?`<button class="btn full" onclick="vmMore(${turn})">Show 12 more pictures</button>`:''}<p class="small muted">Original memory illustrations. These explanations describe visual cues, not historical origins. Browsing does not count as recall.</p></section>`;
}
function vmOpenLibrary(){vmMarkHelp();vmFilter='all';vmLimit=12;studyModal(vmLibraryMarkup())}
function vmSetFilter(filter,turn){if(!vmGalleryOpen(turn)||!['all','nature','people','things','numbers'].includes(filter))return;vmFilter=filter;vmLimit=12;const el=$('overlay').querySelector('.vm-library');if(el){el.outerHTML=vmLibraryMarkup();$('overlay').querySelector(`[data-vm-filter="${filter}"]`)?.focus()}}
function vmMore(turn){if(!vmGalleryOpen(turn))return;const first=vmLimit;vmLimit=Math.min(72,vmLimit+12);const el=$('overlay').querySelector('.vm-library');if(el){el.outerHTML=vmLibraryMarkup();$('overlay').querySelectorAll('.vm-library-card')[first]?.focus()}}
function vmToolMarkup(){return `<button class="flow-tool" onclick="vmOpenLibrary()"><span>${icon('picture')}</span><strong>Visual library</strong><small>Pictures, plain forms, and clickable components</small>${icon('arrow')}</button>`}
function vmHomeMarkup(){
 const chapter=courseFocusId(),pool=uniqueCards(chapter).filter(c=>vmCue(c.character)),day=Number(dayKey().replace(/-/g,'')),c=pool[day%pool.length]||uniqueCards().find(c=>vmCue(c.character))||vmCard('木'),days=[];
 for(let offset=6;offset>=0;offset--){const d=new Date();d.setDate(d.getDate()-offset);const key=dayKey(d),a=state.activity[key],active=!!(a&&(a.cards||a.readings));days.push({label:d.toLocaleDateString('en',{weekday:'narrow'}),number:d.getDate(),date:d.toLocaleDateString('en',{weekday:'long',month:'short',day:'numeric'}),active,today:offset===0})}
 const now=new Date();
 return `<aside class="vm-home-side"><div class="vm-week-heading"><div class="ax-calendar-date"><strong>${String(now.getDate()).padStart(2,'0')}</strong><span>${esc(now.toLocaleDateString('en',{weekday:'long'}))}<small>${esc(now.toLocaleDateString('en',{month:'long',year:'numeric'}))}</small></span></div><button class="iconbtn" onclick="navigate('stats')" aria-label="Open your practice history">${typeof axCalendarIcon==='function'?axCalendarIcon():icon('clock')}</button></div><div class="vm-week" aria-label="Practice over the last seven days">${days.map(d=>`<span class="${d.active?'is-active':''} ${d.today?'is-today':''}" ${d.today?'aria-current="date"':''} aria-label="${esc(d.date)}: ${d.active?'practice recorded':'no practice recorded'}"><span aria-hidden="true">${d.label}</span><b aria-hidden="true">${d.active?'✓':d.number}</b></span>`).join('')}</div>${state.settings.visualMemory?`<button class="vm-home-picture" onclick="vmOpenCard('${c.character}')">${vmPicture(c.character,{compact:true})}<span><small>A shape to explore</small><strong lang="zh">${esc(han(c))}</strong><span>${esc(c.pinyin)} · ${esc(VM_CUES[c.character][1])}</span></span></button>`:''}<button class="vm-library-link" onclick="vmOpenLibrary()">Open visual library ${icon('arrow')}</button></aside>`;
}
function vmDecorate(root){
 if(!root||state.settings.visualMemory===false)return;
 const content=root.querySelector?.('#memory-study-content'),full=content?.querySelector('.memory-full'),c=typeof cleanStudyTarget==='string'?vmCard(cleanStudyTarget):null;
 if(full&&c&&vmCue(c.character)&&!content.querySelector('.vm-picture-block')){full.insertAdjacentHTML('beforebegin',vmStudyMarkup(c.character));full.classList.add('vm-component-support')}
 if(currentView==='session'&&typeof memoryIsStudy==='function'&&memoryIsStudy()){
  const ch=session?.queue[session.pos]?.character,el=root.querySelector?.('.memory-study-card .memory-core>.han');
  if(el&&vmCue(ch)&&el.dataset.vmCue!==ch){el.dataset.vmCue=ch;el.classList.remove('ax-tzg');el.classList.add('vm-intro-glyph');el.innerHTML=vmIntroMarkup(ch)}
 }
 if(currentView==='scroll'&&state.scrollSession){
  root.querySelectorAll('.scroll-frame-card').forEach(card=>{if(!/^scroll-card-\d+$/.test(card.id))return;const index=Number(card.id.replace('scroll-card-','')),f=state.scrollSession.frames[index];if(f?.kind!=='meet'||!vmCue(f.ch))return;const glyph=card.querySelector('.scroll-glyph');if(glyph&&glyph.dataset.vmCue!==f.ch){glyph.dataset.vmCue=f.ch;glyph.classList.remove('ax-tzg');glyph.classList.add('vm-scroll-glyph');glyph.innerHTML=vmIntroMarkup(f.ch)}});
 }
}
