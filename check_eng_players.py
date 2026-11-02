import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('easyfmm/teamsData.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's find players with English country
matches = re.findall(r'\{\s*name:\s*"([^"]+)",\s*position:\s*"([^"]+)",\s*country:\s*"잉글랜드"', text)
print(f"Total English players in teamsData.js: {len(matches)}")
for m in matches[:40]:
    print(m)

