# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema para PostgreSQL y MySQL
# PostgreSQL (default): libpq-dev
# MySQL (optional): default-libmysqlclient-dev
RUN apt-get update && apt-get install -y \
    libpq-dev \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements e instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar código de la aplicación
COPY . .

# Exponer puerto
EXPOSE 8000

# Comando de inicio
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
