from django.urls import path
from . import views


app_name = 'espace_etudiant'


urlpatterns = [
    path('accueil/', views.accueil, name='accueil'),
    path('planning/', views.planning, name='planning'),
    path('formation/', views.formation, name='formation'),
    path('finances/', views.finances, name='finances'),
    path('documents/', views.documents, name='documents'),
    path('dossier/', views.dossier, name='dossier'),
    path('compte/', views.mon_compte, name='mon_compte'),
    path('compte/mot-de-passe/', views.changer_mot_de_passe, name='changer_mot_de_passe'),
    path('resultats/complet/', views.mes_resultats_complet, name='mes_resultats_complet'),
    path('resultats/classement/', views.mon_classement_classe, name='mon_classement_classe'),
    path('releve-complet/', views.mon_releve_complet, name='mon_releve_complet'),
    path('resultats/filtres/', views.filtres_resultats, name='filtres_resultats'),
]