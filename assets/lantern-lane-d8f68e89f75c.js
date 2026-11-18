/* Conversation sessions use the validated practice backup and the app's capped XP ledger. */
const LANE_REVIEW_DAYS = [1, 3, 7, 14];
const LANE_STEP_NAMES = ['Reply', 'Build', 'Match', 'Respond'];
let laneSceneId = '', laneOwner = null, laneToken = 0, laneWelcomeDraft = null;
function laneDefaults() { return { greeted: false, stamps: {}, runs: {} }; }
function laneData() { return trailData().lane ??= laneDefaults(); }
function laneStops() { return LANE_SCENES.filter(scene => scene.course === selectedCourseId); }
function laneScene(id) { return LANE_SCENES.find(scene => scene.id === id); }
function laneInts(value, limit, max) {
  return Array.isArray(value) ? [...new Set(value.filter(i => Number.isInteger(i) && i >= 0 && i < max))].slice(0, limit) : [];
}
function laneValidate(raw) {
  const clean = laneDefaults();
  if (!raw || typeof raw !== 'object') return clean;
  clean.greeted = raw.greeted === true;
  for (const scene of LANE_SCENES) {
    const stamp = raw.stamps?.[scene.id];
    if (stamp && labDate(stamp.last) && labDate(stamp.next)) {
      clean.stamps[scene.id] = { last: stamp.last, next: stamp.next, days: Math.max(1, labNum(stamp.days, 180)) };
    }
    const r = raw.runs?.[scene.id];
    if (!r || !Number.isSafeInteger(r.seed) || r.seed < 1 || r.seed > 0x7fffffff ||
        !Array.isArray(r.queue) || r.queue.length < 4 || [0,1,2,3].some(i=>r.queue[i]!==i) || new Set(r.queue.slice(4)).size!==r.queue.length-4 ||
        r.queue.length > 8 || r.queue.slice(4).some(i => ![0,1,2,3].includes(i)) ||
        !Number.isInteger(r.pos) || r.pos < 0 || r.pos > r.queue.length) continue;
    const q = r.queue[r.pos], reply = q === 0 || q === 3;
    const choices = reply ? (q === 0 ? scene.greet : scene.end).choices.length : 0;
    const run = clean.runs[scene.id] = {
      seed: r.seed, touched: labNum(r.touched,1e15), queue: [...r.queue], pos: r.pos,
      first: Array.from({ length:4 }, (_,i) => ['right','miss','help'].includes(r.first?.[i]) ? r.first[i] : null),
      choice: reply && Number.isInteger(r.choice) && r.choice >= 0 && r.choice < choices ? r.choice : null,
      tiles: q === 1 ? laneInts(r.tiles, 9, scene.build.words.length + scene.build.extras.length) : [],
      pairs: q === 2 ? laneInts(r.pairs,3,3) : [], left: q === 2 && [0,1,2].includes(r.left) ? r.left : null,
      pairMiss: q === 2 && r.pairMiss === true, helped: r.helped === true,
      feedback: typeof r.feedback === 'boolean' ? r.feedback : null,
      combo: labNum(r.combo,8), xp: labNum(r.xp,32)
    };
    if (run.left !== null && run.pairs.includes(run.left)) run.left = null;
    if (run.pos === run.queue.length || (reply && run.choice === null) ||
        (q === 1 && !run.tiles.length) || (q === 2 && run.pairs.length !== 3)) run.feedback = null;
  }
  return clean;
}
function laneNewRun(seed) {
  return { seed, touched: Date.now(), queue: [0,1,2,3], pos: 0, first: [null,null,null,null],
    choice: null, tiles: [], pairs: [], left: null, pairMiss: false, helped: false, feedback: null, combo: 0, xp: 0 };
}
function laneOrder(count, seed) {
  const ids = Array.from({ length: count }, (_,i) => i);
  for (let i = count-1; i > 0; i--) {
    seed = (Math.imul(seed,1664525) + 1013904223) >>> 0;
    const j = Math.floor((seed / 4294967296) * (i+1));
    [ids[i],ids[j]] = [ids[j],ids[i]];
  }
  return ids;
}
function laneDue() {
  const stamps = laneData().stamps, today = dayKey();
  return laneStops().filter(s => stamps[s.id]?.next <= today).sort((a,b) => stamps[a.id].next.localeCompare(stamps[b.id].next));
}
function laneNextStop() {
  const data = laneData(), route = laneStops();
  const pending = route.filter(s => { const r=data.runs[s.id]; return r && r.pos < r.queue.length; });
  return pending.sort((a,b)=>data.runs[b.id].touched-data.runs[a.id].touched)[0] ||
    route.find(s => !data.stamps[s.id]) || laneDue()[0] || route[0];
}
function laneStart(id = laneNextStop().id) {
  const scene = laneScene(id);
  if (!scene || scene.course !== selectedCourseId) return;
  checkpointCurrent();
  const data = laneData(), previous = data.runs[id];
  if (!previous || previous.pos >= previous.queue.length) {
    data.runs[id] = laneNewRun(Math.floor(Math.random()*0x7ffffffe)+1);
    if (id === 'gate' && data.greeted && !data.stamps.gate) {
      data.runs[id].first[0] = 'help';
      data.runs[id].pos = 1;
    }
  }
  data.runs[id].touched = Date.now();
  laneSceneId = id; laneOwner = state; save(); navigate('lane');
}
function laneLive(token) {
  if (token !== laneToken || laneOwner !== state || currentView !== 'lane') return null;
  const scene = laneScene(laneSceneId), r = laneData().runs[laneSceneId];
  return scene?.course === selectedCourseId && r ? { scene, r, q:r.queue[r.pos] } : null;
}
function laneStamp(id) {
  const data = laneData(), old = data.stamps[id], today = dayKey();
  if (old?.last === today) return;
  const days = (old?.days || 0) + 1, next = new Date();
  next.setDate(next.getDate() + LANE_REVIEW_DAYS[Math.min(days-1,LANE_REVIEW_DAYS.length-1)]);
  data.stamps[id] = { last: today, next: dayKey(next), days };
}
function laneCheck(token) {
  const live = laneLive(token);
  if (!live) return;
  const { scene,r,q } = live;
  if (r.feedback !== null || q === undefined) return;
  let correct;
  if (q === 0 || q === 3) {
    if (r.choice === null) return;
    correct = r.choice === (q === 0 ? scene.greet : scene.end).answer;
  } else if (q === 1) {
    if (!r.tiles.length) return;
    correct = r.tiles.length === scene.build.words.length && r.tiles.every((id,i) => id === i);
  } else {
    if (r.pairs.length !== 3) return;
    correct = !r.pairMiss;
  }
  r.feedback = correct;
  const revisit = r.pos >= 4, assisted = r.helped || revisit;
  if (!revisit) {
    r.first[q] = !correct ? 'miss' : assisted ? 'help' : 'right';
    if (!correct) r.queue.push(q);
  }
  r.combo = correct && !assisted ? r.combo+1 : 0;
  r.touched = Date.now();
  if (!revisit) {
    r.xp += labRecord(q === 2 ? 'words' : 'comprehension','lane-'+scene.id+'-'+q,correct,assisted,{reward:true});
    activity('cards');
  }
  save();
  playStudySound(correct ? (r.combo === 3 ? 'milestone' : 'correct') : 'retry');
  laneRender('feedback');
}
function laneNext(token) {
  const live = laneLive(token);
  if (!live || live.r.feedback === null) return;
  const {r,scene} = live;
  r.pos++; r.feedback = null; r.choice = null; r.tiles = []; r.pairs = []; r.left = null;
  r.pairMiss = false; r.helped = false; r.touched = Date.now();
  if (r.pos === r.queue.length) { laneStamp(scene.id); playStudySound('complete'); }
  save(); laneRender('step');
}
function lanePick(kind, n, token) {
  const live = laneLive(token);
  if (!live || live.r.feedback !== null) return;
  const {scene,r,q} = live;
  const tileMove = kind === 'add' || kind === 'remove';
  const source = tileMove && document.querySelector('.ln-chip[data-chip="'+n+'"][data-kind="'+kind+'"]');
  const box = source && source.getBoundingClientRect();
  if (kind === 'choice' && (q === 0 || q === 3) && [0,1,2].includes(n)) r.choice = n;
  else if (kind === 'add' && q === 1 && Number.isInteger(n) && n >= 0 && n < scene.build.words.length+scene.build.extras.length && !r.tiles.includes(n)) r.tiles.push(n);
  else if (kind === 'remove' && q === 1 && r.tiles.includes(n)) r.tiles.splice(r.tiles.indexOf(n),1);
  else if (kind === 'left' && q === 2 && [0,1,2].includes(n) && !r.pairs.includes(n)) r.left = n;
  else if (kind === 'right' && q === 2 && r.left !== null && [0,1,2].includes(n) && !r.pairs.includes(n)) {
    if (r.left === n) {
      r.pairs.push(n); r.left = null;
      if (r.pairs.length === 3) { laneCheck(token); return; }
      playStudySound('correct');
    } else {
      r.pairMiss = true; r.left = null; playStudySound('retry');
      r.touched = Date.now(); save(); laneRender('pair-miss'); return;
    }
  } else return;
  r.touched = Date.now(); save(); laneRender(kind);
  if (box) {
    const destination = document.querySelector('.ln-chip[data-chip="'+n+'"][data-kind="'+(kind==='add'?'remove':'add')+'"]');
    if (destination && typeof axAnimateDisplay==='function') {
      const to=destination.getBoundingClientRect();
      axAnimateDisplay(destination,[{transform:'translate('+(box.left-to.left)+'px,'+(box.top-to.top)+'px) scale(.92)'},{transform:'translate(0,0) scale(1)'}],{duration:220,easing:'cubic-bezier(.2,.8,.3,1)'});
    }
  }
}
function laneHelp(token) {
  const live = laneLive(token);
  if (!live || live.r.feedback !== null || live.r.helped) return;
  live.r.helped = true; save(); laneRender('hint');
}
function laneReplay(i,token) {
  const live=laneLive(token);
  if(live && live.r.pos===live.r.queue.length && [0,1].includes(i))speak(laneZh((i?live.scene.end:live.scene.greet).line));
}
function lanePlay(token) {
  const live = laneLive(token);
  if (!live) return;
  const {scene,q,r} = live;
  if (q !== 0 && q !== 3 && !(q===1 && r.feedback!==null)) return;
  const zh = q === 0 ? scene.greet.line : q === 3 ? scene.end.line : scene.build.words.join('');
  speak(laneZh(zh));
}
function laneButton(label, action, options = {}) {
  return '<button type="button" class="ln-button '+(options.secondary?'ln-secondary':'')+'" onclick="'+action+'" '+(options.disabled?'disabled':'')+'>'+label+'</button>';
}
function laneArt(scene, title, caption, small = false) {
  return '<div class="ln-art '+(small?'ln-art-small ':'')+'ln-'+scene.hue+'"><div class="ln-scene-paint" aria-hidden="true"></div><div class="ln-lights" aria-hidden="true"><i></i><i></i><i></i></div><div class="ln-art-copy"><span class="ln-overline">'+esc(caption)+'</span><h2>'+esc(title)+'</h2></div></div>';
}
function laneHomeMarkup() {
  const data = laneData(), route = laneStops(), next = laneNextStop(), run = data.runs[next.id];
  const pending = run && run.pos < run.queue.length, due = laneDue(), count = route.filter(s=>data.stamps[s.id]).length;
  const rows = route.map((s,i) => {
    const saved = data.runs[s.id], active = saved && saved.pos < saved.queue.length, done = !!data.stamps[s.id];
    const status = active?'Resume':done?'Practice again':'Start scene';
    return '<button type="button" class="ln-map-stop '+(done?'is-stamped ':'')+(next.id===s.id?'is-next':'')+'" onclick="laneStart(\''+s.id+'\')" aria-label="'+esc(s.title+' · '+status)+'"><span class="ln-map-seal" lang="zh">'+esc(laneZh(s.seal))+'</span><span><small>'+esc(s.place)+'</small><strong>'+esc(s.title)+'</strong></span><span class="ln-map-state">'+(done?icon('check'):i+1)+'</span></button>';
  }).join('');
  return '<section class="ln-home" aria-label="Lantern Lane conversation practice">'+laneArt(next,'Lantern Lane',currentCourse().name+' · Conversation practice')+
    '<div class="ln-home-body"><div class="ln-home-next"><div><small>'+esc(pending?'Continue at '+next.place:next.place)+'</small><strong>'+esc(next.title)+'</strong></div>'+
    laneButton((pending?'Resume':data.stamps[next.id]?'Revisit':'Play scene')+' '+icon('arrow'),"laneStart('"+next.id+"')")+'</div>'+
    (due.length && !(next.id===due[0].id && !pending)?'<button class="ln-review-link" type="button" onclick="laneStart(\''+due[0].id+'\')">'+icon('review')+' Ready for another try · '+esc(due[0].title)+'</button>':'')+
    '<details class="ln-map"><summary><span>'+icon('layers')+' Your route</span><span>'+count+' / '+route.length+' stamps '+icon('chevron')+'</span></summary><div class="ln-stops">'+rows+'</div><button type="button" class="ln-help" onclick="laneWelcome(true)">Replay welcome</button></details></div></section>';
}
function laneAwardArt(scene) {
  return '<div class="ln-postcard"><div class="ln-scene-paint" aria-hidden="true"></div><span class="ln-postmark">Lantern Lane</span><span class="ln-post-stamp" aria-hidden="true"><b lang="zh">'+esc(laneZh(scene.seal))+'</b><small>'+esc(scene.place)+'</small></span></div>';
}
function laneFinish(scene, r) {
  const route = laneStops(), stamp = laneData().stamps[scene.id], unseen = route.find(s=>!laneData().stamps[s.id]);
  const own = r.first.filter(x=>x==='right').length, missed = r.first.filter(x=>x==='miss').length;
  const recap = [scene.greet,scene.end].map((t,i)=>'<div><strong lang="zh">'+esc(laneZh(t.line))+'</strong><span>'+esc(t.sound+' · '+t.gloss)+'</span><button class="ln-help" type="button" onclick="laneReplay('+i+','+laneToken+')">'+icon('sound')+' Hear line</button></div>').join('');
  const nextDate = stamp ? new Date(stamp.next+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'}) : '';
  return '<section class="ln-finish">'+laneAwardArt(scene)+'<span class="ln-kicker">Passport stamp collected</span><h1>'+esc(scene.title)+'</h1><p>'+esc(scene.outcome)+'</p><div class="ln-results"><div><b>'+own+' / 4</b><small>On your own</small></div><div><b>+'+r.xp+'</b><small>Practice XP</small></div><div><b>'+streak()+'</b><small>Day streak</small></div></div>'+
    '<div class="ln-review-date">'+icon('review')+'<span>'+(missed?'You revisited '+missed+' tricky '+(missed===1?'turn':'turns')+'. ':'')+'Next review '+esc(nextDate)+'.</span></div>'+
    laneButton('Back to my route '+icon('check'),"navigate('home')")+
    (unseen?laneButton('Next scene · '+esc(unseen.title),"laneStart('"+unseen.id+"')",{secondary:true}):'')+
    '<details class="ln-phrasebook"><summary>Hear the conversation again</summary>'+recap+'</details></section>';
}
function laneBubble(scene, turn, token, showGloss, welcome = false) {
  const person = '<span class="ln-avatar ln-'+scene.hue+'" data-person="'+scene.person+'" aria-hidden="true">'+(welcome?'林':({Lin:'林',Mei:'梅',Bo:'博',An:'安'}[scene.person]))+'</span>';
  return '<div class="ln-dialogue">'+person+'<div class="ln-bubble"><small>'+esc(scene.person)+'</small><div><strong lang="zh">'+esc(laneZh(turn.line))+'</strong><button class="ln-audio" type="button" aria-label="Hear the Mandarin line" onclick="'+(welcome?'laneWelcomeSound('+token+')':'lanePlay('+token+')')+'">'+icon('sound')+'</button></div>'+(showGloss?'<p>'+esc(turn.sound+' · '+turn.gloss)+'</p>':'')+'</div></div>';
}
function laneOptions(turn, order, chosen, feedback, token, welcome) {
  return '<div class="ln-options" role="group" aria-label="Choose a reply">'+order.map((n,i) => {
    const selected = n === chosen, correct = feedback!==null && n===turn.answer, wrong = feedback!==null && selected && !correct;
    return '<button type="button" class="ln-option '+(selected?'is-selected ':'')+(correct?'is-right':wrong?'is-wrong':'')+'" aria-pressed="'+selected+'" '+(feedback!==null?'disabled':'')+' onclick="'+(welcome?'laneWelcomePick('+n+','+token+')':"lanePick('choice',"+n+','+token+')')+'"><span class="ln-number">'+(correct?'✓':wrong?'×':i+1)+'</span><strong '+(/[\u3400-\u9fff]/.test(turn.choices[n])?'lang="zh"':'')+'>'+esc(laneZh(turn.choices[n]))+'</strong></button>';
  }).join('')+'</div>';
}
function laneTileMarkup(scene,r,token) {
  const b=scene.build, all=[...b.words,...b.extras], order=laneOrder(all.length,r.seed+r.pos);
  if (order.every((n,i)=>n===i)) order.reverse();
  function chip(n,kind,disabled=false) {
    return '<button type="button" data-chip="'+n+'" data-kind="'+kind+'" class="ln-chip '+(disabled?'is-used':'')+'" '+(disabled||r.feedback!==null?'disabled':'')+' aria-label="'+(kind==='add'?'Add ':'Remove ')+esc(laneZh(all[n]))+'" onclick="lanePick(\''+kind+'\','+n+','+token+')"><span lang="zh">'+esc(laneZh(all[n]))+'</span></button>';
  }
  return '<div class="ln-answer-line" role="group" aria-label="Your sentence">'+(r.tiles.length?r.tiles.map(n=>chip(n,'remove')).join(''):'<span>Tap words in order</span>')+'</div><div class="ln-bank" role="group" aria-label="Word bank">'+order.map(n=>chip(n,'add',r.tiles.includes(n))).join('')+'</div>';
}
function lanePairMarkup(scene,r,token,reason) {
  const nudge = reason==='pair-miss'?'Those two have different meanings. Try another pair.':r.left!==null?'Now choose its English meaning.':'Choose a Chinese word, then its meaning.';
  function col(side,order) {
    return '<div class="ln-pair-col">'+order.map(n=>'<button type="button" class="ln-pair '+(r.pairs.includes(n)?'is-done':'')+' '+(side==='left'&&r.left===n?'is-selected':'')+'" '+(r.pairs.includes(n)||r.feedback!==null||side==='right'&&r.left===null?'disabled':'')+' onclick="lanePick(\''+side+'\','+n+','+token+')">'+(r.pairs.includes(n)?'<span aria-hidden="true">✓ </span>':'')+'<span '+(side==='left'?'lang="zh"':'')+'>'+esc(side==='left'?laneZh(scene.pairs[n][0]):scene.pairs[n][1])+'</span></button>').join('')+'</div>';
  }
  const left=laneOrder(3,r.seed+r.pos),right=laneOrder(3,r.seed+14781+r.pos);
  if(left.some((n,i)=>n===right[i]))right.splice(0,3,left[1],left[2],left[0]);
  return '<p class="ln-pair-note" role="status">'+nudge+'</p><div class="ln-pairs">'+col('left',left)+col('right',right)+'</div>';
}
function laneFeedback(scene,r,q) {
  const correct = r.feedback, turn = q===0?scene.greet:scene.end;
  const solution = q===1?laneZh(scene.build.words.join('')):q===2?'':laneZh(turn.choices[turn.answer]);
  const why = q===1?scene.build.why:q===2?(correct?'All three meanings matched.':(r.pos<4?'All three are matched now. You’ll see these pairs again.':'All three are matched now. Use the phrasebook to revisit them.')):turn.why;
  return '<div tabindex="-1" class="ln-feedback '+(correct?'ln-good':'ln-again')+'" role="status"><span class="ln-verdict">'+icon(correct?'check':'review')+'</span><div><strong>'+(correct?(r.combo>=3?r.combo+' in a row!':r.pos>=4?'You got the revisit.':'That’s right!'):r.pos>=4?'Keep this one for next time.':'One to revisit.')+'</strong>'+
    (solution?'<span lang="zh">'+esc(solution)+'</span>':'')+'<p>'+esc(laneZh(why))+'</p></div></div>';
}
function laneRender(reason = 'step') {
  const selected = laneScene(laneSceneId);
  const scene = selected?.course===selectedCourseId ? selected : laneNextStop(), r=laneData().runs[scene.id];
  if (!r) { navigate('home'); return; }
  laneSceneId=scene.id; laneOwner=state; const token=++laneToken;
  if (r.pos===r.queue.length) { $('view').innerHTML='<div class="ln-round ln-receipt">'+laneFinish(scene,r)+'</div>'; laneFocus('.ln-finish h1'); return; }
  const q=r.queue[r.pos], reply=q===0||q===3, turn=q===0?scene.greet:scene.end, graded=r.feedback!==null;
  const ask=reply?turn.ask:q===1?scene.build.ask:'Match the three pairs.';
  const hint=reply?turn.sound+' · '+turn.gloss:q===1?scene.build.sound+' · '+scene.build.words.map((word,i)=>laneZh(word)+' = '+LANE_BUILD_GLOSSES[scene.id][i]).join(' / '):'';
  const ready=reply?r.choice!==null:q===1?r.tiles.length>0:false;
  const answer=reply?laneOptions(turn,laneOrder(3,r.seed+r.pos),r.choice,r.feedback,token,false):q===1?laneTileMarkup(scene,r,token):lanePairMarkup(scene,r,token,reason);
  const pct=100*(r.pos+(graded?1:0))/r.queue.length, prior=100*r.pos/r.queue.length;
  $('view').innerHTML='<section class="ln-round '+(reason==='step'?'ln-enter':reason==='feedback'?'ln-graded':'')+'"><div class="ln-round-top"><button class="ln-close" type="button" onclick="navigate(\'home\')" aria-label="Pause conversation and go Home">'+icon('close')+'</button>'+
    '<div class="ln-progress '+(r.combo>=2?'ln-hot':'')+'" role="progressbar" aria-label="Conversation progress" aria-valuemin="0" aria-valuemax="'+r.queue.length+'" aria-valuenow="'+(r.pos+(graded?1:0))+'"><i style="--ln-from:'+prior+'%;width:'+pct+'%"></i></div>'+
    '<span class="ln-count">'+(r.pos+1)+' / '+r.queue.length+'</span></div>'+laneArt(scene,scene.place,'Lantern Lane · '+scene.title,true)+
    '<div class="ln-exercise"><span class="ln-kicker">'+(r.pos>=4?'Previous mistake':LANE_STEP_NAMES[q])+'</span><h1 tabindex="-1">'+esc(ask)+'</h1>'+
    (reply?laneBubble(scene,turn,token,r.helped||graded):'')+answer+
    (q!==2&&!graded?'<div class="ln-hints">'+(r.helped?'<span>'+(reply?'Translation shown':esc(hint))+'</span>':'<button type="button" class="ln-help" onclick="laneHelp('+token+')">'+(reply?'Show translation':'Show word hints')+'</button>')+'</div>':'')+
    '</div><footer class="ln-dock">'+(graded?laneFeedback(scene,r,q)+laneButton(r.pos+1===r.queue.length?'Collect my stamp':'Continue '+icon('arrow'),'laneNext('+token+')'):q===2?'<div class="ln-pair-count">'+r.pairs.length+' / 3 pairs matched</div>':laneButton('Check answer','laneCheck('+token+')',{disabled:!ready}))+'</footer></section>';
  if (reason==='step') { window.scrollTo({top:0,behavior:'instant'}); laneFocus('.ln-exercise h1'); }
  else if (reason==='feedback') laneFocus('.ln-feedback');
  else if (reason==='choice') laneFocus('.ln-option.is-selected');
  else if (reason==='left') laneFocus('.ln-pair-col:nth-child(2) button:not(:disabled)');
  else if (reason==='right'||reason==='pair-miss') laneFocus('.ln-pair-col button:not(:disabled)');
  else if (reason==='add'||reason==='remove') laneFocus('.ln-bank button:not(:disabled)');
  else if (reason==='hint') laneFocus('.ln-exercise h1');
}
function laneFocus(selector) {
  const el=document.querySelector(selector); if (!el) return;
  if (!el.matches('button,input,select')) el.setAttribute('tabindex','-1');
  el.focus({preventScroll:true});
}
function laneKeys(e) {
  if (currentView!=='lane') return false;
  if (e.defaultPrevented||e.repeat||e.isComposing||e.ctrlKey||e.metaKey||e.altKey||$('overlay').innerHTML||['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName)) return true;
  if (e.key==='Escape') { e.preventDefault(); navigate('home'); return true; }
  const live=laneLive(laneToken); if (!live||!live.r||live.q===undefined) return true;
  if (live.r.feedback===null && (live.q===0||live.q===3) && /^[123]$/.test(e.key)) {
    e.preventDefault(); lanePick('choice',laneOrder(3,live.r.seed+live.r.pos)[Number(e.key)-1],laneToken);
  } else if (e.key==='Enter' && e.target?.tagName!=='BUTTON') {
    e.preventDefault(); if(live.r.feedback!==null)laneNext(laneToken);else laneCheck(laneToken);
  }
  return true;
}
/* The first tap is a real conversational turn. Profile setup follows the greeting. */
function laneWelcome(replay = false) {
  laneOwner=state;
  laneWelcomeDraft={chosen:null,feedback:null,replay};
  onboardingStep='lane-welcome'; laneWelcomeRender();
}
function laneWelcomeLive(token) {
  return laneWelcomeDraft && laneOwner===state && onboardingStep==='lane-welcome' && token===laneToken;
}
function laneWelcomeRender(focus) {
  const w=laneWelcomeDraft, scene=laneScene('gate'), token=++laneToken;
  const top='<div class="ln-welcome-top"><span>Eric’s Chinese</span><button type="button" onclick="laneWelcomeSkip('+token+')">Explore the app</button></div>';
  const feedback=w.feedback===null?'':'<div tabindex="-1" class="ln-feedback '+(w.feedback?'ln-good':'ln-again')+'" role="status"><span class="ln-verdict">'+icon(w.feedback?'check':'review')+'</span><div><strong>'+(w.feedback?'You just greeted Lin.':'Try greeting Lin back.')+'</strong><p>'+esc(w.feedback?'You can use 你好 any time you meet someone.':w.chosen===1?'谢谢 means “thank you.” Tap 你好 to say hello.':'再见 means “goodbye.” Tap 你好 to say hello.')+'</p></div></div>';
  const action=w.feedback===true?laneButton('Choose my learning route '+icon('arrow'),'laneWelcomeNext('+token+')'):w.feedback===false?laneButton('Try again','laneWelcomeRetry('+token+')'):laneButton('Check my reply','laneWelcomeCheck('+token+')',{disabled:w.chosen===null});
  showCompanionModal('<div class="ln-welcome">'+top+laneArt(scene,'Lantern Lane','Your first conversation')+'<div class="ln-welcome-body"><span class="ln-kicker">Market gate</span><h1>Say hello to Lin.</h1>'+laneBubble(scene,scene.greet,token,true,true)+laneOptions(scene.greet,[1,0,2],w.chosen,w.feedback,token,true)+'</div><footer class="ln-dock">'+feedback+action+'</footer></div>',true,'Your first conversation');
  laneFocus(focus || '.ln-welcome h1');
}
function laneWelcomePick(n,token) {
  if (!laneWelcomeLive(token) || laneWelcomeDraft.feedback!==null || ![0,1,2].includes(n)) return;
  laneWelcomeDraft.chosen=n; laneWelcomeRender('.ln-option.is-selected');
}
function laneWelcomeCheck(token) {
  if(!laneWelcomeLive(token)||laneWelcomeDraft.feedback!==null||laneWelcomeDraft.chosen===null)return;
  const correct=laneWelcomeDraft.chosen===laneScene('gate').greet.answer;
  laneWelcomeDraft.feedback=correct; playStudySound(correct?'correct':'retry'); laneWelcomeRender('.ln-feedback');
}
function laneWelcomeRetry(token) {
  if(!laneWelcomeLive(token)||laneWelcomeDraft.feedback!==false)return;
  laneWelcomeDraft.chosen=null;laneWelcomeDraft.feedback=null;laneWelcomeRender();
}
function laneWelcomeSound(token) { if(laneWelcomeLive(token))speak(laneZh('你好！')); }
function laneWelcomeNext(token) {
  if(!laneWelcomeLive(token)||laneWelcomeDraft.feedback!==true)return;
  const first=!laneWelcomeDraft.replay; if(first){laneData().greeted=true;save()} laneWelcomeDraft=null; trailSetup(first);
}
function laneWelcomeSkip(token) {
  if(!laneWelcomeLive(token))return;
  const first=!laneWelcomeDraft.replay; laneWelcomeDraft=null; onboardingStep=null; if(first){state.profile.setupDone=true;save()} closeModal(); navigate('home');
}
