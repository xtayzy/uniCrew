# 🚀 Шпаргалка по Git для разделенных репозиториев

## 📍 Быстрая навигация

```bash
# Перейти в backend
cd /Users/nurss/nurss/it_start_app/uniCrew-backend/back

# Перейти в frontend  
cd /Users/nurss/nurss/it_start_app/uniCrew-frontend/front
```

## ✅ Стандартный процесс работы

### Backend (Django)

```bash
cd /Users/nurss/nurss/it_start_app/uniCrew-backend/back

# 1. Проверить что изменилось
git status

# 2. Добавить изменения
git add .

# 3. Создать commit
git commit -m "Описание ваших изменений"

# 4. Загрузить на GitHub
git push origin main
```

### Frontend (React)

```bash
cd /Users/nurss/nurss/it_start_app/uniCrew-frontend/front

# 1. Проверить что изменилось
git status

# 2. Добавить изменения
git add .

# 3. Создать commit
git commit -m "Описание ваших изменений"

# 4. Загрузить на GitHub
git push origin main
```

## 📝 Примеры commit сообщений

```bash
# Backend
git commit -m "Добавил модель Notification"
git commit -m "Исправил баг в API аутентификации"
git commit -m "Обновил настройки JWT токенов"

# Frontend
git commit -m "Добавил компонент NotificationsComponent"
git commit -m "Исправил стили на странице профиля"
git commit -m "Обновил роутинг для новой страницы"
```

## 🔄 Обновление с GitHub (если работаете на разных компьютерах)

```bash
# Backend
cd /Users/nurss/nurss/it_start_app/uniCrew-backend/back
git pull origin main

# Frontend
cd /Users/nurss/nurss/it_start_app/uniCrew-frontend/front
git pull origin main
```

## 🔍 Полезные команды

```bash
# Посмотреть что изменилось
git status

# Посмотреть детали изменений
git diff

# Посмотреть историю коммитов
git log --oneline -10

# Отменить изменения в файле (до git add)
git checkout -- filename.py

# Отменить git add (но сохранить изменения)
git reset HEAD filename.py
```

## ⚠️ Важно помнить

1. **Всегда проверяйте `git status`** перед commit
2. **Пишите понятные сообщения** в commit
3. **Делайте `git push`** после каждого commit, чтобы сохранить на GitHub
4. **Используйте Personal Access Token** вместо пароля (см. docs/GITHUB_AUTH.md)

## 🎯 Типичный рабочий день

```bash
# Утром: обновить репозитории
cd /Users/nurss/nurss/it_start_app/uniCrew-backend/back && git pull
cd /Users/nurss/nurss/it_start_app/uniCrew-frontend/front && git pull

# Работаете над изменениями...

# Вечером: сохранить изменения
cd /Users/nurss/nurss/it_start_app/uniCrew-backend/back
git add .
git commit -m "Описание изменений в backend"
git push

cd /Users/nurss/nurss/it_start_app/uniCrew-frontend/front
git add .
git commit -m "Описание изменений в frontend"
git push
```

