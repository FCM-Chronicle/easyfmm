import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('easyfmm/teamsData.js', 'r', encoding='utf-8') as f:
    text = f.read()

players = re.findall(r'\{\s*name:\s*"([^"]+)",\s*position:\s*"([^"]+)",\s*country:\s*"([^"]+)"', text)

latin_names = [p for p in players if re.search(r'[a-zA-Z]', p[0])]
print(f"Total players with Latin characters: {len(latin_names)}")
for p in latin_names[:40]:
    print(p)

