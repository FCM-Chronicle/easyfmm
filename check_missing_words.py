import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

with open('unique_eng_words.json', 'r', encoding='utf-8') as f:
    words = json.load(f)

with open('master_known_players.json', 'r', encoding='utf-8') as f:
    known = json.load(f)

with open('master_tokens.json', 'r', encoding='utf-8') as f:
    tokens = json.load(f)
    first_names = tokens.get("firstNames", {})
    surnames = tokens.get("surnames", {})

already_known = {}
missing = []

for w in words:
    if w in known:
        already_known[w] = known[w]
    elif w in first_names:
        already_known[w] = first_names[w]
    elif w in surnames:
        already_known[w] = surnames[w]
    else:
        missing.append(w)

print(f"Total words: {len(words)}")
print(f"Already cleanly mapped: {len(already_known)}")
print(f"Missing words to map: {len(missing)}")

with open('missing_eng_words.json', 'w', encoding='utf-8') as f:
    json.dump(missing, f, ensure_ascii=False, indent=2)
print("Saved missing to missing_eng_words.json")

