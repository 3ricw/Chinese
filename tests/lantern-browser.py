"""Exercise the deployed entry point with Playwright in Chromium and WebKit."""
import argparse
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]


class QuietFiles(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass


def finish_prep(page):
    for _ in range(40):
        if not page.locator('.ln-lesson').count():
            return
        if page.get_by_role('group', name='Choose the meaning').count() and not page.locator('.ln-feedback').count():
            meaning = page.evaluate("LANE_WORDS.get(lanePrepLive(laneToken).step.word).meaning")
            page.get_by_role('button', name=meaning, exact=True).click()
        page.locator('.ln-dock .ln-button').click()
    raise AssertionError('Preparation did not reach the conversation')


def check_pinyin_choices(page):
    group = page.get_by_role('group', name='Pinyin', exact=True)
    expect(group.get_by_role('radio')).to_have_count(3)
    original = page.evaluate('state.settings.theme')
    try:
        for mode in ['dark', 'light']:
            page.evaluate("mode=>{state.settings.theme=mode;theme()}", mode)
            for label in ['No pinyin', 'New words', 'All words']:
                choice = group.get_by_role('radio', name=label, exact=True)
                expect(choice).to_be_visible()
                ratio = choice.evaluate("""input=>{
                    const style=getComputedStyle(input.nextElementSibling);
                    function luminance(color){
                      const rgb=color.match(/[0-9.]+/g).slice(0,3).map(Number).map(n=>{
                        const v=n/255; return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;
                      });
                      return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
                    }
                    const a=luminance(style.color), b=luminance(style.backgroundColor);
                    return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
                }""")
                assert ratio>=4.5,(mode,label,ratio)
            assert group.evaluate('el=>el.getBoundingClientRect().right<=innerWidth+1')
        # A native radio group also works from the keyboard without opening a menu.
        group.get_by_role('radio',name='New words').focus()
        page.keyboard.press('ArrowRight')
        expect(group.get_by_role('radio',name='All words')).to_be_checked()
        expect(group.get_by_role('radio',name='All words')).to_be_focused()
        group.get_by_role('radio',name='New words').check()
    finally:
        page.evaluate("mode=>{state.settings.theme=mode;theme()}", original)


def run(engine, url, artifacts):
    artifacts.mkdir(parents=True, exist_ok=True)
    browser = engine.launch()
    try:
        for width, height in [(320, 568), (390, 844), (883, 735), (1280, 860)]:
            label = f'{engine.name}-{width}'
            mobile = width < 600
            ctx = browser.new_context(viewport={'width': width, 'height': height}, is_mobile=mobile,
                                      has_touch=mobile, reduced_motion='reduce' if width == 320 else 'no-preference')
            page = ctx.new_page()
            errors = []
            missing = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.on('response', lambda resp: missing.append((resp.status, resp.url)) if resp.status >= 400 and resp.url.startswith(url) else None)
            page.set_default_timeout(8500)
            page.goto(url)
            try:
                page.wait_for_function("window.appBoot && appBoot.status()==='ready'")
                expect(page.get_by_role('dialog')).to_be_visible()
                expect(page.get_by_role('heading', name='Learn to read Chinese')).to_be_visible()
                expect(page.locator('.ln-intro .ln-word-card rt')).to_have_text(['nǐ','hǎo'])
                expect(page.get_by_role('button',name='Hear 好',exact=True)).to_be_visible()
                assert page.locator('.ln-intro .ln-word-card').evaluate_all("cards=>cards.length===2 && Math.abs(cards[0].offsetTop-cards[1].offsetTop)<2 && cards[0].offsetLeft<cards[1].offsetLeft")
                expect(page.get_by_role('button',name='Hear 你')).to_be_visible()
                check_pinyin_choices(page)
                page.screenshot(path=artifacts/f'{label}-welcome.png')
                page.get_by_role('button',name='Build a greeting').click()
                expect(page.locator('.ln-intro .ln-word-card')).to_have_count(1)
                expect(page.locator('.ln-intro')).to_contain_text('nǐ hǎo')
                expect(page.get_by_role('button',name='Hear 你好',exact=True)).to_be_visible()
                expect(page.locator('.ln-intro')).to_contain_text('hello')
                assert page.locator('.ln-intro').evaluate("el=>el.scrollWidth<=el.clientWidth+1")
                page.screenshot(path=artifacts/f'{label}-greeting.png')
                page.get_by_role('button',name='Greet Lin',exact=True).click()
                expect(page.locator('.ln-first-reply')).to_contain_text('Hello! I’m Xiao Lin.')
                page.get_by_role('radio',name='No pinyin',exact=True).check()
                expect(page.locator('.ln-first-reply rt')).to_have_count(0)
                page.get_by_role('radio',name='New words',exact=True).check()
                page.get_by_role('button', name='Choose a starting point').click()
                page.get_by_role('button', name='I’m starting fresh', exact=False).click()
                page.locator('.jy-setup-actions .primary').click()
                expect(page.get_by_role('heading',name='Chinese 1: the beginner course')).to_be_visible()
                expect(page.get_by_role('dialog')).not_to_contain_text('Chinese 2')
                expect(page.locator('.ln-scene-preview')).to_contain_text('Lantern Lane is a street market')
                page.get_by_role('button',name='Choose name & companion').click()
                page.locator('#jy-name').fill('Eric')
                page.locator('.jy-setup-actions .primary').click()
                expect(page.locator('.ln-exercise h1')).to_have_text('Meet three characters.')
                page.screenshot(path=artifacts/f'{label}-characters.png')
                page.get_by_role('button',name='Try reading them').click()
                page.get_by_role('button',name='good',exact=True).click()
                expect(page.locator('.ln-feedback')).to_contain_text('Look at the shape again')
                page.get_by_role('radio',name='No pinyin',exact=True).check()
                expect(page.locator('.ln-round rt')).to_have_count(0)
                page.get_by_role('button',name='Pause lesson and go Home').click()
                page.reload()
                page.locator('.ln-home-next .ln-button').click()
                expect(page.get_by_role('radio',name='No pinyin',exact=True)).to_be_checked()
                expect(page.get_by_role('button',name='Try again')).to_be_visible()
                page.get_by_role('button',name='Try again').click()
                page.get_by_role('radio',name='New words',exact=True).check()
                finish_prep(page)
                expect(page.locator('.ln-exercise h1')).to_have_text('Greet Lin back.')
                page.get_by_role('radio',name='All words',exact=True).check()
                expect(page.locator('.ln-bubble rt')).to_have_text('nǐ hǎo')
                page.locator('.ln-option').filter(has_text='你好').click()
                page.get_by_role('radio',name='No pinyin',exact=True).check()
                expect(page.locator('.ln-round rt')).to_have_count(0)
                expect(page.locator('.ln-option.is-selected')).to_contain_text('你好')
                page.get_by_role('button',name='Check answer').click()
                page.locator('.ln-dock .ln-button').click()
                expect(page.locator('.ln-exercise h1')).to_have_text('Introduce yourself as Xiao An.')
                expect(page.locator('.ln-dock .ln-button')).to_be_disabled()
                page.get_by_role('button',name='Add 叫',exact=True).click()
                page.get_by_role('button',name='Remove 叫',exact=True).click()
                page.get_by_role('button',name='Add 我',exact=True).click()
                page.get_by_role('button',name='Pause conversation and go Home').click()
                page.reload()
                page.wait_for_function("window.appBoot && appBoot.status()==='ready'")
                expect(page.get_by_role('dialog')).to_have_count(0)
                page.locator('.ln-home-next .ln-button').click()
                expect(page.locator('.ln-answer-line .ln-chip')).to_have_text('我')
                page.get_by_role('button',name='Add 叫',exact=True).click()
                page.get_by_role('button',name='Add 小安',exact=True).click()
                page.screenshot(path=artifacts/f'{label}-build.png')
                page.get_by_role('button',name='Check answer').click()
                expect(page.locator('.ln-feedback')).to_contain_text('That’s right')
                page.locator('.ln-dock .ln-button').click()
                for zh, en in [('你','you'),('我','I / me'),('好','good')]:
                    page.locator('.ln-pair-col').nth(0).get_by_role('button',name=zh,exact=True).click()
                    page.locator('.ln-pair-col').nth(1).get_by_role('button',name=en,exact=True).click()
                page.locator('.ln-dock .ln-button').click()
                page.locator('.ln-option').filter(has_text='谢谢').click()
                page.get_by_role('button', name='Check answer').click()
                expect(page.locator('.ln-feedback')).to_contain_text('revisit')
                page.locator('.ln-dock .ln-button').click()
                expect(page.locator('.ln-kicker')).to_have_text('Previous mistake')
                page.locator('.ln-option').filter(has_text='再见').click()
                page.get_by_role('button',name='Check answer').click()
                page.get_by_role('button',name='Collect my stamp').click()
                expect(page.get_by_text('Passport stamp collected')).to_be_visible()
                assert page.evaluate("laneData().stamps.gate.days===1 && Object.keys(state.cards).length===0")
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+1")
                page.screenshot(path=artifacts/f'{label}-stamp.png')
                page.get_by_role('button',name='Back to my route').click()
                home_order=page.evaluate("""['.rx-hero','.rx-home-chapter','.ln-home'].map(s=>document.querySelector(s).getBoundingClientRect().top)""")
                assert home_order[0]<home_order[1]<home_order[2],home_order
                expect(page.locator('.rx-hero').get_by_role('button',name='Open Scroll')).to_be_visible()
                expect(page.locator('.ln-home-next').get_by_role('button',name='Practice scene')).to_be_visible()
                page.locator('.rx-hero').scroll_into_view_if_needed()
                page.screenshot(path=artifacts/f'{label}-chapter-home.png')
                page.locator('.ln-map summary').click()
                expect(page.locator('.ln-map-stop.is-stamped')).to_have_count(1)
                expect(page.get_by_role('button',name='Replay welcome')).to_be_visible()
                page.screenshot(path=artifacts/f'{label}-route.png')
                page.get_by_role('button',name='Replay welcome').click()
                page.get_by_role('button',name='Explore the app').click()
                assert page.evaluate("state.profile.name==='Eric' && Object.keys(laneData().stamps).length===1")
                page.evaluate("switchCourse('chinese-2','home');setSetting('script','traditional');navigate('home');laneStart('books')")
                expect(page.locator('.ln-word-card').first).to_contain_text('書')
                finish_prep(page)
                expect(page.locator('.ln-bubble')).to_contain_text('書')
                page.get_by_role('button',name='Show translation').click()
                expect(page.locator('.ln-bubble')).to_contain_text('Which book')
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+1")
                for dest in ['learn','review','tools','common','read','write','settings','arcade','home']:
                    page.evaluate("dest=>navigate(dest)",dest)
                    assert page.locator('#view').inner_text().strip(),dest
                assert page.evaluate("state.profile.name==='Eric' && selectedCourseId==='chinese-2'")
                if width==320:
                    duration=page.locator('.ln-lights i').first.evaluate("el=>getComputedStyle(el).animationDuration")
                    assert duration=='0s', duration
                page.evaluate("switchCourse('chinese-1','learn')")
                page.locator('.course-continue').get_by_role('button',name='Guided cards',exact=True).click()
                expect(page.locator('.jy-question-card')).to_be_visible()
                page.get_by_role('button',name='Pause and save lesson').click()
                expect(page.locator('.course-polished')).to_be_visible()
                page.evaluate("openChapter('2')")
                page.locator('.flow-launch').get_by_role('button',name='Guided cards',exact=True).click()
                assert page.evaluate("trailRun().lesson==='2'")
                page.get_by_role('button',name='Pause and save lesson').click()
                page.locator('.flow-launch').get_by_role('button',name='Start Scroll').click()
                cards=page.locator('.jy-feed-cards')
                if width>=800:
                    expect(cards).to_be_visible()
                    page.screenshot(path=artifacts/f'{label}-desktop-scroll.png')
                    saved_scroll=page.evaluate("state.scrollSession.id")
                    cards.click()
                    assert page.evaluate("trailRun().lesson==='2'")
                    page.get_by_role('button',name='Pause and save lesson').click()
                    assert page.evaluate("currentView==='scroll' && state.scrollSession.id")==saved_scroll
                else:
                    expect(cards).to_be_hidden()
                page.evaluate("""navigate('home');trailBegin('I');
                    for(let n=0;n<20 && trailStep().kind!=='recall';n++){
                      const r=trailRun(),s=trailStep(),args=[r.id,r.pos,trailViewToken];
                      if(s.kind==='choose'&&!r.feedback)trailChoose(s.ch,...args);else trailNext(...args);
                    }""")
                expect(page.locator('.jy-character')).to_have_text('人')
                font_size=page.locator('.jy-character').evaluate("el=>parseFloat(getComputedStyle(el).fontSize)")
                assert font_size>=110,font_size
                if width>=800:
                    gap=page.evaluate("document.querySelector('.jy-dock').getBoundingClientRect().top-document.querySelector('.jy-study-tools').getBoundingClientRect().bottom")
                    assert gap<=40,gap
                page.screenshot(path=artifacts/f'{label}-recall.png')
                before=page.evaluate("({id:trailRun().id,chars:trailRun().steps.map(s=>s.ch)})")
                page.evaluate("""while(!trailRun().done){
                  const r=trailRun(),s=trailStep(),args=[r.id,r.pos,trailViewToken];
                  if(s.kind==='recall'&&!r.revealed)trailReveal(...args);
                  else if(s.kind==='recall'&&!r.feedback)trailRate('good',...args);
                  else trailNext(...args);
                }""")
                page.get_by_role('button',name='Next set',exact=True).click()
                expect(page.locator('.jy-question-card')).to_be_visible()
                assert page.evaluate("old=>currentView==='trail'&&trailRun().lesson==='I'&&trailRun().id!==old.id&&trailRun().steps.every(s=>!old.chars.includes(s.ch))",before)

                if width==320:
                    quick=browser.new_page(viewport={'width':320,'height':568})
                    try:
                        quick.goto(url)
                        quick.get_by_role('button',name='Go straight to lessons').click()
                        quick.locator('.jy-setup-actions .primary').click()
                        quick.get_by_role('button',name='Choose name & companion').click()
                        expect(quick.locator('#jy-name')).to_be_visible()
                        quick.get_by_role('button',name='Study without a companion').click()
                        quick.get_by_role('button',name='Start with characters').click()
                        expect(quick.locator('.ln-exercise h1')).to_have_text('Meet three characters.')
                        assert quick.evaluate("selectedCourseId==='chinese-1'&&state.profile.setupDone&&!state.companion.starter")
                    finally:
                        quick.close()
                page.evaluate("navigate('home')")
                shortcut=page.get_by_role('link',name='CHI 604 · Final study course')
                bounds=shortcut.bounding_box()
                bar=page.locator('.topbar').bounding_box()
                assert bounds and bar and bounds['x']>=bar['x']-2 and bounds['width']<280
                if width==883:
                    page.evaluate("state.settings.theme='light';state.settings.palette='sky';theme();save()")
                app_palette=page.evaluate("({accent:getComputedStyle(document.documentElement).getPropertyValue('--green').trim(),mode:document.documentElement.dataset.theme})")
                shortcut.click()
                expect(page.get_by_role('heading',name='Final character flashcards')).to_be_visible()
                assert page.evaluate("document.documentElement.dataset.theme") == app_palette['mode']
                assert page.evaluate("document.documentElement.scrollWidth<=innerWidth")
                for ch in ['我','明','天']:
                    expect(page.locator('#face h2')).to_have_text(ch)
                    expect(page.locator('.reading')).to_be_visible()
                    page.keyboard.press('ArrowRight')
                expect(page.locator('#face h2')).to_have_text('我')
                expect(page.locator('.reading')).to_have_count(0)
                page.keyboard.press('h')
                expect(page.locator('.hint-reading')).to_have_text('wǒ')
                page.keyboard.press('Space')
                page.keyboard.press('1')
                page.reload()
                expect(page.locator('#face h2')).to_have_text('明')
                page.keyboard.press('Space')
                page.keyboard.press('3')
                expect(page.locator('#face h2')).to_have_text('也')
                page.goto(url+'final/grammar.html')
                expect(page.get_by_role('heading',name='Final character flashcards')).to_be_visible()
                expect(page.locator('#face h2')).to_have_text('也')
                assert not errors, errors
                assert not missing, missing
                print(f'PASS {label}: onboarding, answer correction, tiles, pairs, resume, stamp, route, both courses and legacy destinations',flush=True)
            except Exception as error:
                state=page.evaluate("({view:typeof currentView==='string'?currentView:null,scene:typeof laneSceneId==='string'?laneSceneId:null,heading:document.querySelector('#view h1')?.textContent,body:document.body.innerText.slice(-400)})")
                detail=(str(error)+' '+str(state)+' '+str(errors))[:2200].replace('%','%25').replace('\r','%0D').replace('\n','%0A')
                print(f'::error::{label} {detail}',flush=True)
                page.screenshot(path=artifacts/f'{label}-failure.png')
                print('Page state',page.evaluate("({view:typeof currentView==='string'?currentView:null,step:typeof onboardingStep==='string'?onboardingStep:null, visible:document.body.innerText.slice(-800)})"),errors,missing,flush=True)
                raise
            finally:
                ctx.close()
    finally:
        browser.close()


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--browser',choices=['chromium','webkit'],default='chromium')
    parser.add_argument('--artifacts',type=Path,default=ROOT/'tests/results/browser')
    args=parser.parse_args()
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietFiles,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:
        with sync_playwright() as playwright:
            run(getattr(playwright,args.browser),f'http://127.0.0.1:{server.server_port}/',args.artifacts)
    finally:
        server.shutdown()
        server.server_close()
