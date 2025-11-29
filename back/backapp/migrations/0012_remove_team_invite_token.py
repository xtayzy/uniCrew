# Generated manually

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backapp', '0010_alter_notification_notification_type_task_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='team',
            name='invite_token',
        ),
    ]

