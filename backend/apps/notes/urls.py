from django.urls import path

from . import views



app_name = 'notes'

urlpatterns = [
    # TypeEvaluation
    path('types-evaluation/', views.liste_creer_types_evaluation, name='liste_creer_types_evaluation'),
    path('types-evaluation/<int:pk>/', views.detail_type_evaluation, name='detail_type_evaluation'),

    # Saisie
    path('saisie/contexte/', views.contexte_saisie_notes, name='contexte_saisie_notes'),
    path('saisie/', views.saisir_notes, name='saisir_notes'),

    # Consultation
    path('consultation/', views.consultation_notes, name='consultation_notes'),

    # Relevé
    path('releve/', views.releve_notes, name='releve_notes'),
    path('releve/pdf/', views.releve_notes_pdf, name='releve_notes_pdf'),

    # Délibération
    path('deliberation/', views.deliberation, name='deliberation'),
    path('deliberation/pdf/', views.deliberation_pdf, name='deliberation_pdf'),
    path('deliberation/<int:pk>/verrouiller/', views.deliberation_verrouiller, name='deliberation_verrouiller'),

    # Note (correction ponctuelle)
    path('notes/<int:pk>/', views.detail_note, name='detail_note'),
]