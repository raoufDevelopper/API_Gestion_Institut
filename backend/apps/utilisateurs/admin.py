from django.contrib import admin

from .models import Etudiant, Personnel, Formateur


@admin.register(Etudiant)
class EtudiantAdmin(admin.ModelAdmin):
    list_display = ['matricule', 'nom', 'prenom', 'statut', 'date_inscription']
    search_fields = ['matricule', 'nom', 'prenom']
    list_filter = ['statut', 'sexe']


@admin.register(Personnel)
class PersonnelAdmin(admin.ModelAdmin):
    list_display = ['matricule', 'nom', 'prenom', 'poste', 'statut']
    search_fields = ['matricule', 'nom', 'prenom']
    list_filter = ['statut', 'poste']


@admin.register(Formateur)
class FormateurAdmin(admin.ModelAdmin):
    list_display = ['personnel', 'type_contrat', 'filiere', 'specialite']
    search_fields = ['personnel', 'type_contrat', 'filiere', 'specialite']
