# test_hangulize_integration.py
import sys
import os

sys.path.insert(0, os.path.abspath("hangulize_repo"))
sys.path.insert(0, os.path.abspath("python_embed"))

from hangulize import hangulize

tests = [
    ("ita", "Brescianini"),
    ("ita", "Sottil"),
    ("ita", "Mandragora"),
    ("ita", "Pongracic"),
    ("ita", "Fabbian"),
    ("isl", "Gudmundsson"),
    ("deu", "Schlotterbeck"),
    ("deu", "Anton"),
    ("spa", "Cucurella"),
    ("spa", "Balde"),
    ("por", "Braganca"),
    ("por", "Mario"),
    ("nld", "Wijndal"),
    ("tur", "Akgun"),
    ("tur", "Yilmaz")
]

for code, word in tests:
    try:
        res = hangulize(word, code)
        print(f"[{code}] {word} -> {res}")
    except Exception as e:
        print(f"[{code}] {word} -> ERROR: {e}")

