import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('easyfmm/teamsData.js', 'r', encoding='utf-8') as f:
    text = f.read()

def show_team(team_name):
    # Search for team block
    needle = f'"{team_name}": {{'
    pos = text.find(needle)
    if pos < 0:
        print(f"Team {team_name} NOT FOUND!")
        return
    end_pos = text.find('        players: [', pos)
    end_block = text.find('        ]\n    },', end_pos)
    players_block = text[end_pos:end_block]
    player_names = re.findall(r'name:\s*"([^"]+)"', players_block)
    print(f"\n=================== {team_name} ({len(player_names)} players) ===================")
    for p in player_names:
        print(f"  {p}")

for t in ["본머스", "첼시", "피오렌티나", "아스톤_빌라", "울산_현대", "전북_현대"]:
    show_team(t)

