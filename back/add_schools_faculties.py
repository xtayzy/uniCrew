#!/usr/bin/env python
"""
Скрипт для добавления школ и факультетов в базу данных
"""
import os
import django

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'unicrewback.settings_production')
django.setup()

from backapp.models import School, Faculty

# Данные для добавления
schools_data = {
    "Школа Менеджмента": [
        "6B04101 – Менеджмент",
        "6B11303 – Digital Logistics",
        "6B04104 – Маркетинг",
        "6B04120 – Content, Marketing and Data Analysis",
        "6B11301 – Логистика",
        "6B04124 – Digital Marketing",
    ],
    "Школа Экономики и Финансов": [
        "6B04190 – Бизнес-аналитика и экономика",
        "6В04106 – Учет и аудит",
        "6B04105 – Финансы",
        "6B04125 – FinTech and Artificial Intelligence",
    ],
    "Школа Политики и Права": [
        "6B04201 – Юриспруденция (Бизнес-право)",
        "6В03088(1) – Международные отношения и экономика",
    ],
    "School of Digital Technologies": [
        "6B06101 – Информационные системы",
        "6B06103 – Software Engineering",
        "6B06104 – Data Science",
        "6B06105 – Product Management",
        "6B06088 – Content, Marketing, Data Analysis",
        "6B06108 – City Management and Data Analysis",
        "6B06106 – FinTech and Artificial Intelligence",
        "6B06107 – Travel Management and Data Analysis",
        "6B06109 – Software Engineering and Information Protection",
    ],
    "Sharmanov School of Health Sciences": [
        "6B03104 – Психология",
    ],
    "Школа Медиа и Кино": [
        "6B03201 – Связь с общественностью",
        "6B03203 – New Media",
        "6B03204 – Content, Marketing and Data Analysis",
        "6В02103 – Digital Filmmaking",
        "6В02104 – Acting for Film",
    ],
    "Школа предпринимательства и инноваций": [
        "Бизнес администрирование в области предпринимательства",
    ],
    "Школа Гостеприимства и Туризма": [
        "6B11101 – Ресторанное дело и гостиничный бизнес",
        "6B11188 – Tourism and Event Management",
        "6B11190 – Travel Management and Data Analysis",
    ],
    "School of Transformative Humanities": [
        "Обязательный языковой модуль",
        "Общеобразовательные дисциплины (ООД)",
    ],
    "Высшая школа бизнеса": [
        "DBA (Doctor of Business Administration)",
        "GLOBAL EXECUTIVE MBA",
        "EXECUTIVE MBA",
        "GENERAL MBA",
        "BLENDED MBA",
        'MBA "FINANCIAL ENGINEERING"',
        'MBA "MANAGEMENT IN HEALTHCARE"',
    ],
}

def add_schools_and_faculties():
    """Добавляет школы и факультеты в базу данных"""
    created_count = 0
    updated_count = 0
    
    for school_name, faculties in schools_data.items():
        # Создаем или получаем школу
        school, created = School.objects.get_or_create(name=school_name)
        if created:
            created_count += 1
            print(f"✅ Создана школа: {school_name}")
        else:
            updated_count += 1
            print(f"📝 Школа уже существует: {school_name}")
        
        # Добавляем факультеты
        for faculty_name in faculties:
            faculty, created = Faculty.objects.get_or_create(
                name=faculty_name,
                school=school,
                defaults={'school': school}
            )
            if created:
                print(f"  ✅ Создан факультет: {faculty_name}")
            else:
                print(f"  📝 Факультет уже существует: {faculty_name}")
    
    print("\n" + "="*50)
    print(f"✅ Создано новых школ: {created_count}")
    print(f"📝 Существующих школ: {updated_count}")
    print(f"📊 Всего школ: {School.objects.count()}")
    print(f"📊 Всего факультетов: {Faculty.objects.count()}")
    print("="*50)

if __name__ == "__main__":
    add_schools_and_faculties()

