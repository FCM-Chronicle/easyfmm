import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('easyfmm/teamsData.js', 'r', encoding='utf-8') as f:
    for _ in range(50):
        line = f.readline()
        if not line:
            break
        print(line, end='')

