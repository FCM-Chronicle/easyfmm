import sys

files = ['easyfmm/teamsData.js', 'easyfmm/leagueManager.js', 'easyfmm/tacticSystem.js', 'easyfmm/deepenTactic.js', 'easyfmm/script.js']

for fpath in files:
    with open(fpath, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    
    # Simple bracket count check (ignoring strings and comments roughly)
    # Check braces, brackets, parentheses
    curly = content.count('{') - content.count('}')
    square = content.count('[') - content.count(']')
    paren = content.count('(') - content.count(')')
    print(f"{fpath}: curly={curly}, square={square}, paren={paren} (len={len(content)})")

