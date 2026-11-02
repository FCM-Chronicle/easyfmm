import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

with open('english_players_to_fix.json', 'r', encoding='utf-8') as f:
    eng_players = json.load(f)

print(f"Total English players: {len(eng_players)}")
# Print first 50
for p in eng_players[:50]:
    print(f"{p['pid']}: {p['raw']} ({p['current']}) - {p['club']}")

