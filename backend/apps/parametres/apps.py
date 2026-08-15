from django.apps import AppConfig
class ParametreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.parametres'
    def ready(self):
        import apps.parametres.signals