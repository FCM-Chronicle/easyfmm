import re

with open('easyfmm/teamsData.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Find team blocks
pattern = r'"([^"]+)":\s*\{\s*\n\s*displayName:\s*"([^"]+)",(?:[^\n]+\n){1,8}\s*logoCode:\s*"([^"]+)"'
matches = re.findall(pattern, text)
print(f"Total clubs with logoCode: {len(matches)}")

for k, name, logo in matches:
    if any(x in name or x in k for x in ['셀타', '셀틱', '마리티무', 'Celta', 'Celtic', 'Maritimo', '비고']):
        print(f"Key: '{k}' | Name: '{name}' | Logo: '{logo}'")

# Also check any duplicate logos across all clubs
logos = {}
for k, name, logo in matches:
    logos.setdefault(logo, []).append((k, name))

print("\nDuplicate logos across clubs:")
for logo, team_list in logos.items():
    if len(team_list) > 1:
        print(f"Logo '{logo}': {team_list}")

