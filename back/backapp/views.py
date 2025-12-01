from django.contrib.auth import get_user_model
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import render
from rest_framework import status, viewsets, permissions, generics
from rest_framework.decorators import action
from rest_framework.generics import CreateAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Skill, PersonalQuality, CustomSkill, CustomPersonalQuality, School, Faculty, Team, TeamMember, \
    ProjectCategory, Notification, Task
from .serializers import RegisterStep1Serializer, RegisterStep2Serializer, PasswordResetSerializer, ChangePasswordSerializer, SkillSerializer, \
    PersonalQualitySerializer, CustomSkillSerializer, CustomPersonalQualitySerializer, UserProfileSerializer, \
    UserListSerializer, SchoolSerializer, FacultySerializer, TeamSerializer, TeamMemberSerializer, \
    ProjectCategorySerializer, TeamJoinRequestSerializer, NotificationSerializer, TeamUpdateSerializer, \
    TeamMemberUpdateSerializer, TaskSerializer, TaskCreateSerializer, TaskUpdateSerializer

User = get_user_model()


class AdminOnlyPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class IsCreatorOrReadOnly(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.creator == request.user


class RegisterStep1View(CreateAPIView):
    serializer_class = RegisterStep1Serializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"message": "Код отправлен на email"}, status=status.HTTP_200_OK)


class RegisterStep2View(CreateAPIView):
    serializer_class = RegisterStep2Serializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response({"message": "Регистрация завершена!"}, status=status.HTTP_201_CREATED)


class PasswordResetView(CreateAPIView):
    serializer_class = PasswordResetSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({"message": "На вашу почту отправлены логин и новый пароль"}, status=status.HTTP_200_OK)


