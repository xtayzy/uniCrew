import random
import string
import datetime
import threading
from django.utils import timezone
from django.conf import settings

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from rest_framework import serializers
from .models import User, Skill, PersonalQuality, CustomSkill, CustomPersonalQuality, PendingUser, Faculty, School, \
    Team, ProjectCategory, TeamMember, Notification, Task

User = get_user_model()


class RegisterStep1Serializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get('username')
        email = attrs.get('email')
        password1 = attrs.get('password1')
        password2 = attrs.get('password2')

        if not username or not email or not password1:
            raise serializers.ValidationError({"message": "Заполните все поля!"})

        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({"message": f"({username}), такой пользователь уже существует"})

        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"message": "этот email уже зарегистрирован в безе"})

        if password1 != password2:
            raise serializers.ValidationError({'message': 'Пароли не совпадают'})

        return attrs

    def create(self, validated_data):
        email = validated_data['email']
        
        # Удаляем старую запись, если она существует (пользователь повторно запрашивает регистрацию)
        PendingUser.objects.filter(email=email).delete()
        
        # Создаем новую запись
        pending = PendingUser.objects.create(
            username=validated_data['username'],
            email=email,
            password=make_password(validated_data["password1"]),
        )

        code = pending.generate_code()

        # Отправляем email асинхронно, чтобы не блокировать ответ
        def send_email_async():
            try:
                send_mail(
                    "Подтверждение регистрации",
                    f"Здравствуйте!\n\nВаш код подтверждения для регистрации в UniCrew: {code}\n\nКод действителен в течение 10 минут.\n\nЕсли вы не запрашивали регистрацию, проигнорируйте это письмо.",
                    settings.DEFAULT_FROM_EMAIL,
                    [pending.email],
                    fail_silently=False,
                )
            except Exception as e:
                # Логируем ошибку, но не блокируем ответ
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Ошибка отправки email: {e}")

        # Запускаем отправку email в отдельном потоке
        email_thread = threading.Thread(target=send_email_async)
        email_thread.daemon = True
        email_thread.start()

        return pending


class RegisterStep2Serializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=4)

    def validate(self, attrs):
        try:
            pending = PendingUser.objects.get(email=attrs["email"])
        except PendingUser.DoesNotExist:
            raise serializers.ValidationError({"message": "Запроса на регистрацию не найдено"})

        if timezone.now() > pending.created_at + datetime.timedelta(minutes=10):
            pending.delete()
            raise serializers.ValidationError({"message": "Код истёк. Зарегистрируйтесь заново."})

        if pending.code != attrs["code"]:
            raise serializers.ValidationError({"message": "Неверный код"})

        return attrs

    def create(self, validated_data):
        pending = PendingUser.objects.get(email=validated_data["email"])
        user = User.objects.create(
            username=pending.username,
            email=pending.email,
            password=pending.password,
            email_verified=True,
        )

        pending.delete()

        return user


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, attrs):
        email = attrs.get("email")
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Пользователя с таким email не найдено")

        attrs["user"] = user
        return attrs

    def create(self, validated_data):
        user = validated_data["user"]
        new_password = "".join(random.choices(string.ascii_letters + string.digits, k=8))
        user.password = make_password(new_password)
        user.save()

        send_mail(
            "Восстановление логина и пароля",
            f"Здравствуйте!\n\nВаш логин: {user.username}\nВаш новый пароль: {new_password}\n\nРекомендуем изменить пароль после входа в систему.\n\nЕсли вы не запрашивали восстановление пароля, немедленно свяжитесь с поддержкой.",
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )

        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password1 = serializers.CharField(write_only=True)
    new_password2 = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = self.context["request"].user
        old_password = attrs.get("old_password")
        new_password1 = attrs.get("new_password1")
        new_password2 = attrs.get("new_password2")

        if not user.check_password(old_password):
            raise serializers.ValidationError({"message": "Старый пароль введен неверно"})

        if new_password1 != new_password2:
            raise serializers.ValidationError({"message": "Новые пароли не совпадают"})

        if old_password == new_password1:
            raise serializers.ValidationError({"message": "Новый пароль должен отличаться от старого"})

        return attrs

    def create(self, validated_data):
        user = self.context["request"].user
        user.set_password(validated_data["new_password1"])
        user.save()
        return user


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ("id", "name")


class PersonalQualitySerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalQuality
        fields = ("id", "name")


class CustomSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomSkill
        fields = ("id", "name")


class CustomPersonalQualitySerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomPersonalQuality
        fields = ("id", "name")


class FacultySerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source="school.name", read_only=True)

    class Meta:
        model = Faculty
        fields = ("id", "name", "school_name")


class SchoolSerializer(serializers.ModelSerializer):
    faculties = FacultySerializer(many=True, read_only=True)

    class Meta:
        model = School
        fields = ("id", "name", "faculties")


