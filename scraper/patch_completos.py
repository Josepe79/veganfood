import json

print("Iniciando parcheo de productos_completos con is_nuevo...")
with open("productos_veganos.json", "r", encoding="utf-8") as f:
    veganos = json.load(f)

# Diccionario rapido para buscar
veganos_dict = { v['url_original']: v.get('is_nuevo', False) for v in veganos }

with open("productos_completos.json", "r", encoding="utf-8") as f:
    completos = json.load(f)

modificados = 0
for comp in completos:
    url = comp.get('url_original')
    if url in veganos_dict:
        comp['is_nuevo'] = veganos_dict[url]
        modificados += 1
    else:
        comp['is_nuevo'] = False

with open("productos_completos.json", "w", encoding="utf-8") as f:
    json.dump(completos, f, ensure_ascii=False, indent=2)

print(f"Parcheo completado. Se han asimilado {modificados} productos con su bandera de novedad original.")
