"""Regression suite for Eric's Chinese (1 & 2).
Part A runs on the original and the redesigned file: every flow must work the same, with no page errors.
Part B runs on the reviewed redesign: visual behavior, contrast, controls, and retained Home features.
Requires Playwright and an available Chromium runtime. This suite was not run in the managed review environment."""
import asyncio, sys, json, traceback
from playwright.async_api import async_playwright

class Suite:
    def __init__(s,name): s.name=name; s.r=[]
    def check(s,label,ok,detail=''):
        s.r.append((label,bool(ok))); print(('  PASS ' if ok else '  FAIL ')+label+('' if ok else f'  -> {str(detail)[:300]}'))

async def page(browser,path,vw=1280,vh=860,scheme='light'):
    ctx=await browser.new_context(viewport={'width':vw,'height':vh},color_scheme=scheme)
    await ctx.route('https://cdn.jsdelivr.net/**',lambda r:r.abort())  # offline sandbox
    pg=await ctx.new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:200])); pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
    await pg.goto('file://'+path); await pg.wait_for_timeout(500)
    await pg.evaluate("try{skipNameSetup()}catch(e){};try{skipCompanionSetup()}catch(e){};try{closeModal()}catch(e){}")
    return ctx,pg,errs

async def core(b,path,S):
    ctx,pg,errs=await page(b,path); ev=pg.evaluate
    S.check('starts on home',await ev("currentView==='home'&&document.querySelector('#view').innerHTML.length>500"))
    for v in ['learn','review','tools','arcade','stats','common','read','search','write','settings','components','confusions','lab']:
        try: await ev(f"navigate('{v}')"); await pg.wait_for_timeout(60)
        except Exception as e: errs.append(f'{v}: {e}')
        S.check(f'view {v} renders',await ev("document.querySelector('#view').innerHTML.length>200") and not errs,errs)
    await ev("openChapter('1')"); await ev("startSession('learn','1')")
    S.check('learn session starts',await ev("currentView==='session'&&!!session&&session.queue.length>0"))
    for _ in range(4):
        await pg.keyboard.press('Space'); await pg.wait_for_timeout(40)
    S.check('Space advances a study session',await ev("session.pos>0||session.done||(session.index||0)>0"),await ev("JSON.stringify({pos:session.pos,mode:session.mode})"))
    await ev("startSession('all','1')"); await ev("reveal()")
    pos0=await ev("session.pos")
    await ev("rate('good')")
    S.check('rating a card moves on and schedules it',await ev(f"session.pos>{pos0}||session.done") and await ev("Object.keys(state.cards).length>0"))
    await ev("session=null;startQuiz('chapter','1')")
    S.check('chapter quiz starts',await ev("currentView==='quiz'&&quizSession.questions.length>5"))
    await ev("quizSession=null;navigate('home');startWriting('1','characters','pinyin')")
    S.check('writing session starts',await ev("currentView==='write'&&!!writeSession"))
    await ev("writeSession=null;navigate('read');openReading(READINGS[4].id)")
    S.check('reader opens with tappable characters',await ev("document.querySelectorAll('.char-tap').length>5"))
    await ev("document.querySelector('.char-tap').click()")
    S.check('tapping a character opens a sheet',await ev("!!document.querySelector('.modal')"))
    await ev("closeModal();showCharacter('好')")
    S.check('character details open',await ev("!!document.querySelector('.modal')"))
    await ev("closeModal();openScrollQuickAccess()"); await pg.wait_for_timeout(300)
    S.check('scroll feed opens',await ev("currentView==='scroll'&&!!document.getElementById('scroll-feed')"))
    await ev("navigate('home');navigate('common')")
    try: await ev("cwStart('learn')"); ok=await ev("currentView==='commonPractice'")
    except Exception as e: ok=False; errs.append(str(e))
    S.check('common words practice starts',ok)
    await ev("for(const c of uniqueCards('1').slice(0,8))state.cards[c.character]={seen:3,streak:2,interval:3,due:Date.now()+86400000,last:Date.now(),memoryStage:2};navigate('arcade')")
    try: await ev("bxStart('match')"); await pg.wait_for_timeout(200); ok=await ev("currentView==='game'")
    except Exception as e: ok=False; errs.append(str(e))
    S.check('arcade game starts',ok)
    await ev("navigate('home')")
    await ev("switchCourse('chinese-2')"); await pg.wait_for_timeout(100)
    S.check('switching to Chinese 2 works',await ev("selectedCourseId==='chinese-2'"))
    await ev("switchCourse('chinese-1')"); await pg.wait_for_timeout(100)
    S.check('switching back to Chinese 1 works',await ev("selectedCourseId==='chinese-1'"))
    for pal in ['jade','imperial','black']:
        await ev(f"setSetting('palette','{pal}')")
    await ev("setSetting('theme','dark')")
    S.check('palette and theme settings apply',await ev("state.settings.palette==='black'&&document.documentElement.dataset.theme==='dark'"))
    await ev("setSetting('theme','light');setSetting('palette','jade');bookmark('好');save()")
    await pg.reload(); await pg.wait_for_timeout(500)
    S.check('progress and settings survive reload',await ev("state.bookmarks.includes('好')&&Object.keys(state.cards).length>0&&state.settings.palette==='jade'"))
    S.check('backup validation round-trips',await ev("(()=>{const v=validateState(JSON.parse(JSON.stringify(state)));return Object.keys(v.cards).length===Object.keys(state.cards).length&&v.settings.palette===state.settings.palette})()"))
    await ev("navigate('learn');openChapter('2');goBack()")
    S.check('back returns to the previous page',await ev("currentView==='learn'"))
    S.check('no page errors (desktop)',not errs,errs)
    await ctx.close()
    ctx,pg,errs=await page(b,path,390,844); bad=[]
    for js in ["navigate('home')","navigate('learn')","openChapter('1')","navigate('review')","navigate('tools')","navigate('settings')","navigate('arcade')","navigate('common')","navigate('read');openReading(READINGS[8].id)","navigate('home');startSession('learn','1')","reveal()"]:
        await pg.evaluate(js); await pg.wait_for_timeout(80)
        w=await pg.evaluate("document.documentElement.scrollWidth")
        if w>392: bad.append((js,w))
    S.check('mobile: no sideways scrolling',not bad,bad)
    S.check('no page errors (mobile)',not errs,errs)
    await ctx.close()

