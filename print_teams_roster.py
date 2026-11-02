import sys
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('easyfmm/teamsData.js', 'r', encoding='utf-8') as f:
    text = f.read()

def print_roster(team_key):
    pattern = rf'"{team_key}":\s*\{{.*?"players":\s*\[(.*?)\]\s*\}},'
    m = re.search(pattern, text, re.DOTALL)
    if m:
        players_block = m.group(1)
        player_names = re.findall(r'name:\s*"([^"]+)"', players_block)
        print(f"\n=== {team_key} ({len(player_names)} players) ===")
        for p in player_names:
            print(f"  - {p}")
    else:
        print(f"\nCould not find roster for {team_key}")

for k in ["본머스", "피오렌티나", "첼시", "아스널", "아스톤_빌라", "울산_현대"]:
    print_roster(k)

