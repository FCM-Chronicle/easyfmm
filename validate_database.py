import sys
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('easyfmm/teamsData.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Check total clubs
club_keys = re.findall(r'    "([^"]+)":\s*\{\s*\n\s*displayName:', text)
print(f"Total clubs in allTeams: {len(club_keys)}")

# Check players
all_player_matches = re.findall(r'\{\s*name:\s*"([^"]*)",\s*position:\s*"([^"]*)",\s*country:\s*"([^"]*)",\s*age:\s*(\d+),\s*rating:\s*(\d+)', text)
print(f"Total players found: {len(all_player_matches)}")

empty_names = [p for p in all_player_matches if not p[0].strip()]
print(f"Empty names count: {len(empty_names)}")

# Check if any player name contains untranslated raw alphabet longer than 3 letters
alphabet_names = [p for p in all_player_matches if re.search(r'[A-Za-z]{3,}', p[0])]
print(f"Untranslated Latin names count: {len(alphabet_names)}")
if alphabet_names:
    print("Sample untranslated Latin names:", alphabet_names[:10])

# Check for preserved teams
preserved = ["아르헨티나_연합", "미국_연합", "멕시코_연합", "브라질_연합", "알_힐랄", "알_이티하드", "알_나스르", "셀틱"]
for pt in preserved:
    print(f"Preserved team '{pt}' present: {f'\"{pt}\":' in text}")

# Check iconPlayersList
print(f"iconPlayersList present: {'iconPlayersList' in text}")

