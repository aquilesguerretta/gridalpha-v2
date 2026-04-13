import os
import re
from pathlib import Path

p = Path(os.environ["TEMP"]) / "pjm-dm.pdf"
b = p.read_bytes()
for m in re.finditer(rb"https://[a-zA-Z0-9./_?=&%-]+", b):
    u = m.group().decode(errors="ignore")
    if "pjm" in u.lower():
        print(u[:150])
