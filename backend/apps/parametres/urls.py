from django.urls import path
from . import views
app_name = 'parametre'
urlpatterns = [
    # Paramètre institut
    path('institut/', views.parametre_institut, name='parametre_institut'),

    # Configuration matricule
    path('config-matricule/', views.liste_creer_configuration_matricule, name='liste_creer_configuration_matricule'),
    path('config-matricule/<int:pk>/', views.detail_configuration_matricule, name='detail_configuration_matricule'),

    # Sauvegarde
    path('sauvegardes/', views.liste_sauvegardes, name='liste_sauvegardes'),
    path('sauvegardes/lancer/', views.lancer_sauvegarde, name='lancer_sauvegarde'),
    path('sauvegardes/<int:pk>/telecharger/', views.telecharger_sauvegarde, name='telecharger_sauvegarde'),
    path('sauvegardes/<int:pk>/', views.supprimer_sauvegarde, name='supprimer_sauvegarde'),

    # Archives
    path('archives/', views.liste_archives, name='liste_archives'),
    path('archives/annees-academiques/<int:pk>/archiver/', views.archiver_annee_academique, name='archiver_annee_academique'),

    # Notifications
    path('notifications/', views.mes_notifications, name='mes_notifications'),
    path('notifications/<int:pk>/lue/', views.marquer_notification_lue, name='marquer_notification_lue'),
    path('notifications/toutes-lues/', views.marquer_toutes_notifications_lues, name='marquer_toutes_notifications_lues'),
    path('notifications/<int:pk>/', views.supprimer_notification, name='supprimer_notification'),
    path('notifications/<int:pk>/toggle-lecture/', views.toggle_lecture_notification, name='toggle_lecture_notification'),
    path('notifications/effacer-lues/', views.effacer_notifications_lues, name='effacer_notifications_lues'),

    # Profil
    path('mon-profil/', views.mon_profil, name='mon_profil'),

    # Abonnement
    path('abonnement/statut/', views.statut_abonnement, name='statut_abonnement'),
    path('abonnement/activer/', views.activer_abonnement, name='activer_abonnement'),
]