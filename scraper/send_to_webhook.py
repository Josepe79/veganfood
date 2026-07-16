"""
Envía el JSON de productos al webhook en lotes de 500 productos
para evitar los límites de body size del proxy/CDN de Railway.
"""
import json
import os
import sys
import time
import urllib.request
import urllib.error

WEBHOOK_URL = os.environ.get("WEBHOOK_URL")
SYNC_SECRET = os.environ.get("SYNC_SECRET")
BATCH_SIZE = 500

if not WEBHOOK_URL or not SYNC_SECRET:
    print("ERROR: WEBHOOK_URL o SYNC_SECRET no están configurados.")
    sys.exit(1)

with open("productos_veganos.json", "r", encoding="utf-8") as f:
    productos = json.load(f)

print(f"Total de productos a sincronizar: {len(productos)}")

total_batches = (len(productos) + BATCH_SIZE - 1) // BATCH_SIZE
errores = 0

for i in range(0, len(productos), BATCH_SIZE):
    batch_num = (i // BATCH_SIZE) + 1
    batch = productos[i:i + BATCH_SIZE]
    payload = json.dumps(batch).encode("utf-8")

    print(f"  Lote {batch_num}/{total_batches}: enviando {len(batch)} productos ({len(payload)} bytes)...")

    req = urllib.request.Request(
        WEBHOOK_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {SYNC_SECRET}",
        },
        method="POST",
    )

    retries = 3
    for attempt in range(1, retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                body = resp.read().decode("utf-8")
                print(f"  ✅ Lote {batch_num} OK (HTTP {resp.status}): {body}")
            break
        except urllib.error.HTTPError as e:
            print(f"  ❌ Lote {batch_num} - HTTP {e.code}: {e.read().decode('utf-8', errors='replace')}")
            errores += 1
            break
        except Exception as e:
            print(f"  ⚠️ Lote {batch_num} - Intento {attempt}/{retries} falló: {e}")
            if attempt < retries:
                time.sleep(5)
            else:
                print(f"  ❌ Lote {batch_num} agotó reintentos.")
                errores += 1

if errores > 0:
    print(f"\n⚠️ Sincronización completada con {errores} errores.")
    sys.exit(1)
else:
    print(f"\n✅ Sincronización completada exitosamente ({total_batches} lotes).")
