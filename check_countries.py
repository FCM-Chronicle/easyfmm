import sys
import csv
import json

sys.stdout.reconfigure(encoding='utf-8')

with open('tier1_clubs.json', 'r', encoding='utf-8') as f:
    clubs = json.load(f)

csv_path = "players.csv - players.csv.csv"

unique_names = set()
by_country = {}
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
        unique_names.add((pid, raw_name, country))
        by_country[country] = by_country.get(country, 0) + 1

print(f"Total unique players: {len(unique_names)}")
print("Top countries count:")
for c, cnt in sorted(by_country.items(), key=lambda x: x[1], reverse=True)[:15]:
    print(f"  {c}: {cnt}")

