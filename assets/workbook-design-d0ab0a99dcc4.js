
/* Design layer: palettes, sidebar, navigation bar behavior, and the workbook square. */
document.documentElement.classList.add('ax');

/* Themes: each is a traditional Chinese pigment. Surfaces carry a faint tint of the theme hue
   (base, elevated, and sheet levels, like Apple's dark base and elevated backgrounds); the accent is
   the one saturated color, with a second, complementary hue kept for small highlights. */
(function(){
  const next={"jade": {"name": "Jade", "hanzi": "翡翠", "light": {"bg": "#F0F6F2", "panel": "#FFFFFF", "elevated": "#FFFFFF", "sidebar": "#F6FAF7", "line": "#DBE2DD", "ink": "#161E19", "muted": "#58625C", "green": "#007749", "accent": "#AA4331", "soft": "#E3F0EB", "segment": "#FFFFFF"}, "dark": {"bg": "#070E0A", "panel": "#131C17", "elevated": "#1E2822", "sidebar": "#0C140F", "line": "#2D3932", "ink": "#F0F5F2", "muted": "#ADBBB2", "green": "#63D99B", "accent": "#FEAC9B", "soft": "#213E2F", "segment": "#3F4B44"}, "brandPale": "#007749", "brandDark": "#63D99B"}, "sky": {"name": "Celadon", "hanzi": "天青", "light": {"bg": "#EFF6F7", "panel": "#FFFFFF", "elevated": "#FFFFFF", "sidebar": "#F4FAFB", "line": "#D9E1E3", "ink": "#131E20", "muted": "#556264", "green": "#02707E", "accent": "#985704", "soft": "#E3EFF1", "segment": "#FFFFFF"}, "dark": {"bg": "#050E10", "panel": "#111C1E", "elevated": "#1B282A", "sidebar": "#091415", "line": "#2A383B", "ink": "#EFF5F6", "muted": "#AABBBE", "green": "#47D2E8", "accent": "#FEB16A", "soft": "#1B3D42", "segment": "#3C4B4D"}, "brandPale": "#02707E", "brandDark": "#47D2E8"}, "blue": {"name": "Porcelain", "hanzi": "青花", "light": {"bg": "#F1F5FB", "panel": "#FFFFFF", "elevated": "#FFFFFF", "sidebar": "#F6F9FE", "line": "#DCE0E7", "ink": "#171C24", "muted": "#595F6A", "green": "#2D5DBB", "accent": "#8B6001", "soft": "#E8EDF8", "segment": "#FFFFFF"}, "dark": {"bg": "#080C13", "panel": "#151A22", "elevated": "#20252F", "sidebar": "#0D121A", "line": "#2F3641", "ink": "#F1F3F8", "muted": "#B0B8C5", "green": "#9BBEFF", "accent": "#F2B95A", "soft": "#2D384A", "segment": "#414854"}, "brandPale": "#2D5DBB", "brandDark": "#9BBEFF"}, "lavender": {"name": "Wisteria", "hanzi": "紫藤", "light": {"bg": "#F5F3FA", "panel": "#FFFFFF", "elevated": "#FFFFFF", "sidebar": "#FAF8FD", "line": "#E1DEE6", "ink": "#1D1A23", "muted": "#615D68", "green": "#744AA8", "accent": "#8F5D04", "soft": "#F0EBF5", "segment": "#FFFFFF"}, "dark": {"bg": "#0D0B12", "panel": "#1B1820", "elevated": "#27232D", "sidebar": "#131018", "line": "#37333F", "ink": "#F4F2F7", "muted": "#B9B5C2", "green": "#CCABFE", "accent": "#F8B65D", "soft": "#3B3248", "segment": "#4A4552"}, "brandPale": "#744AA8", "brandDark": "#CCABFE"}, "rose": {"name": "Peach", "hanzi": "桃花", "light": {"bg": "#F9F2F4", "panel": "#FFFFFF", "elevated": "#FFFFFF", "sidebar": "#FDF7F9", "line": "#E5DDE0", "ink": "#22191C", "muted": "#675B5F", "green": "#9C3B66", "accent": "#0A7E3A", "soft": "#F4E9EE", "segment": "#FFFFFF"}, "dark": {"bg": "#110A0C", "panel": "#20161A", "elevated": "#2D2225", "sidebar": "#170F12", "line": "#3E3136", "ink": "#F7F2F3", "muted": "#C3B2B8", "green": "#FF9AC0", "accent": "#83DC97", "soft": "#482E38", "segment": "#514448"}, "brandPale": "#9C3B66", "brandDark": "#FF9AC0"}, "imperial": {"name": "Cinnabar", "hanzi": "朱砂", "light": {"bg": "#FAF3F1", "panel": "#FFFFFF", "elevated": "#FFFFFF", "sidebar": "#FDF8F6", "line": "#E6DDDC", "ink": "#231917", "muted": "#685C5A", "green": "#AF2D20", "accent": "#876204", "soft": "#F6E8E6", "segment": "#FFFFFF"}, "dark": {"bg": "#120A09", "panel": "#201715", "elevated": "#2D2220", "sidebar": "#180F0D", "line": "#3F3230", "ink": "#F7F2F1", "muted": "#C4B3B0", "green": "#FFA192", "accent": "#EEBB58", "soft": "#48302C", "segment": "#524442"}, "brandPale": "#AF2D20", "brandDark": "#FFA192"}, "amber": {"name": "Amber", "hanzi": "琥珀", "light": {"bg": "#F7F4EF", "panel": "#FFFFFF", "elevated": "#FFFFFF", "sidebar": "#FBF9F5", "line": "#E3DFDA", "ink": "#201B15", "muted": "#645E57", "green": "#885700", "accent": "#AB4238", "soft": "#F2EDE3", "segment": "#FFFFFF"}, "dark": {"bg": "#100B07", "panel": "#1E1812", "elevated": "#2A241D", "sidebar": "#15110B", "line": "#3B342C", "ink": "#F6F3EF", "muted": "#BFB6AB", "green": "#F5AE4B", "accent": "#FEABA0", "soft": "#45331C", "segment": "#4D463E"}, "brandPale": "#885700", "brandDark": "#F5AE4B"}, "sage": {"name": "Bamboo", "hanzi": "竹青", "light": {"bg": "#F3F5F0", "panel": "#FFFFFF", "elevated": "#FFFFFF", "sidebar": "#F8FAF6", "line": "#DEE1DB", "ink": "#1A1D16", "muted": "#5D6158", "green": "#4D7004", "accent": "#A74A04", "soft": "#EBEFE3", "segment": "#FFFFFF"}, "dark": {"bg": "#0B0D08", "panel": "#181B14", "elevated": "#23271F", "sidebar": "#10130C", "line": "#33372E", "ink": "#F2F4F0", "muted": "#B4BAAE", "green": "#A3CF68", "accent": "#FFAE85", "soft": "#313B23", "segment": "#454A40"}, "brandPale": "#4D7004", "brandDark": "#A3CF68"}, "black": {"name": "Ink", "hanzi": "墨", "light": {"bg": "#F4F4F4", "panel": "#FFFFFF", "elevated": "#FFFFFF", "sidebar": "#F9F9F9", "line": "#DFDFDF", "ink": "#1C1C1C", "muted": "#5F5F5F", "green": "#2E2E2E", "accent": "#AF3E30", "soft": "#EAEAEA", "segment": "#FFFFFF"}, "dark": {"bg": "#0C0C0C", "panel": "#191919", "elevated": "#252525", "sidebar": "#121212", "line": "#353535", "ink": "#F3F3F3", "muted": "#B7B7B7", "green": "#D8BA79", "accent": "#FEAC9E", "soft": "#3B362A", "segment": "#484848"}, "brandPale": "#2E2E2E", "brandDark": "#D8BA79"}};
  for(const k of Object.keys(PALETTES))if(!next[k])delete PALETTES[k];
  for(const k of Object.keys(next))delete PALETTES[k];
  Object.assign(PALETTES,next);
  if(!PALETTES[state.settings.palette])state.settings.palette='jade';
})();

