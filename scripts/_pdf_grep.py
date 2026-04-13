import os
import re
from pathlib import Path

b = (Path(os.environ["TEMP"]) / "pjm-dm.pdf").read_bytes()
# decode as latin-1 to scan
t = b.decode("latin-1", errors="ignore")
for kw in ("Ocp-Apim", "subscription", "username", "password", "token", "Authorization", "authenticate", "login"):
    if kw.lower() in t.lower():
        idx = t.lower().find(kw.lower())
        print("---", kw, "---")
        print(t[max(0, idx - 80) : idx + 120].replace("\n", " "))
