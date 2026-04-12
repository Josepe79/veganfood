import asyncio
import os
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
from dotenv import load_dotenv

load_dotenv()

USERNAME = os.getenv("FELIUBADALO_EMAIL", "")
PASSWORD = os.getenv("FELIUBADALO_PASSWORD", "")
LOGIN_URL = "https://online.feliubadalo.com/customer/account/login/"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        await page.goto(LOGIN_URL)
        try: await page.click('button#btn-cookie-allow')
        except: pass

        await page.fill('input[name="login[username]"]', USERNAME)
        await page.fill('input[name="login[password]"]', PASSWORD)
        await page.click('button.action.login.primary')
        await page.wait_for_load_state('networkidle')

        url = "https://online.feliubadalo.com/aceite-coco-virgen-extra-bio-400ml-dr-goerg"
        await page.goto(url, wait_until="networkidle")
        await page.wait_for_timeout(3000)

        html = await page.content()
        soup = BeautifulSoup(html, 'html.parser')
        
        desc_tag = soup.select_one('#description')
        print("--- #description ---")
        if desc_tag: print(desc_tag.text.strip()[:300])
        else: print("NOT FOUND")

        alt = soup.select_one('.product.attribute.description .value')
        print("\n--- .product.attribute.description .value ---")
        if alt: print(alt.text.strip()[:300])
        else: print("NOT FOUND")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
