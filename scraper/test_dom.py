import asyncio
import os
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
from dotenv import load_dotenv

load_dotenv()

USERNAME = os.getenv("FELIUBADALO_EMAIL", "")
PASSWORD = os.getenv("FELIUBADALO_PASSWORD", "")
LOGIN_URL = "https://online.feliubadalo.com/customer/account/login/"
TEST_URL = "https://online.feliubadalo.com/chocolate-blanco-eco-vegan-90g-chocolates-sole"

async def main():
    print(f"User: {USERNAME}")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        print("Navigating to login...")
        await page.goto(LOGIN_URL)
        
        try:
            cookie_btn = await page.wait_for_selector('button#btn-cookie-allow', timeout=5000)
            await cookie_btn.click()
        except:
            pass

        await page.fill('input[name="login[username]"]', USERNAME)
        await page.fill('input[name="login[password]"]', PASSWORD)
        await page.click('button.action.login.primary')
        print("Waiting for login...")
        await asyncio.sleep(5)

        
        print("Navigating to product...")
        await page.goto(TEST_URL, wait_until="networkidle")
        
        html = await page.content()
        soup = BeautifulSoup(html, 'html.parser')
        
        print("\n=== EXTRACTING POTENTIAL DESCRIPTION BLOCKS ===")
        # Usually tabs are in .data.item.content or .product.attribute.description
        selectors = [
            '#description',
            '.product.attribute.description .value',
            '.data.item.content',
            'div[itemprop="description"]'
        ]
        
        for sel in selectors:
            elems = soup.select(sel)
            print(f"\n[Selector: {sel}] found {len(elems)} elements.")
            for i, el in enumerate(elems):
                print(f"  --> Element {i} text (first 100 chars): {el.text.strip()[:100].replace(chr(10), ' ')}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
