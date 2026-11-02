import sys
import csv
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('tier1_clubs.json', 'r', encoding='utf-8') as f:
    clubs = json.load(f)

csv_path = "players.csv - players.csv.csv"

# Collect all players by country
all_p = []
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
        all_p.append((pid, raw_name, country, club))

print(f"Total Tier-1 players: {len(all_p)}")

# Find all players from Greece, Ukraine, Russia, Bulgaria, Belarus, England, Scotland, Wales, Ireland, Northern Ireland, USA, Canada, Australia
special_countries = [
    "Greece", "Ukraine", "Russia", "Bulgaria", "Belarus",
    "England", "Scotland", "Wales", "Ireland", "Northern Ireland", "United States", "Canada", "Australia"
]

target_players = [p for p in all_p if p[2] in special_countries]
print(f"Players from target countries: {len(target_players)}")

# Print by country
by_c = {}
for p in target_players:
    by_c.setdefault(p[2], []).append(p)

for c in special_countries:
    if c in by_c:
        print(f"--- {c} ({len(by_c[c])} players) ---")
        for p in by_c[c][:10]:
            print(f"  {p[0]}: {p[1]} ({p[3]})")

