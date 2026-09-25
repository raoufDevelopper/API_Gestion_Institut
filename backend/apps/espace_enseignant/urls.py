from django.urls import path
from . import views

app_name = 'espace_enseignant'

urlpatterns = [
    path('accueil/', views.accueil, name='accueil'),
    path('planning/', views.planning, name='planning'),
    path('mes-classes-matieres/', views.mes_classes_matieres, name='mes_classes_matieres'),
    path('saisie/contexte/', views.contexte_saisie, name='contexte_saisie'),
    path('saisie/enregistrer/', views.enregistrer_notes, name='enregistrer_notes'),
    path('saisie/combos/', views.combos_pour_saisie, name='combos_pour_saisie'),
    path('consultation/combos/', views.combos_pour_consultation, name='combos_pour_consultation'),
    path('consultation/', views.consultation, name='consultation'),
    path('mes-etudiants/', views.mes_etudiants, name='mes_etudiants'),
    path('resultats-matieres/', views.resultats_matieres, name='resultats_matieres'),
    path('compte/', views.mon_compte, name='mon_compte'),
    path('etudiants/<int:pk>/', views.detail_etudiant, name='detail_etudiant'),
    path('compte/mot-de-passe/', views.changer_mot_de_passe, name='changer_mot_de_passe'),
    path('dossier/', views.mon_dossier, name='mon_dossier'),
    path('mes-emplois-du-temps/', views.mes_emplois_du_temps, name='mes_emplois_du_temps'),
    path('planning/<int:edt_id>/pdf/', views.telecharger_mon_planning, name='telecharger_mon_planning'),
]