import sys
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('english_players_to_fix.json', 'r', encoding='utf-8') as f:
    eng_players = json.load(f)

unique_words = set()
for p in eng_players:
    raw = p['raw']
    # clean words
    for w in re.split(r'[\s\-]+', raw):
        w = w.strip(".,'\"")
        if w:
            unique_words.add(w)

print(f"Total unique words across all 389 English players: {len(unique_words)}")
with open('unique_eng_words.json', 'w', encoding='utf-8') as f:
    json.dump(sorted(list(unique_words)), f, ensure_ascii=False, indent=2)
print("Saved to unique_eng_words.json")

