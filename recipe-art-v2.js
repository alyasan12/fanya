/* Original imagegen watercolor atlases, composed locally into recipe-specific scenes. */
const RecipeArt=(()=>{
 const assets={food:'comic-assets/ingredients-v2.png',extra:'comic-assets/ingredients-extra-v2.png',supplement:'comic-assets/ingredients-supplement-v2.png',kitchen:'comic-assets/kitchen-v2.png'};
 const ink='#443b31',green='#7d944e';
 const p=(d,color=ink,width=3,extra='')=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
 function tile(atlas,i,x,y,w,h=w,rotation=0){const cols=atlas==='kitchen'?3:6,size=1254/cols;return `<g${rotation?` transform="rotate(${rotation} ${x+w/2} ${y+h/2})"`:''}><svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${i%cols*size} ${Math.floor(i/cols)*size} ${size} ${size}" preserveAspectRatio="none" overflow="hidden"><image href="${assets[atlas]}" width="1254" height="1254"/></svg></g>`}
 const types=[
 ['tomato',/番茄|西红柿/],['egg',/鸡蛋|鸭蛋|鹅蛋|鹌鹑蛋|蛋液|蛋清|蛋黄/],['tofuskin',/豆皮|千张|腐竹|豆腐皮/],['tofu',/豆腐|豆干|豆腐干|豆泡|油豆腐/],['broccoli',/西兰花/],['cauliflower',/花菜|菜花/],['squid',/鱿|章鱼|墨鱼/],['shrimp',/虾/],['crab',/蟹/],['shell',/蛤|贝|鲍|蛏|蚬|蚝/],['fish',/鱼|鳝|泥鳅/],
 ['carrot',/胡萝卜/],['lotus',/莲藕|藕/],['pumpkin',/南瓜/],['yam',/山药/],['taro',/芋/],['sweetpotato',/红薯|紫薯|地瓜/],['wintermelon',/冬瓜|白萝卜|青萝卜|萝卜/],['potato',/土豆|马铃薯/],['eggplant',/茄子/],['pepper',/椒/],['bittermelon',/苦瓜/],['zucchini',/西葫芦/],['cucumber',/黄瓜|丝瓜/],['woodear',/木耳|银耳/],['enoki',/金针菇|蟹味菇|白玉菇/],['mushroom',/菇|菌/],
 ['kelp',/海带|紫菜|裙带菜/],['asparagus',/芦笋/],['bamboo',/竹笋|冬笋|春笋|笋/],['celery',/芹/],['sprouts',/豆芽/],['cabbage',/包菜|卷心菜|甘蓝/],['napa',/白菜|娃娃菜|酸菜|梅干菜/],['greens',/菜|菠菜|韭|蒜苗|苋|茼蒿/],['corn',/玉米/],['banana',/香蕉/],['milk',/牛奶|豆浆|酸奶|奶/],['oats',/燕麦|麦片/],['rice',/米(?!酒)|糯米|小米/],
 ['glassnoodles',/粉丝|粉条|粉皮|魔芋/],['dumpling',/饺|馄饨|扁食/],['bun',/包子|馒头|花卷|窝头/],['pancake',/饼|油条|薄脆/],['noodles',/面|粉|年糕/],['longbeans',/豆角|豇豆|四季豆|扁豆|荷兰豆/],['peas',/豌豆|毛豆|蚕豆|青豆/],['peanut',/花生/],['redbean',/红豆|赤豆|芸豆/],['dates',/红枣|枣/],['beans',/豆|栗|莲子|枸杞/],
 ['sausage',/香肠|腊肠|火腿|午餐肉/],['ribs',/排骨|肋排/],['meatball',/丸|狮子头/],['wings',/翅/],['chickenleg',/鸡腿|鸭腿/],['duck',/鸭|鹅/],['chicken',/鸡/],['beef',/牛|羊/],['meat',/肉|猪|肚|肠|蹄|肝|腰|腊/],['strawberry',/草莓/],['apple',/苹果/],['scallion',/葱|蒜/]];
 const supplementTypes=[['centuryegg',/皮蛋/],['lotusseed',/莲子|湘莲/],['okra',/秋葵/],['pear',/梨/],['pineapple',/菠萝/],['lemon',/柠檬/],['milkglass',/牛奶|豆浆|椰浆|椰奶/],['beer',/啤酒|可乐|黄酒|老酒|花雕酒/],['stock',/高汤|清水|沸水/],['herb',/黄芪|当归|天麻|草果|大料/],['seacucumber',/海参/],['fishmaw',/花胶/],['jellyfish',/海蜇/],['oyster',/海蛎|西施舌/],['snail',/田螺/],['pigeon',/乳鸽/],['chestnut',/荸荠/],['firmtofu',/香干|白干/],['tofustrip',/干丝/],['ricenoodle',/凉皮|饵块/],['naan',/烤馕|馕/],['flatbread',/馍/],['buttonmushroom',/口蘑/],['papaya',/木瓜/],['mango',/芒果/],['watermelon',/西瓜/],['raisin',/葡萄干/],['ginger',/老姜|姜片/],['chilioil',/油泼辣子|辣椒油|老干妈/],['sauce',/黄酱|大酱|甜酱|酱油|味极鲜|沙茶酱|甜辣酱|香醋/],['fermentedtofu',/腐乳|红糟/],['fermentedrice',/醪糟|米酒/],['tea',/茶叶/],['garlic',/蒜|藠头/]];
 const supplementTiles={centuryegg:0,lotusseed:1,okra:2,pear:3,pineapple:4,lemon:5,milkglass:6,beer:7,stock:8,herb:9,seacucumber:10,fishmaw:11,jellyfish:12,oyster:13,snail:14,pigeon:15,chestnut:16,firmtofu:17,tofustrip:18,ricenoodle:19,naan:20,flatbread:21,buttonmushroom:23,papaya:24,mango:25,watermelon:26,raisin:27,ginger:28,chilioil:29,sauce:30,fermentedtofu:31,fermentedrice:32,tea:33,garlic:34};
 function kind(name){if(/蒜苗|青蒜/.test(name))return 'greens';return supplementTypes.find(([,re])=>re.test(name))?.[0]||types.find(([,re])=>re.test(name))?.[0]||(/蘑|竹荪|虫草花/.test(name)?'mushroom':/上海青|香椿|马兰头|藜蒿|九层塔|折耳根/.test(name)?'greens':/海鳗/.test(name)?'fish':/卤蛋|蛋皮/.test(name)?'egg':/大碴子/.test(name)?'rice':'other')}
 const tiles={tomato:['food',0],egg:['food',1],tofu:['food',2],broccoli:['food',3],meat:['food',5],chicken:['food',6],chickenleg:['food',7],shrimp:['food',8],fish:['food',9],mushroom:['food',11],greens:['food',12],cucumber:['food',13],carrot:['food',14],potato:['food',15],eggplant:['food',16],pepper:['food',17],rice:['food',18],noodles:['food',19],banana:['food',20],lotus:['food',22],corn:['food',23],pumpkin:['food',24],tofuskin:['food',25],peas:['food',26],woodear:['food',27],shell:['food',28],crab:['food',29],dumpling:['food',30],bun:['food',31],pancake:['food',32],oats:['food',33],scallion:['food',34],beef:['extra',0],ribs:['extra',2],meatball:['extra',3],sausage:['extra',4],wings:['extra',5],cabbage:['extra',6],napa:['extra',7],celery:['extra',8],longbeans:['extra',9],bittermelon:['extra',10],wintermelon:['extra',11],zucchini:['extra',12],asparagus:['extra',13],cauliflower:['extra',14],bamboo:['extra',15],enoki:['extra',16],kelp:['extra',17],squid:['extra',20],duck:['extra',21],glassnoodles:['extra',23],yam:['extra',24],taro:['extra',25],sweetpotato:['extra',26],strawberry:['extra',30],apple:['extra',31],peanut:['extra',32],redbean:['extra',33],dates:['extra',34],sprouts:['extra',35],beans:['food',26]};
 function food(name,x,y,w,h=w,ctx={}){
  const k=kind(name);let spec=k in supplementTiles?['supplement',supplementTiles[k]]:tiles[k];const text=ctx.text||'',dish=ctx.dish||'',cooked=ctx.cooked!==false;
  if(k==='egg')spec=/打散|搅打|蛋液/.test(text)&&!ctx.cover?['extra',29]:!cooked?['extra',28]:/煮鸡蛋|水煮蛋|茶叶蛋|卤蛋|鸡蛋牛奶/.test(dish)?['food',21]:['food',1];
  if(k==='meat')spec=!cooked?(/块|红烧/.test(text+' '+dish)?['supplement',35]:['food',4]):/肉丝|肉片|肉末|回锅|木须/.test(dish)?['extra',0]:['food',5];
  if(k==='rice'&&!cooked)spec=['supplement',22];
  if(k==='chicken'&&!cooked)spec=['food',35];
  if(k==='fish'&&/鱼片|鱼块|酸菜鱼|水煮鱼|鱼柳/.test(text+' '+dish))spec=['food',10];
  if(k==='potato'&&/丝/.test(text+' '+dish))spec=['extra',19];
  if(k==='tofu'&&cooked&&/煎|炸|油豆腐|豆泡/.test(text+' '+dish))spec=['extra',22];
  if(k==='pepper'&&/红|彩/.test(name))spec=['extra',18];
  if(spec)return tile(...spec,x,y,w,h,ctx.rotation||0);
  if(k==='milk')return `<g transform="translate(${x+w*.2} ${y+h*.15}) scale(${w/100} ${h/100})"><path d="M8 4h48l-4 60q-20 10-40 0Z" fill="#fff7df" stroke="#645849" stroke-width="2"/><path d="M12 20h41M20 9v45" stroke="#dacfb0" stroke-width="3" fill="none"/></g>`;
  return `<g><path d="M${x+5} ${y+h*.35}q${w/2} ${-h/3} ${w-10} 0l-7 ${h/3}q${-w/2} ${h/4} ${-w+24} 0Z" fill="#eee2c1" stroke="#9c8868" stroke-width="2"/><text x="${x+w/2}" y="${y+h*.57}" text-anchor="middle" font-size="13" fill="#655842">${esc(name)}</text></g>`;
 }
 const operations=[
 {id:'wash',label:'洗净',re:/洗净|清洗|冲洗|淘洗/},{id:'cut',label:'切配',re:/切\s*\d|切丝|切片|切块|切丁|切条|切段|切小|剁|切成|切薄|切厚|切菱/},{id:'beat',label:'打散',re:/打散|搅打|打匀/},{id:'mix',label:'拌匀',re:/拌匀|拌均|混合|搅拌|揉匀|抓匀|搅匀/},{id:'marinate',label:'腌制',re:/腌制|腌\s*\d|腌入味/},{id:'blanch',label:'焯水',re:/焯水|焯熟|汆|焯至/},{id:'pour',label:'倒入',re:/倒入|倒回|加水|加入|淋入/},{id:'stir',label:'翻炒',re:/翻炒|合炒|炒匀|炒至|炒软|煸炒|爆香|下锅炒|快炒/},{id:'fry',label:'煎制',re:/煎至|煎熟|煎\s*\d|煎香|煎黄|两面煎/},{id:'deepfry',label:'炸制',re:/炸至|油炸|炸熟|复炸/},{id:'flip',label:'翻面',re:/翻面|翻个/},{id:'simmer',label:'煮炖',re:/炖|焖|煲|煮|熬|烧开/},{id:'steam',label:'蒸制',re:/蒸(?!鱼豉油)/},{id:'bake',label:'烘烤',re:/烤箱|烘烤|烤制|烤\s*\d/},{id:'reduce',label:'收汁',re:/收汁|浓稠/},{id:'sprinkle',label:'撒料',re:/撒上|撒入|撒葱|撒芝麻|撒盐|撒胡椒|撒少许/},{id:'plate',label:'装盘',re:/装盘|出锅|盛出|上桌|摆盘|搭配食用/}];
 const labels={wash:'清洗备料',prep:'准备食材',mix:'搅拌入味',stir:'下锅翻炒',fry:'煎炸烹调',simmer:'煮透入味',steam:'上锅蒸制',bake:'烤箱烘烤',plate:'装盘开饭'};
 function action(text,index,total){
  if(/切|剁|掰/.test(text)&&!/炒|煎|炖|炸|蒸|烤/.test(text))return 'prep';
  if(index===0&&/洗|淘|浸泡/.test(text)&&!/切|剁|掰/.test(text))return 'wash';
  if(index===0&&/洗|切|备|处理|泡/.test(text))return 'prep';
  if(/烤箱|入烤|烘烤|烤至/.test(text))return 'bake';
  if(/上锅蒸|蒸锅|蒸熟|大火蒸|蒸\s*\d|隔水蒸|蒸制/.test(text))return 'steam';
  if(index===total-1&&/出锅|装盘|食用|盛|上桌|撒|淋|拌匀|即可|搭配|配米饭/.test(text))return 'plate';
  if(/炖|煲|焖|煮|焯|烧开|沸水/.test(text))return 'simmer';
  if(/煎|炸/.test(text))return 'fry';if(/炒|爆香|煸/.test(text))return 'stir';
  if(/打散|搅|拌|腌|揉|混合/.test(text))return 'mix';if(/洗|切|剥|去皮|掰|泡|剁|擀/.test(text))return 'prep';
  return index===total-1?'plate':'mix';
 }
 function cues(text,index,total){const found=operations.map(o=>({...o,pos:text.search(o.re)})).filter(o=>o.pos>=0).sort((a,b)=>a.pos-b.pos);return found.length?found:[{id:'read',label:'按步骤操作',pos:0}]}
 function selected(r,text){const main=r.ingredients.map(x=>x[0]),hits=main.filter(n=>text.includes(n)||text.includes(n.replace(/^(去皮|带皮|瘦|嫩|老|干|鲜|熟|新鲜)/,'')));return (hits.length?hits:main).slice(0,4)}
 function glyph(id){const d={wash:'M7 3v5H3m4-3h12v5M12 12v3m-5-3v2m10-2v2M4 18q8 7 16 0',cut:'M5 4l11 8-5 4L3 8zM16 4v5m-2-2 2 2 2-2M2 21h20',beat:'M16 2 9 12m2-3q-12 3-5 10t9-7M4 12q7 5 10 7',mix:'M6 7a8 6 0 1 1 0 10M6 7h5M6 7v5M15 2l-4 13',marinate:'M3 9h18l-3 11H6zM8 5h8M12 2v5',blanch:'M3 10h18l-3 11H6zM7 2q-3 3 0 6m6-6q-3 3 0 6m6-6q-3 3 0 6',pour:'M3 3h9l-1 8H4zM13 7q7 0 7 8m-3-2 3 2 2-3M6 17v3m4-3v3',stir:'M3 13h15q-2 8-12 6zM18 14l5-3M5 7q7-6 13 0m-3-1 3 1-1-3',fry:'M3 12h15q-2 7-12 5zM18 13l5-3M7 20l1 2m6-2 1 2M8 4l-2 4m6-4-2 4',deepfry:'M3 10h18l-3 11H6zM7 14h1m4 2h1m4-3h1M8 2l-2 4m6-4-2 4',flip:'M4 16q8-3 15 0M7 10a6 5 0 1 1 11-1m-3-1 3 1 1-3',simmer:'M3 10h18l-3 11H6zM6 3q3 2 0 4m6-4q3 2 0 4m6-4q3 2 0 4',steam:'M3 13h18v7H3zM3 16h18M6 2q-3 4 0 8m6-8q-3 4 0 8m6-8q-3 4 0 8',bake:'M3 3h18v18H3zM6 9h12v9H6zM6 6h4m5 0h1m3 0h1',reduce:'M3 13h18l-3 7H6zM6 3q-3 4 0 7m6-7q-3 4 0 7m6-7q-3 4 0 7',sprinkle:'M6 2l9 2-1 7-10-3zM8 13v1m4 1v1m4-3v1M3 20h18',plate:'M3 15q9 9 18 0M3 15q9-5 18 0M8 7l3 3 6-6',read:'M3 4h7l2 2 2-2h7v16h-7l-2 2-2-2H3zM12 6v14'}[id]||'M4 12h16m-5-5 5 5-5 5';return `<svg viewBox="0 0 24 24" aria-hidden="true">${p(d,'currentColor',1.7)}</svg>`}
 function arrow(d,head,color=green){return p(d,color,3.5,'stroke-dasharray="5 5"')+p(head,color,3.5)}
 function motion(a){
  if(a==='wash')return arrow('M269 40q-12 24-28 33','M245 62l-4 11 13-1')+p('M113 36v14M131 40v17M149 36v14','#7d9fa1',3);
  if(a==='prep')return arrow('M286 39q-2 20-11 31','M266 62l9 8 10-9')+p('M304 47l-1 14M312 58l-6 13',ink,2.4);
  if(a==='mix')return arrow('M102 80q55-30 104-6','M195 64l11 10-14 2')+p('M281 88q7 6 7 15M289 85q10 6 10 17',ink,2.2);
  if(a==='stir'||a==='fry')return arrow('M72 93q45-39 94-18','M156 65l10 10-14 4')+p('M276 55q-9-13-23-14M282 46q-9-13-23-14',ink,2.4)+(a==='fry'?arrow('M278 155q21-10 24-28','M294 135l8-8 5 10'):'');
  if(a==='steam'||a==='simmer')return [130,172,214].map(x=>p(`M${x} 74q-12-13 0-25t0-22`,'#8a806c',3)).join('')+arrow('M286 77V41','M279 50l7-9 7 9');
  if(a==='bake')return arrow('M43 118h51','M83 110l11 8-11 8')+p('M141 79q8-9 16 0t16 0M200 79q8-9 16 0t16 0','#b87d44',3);
  return arrow('M269 66q-10 15-30 20','M246 77l-7 9 12 2')+p('M63 66l-10-13M76 57l-2-17M297 92l14-7',green,4);
 }
 function title(r,text,i,a){
  if(a==='wash')return /淘/.test(text)?'淘洗米粒':'洗净食材';
  if(a==='prep')return /切丝/.test(text)?'洗净切丝':/打散/.test(text)?'切配 · 打散':/焯水/.test(text)?'切配 · 焯水':'洗净切配';
  if(a==='mix')return /腌/.test(text)?'调味腌制':/打散/.test(text)?'搅打蛋液':'轻轻拌匀';
  if(a==='stir')return /鸡蛋/.test(text)&&/番茄/.test(text)&&/盛出/.test(text)?'先炒蛋 · 再炒番茄':/炒蛋|炒鸡蛋/.test(text)?'先炒鸡蛋':/番茄/.test(text)?'炒软番茄':/倒回|合炒/.test(text)?'倒回合炒':'下锅翻炒';
  if(a==='simmer')return /焯/.test(text)?'沸水焯熟':/炖|焖/.test(text)?(/小火/.test(text)?'小火焖炖':'焖炖入味'):'煮透食材';
  if(a==='fry')return /炸/.test(text)?'油炸烹调':/翻面/.test(text)?'翻面煎制':'下锅煎制';
  if(a==='plate')return /收汁/.test(text)?'收汁出锅':/合炒|炒匀/.test(text)?'合炒出锅':/拌/.test(text)?'拌匀装盘':'装盘开饭';return labels[a];
 }
 function scene(r,a,items,text,cover=false){
  const garnishKinds=['beer','stock','sauce','chilioil','tea','ginger','garlic','herb'];
  const mains=r.ingredients.map(x=>x[0]).filter(n=>!garnishKinds.includes(kind(n)));
  let names=a==='plate'?mains.slice(0,3):items.filter(n=>!garnishKinds.includes(kind(n)));
  if(!names.length)names=mains.length?mains.slice(0,3):r.ingredients.slice(0,3).map(x=>x[0]);
  const ctx={dish:r.name,text,cooked:!['prep','mix','wash'].includes(a),cover};let s='';
  const add=(n,x,y,w,h,extra={})=>food(n,x,y,w,h,{...ctx,...extra});
  const pile=(cx,cy,w,h,max=3)=>{const ns=names.slice(0,max);if(ns.length===1)return add(ns[0],cx-w/2,cy-h/2,w,h);if(ns.length===2)return add(ns[0],cx-w*.54,cy-h*.5,w*.64,h*.86,{rotation:-8})+add(ns[1],cx-w*.04,cy-h*.32,w*.62,h*.84,{rotation:6});return add(ns[0],cx-w*.52,cy-h*.44,w*.62,h*.85,{rotation:-7})+add(ns[1],cx,cy-h*.47,w*.53,h*.78,{rotation:7})+add(ns[2],cx-w*.20,cy-h*.03,w*.55,h*.65)};
  if(cover){const soup=/汤|羹|粥|燕麦碗|面|粉丝/.test(r.name);s+=tile('kitchen',soup?3:5,5,10,350,250);s+=pile(175,soup?106:132,soup?170:225,soup?65:105);return s}
  if(a==='wash'){s+=tile('kitchen',2,24,48,310,220);s+=`<ellipse cx="180" cy="143" rx="100" ry="35" fill="#dce8db" opacity=".6"/>`;s+=pile(177,142,181,78);s+=motion(a)}
  else if(a==='prep'&&/打散|蛋液/.test(text)&&names.some(n=>kind(n)==='egg')){const others=names.filter(n=>kind(n)!=='egg');s+=tile('kitchen',0,0,67,224,184);s+=add(others[0]||names[0],25,108,155,102);s+=tile('extra',29,211,126,135,108);s+=tile('kitchen',8,147,21,97,132);s+=arrow('M289 102q19 7 24 21','M304 119l9 4 1-10');s+=p('M284 99l-19 73M294 101l-17 74','#997347',4)}
  else if(a==='prep'){s+=tile('kitchen',0,0,45,290,220);s+=pile(134,155,211,123);s+=tile('kitchen',8,224,11,115,160);s+=motion(a)}
  else if(a==='stir'&&/鸡蛋/.test(text)&&/番茄/.test(text)&&/盛出/.test(text)){s+=tile('kitchen',1,0,45,210,170)+food('鸡蛋',35,124,118,60,{cooked:true})+tile('kitchen',1,163,102,200,165)+food('番茄',190,176,128,59,{cooked:true})+arrow('M139 75q53-8 84 34','M210 103l13 6-1-14')+p('M57 90q-9-7-16-6M65 83q-9-7-16-6',ink,2.3)}
  else if(a==='stir'||a==='fry'){s+=tile('kitchen',1,0,16,360,250);s+=pile(163,155,226,109);s+=tile('kitchen',7,207,25,125,165);s+=motion(a);if(/倒入|倒回/.test(text))s+=arrow('M36 55q9 26 32 34','M56 90l12-1-2-12','#b28b4c')}
  else if(a==='simmer'||a==='steam'){s+=tile('kitchen',a==='simmer'?3:4,29,43,300,220);s+=pile(179,112,176,65);s+=motion(a)}
  else if(a==='mix'){s+=tile('kitchen',2,18,44,320,225);s+=pile(177,141,208,92);s+=p('M245 61 186 166M257 65 200 167','#997347',6);s+=motion(a)}
  else if(a==='bake'){s+=tile('kitchen',6,70,38,250,226);s+=pile(183,158,143,66);s+=motion(a)}
  else{const soup=/汤|羹|粥|面/.test(r.name);s+=tile('kitchen',soup?3:5,0,15,360,250);s+=pile(180,soup?106:132,soup?172:228,soup?63:110);s+=motion(a);if(/撒/.test(text)){s+=tile('food',34,245,37,47,44,-22);s+=p('M247 86l-4 6M259 88l-5 6M237 80l-3 6',green,3)}}return s;
 }
 function svg(r,index=0,cover=false){const text=r.steps[index]||'',a=cover?'plate':action(text,index,r.steps.length),items=cover?r.ingredients.slice(0,3).map(x=>x[0]):selected(r,text);return `<svg class="recipe-illustration" viewBox="0 0 360 280" role="img" aria-label="${esc(r.name+'：'+(cover?'装盘示意':title(r,text,index,a))+'；'+items.join('、'))}" data-scene="${a}" data-art-version="2"><title>${esc(cover?'食材装盘示意':cues(text,index,r.steps.length).map(x=>x.label).join(' → '))}</title>${scene(r,a,items,text,cover)}</svg>`}
 function timing(text){const out=[];for(const m of text.matchAll(/(?:大火|中火|小火|文火|中小火|中大火)|(?:\d+(?:[–—~～-]\d+)?\s*(?:分钟|小时|秒|℃|°C))/g)){if(!out.includes(m[0]))out.push(m[0])}return out.slice(0,4)}
 function comic(r){const ingredients=r.ingredients.slice(0,4).map(([n,q,u])=>n+(q===null?'适量待确认':q+u)).join(' · ');return `<section class="recipe-comic" data-art-version="2" aria-label="${esc(r.name)}简笔漫画步骤"><header class="comic-heading"><div class="comic-title-food" aria-hidden="true">${svg(r,0,true)}</div><div><span class="comic-eyebrow">芽芽的家常料理手记</span><h3>${esc(r.name)}<em>· ${r.steps.length} 步开饭</em></h3></div><p>${esc(ingredients)}</p></header><div class="comic-grid">${r.steps.map((text,i)=>{const a=action(text,i,r.steps.length),cs=cues(text,i,r.steps.length),times=timing(text);return `<article class="comic-panel" data-step="${i+1}"><div class="comic-num"><b>${String(i+1).padStart(2,'0')}</b><span>${title(r,text,i,a)}</span></div><p>${esc(text)}</p><div class="comic-action-row" aria-label="本步骤动作">${cs.map(c=>`<span class="comic-action" data-action="${c.id}">${glyph(c.id)}${c.label}</span>`).join('')}</div>${svg(r,i)}${times.length?`<div class="comic-timing">${times.map(t=>`<span>${esc(t)}</span>`).join('')}</div>`:''}<small class="comic-ingredients">${(a==='plate'?r.ingredients.slice(0,4).map(x=>x[0]):selected(r,text)).map(esc).join(' · ')}</small></article>`}).join('')}</div><footer><span></span>动作箭头帮助理解操作 · 具体火候与用量以文字为准<span></span></footer></section>`}
 return {comic,svg,kind,action,cues,assets};
})();