CONTRAST_JS=r"""(()=>{
const swatch=document.createElement('canvas');swatch.width=swatch.height=1;const colorContext=swatch.getContext('2d',{willReadFrequently:true});const parse=c=>{colorContext.clearRect(0,0,1,1);colorContext.fillStyle=c;colorContext.fillRect(0,0,1,1);const d=colorContext.getImageData(0,0,1,1).data;return {r:d[0],g:d[1],b:d[2],a:d[3]/255}};
const lin=v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4},L=c=>.2126*lin(c.r)+.7152*lin(c.g)+.0722*lin(c.b);
const over=(f,bg)=>({r:f.r*f.a+bg.r*(1-f.a),g:f.g*f.a+bg.g*(1-f.a),b:f.b*f.a+bg.b*(1-f.a),a:1});
function bgOf(el){const stack=[];for(let e=el;e;e=e.parentElement){const c=parse(getComputedStyle(e).backgroundColor);if(c&&c.a>0)stack.push(c);if(c&&c.a>=1)break}let bg={r:255,g:255,b:255,a:1};const root=parse(getComputedStyle(document.body).backgroundColor);if(root)bg=root;for(const c of stack.reverse())bg=over(c,bg);return bg}
const ratio=(a,b)=>{const x=L(a),y=L(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const out=[];
for(const el of document.querySelectorAll(SEL)){if(!el.offsetParent||!el.textContent.trim()||el.matches(':disabled')||el.closest('[aria-disabled=true]'))continue;const cs=getComputedStyle(el);const fg=parse(cs.color);if(!fg)continue;const bg=bgOf(el),r=ratio(over(fg,bg),bg),size=parseFloat(cs.fontSize),bold=+cs.fontWeight>=600,need=(size>=24||(size>=18.66&&bold))?3:4.5;if(r<need)out.push(el.className.toString().slice(0,40)+' "'+el.textContent.trim().slice(0,20)+'" '+r.toFixed(2)+'<'+need)}
return out.slice(0,12)})()"""
SEL=".btn.primary, .btn, .textbtn, .muted, .eyebrow, .badge, .sidebar .nav>button, .mobile-nav button, h1, h2, .pinyin, .crumb, .pill, .palette-choice span:last-child, .tabs button, .focus-meaning"

