"""Update the self-contained garden embedded in 饭芽 from its editable source."""
from pathlib import Path
import base64
import re
import sys

root = Path(__file__).resolve().parent
source = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else root.parents[1] / '芽芽.html'
target = root / 'index.html'
html = target.read_text(encoding='utf-8')
payload = base64.b64encode(source.read_bytes()).decode('ascii')
html, count = re.subn(r'const GARDEN_DOCUMENT = "[A-Za-z0-9+/=]+";',
                      lambda _: 'const GARDEN_DOCUMENT = "' + payload + '";', html, count=1)
if count != 1:
    raise SystemExit('未找到唯一的内嵌芽芽文档，未修改饭芽。')
target.write_text(html, encoding='utf-8')
print('已同步芽芽到饭芽：', source)
