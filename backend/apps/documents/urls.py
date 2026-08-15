from django.urls import path
from . import views
app_name = 'documents'
urlpatterns = [
    # Diplome
    path('diplomes/', views.liste_creer_diplomes, name='liste_creer_diplomes'),
    path('diplomes/<int:pk>/', views.detail_diplome, name='detail_diplome'),
    path('diplomes/<int:pk>/revoquer/', views.revoquer_diplome, name='revoquer_diplome'),
    path('diplomes/<int:pk>/telecharger/', views.telecharger_diplome, name='telecharger_diplome'),
    # TypeCertificat
    path('types-certificat/', views.liste_creer_types_certificat, name='liste_creer_types_certificat'),
    path('types-certificat/<int:pk>/', views.detail_type_certificat, name='detail_type_certificat'),
    # Certificat
    path('certificats/', views.liste_creer_certificats, name='liste_creer_certificats'),
    path('certificats/<int:pk>/', views.detail_certificat, name='detail_certificat'),
    path('certificats/auto-generer/', views.auto_generer_certificat, name='auto_generer_certificat'),
    path('certificats/<int:pk>/telecharger/', views.telecharger_certificat, name='telecharger_certificat'),
    # Document
    path('documents/', views.liste_creer_documents, name='liste_creer_documents'),
    path('documents/<int:pk>/', views.detail_document, name='detail_document'),
]