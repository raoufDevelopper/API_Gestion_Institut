from django.contrib import admin
from .models import (
    Categorie, Auteur, Editeur, Ressource, Localisation, Exemplaire,
    Adherent, RegleBibliotheque, Emprunt, Reservation, Penalite,
    Inventaire, LigneInventaire, Fournisseur, Acquisition, LigneAcquisition,
)
@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    list_display = ('nom', 'parent')
    search_fields = ('nom',)
@admin.register(Auteur)
class AuteurAdmin(admin.ModelAdmin):
    list_display = ('nom', 'prenom', 'nationalite')
    search_fields = ('nom', 'prenom')
@admin.register(Editeur)
class EditeurAdmin(admin.ModelAdmin):
    list_display = ('nom', 'telephone', 'email')
    search_fields = ('nom',)
@admin.register(Ressource)
class RessourceAdmin(admin.ModelAdmin):
    list_display = ('numero', 'titre', 'type_ressource', 'categorie', 'retiree')
    list_filter = ('type_ressource', 'retiree', 'categorie')
    search_fields = ('numero', 'titre', 'isbn_issn')
    filter_horizontal = ('auteurs',)
@admin.register(Localisation)
class LocalisationAdmin(admin.ModelAdmin):
    list_display = ('salle', 'rayon', 'etagere')
@admin.register(Exemplaire)
class ExemplaireAdmin(admin.ModelAdmin):
    list_display = ('numero', 'ressource', 'localisation', 'etat', 'statut')
    list_filter = ('statut', 'etat')
    search_fields = ('numero', 'ressource__titre')
@admin.register(Adherent)
class AdherentAdmin(admin.ModelAdmin):
    list_display = ('numero', 'personne', 'type_adherent', 'statut')
    list_filter = ('statut',)
    search_fields = ('numero', 'etudiant__nom', 'personnel__nom')
@admin.register(RegleBibliotheque)
class RegleBibliothequeAdmin(admin.ModelAdmin):
    list_display = ('type_adherent', 'nb_emprunts_max', 'duree_emprunt_jours', 'penalite_par_jour_retard')
@admin.register(Emprunt)
class EmpruntAdmin(admin.ModelAdmin):
    list_display = ('numero', 'adherent', 'exemplaire', 'date_emprunt', 'date_retour_prevue', 'statut')
    list_filter = ('statut',)
    search_fields = ('numero', 'exemplaire__numero')
@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('numero', 'adherent', 'ressource', 'statut', 'date_reservation')
    list_filter = ('statut',)
@admin.register(Penalite)
class PenaliteAdmin(admin.ModelAdmin):
    list_display = ('emprunt', 'type_penalite', 'montant', 'payee')
    list_filter = ('type_penalite', 'payee')
@admin.register(Inventaire)
class InventaireAdmin(admin.ModelAdmin):
    list_display = ('date_inventaire', 'responsable', 'zone_concernee', 'statut')
    list_filter = ('statut',)
@admin.register(LigneInventaire)
class LigneInventaireAdmin(admin.ModelAdmin):
    list_display = ('inventaire', 'exemplaire', 'statut_constate')
    list_filter = ('statut_constate',)
@admin.register(Fournisseur)
class FournisseurAdmin(admin.ModelAdmin):
    list_display = ('nom', 'telephone', 'email')
    search_fields = ('nom',)
@admin.register(Acquisition)
class AcquisitionAdmin(admin.ModelAdmin):
    list_display = ('numero', 'fournisseur', 'date_acquisition', 'montant', 'statut')
    list_filter = ('statut',)
@admin.register(LigneAcquisition)
class LigneAcquisitionAdmin(admin.ModelAdmin):
    list_display = ('acquisition', 'ressource', 'quantite', 'prix_unitaire')