const {spawn}=require('node:child_process');const fs=require('node:fs');const path=require('node:path');
const root=__dirname, sleep=ms=>new Promise(r=>setTimeout(r,ms));
const server=spawn('python',[path.join(root,'server.py')],{windowsHide:true,stdio:'ignore'});
const browser=spawn('C:/Users/czj/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe',['--no-sandbox','--headless=new','--disable-gpu','--remote-debugging-port=9441','--user-data-dir='+path.join(root,'qa-browser'),'about:blank'],{windowsHide:true,stdio:'ignore'});
let ws,seq=0,pending=new Map(),errors=[];
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))})}
async function ev(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value}
async function check(expression,label){if(!await ev(expression))throw Error('FAIL: '+label);console.log('PASS:',label)}
(async()=>{try{let targets;for(let i=0;i<50;i++){try{targets=await(await fetch('http://127.0.0.1:9441/json')).json();break}catch{await sleep(200)}}if(!targets)throw Error('browser unavailable');ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result)}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params)});await send('Runtime.enable');await send('Page.enable');await send('Page.navigate',{url:'http://127.0.0.1:8765'});await sleep(1500);
await ev("localStorage.removeItem('fanya-v1');location.reload()");await sleep(500);
await ev("scan()");await check("document.querySelector('#modal-content').textContent.includes('DeepSeek')",'upload disclosure');
await ev("aiPhoto=new File(['image'], 'test.png',{type:'image/png'}); window.fetch=async()=>new Response(JSON.stringify({items:[{name:'西红柿',note:'可见2个',quantity:2,unit:'个'},{name:'胡萝卜',note:'可见',quantity:3,unit:'根'}]}),{status:200,headers:{'Content-Type':'application/json'}}); aiIdentify()");
await check("document.querySelectorAll('.ai-row').length===2",'mocked AI result rendered');
await check("document.querySelector('.ai-q').value==='2' && document.querySelector('.ai-unit').value==='个' && ![...document.querySelector('.ai-unit').options].some(x=>x.value==='根')",'tomato count and suitable classifier');
await check("document.querySelectorAll('.ai-unit')[1].value==='根'",'carrot classifier');
await ev("document.querySelectorAll('.ai-unit')[0].value='斤';document.querySelectorAll('.ai-q')[0].value='1';aiConfirm()");
await check("stock('番茄','克').q===1100 && stock('胡萝卜','根').q===3",'jin conversion and confirmed count');
await ev("storeFood('西红柿',2,'两','手动录入');storeFood('西红柿',3,'个','手动录入')");
await check("stock('番茄','克').q===1200 && stock('番茄','个').q===3",'liang conversion and separate item quantities');
await ev("nav('today')");await check("document.querySelector('#app').textContent.includes('换一批') && document.querySelector('#app').textContent.includes('更多')",'recommendation controls');
await ev("window.firstBatch=[...document.querySelectorAll('.primary section')].find(x=>x.textContent.includes('冰箱里的菜谱灵感')).querySelectorAll('.meal-body h3');window.firstNames=[...firstBatch].map(x=>x.textContent);nextBatch()");
await check("[...[...document.querySelectorAll('.primary section')].find(x=>x.textContent.includes('冰箱里的菜谱灵感')).querySelectorAll('.meal-body h3')].every(x=>!firstNames.includes(x.textContent))",'swap batch replaces the entire row');
await ev("openRecipe('broccoli',null)");await check("document.querySelectorAll('.comic-panel').length===3 && document.querySelector('#modal-content a[href*=bilibili]')",'comic and video available');
await ev("closeModal();state=initial();state.inventory.find(x=>x.name==='番茄').q=0;storeFood('西红柿',3,'个','手动录入');cook(1)");await check("!state.cooked[1] && stock('番茄','个').q===3",'count never treated as grams');
if(errors.length)throw Error(JSON.stringify(errors));console.log('PASS: no runtime errors');
}finally{if(ws){try{await send('Browser.close')}catch{}ws.close()}browser.kill();server.kill()}})().catch(e=>{console.error(e);process.exitCode=1});
