from bs4 import BeautifulSoup

html = open('debug_product.html', encoding='utf-8', errors='ignore').read()
soup = BeautifulSoup(html, 'html.parser')

print("Buscando bloques de texto largos (posibles descripciones)...")
for div in soup.find_all(['div']):
    # get text directly from this tag, excluding children if possible, but actually we want children
    text = div.get_text(separator=' ', strip=True)
    classes = div.get('class', [])
    if len(text) > 200 and len(text) < 1500:
        if not ("Pidel" in text or "gesti" in text or "newsletter" in text):
            # Probably a real desc
            print("CLASS:", getattr(div, 'get', lambda x, y: y)('class', 'None'))
            print("ID:", getattr(div, 'get', lambda x, y: y)('id', 'None'))
            print("TEXT:", text[:200])
            print("--------------------\n")
