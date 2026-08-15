from django.contrib import admin
from .models import Categorie, Livre, Exemplaire, Emprunt, Reservation, Penalite
@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    list_display = ('nom',)
    search_fields = ('nom',)
@admin.register(Livre)
class LivreAdmin(admin.ModelAdmin):
    list_display = ('titre', 'auteur', 'categorie', 'nb_exemplaires_total', 'nb_exemplaires_disponibles')
    list_filter = ('categorie',)
    search_fields = ('titre', 'auteur', 'isbn')
@admin.register(Exemplaire)
class ExemplaireAdmin(admin.ModelAdmin):
    list_display = ('code_exemplaire', 'livre', 'etat', 'statut')
    list_filter = ('etat', 'statut')
    search_fields = ('code_exemplaire', 'livre__titre')
@admin.register(Emprunt)
class EmpruntAdmin(admin.ModelAdmin):
    list_display = ('exemplaire', 'emprunteur', 'date_emprunt', 'date_retour_prevue', 'statut')
    list_filter = ('statut',)
    search_fields = ('exemplaire__livre__titre', 'etudiant__nom', 'personnel__nom')
@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('livre', 'date_reservation', 'statut')
    list_filter = ('statut',)
@admin.register(Penalite)
class PenaliteAdmin(admin.ModelAdmin):
    list_display = ('emprunt', 'montant', 'jours_retard', 'payee', 'frais_inscription')
    list_filter = ('payee',)