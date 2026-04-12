import asyncio
import json
import os
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
from dotenv import load_dotenv

load_dotenv()

USERNAME = os.getenv("FELIUBADALO_EMAIL", "")
PASSWORD = os.getenv("FELIUBADALO_PASSWORD", "")
LOGIN_URL = "https://online.feliubadalo.com/customer/account/login/"
JSON_INPUT = "productos_veganos.json"
JSON_OUTPUT = "productos_completos.json"

async def login(page):
    print("Iniciando sesión en Feliubadaló...")
    await page.goto(LOGIN_URL)
    
    # Manejo de cookies
    try:
        cookie_btn = await page.wait_for_selector('button#btn-cookie-allow', timeout=5000)
        await cookie_btn.click()
    except Exception:
        pass

    await page.fill('input[name="login[username]"]', USERNAME)
    await page.fill('input[name="login[password]"]', PASSWORD)
    await page.click('button.action.login.primary')
    await page.wait_for_load_state('networkidle')

async def main():
    if not os.path.exists(JSON_INPUT):
        print(f"Error: No se encuentra {JSON_INPUT}. Ejecuta scraper.py primero.")
        return

    with open(JSON_INPUT, 'r', encoding='utf-8') as f:
        productos = json.load(f)

    # Solo las URLs reales que empiecen por http
    productos_con_url = [p for p in productos if p.get('url_original', '').startswith('http')]
    
    # Podría limitarse por ahora si son 2800? 
    # El usuario lo meterá en un Cron, así que procesa todo
    print(f"Iniciando extracción profunda para {len(productos_con_url)} productos detectados.")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        await login(page)

        productos_completos = []
        count = 0
        total = len(productos_con_url)

        for prod in productos_con_url:
            count += 1
            url = prod['url_original']
            print(f"[{count}/{total}] Scraping: {prod['nombre']}...")
            try:
                # Navegar al producto
                await page.goto(url, wait_until="domcontentloaded")
                html = await page.content()
                soup = BeautifulSoup(html, 'html.parser')

                descripcion = ""
                ingredientes = ""

                # Feliubadaló incrusta un global footer molesto bajo el ID '#description'. Lo ignoramos.
                # La verdadera descripción habita en múltiples bloques '.product.attribute.description .value'
                desc_panels = soup.select('.product.attribute.description .value')
                if desc_panels:
                    # Concatenar todos los fragmentos separados (A veces dividen descripcion en varios párrafos)
                    descripcion = "\n\n".join([p.text.strip() for p in desc_panels if p.text.strip()])
                else:
                    descripcion = ""

                ing_tag = soup.select_one('#ingredientes')
                if ing_tag:
                    ingredientes = ing_tag.text.strip()
                else:
                    # En su schema pueden usar custom attributes
                    # Buscamos a mano un bloque con título "Ingredientes"
                    labels = soup.select('.label')
                    for l in labels:
                        if 'ingrediente' in l.text.lower():
                            val = l.find_next_sibling(class_='value')
                            if val:
                                ingredientes = val.text.strip()
                                break

                # Clonar dict y ampliar
                nuevo_prod = dict(prod)
                nuevo_prod['descripcion'] = descripcion
                nuevo_prod['ingredientes'] = ingredientes
                productos_completos.append(nuevo_prod)

                # Guardamos periódicamente para no perder datos si crashea
                if count % 20 == 0:
                    with open(JSON_OUTPUT, 'w', encoding='utf-8') as f:
                        json.dump(productos_completos, f, ensure_ascii=False, indent=2)

                await asyncio.sleep(1)  # Rate limiting gentil

            except Exception as e:
                print(f"Error procesando {url}: {e}")
                productos_completos.append(prod) # Lo añadimos igual sin las extensiones

        # Guardado final
        with open(JSON_OUTPUT, 'w', encoding='utf-8') as f:
            json.dump(productos_completos, f, ensure_ascii=False, indent=2)
            
        await browser.close()
        print(f"Deep Scrape Finalizado. Base de datos rica generada en {JSON_OUTPUT}")

if __name__ == "__main__":
    asyncio.run(main())
