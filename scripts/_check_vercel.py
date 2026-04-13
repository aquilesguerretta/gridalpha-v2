import httpx, re

headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0"}
r = httpx.get("https://gridalpha.vercel.app", timeout=20, follow_redirects=True, headers=headers)
print(f"Status: {r.status_code}, length: {len(r.text)}")
print(f"First 500 chars: {r.text[:500]}")
print()

# Find all script/link references (could be in different formats)
all_refs = re.findall(r'(?:src|href)=["\']([^"\']+)["\']', r.text)
js_refs = [ref for ref in all_refs if ref.endswith('.js')]
print(f"All refs: {len(all_refs)}, JS refs: {len(js_refs)}")
for ref in js_refs[:10]:
    print(f"  JS: {ref}")
