import asyncio,json,re
from pathlib import Path
from collections import deque
from playwright.async_api import async_playwright
OUT=Path('/tmp/browser/stabilization/controls'); OUT.mkdir(exist_ok=True)
D=json.loads(Path('/tmp/browser/stabilization/control_data.json').read_text())
AXE=Path('/tmp/browser/axe.min.js').read_text()
results=[]; violations=[]; errors=[]

def path(grid):
 start=next((r,row.index('S')) for r,row in enumerate(grid) if 'S' in row)
 q=deque([(start,[])]); seen={start}
 while q:
  (r,c),seq=q.popleft()
  if grid[r][c]=='E': return seq
  for dr,dc,key in [(-1,0,'ArrowUp'),(1,0,'ArrowDown'),(0,-1,'ArrowLeft'),(0,1,'ArrowRight')]:
   a,b=r+dr,c+dc
   if 0<=a<len(grid) and 0<=b<len(grid[a]) and grid[a][b]!='#' and (a,b) not in seen:
    seen.add((a,b)); q.append(((a,b),seq+[(a,b,key)]))
 raise AssertionError('Unsolvable maze')

async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  for width,lang in [(320,'uk'),(393,'uk'),(320,'en'),(393,'en')]:
   ctx=await browser.new_context(viewport={'width':width,'height':852},has_touch=True,reduced_motion='reduce')
   page=await ctx.new_page(); page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto('http://localhost:8080')
   await page.evaluate("s=>localStorage.setItem('tyhe-mistse-v1',JSON.stringify(s))",{'lang':lang,'age':'mid','sound':False,'music':False,'voice':False,'reduceMotion':True})
   await page.clock.install()
   def L(s,**vars):
    text=D['labels'].get(s,{}).get(lang,s)
    for k,v in vars.items(): text=text.replace('{'+k+'}',str(v))
    return text
   def B(s,**vars): return page.get_by_role('button',name=L(s,**vars),exact=True)
   async def go(route):
    await page.goto('http://localhost:8080'+route,wait_until='networkidle')
    assert await page.get_by_role('main').count()==1
    assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth+1'),(width,route)
   async def shot(name): await page.screenshot(path=str(OUT/f'{width}_{lang}_{name}.png'))
   async def audit(name):
    await page.add_script_tag(content=AXE)
    v=await page.evaluate("async()=> (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))")
    if v: violations.append({'width':width,'lang':lang,'view':name,'violations':v})
   await go('/games')
   for _ in range(3): await B('Бульбашка').first.tap()
   assert '3' in await page.get_by_role('status').inner_text()
   await B('Грати ще раз').click(); assert '0' in await page.get_by_role('status').inner_text()
   await audit('bubbles'); results.append([width,lang,'bubbles pop/replay'])
   await page.get_by_role('tab').nth(1).click()
   await B('Підглянути картки').click()
   cards=page.locator('button[aria-label]').filter(has_text='')
   labels=await page.locator('button[aria-label]').evaluate_all(r"els=>els.map(e=>e.getAttribute('aria-label')).filter(x=>/^Картка \d+:|^Card \d+:/.test(x))")
   assert len(labels)==12,labels
   pairs={}
   for label in labels:
    n=int(re.search(r'\d+',label).group()); name=label.split(': ',1)[1]; pairs.setdefault(name,[]).append(n)
   await page.clock.fast_forward(3100)
   for nums in pairs.values():
    assert len(nums)==2
    for n in nums: await B('Картка {n}: {name}',n=n,name=L('Закрита картка')).click()
    await page.clock.fast_forward(450)
   assert re.findall(r'\d+',await page.get_by_role('status').inner_text())==['6','6']
   await shot('pairs_complete'); await B('Грати ще раз').click()
   await audit('pairs'); results.append([width,lang,'pairs peek/all six/replay'])
   await page.get_by_role('tab').nth(2).click()
   sky=B('Нічне небо для зірок'); await sky.tap(); await sky.focus(); await page.keyboard.press('Enter')
   await B('▶ Заграти сузір\'я').click(); await B('Пауза').click()
   await B('Прибрати останню зірку').click(); await B('Очистити небо').click()
   assert await B('▶ Заграти сузір\'я').is_disabled()
   await audit('stars'); results.append([width,lang,'stars touch/keyboard/play/pause/undo/clear'])
   await page.evaluate('Math.random=()=>0.42')
   await page.get_by_role('tab').nth(3).click()
   await page.clock.fast_forward(2000)
   await B('Квітка {n}',n=2).click(); await page.clock.fast_forward(3000)
   for length in range(2,7):
    for pad in [1,3]+[2]*(length-2): await B('Квітка {n}',n=pad).click()
    if length<6: await page.clock.fast_forward(6000)
   await B('Грати ще раз').wait_for(); await shot('melody_complete')
   await B('Грати ще раз').click(); await B('Послухати').click(); await B('Почати спочатку').click()
   await audit('melody'); results.append([width,lang,'melody wrong-note/retry/six-note completion/replay/listen/reset'])
   await page.get_by_role('tab').nth(4).click()
   for answer in D['patterns']: await B(answer).click()
   await B('Ще раз').click(); await audit('patterns'); results.append([width,lang,'patterns all rounds/replay'])
   await page.get_by_role('tab').nth(5).click()
   await B('1').click()
   for count in [3,4,5,6]:
    for n in range(1,count+1): await B('Зірочка {n}',n=n).click()
    await B(str(count)).click()
   await B('Ще раз').click(); await audit('counting'); results.append([width,lang,'star counting wrong-answer/tap/all rounds/replay'])
   for age,grid in D['mazes'].items():
    await page.evaluate("age=>{let s=JSON.parse(localStorage.getItem('tyhe-mistse-v1'));s.age=age;localStorage.setItem('tyhe-mistse-v1',JSON.stringify(s))}",age)
    await go('/maze'); cells=page.get_by_role('grid').locator('button')
    start=next(r*len(grid[0])+row.index('S') for r,row in enumerate(grid) if 'S' in row)
    await page.keyboard.press('ArrowUp'); assert await cells.nth(start).get_attribute('aria-label')==L('Ліхтарик тут')
    seq=path(grid)
    for r,c,key in seq: await cells.nth(r*len(grid[0])+c).tap()
    await B('Ще раз').wait_for(); await shot('maze_'+age+'_complete')
    await B('Ще раз').click()
    for r,c,key in seq: await page.keyboard.press(key)
    await B('Ще раз').wait_for(); await B('Ще раз').click()
    for r,c,key in seq:
     names={'ArrowUp':('Вгору','Up'),'ArrowDown':('Вниз','Down'),'ArrowLeft':('Ліворуч','Left'),'ArrowRight':('Праворуч','Right')}
     await page.get_by_role('button',name=names[key][lang=='en'],exact=True).click()
    await B('Ще раз').wait_for(); await audit('maze_'+age)
    results.append([width,lang,'maze '+age+' touch/keyboard/arrows/wall/replay'])
   async def draw(canvas):
    await canvas.scroll_into_view_if_needed(); b=await canvas.bounding_box(); assert b
    before=await canvas.evaluate('c=>c.toDataURL()')
    await page.mouse.move(b['x']+b['width']*.25,b['y']+b['height']*.3); await page.mouse.down()
    await page.mouse.move(b['x']+b['width']*.65,b['y']+b['height']*.65,steps=10); await page.mouse.up()
    assert before!=await canvas.evaluate('c=>c.toDataURL()')
    before_touch=await canvas.evaluate('c=>c.toDataURL()')
    cdp=await ctx.new_cdp_session(page)
    for i in range(6):
     await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart' if i==0 else 'touchMove','touchPoints':[{'x':b['x']+b['width']*(.2+i*.08),'y':b['y']+b['height']*.5}]})
    await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]}); await cdp.detach()
    assert before_touch!=await canvas.evaluate('c=>c.toDataURL()')
   await go('/safe-drawing'); canvas=page.locator('canvas'); await draw(canvas)
   for n in range(1,6): await B('Колір {n}',n=n).click()
   await B('Очистити').click(); await draw(canvas); await B('Зберегти в галерею').click()
   s=await page.evaluate("JSON.parse(localStorage.getItem('tyhe-mistse-v1'))")
   assert len(s['drawings'])==1 and s['completed'].get('safe-drawing')
   await shot('safe_drawing_saved'); await audit('safe-drawing'); results.append([width,lang,'safe drawing stroke/colors/clear/save'])
   for route in ['/studio/draw','/studio/feel']:
    await go(route); canvas=page.locator('canvas'); await draw(canvas)
    await go('/world'); await go(route); await B('Продовжити малюнок').click()
    await draw(canvas)
    for size in ['Тонкий','Середній','Товстий']: await B(size).click()
    for button in await page.get_by_role('group',name=L('Кольори'),exact=True).locator('button').all(): await button.click()
    await B('Гумка').click(); await draw(canvas)
    for button in await page.get_by_role('group',name=L('Наліпки'),exact=True).locator('button[aria-label]').all():
     await button.click(); await canvas.tap()
    await B('🌈 Веселковий пензлик').click(); await draw(canvas)
    await B('Очистити').click(); await draw(canvas); await B('Зберегти').click()
    await audit(route); await shot(route.replace('/','_')); results.append([width,lang,route+' strokes/8 colors/8 stickers/rainbow/eraser/3 sizes/clear/save'])
   await go('/studio/color')
   for n in range(1,14):
    petal=B(L('Соняшник для розфарбовування')+' '+str(n))
    await petal.focus(); await page.keyboard.press('Enter' if n%2 else 'Space')
   s=await page.evaluate("JSON.parse(localStorage.getItem('tyhe-mistse-v1'))")
   assert s['completed'].get('studio-color')
   await audit('color'); await shot('color_complete'); results.append([width,lang,'color all 13 regions keyboard completion'])
   await go('/studio/gallery'); assert await page.locator('main li img').count()==3
   for _ in range(3): await B('Видалити малюнок').first.click()
   assert await page.locator('main li img').count()==0
   await audit('gallery_empty'); results.append([width,lang,'gallery saved drawings/readback/delete'])
   await ctx.close()
  await browser.close()
 summary={'completed':results,'accessibility_violations':violations,'page_errors':errors}
 (OUT/'result.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)); print(json.dumps(summary,ensure_ascii=False))
asyncio.run(main())
