// Exhaustive browser layout audit; the host is removed after each run.
async function auditAllComics(widths=[900,360]){
 const host=document.createElement('div');host.style.cssText='position:absolute;left:0;top:0;background:white;z-index:9999';document.body.append(host);
 const errors=[];let panels=0;
 for(const width of widths){
  host.style.width=width+'px';
  for(let start=0;start<recipes.length;start+=12){
   host.innerHTML=recipes.slice(start,start+12).map(r=>`<div data-recipe="${r.id}">${comic(r)}</div>`).join('');
   for(const wrap of host.children)for(const panel of wrap.querySelectorAll('.comic-panel')){
    const text=panel.querySelector('p'),actions=panel.querySelector('.comic-action-row'),art=panel.querySelector('.recipe-illustration');
    const rb=panel.getBoundingClientRect(),tb=text.getBoundingClientRect(),ab=actions.getBoundingClientRect();
    if(tb.bottom>ab.top+1||actions.scrollWidth>actions.clientWidth+1||text.scrollWidth>text.clientWidth+1||art.getBoundingClientRect().right>rb.right+2)errors.push({id:wrap.dataset.recipe,width,step:panel.dataset.step});
    panels++;
   }
   await new Promise(resolve=>setTimeout(resolve,0));
  }
 }
 host.remove();return {recipes:recipes.length,panels,errors};
}
