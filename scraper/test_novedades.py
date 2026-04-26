from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import time

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('https://online.feliubadalo.com/alimentacion?estilo_de_vida=13&product_list_limit=60', wait_until='networkidle')
    time.sleep(3)
    
    # Click to page 2, 3, etc until we find it or something
    for _ in range(5):
        soup = BeautifulSoup(page.content(), 'html.parser')
        for item in soup.select('.item.product.product-item'):
            if 'Chocolate Blanco Eco Vegan' in item.text:
                print("================ FOUND ==================")
                print(item.prettify())
                print("=========================================")
                browser.close()
                exit()
        
        try:
            page.locator('.pages-item-next > a').first.click(timeout=3000)
            page.wait_for_load_state('networkidle')
            time.sleep(2)
        except:
            break
            
    print("Not found in the first pages.")
    browser.close()