/* Sidebar brand: an app icon and the course you're in. */
function axBrand(){
  const brand=document.querySelector('.brand.chinese-wordmark');if(!brand)return;
  const course=(typeof COURSE_REGISTRY!=='undefined'&&COURSE_REGISTRY.find(c=>c.id===selectedCourseId)?.name)||'Chinese 1';
  if(!brand.querySelector('.ax-app-icon'))brand.innerHTML='<span class="ax-app-icon" lang="zh" aria-hidden="true">中</span><span class="ax-brand-text"><strong></strong><small></small></span>';
  brand.querySelector('strong').textContent=state.profile?.name?state.profile.name+'’s Chinese':'Eric’s Chinese';
  brand.querySelector('small').textContent=course;brand.setAttribute('aria-label',course);
}

/* Course switch as a segmented control. */
function axCourseSeg(){
  if(typeof COURSE_REGISTRY==='undefined')return '';
  return `<div class="ax-course-seg" role="group" aria-label="Course">${COURSE_REGISTRY.map(c=>`<button type="button" aria-pressed="${c.id===selectedCourseId}" onclick="axSwitchCourse('${c.id}')">${esc(c.name)}</button>`).join('')}</div>`;
}
function axSwitchCourse(id){if(id===selectedCourseId)return;switchCourse(id,currentView==='home'?'home':'learn')}
if(typeof courseSelectorMarkup==='function')courseSelectorMarkup=function(){return axCourseSeg()};

