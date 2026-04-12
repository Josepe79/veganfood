import asyncio
import os
from playwright.async_api import async_playwright

USERNAME = os.getenv("FELIUBADALO_EMAIL", "")
PASSWORD = os.getenv("FELIUBADALO_PASSWORD", "")
LOGIN_URL = "https://online.feliubadalo.com/customer/account/login/"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        page = await context.new_page()

        print("Iniciando sesión...")
        await page.goto(LOGIN_URL)
        try:
            cookie_btn = await page.wait_for_selector('button#btn-cookie-allow', timeout=5000)
            await cookie_btn.click()
        except: pass

        await page.fill('input[name="login[username]"]', USERNAME)
        await page.fill('input[name="login[password]"]', PASSWORD)
        await page.click('button.action.login.primary')
        await page.wait_for_load_state('networkidle')

        url = "https://online.feliubadalo.com/aceite-coco-virgen-extra-bio-400ml-dr-goerg"
        print(f"Navegando a {url}")
        
        await page.goto(url, wait_until="networkidle")
        await page.wait_for_timeout(2000)
        
        # Scrolleo hasta el final para forzar Ajax / Lazy Loading
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await page.wait_for_timeout(3000)
        
        # Y mas scrolls intercalados
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight/2)")
        await page.wait_for_timeout(2000)

        html = await page.content()
        with open('debug_product_scrolled.html', 'w', encoding='utf-8') as f:
            f.write(html)
            
        print("Guardado en debug_product_scrolled.html")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
