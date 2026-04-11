import os
import json
import time
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

load_dotenv()
email = os.getenv("FELIUBADALO_EMAIL")
password = os.getenv("FELIUBADALO_PASSWORD")

def extraer_catalogo_vegano():
    with sync_playwright() as p:
        print("Iniciando navegador Playwright...")
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()
        
        print("Navegando al login...")
        page.goto("https://online.feliubadalo.com/customer/account/login/")
        page.wait_for_timeout(3000)
        
        try:
            page.locator('button:has-text("Permitir todas las cookies")').click(timeout=3000)
        except: pass
            
        print("Introduciendo credenciales...")
        try: page.locator("#email").first.fill(email)
        except: page.locator("input[type='email']").first.fill(email)
        page.locator("#pass").first.fill(password)
        
        print("Enviando formulario de login...")
        page.locator("#pass").first.press("Enter")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(3000)
        
        productos_todos = []
        pag_actual = 1
        
        while True:
            # Categoría Alimentación filtrado por Estilo de Vida: Vegano
            url_cat = f"https://online.feliubadalo.com/alimentacion?estilo_de_vida=13&p={pag_actual}"
            print(f"Navegando a Catálogo Vegano página {pag_actual}...")
            page.goto(url_cat, wait_until="networkidle")
            page.wait_for_timeout(4000) # Extra safety for dynamic elements
            
            html = page.content()
            soup = BeautifulSoup(html, 'html.parser')
            items = soup.select('.item.product.product-item')
            
            if not items:
                print("No se encontraron productos o fin de la paginación.")
                break
                
            for item in items:
                try:
                    name_tag = item.select_one('.product-item-name a')
                    nombre = name_tag.text.strip() if name_tag else "Desconocido"
                    url_original = name_tag.get('href') if name_tag else ""
                    
                    img_tag = item.select_one('.product-image-photo')
                    imagen = img_tag.get('src') if img_tag else ""
                    
                    brand_tag = item.select_one('.brand a')
                    marca = brand_tag.text.strip() if brand_tag else ""
                    
                    refs = item.select('.reference span')
                    ean = ""
                    mpn = ""
                    for r in refs:
                        t = r.text.strip()
                        if 'EAN:' in t:
                            ean = t.replace('EAN:', '').strip()
                        elif 'Ref:' in t:
                            mpn = t.replace('Ref:', '').strip()
                            
                    stock_tag = item.select_one('.venta-sin-stock span.msg')
                    stock_txt = stock_tag.text.strip() if stock_tag else ""
                    agotado = True if 'agotado' in stock_txt.lower() or 'sin stock' in stock_txt.lower() else False
                    
                    price_tag = item.select_one('.price')
                    precio_b2b = price_tag.text.strip() if price_tag else "0,00"
                    
                    pvpr_tag = item.select_one('.pvpr span')
                    pvpr = pvpr_tag.text.replace('PVPR:', '').strip() if pvpr_tag else ""
                    
                    productos_todos.append({
                        "nombre": nombre,
                        "marca": marca,
                        "ean": ean,
                        "ref": mpn,
                        "precio_b2b": precio_b2b,
                        "pvpr": pvpr,
                        "agotado": agotado,
                        "imagen": imagen,
                        "url_original": url_original
                    })
                except Exception as e:
                    print(f"Error parseando un producto: {e}")
                    
            print(f"Página {pag_actual}: extraídos {len(items)} productos. Total acumulado: {len(productos_todos)}")
            
            if not items:
                print("No se encontraron más productos. Fin de la paginación.")
                break
                
            # Check for pagination looping (Magento sometimes returns page 1 when exceeding limits)
            if pag_actual > 1 and productos_todos and items:
                first_new_name = items[0].select_one('.product-item-name a')
                first_new_name = first_new_name.text.strip() if first_new_name else ""
                
                # Compare with the first item from the very first page
                # If they match precisely, we're probably looping
                if productos_todos[0]['nombre'] == first_new_name:
                    print("¡Paginación circular detectada! Fin de la extracción.")
                    break
                    
            pag_actual += 1

        with open("productos_veganos.json", "w", encoding="utf-8") as f:
            json.dump(productos_todos, f, ensure_ascii=False, indent=2)
            
        print(f"Proceso finalizado. Total de productos extraídos: {len(productos_todos)} y guardados en productos_veganos.json")
        browser.close()

if __name__ == "__main__":
    extraer_catalogo_vegano()
