# test_hangulize.py
import sys
import os

# Add paths
sys.path.insert(0, os.path.abspath("hangulize_repo"))
sys.path.insert(0, os.path.abspath("python_embed"))

from hangulize import hangulize

print("Ita Cappuccino:", hangulize("Cappuccino", "ita"))
print("Spa Rodriguez:", hangulize("Rodriguez", "spa"))
print("Deu Schmidt:", hangulize("Schmidt", "deu"))
print("Nld van Dijk:", hangulize("van Dijk", "nld"))
print("Fra Lacroix:", hangulize("Lacroix", "fra"))

