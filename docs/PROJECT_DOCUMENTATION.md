# uniCrew - Полная документация проекта

## Обзор проекта

uniCrew — это веб-приложение для студентов, которое помогает находить команду или участников с нужными навыками для учебных проектов, лабораторных, дипломных работ и хакатонов.

### Основная проблема
Студенты сталкиваются с трудностью поиска людей с нужными навыками для командных проектов, что приводит к хаосу, случайным командам или провалу проектов.

### Решение
Платформа uniCrew позволяет студентам:
- Создавать профиль с навыками и личными качествами
- Искать участников через фильтры (навыки, курс, факультет)
- Создавать проекты и набирать команду
- Присоединяться к существующим проектам
- Использовать удобный поиск и фильтрацию

## Архитектура проекта

### Backend (Django REST Framework)
- **Фреймворк**: Django 4.2.24
- **API**: Django REST Framework
- **Аутентификация**: JWT (SimpleJWT)
- **База данных**: SQLite (для разработки)
- **CORS**: django-cors-headers
- **Документация API**: drf-yasg (Swagger)

### Frontend (React)
- **Фреймворк**: React 19.1.1
- **Роутинг**: React Router DOM 7.9.3
- **HTTP клиент**: Axios 1.12.2
- **Иконки**: Lucide React 0.544.0
- **Сборка**: Vite 7.1.7

## Структура базы данных

### Основные модели

#### User (Пользователь)
```python
class User(AbstractUser):
    email = models.EmailField(unique=True)
    faculty = models.ForeignKey("Faculty", on_delete=models.SET_NULL, null=True, blank=True)
    course = models.PositiveIntegerField(blank=True, null=True)
    education_level = models.CharField(max_length=20, choices=EDUCATION_CHOICES)
    skills = models.ManyToManyField(Skill, blank=True, related_name="users")
    personal_qualities = models.ManyToManyField(PersonalQuality, blank=True, related_name="users")
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    email_verified = models.BooleanField(default=False)
    about_myself = models.TextField(blank=True, null=True)
    position = models.CharField(max_length=100, blank=True, null=True)
```

#### Team (Команда/Проект)
```python
class Team(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    creator = models.ForeignKey(User, related_name="projects", on_delete=models.CASCADE)
    category = models.ForeignKey(ProjectCategory, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="OPEN")
    created_at = models.DateTimeField(auto_now_add=True)
    required_skills = models.ManyToManyField(Skill, blank=True, related_name="required_in_projects")
    required_qualities = models.ManyToManyField(PersonalQuality, blank=True, related_name="required_in_projects")
    whatsapp_link = models.URLField(blank=True, null=True)
    telegram_link = models.URLField(blank=True, null=True)
```

