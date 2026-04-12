from bs4 import BeautifulSoup

with open('debug_product.html', 'r', encoding='utf-8', errors='replace') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

print("--- DESCRIPTION DIV ---")
desc = soup.select_one('#description')
if desc:
    print(desc.text.strip()[:1500])
else:
    print("NO SE ENCONTRO #description")

print("\n--- ATTRIBUTE DESCRIPTION ---")
alt = soup.select_one('.product.attribute.description .value')
if alt:
    print(alt.text.strip()[:1500])
else:
    print("NO SE ENCONTRO .product.attribute.description .value")

print("\n--- ALL CLASSES WITH 'description' ---")
tags = soup.find_all(class_=lambda x: x and 'description' in x)
for t in tags[:5]:
    print(f"Class: {t.get('class')}")
    print(t.text.strip()[:200])
    
print("\n--- ALL H3 or Headers ---")
headers = soup.find_all(['h2', 'h3'])
for h in headers[:10]:
    print(h.text.strip())
