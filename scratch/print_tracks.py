import urllib.request, json, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://sop.joshuasgeneration.com/api/audios'
req = urllib.request.Request(url, headers={'Accept': 'application/json'})

with urllib.request.urlopen(req, context=ctx) as r:
    data = json.loads(r.read().decode())
    for item in data:
        if 'Sons' in item.get('title', ''):
            print('Product ID:', item['id'])
            print('Title:', item['title'])
            for i, t in enumerate(item.get('tracks', [])):
                print(f'{i+1}. {t.get("title")}: {t.get("url")}')
