from django.contrib import admin

from .models import Niveau, Filiere, Specialite, TypeSalle, Salle, Matiere, AnneeAcademique, Classe, EmploiDuTemps, Seance, Sanction






@admin.register(Niveau)
class NiveauAdmin(admin.ModelAdmin):
    list_display = ['code', 'nom', 'cycle']
    search_fields = ['code', 'nom']




@admin.register(Filiere)
class FiliereAdmin(admin.ModelAdmin):
    list_display = ['code', 'nom', 'responsable', 'statut']
    search_fields = ['code', 'nom']
    list_filter = ['statut']




@admin.register(Specialite)
class SpecialiteAdmin(admin.ModelAdmin):
    list_display = ['code', 'nom', 'filiere', 'statut']
    search_fields = ['code', 'nom']
    list_filter = ['statut', 'filiere']




@admin.register(TypeSalle)
class TypeSalleAdmin(admin.ModelAdmin):
    list_display = ['code', 'libelle']
    search_fields = ['code', 'libelle']




@admin.register(Salle)
class SalleAdmin(admin.ModelAdmin):
    list_display = ['code', 'nom', 'type_salle', 'capacite', 'statut']
    list_filter = ['statut', 'type_salle']
    search_fields = ['code', 'nom', 'type_salle', 'capacite', 'statut']




@admin.register(Matiere)
class MatiereAdmin(admin.ModelAdmin):
    list_display = ['code', 'nom', 'coefficient', 'volume_horaire', 'semestre', 'statut']
    list_filter = ['semestre', 'statut']
    search_fields = ['code', 'nom', 'coefficient', 'volume_horaire', 'semestre', 'statut']
    filter_horizontal = ['specialite', 'niveau']




@admin.register(AnneeAcademique)
class AnneeAcademiqueAdmin(admin.ModelAdmin):
    list_display = ['libelle', 'date_debut', 'date_fin', 'statut']
    list_filter = ['statut']
    search_fields = ['libelle', 'date_debut', 'date_fin', 'statut']




@admin.register(Classe)
class ClasseAdmin(admin.ModelAdmin):
    list_display = ['specialite', 'niveau', 'filiere', 'effectif']
    search_fields = ['specialite', 'niveau', 'filiere', 'effectif']
    list_filter = ['niveau', 'filiere']




@admin.register(EmploiDuTemps)
class EmploiDuTempsAdmin(admin.ModelAdmin):
    list_display = ['titre', 'classe', 'semestre', 'annee_academique', 'statut']
    list_filter = ['statut', 'semestre', 'annee_academique']
    search_fields = ['titre', 'classe', 'semestre', 'annee_academique', 'statut']




@admin.register(Seance)
class SeanceAdmin(admin.ModelAdmin):
    list_display = ['matiere', 'formateur', 'salle', 'jour', 'heure_debut', 'heure_fin', 'type_seance']
    list_filter = ['jour', 'type_seance']
    search_fields = ['matiere', 'formateur', 'salle', 'jour', 'heure_debut', 'heure_fin', 'type_seance']




@admin.register(Sanction)
class SanctionAdmin(admin.ModelAdmin):
    list_display = ['code', 'nom', 'type', 'gravite', 'statut']
    list_filter = ['type', 'gravite', 'statut']
    search_fields = ['code', 'nom', 'type', 'gravite', 'statut']
