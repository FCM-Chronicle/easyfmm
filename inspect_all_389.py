import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

with open('english_players_to_fix.json', 'r', encoding='utf-8') as f:
    eng_players = json.load(f)

# Sort by raw name
eng_players.sort(key=lambda x: x['raw'])

print(f"Total English players: {len(eng_players)}")
for i, p in enumerate(eng_players):
    print(f"{i+1:3d}. [{p['pid']}] {p['raw']} ({p['club']}, {p['country']}) -> curr: '{p['current']}'")

