import io, json, os, threading, urllib.request, urllib.error
from unittest.mock import patch
import server

http=server.ThreadingHTTPServer(('127.0.0.1',0),server.Handler)
threading.Thread(target=http.serve_forever,daemon=True).start()
base='http://127.0.0.1:'+str(http.server_address[1]); original=urllib.request.urlopen
def post(origin, obj):
    req=urllib.request.Request(base+'/api/identify',json.dumps(obj).encode(),{'Content-Type':'application/json','Origin':origin},method='POST')
    try:
        with original(req) as r:return r.status,json.load(r)
    except urllib.error.HTTPError as e:return e.code,json.load(e)
class MockResponse(io.BytesIO):
    pass
def mock_urlopen(req,*args,**kwargs):
    if isinstance(req,urllib.request.Request) and req.full_url=='https://api.deepseek.com/chat/completions':
        data=json.loads(req.data); assert data['model']=='deepseek-flash'
        assert data['messages'][0]['content'][1]['type']=='image_url'
        assert data['response_format']=={'type':'json_object'}
        result={'choices':[{'finish_reason':'stop','message':{'content':json.dumps({'items':[{'name':'番茄','note':'可见'}]})}}]}
        return MockResponse(json.dumps(result).encode())
    return original(req,*args,**kwargs)
try:
    assert original(base+'/').status==200
    assert post('http://bad.example',{})[0]==403
    with patch.dict(os.environ,{},clear=True):
        status,body=post('http://127.0.0.1:8765',{})
        assert status==503 and 'DEEPSEEK_API_KEY' in body['error']
    with patch.dict(os.environ,{'DEEPSEEK_API_KEY':'fake-test-key'}),patch.object(server.urllib.request,'urlopen',side_effect=mock_urlopen):
        assert post('http://127.0.0.1:8765',{'image':'bad'})[0]==400
        status,body=post('http://127.0.0.1:8765',{'image':'data:image/png;base64,aGVsbG8='})
        assert status==200 and body['items'][0]['name']=='番茄'
    print('PASS: page, origin checks, missing key, invalid image, mocked DeepSeek response')
finally: http.shutdown();http.server_close()
