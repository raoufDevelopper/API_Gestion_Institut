from django.urls import path
from . import views


app_name = 'statistiques'


urlpatterns = [
    path('academique/', views.dashboard_academique, name='dashboard_academique'),
    path('academique/filtres/', views.filtres_academique, name='filtres_academique'),
    path('academique/export/pdf/', views.export_academique_pdf, name='export_academique_pdf'),
    path('academique/export/excel/', views.export_academique_excel, name='export_academique_excel'),
    path('bibliotheque/', views.dashboard_bibliotheque, name='dashboard_bibliotheque'),
    path('bibliotheque/filtres/', views.filtres_bibliotheque, name='filtres_bibliotheque'),
    path('documents/', views.dashboard_documents, name='dashboard_documents'),
    path('documents/filtres/', views.filtres_documents, name='filtres_documents'),
    path('finance/', views.dashboard_finance, name='dashboard_finance'),
    path('finance/filtres/', views.filtres_finance, name='filtres_finance'),
]