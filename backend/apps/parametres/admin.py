from django.contrib import admin
from .models import Abonnement, ParametreInstitut, ConfigurationMatricule, Sauvegarde, ArchiveAnneeAcademique, Notification




@admin.register(ParametreInstitut)
class ParametreInstitutAdmin(admin.ModelAdmin):
    list_display = ['nom', 'sigle', 'date_modification']
    def has_add_permission(self, request):
        return not ParametreInstitut.objects.exists()
    def has_delete_permission(self, request, obj=None):
        return False



@admin.register(ConfigurationMatricule)
class ConfigurationMatriculeAdmin(admin.ModelAdmin):
    list_display = ['type_profil', 'prefixe', 'inclure_annee', 'nombre_chiffres', 'compteur']



@admin.register(Sauvegarde)
class SauvegardeAdmin(admin.ModelAdmin):
    list_display = ['nom_fichier', 'type_sauvegarde', 'statut', 'declenchee_par', 'date_creation']
    list_filter = ['statut', 'type_sauvegarde']



@admin.register(ArchiveAnneeAcademique)
class ArchiveAnneeAcademiqueAdmin(admin.ModelAdmin):
    list_display = ['annee_academique', 'nb_etudiants', 'nb_admis', 'nb_redoublants', 'date_archivage']



@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['titre', 'destinataire', 'type_notification', 'lue', 'email_envoye', 'date_creation']
    list_filter = ['type_notification', 'lue', 'email_envoye']



@admin.register(Abonnement)
class AbonnementAdmin(admin.ModelAdmin):
    list_display = ('date_expiration', 'est_actif_affiche', 'jours_restants', 'date_derniere_activation')
    readonly_fields = ('date_derniere_activation', 'dernier_code_utilise')
    def est_actif_affiche(self, obj):
        return obj.est_actif
    est_actif_affiche.short_description = "Actif"
    est_actif_affiche.boolean = True
    def has_add_permission(self, request):
        return not Abonnement.objects.exists()
    def has_delete_permission(self, request, obj=None):
        return False