# Инструкция по переходу на PostgreSQL

## Что было сделано

1. ✅ Добавлен `psycopg2-binary==2.9.9` в `requirements.txt`
2. ✅ Обновлены настройки базы данных в `settings.py` для использования PostgreSQL

## Шаги для завершения настройки

### 1. Установка PostgreSQL

#### macOS (через Homebrew):
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Windows:
Скачайте и установите с официального сайта: https://www.postgresql.org/download/windows/

### 2. Создание базы данных

Подключитесь к PostgreSQL:

```bash
# macOS/Linux
psql postgres

# Или если нужно указать пользователя
psql -U postgres
```

В консоли PostgreSQL выполните:

```sql
-- Создание базы данных
CREATE DATABASE unicrew_db;

-- Создание пользователя (если нужно)
CREATE USER unicrew_user WITH PASSWORD 'your_password';

-- Выдача прав пользователю
GRANT ALL PRIVILEGES ON DATABASE unicrew_db TO unicrew_user;

-- Выход
\q
```

### 3. Установка зависимостей Python

```bash
cd back
source venv/bin/activate  # или venv\Scripts\activate на Windows
pip install -r requirements.txt
```

### 4. Настройка переменных окружения (опционально)

Вы можете создать файл `.env` в папке `back/` или установить переменные окружения:

```bash
export DB_NAME=unicrew_db
export DB_USER=postgres
export DB_PASSWORD=your_password
export DB_HOST=localhost
export DB_PORT=5432
```

Или используйте значения по умолчанию из `settings.py`:
- DB_NAME: `unicrew_db`
- DB_USER: `postgres`
- DB_PASSWORD: `postgres`
- DB_HOST: `localhost`
- DB_PORT: `5432`

### 5. Миграция данных из SQLite (если нужно)

Если у вас уже есть данные в SQLite и вы хотите их перенести:

#### Вариант 1: Через Django (рекомендуется)

1. Создайте дамп данных из SQLite:
```bash
python manage.py dumpdata > data_dump.json
```

2. Примените миграции к новой PostgreSQL базе:
```bash
python manage.py migrate
```

3. Загрузите данные:
```bash
python manage.py loaddata data_dump.json
```

#### Вариант 2: Начать с нуля

Если данные не важны, просто примените миграции:

```bash
python manage.py migrate
python manage.py createsuperuser  # если нужно создать админа
```

### 6. Проверка подключения

Проверьте, что все работает:

```bash
python manage.py dbshell
```

Если подключение успешно, вы увидите приглашение PostgreSQL.

### 7. Запуск сервера

```bash
python manage.py runserver
```

## Решение проблем

### Ошибка: "psycopg2: connection refused"
- Убедитесь, что PostgreSQL запущен: `brew services list` (macOS) или `sudo systemctl status postgresql` (Linux)
- Проверьте, что порт 5432 не занят другим процессом

### Ошибка: "password authentication failed"
- Проверьте правильность пароля в настройках
- Убедитесь, что пользователь существует в PostgreSQL

### Ошибка: "database does not exist"
- Создайте базу данных (см. шаг 2)

## Важные замечания

1. **Резервное копирование**: Перед миграцией сделайте резервную копию вашей SQLite базы данных
2. **Переменные окружения**: Для production используйте переменные окружения вместо хардкода паролей
3. **Миграции**: Все миграции Django будут работать так же, как с SQLite

## Файлы, которые были изменены

- `back/requirements.txt` - добавлен psycopg2-binary
- `back/unicrewback/settings.py` - изменены настройки DATABASES