class UserProfileSerializer(serializers.ModelSerializer):
    skills = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False
    )
    personal_qualities = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False
    )

    faculty_id = serializers.PrimaryKeyRelatedField(
        source='faculty',
        queryset=Faculty.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )

    skills_list = serializers.SerializerMethodField(read_only=True)
    personal_qualities_list = serializers.SerializerMethodField(read_only=True)
    education_level_display = serializers.SerializerMethodField(read_only=True)
    avatar = serializers.SerializerMethodField(read_only=True)
    faculty = FacultySerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "faculty",
            "faculty_id",
            "course",
            "education_level",
            "education_level_display",
            "position",
            "about_myself",
            "avatar",
            "skills",
            "personal_qualities",
            "skills_list",
            "personal_qualities_list",
        ]
        read_only_fields = ["username", "email"]

    def get_avatar(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                url = request.build_absolute_uri(obj.avatar.url)
                # Принудительно заменяем http на https
                if url.startswith('http://'):
                    url = url.replace('http://', 'https://', 1)
                return url
            # Fallback: используем настройки из переменных окружения
            from django.conf import settings
            domain = getattr(settings, 'DOMAIN', 'unicrew.kz')
            return f"https://{domain}{obj.avatar.url}"
        return None

    def get_skills_list(self, obj):
        global_skills = [skill.name for skill in obj.skills.all()]
        custom_skills = [cs.name for cs in obj.custom_skills.all()]
        return global_skills + custom_skills

    def get_personal_qualities_list(self, obj):
        global_qualities = [q.name for q in obj.personal_qualities.all()]
        custom_qualities = [cq.name for cq in obj.custom_personal_qualities.all()]
        return global_qualities + custom_qualities

    def get_education_level_display(self, obj):
        return obj.get_education_level_display()

    def update(self, instance, validated_data):
        # === Обычные поля ===
        for field in ["first_name", "last_name", "faculty", "course",
                      "education_level", "position", "about_myself"]:
            if field in validated_data:
                setattr(instance, field, validated_data[field])

        if validated_data.get("avatar"):
            instance.avatar = validated_data["avatar"]

        instance.save()

        # === Навыки ===
        if "skills" in validated_data:  # ✅ обновляем только если реально переданы
            skills_input = validated_data["skills"]
            current_global_skills = {s.name.lower() for s in instance.skills.all()}
            current_custom_skills = {cs.name.lower() for cs in instance.custom_skills.all()}

            for skill in instance.skills.all():
                if skill.name.lower() not in [s.lower() for s in skills_input]:
                    instance.skills.remove(skill)

            for cs in instance.custom_skills.all():
                if cs.name.lower() not in [s.lower() for s in skills_input]:
                    cs.delete()

            for skill_name in skills_input:
                skill_name_lower = skill_name.lower()
                if skill_name_lower not in current_global_skills and skill_name_lower not in current_custom_skills:
                    skill_obj = Skill.objects.filter(name__iexact=skill_name).first()
                    if skill_obj:
                        instance.skills.add(skill_obj)
                    else:
                        CustomSkill.objects.create(user=instance, name=skill_name)

        # === Личные качества ===
        if "personal_qualities" in validated_data:  # ✅ тоже только если реально переданы
            qualities_input = validated_data["personal_qualities"]
            current_global_qualities = {q.name.lower() for q in instance.personal_qualities.all()}
            current_custom_qualities = {cq.name.lower() for cq in instance.custom_personal_qualities.all()}

            for q in instance.personal_qualities.all():
                if q.name.lower() not in [x.lower() for x in qualities_input]:
                    instance.personal_qualities.remove(q)

            for cq in instance.custom_personal_qualities.all():
                if cq.name.lower() not in [x.lower() for x in qualities_input]:
                    cq.delete()

            for quality_name in qualities_input:
                qname_lower = quality_name.lower()
                if qname_lower not in current_global_qualities and qname_lower not in current_custom_qualities:
                    quality_obj = PersonalQuality.objects.filter(name__iexact=quality_name).first()
                    if quality_obj:
                        instance.personal_qualities.add(quality_obj)
                    else:
                        CustomPersonalQuality.objects.create(user=instance, name=quality_name)

        return instance

class UserListSerializer(serializers.ModelSerializer):
    skills_list = serializers.SerializerMethodField()
    personal_qualities_list = serializers.SerializerMethodField()
    education_level_display = serializers.SerializerMethodField(read_only=True)
    avatar = serializers.SerializerMethodField(read_only=True)
    faculty = FacultySerializer(read_only=True)

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "faculty",
            "course",
            "education_level",
            "education_level_display",
            "position",
            "about_myself",
            "avatar",
            "skills_list",
            "personal_qualities_list",
        ]

    def get_avatar(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                url = request.build_absolute_uri(obj.avatar.url)
                # Принудительно заменяем http на https
                if url.startswith('http://'):
                    url = url.replace('http://', 'https://', 1)
                return url
            # Fallback: используем настройки из переменных окружения
            from django.conf import settings
            domain = getattr(settings, 'DOMAIN', 'unicrew.kz')
            return f"https://{domain}{obj.avatar.url}"
        return None

    def get_skills_list(self, obj):
        global_skills = [skill.name for skill in obj.skills.all()]
        custom_skills = [cs.name for cs in obj.custom_skills.all()]
        return global_skills + custom_skills

    def get_personal_qualities_list(self, obj):
        global_qualities = [q.name for q in obj.personal_qualities.all()]
        custom_qualities = [cq.name for cq in obj.custom_personal_qualities.all()]
        return global_qualities + custom_qualities

    def get_education_level_display(self, obj):
        return obj.get_education_level_display()


class ProjectCategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = ProjectCategory
        fields = ["id", "name"]


class TeamMemberSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    team_title = serializers.CharField(source='team.title', read_only=True)

    class Meta:
        model = TeamMember
        fields = ["id", "user", "user_id", "status", "message", "created_at", "updated_at", "team_title"]


class TeamSerializer(serializers.ModelSerializer):
    creator = serializers.StringRelatedField()
    required_skills = serializers.SlugRelatedField(
        many=True, slug_field="name", queryset=Skill.objects.all()
    )
    required_qualities = serializers.SlugRelatedField(
        many=True, slug_field="name", queryset=PersonalQuality.objects.all()
    )
    category = serializers.SlugRelatedField(
        slug_field="name", queryset=ProjectCategory.objects.all()
    )
    members = TeamMemberSerializer(source="memberships", many=True, read_only=True)

    class Meta:
        model = Team
        fields = [
            "id",
            "title",
            "description",
            "creator",
            "category",
            "status",
            "created_at",
            "required_skills",
            "required_qualities",
            "members",
            "whatsapp_link",
            "invite_token",
            "telegram_link",
        ]


class TeamUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для обновления команды владельцем"""
    required_skills = serializers.SlugRelatedField(
        many=True, slug_field="name", queryset=Skill.objects.all(), required=False
    )
    required_qualities = serializers.SlugRelatedField(
        many=True, slug_field="name", queryset=PersonalQuality.objects.all(), required=False
    )
    category = serializers.SlugRelatedField(
        slug_field="name", queryset=ProjectCategory.objects.all(), required=False
    )

    class Meta:
        model = Team
        fields = [
            "title",
            "description",
            "category",
            "status",
            "required_skills",
            "required_qualities",
            "whatsapp_link",
            "telegram_link",
        ]


class TeamMemberUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для обновления статуса участника команды"""
    user = serializers.StringRelatedField(read_only=True)
    team_title = serializers.CharField(source='team.title', read_only=True)

    class Meta:
        model = TeamMember
        fields = ["id", "user", "status", "team", "team_title", "message", "created_at"]
        read_only_fields = ["user", "team", "team_title", "message", "created_at"]


class TeamJoinRequestSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    team_title = serializers.CharField(source='team.title', read_only=True)

    class Meta:
        model = TeamMember
        fields = ["id", "user", "status", "team", "team_title", "message", "created_at"]
        read_only_fields = ["status", "team", "team_title", "created_at"]


class NotificationSerializer(serializers.ModelSerializer):
    team_title = serializers.CharField(source='team.title', read_only=True)
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    team_member = TeamJoinRequestSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ["id", "notification_type", "notification_type_display", "team", "team_title", "team_member", "message", "is_read", "created_at"]


class TaskSerializer(serializers.ModelSerializer):
    creator = serializers.StringRelatedField(read_only=True)
    assigned_to = serializers.StringRelatedField(read_only=True)
    team_title = serializers.CharField(source='team.title', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)

    class Meta:
        model = Task
        fields = [
            "id", "title", "description", "team", "team_title", "creator", 
            "assigned_to", "status", "status_display", "priority", "priority_display", 
            "due_date", "created_at", "updated_at"
        ]
        read_only_fields = ["creator", "created_at", "updated_at"]


class TaskCreateSerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = Task
        fields = [
            "title", "description", "assigned_to", "assigned_to_username", "priority", "due_date"
        ]
        extra_kwargs = {
            'assigned_to': {'required': False}
        }
    
    def create(self, validated_data):
        assigned_to_username = validated_data.pop('assigned_to_username', None)
        if assigned_to_username:
            try:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                user = User.objects.get(username=assigned_to_username)
                validated_data['assigned_to'] = user
            except User.DoesNotExist:
                raise serializers.ValidationError({'assigned_to_username': 'Пользователь не найден'})
        return super().create(validated_data)


class TaskUpdateSerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = Task
        fields = [
            "title", "description", "assigned_to", "assigned_to_username", "priority", "due_date", "status"
        ]
        extra_kwargs = {
            'assigned_to': {'required': False}
        }
    
    def update(self, instance, validated_data):
        assigned_to_username = validated_data.pop('assigned_to_username', None)
        if assigned_to_username:
            try:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                user = User.objects.get(username=assigned_to_username)
                validated_data['assigned_to'] = user
            except User.DoesNotExist:
                raise serializers.ValidationError({'assigned_to_username': 'Пользователь не найден'})
        elif assigned_to_username == '':
            validated_data['assigned_to'] = None
        return super().update(instance, validated_data)


