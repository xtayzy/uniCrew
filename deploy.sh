#!/bin/bash

# Скрипт деплоя uniCrew на сервер
# Использование: ./deploy.sh

set -e

SSH_HOST="188.244.115.152"
SSH_USER="root"
SSH_PASS="Xtayzysvincere1_"
PROJECT_DIR="/var/www/unicrew"
GIT_REPO="https://github.com/xtayzy/uniCrew.git"
DOMAIN="server.unicrew.kz"

echo "🚀 Начинаю деплой uniCrew на сервер..."

# Функция для выполнения команд на сервере
ssh_exec() {
    sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" "$1"
}

# Функция для копирования файлов на сервер
ssh_copy() {
    sshpass -p "$SSH_PASS" scp -o StrictHostKeyChecking=no "$1" "$SSH_USER@$SSH_HOST:$2"
}

echo "📦 Создаю директорию проекта..."
ssh_exec "mkdir -p $PROJECT_DIR"

echo "📥 Клонирую репозиторий..."
ssh_exec "cd $PROJECT_DIR && if [ -d .git ]; then git pull; else git clone $GIT_REPO .; fi"

echo "📝 Создаю .env файл..."
ssh_exec "cat > $PROJECT_DIR/.env << 'EOF'
# Django Settings
SECRET_KEY=68(z-ie39aw_oec*muouj=72s=!mk=e_5l&qae2%b@_8ehge)d
DEBUG=False
ALLOWED_HOSTS=$DOMAIN,www.$DOMAIN

# Database
DB_NAME=unicrew_db
DB_USER=postgres
DB_PASSWORD=12345678
DB_HOST=db
DB_PORT=5432

# Email
EMAIL_BACKEND=backapp.email_backend.CustomSMTPEmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=nursultantayteldiev@gmail.com
EMAIL_HOST_PASSWORD=yehylhfjufzywikc
DEFAULT_FROM_EMAIL=nursultantayteldiev@gmail.com

# CORS
CORS_ALLOWED_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
ALLOWED_ORIGINS=https://$DOMAIN,https://www.$DOMAIN

# Security
SECURE_SSL_REDIRECT=True

# Frontend
VITE_API_URL=https://$DOMAIN/api/
EOF"

echo "🐳 Останавливаю старые контейнеры (если есть)..."
ssh_exec "cd $PROJECT_DIR && docker compose down 2>/dev/null || true"

echo "🔨 Собираю и запускаю контейнеры..."
ssh_exec "cd $PROJECT_DIR && docker compose up -d --build"

echo "⏳ Жду запуска контейнеров..."
sleep 10

echo "📊 Проверяю статус контейнеров..."
ssh_exec "cd $PROJECT_DIR && docker compose ps"

echo "✅ Деплой завершен!"
echo "🌐 Проверьте приложение по адресу: http://$DOMAIN"
echo ""
echo "📝 Для просмотра логов выполните:"
echo "   ssh $SSH_USER@$SSH_HOST 'cd $PROJECT_DIR && docker compose logs -f'"
echo ""
echo "🔧 Для применения миграций выполните:"
echo "   ssh $SSH_USER@$SSH_HOST 'cd $PROJECT_DIR && docker compose exec backend python manage.py migrate --settings=unicrewback.settings_production'"
echo ""
echo "👤 Для создания суперпользователя выполните:"
echo "   ssh $SSH_USER@$SSH_HOST 'cd $PROJECT_DIR && docker compose exec backend python manage.py createsuperuser --settings=unicrewback.settings_production'"


