import random
import secrets
from django.utils import timezone
import datetime


from django.contrib.auth.models import AbstractUser
from django.db import models


class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class PersonalQuality(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class School(models.Model):
    name = models.CharField(max_length=150, unique=True)

    def __str__(self):
        return self.name


class Faculty(models.Model):
    name = models.CharField(max_length=150)
    school = models.ForeignKey(School, on_delete=models.SET_NULL, related_name="faculties", null=True, blank=True)

    class Meta:
        unique_together = ("name", "school")

    def __str__(self):
        if self.school:
            return f"{self.name} ({self.school.name})"
        return self.name


class User(AbstractUser):
    EDUCATION_CHOICES = [
        ("BACHELOR", "Бакалавриат"),
        ("MASTER", "Магистратура"),
        ("PHD", "Докторантура"),
        ("OTHER", "Другое"),
    ]

    email = models.EmailField(unique=True)
    faculty = models.ForeignKey("Faculty", on_delete=models.SET_NULL, related_name="users", null=True, blank=True)
    course = models.PositiveIntegerField(blank=True, null=True)
    education_level = models.CharField(max_length=20, choices=EDUCATION_CHOICES, default="BACHELOR", null=True, blank=True)
    skills = models.ManyToManyField(Skill, blank=True, related_name="users")
    personal_qualities = models.ManyToManyField(PersonalQuality, blank=True, related_name="users")
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    email_verified = models.BooleanField(default=False)
    about_myself = models.TextField(blank=True, null=True)
    position = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.username


class CustomSkill(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, related_name="custom_skills", on_delete=models.CASCADE)

    class Meta:
        unique_together = ("name", "user")

    def __str__(self):
        return self.name


class CustomPersonalQuality(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, related_name="custom_personal_qualities", on_delete=models.CASCADE)

    class Meta:
        unique_together = ("name", "user")

    def __str__(self):
        return self.name


class PendingUser(models.Model):
    username = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.created_at + datetime.timedelta(minutes=10)

    def generate_code(self):
        code = str(random.randint(1000, 9999))
        self.code = code
        self.save()
        return code


class ProjectCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self):
        return self.name


class Team(models.Model):
    STATUS_CHOICES = [
        ("OPEN", "Открыт набор"),
        ("CLOSED", "Набор закрыт"),
        ("IN_PROGRESS", "В работе"),
        ("DONE", "Завершён"),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    creator = models.ForeignKey(User, related_name="projects", on_delete=models.CASCADE)
    category = models.ForeignKey(ProjectCategory, on_delete=models.CASCADE, related_name="projects")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="OPEN")
    created_at = models.DateTimeField(auto_now_add=True)

    required_skills = models.ManyToManyField(Skill, blank=True, related_name="required_in_projects")
    required_qualities = models.ManyToManyField(PersonalQuality, blank=True, related_name="required_in_projects")

    whatsapp_link = models.URLField(blank=True, null=True, help_text="Ссылка на группу WhatsApp")
    telegram_link = models.URLField(blank=True, null=True, help_text="Ссылка на группу Telegram")

    def __str__(self):
        return f"{self.title}"


class TeamMember(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Ожидание"),
        ("INVITED", "Приглашен"),
        ("APPROVED", "Участник"),
        ("REJECTED", "Отклонён"),
    ]

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="memberships")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="memberships")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    message = models.TextField(blank=True, null=True, help_text="Сообщение от пользователя при подаче заявки")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("team", "user")

    def __str__(self):
        return f"{self.user.username} -> {self.team.title}"


class Task(models.Model):
    STATUS_CHOICES = [
        ("TODO", "К выполнению"),
        ("IN_PROGRESS", "В работе"),
        ("DONE", "Выполнено"),
        ("CANCELLED", "Отменено"),
    ]

    PRIORITY_CHOICES = [
        ("LOW", "Низкий"),
        ("MEDIUM", "Средний"),
        ("HIGH", "Высокий"),
        ("URGENT", "Срочный"),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="tasks")
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="created_tasks")
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name="assigned_tasks", null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="TODO")
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="MEDIUM")
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.team.title}"


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ("TEAM_INVITATION", "Приглашение в команду"),
        ("TEAM_REQUEST", "Запрос на вступление"),
        ("TEAM_REQUEST_APPROVED", "Заявка одобрена"),
        ("TEAM_REQUEST_REJECTED", "Заявка отклонена"),
        ("TEAM_INVITATION_ACCEPTED", "Приглашение принято"),
        ("TEAM_INVITATION_REJECTED", "Приглашение отклонено"),
        ("TASK_ASSIGNED", "Задача назначена"),
        ("TASK_UPDATED", "Задача обновлена"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="notifications", null=True, blank=True)
    team_member = models.ForeignKey(TeamMember, on_delete=models.CASCADE, related_name="notifications", null=True, blank=True)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="notifications", null=True, blank=True)
    message = models.TextField(blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.get_notification_type_display()}"

