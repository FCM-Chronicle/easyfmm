import re
import json

with open('easyfmm/teamsData.js', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r'"([^"]+)":\s*\{\s*\n\s*displayName:[^\n]+\n\s*city:[^\n]+\n\s*country:[^\n]+\n\s*leagueId:\s*"([^"]+)"'
matches = re.findall(pattern, text)
print(f"Total matched teams: {len(matches)}")

by_league = {}
for tname, lid in matches:
    by_league.setdefault(lid, []).append(tname)

LEAGUES_CONFIG = {
    "premier_league": 38,
    "laliga": 38,
    "bundesliga": 34,
    "serie_a": 38,
    "ligue_1": 34,
    "eredivisie": 34,
    "liga_portugal": 34,
    "super_lig": 34,
    "kleague_1": 33
}

for lid, target_rounds in LEAGUES_CONFIG.items():
    teams = by_league.get(lid, [])
    n = len(teams)
    print(f"[{lid}] {n} teams (even: {n%2==0})")
    
    # Test schedule generation
    if n % 2 != 0:
        print(f"  ERROR: Odd number of teams in {lid}!")
        continue
    
    rounds = n - 1
    half = n // 2
    sched = []
    t_copy = list(teams)
    for r in range(rounds):
        round_matches = []
        for i in range(half):
            h = t_copy[i]
            a = t_copy[n - 1 - i]
            if r % 2 == 0:
                round_matches.append((h, a))
            else:
                round_matches.append((a, h))
        sched.append(round_matches)
        first = t_copy[0]
        rest = t_copy[1:]
        last = rest.pop()
        rest.insert(0, last)
        t_copy = [first] + rest
    
    second_half = [[(a, h) for h, a in rm] for rm in sched]
    full = sched + second_half
    if target_rounds > len(full):
        extra = target_rounds - len(full)
        full = full + sched[:extra]
    
    print(f"  Generated schedule rounds: {len(full)} (Target: {target_rounds})")
    # Verify every team plays exactly 1 match per round
    valid_rounds = True
    for r_idx, rm in enumerate(full):
        played = set()
        for h, a in rm:
            if h in played or a in played:
                valid_rounds = False
                print(f"  ERROR: duplicate team in round {r_idx+1}")
            played.add(h)
            played.add(a)
        if len(played) != n:
            valid_rounds = False
            print(f"  ERROR: Not all teams played in round {r_idx+1}: {len(played)}/{n}")
    if valid_rounds:
        print(f"  Schedule for {lid}: 100% VALID! Every team plays 1 match per round.")