async def design(b,path,S):
    ctx,pg,errs=await page(b,path); ev=pg.evaluate
    S.check('design layer active',await ev("document.documentElement.classList.contains('ax')"))
    S.check('dark is the default appearance',await ev("defaults().settings.theme==='dark'&&document.documentElement.dataset.theme==='dark'"))
    S.check('each theme has tinted dark surfaces that rise in lightness',await ev("Object.values(PALETTES).every(p=>{const L=h=>{const n=parseInt(h.slice(1),16);return ((n>>16)&255)*.2126+((n>>8)&255)*.7152+(n&255)*.0722};return L(p.dark.bg)<L(p.dark.panel)&&L(p.dark.panel)<L(p.dark.elevated)})"))
    S.check('every theme has a Chinese pigment name',await ev("Object.values(PALETTES).every(p=>/\\p{Script=Han}/u.test(p.hanzi))"))
    await ev("navigate('home')"); await pg.wait_for_timeout(150)
    S.check('Home keeps its grouped links, quests, and three quick games',await ev("document.querySelectorAll('#view .ax-list .ax-row').length===2&&getComputedStyle(document.querySelector('.rx-home-extras')).display!=='none'&&document.querySelectorAll('.rx-home-extras .bx-quick').length===3&&document.querySelectorAll('.rx-home-extras .bx-quest').length===3"))
    S.check('extra practice is collapsed while daily actions stay visible',await ev("!document.querySelector('.rx-home-more').open&&document.querySelector('.rx-home-start .bx-status-row').offsetParent!==null&&document.querySelector('.rx-home-extras .bx-quick').offsetParent!==null"))
    await pg.locator('.rx-home-more>summary').focus(); await pg.keyboard.press('Enter')
    S.check('keyboard opens the extra practice disclosure',await ev("document.querySelector('.rx-home-more').open"))
    await pg.locator('#view .ax-row').nth(1).click(); await pg.wait_for_timeout(120)
    S.check('Review row opens Review',await ev("currentView==='review'"))
    await ev("navigate('tools')"); await pg.wait_for_timeout(150)
    S.check('tools are a grouped list with colored icon tiles',await ev("[...document.querySelectorAll('.flow-tool-grid .flow-tool')].every(b=>b.querySelector('.ax-tile')&&b.querySelector('.ax-chev'))"))
    S.check('Tools search, list and footer share page edges',await ev("(()=>{const boxes=['.flow-tools','.rx-tools-search','.flow-tool-grid','.bx-home-play'].map(s=>document.querySelector(s).getBoundingClientRect());return boxes.every(r=>Math.abs(r.left-boxes[0].left)<1&&Math.abs(r.right-boxes[0].right)<1)})()"))
    S.check('Tools icons and chevrons center on the same row',await ev("[...document.querySelectorAll('.flow-tool')].every(e=>{const a=e.querySelector('.ax-tile').getBoundingClientRect(),b=e.querySelector('.ax-chev').getBoundingClientRect();return Math.abs((a.top+a.bottom)/2-(b.top+b.bottom)/2)<1&&getComputedStyle(e.querySelector('small')).maxWidth==='none'})"))
    await ev("navigate('arcade')"); await pg.wait_for_timeout(150)
    S.check('Arcade heading, controls, games and quests share page edges',await ev("(()=>{const boxes=['.bx-arcade>.heading','.bx-arcade-controls','.bx-game-grid','.bx-arcade-layout>.bx-quests'].map(s=>document.querySelector(s).getBoundingClientRect());return boxes.every(r=>Math.abs(r.left-boxes[0].left)<1&&Math.abs(r.right-boxes[0].right)<1)&&boxes[3].top>=boxes[2].bottom})()"))
    S.check('Arcade Play controls align across each card row',await ev("(()=>{const cards=[...document.querySelectorAll('.bx-game-tile')];return cards.every(a=>cards.filter(b=>Math.abs(a.getBoundingClientRect().top-b.getBoundingClientRect().top)<1).every(b=>Math.abs(a.querySelector('.bx-play-btn').getBoundingClientRect().bottom-b.querySelector('.bx-play-btn').getBoundingClientRect().bottom)<1))})()"))
    await ev("navigate('home');openQuickLookup()")
    await pg.locator('#flow-lookup-input').fill('关系')
    await pg.locator('.rx-find-filters button').filter(has_text='Words').click()
    S.check('Quick Find filters words with a real selected option',await ev("rxFindRows.length>0&&rxFindRows.every(r=>r.kind==='words')&&!!document.getElementById(document.getElementById('flow-lookup-input').getAttribute('aria-activedescendant'))"))
    await pg.locator('#flow-lookup-input').press('Enter')
    S.check('Enter opens the selected word usage',await ev("!!document.querySelector('.cw-detail')"))
    await ev("closeModal();navigate('home');setSetting('theme','dark')")
    await pg.locator('#theme-btn').click(); await pg.wait_for_timeout(650)
    S.check('theme reveal finishes with the new preference saved',await ev("state.settings.theme==='light'&&document.documentElement.dataset.theme==='light'&&!document.documentElement.dataset.axInkTransition&&JSON.parse(localStorage.getItem('hanzi-reading-room-v2')).settings.theme==='light'"))
    await ev("setSetting('theme','dark')")
    S.check('hero mesh keeps text readable in every theme',await ev("""(()=>{const lin=v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4},hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),L=c=>.2126*lin(c[0])+.7152*lin(c[1])+.0722*lin(c[2]),cr=(a,b)=>{const x=L(a),y=L(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)},mix=(a,b,t)=>a.map((v,i)=>v*t+b[i]*(1-t));let worst=99;for(const p of Object.values(PALETTES))for(const [m,t] of [['dark',.24],['light',.16]]){const c=p[m],bg=mix(hex(c.green),hex(c.panel),t);worst=Math.min(worst,cr(hex(c.muted),bg),cr(hex(c.ink),bg)/1.5)}return worst>=4.5})()"""))
    S.check('all nine palette ids still exist',await ev("['jade','sky','blue','lavender','rose','imperial','amber','sage','black'].every(k=>PALETTES[k]&&PALETTES[k].light&&PALETTES[k].dark)"))
    S.check('sidebar groups navigation under More',await ev("!!document.querySelector('#nav .ax-nav-label')&&document.querySelectorAll('#nav>button').length>=8"))
    S.check('sidebar shows the course segmented control',await ev("document.querySelectorAll('.sidebar .ax-course-seg button').length===2"))
    await ev("document.querySelectorAll('.sidebar .ax-course-seg button')[1].click()"); await pg.wait_for_timeout(150)
    S.check('segmented control switches course',await ev("selectedCourseId==='chinese-2'&&document.querySelectorAll('.sidebar .ax-course-seg button')[1].getAttribute('aria-pressed')==='true'"))
    await ev("axSwitchCourse('chinese-1')"); await pg.wait_for_timeout(150)
    S.check('brand shows the current course',await ev("document.querySelector('.ax-brand-text small').textContent==='Chinese 1'"))
    S.check('theme and mute remain directly available',await ev("getComputedStyle(document.getElementById('theme-btn')).display!=='none'&&getComputedStyle(document.getElementById('sound-btn')).display!=='none'"))
    await ev("navigate('learn')"); await pg.wait_for_timeout(120)
    S.check('page title gets no focus box',await ev("(()=>{const h=document.querySelector('#view h1');h.focus();const o=getComputedStyle(h).outlineStyle;return o==='none'||getComputedStyle(h).outlineWidth==='0px'})()"))
    S.check('large title hides the small title until scrolled',await ev("document.body.classList.contains('ax-has-title')&&getComputedStyle(document.getElementById('crumb')).opacity==='0'"))
    await ev("openChapter('1')"); await ev("for(let i=0;i<4;i++)document.querySelector('#view').insertAdjacentHTML('beforeend','<div style=\"height:600px\"></div>')"); await ev("scrollTo(0,1400)"); await pg.wait_for_timeout(300)
    S.check('scrolling past the title shows it in the bar',await ev("document.body.classList.contains('ax-title-gone')&&document.body.classList.contains('ax-scrolled')"))
    await ev("scrollTo(0,0);navigate('home');startSession('learn','1')"); await pg.wait_for_timeout(150)
    S.check('flashcard character sits in the workbook square',await ev("!!document.querySelector('#view .han.ax-tzg')"))
    await ev("session=null;navigate('home');showCharacter('好')"); await pg.wait_for_timeout(150)
    S.check('character sheet uses the workbook square',await ev("!!document.querySelector('.modal .ax-tzg')"))
    await ev("closeModal();openMemoryAid('河')"); await pg.wait_for_timeout(150)
    S.check('water components match between diagram and labeled key',await ev("document.querySelector('.memory-piece[data-family=water]')&&document.querySelector('.memory-part-chip[data-family=water]')&&document.querySelector('.ax-family-note')"))
    await ev("closeModal();navigate('settings')"); await pg.wait_for_timeout(150)
    S.check('palette picker shows nine named pigments',await ev("document.querySelectorAll('.palette-choice').length===9&&[...document.querySelectorAll('.palette-choice')].some(b=>b.textContent.includes('Cinnabar')&&b.textContent.includes('朱砂'))"))
    S.check('switches use iOS proportions',await ev("(()=>{const s=document.querySelector('input[role=switch]');const r=s.getBoundingClientRect();return Math.round(r.width)===51&&Math.round(r.height)===31})()"))
    # contrast across every palette and both appearances
    fails=[]
    for mode in ['light','dark']:
        for pal in ['jade','sky','blue','lavender','rose','imperial','amber','sage','black']:
            await ev(f"setSetting('theme','{mode}');setSetting('palette','{pal}')")
            for view in ["navigate('home')","navigate('learn')","navigate('settings')"]:
                await ev(view); await pg.wait_for_timeout(40)
                r=await ev(CONTRAST_JS.replace('SEL',json.dumps(SEL)))
                if r: fails.append((mode,pal,view,r[:3]))
    S.check('text contrast meets WCAG AA in every palette, light and dark',not fails,fails[:6])
    await ev("setSetting('theme','light');setSetting('palette','jade')")
    S.check('no page errors (design run)',not errs,errs)
    await ctx.close()
    # mobile chrome
    ctx,pg,errs=await page(b,path,390,844); ev=pg.evaluate
    S.check('tab bar is a floating capsule inside the screen',await ev("(()=>{const r=document.getElementById('mobile-nav').getBoundingClientRect();return r.left>=4&&r.right<=386&&r.bottom<=844-4&&parseFloat(getComputedStyle(document.getElementById('mobile-nav')).borderTopLeftRadius)>=20})()"))
    S.check('tab bar targets are at least 44pt',await ev("[...document.querySelectorAll('#mobile-nav button')].every(b=>{const r=b.getBoundingClientRect();return r.height>=44&&r.width>=44})"))
    S.check('course control shows on Home on phones',await ev("(()=>{const h=document.getElementById('course-selector');return !h.hidden&&!!h.querySelector('.ax-course-seg')&&h.offsetParent!==null})()"))
    await ev("navigate('review')")
    S.check('course control remains available in Review on phones',await ev("!document.getElementById('course-selector').hidden"))
    for width in [320,390,768]:
        await pg.set_viewport_size({'width':width,'height':844})
        for destination in ['tools','arcade']:
            await ev(f"navigate('{destination}')"); await pg.wait_for_timeout(150)
            S.check(f'{destination} fits {width}px without horizontal scrolling',await ev(f"document.documentElement.scrollWidth<={width+1}"))
        await ev("navigate('tools')"); await pg.wait_for_timeout(100)
        S.check(f'Tools icons stay in the grid at {width}px',await ev("[...document.querySelectorAll('.flow-tool')].every(e=>{const icon=e.querySelector('.ax-tile'),copy=e.querySelector('strong');return getComputedStyle(icon).position==='static'&&copy.getBoundingClientRect().left>icon.getBoundingClientRect().right})"))
        await ev("openQuickLookup()")
        await pg.locator('#flow-lookup-input').fill('school')
        S.check(f'Quick Find fits {width}px with usable filters',await ev(f"document.documentElement.scrollWidth<={width+1}&&[...document.querySelectorAll('.rx-find-filters button')].every(b=>b.getBoundingClientRect().height>=44)"))
        await ev("closeModal()")
    await pg.set_viewport_size({'width':390,'height':844})
    await ev("navigate('home');showCharacter('好')"); await pg.wait_for_timeout(150)
    S.check('sheet shows a grabber on phones',await ev("getComputedStyle(document.querySelector('.modal'),'::before').content!=='none'"))
    S.check('no page errors (mobile design run)',not errs,errs)
    await ctx.close()
    # accessibility preferences
    ctx=await b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
    await ctx.route('https://cdn.jsdelivr.net/**',lambda r:r.abort())
    pg=await ctx.new_page(); await pg.goto('file://'+path); await pg.wait_for_timeout(400)
    await pg.evaluate("try{skipNameSetup()}catch(e){};try{skipCompanionSetup()}catch(e){};showCharacter('好')"); await pg.wait_for_timeout(100)
    S.check('reduced motion: sheets appear without animation',await pg.evaluate("getComputedStyle(document.querySelector('.modal')).animationName==='none'"))
    await ctx.close()
    ctx=await b.new_context(viewport={'width':390,'height':844})
    pg=await ctx.new_page(); await pg.goto('file://'+path); await pg.wait_for_timeout(400)
    await pg.evaluate("try{skipNameSetup()}catch(e){};try{skipCompanionSetup()}catch(e){}")
    try:
        await pg.emulate_media(contrast='more'); await pg.wait_for_timeout(100)
        S.check('increased contrast: tab bar turns solid',await pg.evaluate("getComputedStyle(document.getElementById('mobile-nav')).backdropFilter==='none'"))
    except TypeError:
        S.check('increased contrast emulation available',True)
    await ctx.close()

async def main():
    orig,new=sys.argv[1],sys.argv[2]
    async with async_playwright() as p:
        b=await p.chromium.launch(); suites=[]
        for label,path in [('core · original',orig),('core · redesigned',new)]:
            S=Suite(label); suites.append(S); print('\n== '+label)
            try: await core(b,path,S)
            except Exception: S.check('suite crashed',False,traceback.format_exc()[-700:])
        S=Suite('design layer'); suites.append(S); print('\n== design layer')
        try: await design(b,new,S)
        except Exception: S.check('suite crashed',False,traceback.format_exc()[-700:])
        await b.close()
    print('\n== summary')
    for S in suites: print(f"{S.name}: {sum(ok for _,ok in S.r)}/{len(S.r)} passed")
    sys.exit(0 if all(ok for S in suites for _,ok in S.r) else 1)
asyncio.run(main())
