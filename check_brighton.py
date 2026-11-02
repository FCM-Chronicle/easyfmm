import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('easyfmm/teamsData.js', 'r', encoding='utf-8') as f:
    text = f.read()

needle = '"브라이튼": {'
pos = text.find(needle)
if pos >= 0:
    end_pos = text.find('        players: [', pos)
    end_block = text.find('        ]\n    },', end_pos)
    players_block = text[end_pos:end_block]
    player_names = re.findall(r'name:\s*"([^"]+)",\s*position:\s*"([^"]+)",\s*country:\s*"([^"]+)"', players_block)
    print(f"=== 브라이튼 ({len(player_names)} players) ===")
    for p in player_names:
        print(f"  {p[0]} ({p[1]}, {p[2]})")

