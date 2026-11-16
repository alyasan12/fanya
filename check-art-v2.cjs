const {spawn}=require('node:child_process');
const fs=require('node:fs'),path=require('node:path');
const root=__dirname,sleep=ms=>new Promise(r=>setTimeout(r,ms));
// Separate test server and browser profile; never touch the user's stored key or browser data.
const server=spawn('python',['-c',"from server import Handler; from http.server import ThreadingHTTPServer; ThreadingHTTPServer(('127.0.0.1',8878),Handler).serve_forever()"],{cwd:root,windowsHide:true,stdio:'ignore'});
const browser=spawn('C:/Users/czj/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe',['--no-sandbox','--headless=new','--disable-gpu','--remote-debugging-port=9452','--user-data-dir='+path.join(root,'qa-art'),'about:blank'],{windowsHide:true,stdio:'ignore'});
let ws,seq=0,pending=new Map(),errors=[];
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))})}
async function ev(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value}
async function check(expression,label){if(!await ev(expression))throw Error('FAIL: '+label);console.log('PASS:',label)}
async function shot(name){const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(root,'qa-'+name+'.png'),Buffer.from(r.data,'base64'))}
(async()=>{try{
  let targets;for(let i=0;i<50;i++){try{targets=await(await fetch('http://127.0.0.1:9452/json')).json();break}catch{await sleep(200)}}if(!targets)throw Error('browser unavailable');
  ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
  ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result)}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params)});
  await send('Runtime.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:'http://127.0.0.1:8878'});await sleep(1100);
  await ev("Promise.all(Object.values(RecipeArt.assets).map(src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=resolve;img.onerror=()=>reject(Error('Missing artwork: '+src));img.src=src})))");

  await ev(fs.readFileSync(path.join(root,'art-layout-suite.js'),'utf8'));
  const audit=await ev('auditAllComics([900])');console.log('AUDIT:',JSON.stringify(audit));if(audit.errors.length)throw Error('comic layout failures');
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  const mobileAudit=await ev('auditAllComics([360])');console.log('MOBILE AUDIT:',JSON.stringify(mobileAudit));if(mobileAudit.errors.length)throw Error('mobile comic layout failures');
  await ev(`closeModal();document.body.innerHTML='<main id="art-preview" style="margin:0;padding:20px;width:950px"></main>';document.querySelector('#art-preview').innerHTML=comic(rById('home-hong-shao-rou'))`);
  await send('Emulation.setDeviceMetricsOverride',{width:990,height:1580,deviceScaleFactor:1,mobile:false});await sleep(300);await shot('watercolor-red-pork-full');
  await ev("document.querySelector('#art-preview').innerHTML=comic(rById('tomato'))");await shot('watercolor-tomato-full');
  await ev("document.querySelector('#art-preview').innerHTML=comic(rById('broccoli'))");await shot('watercolor-broccoli-full');
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await ev("document.querySelector('#art-preview').style.cssText='margin:0;padding:12px;width:390px';document.querySelector('#art-preview').innerHTML=comic(rById('home-hong-shao-rou'))");await shot('watercolor-mobile-final');
  if(errors.length)throw Error(JSON.stringify(errors));console.log('PASS: all comics laid out without text/action overlap');
}finally{if(ws){try{await Promise.race([send('Browser.close'),sleep(1000)])}catch{}ws.close()}browser.kill();server.kill()}})().catch(e=>{console.error(e);process.exitCode=1});
