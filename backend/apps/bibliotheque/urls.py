from django.urls import path
from . import views
app_name = 'bibliotheque'
urlpatterns = [
    path('categories/', views.liste_creer_categories, name='liste_creer_categories'),
    path('categories/<int:pk>/', views.detail_categorie, name='detail_categorie'),
    path('livres/', views.liste_creer_livres, name='liste_creer_livres'),
    path('livres/<int:pk>/', views.detail_livre, name='detail_livre'),
    path('exemplaires/', views.liste_creer_exemplaires, name='liste_creer_exemplaires'),
    path('exemplaires/<int:pk>/', views.detail_exemplaire, name='detail_exemplaire'),
    path('emprunts/', views.liste_creer_emprunts, name='liste_creer_emprunts'),
    path('emprunts/<int:pk>/', views.detail_emprunt, name='detail_emprunt'),
    path('emprunts/<int:pk>/retourner/', views.retourner_emprunt, name='retourner_emprunt'),
    path('emprunts/<int:pk>/pdf/', views.recu_emprunt_pdf, name='recu_emprunt_pdf'),
    path('emprunts/retards/', views.liste_emprunts_en_retard, name='liste_emprunts_en_retard'),
    path('emprunts/retards/pdf/', views.liste_retards_pdf, name='liste_retards_pdf'),
    path('reservations/', views.liste_creer_reservations, name='liste_creer_reservations'),
    path('reservations/<int:pk>/', views.detail_reservation, name='detail_reservation'),
    path('penalites/', views.liste_penalites, name='liste_penalites'),
    path('penalites/<int:pk>/payer/', views.payer_penalite, name='payer_penalite'),
]