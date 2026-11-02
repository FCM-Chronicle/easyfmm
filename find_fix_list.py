import sys
import csv
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('tier1_clubs.json', 'r', encoding='utf-8') as f:
    clubs = json.load(f)

csv_path = "players.csv - players.csv.csv"

# Load current teamsData.js player names by playerid
with open('easyfmm/teamsData.js', 'r', encoding='utf-8') as f:
    text = f.read()

current_players = {}
for m in re.finditer(r'\{\s*name:\s*"([^"]+)",\s*position:\s*"([^"]+)",\s*country:\s*"([^"]+)",\s*age:\s*(\d+),\s*rating:\s*(\d+),\s*playerid:\s*(\d+)', text):
    pid = int(m.group(6))
    current_players[pid] = {
        "name": m.group(1),
        "pos": m.group(2),
        "country": m.group(3),
        "rating": int(m.group(5))
    }

print(f"Total parsed current players: {len(current_players)}")

# Check players that need fixing
needs_fix = []
with open(csv_path, mode="r", encoding="utf-8", errors="replace") as f:
    reader = csv.reader(f)
    for cols in reader:
        if not cols or len(cols) < 11:
            continue
        try:
            pid = int(cols[0].strip())
        except ValueError:
            continue
        club = cols[7].strip()
        if club not in clubs:
            continue
        known_as = cols[1].strip()
        first_name = cols[2].strip()
        last_name = cols[3].strip()
        raw_name = known_as if known_as else f"{first_name} {last_name}".strip()
        country = cols[9].strip()
        
        curr = current_players.get(pid)
        if not curr:
            continue
        
        curr_name = curr["name"]
        
        # Check reasons
        has_latin = bool(re.search(r'[a-zA-Z]', curr_name))
        is_english_speaking = country in ["England", "Scotland", "Wales", "Northern Ireland", "Ireland", "United States", "Canada", "Australia"]
        is_slavic_greek = country in ["Greece", "Ukraine", "Russia", "Bulgaria", "Belarus"]
        has_y_or_x = bool(re.search(r'[Yx]', curr_name))
        
        if has_latin or is_slavic_greek or has_y_or_x:
            needs_fix.append((pid, raw_name, curr_name, country, club))

print(f"Total players needing fix: {len(needs_fix)}")
for nf in needs_fix[:50]:
    print(f"{nf[0]} | raw: '{nf[1]}' | curr: '{nf[2]}' | country: {nf[3]} | club: {nf[4]}")

