# Деплой uniCrew с Docker и Dockploy

## Что такое Dockploy?

Dockploy - это платформа для простого деплоя Docker контейнеров. Она автоматически:
- Собирает Docker образы из вашего репозитория
- Запускает контейнеры
- Настраивает SSL сертификаты
- Управляет доменами

## Подготовка проекта

### 1. Структура файлов

Убедитесь, что у вас есть следующие файлы:
- `docker-compose.yml` в корне проекта
- `back/Dockerfile`
- `front/Dockerfile`
- `front/nginx.conf`
- `.env.example` (для примера)

### 2. Настройка переменных окружения

Создайте файл `.env` в корне проекта (НЕ коммитьте его в git!):

```env
# Django Settings
SECRET_KEY=your_very_long_random_secret_key_here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DB_NAME=unicrew_db
DB_USER=postgres
DB_PASSWORD=your_secure_password

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
DEFAULT_FROM_EMAIL=your_email@gmail.com

# CORS Settings
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Security
SECURE_SSL_REDIRECT=True

# Frontend API URL
VITE_API_URL=https://yourdomain.com/api/
```

**Генерация SECRET_KEY:**
```bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

## Деплой через Dockploy

### Шаг 1: Подготовка репозитория

1. Убедитесь, что все файлы закоммичены:
```bash
git add .
git commit -m "Add Docker configuration"
git push
```

2. **НЕ коммитьте `.env` файл!** Он должен быть в `.gitignore`

### Шаг 2: Настройка Dockploy

1. Зарегистрируйтесь на [Dockploy](https://dockploy.com) или вашей платформе

2. Подключите ваш GitHub/GitLab репозиторий

3. Создайте новый проект

4. Настройте переменные окружения в интерфейсе Dockploy:
   - Скопируйте все переменные из вашего `.env` файла
   - Вставьте их в раздел "Environment Variables"

### Шаг 3: Конфигурация Dockploy

В настройках проекта Dockploy:

**Build Settings:**
- Build Command: (не требуется, используется Dockerfile)
- Dockerfile Path: `back/Dockerfile` (для backend) и `front/Dockerfile` (для frontend)
- Docker Compose: Используйте `docker-compose.yml`

**Port Settings:**
- Frontend: порт 80
- Backend: порт 8000 (внутренний, не публичный)

**Domain Settings:**
- Основной домен: `yourdomain.com`
- Поддомен: `www.yourdomain.com`

### Шаг 4: Настройка DNS

Настройте DNS записи для вашего домена:

**A Record:**
```
yourdomain.com -> IP адрес сервера Dockploy
www.yourdomain.com -> IP адрес сервера Dockploy
```

Или используйте CNAME (если Dockploy предоставляет):
```
yourdomain.com -> CNAME -> dockploy-provided-domain.com
www.yourdomain.com -> CNAME -> dockploy-provided-domain.com
```

### Шаг 5: Деплой

1. Нажмите "Deploy" в интерфейсе Dockploy
2. Dockploy автоматически:
   - Соберет Docker образы
   - Запустит контейнеры
   - Настроит SSL через Let's Encrypt
   - Настроит reverse proxy

## Альтернатива: Ручной деплой с Docker

Если Dockploy недоступен, можно задеплоить вручную:

### На вашем сервере

1. **Установите Docker и Docker Compose:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Клонируйте репозиторий:**
```bash
cd /opt
sudo git clone https://github.com/yourusername/unicrew.git
cd unicrew
```

3. **Создайте .env файл:**
```bash
cp .env.example .env
nano .env  # Отредактируйте с вашими данными
```

4. **Запустите контейнеры:**
```bash
docker-compose up -d --build
```

5. **Проверьте логи:**
```bash
docker-compose logs -f
```

6. **Создайте суперпользователя:**
```bash
docker-compose exec backend python manage.py createsuperuser --settings=unicrewback.settings_production
```

### Настройка Nginx (для ручного деплоя)

Если используете Nginx на хосте:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Media files
    location /media/ {
        proxy_pass http://localhost:8000;
    }

    # Static files
    location /static/ {
        proxy_pass http://localhost:8000;
    }
}
```

## Обновление проекта

### Через Dockploy

1. Сделайте изменения в коде
2. Закоммитьте и запушьте в репозиторий
3. Нажмите "Redeploy" в интерфейсе Dockploy

### Вручную

```bash
cd /opt/unicrew
git pull
docker-compose down
docker-compose up -d --build
```

## Полезные команды Docker

```bash
# Просмотр логов
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Перезапуск сервисов
docker-compose restart backend
docker-compose restart frontend

# Остановка всех контейнеров
docker-compose down

# Остановка с удалением volumes (ОСТОРОЖНО!)
docker-compose down -v

# Выполнение команд в контейнере
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser

# Просмотр статуса
docker-compose ps

# Использование ресурсов
docker stats
```

## Резервное копирование

### Бэкап базы данных

```bash
# Создать бэкап
docker-compose exec db pg_dump -U postgres unicrew_db > backup_$(date +%Y%m%d).sql

# Восстановить из бэкапа
docker-compose exec -T db psql -U postgres unicrew_db < backup_20240101.sql
```

### Бэкап media файлов

```bash
# Создать архив
tar -czf media_backup_$(date +%Y%m%d).tar.gz back/media/

# Восстановить
tar -xzf media_backup_20240101.tar.gz
```

## Мониторинг

```bash
# Проверка здоровья контейнеров
docker-compose ps

# Использование ресурсов
docker stats

# Логи в реальном времени
docker-compose logs -f
```

## Решение проблем

### Контейнер не запускается
```bash
docker-compose logs backend
docker-compose logs frontend
```

### Проблемы с базой данных
```bash
docker-compose exec db psql -U postgres -d unicrew_db
```

### Очистка Docker
```bash
# Удалить неиспользуемые образы
docker system prune -a

# Удалить volumes (ОСТОРОЖНО!)
docker volume prune
```

## Безопасность

1. **Никогда не коммитьте `.env` файл**
2. **Используйте сильные пароли для базы данных**
3. **Регулярно обновляйте Docker образы**
4. **Настройте firewall на сервере**
5. **Используйте HTTPS (автоматически через Dockploy)**

## Production чеклист

- [ ] SECRET_KEY установлен и безопасен
- [ ] DEBUG=False
- [ ] ALLOWED_HOSTS настроен правильно
- [ ] CORS_ALLOWED_ORIGINS настроен
- [ ] SSL сертификат установлен
- [ ] База данных настроена
- [ ] Email настройки работают
- [ ] Резервное копирование настроено
- [ ] Мониторинг настроен
- [ ] Логи проверяются регулярно

