from bs4 import BeautifulSoup
import re

with open('debug_product.html', 'r', encoding='utf-8', errors='replace') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

print("--- TEXT BLOCKS PULL ---")
for tag in soup.find_all(string=re.compile(r"Dr\. Goerg", re.I)):
    parent = tag.parent
    print(f"[{parent.name}] {parent.get('class', '')} -> {tag.strip()}")

print("\n--- CONTENT BLOCKS ---")
for content in soup.find_all(class_='content'):
    print("Content class text snippet:")
    print(content.text.strip()[:200])

