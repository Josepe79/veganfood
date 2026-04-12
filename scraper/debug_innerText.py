import asyncio
import os
from playwright.async_api import async_playwright
from dotenv import load_dotenv

load_dotenv()

USERNAME = os.getenv("FELIUBADALO_EMAIL", "")
PASSWORD = os.getenv("FELIUBADALO_PASSWORD", "")
LOGIN_URL = "https://online.feliubadalo.com/customer/account/login/"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        page = await context.new_page()

        await page.goto(LOGIN_URL)
        try:
           await page.wait_for_selector('button#btn-cookie-allow', timeout=5000)
           await page.click('button#btn-cookie-allow')
        except: pass

        await page.fill('input[name="login[username]"]', USERNAME)
        await page.fill('input[name="login[password]"]', PASSWORD)
        await page.click('button.action.login.primary')
        await page.wait_for_load_state('networkidle')

        url = "https://online.feliubadalo.com/aceite-coco-virgen-extra-bio-400ml-dr-goerg"
        await page.goto(url, wait_until="networkidle")
        await page.wait_for_timeout(3000)
        
        # Expand any "Ver Más" buttons!
        buttons = await page.query_selector_all('text="Ver Más"')
        for btn in buttons:
            try:
                await btn.click(timeout=1000)
                await page.wait_for_timeout(500)
            except: pass
            
        buttons2 = await page.query_selector_all('text="Ver ms"')
        for btn in buttons2:
            try:
                await btn.click(timeout=1000)
                await page.wait_for_timeout(500)
            except: pass

        text = await page.evaluate("document.body.innerText")
        with open('debug_body_text.txt', 'w', encoding='utf-8', errors='replace') as f:
            f.write(text)
            
        print("Guardado en debug_body_text.txt")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
