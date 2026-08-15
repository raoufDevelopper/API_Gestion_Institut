from django.contrib import admin, messages
from .models import (
    Bourse, CategorieDepense, TypePaiement, Tarif, Inscription, FraisInscription,
    Paiement, Depense, CaisseSession,
)
@admin.register(CategorieDepense)
class CategorieDepenseAdmin(admin.ModelAdmin):
    list_display = ("nom", "est_tresorerie")
@admin.register(TypePaiement)
class TypePaiementAdmin(admin.ModelAdmin):
    list_display = ("nom", "code", "obligatoire_a_inscription", "ordre")
    prepopulated_fields = {"code": ("nom",)}
@admin.register(Tarif)
class TarifAdmin(admin.ModelAdmin):
    list_display = ("type_paiement", "decrire_portee", "annee_academique", "montant", "actif")
    list_filter = ("type_paiement", "annee_academique", "actif")
    filter_horizontal = ("specialites", "niveaux")
    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        conflits = form.instance.conflits()
        if conflits:
            noms = ", ".join(str(c) for c in conflits)
            messages.warning(
                request,
                f"⚠️ Ce tarif chevauche {len(conflits)} autre(s) tarif(s) de même portée : {noms}.",
            )
@admin.register(FraisInscription)
class FraisInscriptionAdmin(admin.ModelAdmin):
    list_display = ("inscription", "type_paiement", "montant_du", "date_application")
    list_filter = ("type_paiement",)
    search_fields = ("inscription__etudiant__nom",)
@admin.register(Inscription)
class InscriptionAdmin(admin.ModelAdmin):
    list_display = ("etudiant", "classe", "annee_academique", "date_inscription", "statut")
    list_filter = ("statut", "annee_academique", "classe")
    search_fields = ("etudiant__nom", "etudiant__prenom")
@admin.register(Paiement)
class PaiementAdmin(admin.ModelAdmin):
    list_display = ("numero_recu", "inscription", "type_paiement", "montant", "mode_paiement", "date_paiement", "statut")
    list_filter = ("mode_paiement", "type_paiement", "statut")
    search_fields = ("numero_recu",)
    readonly_fields = ("numero_recu",)
@admin.register(Depense)
class DepenseAdmin(admin.ModelAdmin):
    list_display = ("libelle", "categorie", "montant", "mode_paiement", "date_depense", "statut")
    list_filter = ("categorie", "mode_paiement", "statut")
    search_fields = ("libelle",)
@admin.register(CaisseSession)
class CaisseSessionAdmin(admin.ModelAdmin):
    list_display = ("date_session", "statut", "solde_ouverture", "solde_reel_fermeture")
    list_filter = ("statut",)
    readonly_fields = ("solde_theorique_affiche", "ecart_affiche")
    def solde_theorique_affiche(self, obj):
        return obj.solde_theorique
    solde_theorique_affiche.short_description = "Solde théorique"
    def ecart_affiche(self, obj):
        return obj.ecart
    ecart_affiche.short_description = "Écart"
@admin.register(Bourse)
class BourseAdmin(admin.ModelAdmin):
    list_display = ('etudiant', 'organisme', 'type_reduction', 'valeur_reduction', 'active')
    list_filter = ('active', 'type_reduction')
    search_fields = ('etudiant__nom', 'etudiant__prenom', 'organisme')
