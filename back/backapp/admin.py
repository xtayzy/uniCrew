from django.contrib import admin

from .models import User, Skill, PersonalQuality, Team, TeamMember, ProjectCategory, Faculty, School, Notification

# Register your models here.


admin.site.register(User)
admin.site.register(Skill)
admin.site.register(ProjectCategory)
admin.site.register(Team)
admin.site.register(TeamMember)
admin.site.register(PersonalQuality)
admin.site.register(School)
admin.site.register(Faculty)
admin.site.register(Notification)


