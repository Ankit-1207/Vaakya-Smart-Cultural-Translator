import urllib.request
import json

# Login
data = json.dumps({'email': 'test5@gmail.com', 'password': 'password123'}).encode('utf-8')
req = urllib.request.Request('http://127.0.0.1:8000/api/auth/login', data=data, headers={'Content-Type': 'application/json'})
res = urllib.request.urlopen(req)
token = json.loads(res.read().decode('utf-8'))['access_token']

# Translate to Hindi
trans_data = json.dumps({'text': 'break a leg', 'target_language': 'Hindi'}).encode('utf-8')
req2 = urllib.request.Request('http://127.0.0.1:8000/api/translate/', data=trans_data, headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'})
try:
    res2 = urllib.request.urlopen(req2)
    print('Success:', res2.read().decode('utf-8'))
except Exception as e:
    print('Error:', e)
    if hasattr(e, 'read'):
        print('Response:', e.read().decode('utf-8'))
