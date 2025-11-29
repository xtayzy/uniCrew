from django.db import router
from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import RegisterStep1View, RegisterStep2View, PasswordResetView, ChangePasswordView, SkillViewSet, PersonalQualityViewSet, \
    CustomSkillViewSet, CustomPersonalQualityViewSet, UserProfileUpdateView, UserViewSet, TeamMemberViewSet, \
    ProjectCategoryViewSet, TeamViewSet, FacultyViewSet, SchoolViewSet, TaskViewSet

router = DefaultRouter()

router.register('skills', SkillViewSet, basename="skills")
router.register('personal-qualities', PersonalQualityViewSet, basename="personal-qualities")
router.register(r"custom-skills", CustomSkillViewSet, basename="custom-skill")
router.register(r"custom-personal-qualities", CustomPersonalQualityViewSet, basename="custom-personal-quality")
router.register(r"users", UserViewSet, basename="user")
router.register(r"project-categories", ProjectCategoryViewSet, basename="project-category")
router.register(r"teams", TeamViewSet, basename="team")
router.register(r"team-members", TeamMemberViewSet, basename="team-member")
router.register(r"teams/(?P<team_pk>[^/.]+)/tasks", TaskViewSet, basename="task")
router.register("faculties", FacultyViewSet, basename="faculty")
router.register("schools", SchoolViewSet, basename="school")

urlpatterns = [
    path("register-step1/", RegisterStep1View.as_view(), name="register-step1"),
    path("register-step2/", RegisterStep2View.as_view(), name="register-step2"),
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("password-reset/", PasswordResetView.as_view(), name="password_reset"),
    path("change-password/", ChangePasswordView.as_view(), name="change_password"),
    path('profile/', UserProfileUpdateView.as_view(), name="user-profile"),
    path("teams/invite/", TeamViewSet.as_view({"get": "by_invite_token", "post": "join_by_invite_token"}), name="team-invite"),
] + router.urls



