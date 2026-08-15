from django.urls import path

from . import views




urlpatterns = [
    # Selects filtrés
    path('utilisateurs-disponibles/etudiant/', views.utilisateurs_disponibles_etudiant),
    path('utilisateurs-disponibles/personnel/', views.utilisateurs_disponibles_personnel),
    path('personnel-disponible/formateur/', views.personnel_disponible_formateur),

    # Étudiants
    path('etudiants/', views.liste_creer_etudiants, name = 'etudiant'),
    path('etudiants/<int:pk>/', views.detail_etudiant, name = 'detail_etudiant'),
    path('etudiants/<int:pk>/export-pdf/', views.export_fiche_etudiant_pdf, name = 'export_fiche_etudiant_pdf'),

    # Personnel
    path('personnel/', views.liste_creer_personnel, name = 'personnel'),
    path('personnel/<int:pk>/', views.detail_personnel, name = 'detail_personnel'),
    path('personnel/<int:pk>/export-pdf/', views.export_fiche_personnel_pdf, name = 'export_fiche_personnel_pdf'),

    # Formateurs
    path('formateurs/', views.liste_creer_formateurs, name = 'formateur'),
    path('formateurs/<int:pk>/', views.detail_formateur, name = 'detail_formateur'),
    path('formateurs/<int:pk>/export-pdf/', views.export_fiche_formateur_pdf, name = 'export_fiche_formateur_pdf'),

]