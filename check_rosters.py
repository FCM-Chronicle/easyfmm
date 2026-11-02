import sys
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('tier1_clubs.json', 'r', encoding='utf-8') as f:
    clubs = json.load(f)

print("Sample clubs keys in tier1_clubs.json:")
for k in list(clubs.keys())[:15]:
    c_info = clubs[k]
    key_safe = c_info.get("key") or c_info.get("name", "").replace(" ", "_") or k.replace(" ", "_")
    print(f"Original: {k} -> Key: {key_safe} (Name: {c_info.get('name')})")

with open('easyfmm/teamsData.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's find some clubs in teamsData.js
target_names = ["본머스", "피오렌티나", "첼시", "아스널", "아스톤", "울산"]
for t in target_names:
    matches = re.findall(rf'"([^"]*{t}[^"]*)":\s*\{{', text)
    print(f"Found keys matching '{t}': {matches}")

# Let's print players from Bournemouth, Chelsea, and Fiorentina
def print_roster(team_key):
    pattern = rf'"{team_key}":\s*\{{.*?"players":\s*\[(.*?)\]\s*\}},'
    m = re.search(pattern, text, re.DOTALL)
    if m:
        players_block = m.group(1)
        player_names = re.findall(r'name:\s*"([^"]+)"', players_block)
        print(f"\n=== {team_key} ({len(player_names)} players) ===")
        for p in player_names[:10]:
            print(f"  - {p}")
    else:
        print(f"\nCould not find roster for {team_key}")

for k in ["AFC_Bournemouth", "Chelsea", "Fiorentina", "Arsenal", "Aston_Villa"]:
    # Check if exact key or korean key exists
    for candidate in [k, f"AFC_{k}", f"ACF_{k}"]:
        if f'"{candidate}":' in text:
            print_roster(candidate)
            break
    else:
        # find matching
        matches = [m for m in re.findall(r'"([a-zA-Z0-9_가-힣]+)":\s*\{', text) if k.lower() in m.lower()]
        for m in matches:
            print_roster(m)

