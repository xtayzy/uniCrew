# Инструкция по деплою uniCrew

## Подготовка к деплою

### 1. Требования

- VPS/сервер с Ubuntu 20.04+ или Debian 11+
- Домен, настроенный на ваш сервер
- SSH доступ к серверу
- PostgreSQL установлен на сервере

### 2. Подготовка сервера

#### Установка необходимого ПО

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Python и зависимостей
sudo apt install python3 python3-pip python3-venv postgresql postgresql-contrib nginx certbot python3-certbot-nginx -y

# Установка Node.js (для сборки frontend)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 3. Настройка PostgreSQL

```bash
# Вход в PostgreSQL
sudo -u postgres psql

# Создание базы данных и пользователя
CREATE DATABASE unicrew_db;
CREATE USER unicrew_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE unicrew_db TO unicrew_user;
ALTER USER unicrew_user CREATEDB;
\q
```

### 4. Загрузка проекта на сервер

```bash
# На вашем локальном компьютере
cd /path/to/unicrew
git add .
git commit -m "Prepare for deployment"
git push

# На сервере
cd /var/www
sudo git clone https://github.com/yourusername/unicrew.git
sudo chown -R $USER:$USER unicrew
cd unicrew
```

### 5. Настройка Backend

```bash
cd back

# Создание виртуального окружения
python3 -m venv venv
source venv/bin/activate

# Установка зависимостей
pip install -r requirements.txt
pip install gunicorn  # Для production сервера

# Создание .env файла
nano .env
```

Содержимое `.env` файла:
```env
# Django
SECRET_KEY=your_very_long_random_secret_key_here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DB_NAME=unicrew_db
DB_USER=unicrew_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
DEFAULT_FROM_EMAIL=your_email@gmail.com

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Security
SECURE_SSL_REDIRECT=True
```

Генерация SECRET_KEY:
```bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

```bash
# Применение миграций
python manage.py migrate --settings=unicrewback.settings_production

# Создание суперпользователя
python manage.py createsuperuser --settings=unicrewback.settings_production

# Сборка статических файлов
python manage.py collectstatic --noinput --settings=unicrewback.settings_production
```

### 6. Настройка Gunicorn

Создайте файл `/var/www/unicrew/back/gunicorn_config.py`:

```python
bind = "127.0.0.1:8000"
workers = 3
worker_class = "sync"
timeout = 120
keepalive = 5
user = "www-data"
group = "www-data"
```

Создайте systemd service `/etc/systemd/system/unicrew.service`:

```ini
[Unit]
Description=Gunicorn instance to serve uniCrew
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/unicrew/back
Environment="PATH=/var/www/unicrew/back/venv/bin"
ExecStart=/var/www/unicrew/back/venv/bin/gunicorn --config gunicorn_config.py unicrewback.wsgi:application --settings=unicrewback.settings_production

[Install]
WantedBy=multi-user.target
```

```bash
# Запуск сервиса
sudo systemctl daemon-reload
sudo systemctl start unicrew
sudo systemctl enable unicrew
sudo systemctl status unicrew
```

### 7. Настройка Nginx

Создайте файл `/etc/nginx/sites-available/unicrew`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Редирект на HTTPS (будет настроен после SSL)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Логи
    access_log /var/log/nginx/unicrew_access.log;
    error_log /var/log/nginx/unicrew_error.log;

    # Максимальный размер загружаемых файлов
    client_max_body_size 10M;

    # Frontend (React)
    location / {
        root /var/www/unicrew/front/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # Media files
    location /media/ {
        alias /var/www/unicrew/back/media/;
    }

    # Static files
    location /static/ {
        alias /var/www/unicrew/back/staticfiles/;
    }
}
```

```bash
# Активация конфигурации
sudo ln -s /etc/nginx/sites-available/unicrew /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. Настройка SSL (Let's Encrypt)

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot автоматически обновит конфигурацию Nginx.

### 9. Сборка Frontend

```bash
cd /var/www/unicrew/front

# Создание .env.production файла
echo "VITE_API_URL=https://yourdomain.com/api/" > .env.production

# Установка зависимостей
npm install

# Сборка production версии
npm run build
```

### 10. Настройка прав доступа

```bash
sudo chown -R www-data:www-data /var/www/unicrew
sudo chmod -R 755 /var/www/unicrew
sudo chmod -R 775 /var/www/unicrew/back/media
```

### 11. Проверка работы

1. Откройте `https://yourdomain.com` в браузере
2. Проверьте, что frontend загружается
3. Проверьте, что API работает: `https://yourdomain.com/api/`
4. Попробуйте зарегистрироваться

## Обновление проекта

```bash
cd /var/www/unicrew

# Обновление кода
git pull

# Backend
cd back
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate --settings=unicrewback.settings_production
python manage.py collectstatic --noinput --settings=unicrewback.settings_production
sudo systemctl restart unicrew

# Frontend
cd ../front
npm install
npm run build
```

## Мониторинг и логи

```bash
# Логи Gunicorn
sudo journalctl -u unicrew -f

# Логи Nginx
sudo tail -f /var/log/nginx/unicrew_error.log
sudo tail -f /var/log/nginx/unicrew_access.log

# Логи Django
tail -f /var/www/unicrew/back/logs/django.log
```

## Резервное копирование

Создайте скрипт для резервного копирования `/var/www/unicrew/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/unicrew"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Бэкап базы данных
sudo -u postgres pg_dump unicrew_db > $BACKUP_DIR/db_$DATE.sql

# Бэкап media файлов
tar -czf $BACKUP_DIR/media_$DATE.tar.gz /var/www/unicrew/back/media

# Удаление старых бэкапов (старше 7 дней)
find $BACKUP_DIR -type f -mtime +7 -delete
```

Добавьте в crontab:
```bash
0 2 * * * /var/www/unicrew/backup.sh
```

## Безопасность

1. **Firewall**: Настройте UFW
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

2. **Fail2ban**: Защита от брутфорса
```bash
sudo apt install fail2ban -y
```

3. **Регулярные обновления**:
```bash
sudo apt update && sudo apt upgrade -y
```

## Решение проблем

### Gunicorn не запускается
```bash
sudo systemctl status unicrew
sudo journalctl -u unicrew -n 50
```

### Nginx ошибки
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Проблемы с правами доступа
```bash
sudo chown -R www-data:www-data /var/www/unicrew
sudo chmod -R 755 /var/www/unicrew
```

## Полезные команды

```bash
# Перезапуск всех сервисов
sudo systemctl restart unicrew
sudo systemctl restart nginx

# Проверка статуса
sudo systemctl status unicrew
sudo systemctl status nginx
sudo systemctl status postgresql

# Просмотр процессов
ps aux | grep gunicorn
ps aux | grep nginx
```