/* Sidebar navigation in two groups: study first, everything else under More. */
const AX_PRIMARY=["navigate('home')","navigate('learn')","openScrollQuickAccess()","navigate('review')"];
function axGroupNav(){
  const nav=$('nav');if(!nav||nav.querySelector('.ax-nav-label'))return;
  const buttons=[...nav.querySelectorAll(':scope>button')];if(buttons.length<6)return;
  const primary=AX_PRIMARY.map(a=>buttons.find(b=>b.getAttribute('onclick')===a)).filter(Boolean),rest=buttons.filter(b=>!primary.includes(b));
  nav.querySelectorAll(':scope>.nav-companion-divider').forEach(d=>d.remove());
  const label=document.createElement('div');label.className='ax-nav-label';label.textContent='More';
  nav.replaceChildren(...primary,label,...rest);
}

/* Navigation bar: a large title that hands off to the small title as it scrolls away. */
const AX_ROOT=['home','learn','review','tools','arcade','stats','common','journey'];
let axTitleObserver=null,axObservedTitle=null;
function axSyncTitle(){
  const body=document.body,h1=[...document.querySelectorAll('#view h1')].find(h=>h.offsetParent!==null&&!h.classList.contains('scroll-sr-only'));
  body.classList.toggle('ax-root',AX_ROOT.includes(currentView));
  body.classList.toggle('ax-has-title',!!h1);
  if(h1===axObservedTitle)return;
  axTitleObserver?.disconnect();axObservedTitle=h1||null;body.classList.remove('ax-title-gone');
  if(!h1||!('IntersectionObserver' in window))return;
  axTitleObserver=new IntersectionObserver(entries=>{if(axObservedTitle!==h1||!h1.isConnected)return;const entry=entries.find(e=>e.target===h1);if(entry)body.classList.toggle('ax-title-gone',!entry.isIntersecting)},{rootMargin:'-56px 0px 0px 0px'});
  axTitleObserver.observe(h1);
}
addEventListener('scroll',()=>document.body.classList.toggle('ax-scrolled',scrollY>4),{passive:true});

/* Settings-style icon tiles: each destination keeps one system color everywhere it appears. */
const AX_TILES=[["navigate('common')",'blue'],["navigate('review')",'indigo'],["navigate('lab')",'orange'],["navigate('write')",'pink'],["navigate('read')",'teal'],["openExploreSection('components')",'purple'],["startListeningPractice()",'red'],["navigate('search')",'gray'],["navigate('labdecks')",'green'],["navigate('arcade')",'yellow'],["navigate('stats')",'mint']];
function axTileFor(onclick){return (AX_TILES.find(([a])=>onclick?.includes(a))||[,'gray'])[1]}

/* Shared row affordance. Home now renders its own native disclosure directly. */
const AX_CHEVRON='<svg class="ax-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
function axToolList(){
  document.querySelectorAll('.flow-tool-grid .flow-tool').forEach(b=>{if(b.dataset.axTile)return;b.dataset.axTile=axTileFor(b.getAttribute('onclick'));b.querySelector(':scope>span')?.classList.add('ax-tile','ax-'+b.dataset.axTile);if(!b.querySelector('.ax-chev'))b.insertAdjacentHTML('beforeend',AX_CHEVRON)});
}

