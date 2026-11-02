import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

with open('suspicious_players.json', 'r', encoding='utf-8') as f:
    suspicious = json.load(f)

for s in suspicious:
    print(f"{s[0]} | {s[1]} | {s[2]} | {s[3]} | {s[4]}")

