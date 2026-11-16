"""Build the offline catalogue from the pinned MIT-licensed source snapshot."""
import json
import re
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent
SHA = '5bd6cad753f68105a77b0ffcca2757f65fd5899d'
SOURCE = 'https://github.com/Jiayu-zheng1/EveryDay_Food'
CUISINES = dict(generic='家常', chuan='川菜', xiang='湘菜', yue='粤菜', e='鄂菜', lu='鲁菜', suzhe='江浙', north='北方', hui='徽菜', min='闽菜', dongbei='东北', dian='云南', shan='陕西', xinjiang='新疆')
ALIASES = {'西红柿':'番茄', '鸡蛋液':'鸡蛋', '大米':'大米', '小葱':'小葱'}
SEASONING = re.compile(r'^(盐|海盐|食盐|白糖|冰糖|红糖|白砂糖|糖|生抽|老抽|酱油|料酒|醋|香醋|陈醋|白醋|米醋|香油|食用油|橄榄油|植物油|菜籽油|猪油|芝麻油|花生油|黄油|蚝油|豆瓣酱|郫县豆瓣酱|甜面酱|黄豆酱|番茄酱|辣椒酱|剁椒|豆豉|蒸鱼豉油|盐焗鸡粉|咖喱|糖醋汁|腐乳汁|蜂蜜|花椒|八角|桂皮|香叶|陈皮|五香粉|十三香|胡椒|白胡椒|黑胡椒|椒盐|孜然|辣椒油|辣椒面|辣椒粉|干辣椒|干红椒|鸡精|味精|葱|小葱|大葱|姜|生姜|沙姜|蒜|大蒜|香菜|紫苏|芝麻|白芝麻|熟芝麻|熟白芝麻|干桂花|清水|温水|水|淀粉|水淀粉|玉米淀粉|小苏打|食用碱|酒曲|粽叶|干面粉（手粉）)')
PATTERN = re.compile(r'^(.+?)\s*(\d+(?:\.\d+)?(?:/\d+)?|半)\s*(小勺|大勺|小块|大块|小把|小片|小段|小撮|克|毫升|升|个|根|条|块|颗|片|瓣|勺|张|把|朵|只|碗|斤|两|袋|盒|棵|粒|枚|节|段|杯|罐|头|包|副)(半)?(?:[（(].*|量)?$')

def parse_ingredient(raw):
    m = PATTERN.match(raw)
    if not m:
        # Unknown amounts stay unknown; no made-up weights or count conversion.
        name = re.split(r'\s|适量|少许|各半',raw)[0]
        return [ALIASES.get(name,name), None, '克']
    name, number, unit, extra = m.groups()
    name = re.sub(r'[（(].*?[）)]','',name).strip()
    number = .5 if number == '半' else (float(number.split('/')[0])/float(number.split('/')[1]) if '/' in number else float(number))
    if extra: number += .5
    unit = {'枚':'个','粒':'颗','小块':'块','大块':'块','小把':'把','小片':'片','小段':'段'}.get(unit,unit)
    if unit in ('斤','两'): number,unit=number*({'斤':500,'两':50}[unit]),'克'
    if unit == '升': number,unit=number*1000,'毫升'
    return [ALIASES.get(name,name),number,unit]

def group(r):
    n=r['name']; main=' '.join(r['ingredients'][:2]); methods=r['methods']
    if re.search('汤|羹',n): return '汤羹'
    if re.search('饭|面|粉|粥|饼|馒头|包子|饺|馄饨|糍|粽|窝头|烧麦|油条|花卷',n): return '主食点心'
    if '凉拌' in methods: return '凉菜'
    if re.search('鱼|虾|蟹|蛤|贝|鲍|蚬|蛏|海参|鱿|章鱼|墨鱼|鳝|泥鳅',main): return '鱼虾海鲜'
    if re.search('肉|排骨|鸡|鸭|鹅|牛腩|猪|羊|肥肠|腰花|肚|肝|蹄|翅|腊肠|香肠',main): return '肉禽家常'
    if re.search('蛋|豆腐|豆干|腐竹|豆皮|千张',main): return '蛋豆小菜'
    return '时蔬素菜'

