const {spawn}=require('node:child_process');
const fs=require('node:fs'),path=require('node:path');
const root=__dirname,sleep=ms=>new Promise(r=>setTimeout(r,ms));
// Separate test server and browser profile; never touch the user's stored key or browser data.
const server=spawn('python',['-c',"from server import Handler; from http.server import ThreadingHTTPServer; ThreadingHTTPServer(('127.0.0.1',8876),Handler).serve_forever()"],{cwd:root,windowsHide:true,stdio:'ignore'});
const browser=spawn('C:/Users/czj/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe',['--no-sandbox','--headless=new','--disable-gpu','--remote-debugging-port=9451','--user-data-dir='+path.join(root,'qa-library'),'about:blank'],{windowsHide:true,stdio:'ignore'});
let ws,seq=0,pending=new Map(),errors=[];
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))})}
async function ev(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value}
async function check(expression,label){if(!await ev(expression))throw Error('FAIL: '+label);console.log('PASS:',label)}
async function shot(name){const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(root,'qa-'+name+'.png'),Buffer.from(r.data,'base64'))}
(async()=>{try{
  let targets;for(let i=0;i<50;i++){try{targets=await(await fetch('http://127.0.0.1:9451/json')).json();break}catch{await sleep(200)}}if(!targets)throw Error('browser unavailable');
  ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
  ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result)}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params)});
  await send('Runtime.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:'http://127.0.0.1:8876'});await sleep(1100);
  await ev("Promise.all(Object.values(RecipeArt.assets).map(src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=resolve;img.onerror=()=>reject(Error('Missing artwork: '+src));img.src=src})))");
  await check("recipes.length===678 && recipes.filter(r=>r.imported).length===672",'672 new recipes + 6 retained recipes');
  await check("new Set(recipes.map(r=>r.id)).size===678 && new Set(recipes.map(r=>r.name)).size===678",'unique IDs and names');
  await check("recipes.every(r=>r.steps.length>=2&&r.ingredients.length>0&&Number.isFinite(r.kcal)) && recipes.filter(r=>r.imported).every(r=>new URL(r.videoSearch).hostname==='search.bilibili.com' && new URL(r.videoSearch).searchParams.get('keyword').startsWith(r.name))",'all recipes contain ingredients, steps, and correctly matched search URLs');
  await check("recipes.every(r=>{const el=document.createElement('div');el.innerHTML=comic(r);return el.querySelectorAll('.comic-panel').length===r.steps.length && [...el.querySelectorAll('.comic-panel p')].every((p,i)=>p.textContent===r.steps[i])})",'every comic contains the exact recipe steps, without truncation');
  await check("recipes.every(r=>{const el=document.createElement('div');el.innerHTML=comic(r);return el.querySelector('.recipe-comic').dataset.artVersion==='2'&&[...el.querySelectorAll('.comic-panel')].every(p=>p.querySelector('.comic-action[data-action]')&&p.querySelector('.recipe-illustration image')&&p.querySelector('.recipe-illustration path[stroke-dasharray]'))})",'all 678 comics use watercolor artwork and action labels with directional arrows');
  console.log('INFO:',await ev("JSON.stringify({panels:recipes.reduce((s,r)=>s+r.steps.length,0),scenes:[...new Set(recipes.flatMap(r=>r.steps.map((t,i)=>RecipeArt.action(t,i,r.steps.length))))]})"));
  await ev("state=initial();nav('recipes')");
  await check("document.querySelectorAll('#library-content .meal').length===24",'paginated catalogue renders 24 cards');await shot('library-desktop');
  await ev("searchLibrary('西红柿 鸡蛋')");await check("libraryMatches().length>0 && libraryMatches().every(r=>r.ingredients.some(x=>x[0].includes('番茄'))&&r.ingredients.some(x=>x[0].includes('鸡蛋')))",'multi ingredient search and tomato alias');
  await ev("resetLibrary();setLibraryFilter('group','汤羹')");await check("libraryMatches().length>0 && libraryMatches().every(r=>r.group==='汤羹')",'category filter');
  await ev("resetLibrary();turnLibrary(1)");await check("libraryPage===2 && document.querySelectorAll('#library-content .meal').length===24",'next page');
  await ev("openRecipe('home-hong-shao-rou');document.querySelector('.recipe-comic').scrollIntoView({block:'start'})");await sleep(250);await shot('comic-braised-pork');
  await check("document.querySelectorAll('.comic-panel').length===4 && document.querySelector('.video-search').textContent.includes('红烧肉')",'braised pork comic and video search');
  await check("new Set([...document.querySelectorAll('.comic-panel svg')].map(x=>x.dataset.scene)).size>=3",'recipe changes illustration across cooking actions');
  await ev("openRecipe('broccoli');document.querySelector('.recipe-comic').scrollIntoView({block:'start'})");await shot('comic-broccoli');
  await check("document.querySelectorAll('.comic-panel').length===3 && document.querySelector('a[href*=BV12a4y1p7Vy]')",'old broccoli comic upgraded; original video retained');
  await ev("openRecipe('tomato');document.querySelector('.recipe-comic').scrollIntoView({block:'start'})");await shot('comic-tomato-v2');
  await check("document.querySelector('.recipe-comic[data-art-version=\"2\"]')&&!document.querySelector('img.comic')&&document.querySelectorAll('.comic-panel').length===4",'original tomato comic uses the same new renderer and action cues');
  await ev("closeModal();state=initial();state.plan[1]='home-hong-shao-rou';state.inventory.push({name:'五花肉',q:700,unit:'克',emoji:'🥩',note:'测试'});cook(1)");
  await check("document.querySelectorAll('.amount-check-row').length===1",'actual quantity confirmation for new recipes');
  await ev("document.querySelector('input[name=q0]').value='800';document.querySelector('#modal-content form').requestSubmit()");await check("!state.cooked[1]&&stock('五花肉','克').q===700",'insufficient stock does not partially deduct');
  await ev("document.querySelector('input[name=q0]').value='500';document.querySelector('#modal-content form').requestSubmit()");await check("state.cooked[1]&&stock('五花肉','克').q===200",'confirmed amounts deducted exactly');
  await ev("document.querySelector('#portion-grams').value='125';eat(1)");await check("state.eaten[1].share===0.5 && state.points===10 && consumed().kcal===332.5",'actual eaten grams scaled by source reference portion');
  await ev("state.mode='fitness';nav('today')");await check("document.querySelector('#app').textContent.includes('添加糖：记录中有菜谱缺少数据')",'unknown sugar is not shown as zero');
  await ev("undo(1)");await check("stock('五花肉','克').q===700&&!state.eaten[1]&&!state.cooked[1]&&state.points===0",'undo restores inventory and reward');
  await ev("window.unmeasured=recipes.find(r=>r.imported&&r.ingredients.some(x=>x[1]===null));state.plan[1]=unmeasured.id;state.inventory=[];cook(1)");await check("[...document.querySelectorAll('.amount-check-row input')].some(x=>x.value==='')",'unknown amount requires user input');
  await ev("closeModal();state=initial();state.plan[1]='home-hong-shao-rou';save();location.reload()");await sleep(600);await check("state.plan[1]==='home-hong-shao-rou'&&document.querySelector('#app').textContent.includes('红烧肉')",'persisted new recipe survives reload');
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await ev("nav('recipes');resetLibrary();scrollTo(0,0)");await shot('library-mobile');
  await check("document.documentElement.scrollWidth<=innerWidth",'mobile catalogue has no horizontal overflow');
  await check("[...document.querySelectorAll('.library-grid .meal')].every(card=>card.querySelector('.meal-body').getBoundingClientRect().right<=card.getBoundingClientRect().right+1)",'mobile card text stays inside its card');
  await ev("document.querySelector('#library-content').scrollIntoView({block:'start'})");await shot('library-mobile-cards');
  await ev("openRecipe('home-hong-shao-rou');document.querySelector('.recipe-comic').scrollIntoView({block:'start'})");await shot('comic-mobile');
  await check("document.querySelector('#modal').scrollWidth<=document.querySelector('#modal').clientWidth",'mobile comic has no horizontal overflow');
  await check("[...document.querySelectorAll('.comic-panel')].every(panel=>panel.querySelector('p').getBoundingClientRect().bottom<=panel.querySelector('.comic-action-row').getBoundingClientRect().top+1)",'mobile step text does not overlap action badges');
  await ev("closeModal();nav('garden')");await sleep(1800);await check("!!document.querySelector('#garden-frame')",'garden still mounts on entry');await ev("nav('recipes')");await check("!document.querySelector('#garden-frame')",'garden and its audio context removed on exit');
  for(const asset of ['recipes-data.js','recipe-art-v2.js','recipe-library.js','recipe-library.css','comic-assets/ingredients-v2.png','comic-assets/ingredients-extra-v2.png','comic-assets/ingredients-supplement-v2.png','comic-assets/kitchen-v2.png']){const r=await fetch('http://127.0.0.1:8876/'+asset);await r.arrayBuffer();if(r.status!==200)throw Error('asset not served: '+asset)}
  if(errors.length)throw Error(JSON.stringify(errors));console.log('PASS: no browser runtime exceptions');
}finally{if(ws){try{await Promise.race([send('Browser.close'),sleep(1000)])}catch{}ws.close()}browser.kill();server.kill()}})().catch(e=>{console.error(e);process.exitCode=1});
