# Используем официальный Python образ
FROM python:3.11-slim

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем requirements.txt
COPY requirements.txt .

# Устанавливаем Python зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь проект
COPY . .

# Создаем директории для логов и media
RUN mkdir -p logs media/avatars staticfiles

# Создаем пользователя для безопасности
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app

# Собираем статические файлы (будет переопределено при запуске)
# Делаем это до переключения на appuser, так как может потребоваться запись
RUN python manage.py collectstatic --noinput || true

USER appuser

# Открываем порт
EXPOSE 8000

# Команда запуска (будет переопределена в docker-compose)
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "unicrewback.wsgi:application"]

