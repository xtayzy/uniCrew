#!/usr/bin/env python
"""
Скрипт для создания пользователей и команд с реалистичными данными
"""
import os
import django
import random
from django.contrib.auth.hashers import make_password

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'unicrewback.settings_production')
django.setup()

from backapp.models import (
    User, School, Faculty, Skill, PersonalQuality, 
    ProjectCategory, Team, TeamMember
)

# Имена и фамилии для генерации пользователей
first_names = [
    "Айдар", "Алишер", "Амир", "Арман", "Асхат", "Данияр", "Даурен", "Ерлан", 
    "Жанар", "Жанна", "Камила", "Карина", "Марат", "Нурлан", "Нурсултан", 
    "Рауан", "Сабина", "Сания", "Талгат", "Айжан", "Алма", "Аружан", "Асель",
    "Дания", "Диана", "Елена", "Жанна", "Камила", "Мадина", "Мария", "Сабина",
    "Александр", "Андрей", "Дмитрий", "Иван", "Максим", "Михаил", "Николай",
    "Сергей", "Анна", "Екатерина", "Мария", "Ольга", "Татьяна", "Юлия"
]

last_names = [
    "Абдуллаев", "Алиев", "Беков", "Жаныбеков", "Ибраев", "Касымов", "Мухамедов",
    "Нурланов", "Омаров", "Рахимов", "Садыков", "Тажиев", "Усенов", "Хасанов",
    "Абдуллин", "Ахметов", "Баймуратов", "Газизов", "Даулетов", "Ермеков", "Жумабеков",
    "Иванов", "Петров", "Сидоров", "Смирнов", "Кузнецов", "Попов", "Соколов",
    "Лебедев", "Новиков", "Морозов", "Петрова", "Смирнова", "Кузнецова", "Попова"
]

positions = [
    "Frontend Developer", "Backend Developer", "Full-stack Developer", 
    "Mobile Developer", "UI/UX Designer", "Product Designer", 
    "ML Engineer", "Data Scientist", "DevOps Engineer", 
    "Product Manager", "Project Manager", "QA Engineer",
    "Marketing Specialist", "PR Specialist", "Content Creator",
    "Illustrator", "2D Artist", "Level Designer", "Embedded Engineer"
]

# Команды для создания
teams_data = [
    {
        "title": "StudyLink",
        "description": "Платформа для студентов, где можно обмениваться учебными материалами и создавать группы подготовки.",
        "category": "Стартап",
        "required_skills": ["React", "Django", "UI/UX Design", "Product Management"],
        "required_qualities": ["Коммуникабельность", "Ответственность", "Творческий подход"]
    },
    {
        "title": "AI Health Advisor",
        "description": "AI-бот, который помогает людям получать базовые рекомендации по здоровью.",
        "category": "Хакатон",
        "required_skills": ["Machine Learning", "Python", "Flutter", "Mobile Development"],
        "required_qualities": ["Эмпатия", "Внимание к деталям", "Быстрое обучение"]
    },
    {
        "title": "University Analytics",
        "description": "Веб-система для визуализации посещаемости и успеваемости студентов.",
        "category": "Дипломная работа",
        "required_skills": ["UI/UX Design", "Django REST Framework", "Data Visualization", "PostgreSQL"],
        "required_qualities": ["Аналитическое мышление", "Внимательность", "Точность"]
    },
    {
        "title": "Weather Dashboard",
        "description": "Приложение прогноза погоды с историей запросов.",
        "category": "Курсовая работа",
        "required_skills": ["React", "JavaScript", "API Integration"],
        "required_qualities": ["Внимательность", "Точность", "Самоорганизация"]
    },
    {
        "title": "Online Barber Booking",
        "description": "Сервис онлайн-записи к барберам с профилями мастеров.",
        "category": "Бизнес-проект",
        "required_skills": ["Django", "PostgreSQL", "REST API"],
        "required_qualities": ["Клиентоориентированность", "Профессионализм", "Ответственность"]
    },
    {
        "title": "EcoRoad",
        "description": "Приложение для отметки мусорных точек и организации городских уборок.",
        "category": "Социальный проект",
        "required_skills": ["Flutter", "Mobile Development", "UI/UX Design", "PR"],
        "required_qualities": ["Экологическое сознание", "Инициативность", "Сотрудничество"]
    },
    {
        "title": "Speech Emotion AI",
        "description": "Модель, распознающая эмоции по голосу.",
        "category": "Исследовательский проект",
        "required_skills": ["Machine Learning", "Python", "TensorFlow", "Data Analysis"],
        "required_qualities": ["Исследовательский подход", "Терпение", "Аналитическое мышление"]
    },
    {
        "title": "EduVolunteer",
        "description": "Платформа для записи студентов на образовательные волонтёрские мероприятия.",
        "category": "Социальный проект",
        "required_skills": ["React", "Frontend Development", "Illustration"],
        "required_qualities": ["Эмпатия", "Готовность помогать", "Творческий подход"]
    },
    {
        "title": "Smart Home Dashboard",
        "description": "Панель управления умным домом (свет, климат, безопасность).",
        "category": "Конкурсный проект",
        "required_skills": ["Embedded Systems", "UI/UX Design", "IoT"],
        "required_qualities": ["Инновационность", "Внимание к деталям", "Системное мышление"]
    },
    {
        "title": "Unity MiniGame",
        "description": "Простая 2D-игра на Unity для отработки основ геймдева.",
        "category": "Другое",
        "required_skills": ["Unity", "Game Development", "2D Art", "Level Design"],
        "required_qualities": ["Креативное мышление", "Терпение", "Творческий подход"]
    },
]

