import sys
import csv
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('easyfmm/teamsData.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Check all players in premier league teams
with open('tier1_clubs.json', 'r', encoding='utf-8') as f:
    clubs = json.load(f)

pl_keys = [v.get("name", "").replace(" ", "_") for k, v in clubs.items() if v.get("leagueId") == "premier_league"]

pl_names = []
for pk in pl_keys:
    needle = f'"{pk}": {{'
    pos = text.find(needle)
    if pos >= 0:
        end_pos = text.find('        players: [', pos)
        end_block = text.find('        ]\n    },', end_pos)
        block = text[end_pos:end_block]
        for m in re.finditer(r'name:\s*"([^"]+)",\s*position:\s*"([^"]+)",\s*country:\s*"([^"]+)",\s*age:\s*\d+,\s*rating:\s*\d+,\s*playerid:\s*(\d+)', block):
            pl_names.append((int(m.group(4)), m.group(1), m.group(3), pk))

print(f"Total PL players extracted: {len(pl_names)}")

# Find players where name starts with '야' or has '베냐민' or has Italian-like features
suspicious_pl = []
for pid, name, country, club in pl_names:
    if name.startswith('야') and country in ['잉글랜드', '스코틀랜드', '웨일스', '북아일랜드', '아일랜드', '미국', '캐나다']:
        suspicious_pl.append((pid, name, country, club))
    elif '베냐민' in name and country in ['잉글랜드']:
        suspicious_pl.append((pid, name, country, club))

for sp in suspicious_pl:
    print(sp)