class ChangePasswordView(CreateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Пароль успешно изменен"}, status=status.HTTP_200_OK)


class SkillViewSet(viewsets.ModelViewSet):
    serializer_class = SkillSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = Skill.objects.all()
        query = self.request.query_params.get("q")
        if query:
            queryset = queryset.filter(name__istartswith=query)
        return queryset


class PersonalQualityViewSet(viewsets.ModelViewSet):
    serializer_class = PersonalQualitySerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = PersonalQuality.objects.all()
        query = self.request.query_params.get("q")
        if query:
            queryset = queryset.filter(name__istartswith=query)
        return queryset


class CustomSkillViewSet(viewsets.ModelViewSet):
    serializer_class = CustomSkillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # для Swagger
        if getattr(self, 'swagger_fake_view', False):
            return CustomSkill.objects.none()

        # если пользователь не залогинен
        if not self.request.user.is_authenticated:
            return CustomSkill.objects.none()

        return CustomSkill.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CustomPersonalQualityViewSet(viewsets.ModelViewSet):
    serializer_class = CustomPersonalQualitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return CustomPersonalQuality.objects.none()

        if not self.request.user.is_authenticated:
            return CustomPersonalQuality.objects.none()

        return CustomPersonalQuality.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SchoolViewSet(viewsets.ModelViewSet):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [IsAdminOrReadOnly]


class FacultyViewSet(viewsets.ModelViewSet):
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer
    permission_classes = [IsAdminOrReadOnly]


class UserProfileUpdateView(generics.RetrieveUpdateAPIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        # Используем print для немедленного вывода (gunicorn перенаправляет stdout в логи)
        print("=" * 80)
        print("=== НАЧАЛО ОБНОВЛЕНИЯ ПРОФИЛЯ ===")
        print(f"Request method: {request.method}")
        print(f"Request content_type: {request.content_type}")
        print(f"Request META CONTENT_TYPE: {request.META.get('CONTENT_TYPE', 'NOT SET')}")
        print(f"Request FILES keys: {list(request.FILES.keys())}")
        print(f"Request data keys: {list(request.data.keys())}")
        print(f"Request POST keys: {list(request.POST.keys())}")
        print("=" * 80)
        
        instance = self.get_object()
        
        # Проверяем ВСЕ возможные места, где может быть файл
        avatar_file = None
        file_key = None
        
        # 1. Проверяем request.FILES с ключом 'avatar_file'
        if 'avatar_file' in request.FILES:
            avatar_file = request.FILES['avatar_file']
            file_key = 'avatar_file'
            print(f"✓✓✓ НАЙДЕН avatar_file в FILES: {avatar_file.name}, размер: {avatar_file.size}, тип: {avatar_file.content_type}")
        # 2. Проверяем все файлы в FILES (может быть другое имя)
        else:
            print("avatar_file НЕ найден в FILES, проверяем все файлы:")
            for key in request.FILES.keys():
                file_obj = request.FILES[key]
                print(f"  - Файл '{key}': {file_obj.name if hasattr(file_obj, 'name') else 'unknown'}, размер: {file_obj.size if hasattr(file_obj, 'size') else 'unknown'}")
                if 'avatar' in key.lower() or key == 'avatar':
                    avatar_file = file_obj
                    file_key = key
                    print(f"✓✓✓ Используем файл с ключом '{key}' как аватар")
                    break
        
        # Сохраняем аватар, если найден
        if avatar_file:
            try:
                print(f"Сохраняем аватар: {avatar_file.name}")
                instance.avatar = avatar_file
                instance.save(update_fields=['avatar'])
                print(f"✓✓✓ Аватар сохранен в БД: {instance.avatar}")
                # Перезагружаем из БД
                instance.refresh_from_db()
                print(f"✓✓✓ Аватар после refresh_from_db: {instance.avatar}, URL: {instance.avatar.url if instance.avatar else 'None'}")
            except Exception as e:
                print(f"✗✗✗ ОШИБКА сохранения аватара: {e}")
                import traceback
                traceback.print_exc()
        else:
            print("✗✗✗ avatar_file НЕ найден ни в FILES, ни в data!")
            print(f"Все ключи в FILES: {list(request.FILES.keys())}")
            print(f"Все ключи в data: {list(request.data.keys())}")
            print(f"Все ключи в POST: {list(request.POST.keys())}")
        
        # Создаем данные для сериализатора (БЕЗ файла, т.к. он уже сохранен)
        data = {}
        for key, value in request.data.items():
            if key != 'avatar_file' and key != file_key:  # Исключаем файл
                data[key] = value
        
        print(f"Данные для сериализатора (без файла): {list(data.keys())}")
        
        # Обновляем остальные поля через сериализатор
        serializer = self.get_serializer(
            instance,
            data=data,
            partial=True,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Финальная проверка
        instance.refresh_from_db()
        print("=" * 80)
        print(f"ФИНАЛЬНАЯ ПРОВЕРКА - аватар в БД: {instance.avatar}")
        if instance.avatar:
            print(f"  URL: {instance.avatar.url}")
        print(f"Аватар в ответе сериализатора: {serializer.data.get('avatar')}")
        print("=" * 80)
        
        return Response(serializer.data)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == "list":
            return UserListSerializer
        return UserProfileSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        queryset = User.objects.select_related('faculty', 'faculty__school').prefetch_related(
            'skills', 'custom_skills', 'personal_qualities', 'custom_personal_qualities'
        )
        params = self.request.query_params

        username = params.get('username')
        if username:
            queryset = queryset.filter(username__icontains=username)

        faculty_id = params.get("faculty")
        if faculty_id:
            queryset = queryset.filter(faculty_id=faculty_id)

        school_id = params.get("school")
        if school_id:
            queryset = queryset.filter(faculty__school_id=school_id)

        course = params.get('course')
        if course:
            queryset = queryset.filter(course__iexact=course)

        education = params.get('education')
        if education:
            queryset = queryset.filter(education_level__iexact=education)

        skills_param = params.get('skills')
        if skills_param:
            skills_list = [s.strip() for s in skills_param.split(',') if s.strip()]
            for skill_name in skills_list:
                queryset = queryset.filter(
                    Q(skills__name__iexact=skill_name) |
                    Q(custom_skills__name__iexact=skill_name)
                )

        qualities_param = params.get('personal_qualities')
        if qualities_param:
            qualities_list = [q.strip() for q in qualities_param.split(',') if q.strip()]
            for quality_name in qualities_list:
                queryset = queryset.filter(
                    Q(personal_qualities__name__iexact=quality_name) |
                    Q(custom_personal_qualities__name__iexact=quality_name)
                )

        return queryset.distinct()

    @action(detail=False, methods=["get"])
    def my_requests(self, request):
        memberships = request.user.memberships.select_related('team', 'team__creator', 'user').filter(status="PENDING")
        serializer = TeamJoinRequestSerializer(memberships, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def my_invitations(self, request):
        memberships = request.user.memberships.select_related('team', 'team__creator', 'user').filter(status="INVITED")
        serializer = TeamJoinRequestSerializer(memberships, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["post"])
    def accept_invitation(self, request):
        member_id = request.data.get("member_id")
        try:
            membership = request.user.memberships.get(id=member_id, status="INVITED")
        except TeamMember.DoesNotExist:
            return Response({"detail": "Приглашение не найдено."}, status=404)

        membership.status = "APPROVED"
        membership.save()

        Notification.objects.filter(
            user=request.user,
            notification_type="TEAM_INVITATION",
            team=membership.team
        ).delete()

        try:
            Notification.objects.create(
                user=membership.team.creator,
                notification_type="TEAM_INVITATION_ACCEPTED",
                team=membership.team,
                team_member=membership,
                message=f"Пользователь {request.user.username} принял приглашение в команду '{membership.team.title}'"
            )
        except Exception as e:
            print(f"Ошибка создания уведомления: {e}")

        return Response({"detail": "Вы присоединились к команде."})

    @action(detail=False, methods=["post"])
    def reject_invitation(self, request):
        member_id = request.data.get("member_id")
        try:
            membership = request.user.memberships.get(id=member_id, status="INVITED")
        except TeamMember.DoesNotExist:
            return Response({"detail": "Приглашение не найдено."}, status=404)

        membership.status = "REJECTED"
        membership.save()
        
        Notification.objects.filter(
            user=request.user,
            notification_type="TEAM_INVITATION",
            team=membership.team
        ).delete()
        
        try:
            Notification.objects.create(
                user=membership.team.creator,
                notification_type="TEAM_INVITATION_REJECTED",
                team=membership.team,
                team_member=membership,
                message=f"Пользователь {request.user.username} отклонил приглашение в команду '{membership.team.title}'"
            )
        except Exception as e:
            print(f"Ошибка создания уведомления: {e}")

        return Response({"detail": "Вы отклонили приглашение."})

    @action(detail=False, methods=["post"])
    def cancel_request(self, request):
        member_id = request.data.get("member_id")
        try:
            membership = request.user.memberships.get(id=member_id, status="PENDING")
        except TeamMember.DoesNotExist:
            return Response({"detail": "Заявка не найдена."}, status=404)

        membership.delete()
        return Response({"detail": "Заявка отменена."})

    @action(detail=False, methods=["get"])
    def notifications(self, request):
        notifications = request.user.notifications.select_related('team', 'team__creator', 'task', 'team_member', 'team_member__user').all()
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["post"])
    def mark_notification_read(self, request):
        notification_id = request.data.get("notification_id")
        try:
            notification = request.user.notifications.get(id=notification_id)
            notification.is_read = True
            notification.save()
            return Response({"detail": "Уведомление отмечено как прочитанное."})
        except Notification.DoesNotExist:
            return Response({"detail": "Уведомление не найдено."}, status=404)

    @action(detail=False, methods=["post"])
    def mark_all_notifications_read(self, request):
        request.user.notifications.filter(is_read=False).update(is_read=True)
        return Response({"detail": "Все уведомления отмечены как прочитанные."})

    @action(detail=False, methods=["post"])
    def delete_notification(self, request):
        notification_id = request.data.get("notification_id")
        try:
            notification = request.user.notifications.get(id=notification_id)
            notification.delete()
            return Response({"detail": "Уведомление удалено."})
        except Notification.DoesNotExist:
            return Response({"detail": "Уведомление не найдено."}, status=404)


class ProjectCategoryViewSet(viewsets.ModelViewSet):
    queryset = ProjectCategory.objects.all()
    serializer_class = ProjectCategorySerializer
    permission_classes = [IsAdminOrReadOnly]


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsCreatorOrReadOnly]

    def perform_create(self, serializer):
        team = serializer.save(creator=self.request.user)
        TeamMember.objects.create(team=team, user=self.request.user, status="APPROVED")

    def get_queryset(self):
        queryset = Team.objects.select_related('creator', 'category').prefetch_related(
            'required_skills', 'required_qualities', 'memberships', 'memberships__user'
        )
        params = self.request.query_params

        title = params.get('title')
        if title:
            queryset = queryset.filter(title__icontains=title)

        category = params.get('category')
        if category:
            queryset = queryset.filter(category__iexact=category)

        category_id = params.get("category_id")
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        status = params.get("status")
        if status:
            queryset = queryset.filter(status__iexact=status)

        required_skills = params.get("required_skills")
        if required_skills:
            required_skills_list = [s.strip() for s in required_skills.split(",") if s.strip()]
            for skill_name in required_skills_list:
                queryset = queryset.filter(required_skills__name__iexact=skill_name)

        required_qualities = params.get("required_qualities")
        if required_qualities:
            required_qualities_list = [q.strip() for q in required_qualities.split(",") if q.strip()]
            for quality_name in required_qualities_list:
                queryset = queryset.filter(required_qualities__name__iexact=quality_name)

        creator_name = params.get("creator_name")
        if creator_name:
            queryset = queryset.filter(creator__username=creator_name)

        return queryset.distinct()


    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def join(self, request, pk=None):
        team = self.get_object()

        if team.creator == request.user:
            return Response({"detail": "Создатель уже в команде."}, status=400)

        membership, created = TeamMember.objects.get_or_create(team=team, user=request.user)

        if not created:
            if membership.status == "APPROVED":
                return Response({"detail": "Вы уже в команде."}, status=400)
            elif membership.status == "PENDING":
                return Response({"detail": "Заявка уже отправлена."}, status=400)
            elif membership.status == "INVITED":
                return Response({"detail": "Вас пригласили, примите приглашение."}, status=400)
            elif membership.status == "REJECTED":
                pass

        membership.status = "PENDING"
        membership.message = request.data.get("message", "")
        membership.save()
        
        Notification.objects.create(
            user=team.creator,
            notification_type="TEAM_REQUEST",
            team=team,
            team_member=membership,
            message=f"Пользователь {request.user.username} подал заявку на вступление в команду '{team.title}'"
        )
        
        return Response({"detail": "Заявка отправлена."}, status=201)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def invite(self, request, pk=None):
        team = self.get_object()
        if team.creator != request.user:
            return Response({"detail": "Только создатель может приглашать."}, status=403)

        user_id = request.data.get("user_id")
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "Пользователь не найден."}, status=404)

        if team.creator == user:
            return Response({"detail": "Нельзя пригласить создателя команды."}, status=400)

        membership, created = TeamMember.objects.get_or_create(team=team, user=user)

        if not created:
            if membership.status == "APPROVED":
                return Response({"detail": "Пользователь уже в команде."}, status=400)
            elif membership.status == "PENDING":
                return Response({"detail": "Пользователь уже подал заявку на вступление."}, status=400)
            elif membership.status == "INVITED":
                return Response({"detail": "Пользователь уже приглашен в команду."}, status=400)
            elif membership.status == "REJECTED":
                # Можно пригласить снова, если заявка была отклонена
                pass

        membership.status = "INVITED"
        membership.message = request.data.get("message", "")
        membership.save()
        
        Notification.objects.create(
            user=user,
            notification_type="TEAM_INVITATION",
            team=team,
            team_member=membership,
            message=f"Вас пригласили в команду '{team.title}'"
        )
        
        return Response({"detail": f"Приглашение отправлено пользователю {user.username}."})


    @action(detail=True, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def requests(self, request, pk=None):
        team = self.get_object()
        if team.creator != request.user:
            return Response({"detail": "Доступ запрещён."}, status=status.HTTP_403_FORBIDDEN)
        members = team.memberships.select_related('user', 'team', 'team__creator').filter(status="PENDING")
        serializer = TeamJoinRequestSerializer(members, many=True)
        return Response(serializer.data)
    
        if not request.user.is_authenticated:
            return Response({"detail": "Требуется авторизация."}, status=401)
        
        try:
            team = Team.objects.get(invite_token=token)
        except Team.DoesNotExist:
            return Response({"detail": "Приглашение не найдено или недействительно."}, status=404)
        
        if team.creator == request.user:
            return Response({"detail": "Создатель уже в команде."}, status=400)
        
        membership, created = TeamMember.objects.get_or_create(team=team, user=request.user)
        
        if not created:
            if membership.status == "APPROVED":
                return Response({"detail": "Вы уже в команде."}, status=400)
            elif membership.status == "PENDING":
                # Если была заявка, меняем на приглашение
                membership.status = "INVITED"
            elif membership.status == "INVITED":
                return Response({"detail": "Вы уже приняли приглашение."}, status=400)
            elif membership.status == "REJECTED":
                membership.status = "INVITED"
        else:
            membership.status = "INVITED"
        
        membership.save()
        
        Notification.objects.create(
            user=team.creator,
            notification_type="TEAM_INVITATION_ACCEPTED",
            team=team,
            team_member=membership,
            message=f"Пользователь {request.user.username} принял приглашение в команду '{team.title}'"
        )
        
        return Response({"detail": "Вы присоединились к команде.", "team_id": team.id}, status=200)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def approve(self, request, pk=None):
        team = self.get_object()
        if team.creator != request.user:
            return Response({"detail": "Доступ запрещён."}, status=status.HTTP_403_FORBIDDEN)

        member_id = request.data.get("member_id")
        try:
            member = team.memberships.get(id=member_id, status="PENDING")
        except TeamMember.DoesNotExist:
            return Response({"detail": "Заявка не найдена."}, status=status.HTTP_404_NOT_FOUND)

        member.status = "APPROVED"
        member.save()
        
        # Удаляем только уведомление для конкретного участника
        # Используем get() для поиска конкретного уведомления, чтобы избежать удаления других
        try:
            notification = Notification.objects.get(
                user=request.user,
                notification_type="TEAM_REQUEST",
                team=team,
                team_member=member
            )
            notification.delete()
        except Notification.DoesNotExist:
            # Если уведомление не найдено, это не критично - возможно оно уже было удалено
            pass
        except Notification.MultipleObjectsReturned:
            # Если найдено несколько уведомлений (не должно быть, но на всякий случай), удаляем все
            Notification.objects.filter(
                user=request.user,
                notification_type="TEAM_REQUEST",
                team=team,
                team_member=member
            ).delete()
        
        Notification.objects.create(
            user=member.user,
            notification_type="TEAM_REQUEST_APPROVED",
            team=team,
            team_member=member,
            message=f"Ваша заявка на вступление в команду '{team.title}' была одобрена"
        )
        
        return Response({"detail": "Участник принят."})

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def reject(self, request, pk=None):
        team = self.get_object()
        if team.creator != request.user:
            return Response({"detail": "Доступ запрещён."}, status=status.HTTP_403_FORBIDDEN)

        member_id = request.data.get("member_id")
        try:
            member = team.memberships.get(id=member_id, status="PENDING")
        except TeamMember.DoesNotExist:
            return Response({"detail": "Заявка не найдена."}, status=status.HTTP_404_NOT_FOUND)

        member.status = "REJECTED"
        member.save()
        
        # Удаляем только уведомление для конкретного участника
        # Используем get() для поиска конкретного уведомления, чтобы избежать удаления других
        try:
            notification = Notification.objects.get(
                user=request.user,
                notification_type="TEAM_REQUEST",
                team=team,
                team_member=member
            )
            notification.delete()
        except Notification.DoesNotExist:
            # Если уведомление не найдено, это не критично - возможно оно уже было удалено
            pass
        except Notification.MultipleObjectsReturned:
            # Если найдено несколько уведомлений (не должно быть, но на всякий случай), удаляем все
            Notification.objects.filter(
                user=request.user,
                notification_type="TEAM_REQUEST",
                team=team,
                team_member=member
            ).delete()
        
        Notification.objects.create(
            user=member.user,
            notification_type="TEAM_REQUEST_REJECTED",
            team=team,
            team_member=member,
            message=f"Ваша заявка на вступление в команду '{team.title}' была отклонена"
        )
        
        return Response({"detail": "Заявка отклонена."})

    @action(detail=True, methods=["delete"], url_path="remove-member/(?P<user_id>[^/.]+)")
    def remove(self, request, pk=None, user_id=None):
        team = self.get_object()
        if team.creator != request.user:
            return Response({"detail": "Только владелец может удалять участников."}, status=403)

        try:
            membership = TeamMember.objects.get(team=team, user_id=user_id)
            membership.delete()
            return Response({"detail": "Участник удалён."}, status=200)
        except TeamMember.DoesNotExist:
            return Response({"detail": "Такого участника нет в команде."}, status=404)

    @action(detail=True, methods=["put"], permission_classes=[permissions.IsAuthenticated])
    def update_team(self, request, pk=None):
        team = self.get_object()
        if team.creator != request.user:
            return Response({"detail": "Только владелец может редактировать команду."}, status=403)

        serializer = TeamUpdateSerializer(team, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def members(self, request, pk=None):
        team = self.get_object()
        members = team.memberships.select_related('user', 'team').all()
        serializer = TeamMemberSerializer(members, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["put"], url_path="members/(?P<member_id>[^/.]+)", permission_classes=[permissions.IsAuthenticated])
    def update_member_status(self, request, pk=None, member_id=None):
        team = self.get_object()
        if team.creator != request.user:
            return Response({"detail": "Только владелец может изменять статус участников."}, status=403)

        try:
            member = team.memberships.get(id=member_id)
        except TeamMember.DoesNotExist:
            return Response({"detail": "Участник не найден."}, status=404)

        old_status = member.status
        serializer = TeamMemberUpdateSerializer(member, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            new_status = member.status
            
            # Если статус изменился на APPROVED или REJECTED, удаляем уведомление о заявке
            if old_status == "PENDING" and new_status in ["APPROVED", "REJECTED"]:
                # Удаляем уведомление для создателя команды о заявке этого участника
                # Используем get() для поиска конкретного уведомления
                try:
                    notification = Notification.objects.get(
                        user=request.user,
                        notification_type="TEAM_REQUEST",
                        team=team,
                        team_member=member
                    )
                    notification.delete()
                except Notification.DoesNotExist:
                    pass
                except Notification.MultipleObjectsReturned:
                    Notification.objects.filter(
                        user=request.user,
                        notification_type="TEAM_REQUEST",
                        team=team,
                        team_member=member
                    ).delete()
                
                # Создаем уведомление для пользователя о результате заявки
                notification_type = "TEAM_REQUEST_APPROVED" if new_status == "APPROVED" else "TEAM_REQUEST_REJECTED"
                message = (
                    f"Ваша заявка на вступление в команду '{team.title}' была одобрена"
                    if new_status == "APPROVED"
                    else f"Ваша заявка на вступление в команду '{team.title}' была отклонена"
                )
                Notification.objects.create(
                    user=member.user,
                    notification_type=notification_type,
                    team=team,
                    team_member=member,
                    message=message
                )
            
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


class TeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.all().select_related("user", "team")
    serializer_class = TeamMemberSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        team_id = self.kwargs.get('team_pk')
        if team_id:
            try:
                team = Team.objects.select_related('creator').get(id=team_id)
                # Проверяем права доступа
                if team.creator == self.request.user:
                    # Создатель видит все задачи команды
                    return Task.objects.filter(team=team).select_related('creator', 'assigned_to', 'team')
                else:
                    # Участник видит только свои задачи
                    return Task.objects.filter(team=team, assigned_to=self.request.user).select_related('creator', 'assigned_to', 'team')
            except Team.DoesNotExist:
                return Task.objects.none()
        return Task.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return TaskCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TaskUpdateSerializer
        return TaskSerializer

    def perform_create(self, serializer):
        team_id = self.kwargs.get('team_pk')
        try:
            team = Team.objects.select_related('creator').get(id=team_id)
        except Team.DoesNotExist:
            raise permissions.PermissionDenied("Команда не найдена")
        
        # Только создатель команды может создавать задачи
        if team.creator != self.request.user:
            raise permissions.PermissionDenied("Только создатель команды может создавать задачи")
        
        task = serializer.save(team=team, creator=self.request.user)
        
        # Создаем уведомление для назначенного пользователя
        if task.assigned_to:
            Notification.objects.create(
                user=task.assigned_to,
                notification_type="TASK_ASSIGNED",
                team=team,
                task=task,
                message=f"Вам назначена новая задача: {task.title}"
            )

    def perform_update(self, serializer):
        task = self.get_object()
        
        # Проверяем права на обновление
        if task.creator == self.request.user:
            # Создатель может изменять все поля
            old_assigned_to = task.assigned_to
            serializer.save()
            
            # Если изменился исполнитель, создаем уведомление
            if old_assigned_to != task.assigned_to and task.assigned_to:
                Notification.objects.create(
                    user=task.assigned_to,
                    notification_type="TASK_ASSIGNED",
                    team=task.team,
                    task=task,
                    message=f"Вам назначена задача: {task.title}"
                )
        elif task.assigned_to == self.request.user:
            # Участник может изменять только статус
            if 'status' in serializer.validated_data:
                serializer.save()
                # Уведомляем создателя об изменении статуса
                Notification.objects.create(
                    user=task.creator,
                    notification_type="TASK_UPDATED",
                    team=task.team,
                    task=task,
                    message=f"Статус задачи '{task.title}' изменен на '{task.get_status_display()}'"
                )
            else:
                raise permissions.PermissionDenied("Участник может изменять только статус задачи")
        else:
            raise permissions.PermissionDenied("Нет прав на изменение этой задачи")

    def perform_destroy(self, instance):
        # Только создатель команды может удалять задачи
        if instance.creator != self.request.user:
            raise permissions.PermissionDenied("Только создатель команды может удалять задачи")
        instance.delete()




