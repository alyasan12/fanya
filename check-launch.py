import importlib.machinery
import importlib.util
import json
import threading
import urllib.request
from pathlib import Path
import server

path=Path(__file__).with_name('launch.pyw')
loader=importlib.machinery.SourceFileLoader('fanya_launcher_test',str(path))
spec=importlib.util.spec_from_loader(loader.name,loader)
module=importlib.util.module_from_spec(spec)
loader.exec_module(module)
plain=b'dummy-test-credential-not-a-real-key'
protected=module.protect(plain)
assert protected != plain and plain not in protected
assert module.protect(protected,False)==plain
print('PASS: Windows DPAPI encryption and decryption')
http=server.ThreadingHTTPServer(('127.0.0.1',0),server.Handler)
thread=threading.Thread(target=http.serve_forever,daemon=True); thread.start()
base='http://127.0.0.1:'+str(http.server_address[1])
try:
    with urllib.request.urlopen(base+'/api/health') as r:
        assert json.load(r)['app']=='fanya-deepseek-local'
    req=urllib.request.Request(base+'/api/shutdown',data=b'{}',headers={'Origin':'http://127.0.0.1:8765','Content-Type':'application/json'},method='POST')
    with urllib.request.urlopen(req) as r: assert json.load(r)['ok']
    thread.join(3); assert not thread.is_alive()
    print('PASS: local health and shutdown endpoints')
finally:
    if thread.is_alive():http.shutdown()
    http.server_close()
