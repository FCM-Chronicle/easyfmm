with open('easyfmm/teamsData.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if any(k in line for k in ['셀타', '셀틱', '마리티무', 'Celta', 'Celtic', 'Maritimo']):
        print(f"Line {i+1}: {line.strip()[:100]}")

