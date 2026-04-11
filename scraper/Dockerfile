FROM mcr.microsoft.com/playwright/python:v1.41.0-jammy

# Directorio de trabajo
WORKDIR /app

# Copiamos requerimientos
COPY requirements.txt .

# Instalamos dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el código de los scrapers
COPY . .

# Al tratarse de un script Cron en vez de un servidor continuo,
# el comando por defecto ejecuta ambos scrapers de forma secuencial
# IMPORTANTE: Railway debe configurarse como un "Cron Job" service.
CMD ["sh", "-c", "python scraper.py && python scraper_deep.py"]