def build():
    source=json.loads((ROOT/'recipe-source/meals.json').read_text(encoding='utf-8'))
    result=[]
    for r in source:
        if r['category']!='home': continue
        ingredients=[]; seasonings=[]
        for raw in r['ingredients']:
            if raw=='青红椒 各半个':
                ingredients.extend([['青椒',.5,'个'],['红椒',.5,'个']]); continue
            if SEASONING.match(raw): seasonings.append(raw)
            else: ingredients.append(parse_ingredient(raw))
        # A few seasoning-centric dishes still need at least one main ingredient.
        if not ingredients:
            ingredients=[parse_ingredient(r['ingredients'][0])];seasonings=r['ingredients'][1:]
        meals=[{'breakfast':'早餐','lunch':'午餐','dinner':'晚餐'}[m] for m in r['mealType']]
        result.append(dict(id='home-'+r['id'], name=r['name'], emoji=r['emoji'], category=meals[0], meals=meals,
            cuisine=CUISINES.get(r['cuisine'],'家常'), group=group(r), methods=r['methods'],
            tags=r['methods'][:1]+r['flavors'][:1], time=None,
            kcal=r['kcal'], p=r['nutrition']['protein'], c=r['nutrition']['carbs'], f=r['nutrition']['fat'], sugar=None,
            servingGrams=r['servingSize']['amount'], ingredients=ingredients, ingredientText=r['ingredients'], seasonings=seasonings,
            steps=r['steps'], imported=True, sourceId=r['id'],
            videoSearch='https://search.bilibili.com/all?keyword='+quote(r['name']+' 家常做法 教程')))
    assert len(result)>=500 and len({r['name'] for r in result})==len(result)
    assert len({r['id'] for r in result})==len(result)
    assert all(r['steps'] and r['ingredients'] and r['servingGrams']>0 for r in result)
    (ROOT/'recipes-data.js').write_text('// Adapted from EveryDay_Food, MIT; see recipe-source/LICENSE.txt.\nwindow.FANYA_RECIPES = '+json.dumps(result,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
    (ROOT/'recipe-source/来源说明.md').write_text(f'''# 家常菜数据来源

- 项目：[{SOURCE}]({SOURCE})
- 作者：Jiayu Zheng；许可：MIT（完整原文见 LICENSE.txt）。
- 固定版本：`{SHA}`
- 原始文件：`public/data/meals.json`，本目录保留下载快照。
- 导入范围：home 分类，{len(result)} 道名称及 ID 均不重复的家常菜。
- 饭芽修改：转换字段、区分主料与调味料、保留无法解析的用量以供人工确认，增加分类、漫画步骤图及 B 站搜索入口。
- 营养数字是来源项目的参考份估算，未经过独立营养审核。参考份克数并不等于整锅配料重量；不提供添加糖数值，不能视为零糖。
- 漫画采用 imagegen 生成的水彩食材与厨具素材，由本地组件按菜谱步骤组合，叠加动作图标、箭头及文字；并非 678 张逐道独立绘制的成品图。少见食材无专用素材时保留名称标注。具体用量、时间以文字菜谱为准。
- 新增视频入口是按菜名构造的 B 站搜索链接，不代表已审核某一条视频。保留的六条原有具体链接单独标注“参考视频”。

重新生成：在本目录上一级执行 `python build-recipes.py`，不需要联网。
''',encoding='utf-8')
    print('Built',len(result),'recipes;',sum(any(q is None for _,q,_ in r['ingredients']) for r in result),'recipes need amount confirmation')
    print('Unknown:',[(r['name'],[n for n,q,u in r['ingredients'] if q is None]) for r in result if any(q is None for _,q,_ in r['ingredients'])])

if __name__=='__main__': build()
