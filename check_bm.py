import sys
import csv

sys.stdout.reconfigure(encoding='utf-8')

with open("players.csv - players.csv.csv", "r", encoding="utf-8", errors="replace") as f:
    reader = csv.reader(f)
    for row in reader:
        if len(row) > 7 and "Bournemouth" in row[7]:
            if "Rayan" in row[1] or "Rayan" in row[2] or "Rayan" in row[3]:
                print(row[:10])
            if "Doak" in row[1] or "Doak" in row[2] or "Doak" in row[3]:
                print(row[:10])

