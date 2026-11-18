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


def run(engine, url, artifacts):
    artifacts.mkdir(parents=True, exist_ok=True)
    browser = engine.launch()
    try:
        for width, height in [(320, 568), (390, 844), (1280, 860)]:
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
                expect(page.get_by_role('heading', name='Say hello to Lin.')).to_be_visible()
                check = page.get_by_role('button', name='Check my reply')
                expect(check).to_be_disabled()
                page.screenshot(path=artifacts/f'{label}-welcome.png')
                page.locator('.ln-welcome .ln-option').filter(has_text='谢谢').click()
                check.click()
                expect(page.locator('.ln-feedback')).to_contain_text('thank you')
                page.get_by_role('button', name='Try again').click()
                page.locator('.ln-welcome .ln-option').filter(has_text='你好').click()
                check.click()
                page.get_by_role('button', name='Choose my learning route').click()
                page.get_by_role('button', name='I’m starting fresh', exact=False).click()
                page.locator('.jy-setup-actions .primary').click()
                page.get_by_role('button', name='Chinese 1', exact=False).last.click()
                page.locator('.jy-setup-actions .primary').click()
                page.locator('#jy-name').fill('Eric')
                page.locator('.jy-setup-actions .primary').click()
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
                page.locator('.ln-map summary').click()
                expect(page.locator('.ln-map-stop.is-stamped')).to_have_count(1)
                expect(page.get_by_role('button',name='Replay welcome')).to_be_visible()
                page.screenshot(path=artifacts/f'{label}-route.png')
                page.get_by_role('button',name='Replay welcome').click()
                page.get_by_role('button',name='Explore the app').click()
                assert page.evaluate("state.profile.name==='Eric' && Object.keys(laneData().stamps).length===1")
                page.evaluate("switchCourse('chinese-2','home');setSetting('script','traditional');navigate('home');laneStart('books')")
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
                assert not errors, errors
                assert not missing, missing
                print(f'PASS {label}: onboarding, answer correction, tiles, pairs, resume, stamp, route, both courses and legacy destinations',flush=True)
            except Exception:
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
