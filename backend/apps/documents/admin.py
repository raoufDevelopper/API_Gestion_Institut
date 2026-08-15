from django.contrib import admin
from .models import Diplome, TypeCertificat, Certificat, Document
@admin.register(Diplome)
class DiplomeAdmin(admin.ModelAdmin):
    list_display = ('numero_diplome', 'etudiant', 'mention', 'date_obtention', 'statut')
    list_filter = ('statut', 'mention')
    search_fields = ('numero_diplome', 'etudiant__nom', 'etudiant__prenom')
    readonly_fields = ('numero_diplome',)
@admin.register(TypeCertificat)
class TypeCertificatAdmin(admin.ModelAdmin):
    list_display = ('nom', 'code', 'auto_generable')
@admin.register(Certificat)
class CertificatAdmin(admin.ModelAdmin):
    list_display = ('numero', 'type_certificat', 'etudiant', 'date_emission')
    list_filter = ('type_certificat',)
    search_fields = ('numero', 'etudiant__nom', 'etudiant__prenom')
    readonly_fields = ('numero',)
@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('titre', 'categorie', 'concerne_etudiant', 'concerne_personnel', 'date_ajout')
    list_filter = ('categorie',)
    search_fields = ('titre',)