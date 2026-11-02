import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

with open('tier1_clubs.json', 'r', encoding='utf-8') as f:
    clubs = json.load(f)

for k, v in clubs.items():
    if v.get('logo') in ['CEL', 'MAR', 'VIG', 'MTM', 'CSM', 'MRT']:
        print(f"{k} -> name: {v.get('name')} | logo: {v.get('logo')}")

with open('easyfmm/teamsData.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'\"([^\"]+)\":\s*\{\s*\n\s*displayName:\s*\"([^\"]+)\",.*?logoCode:\s*\"([^\"]+)\"', text, re.DOTALL)
for k, name, code in matches:
    if code in ['CEL', 'MAR', 'VIG', 'MTM', 'CSM', 'MRT']:
        print(f"teamsData.js: {k} ({name}) -> {code}")
