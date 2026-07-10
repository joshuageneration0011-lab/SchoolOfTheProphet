import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://sop.joshuasgeneration.com/uploads/1783646247287-839733730.mp3"
print(f"Requesting {url}...")
try:
    req = urllib.request.Request(url, method="HEAD")
    with urllib.request.urlopen(req, context=ctx) as response:
        print("Status:", response.status)
        print("Headers:")
        for k, v in response.headers.items():
            print(f"  {k}: {v}")
except Exception as e:
    print("Error:", e)
