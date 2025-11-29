# uniCrew Deployment

Эта инструкция описывает полный цикл подготовки и запуска нового продакшен/стейдж окружения с помощью Docker Compose.

## 1. Подготовить переменные окружения

1. Скопируйте `.env.example` → `.env`.
2. Заполните значения:
   - `POSTGRES_*` — параметры базы данных.
   - `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS` — настройки Django.
   - `EMAIL_*` — SMTP учётка для отправки писем.
   - `VITE_API_URL` — публичный URL API (используется при сборке фронтенда).

## 2. Собрать и запустить контейнеры (локально)

```bash
docker compose build
docker compose up -d
```

Команда `up -d` автоматически:

- поднимет Postgres,
- соберёт backend (migrate запускается в entrypoint),
- соберёт frontend (Vite → Nginx),
- опубликует сервисы на `http://localhost` (фронт) и `http://localhost:8000` (API).

## 3. Полезные команды

- Просмотр логов: `docker compose logs -f backend` (или `frontend`, `db`).
- Выполнить Django команду: `docker compose exec backend python manage.py <command>`.
- Рестарт одного сервиса: `docker compose up -d --build frontend`.

## 4. Продакшен деплой (VPS Ubuntu 24.04 + HTTPS)

### 4.1 Подготовить сервер

1. Настройте DNS: `unicrew.kz` должен указывать (A-запись) на IP вашего VPS.
2. Установите Docker + compose plugin:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

3. (Опционально) Добавьте пользователя в группу `docker` и перелогиньтесь:

```bash
sudo usermod -aG docker $USER
```

### 4.2 Задеплоить стек

```bash
git clone https://<repo-url>/uniCrew.git
cd uniCrew
cp .env.example .env
# Укажите реальные SECRET_KEY, DB, SMTP и VITE_API_URL=https://unicrew.kz/api/

sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Что важного:

- `docker-compose.prod.yml` добавляет сервис `caddy`, который автоматически получает Let’s Encrypt сертификат для `unicrew.kz`.
- `/api/*` и `/media/*` трафик проксируется напрямую в backend (Gunicorn), остальное — во frontend (Nginx с собранным Vite-бандлом).
- В корневом каталоге лежит `Caddyfile` — при необходимости поменяйте домен/доп. маршруты.

Просмотр логов:

```bash
sudo docker compose logs -f caddy
sudo docker compose logs -f backend
```

Обновление после `git pull`:

```bash
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## 5. Обновление приложения (локально)

1. Обновите код (`git pull`).
2. Пересоберите сервисы, где были изменения: `docker compose build backend frontend`.
3. Примените миграции (выполняются автоматически, но можно повторно): `docker compose exec backend python manage.py migrate`.

