# Настройка переменных окружения (.env)

## Быстрый старт

1. **Скопируйте пример файла:**
   ```bash
   cp .env.example .env
   ```

2. **Отредактируйте `.env` файл** и укажите свои значения:
   ```bash
   nano .env
   # или
   code .env
   ```

3. **Установите зависимости** (если еще не установили):
   ```bash
   pip install -r requirements.txt
   ```

## Обязательные переменные

### Для разработки (Development)

Минимально необходимые переменные:
- `SECRET_KEY` - секретный ключ Django
- `DEBUG=True` - режим отладки
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` - настройки базы данных
- `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` - для отправки email

### Для production

Дополнительно к вышеперечисленным:
- `ALLOWED_HOSTS` - список разрешенных хостов (через запятую)
- `CORS_ALLOWED_ORIGINS` - разрешенные источники для CORS
- `SECURE_SSL_REDIRECT=True` - перенаправление на HTTPS

## Генерация SECRET_KEY

Для генерации нового SECRET_KEY выполните:

```bash
# Активируйте виртуальное окружение
source venv/bin/activate

# Сгенерируйте ключ
python manage.py shell -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Скопируйте полученный ключ и вставьте в `.env` файл в переменную `SECRET_KEY`.

## Настройка базы данных

### PostgreSQL (рекомендуется)

```env
DB_NAME=unicrew_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

### SQLite (для разработки)

Если хотите использовать SQLite вместо PostgreSQL, измените в `settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

## Настройка Email (Gmail)

1. **Включите двухфакторную аутентификацию** в вашем Google аккаунте
2. **Создайте App Password:**
   - Перейдите: https://myaccount.google.com/apppasswords
   - Выберите "Почта" и "Другое устройство"
   - Введите название (например, "uniCrew")
   - Скопируйте сгенерированный пароль (16 символов)
3. **Добавьте в `.env`:**
   ```env
   EMAIL_HOST_USER=your_email@gmail.com
   EMAIL_HOST_PASSWORD=your_16_char_app_password
   DEFAULT_FROM_EMAIL=your_email@gmail.com
   ```

## Пример .env файла для разработки

```env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=*

# Database
DB_NAME=unicrew_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# Email
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
DEFAULT_FROM_EMAIL=your_email@gmail.com
```

## Пример .env файла для production

```env
# Django
SECRET_KEY=your-very-secure-secret-key-here
DEBUG=False
ALLOWED_HOSTS=example.com,www.example.com

# Database
DB_NAME=unicrew_prod
DB_USER=unicrew_user
DB_PASSWORD=secure_password_here
DB_HOST=db.example.com
DB_PORT=5432

# Email
EMAIL_HOST_USER=noreply@example.com
EMAIL_HOST_PASSWORD=your_app_password
DEFAULT_FROM_EMAIL=noreply@example.com

# CORS
CORS_ALLOWED_ORIGINS=https://example.com,https://www.example.com

# Security
SECURE_SSL_REDIRECT=True
```

## Безопасность

⚠️ **ВАЖНО:**

1. **Никогда не коммитьте `.env` файл в Git!** Он уже добавлен в `.gitignore`
2. **Используйте разные SECRET_KEY для development и production**
3. **Не используйте реальные пароли в `.env.example`** (этот файл можно коммитить)
4. **Храните `.env` файл в безопасном месте** на production сервере
5. **Используйте сильные пароли** для базы данных в production

## Проверка настроек

После настройки `.env` файла проверьте, что все работает:

```bash
# Активируйте виртуальное окружение
source venv/bin/activate

# Проверьте настройки Django
python manage.py check

# Попробуйте подключиться к базе данных
python manage.py migrate
```

## Устранение проблем

### Переменные окружения не загружаются

1. Убедитесь, что файл `.env` находится в папке `back/`
2. Проверьте, что установлен `python-dotenv`: `pip install python-dotenv`
3. Убедитесь, что в `settings.py` есть `load_dotenv()`

### Ошибка подключения к базе данных

1. Проверьте, что PostgreSQL запущен: `pg_isready`
2. Убедитесь, что база данных существует: `createdb unicrew_db`
3. Проверьте правильность пароля в `.env`

### Email не отправляется

1. Проверьте, что используете App Password, а не обычный пароль Gmail
2. Убедитесь, что двухфакторная аутентификация включена
3. Проверьте настройки SMTP в `.env`