def create_users(num_users=50):
    """Создает пользователей с реалистичными данными"""
    schools = list(School.objects.all())
    skills = list(Skill.objects.all())
    qualities = list(PersonalQuality.objects.all())
    
    if not schools:
        print("❌ Нет школ в базе данных!")
        return []
    
    created_users = []
    
    for i in range(num_users):
        first_name = random.choice(first_names)
        last_name = random.choice(last_names)
        username = f"{first_name.lower()}{last_name.lower()}{random.randint(100, 999)}"
        email = f"{username}@example.com"
        
        # Проверяем уникальность
        if User.objects.filter(username=username).exists() or User.objects.filter(email=email).exists():
            continue
        
        school = random.choice(schools)
        faculties = list(school.faculties.all())
        faculty = random.choice(faculties) if faculties else None
        
        user = User.objects.create(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=make_password("password123"),
            faculty=faculty,
            course=random.randint(1, 4),
            education_level=random.choice(["BACHELOR", "MASTER", "PHD", "OTHER"])[0],
            position=random.choice(positions),
            about_myself=f"Студент {school.name}, интересуюсь разработкой и инновациями.",
            email_verified=True
        )
        
        # Добавляем случайные навыки (3-7 навыков)
        user_skills = random.sample(skills, min(random.randint(3, 7), len(skills)))
        user.skills.set(user_skills)
        
        # Добавляем случайные качества (2-5 качеств)
        user_qualities = random.sample(qualities, min(random.randint(2, 5), len(qualities)))
        user.personal_qualities.set(user_qualities)
        
        created_users.append(user)
        print(f"✅ Создан пользователь: {user.username} ({user.first_name} {user.last_name})")
    
    return created_users

def create_teams(users):
    """Создает команды на основе данных"""
    if not users:
        print("❌ Нет пользователей для создания команд!")
        return []
    
    categories = {cat.name: cat for cat in ProjectCategory.objects.all()}
    skills_dict = {skill.name: skill for skill in Skill.objects.all()}
    qualities_dict = {quality.name: quality for quality in PersonalQuality.objects.all()}
    
    created_teams = []
    
    for team_data in teams_data:
        category_name = team_data["category"]
        category = categories.get(category_name)
        
        if not category:
            print(f"⚠️ Категория '{category_name}' не найдена, пропускаем команду {team_data['title']}")
            continue
        
        # Выбираем случайного создателя
        creator = random.choice(users)
        
        team = Team.objects.create(
            title=team_data["title"],
            description=team_data["description"],
            creator=creator,
            category=category,
            status=random.choice(["OPEN", "OPEN", "OPEN", "IN_PROGRESS"])  # Больше открытых
        )
        
        # Добавляем требуемые навыки
        for skill_name in team_data.get("required_skills", []):
            skill = skills_dict.get(skill_name)
            if skill:
                team.required_skills.add(skill)
        
        # Добавляем требуемые качества
        for quality_name in team_data.get("required_qualities", []):
            quality = qualities_dict.get(quality_name)
            if quality:
                team.required_qualities.add(quality)
        
        # Добавляем участников (2-5 участников кроме создателя)
        num_members = random.randint(2, 5)
        other_users = [u for u in users if u != creator]
        members = random.sample(other_users, min(num_members, len(other_users)))
        
        # Создатель автоматически участник
        TeamMember.objects.create(
            team=team,
            user=creator,
            status="APPROVED"
        )
        
        # Добавляем других участников с разными статусами
        for member_user in members:
            status = random.choice(["APPROVED", "APPROVED", "PENDING", "INVITED"])
            TeamMember.objects.create(
                team=team,
                user=member_user,
                status=status
            )
        
        created_teams.append(team)
        print(f"✅ Создана команда: {team.title} (создатель: {creator.username}, участников: {len(members) + 1})")
    
    return created_teams

def main():
    print("=" * 60)
    print("Создание пользователей и команд")
    print("=" * 60)
    
    # Создаем пользователей
    print("\n📝 Создание пользователей...")
    users = create_users(50)
    print(f"\n✅ Создано пользователей: {len(users)}")
    
    # Создаем команды
    print("\n📝 Создание команд...")
    teams = create_teams(users)
    print(f"\n✅ Создано команд: {len(teams)}")
    
    print("\n" + "=" * 60)
    print(f"📊 Итоговая статистика:")
    print(f"   Пользователей: {User.objects.count()}")
    print(f"   Команд: {Team.objects.count()}")
    print(f"   Участников команд: {TeamMember.objects.count()}")
    print("=" * 60)

if __name__ == "__main__":
    main()

