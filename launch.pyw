"""Windows one-click launcher. The API key stays in DPAPI-protected local storage."""
import ctypes
import ctypes.wintypes as wintypes
import json
import os
import socket
import sys
import threading
import tkinter as tk
from tkinter import messagebox, simpledialog
from pathlib import Path
import urllib.request
import webbrowser

import server as app

ROOT = Path(__file__).resolve().parent
SECRET_PATH = ROOT / '.fanya-key.dpapi'
URL = 'http://127.0.0.1:8765'

class Blob(ctypes.Structure):
    _fields_ = [('cbData', wintypes.DWORD), ('pbData', ctypes.POINTER(ctypes.c_byte))]

crypt32 = ctypes.WinDLL('crypt32', use_last_error=True)
kernel32 = ctypes.WinDLL('kernel32', use_last_error=True)
crypt32.CryptProtectData.argtypes = [ctypes.POINTER(Blob), wintypes.LPCWSTR, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p, wintypes.DWORD, ctypes.POINTER(Blob)]
crypt32.CryptProtectData.restype = wintypes.BOOL
crypt32.CryptUnprotectData.argtypes = [ctypes.POINTER(Blob), ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p, wintypes.DWORD, ctypes.POINTER(Blob)]
crypt32.CryptUnprotectData.restype = wintypes.BOOL
kernel32.LocalFree.argtypes = [ctypes.c_void_p]
kernel32.LocalFree.restype = ctypes.c_void_p

def protect(data, encrypt=True):
    buf = (ctypes.c_byte * len(data)).from_buffer_copy(data)
    src, dst = Blob(len(data), buf), Blob()
    if encrypt:
        ok = crypt32.CryptProtectData(ctypes.byref(src), '饭芽 DeepSeek API Key', None, None, None, 1, ctypes.byref(dst))
    else:
        ok = crypt32.CryptUnprotectData(ctypes.byref(src), None, None, None, None, 1, ctypes.byref(dst))
    if not ok:
        raise ctypes.WinError(ctypes.get_last_error())
    try:
        return ctypes.string_at(dst.pbData, dst.cbData)
    finally:
        kernel32.LocalFree(dst.pbData)

def running_app():
    try:
        with urllib.request.urlopen(URL + '/api/health', timeout=1) as response:
            result = json.load(response)
        return result.get('app') == 'fanya-deepseek-local'
    except Exception:
        return False

def request_stop():
    if not running_app():
        return False
    req = urllib.request.Request(URL + '/api/shutdown', data=b'{}', headers={'Origin':URL,'Content-Type':'application/json'}, method='POST')
    with urllib.request.urlopen(req, timeout=3):
        pass
    return True

def main():
    gui = tk.Tk()
    gui.withdraw()
    gui.attributes('-topmost', True)
    try:
        action = sys.argv[1] if len(sys.argv)>1 else ''
        if action == '--stop':
            stopped = request_stop()
            messagebox.showinfo('饭芽', '饭芽本地服务已停止。' if stopped else '饭芽本地服务没有运行。', parent=gui)
            return
        if action == '--reset':
            messagebox.showinfo('更换密钥', '请输入新的 DeepSeek API Key。只有输入并成功加密保存后，才会替换原密钥。', parent=gui)
            key = simpledialog.askstring('饭芽 · 更换密钥', '请输入 DeepSeek API Key：', show='•', parent=gui)
            if not key or not key.strip():
                return
            encrypted = protect(key.strip().encode('utf-8'))
            temp = SECRET_PATH.with_suffix('.tmp')
            temp.write_bytes(encrypted)
            temp.replace(SECRET_PATH)
            if running_app():
                request_stop()
                import time
                time.sleep(0.7)
            messagebox.showinfo('饭芽', '密钥已加密保存。请双击“打开饭芽”重新启动。', parent=gui)
            return
        if running_app():
            webbrowser.open(URL)
            return
        # Detect a different service before asking for or storing a key.
        with socket.socket() as probe:
            if probe.connect_ex(('127.0.0.1', 8765)) == 0:
                raise RuntimeError('本机 8765 端口被其他服务占用。请关闭之前启动的饭芽窗口或其他占用该端口的程序，再重试。')
        key = os.environ.get('DEEPSEEK_API_KEY', '').strip()
        if not key and SECRET_PATH.exists():
            try:
                key = protect(SECRET_PATH.read_bytes(), encrypt=False).decode('utf-8').strip()
            except Exception as exc:
                raise RuntimeError('无法读取已保存的密钥。请运行“更换饭芽密钥”，重新输入当前 Windows 账户的密钥。') from exc
        if not key:
            messagebox.showinfo('饭芽 · 首次设置', '首次使用需要输入 DeepSeek API Key。密钥将由 Windows 加密保存在本机，之后无需重复输入。', parent=gui)
            key = simpledialog.askstring('饭芽 · 首次设置', '请输入 DeepSeek API Key：', show='•', parent=gui)
            if not key or not key.strip():
                return
            key = key.strip()
            encrypted = protect(key.encode('utf-8'))
            SECRET_PATH.write_bytes(encrypted)
        os.environ['DEEPSEEK_API_KEY'] = key
        http = app.ThreadingHTTPServer(('127.0.0.1',8765), app.Handler)
        try:
            webbrowser.open(URL)
            http.serve_forever()
        finally:
            http.server_close()
    except Exception as exc:
        messagebox.showerror('饭芽启动失败', str(exc), parent=gui)
    finally:
        gui.destroy()

if __name__ == '__main__':
    main()
