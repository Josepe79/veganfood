import { PrismaClient } from '@prisma/client';

async function test() {
    const SERPAPI_KEY = '9e873277ef4f66643124d887ebe8d1d739eeae8c7da669c890a3e8542062d5d0';
    const ean = '9120008998848'; // Zumo Hollinger
    const url = `https://serpapi.com/search.json?engine=google_shopping&q=${ean}&hl=es&gl=es&api_key=${SERPAPI_KEY}`;
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log("CHEAPEST RESULT:");
        console.log(JSON.stringify(data.shopping_results?.[0], null, 2));
    } catch (e) {
        console.error(e);
    }
}

test();
