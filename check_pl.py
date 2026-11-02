import sys
import csv
import json

sys.stdout.reconfigure(encoding='utf-8')

with open('tier1_clubs.json', 'r', encoding='utf-8') as f:
    clubs = json.load(f)

csv_path = "players.csv - players.csv.csv"

pl_clubs = [k for k, v in clubs.items() if v.get("leagueId") == "premier_league"]
print(f"Premier League clubs: {len(pl_clubs)} clubs")

pl_players = []
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
        if club in pl_clubs:
            known_as = cols[1].strip()
            first_name = cols[2].strip()
            last_name = cols[3].strip()
            raw_name = known_as if known_as else f"{first_name} {last_name}".strip()
            country = cols[9].strip()
            pl_players.append((pid, raw_name, country, club))

print(f"Total Premier League players: {len(pl_players)}")

