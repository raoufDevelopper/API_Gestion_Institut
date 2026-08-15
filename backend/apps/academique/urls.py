from django.urls import path

from . import views



app_name = 'academique'

urlpatterns = [
    # Niveau
    path('niveaux/', views.liste_creer_niveaux, name='liste_creer_niveaux'),
    path('niveaux/<int:pk>/', views.detail_niveau, name='detail_niveau'),

    # Filiere
    path('filieres/', views.liste_creer_filieres, name='liste_creer_filieres'),
    path('filieres/<int:pk>/', views.detail_filiere, name='detail_filiere'),

    # Specialite
    path('specialites/', views.liste_creer_specialites, name='liste_creer_specialites'),
    path('specialites/<int:pk>/', views.detail_specialite, name='detail_specialite'),

    # TypeSalle
    path('types-salle/', views.liste_creer_types_salle, name='liste_creer_types_salle'),
    path('types-salle/<int:pk>/', views.detail_type_salle, name='detail_type_salle'),

    # Salle
    path('salles/', views.liste_creer_salles, name='liste_creer_salles'),
    path('salles/<int:pk>/', views.detail_salle, name='detail_salle'),

    # Matiere
    path('matieres/', views.liste_creer_matieres, name='liste_creer_matieres'),
    path('matieres/<int:pk>/', views.detail_matiere, name='detail_matiere'),

    # AnneeAcademique
    path('annees-academiques/', views.liste_creer_annees_academiques, name='liste_creer_annees_academiques'),
    path('annees-academiques/<int:pk>/', views.detail_annee_academique, name='detail_annee_academique'),

    # Classe
    path('classes/', views.liste_creer_classes, name='liste_creer_classes'),
    path('classes/<int:pk>/', views.detail_classe, name='detail_classe'),

    # EmploiDuTemps
    path('emplois-du-temps/', views.liste_creer_emplois_du_temps, name='liste_creer_emplois_du_temps'),
    path('emplois-du-temps/<int:pk>/', views.detail_emploi_du_temps, name='detail_emploi_du_temps'),
    path('emplois-du-temps/<int:pk>/export-pdf/', views.export_emploi_du_temps_pdf, name='export_emploi_du_temps_pdf'),

    # Seance
    path('seances/', views.liste_creer_seances, name='liste_creer_seances'),
    path('seances/<int:pk>/', views.detail_seance, name='detail_seance'),

    # Sanction
    path('sanctions/', views.liste_creer_sanctions, name='liste_creer_sanctions'),
    path('sanctions/<int:pk>/', views.detail_sanction, name='detail_sanction'),
]