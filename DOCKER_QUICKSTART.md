# Быстрый старт с Docker и Dockploy

## Шаги для деплоя

### 1. Подготовка переменных окружения

Создайте файл `.env` в корне проекта:

```bash
cp .env.example .env
nano .env
```

Заполните все переменные, особенно:
- `SECRET_KEY` - сгенерируйте новый ключ
- `ALLOWED_HOSTS` - ваш домен
- `CORS_ALLOWED_ORIGINS` - ваш домен с https
- `VITE_API_URL` - https://yourdomain.com/api/

### 2. Закоммитьте изменения

```bash
git add .
git commit -m "Add Docker configuration"
git push
```

### 3. Настройка Dockploy

1. Зайдите на платформу Dockploy
2. Подключите ваш репозиторий
3. Создайте новый проект
4. В разделе "Environment Variables" добавьте все переменные из `.env`
5. Укажите `docker-compose.yml` как основной файл
6. Нажмите "Deploy"

### 4. Настройка DNS

Настройте A записи для вашего домена:
```
yourdomain.com -> IP сервера Dockploy
www.yourdomain.com -> IP сервера Dockploy
```

### 5. Готово!

После деплоя:
- Frontend будет доступен на `https://yourdomain.com`
- Backend API на `https://yourdomain.com/api/`
- SSL сертификат настроится автоматически

## Локальная проверка

Перед деплоем можно проверить локально:

```bash
# Создайте .env файл
cp .env.example .env
# Отредактируйте .env

# Запустите контейнеры
docker-compose up -d --build

# Создайте суперпользователя
docker-compose exec backend python manage.py createsuperuser --settings=unicrewback.settings_production

# Проверьте логи
docker-compose logs -f
```

## Обновление

После изменений в коде:
1. `git push`
2. Нажмите "Redeploy" в Dockploy

Или вручную:
```bash
docker-compose down
docker-compose up -d --build
```

