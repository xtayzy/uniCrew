#!/bin/bash

# Скрипт для разделения uniCrew на два отдельных репозитория
# Использование: ./split_repos.sh BACKEND_REPO_URL FRONTEND_REPO_URL

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка аргументов
if [ $# -lt 2 ]; then
    echo -e "${RED}Ошибка: Необходимо указать URL репозиториев${NC}"
    echo "Использование: ./split_repos.sh BACKEND_REPO_URL FRONTEND_REPO_URL"
    echo ""
    echo "Пример:"
    echo "  ./split_repos.sh https://github.com/xtayzy/uniCrew-backend.git https://github.com/xtayzy/uniCrew-frontend.git"
    exit 1
fi

BACKEND_REPO=$1
FRONTEND_REPO=$2

# Получаем текущую директорию проекта
PROJECT_DIR=$(pwd)
PARENT_DIR=$(dirname "$PROJECT_DIR")
PROJECT_NAME=$(basename "$PROJECT_DIR")

echo -e "${GREEN}Начинаю разделение репозиториев...${NC}"
echo "Проект: $PROJECT_DIR"
echo "Backend репозиторий: $BACKEND_REPO"
echo "Frontend репозиторий: $FRONTEND_REPO"
echo ""

# Создание временных директорий
BACKEND_TEMP="$PARENT_DIR/uniCrew-backend-temp"
FRONTEND_TEMP="$PARENT_DIR/uniCrew-frontend-temp"

# Очистка старых временных директорий (если есть)
if [ -d "$BACKEND_TEMP" ]; then
    echo -e "${YELLOW}Удаляю старую временную директорию backend...${NC}"
    rm -rf "$BACKEND_TEMP"
fi

if [ -d "$FRONTEND_TEMP" ]; then
    echo -e "${YELLOW}Удаляю старую временную директорию frontend...${NC}"
    rm -rf "$FRONTEND_TEMP"
fi

# ==========================================
# BACKEND REPOSITORY
# ==========================================
echo -e "${GREEN}Создаю Backend репозиторий...${NC}"

mkdir -p "$BACKEND_TEMP"
cd "$BACKEND_TEMP"

# Копируем папку back
echo "Копирую папку back..."
cp -r "$PROJECT_DIR/back" .

# Копируем общие файлы для backend
echo "Копирую общие файлы..."
cp "$PROJECT_DIR/docker-compose.yml" . 2>/dev/null || true
cp "$PROJECT_DIR/docker-compose.prod.yml" . 2>/dev/null || true

# Копируем документацию (опционально)
if [ -d "$PROJECT_DIR/docs" ]; then
    mkdir -p docs
    cp "$PROJECT_DIR/docs"/*.md docs/ 2>/dev/null || true
fi

# Создаем .gitignore для backend
cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# Virtual Environment
venv/
env/
ENV/
env.bak/
venv.bak/

# Django
*.log
local_settings.py
db.sqlite3
db.sqlite3-journal
/media
/staticfiles
/static

# Environment variables
.env
.env.local
.env.*.local
*.env
!*.env.example

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Coverage reports
htmlcov/
.tox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
.hypothesis/
.pytest_cache/

# PostgreSQL
*.sql
*.dump
EOF

# Создаем README для backend
cat > README.md << 'EOF'
# uniCrew Backend

Django REST Framework backend для платформы uniCrew.

## Технологии

- Django 4.2.24
- Django REST Framework
- PostgreSQL
- JWT Authentication

## Установка

См. [документацию](../docs/PROJECT_DOCUMENTATION.md) или README основного проекта.

## Структура

```
back/
├── backapp/       # Основное приложение
├── unicrewback/   # Настройки Django
├── requirements.txt
└── manage.py
```
EOF

# Инициализируем git репозиторий
cd back
git init
git add .
git commit -m "Initial commit: Django backend"

# Добавляем remote и загружаем
echo -e "${GREEN}Загружаю Backend на GitHub...${NC}"
git remote add origin "$BACKEND_REPO"
git branch -M main
git push -u origin main

echo -e "${GREEN}✓ Backend репозиторий создан и загружен!${NC}"
echo ""

# ==========================================
# FRONTEND REPOSITORY
# ==========================================
echo -e "${GREEN}Создаю Frontend репозиторий...${NC}"

mkdir -p "$FRONTEND_TEMP"
cd "$FRONTEND_TEMP"

# Копируем папку front
echo "Копирую папку front..."
cp -r "$PROJECT_DIR/front" .

# Создаем .gitignore для frontend (если его нет)
if [ ! -f "front/.gitignore" ]; then
    cat > front/.gitignore << 'EOF'
# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Build outputs
dist/
build/
*.map

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Environment
.env
.env.local
.env.*.local
EOF
fi

# Инициализируем git репозиторий
cd front
git init
git add .
git commit -m "Initial commit: React frontend"

# Добавляем remote и загружаем
echo -e "${GREEN}Загружаю Frontend на GitHub...${NC}"
git remote add origin "$FRONTEND_REPO"
git branch -M main
git push -u origin main

echo -e "${GREEN}✓ Frontend репозиторий создан и загружен!${NC}"
echo ""

# ==========================================
# CLEANUP
# ==========================================
echo -e "${YELLOW}Очищаю временные файлы...${NC}"
cd "$PARENT_DIR"
rm -rf "$BACKEND_TEMP"
rm -rf "$FRONTEND_TEMP"

echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Разделение завершено успешно!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo "Backend репозиторий: $BACKEND_REPO"
echo "Frontend репозиторий: $FRONTEND_REPO"
echo ""
echo -e "${YELLOW}Примечание:${NC} Текущий монорепо остался без изменений."
echo "Вы можете продолжить работать с ним или удалить после проверки разделенных репозиториев."