#### TeamMember (Участник команды)
```python
class TeamMember(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="memberships")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="memberships")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### Notification (Уведомления)
```python
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="notifications")
    team_member = models.ForeignKey(TeamMember, on_delete=models.CASCADE, related_name="notifications")
    message = models.TextField(blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
```

### Вспомогательные модели

#### Skill (Навык)
```python
class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
```

#### PersonalQuality (Личное качество)
```python
class PersonalQuality(models.Model):
    name = models.CharField(max_length=100, unique=True)
```

#### School (Университет)
```python
class School(models.Model):
    name = models.CharField(max_length=150, unique=True)
```

#### Faculty (Факультет)
```python
class Faculty(models.Model):
    name = models.CharField(max_length=150)
    school = models.ForeignKey(School, on_delete=models.SET_NULL, related_name="faculties")
```

#### ProjectCategory (Категория проекта)
```python
class ProjectCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
```

## API Endpoints

### Аутентификация
- `POST /api/register-step1/` - Регистрация (шаг 1)
- `POST /api/register-step2/` - Подтверждение email (шаг 2)
- `POST /api/login/` - Вход в систему
- `POST /api/token/refresh/` - Обновление токена
- `POST /api/password-reset/` - Сброс пароля

### Пользователи
- `GET /api/users/` - Список пользователей (с фильтрами)
- `GET /api/users/{id}/` - Детали пользователя
- `GET /api/users/my_requests/` - Мои заявки на вступление
- `GET /api/users/my_invitations/` - Мои приглашения
- `POST /api/users/accept_invitation/` - Принять приглашение
- `POST /api/users/reject_invitation/` - Отклонить приглашение
- `POST /api/users/cancel_request/` - Отменить заявку
- `GET /api/users/notifications/` - Получить уведомления
- `POST /api/users/mark_notification_read/` - Отметить уведомление как прочитанное
- `POST /api/users/mark_all_notifications_read/` - Отметить все уведомления как прочитанные
- `POST /api/users/delete_notification/` - Удалить уведомление

### Профиль
- `GET /api/profile/` - Получить профиль текущего пользователя
- `PUT /api/profile/` - Обновить профиль

### Команды
- `GET /api/teams/` - Список команд (с фильтрами)
- `POST /api/teams/` - Создать команду
- `GET /api/teams/{id}/` - Детали команды
- `PUT /api/teams/{id}/` - Обновить команду
- `POST /api/teams/{id}/join/` - Подать заявку на вступление
- `POST /api/teams/{id}/invite/` - Пригласить пользователя
- `GET /api/teams/{id}/requests/` - Заявки на вступление (для создателя)
- `POST /api/teams/{id}/approve/` - Одобрить заявку
- `POST /api/teams/{id}/reject/` - Отклонить заявку
- `DELETE /api/teams/{id}/remove-member/{user_id}/` - Удалить участника
- `GET /api/teams/{id}/members/` - Список участников команды
- `PUT /api/teams/{id}/members/{member_id}/` - Обновить статус участника

### Справочники
- `GET /api/skills/` - Список навыков
- `GET /api/personal-qualities/` - Список личных качеств
- `GET /api/schools/` - Список университетов
- `GET /api/faculties/` - Список факультетов
- `GET /api/project-categories/` - Список категорий проектов

### Пользовательские навыки и качества
- `GET /api/custom-skills/` - Мои пользовательские навыки
- `POST /api/custom-skills/` - Создать пользовательский навык
- `PUT /api/custom-skills/{id}/` - Обновить пользовательский навык
- `DELETE /api/custom-skills/{id}/` - Удалить пользовательский навык
- `GET /api/custom-personal-qualities/` - Мои пользовательские качества
- `POST /api/custom-personal-qualities/` - Создать пользовательское качество
- `PUT /api/custom-personal-qualities/{id}/` - Обновить пользовательское качество
- `DELETE /api/custom-personal-qualities/{id}/` - Удалить пользовательское качество

## Frontend структура

### Основные компоненты

#### App.jsx
Главный компонент приложения с роутингом:
- Общедоступные страницы (главная, команды, о проекте)
- Страницы только для неавторизованных (логин, регистрация)
- Страницы только для авторизованных (профиль, пользователи, уведомления, мои команды)

#### AuthContext.jsx
Контекст для управления аутентификацией:
- Состояние авторизации
- Управление JWT токенами
- Автоматическое обновление токенов
- Axios interceptors для автоматического добавления токенов

### Страницы

#### HomePage
Главная страница с приветствием и описанием проекта

#### TeamsPage
Страница со списком команд:
- Фильтрация по названию, категории, статусу
- Фильтрация по требуемым навыкам и качествам
- Автокомплит для навыков и качеств
- Модальное окно для подачи заявки на вступление

#### ProfilePage
Страница профиля пользователя:
- Отображение информации о пользователе
- Редактирование профиля через модальные окна
- Управление навыками и личными качествами

#### MyTeamsPage
Страница с командами пользователя:
- Команды, где пользователь является создателем
- Команды, где пользователь является участником

#### CreateTeamPage
Страница создания новой команды

#### NotificationsPage
Страница уведомлений:
- Список всех уведомлений
- Отметка как прочитанные
- Удаление уведомлений

#### MyRequestsPage
Страница с заявками пользователя:
- Заявки на вступление в команды
- Приглашения в команды

### Компоненты

#### Header
Шапка сайта с навигацией и кнопками входа/выхода

#### Модальные окна
- EditProfileModalComponent - редактирование профиля
- EditSkillsModalComponent - редактирование навыков и качеств
- JoinTeamModal - подача заявки на вступление в команду
- InviteToTeamModal - приглашение пользователя в команду
- ManageMembersModal - управление участниками команды

## Система аутентификации

### JWT токены
- Access token (15 минут)
- Refresh token (7 дней)
- Автоматическое обновление токенов
- Ротация refresh токенов

### Регистрация (2 шага)
1. **Шаг 1**: Ввод username, email, паролей → отправка кода на email
2. **Шаг 2**: Ввод кода подтверждения → создание пользователя

### Восстановление пароля
Отправка нового пароля на email пользователя

## Функциональность

### Для неавторизованных пользователей
- Просмотр списка команд
- Фильтрация команд
- Просмотр деталей команд
- Просмотр профилей пользователей
- Регистрация и вход

### Для авторизованных пользователей
- Создание и редактирование профиля
- Создание команд
- Подача заявок на вступление в команды
- Приглашение пользователей в команды
- Управление участниками команд
- Просмотр и управление уведомлениями
- Поиск пользователей по навыкам

### Статусы участников команд
- **PENDING** - Ожидание рассмотрения заявки
- **INVITED** - Приглашен в команду
- **APPROVED** - Участник команды
- **REJECTED** - Заявка отклонена

### Статусы команд
- **OPEN** - Открыт набор
- **CLOSED** - Набор закрыт
- **IN_PROGRESS** - В работе
- **DONE** - Завершён

### Типы уведомлений
- **TEAM_INVITATION** - Приглашение в команду
- **TEAM_REQUEST** - Запрос на вступление
- **TEAM_REQUEST_APPROVED** - Заявка одобрена
- **TEAM_REQUEST_REJECTED** - Заявка отклонена
- **TEAM_INVITATION_ACCEPTED** - Приглашение принято
- **TEAM_INVITATION_REJECTED** - Приглашение отклонено

## Технические особенности

### Backend
- Django REST Framework с ViewSets
- Кастомные permissions для контроля доступа
- Сериализаторы для валидации данных
- Система уведомлений
- Загрузка файлов (аватары)
- Email отправка через консоль (для разработки)

### Frontend
- React с функциональными компонентами и хуками
- Context API для управления состоянием
- Axios для HTTP запросов
- CSS Modules для стилизации
- React Router для навигации
- Модальные окна для форм

### Безопасность
- JWT аутентификация
- CORS настройки
- Валидация данных на сервере
- Проверка прав доступа
- Защита от CSRF

## Запуск проекта

### Backend
```bash
cd back
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd front
npm install
npm run dev
```

## Конфигурация

### Backend настройки
- DEBUG = True (для разработки)
- CORS_ALLOW_ALL_ORIGINS = True
- EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
- JWT настройки в SIMPLE_JWT

### Frontend настройки
- API_URL = "http://127.0.0.1:8000/api/"
- Автоматическое обновление токенов каждые 14 минут
- Timeout для запросов: 10 секунд

## Развитие проекта

### Планируемые функции
- Чат внутри команд
- Рейтинг пользователей
- Интеграция с университетскими системами
- Система рекомендаций
- Мобильное приложение
- Push уведомления
- Файловое хранилище для проектов

### Технические улучшения
- Переход на PostgreSQL
- Docker контейнеризация
- CI/CD пайплайн
- Unit тесты
- Логирование
- Мониторинг
- Кэширование
- Оптимизация запросов к БД