/* Related forms share a visual cue, not an asserted semantic role or etymology.
   Keep ambiguous lookalikes such as 月 and the two 阝 forms neutral. Chinese
   glyphs, existing part names, accessible labels, and lookup actions stay intact. */
const AX_FAMILIES={water:'水氵',people:'人亻',speech:'言讠訁',hand:'手扌',heart:'心忄⺗',wood:'木',plant:'艹艸',move:'辶辵',metal:'金钅釒',home:'宀',silk:'糸纟糹',cloth:'衣衤'};
const AX_FAMILY_OF=Object.create(null);
for(const [id,forms] of Object.entries(AX_FAMILIES))for(const form of forms)AX_FAMILY_OF[form]=id;
function axFamily(root){
 if(!root)return;
 root.querySelectorAll('.memory-piece,.memory-part-chip,.memory-inline-part').forEach(el=>{
  const glyph=el.querySelector('[lang=zh]')?.textContent.trim()||el.textContent.trim();
  if(el.dataset.axFamilyGlyph===glyph)return;
  el.dataset.axFamilyGlyph=glyph;
  const family=AX_FAMILY_OF[glyph];
  if(family)el.dataset.family=family;else delete el.dataset.family;
 });
 root.querySelectorAll('.memory-part-legend').forEach(legend=>{
  if(legend.dataset.axFamilyNote||!legend.querySelector('[data-family]'))return;
  legend.dataset.axFamilyNote='1';
  legend.insertAdjacentHTML('afterend','<p class="ax-family-note">Matching colors link related component forms. Their roles vary by character.</p>');
 });
}

/* The workbook square goes behind single hero characters. */
const AX_HERO='.rx-quiet-glyph,.scroll-glyph,.feed-hero-glyph,.studio-card .han,.clean-character-scene>.han,.flashcard .han,.focus-card .han,.memory-core>.han,.writing-model .han,.modal .han,.clean-study-title>span,.flow-next-art>span,.feed-home-symbol,.contrast-glyph,.practice-detail-title>span[lang=zh],.listening-quiz-card .quiz-choice>span';
function axDecorate(root=document){
  if(!root)return;
  axFamily(root);
  root.querySelectorAll(AX_HERO).forEach(el=>{
    if(el.classList.contains('ax-tzg')||el.children.length)return;
    const t=el.textContent.trim();
    if([...t].length===1&&/\p{Script=Han}/u.test(t))el.classList.add('ax-tzg');
  });
  root.querySelectorAll('.palette-choice').forEach(b=>{const id=(b.getAttribute('onclick')||'').match(/'palette','([a-z]+)'/)?.[1],p=PALETTES[id];if(!p)return;const mode=document.documentElement.dataset.theme==='dark'?'dark':'light',c=p[mode];if(b.dataset.ax===mode)return;b.dataset.ax=mode;b.title=p.name+' · '+p.hanzi;b.style.setProperty('--ax-dot',c.green);const dot=b.querySelector('.palette-dot');if(dot){dot.style.background=`radial-gradient(circle at 50% 50%,${c.green} 0 38%,transparent 40%),linear-gradient(135deg,${c.bg},${c.panel})`;dot.style.borderColor='transparent'}if(!b.querySelector('.ax-hanzi'))b.insertAdjacentHTML('beforeend',`<small class="ax-hanzi" lang="zh">${p.hanzi}</small>`)});
}
let axFrame=0;
const axObserver=new MutationObserver(()=>{if(axFrame)return;axFrame=requestAnimationFrame(()=>{axFrame=0;axToolList();axDecorate($('view'));axDecorate($('overlay'));axSyncTitle()})});

const axChromeBase=chrome;
chrome=function(...args){
  const r=axChromeBase(...args);
  axBrand();axGroupNav();
  const sideSeg=document.querySelector('.sidebar .ax-course-seg');
  if(!sideSeg)document.querySelector('.sidebar .nav')?.insertAdjacentHTML('beforebegin',axCourseSeg());
  else sideSeg.outerHTML=axCourseSeg();
  document.body.dataset.view=currentView;
  axSyncTitle();
  return r;
};

theme();chrome();axToolList();axDecorate($('view'));axDecorate($('overlay'));
axObserver.observe(document.body,{childList:true,subtree:true});
if(currentView==='home')renderHome();else if(currentView==='settings')renderSettings();

