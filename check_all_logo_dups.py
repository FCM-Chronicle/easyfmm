import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('easyfmm/teamsData.js', 'r', encoding='utf-8') as f:
    text = f.read()

matches = re.findall(r'\"([^\"]+)\":\s*\{\s*\n\s*displayName:\s*\"([^\"]+)\",.*?logoCode:\s*\"([^\"]+)\"', text, re.DOTALL)
print(f"Total clubs parsed: {len(matches)}")

by_code = {}
for k, name, code in matches:
    by_code.setdefault(code, []).append((k, name))

duplicates = {c: teams for c, teams in by_code.items() if len(teams) > 1}
print(f"Total duplicated logoCodes: {len(duplicates)}")
for c, teams in duplicates.items():
    print(f"Code '{c}': {teams}")

